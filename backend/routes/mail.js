// backend/routes/mail.js
//
// Mail CRUD endpoints. All responses are camelCase for frontend ergonomics
// (DB columns stay snake_case). All routes require authentication except
// where noted.
//
// Routes:
//   GET    /api/mail             list emails for current user (paginated)
//   GET    /api/mail/counts      folder counts for sidebar
//   GET    /api/mail/:id         fetch single email (also marks read)
//   POST   /api/mail             compose & send (runs both AI models)
//   PATCH  /api/mail/:id         update is_read / is_starred / folder
//   DELETE /api/mail/:id         delete (or move to Trash; see below)

const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

const ML_SERVICE = process.env.ML_SERVICE_URL || "http://localhost:8000";

// Folders the user is allowed to move emails into
const VALID_FOLDERS = new Set([
  "Inbox",
  "Sent",
  "Drafts",
  "Starred",
  "Spam",
  "Trash",
  "Archive",
]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** DB row → camelCase object for the API response. */
function rowToEmail(row) {
  return {
    id: row.id,
    from: row.sender,
    subject: row.subject,
    snippet: row.snippet,
    body: row.body,
    folder: row.folder,
    unread: row.is_read === 0 || row.is_read === false,
    starred: row.is_starred === 1 || row.is_starred === true,
    aiVerdict: row.ai_verdict,
    aiConfidence: row.ai_confidence,
    aiCategory: row.ai_category,
    aiCategoryConfidence: row.ai_category_confidence,
    receivedAt: row.received_at,
  };
}

/** Auto-snippet from body if the caller didn't provide one. */
function makeSnippet(body, max = 140) {
  if (!body) return "";
  const flat = String(body).replace(/\s+/g, " ").trim();
  return flat.length > max ? flat.slice(0, max - 1) + "…" : flat;
}

/**
 * Call the ML microservice for both phishing + category.
 * Failures are non-fatal — if the ML service is down, the email still gets
 * sent, just without AI annotations. Returns {} on total failure.
 */
async function runAiScans({ subject, body, sender }) {
  const fetch = (await import("node-fetch")).default;
  const out = {};

  try {
    const r = await fetch(`${ML_SERVICE}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body, sender }),
    });
    if (r.ok) {
      const d = await r.json();
      out.ai_verdict = d.verdict;
      out.ai_confidence = d.confidence;
    }
  } catch (e) {
    console.warn("phishing scan failed:", e.message);
  }

  try {
    const r = await fetch(`${ML_SERVICE}/predict_category`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body, sender }),
    });
    if (r.ok) {
      const d = await r.json();
      out.ai_category = d.category;
      out.ai_category_confidence = d.confidence;
    }
  } catch (e) {
    console.warn("category scan failed:", e.message);
  }

  return out;
}

// ---------------------------------------------------------------------------
// GET /api/mail — list emails (paginated)
// Query params: folder, page, limit, search
// ---------------------------------------------------------------------------
router.get("/", authMiddleware, async (req, res) => {
  let { folder = "Inbox", page = 1, limit = 25, search = "", category = "" } = req.query;
  page = Math.max(1, parseInt(page, 10) || 1);
  limit = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
  const offset = (page - 1) * limit;

  try {
    let where = "user_id = ?";
    const params = [req.user.userId];

    if (folder && folder !== "All") {
      where += " AND folder = ?";
      params.push(folder);
    }
    if (category && category.trim() && category !== "All") {
      where += " AND ai_category = ?";
      params.push(category.trim());
    }
    if (search && search.trim()) {
      where += " AND (subject LIKE ? OR sender LIKE ? OR snippet LIKE ?)";
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    const [rows] = await db.query(
      `SELECT id, sender, subject, snippet, body, folder,
              is_read, is_starred,
              ai_verdict, ai_confidence,
              ai_category, ai_category_confidence,
              received_at
       FROM emails
       WHERE ${where}
       ORDER BY received_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM emails WHERE ${where}`,
      params
    );

    res.json({
      emails: rows.map(rowToEmail),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    console.error("list mail error:", err);
    res.status(500).json({ error: "Failed to fetch emails" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/mail/counts — folder counts for sidebar
// ---------------------------------------------------------------------------
router.get("/counts", authMiddleware, async (req, res) => {
  const folderForCategories = req.query.folder || "Inbox";

  try {
    const [rows] = await db.query(
      `SELECT folder,
              COUNT(*) AS total,
              SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) AS unread
       FROM emails
       WHERE user_id = ?
       GROUP BY folder`,
      [req.user.userId]
    );

    // Also include a Starred pseudo-folder (counts emails with is_starred=1)
    const [[starredRow]] = await db.query(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) AS unread
       FROM emails
       WHERE user_id = ? AND is_starred = 1`,
      [req.user.userId]
    );

    // Category counts within the active folder (for the inbox tabs)
    const [catRows] = await db.query(
      `SELECT ai_category AS category, COUNT(*) AS total
       FROM emails
       WHERE user_id = ? AND folder = ?
       GROUP BY ai_category`,
      [req.user.userId, folderForCategories]
    );

    const counts = {};
    rows.forEach((r) => {
      counts[r.folder] = { total: Number(r.total), unread: Number(r.unread) };
    });
    counts.Starred = {
      total: Number(starredRow.total) || 0,
      unread: Number(starredRow.unread) || 0,
    };

    const categoryCounts = { All: 0 };
    catRows.forEach((r) => {
      const t = Number(r.total);
      categoryCounts.All += t;
      if (r.category) categoryCounts[r.category] = t;
    });

    res.json({ counts, categoryCounts });
  } catch (err) {
    console.error("counts error:", err);
    res.status(500).json({ error: "Failed to fetch counts" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/mail/:id — fetch single email + mark as read
// ---------------------------------------------------------------------------
router.get("/:id", authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: "Invalid id" });

  try {
    const [rows] = await db.query(
      `SELECT * FROM emails WHERE id = ? AND user_id = ?`,
      [id, req.user.userId]
    );
    if (!rows.length) return res.status(404).json({ error: "Not found" });

    // Mark as read (fire and forget — we already have the row)
    if (rows[0].is_read === 0) {
      db.query(
        `UPDATE emails SET is_read = 1 WHERE id = ? AND user_id = ?`,
        [id, req.user.userId]
      ).catch(() => { /* best-effort */ });
      rows[0].is_read = 1;
    }

    res.json({ email: rowToEmail(rows[0]) });
  } catch (err) {
    console.error("get mail error:", err);
    res.status(500).json({ error: "Failed to fetch email" });
  }
});

// ---------------------------------------------------------------------------
// POST /api/mail — compose & send
// Body: { to, subject, body }
// Stores the message in the sender's "Sent" folder. If the recipient is also
// a registered user on this platform, drops a copy into THEIR Inbox too.
// Both copies get AI scanned.
// ---------------------------------------------------------------------------
router.post("/", authMiddleware, async (req, res) => {
  const { to, subject = "", body = "" } = req.body || {};

  if (!to || !String(to).trim()) {
    return res.status(400).json({ error: "Recipient (to) is required." });
  }
  if (!subject.trim() && !body.trim()) {
    return res
      .status(400)
      .json({ error: "Email needs a subject or body." });
  }

  const senderEmail = req.user.email;
  const recipient = String(to).toLowerCase().trim();
  const snippet = makeSnippet(body);

  try {
    // Get AI verdicts ONCE — same content for both copies
    const ai = await runAiScans({ subject, body, sender: senderEmail });

    // 1. Always store in sender's Sent folder
    const [sentResult] = await db.query(
      `INSERT INTO emails
         (user_id, sender, subject, snippet, body, folder,
          is_read, is_starred,
          ai_verdict, ai_confidence,
          ai_category, ai_category_confidence)
       VALUES (?, ?, ?, ?, ?, 'Sent', 1, 0, ?, ?, ?, ?)`,
      [
        req.user.userId,
        recipient, // for the sender's "Sent" view, the visible address is the recipient
        subject,
        snippet,
        body,
        ai.ai_verdict || null,
        ai.ai_confidence || null,
        ai.ai_category || null,
        ai.ai_category_confidence || null,
      ]
    );

    // 2. If the recipient exists in our users table, deliver a copy to their Inbox
    let deliveredTo = null;
    const [recipientRows] = await db.query(
      `SELECT id FROM users WHERE email = ? LIMIT 1`,
      [recipient]
    );
    if (recipientRows.length) {
      deliveredTo = recipientRows[0].id;
      await db.query(
        `INSERT INTO emails
           (user_id, sender, subject, snippet, body, folder,
            is_read, is_starred,
            ai_verdict, ai_confidence,
            ai_category, ai_category_confidence)
         VALUES (?, ?, ?, ?, ?, 'Inbox', 0, 0, ?, ?, ?, ?)`,
        [
          deliveredTo,
          senderEmail,
          subject,
          snippet,
          body,
          ai.ai_verdict || null,
          ai.ai_confidence || null,
          ai.ai_category || null,
          ai.ai_category_confidence || null,
        ]
      );
    }

    res.status(201).json({
      sentId: sentResult.insertId,
      deliveredInternally: !!deliveredTo,
      ai: {
        verdict: ai.ai_verdict || null,
        confidence: ai.ai_confidence || null,
        category: ai.ai_category || null,
        categoryConfidence: ai.ai_category_confidence || null,
      },
    });
  } catch (err) {
    console.error("send mail error:", err);
    res.status(500).json({ error: "Failed to send email." });
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/mail/:id — partial update
// Body can contain any of: { isRead, isStarred, folder }
// ---------------------------------------------------------------------------
router.patch("/:id", authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: "Invalid id" });

  const { isRead, isStarred, folder } = req.body || {};
  const updates = [];
  const params = [];

  if (typeof isRead === "boolean") {
    updates.push("is_read = ?");
    params.push(isRead ? 1 : 0);
  }
  if (typeof isStarred === "boolean") {
    updates.push("is_starred = ?");
    params.push(isStarred ? 1 : 0);
  }
  if (typeof folder === "string") {
    if (!VALID_FOLDERS.has(folder)) {
      return res
        .status(400)
        .json({ error: `Invalid folder. Allowed: ${[...VALID_FOLDERS].join(", ")}` });
    }
    updates.push("folder = ?");
    params.push(folder);
  }

  if (!updates.length) {
    return res.status(400).json({ error: "No valid fields to update." });
  }

  try {
    params.push(id, req.user.userId);
    const [result] = await db.query(
      `UPDATE emails SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`,
      params
    );
    if (!result.affectedRows) {
      return res.status(404).json({ error: "Email not found." });
    }

    // Return the fresh row so the frontend can update its state
    const [rows] = await db.query(
      `SELECT * FROM emails WHERE id = ? AND user_id = ?`,
      [id, req.user.userId]
    );
    res.json({ email: rowToEmail(rows[0]) });
  } catch (err) {
    console.error("patch mail error:", err);
    res.status(500).json({ error: "Failed to update email." });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/mail/:id
// Default: move to Trash. Pass ?permanent=1 to actually delete.
// ---------------------------------------------------------------------------
router.delete("/:id", authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: "Invalid id" });

  const permanent = req.query.permanent === "1" || req.query.permanent === "true";

  try {
    if (permanent) {
      const [r] = await db.query(
        `DELETE FROM emails WHERE id = ? AND user_id = ?`,
        [id, req.user.userId]
      );
      if (!r.affectedRows) return res.status(404).json({ error: "Not found" });
      return res.json({ deleted: true, permanent: true });
    }

    // Soft delete: move to Trash (unless already in Trash, then hard delete)
    const [rows] = await db.query(
      `SELECT folder FROM emails WHERE id = ? AND user_id = ?`,
      [id, req.user.userId]
    );
    if (!rows.length) return res.status(404).json({ error: "Not found" });

    if (rows[0].folder === "Trash") {
      await db.query(
        `DELETE FROM emails WHERE id = ? AND user_id = ?`,
        [id, req.user.userId]
      );
      return res.json({ deleted: true, permanent: true });
    }

    await db.query(
      `UPDATE emails SET folder = 'Trash' WHERE id = ? AND user_id = ?`,
      [id, req.user.userId]
    );
    res.json({ deleted: true, permanent: false, folder: "Trash" });
  } catch (err) {
    console.error("delete mail error:", err);
    res.status(500).json({ error: "Failed to delete email." });
  }
});

module.exports = router;

const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  const { folder = "Inbox", page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  try {
    const [rows] = await db.query(
      `SELECT id, sender, subject, snippet, folder, is_read, is_starred,
              ai_verdict, ai_confidence, received_at
       FROM emails
       WHERE user_id = ? AND folder = ?
       ORDER BY received_at DESC
       LIMIT ? OFFSET ?`,
      [req.user.userId, folder, Number(limit), Number(offset)]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch emails" });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM emails WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.userId]
    );
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    await db.query("UPDATE emails SET is_read = 1 WHERE id = ?", [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch email" });
  }
});

module.exports = router;

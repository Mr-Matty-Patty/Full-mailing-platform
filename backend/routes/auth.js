const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const JWT_SECRET = process.env.JWT_SECRET || "changeme";

function signToken(user, longLived = false) {
  return jwt.sign(
    { userId: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: longLived ? "30d" : "7d" }
  );
}

router.post("/register", async (req, res) => {
  const { name, email, phone, password } = req.body || {};

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Name, email, and password are required." });
  }
  if (name.trim().length < 2) {
    return res.status(400).json({ error: "Name must be at least 2 characters." });
  }
  if (!EMAIL_RE.test(email)) {
    return res
      .status(400)
      .json({ error: "Please enter a valid email address." });
  }
  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters." });
  }
  if (phone && phone.trim().length > 20) {
    return res.status(400).json({ error: "Phone number is too long." });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)",
      [name.trim(), email.toLowerCase().trim(), phone?.trim() || null, hashed]
    );
    const user = {
      id: result.insertId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
    };
    const token = signToken(user);
    return res.status(201).json({ token, user });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ error: "An account with that email already exists." });
    }
    console.error("register error:", err);
    return res
      .status(500)
      .json({ error: "Registration failed. Please try again." });
  }
});

router.post("/login", async (req, res) => {
  const { email, password, keep_signed_in } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const [rows] = await db.query(
      "SELECT id, name, email, password_hash FROM users WHERE email = ?",
      [email.toLowerCase().trim()]
    );
    if (!rows.length) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    const token = signToken(user, !!keep_signed_in);
    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// GET /api/auth/me — used by frontend on page reload to verify the stored token
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, phone, created_at FROM users WHERE id = ?",
      [req.user.userId]
    );
    if (!rows.length) return res.status(404).json({ error: "User not found." });
    return res.json({ user: rows[0] });
  } catch (err) {
    console.error("me error:", err);
    return res.status(500).json({ error: "Failed to fetch user." });
  }
});

module.exports = router;

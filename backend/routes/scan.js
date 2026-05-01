const express = require("express");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
const ML_SERVICE = process.env.ML_SERVICE_URL || "http://localhost:8000";

router.post("/", authMiddleware, async (req, res) => {
  const { subject = "", body = "", sender = "" } = req.body;
  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${ML_SERVICE}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body, sender }),
    });
    if (!response.ok) throw new Error("ML service error");
    const result = await response.json();
    res.json(result);
  } catch (err) {
    res.status(502).json({ error: "Could not reach ML service" });
  }
});

module.exports = router;

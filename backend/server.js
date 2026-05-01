const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const mailRoutes = require("./routes/mail");
const scanRoutes = require("./routes/scan");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/mail", mailRoutes);
app.use("/api/scan", scanRoutes);

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => console.log(`✅ Express backend running on port ${PORT}`));

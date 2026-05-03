// backend/db.js
//
// Database pool. Works with both local MariaDB (no SSL) and Azure MySQL
// Flexible Server (SSL enforced). Set DB_SSL=true in the App Service config
// to enable SSL when deployed.

const mysql = require("mysql2/promise");

const config = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "mailapp",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // mysql2 driver also supports `enableKeepAlive` to help long-lived
  // connections survive Azure's idle-connection timeouts.
  enableKeepAlive: true,
  keepAliveInitialDelay: 30000,
};

// Azure MySQL Flexible Server enforces SSL/TLS 1.2.
// When DB_SSL is "true" we enable it. We use rejectUnauthorized=false to skip
// CA validation — fine for a class project, would use proper CA bundle in prod.
if (process.env.DB_SSL === "true") {
  config.ssl = { rejectUnauthorized: false };
}

const db = mysql.createPool(config);

// Quick ping on startup so we fail loud if creds are wrong.
db.getConnection()
  .then((conn) => {
    console.log(`✅ DB connected: ${config.host}:${config.port}/${config.database}`);
    conn.release();
  })
  .catch((err) => {
    console.error(`❌ DB connection failed: ${err.message}`);
  });

module.exports = db;

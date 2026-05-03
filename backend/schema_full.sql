-- schema_full.sql
-- One-shot schema for a fresh Azure MySQL database.
-- Run this AFTER you've created the `mailapp` database in Azure.
--
-- How to run from your laptop (after Azure provisioning finishes):
--   mysql -h demetri-mahdi-db.mysql.database.azure.com \
--         -u mailapp_admin -p \
--         --ssl-mode=REQUIRED \
--         mailapp < schema_full.sql

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20) NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS emails (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  sender VARCHAR(255),
  subject VARCHAR(500),
  snippet TEXT,
  body LONGTEXT,
  folder VARCHAR(50) DEFAULT 'Inbox',
  is_read TINYINT(1) DEFAULT 0,
  is_starred TINYINT(1) DEFAULT 0,
  ai_verdict VARCHAR(20),                  -- 'Phishing' or 'Legitimate'
  ai_confidence FLOAT,                     -- 0-100
  ai_category VARCHAR(30),                 -- 'Personal' / 'Promotional' / 'Notification'
  ai_category_confidence FLOAT,            -- 0-100
  received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_emails_user_folder ON emails(user_id, folder);
CREATE INDEX idx_emails_user_category ON emails(user_id, ai_category);

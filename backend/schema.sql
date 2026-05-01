-- Run this once to set up the database
CREATE DATABASE IF NOT EXISTS mailapp;
USE mailapp;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
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
  ai_verdict VARCHAR(20),       -- 'Phishing' or 'Legitimate'
  ai_confidence FLOAT,          -- 0-100
  received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_emails_user_folder ON emails(user_id, folder);

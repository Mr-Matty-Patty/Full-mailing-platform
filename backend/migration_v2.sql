-- migration_v2.sql
-- Run this AFTER migration.sql (which added the phone column).
-- Safe to run on a fresh DB or an existing one.

USE mailapp;

-- AI category prediction columns (from the AutoML / Azure ML model)
ALTER TABLE emails ADD COLUMN IF NOT EXISTS ai_category VARCHAR(30) NULL AFTER ai_confidence;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS ai_category_confidence FLOAT NULL AFTER ai_category;

-- Index for fast filtering by category in the inbox
CREATE INDEX IF NOT EXISTS idx_emails_user_category ON emails(user_id, ai_category);

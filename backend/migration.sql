-- Run this if you ALREADY have a `mailapp` database.
-- Adds the new `phone` column to users without losing existing data.
-- Safe to run on a fresh DB too — it just no-ops if the column exists.

USE mailapp;

-- Try to add the column; if it's already there, MariaDB throws an error we can ignore.
-- (MariaDB has IF NOT EXISTS in newer versions.)
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20) NULL AFTER email;

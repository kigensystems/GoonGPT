-- Remove daily limit columns from users table
-- Run this in your Supabase SQL Editor

ALTER TABLE users 
DROP COLUMN IF EXISTS daily_tokens_earned,
DROP COLUMN IF EXISTS last_token_earn_date;
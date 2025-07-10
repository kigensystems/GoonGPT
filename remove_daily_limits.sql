-- Migration: Remove daily limit functionality from users table
-- Run this in your Supabase SQL Editor to complete the Supabase migration

-- Remove daily limit columns from users table
ALTER TABLE users 
DROP COLUMN IF EXISTS daily_tokens_earned,
DROP COLUMN IF EXISTS last_token_earn_date;

-- Verify the updated table structure
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'users' 
-- ORDER BY ordinal_position;
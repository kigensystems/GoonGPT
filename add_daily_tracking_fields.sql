-- Add daily token tracking fields to users table
ALTER TABLE users 
ADD COLUMN daily_tokens_earned INTEGER DEFAULT 0,
ADD COLUMN last_earn_date TIMESTAMP WITH TIME ZONE;

-- Add comment for clarity
COMMENT ON COLUMN users.daily_tokens_earned IS 'Tokens earned today (resets daily)';
COMMENT ON COLUMN users.last_earn_date IS 'Last time user earned tokens (for daily reset logic)';
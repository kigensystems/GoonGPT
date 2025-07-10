-- Create video_status table for ModelsLab video generation tracking
-- Run this in your Supabase SQL Editor

CREATE TABLE video_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing',
  video_url TEXT,
  all_outputs JSONB,
  error_message TEXT,
  eta INTEGER,
  meta JSONB,
  webhook_received BOOLEAN DEFAULT false,
  fetch_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_video_status_track_id ON video_status(track_id);
CREATE INDEX idx_video_status_status ON video_status(status);
CREATE INDEX idx_video_status_created_at ON video_status(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE video_status ENABLE ROW LEVEL SECURITY;

-- Add automatic updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_video_status_updated_at 
    BEFORE UPDATE ON video_status 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
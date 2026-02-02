-- Migration: Add meeting_type and meeting_status to leads table
-- Execute this SQL directly in your Supabase SQL Editor

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS meeting_type TEXT,
ADD COLUMN IF NOT EXISTS meeting_status TEXT;

-- Optional: Add comments for documentation
COMMENT ON COLUMN leads.meeting_type IS 'Type of meeting: CONFIRMATION, FOLLOW_UP, or SCHEDULED';
COMMENT ON COLUMN leads.meeting_status IS 'Status of meeting: PENDING or CONFIRMED';

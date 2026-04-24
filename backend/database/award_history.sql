-- SQL for creating the archive table for People's Choice Awards
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS award_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Enable RLS (Optional but recommended)
ALTER TABLE award_history ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to insert/select (adjust as needed)
CREATE POLICY "Allow authenticated insert" ON award_history FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated select" ON award_history FOR SELECT USING (auth.role() = 'authenticated');

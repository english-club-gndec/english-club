-- Add custom_answers column to participants table for storing responses to custom event form questions
ALTER TABLE participants ADD COLUMN IF NOT EXISTS custom_answers JSONB DEFAULT '{}';

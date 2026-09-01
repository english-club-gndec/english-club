-- Migration to add form_questions JSONB column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS form_questions JSONB DEFAULT '[]'::jsonb;

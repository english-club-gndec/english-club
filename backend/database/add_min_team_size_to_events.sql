-- Add min_team_size column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS min_team_size INT;

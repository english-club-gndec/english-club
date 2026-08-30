-- SQL script to create participating_teams table
CREATE TABLE IF NOT EXISTS participating_teams (
    team_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_name VARCHAR NOT NULL,
    event_id BIGINT NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Migration statement for existing table
ALTER TABLE participating_teams ADD COLUMN IF NOT EXISTS event_id BIGINT REFERENCES events(event_id) ON DELETE CASCADE;

-- Trigger to automatically update updated_at for participating_teams
DROP TRIGGER IF EXISTS update_participating_teams_updated_at ON participating_teams;
CREATE TRIGGER update_participating_teams_updated_at
    BEFORE UPDATE ON participating_teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();





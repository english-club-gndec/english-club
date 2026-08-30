-- Participants Table SQL
CREATE TABLE participants (
    participant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_name VARCHAR NOT NULL,
    participant_class VARCHAR NOT NULL,
    participant_crn BIGINT,
    participant_urn BIGINT,
    participant_email TEXT NOT NULL,
    participant_phone_no VARCHAR,
    registered_event BIGINT NOT NULL REFERENCES events(event_id),
    team_id UUID REFERENCES participating_teams(team_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Migration statements for existing tables
ALTER TABLE participants ALTER COLUMN participant_crn DROP NOT NULL;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS participant_phone_no VARCHAR;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES participating_teams(team_id) ON DELETE SET NULL;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_participants_updated_at ON participants;
CREATE TRIGGER update_participants_updated_at
    BEFORE UPDATE ON participants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();



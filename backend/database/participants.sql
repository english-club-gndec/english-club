-- Participants Table SQL
CREATE TABLE participants (
    participant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_name VARCHAR NOT NULL,
    participant_class VARCHAR NOT NULL,
    participant_crn BIGINT NOT NULL,
    participant_urn BIGINT,
    participant_email TEXT NOT NULL,
    registered_event BIGINT NOT NULL REFERENCES events(event_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Trigger to automatically update updated_at
CREATE TRIGGER update_participants_updated_at
    BEFORE UPDATE ON participants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

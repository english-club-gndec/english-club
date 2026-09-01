-- Create custom ENUM type for event_type if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_type') THEN
        CREATE TYPE event_type AS ENUM (
            'INDIVIDUAL', 
            'TEAM'
        );
    END IF;
END $$;

-- Events Table SQL
CREATE TABLE events (
    event_id BIGSERIAL PRIMARY KEY,
    event_name VARCHAR NOT NULL,
    event_short_description VARCHAR NOT NULL,
    event_long_description TEXT,
    event_venue VARCHAR,
    event_date DATE,
    event_time TIME,
    event_poster_key TEXT,
    event_type event_type NOT NULL DEFAULT 'INDIVIDUAL',
    min_team_size INT,
    max_team_size INT,
    whatsapp_group_link TEXT,
    created_by BIGINT NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Migration statement for existing events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_type event_type DEFAULT 'INDIVIDUAL';
ALTER TABLE events ADD COLUMN IF NOT EXISTS min_team_size INT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS max_team_size INT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS whatsapp_group_link TEXT;


-- Trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


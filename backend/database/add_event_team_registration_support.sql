-- Event registration / team support migration
-- Run this against an existing database if event_type, max_team_size, or team-related fields are missing.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_type') THEN
    CREATE TYPE event_type AS ENUM ('INDIVIDUAL', 'TEAM');
  END IF;
END $$;

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS event_type event_type NOT NULL DEFAULT 'INDIVIDUAL',
  ADD COLUMN IF NOT EXISTS max_team_size INT;

ALTER TABLE events
  ALTER COLUMN event_type SET DEFAULT 'INDIVIDUAL';

ALTER TABLE participants
  ALTER COLUMN participant_urn DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS participant_phone_no VARCHAR,
  ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES participating_teams(team_id) ON DELETE SET NULL;

ALTER TABLE participating_teams
  ADD COLUMN IF NOT EXISTS event_id BIGINT REFERENCES events(event_id) ON DELETE CASCADE;

-- Optional safety check to ensure team sizes are only configured for team events.
CREATE OR REPLACE FUNCTION validate_team_event_registration()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM events e
    WHERE e.event_id = NEW.registered_event
      AND e.event_type = 'TEAM'
      AND e.max_team_size IS NOT NULL
      AND (
        SELECT COUNT(*)
        FROM participants p
        WHERE p.registered_event = NEW.registered_event
          AND p.team_id = NEW.team_id
      ) + 1 > e.max_team_size
  ) THEN
    RAISE EXCEPTION 'Team size exceeds max_team_size for this event';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_team_size_limit ON participants;
CREATE TRIGGER enforce_team_size_limit
BEFORE INSERT OR UPDATE ON participants
FOR EACH ROW
EXECUTE FUNCTION validate_team_event_registration();

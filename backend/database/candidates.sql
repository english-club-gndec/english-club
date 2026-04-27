-- Create custom ENUM types if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'interested_department') THEN
        CREATE TYPE interested_department AS ENUM (
            'TECHNICAL', 
            'CREATIVE', 
            'PROMOTION', 
            'EVENT_MANAGEMENT', 
            'DISICIPLINE', 
            'PHOTOGRAPHY', 
            'DATABASE'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'candidate_status') THEN
        CREATE TYPE candidate_status AS ENUM (
            'PENDING', 
            'SELECTED', 
            'REJECTED'
        );
    END IF;
END $$;

-- Create the candidates table
CREATE TABLE IF NOT EXISTS candidates (
    candidate_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_name VARCHAR NOT NULL,
    candidate_class VARCHAR NOT NULL,
    candidate_crn BIGINT NOT NULL,
    candidate_urn BIGINT,
    candidate_email TEXT NOT NULL,
    interested_department interested_department NOT NULL,
    candidate_status candidate_status NOT NULL DEFAULT 'PENDING',
    status_updated_by BIGINT REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Trigger to update updated_at on change
CREATE OR REPLACE FUNCTION update_candidates_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_candidates_updated_at ON candidates;
CREATE TRIGGER update_candidates_updated_at
    BEFORE UPDATE ON candidates
    FOR EACH ROW
    EXECUTE FUNCTION update_candidates_updated_at_column();

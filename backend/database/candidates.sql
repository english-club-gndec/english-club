-- Create custom ENUM types if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'interested_department') THEN
        CREATE TYPE interested_department AS ENUM (
            'TECHNICAL', 
            'EVENT_MANAGEMENT', 
            'FINANCE_&_MARKET_RELATIONS', 
            'CREATIVE_&_PHOTOGRAPHY', 
            'PROMOTION', 
            'ANCHORING'
        );
    END IF;
    ALTER TYPE interested_department ADD VALUE IF NOT EXISTS 'TECHNICAL';
    ALTER TYPE interested_department ADD VALUE IF NOT EXISTS 'EVENT_MANAGEMENT';
    ALTER TYPE interested_department ADD VALUE IF NOT EXISTS 'FINANCE_&_MARKET_RELATIONS';
    ALTER TYPE interested_department ADD VALUE IF NOT EXISTS 'CREATIVE_&_PHOTOGRAPHY';
    ALTER TYPE interested_department ADD VALUE IF NOT EXISTS 'PROMOTION';
    ALTER TYPE interested_department ADD VALUE IF NOT EXISTS 'ANCHORING';

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
    candidate_description TEXT,
    candidate_why_eligible TEXT,
    custom_answers JSONB DEFAULT '{}'::jsonb,
    candidate_status candidate_status NOT NULL DEFAULT 'PENDING',
    candidate_comment VARCHAR,
    status_updated_by BIGINT REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE candidates ADD COLUMN IF NOT EXISTS custom_answers JSONB DEFAULT '{}'::jsonb;

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

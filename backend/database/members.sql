-- Create custom ENUM types
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'member_position') THEN
        CREATE TYPE member_position AS ENUM (
            'CONVENOR', 
            'CO-CONVENOR', 
            'TECHNICAL_HEAD', 
            'CO-TECHNICAL_HEAD', 
            'EVENT_MANAGEMENT_HEAD',
            'CO-EVENT_MANAGEMENT_HEAD',
            'FINANCE_&_MARKET_RELATIONS_HEAD',
            'CO-FINANCE_&_MARKET_RELATIONS_HEAD',
            'CREATIVE_&_PHOTOGRAPHY_HEAD',
            'CO-CREATIVE_&_PHOTOGRAPHY_HEAD',
            'PROMOTION_HEAD',
            'CO-PROMOTION_HEAD',
            'ANCHORING_HEAD',
            'CO-ANCHORING_HEAD',
            'EXECUTIVE_MEMBER', 
            'ACTIVE_MEMBER'
        );
    END IF;

    ALTER TYPE member_position ADD VALUE IF NOT EXISTS 'TECHNICAL_HEAD';
    ALTER TYPE member_position ADD VALUE IF NOT EXISTS 'CO-TECHNICAL_HEAD';
    ALTER TYPE member_position ADD VALUE IF NOT EXISTS 'EVENT_MANAGEMENT_HEAD';
    ALTER TYPE member_position ADD VALUE IF NOT EXISTS 'CO-EVENT_MANAGEMENT_HEAD';
    ALTER TYPE member_position ADD VALUE IF NOT EXISTS 'FINANCE_&_MARKET_RELATIONS_HEAD';
    ALTER TYPE member_position ADD VALUE IF NOT EXISTS 'CO-FINANCE_&_MARKET_RELATIONS_HEAD';
    ALTER TYPE member_position ADD VALUE IF NOT EXISTS 'CREATIVE_&_PHOTOGRAPHY_HEAD';
    ALTER TYPE member_position ADD VALUE IF NOT EXISTS 'CO-CREATIVE_&_PHOTOGRAPHY_HEAD';
    ALTER TYPE member_position ADD VALUE IF NOT EXISTS 'PROMOTION_HEAD';
    ALTER TYPE member_position ADD VALUE IF NOT EXISTS 'CO-PROMOTION_HEAD';
    ALTER TYPE member_position ADD VALUE IF NOT EXISTS 'ANCHORING_HEAD';
    ALTER TYPE member_position ADD VALUE IF NOT EXISTS 'CO-ANCHORING_HEAD';

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'department_type') THEN
        CREATE TYPE department_type AS ENUM (
            'IT', 
            'CSE', 
            'RAI',
            'ECE', 
            'CE', 
            'EE',
            'ME', 
            'BBA', 
            'BCA'
        );
    END IF;
END $$;

-- Create the members table
CREATE TABLE IF NOT EXISTS members (
    member_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_name VARCHAR NOT NULL,
    member_postion member_position NOT NULL,
    member_profile_picture_key VARCHAR,
    member_crn BIGINT,
    member_urn BIGINT NOT NULL,
    member_email TEXT NOT NULL,
    member_department department_type NOT NULL,
    member_semester INTEGER NOT NULL CHECK (member_semester >= 0 AND member_semester <= 8),
    member_club_department VARCHAR,
    socials JSONB DEFAULT '{}'::jsonb,
    created_by BIGINT REFERENCES users(user_id) ON DELETE SET NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Trigger to update updated_at on change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_members_updated_at
    BEFORE UPDATE ON members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Storage cleanup is handled by the backend Node controller (memberController.js) using the Supabase Storage API,
-- because Supabase forbids direct SQL DELETE statements on the storage.objects table.

-- Function to increment semesters automatically
-- This should be called by a cron job or scheduled task twice a year:
-- 1. Mid-June (around June 15-30)
-- 2. Start of January (around Jan 1-15)
CREATE OR REPLACE FUNCTION increment_member_semesters()
RETURNS VOID AS $$
BEGIN
    UPDATE members
    SET member_semester = CASE 
        WHEN member_semester >= 8 THEN 0 
        ELSE member_semester + 1 
    END
    WHERE member_semester > 0;
END;
$$ LANGUAGE plpgsql;

/*
  Note on member_semester logic:
  The user requested that after mid-June and January start, the semester should be automatically increased by +1.
  When 8 is reached, it should be changed to 0 and not increased after that.
  
  To automate this in Supabase:
  1. Go to the Database -> Edge Functions or use a tool like pg_cron if enabled.
  2. Or, run a simple script periodically using GitHub Actions or a local cron job that calls:
     SELECT increment_member_semesters();
*/

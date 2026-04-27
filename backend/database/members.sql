-- Create custom ENUM types
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'member_position') THEN
        CREATE TYPE member_position AS ENUM (
            'CONVENOR', 
            'CO-CONVENOR', 
            'TECH_HEAD', 
            'CO-TECH_HEAD', 
            'CREATIVE_HEAD', 
            'CO-CREATIVE_HEAD', 
            'EXECUTIVE_MEMBER', 
            'ACTIVE_MEMBER'
        );
    END IF;

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
    created_by BIGINT NOT NULL, 
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

-- Function to delete the profile picture from Supabase Storage when a member is deleted
CREATE OR REPLACE FUNCTION delete_member_image_from_storage()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.member_profile_picture_key IS NOT NULL AND OLD.member_profile_picture_key <> '' THEN
        DELETE FROM storage.objects 
        WHERE bucket_id = 'profile_pictures' 
        AND name = OLD.member_profile_picture_key;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to handle storage cleanup on member deletion
DROP TRIGGER IF EXISTS trigger_delete_member_image ON members;
CREATE TRIGGER trigger_delete_member_image
    AFTER DELETE ON members
    FOR EACH ROW
    EXECUTE FUNCTION delete_member_image_from_storage();

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

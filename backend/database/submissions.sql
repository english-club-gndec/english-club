-- Create custom ENUM type if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'submission_status') THEN
        CREATE TYPE submission_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'DELETED');
    END IF;
END $$;

-- Create the submissions table
CREATE TABLE IF NOT EXISTS submissions (
    submission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_name VARCHAR NOT NULL,
    student_class VARCHAR NOT NULL,
    student_urn BIGINT NOT NULL,
    student_crn BIGINT,
    student_email VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    description TEXT NOT NULL,
    body TEXT NOT NULL, -- Raw HTML/Markdown content from rich-text editor
    image_url VARCHAR, -- Cover image URL
    status submission_status NOT NULL DEFAULT 'PENDING',
    rejection_reason TEXT,
    edit_token UUID DEFAULT gen_random_uuid() NOT NULL,
    tags VARCHAR[] DEFAULT '{}'::VARCHAR[],
    reviewed_by BIGINT REFERENCES users(user_id) ON DELETE SET NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Trigger to update updated_at on changes
CREATE OR REPLACE FUNCTION update_submissions_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_submissions_updated_at ON submissions;
CREATE TRIGGER update_submissions_updated_at
    BEFORE UPDATE ON submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_submissions_updated_at_column();

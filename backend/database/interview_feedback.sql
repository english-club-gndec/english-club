-- Interview Feedback Table SQL
CREATE TABLE IF NOT EXISTS interview_feedback (
    feedback_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_name TEXT NOT NULL,
    branch_section TEXT NOT NULL,
    crn TEXT,
    phone_number TEXT NOT NULL,
    email_id TEXT NOT NULL,
    overall_experience TEXT,
    issues_faced TEXT,
    rating_process INT CHECK (rating_process BETWEEN 1 AND 5),
    comfortable_organized TEXT,
    liked_aspects TEXT,
    suggestions TEXT,
    excitement_level INT CHECK (excitement_level BETWEEN 1 AND 5),
    understanding_gained TEXT,
    additional_thoughts TEXT,
    future_interest TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Ensure CRN column is nullable if table already exists
ALTER TABLE interview_feedback ALTER COLUMN crn DROP NOT NULL;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_interview_feedback_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_interview_feedback_updated_at ON interview_feedback;
CREATE TRIGGER update_interview_feedback_updated_at
    BEFORE UPDATE ON interview_feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_interview_feedback_updated_at_column();

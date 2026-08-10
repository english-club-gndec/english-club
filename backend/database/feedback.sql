-- Feedback Table SQL
CREATE TABLE feedback (
    feedback_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id BIGINT NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
    overall_rating INT NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
    organization_rating INT CHECK (organization_rating BETWEEN 1 AND 5),
    content_quality_rating INT CHECK (content_quality_rating BETWEEN 1 AND 5),
    highlights TEXT,
    improvements TEXT,
    additional_comments TEXT,
    would_recommend BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Trigger to automatically update updated_at
CREATE TRIGGER update_feedback_updated_at
    BEFORE UPDATE ON feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

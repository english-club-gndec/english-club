-- Create the recruitment_history table
CREATE TABLE IF NOT EXISTS recruitment_history (
    recruitment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recruitment_date DATE NOT NULL,
    recruitment_participants_history JSONB NOT NULL
);

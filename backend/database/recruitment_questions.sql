-- Create custom ENUM types if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'question_type') THEN
        CREATE TYPE question_type AS ENUM (
            'SHORT_TEXT', 
            'LONG_TEXT', 
            'DROPDOWN', 
            'MULTIPLE_CHOICE', 
            'CHECKBOX'
        );
    END IF;
END $$;

-- Create the recruitment_questions table
CREATE TABLE IF NOT EXISTS recruitment_questions (
    question_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_label TEXT NOT NULL,
    question_type question_type NOT NULL,
    options JSONB DEFAULT '[]'::jsonb,
    placeholder TEXT,
    is_required BOOLEAN DEFAULT true,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Trigger to update updated_at on change
CREATE OR REPLACE FUNCTION update_recruitment_questions_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_recruitment_questions_updated_at ON recruitment_questions;
CREATE TRIGGER update_recruitment_questions_updated_at
    BEFORE UPDATE ON recruitment_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_recruitment_questions_updated_at_column();

-- Seed initial default questions if table is empty
INSERT INTO recruitment_questions (question_id, question_label, question_type, placeholder, is_required, order_index)
SELECT 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Introduce Yourself', 'LONG_TEXT', 'Tell us a little about yourself...', true, 0
WHERE NOT EXISTS (SELECT 1 FROM recruitment_questions WHERE question_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

INSERT INTO recruitment_questions (question_id, question_label, question_type, placeholder, is_required, order_index)
SELECT 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Why do you want to be part of this club and how can you contribute?', 'LONG_TEXT', 'Share your motivation and potential contributions...', true, 1
WHERE NOT EXISTS (SELECT 1 FROM recruitment_questions WHERE question_id = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');

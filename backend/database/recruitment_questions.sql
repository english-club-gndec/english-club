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

-- Seed recruitment questions
INSERT INTO recruitment_questions (question_label, question_type, options, placeholder, is_required, order_index, is_active) VALUES
('Why do you want to join the English Club?', 'LONG_TEXT', '[]'::jsonb, 'Share your motivation for joining...', true, 0, true),
('What do you hope to learn or improve by joining the club?', 'LONG_TEXT', '[]'::jsonb, 'Tell us what skills or knowledge you want to gain...', true, 1, true),
('If you could organize one English Club event, what would it be and why?', 'LONG_TEXT', '[]'::jsonb, 'Describe your event idea and reasons...', true, 2, true),
('Have you worked on any projects or created something related to the skills you selected?', 'DROPDOWN', '["Yes", "No"]'::jsonb, 'Select an option...', true, 3, true),
('If yes, please share a Google Drive link to your work (portfolio, designs, videos, articles, event photos, certificates, etc.).', 'SHORT_TEXT', '[]'::jsonb, 'https://drive.google.com/...', false, 4, true),
('Are you comfortable committing 2–3 hours per week for club activities and meetings?', 'DROPDOWN', '["Yes", "No", "Depends on my schedule"]'::jsonb, 'Select commitment level...', true, 5, true),
('Do you have any previous experience in clubs, event management, public speaking, writing, debating, hosting, or volunteering?', 'LONG_TEXT', '[]'::jsonb, 'Mention any relevant past experiences...', false, 6, true),
('Do you have any hidden talents that could benefit the English Club?', 'LONG_TEXT', '[]'::jsonb, 'Share your special talents...', false, 7, true),
('Would you rather watch your friends join English Club without you and regret or join English Club and have fun?', 'DROPDOWN', '["😅 Watch my friends and regret.", "🎉 Join the English Club and have fun."]'::jsonb, 'Make your choice...', true, 8, true);

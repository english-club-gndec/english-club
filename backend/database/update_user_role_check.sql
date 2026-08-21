-- Add INTERVIEWEE to the user_role_type PostgreSQL ENUM type

ALTER TYPE user_role_type ADD VALUE IF NOT EXISTS 'INTERVIEWEE';

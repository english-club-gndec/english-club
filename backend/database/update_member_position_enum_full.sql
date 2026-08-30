-- SQL Migration Script to safely update 'member_position' ENUM in PostgreSQL / Supabase
-- This script:
-- 1. Updates ENUM values for all 10 departments (Tech, Finance & AI, Discipline, Documentation, Event Management, Creative, Promotion, Social Media, Anchoring, Photography & Videography)
-- 2. Migrates existing rows from legacy / old position names to the new ones
-- 3. Safely drops and replaces the old ENUM type

BEGIN;

-- Step 1: Create a new temporary ENUM type with the exact required values
CREATE TYPE member_position_new AS ENUM (
    'CONVENOR', 
    'CO-CONVENOR', 
    'TECHNICAL_HEAD', 
    'CO-TECHNICAL_HEAD', 
    'FINANCE_&_AI_HEAD',
    'CO-FINANCE_&_AI_HEAD',
    'DISCIPLINE_HEAD',
    'CO-DISCIPLINE_HEAD',
    'DOCUMENTATION_HEAD',
    'CO-DOCUMENTATION_HEAD',
    'EVENT_MANAGEMENT_HEAD',
    'CO-EVENT_MANAGEMENT_HEAD',
    'CREATIVE_HEAD',
    'CO-CREATIVE_HEAD',
    'PROMOTION_HEAD',
    'CO-PROMOTION_HEAD',
    'SOCIAL_MEDIA_HEAD',
    'CO-SOCIAL_MEDIA_HEAD',
    'ANCHORING_HEAD',
    'CO-ANCHORING_HEAD',
    'PHOTOGRAPHY_&_VIDEOGRAPHY_HEAD',
    'CO-PHOTOGRAPHY_&_VIDEOGRAPHY_HEAD',
    'EXECUTIVE_MEMBER', 
    'ACTIVE_MEMBER'
);

-- Step 2: Convert existing table column to use the new ENUM type, mapping legacy values
ALTER TABLE members 
  ALTER COLUMN member_postion TYPE member_position_new 
  USING (
    CASE member_postion::text
      WHEN 'TECH_HEAD' THEN 'TECHNICAL_HEAD'::member_position_new
      WHEN 'CO-TECH_HEAD' THEN 'CO-TECHNICAL_HEAD'::member_position_new
      WHEN 'FINANCE_&_MARKET_RELATIONS_HEAD' THEN 'FINANCE_&_AI_HEAD'::member_position_new
      WHEN 'CO-FINANCE_&_MARKET_RELATIONS_HEAD' THEN 'CO-FINANCE_&_AI_HEAD'::member_position_new
      WHEN 'CREATIVE_&_PHOTOGRAPHY_HEAD' THEN 'CREATIVE_HEAD'::member_position_new
      WHEN 'CO-CREATIVE_&_PHOTOGRAPHY_HEAD' THEN 'CO-CREATIVE_HEAD'::member_position_new
      ELSE member_postion::text::member_position_new
    END
  );

-- Step 3: Drop the old ENUM type
DROP TYPE member_position;

-- Step 4: Rename the new ENUM type back to 'member_position'
ALTER TYPE member_position_new RENAME TO member_position;

COMMIT;

-- SQL Migration Script to safely update 'member_position' ENUM in PostgreSQL / Supabase
-- This script:
-- 1. Adds the new Head & Co-Head values for all 7 candidate departments
-- 2. Migrates any existing rows using legacy values (TECH_HEAD, CREATIVE_HEAD, etc.) to the new values
-- 3. Removes the legacy ENUM values (TECH_HEAD, CO-TECH_HEAD, CREATIVE_HEAD, CO-CREATIVE_HEAD)

BEGIN;

-- Step 1: Create a new temporary ENUM type with the exact required values
CREATE TYPE member_position_new AS ENUM (
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

-- Step 2: Convert existing table column to use the new ENUM type, mapping legacy values
ALTER TABLE members 
  ALTER COLUMN member_postion TYPE member_position_new 
  USING (
    CASE member_postion::text
      WHEN 'TECH_HEAD' THEN 'TECHNICAL_HEAD'::member_position_new
      WHEN 'CO-TECH_HEAD' THEN 'CO-TECHNICAL_HEAD'::member_position_new
      WHEN 'CREATIVE_HEAD' THEN 'CREATIVE_&_PHOTOGRAPHY_HEAD'::member_position_new
      WHEN 'CO-CREATIVE_HEAD' THEN 'CO-CREATIVE_&_PHOTOGRAPHY_HEAD'::member_position_new
      ELSE member_postion::text::member_position_new
    END
  );

-- Step 3: Drop the old ENUM type
DROP TYPE member_position;

-- Step 4: Rename the new ENUM type back to 'member_position'
ALTER TYPE member_position_new RENAME TO member_position;

COMMIT;

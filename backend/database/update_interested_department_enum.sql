-- Migration Script to update 'interested_department' ENUM in PostgreSQL / Supabase
-- This script replaces the old ENUM values (DISICIPLINE, PHOTOGRAPHY, PHOTOGRAPHY_VIDEOGRAPHY, DATABASE)
-- with the new set of 7 departments (TECHNICAL, CREATIVE, EVENT_MANAGEMENT, FINANCE_&_MARKET_RELATIONS, CREATIVE_&_PHOTOGRAPHY, PROMOTION, ANCHORING).

BEGIN;

-- 1. Create the new ENUM type with the updated department list
CREATE TYPE interested_department_new AS ENUM (
    'TECHNICAL', 
    'EVENT_MANAGEMENT', 
    'FINANCE_&_MARKET_RELATIONS', 
    'CREATIVE_&_PHOTOGRAPHY', 
    'PROMOTION', 
    'ANCHORING'
);

-- 2. Update the candidates table column to use the new ENUM type,
-- mapping existing rows with old values to corresponding new values.
ALTER TABLE candidates 
  ALTER COLUMN interested_department TYPE interested_department_new 
  USING (
    CASE interested_department::text
      WHEN 'CREATIVE' THEN 'CREATIVE_&_PHOTOGRAPHY'::interested_department_new
      WHEN 'DISICIPLINE' THEN 'FINANCE_&_MARKET_RELATIONS'::interested_department_new
      WHEN 'PHOTOGRAPHY' THEN 'CREATIVE_&_PHOTOGRAPHY'::interested_department_new
      WHEN 'PHOTOGRAPHY_VIDEOGRAPHY' THEN 'CREATIVE_&_PHOTOGRAPHY'::interested_department_new
      WHEN 'DATABASE' THEN 'TECHNICAL'::interested_department_new
      ELSE interested_department::text::interested_department_new
    END
  );

-- 3. Drop the old ENUM type
DROP TYPE interested_department;

-- 4. Rename the new ENUM type to 'interested_department'
ALTER TYPE interested_department_new RENAME TO interested_department;

COMMIT;

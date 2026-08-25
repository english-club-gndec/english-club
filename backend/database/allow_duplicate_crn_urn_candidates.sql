-- Migration SQL: Drop all existing unique constraints & indexes on candidate_crn and candidate_urn

-- 1. Drop existing unique constraints (including unique_candidate_crn and unique_candidate_urn)
ALTER TABLE candidates DROP CONSTRAINT IF EXISTS unique_candidate_crn;
ALTER TABLE candidates DROP CONSTRAINT IF EXISTS unique_candidate_urn;
ALTER TABLE candidates DROP CONSTRAINT IF EXISTS candidates_candidate_crn_key;
ALTER TABLE candidates DROP CONSTRAINT IF EXISTS candidates_candidate_urn_key;
ALTER TABLE candidates DROP CONSTRAINT IF EXISTS candidates_candidate_crn_candidate_urn_key;

-- 2. Drop existing unique indexes
DROP INDEX IF EXISTS unique_candidate_crn;
DROP INDEX IF EXISTS unique_candidate_urn;
DROP INDEX IF EXISTS idx_candidates_crn;
DROP INDEX IF EXISTS idx_candidates_urn;
DROP INDEX IF EXISTS idx_candidates_crn_unique;
DROP INDEX IF EXISTS idx_candidates_urn_unique;
DROP INDEX IF EXISTS candidates_candidate_crn_key;
DROP INDEX IF EXISTS candidates_candidate_urn_key;
DROP INDEX IF EXISTS candidates_unique_crn_except_123;
DROP INDEX IF EXISTS candidates_unique_urn_except_123;
DROP INDEX IF EXISTS candidates_unique_crn_except_placeholders;
DROP INDEX IF EXISTS candidates_unique_urn_except_placeholders;

-- 3. Create partial unique indexes excluding fallback placeholders (0 and 123)
CREATE UNIQUE INDEX candidates_unique_crn_except_placeholders 
ON candidates (candidate_crn) 
WHERE candidate_crn NOT IN (0, 123);

CREATE UNIQUE INDEX candidates_unique_urn_except_placeholders 
ON candidates (candidate_urn) 
WHERE candidate_urn IS NOT NULL AND candidate_urn NOT IN (0, 123);

-- Add comments for documentation
COMMENT ON INDEX candidates_unique_crn_except_placeholders IS 'Enforces unique CRNs for all candidates except those using 0 or 123 fallback.';
COMMENT ON INDEX candidates_unique_urn_except_placeholders IS 'Enforces unique URNs for all candidates except those using 0 or 123 fallback.';

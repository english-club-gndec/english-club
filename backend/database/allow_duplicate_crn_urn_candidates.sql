-- Migration SQL: Enforce uniqueness for real CRNs and URNs while allowing 0 and 123 as fallback duplicates

-- Drop any existing unique constraints or indexes on candidate_crn / candidate_urn
ALTER TABLE candidates DROP CONSTRAINT IF EXISTS candidates_candidate_crn_key;
ALTER TABLE candidates DROP CONSTRAINT IF EXISTS candidates_candidate_urn_key;
ALTER TABLE candidates DROP CONSTRAINT IF EXISTS candidates_candidate_crn_candidate_urn_key;

DROP INDEX IF EXISTS idx_candidates_crn_unique;
DROP INDEX IF EXISTS idx_candidates_urn_unique;
DROP INDEX IF EXISTS candidates_candidate_crn_key;
DROP INDEX IF EXISTS candidates_candidate_urn_key;
DROP INDEX IF EXISTS candidates_unique_crn_except_123;
DROP INDEX IF EXISTS candidates_unique_urn_except_123;
DROP INDEX IF EXISTS candidates_unique_crn_except_placeholders;
DROP INDEX IF EXISTS candidates_unique_urn_except_placeholders;

-- Create partial unique indexes excluding placeholder roll numbers (0 and 123)
CREATE UNIQUE INDEX candidates_unique_crn_except_placeholders 
ON candidates (candidate_crn) 
WHERE candidate_crn NOT IN (0, 123);

CREATE UNIQUE INDEX candidates_unique_urn_except_placeholders 
ON candidates (candidate_urn) 
WHERE candidate_urn IS NOT NULL AND candidate_urn NOT IN (0, 123);

-- Add comments for documentation
COMMENT ON INDEX candidates_unique_crn_except_placeholders IS 'Enforces unique CRNs for all candidates except those using 0 or 123 fallback.';
COMMENT ON INDEX candidates_unique_urn_except_placeholders IS 'Enforces unique URNs for all candidates except those using 0 or 123 fallback.';

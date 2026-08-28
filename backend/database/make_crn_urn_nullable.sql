-- Migration SQL: Make candidate_crn and candidate_urn NULLABLE in candidates table

-- 1. Drop NOT NULL constraints on candidate_crn and candidate_urn
ALTER TABLE candidates ALTER COLUMN candidate_crn DROP NOT NULL;
ALTER TABLE candidates ALTER COLUMN candidate_urn DROP NOT NULL;

-- 2. Re-create partial unique indexes to safely ignore NULL values and fallback placeholders (0, 123)
DROP INDEX IF EXISTS candidates_unique_crn_except_placeholders;
DROP INDEX IF EXISTS candidates_unique_urn_except_placeholders;

CREATE UNIQUE INDEX candidates_unique_crn_except_placeholders 
ON candidates (candidate_crn) 
WHERE candidate_crn IS NOT NULL AND candidate_crn NOT IN (0, 123);

CREATE UNIQUE INDEX candidates_unique_urn_except_placeholders 
ON candidates (candidate_urn) 
WHERE candidate_urn IS NOT NULL AND candidate_urn NOT IN (0, 123);

-- 3. Documentation comments
COMMENT ON COLUMN candidates.candidate_crn IS 'Candidate CRN (Nullable)';
COMMENT ON COLUMN candidates.candidate_urn IS 'Candidate URN (Nullable)';

-- SQL Commands to Clean Up / Delete Recruitment Candidates Data
-- Run whichever option suits your needs in your Supabase SQL Editor

-- OPTION 1: Delete ONLY Sample Candidates (Targeting sample email domains)
DELETE FROM candidates 
WHERE candidate_email LIKE '%@gndec.ac.in'
   OR candidate_email LIKE '%.gndec.ac.in%';

-- OPTION 2: Delete ALL Candidates (Clears all recruitment applications)
-- DELETE FROM candidates;

-- OPTION 3: Completely Truncate Candidates Table
-- TRUNCATE TABLE candidates RESTART IDENTITY CASCADE;

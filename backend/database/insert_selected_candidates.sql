-- SQL script to insert or update the two candidates with 'SELECTED' status and CRN in 3rd column

INSERT INTO candidates (
    candidate_name,
    candidate_class,
    candidate_crn,
    candidate_urn,
    candidate_email,
    candidate_mobile_no,
    interested_department,
    candidate_status
) VALUES 
(
    'Suhani Seekar',
    'D1 ECE B',
    2617108,
    NULL,
    'suhani.2617108@gndec.ac.in',
    '9417201277',
    'PROMOTION',
    'SELECTED'
),
(
    'Parneet Kaur',
    'D1 B.Com',
    2698048,
    NULL,
    'parneet.2698048@gndec.ac.in',
    '6280374921',
    'CREATIVE_&_PHOTOGRAPHY',
    'SELECTED'
)
ON CONFLICT (candidate_crn) WHERE candidate_crn IS NOT NULL AND candidate_crn NOT IN (0, 123)
DO UPDATE SET
    candidate_status = 'SELECTED',
    candidate_name = EXCLUDED.candidate_name,
    candidate_class = EXCLUDED.candidate_class,
    candidate_mobile_no = EXCLUDED.candidate_mobile_no,
    interested_department = EXCLUDED.interested_department,
    updated_at = NOW();

-- 1. Create the SubmissionImages storage bucket if it doesn't exist (and restrict to image mime types)
INSERT INTO storage.buckets (id, name, public, allowed_mime_types)
VALUES ('SubmissionImages', 'SubmissionImages', true, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE
SET allowed_mime_types = EXCLUDED.allowed_mime_types;


-- 3. Policy to allow anyone to select/view images
DROP POLICY IF EXISTS "Allow public select for SubmissionImages" ON storage.objects;
CREATE POLICY "Allow public select for SubmissionImages"
ON storage.objects FOR SELECT
USING (bucket_id = 'SubmissionImages');

-- 4. Policy to allow anonymous/public image inserts (for blog creation)
DROP POLICY IF EXISTS "Allow public insert for SubmissionImages" ON storage.objects;
CREATE POLICY "Allow public insert for SubmissionImages"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'SubmissionImages');




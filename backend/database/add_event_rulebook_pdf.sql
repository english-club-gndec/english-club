-- Add event_rulebook_pdf_key column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_rulebook_pdf_key TEXT;

-- Create the event_pdfs storage bucket
INSERT INTO storage.buckets (id, name, public, allowed_mime_types)
VALUES ('event_pdfs', 'event_pdfs', true, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE
SET allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Policy to allow anyone to select/view PDFs
DROP POLICY IF EXISTS "Allow public select for event_pdfs" ON storage.objects;
CREATE POLICY "Allow public select for event_pdfs"
ON storage.objects FOR SELECT
USING (bucket_id = 'event_pdfs');

-- Policy to allow public PDF uploads (for admin event creation)
DROP POLICY IF EXISTS "Allow public insert for event_pdfs" ON storage.objects;
CREATE POLICY "Allow public insert for event_pdfs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'event_pdfs');

-- Policy to allow public PDF deletions (for admin event management)
DROP POLICY IF EXISTS "Allow public delete for event_pdfs" ON storage.objects;
CREATE POLICY "Allow public delete for event_pdfs"
ON storage.objects FOR DELETE
USING (bucket_id = 'event_pdfs');

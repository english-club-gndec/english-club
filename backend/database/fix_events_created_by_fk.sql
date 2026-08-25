-- Migration to fix foreign key constraint errors when deleting users

-- 1. Make created_by in events nullable
ALTER TABLE events ALTER COLUMN created_by DROP NOT NULL;

-- 2. Update events foreign key constraint to ON DELETE SET NULL
ALTER TABLE events 
DROP CONSTRAINT IF EXISTS events_created_by_fkey,
ADD CONSTRAINT events_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL;

-- 3. Update candidates foreign key constraint to ON DELETE SET NULL
ALTER TABLE candidates 
DROP CONSTRAINT IF EXISTS candidates_status_updated_by_fkey,
ADD CONSTRAINT candidates_status_updated_by_fkey 
FOREIGN KEY (status_updated_by) REFERENCES users(user_id) ON DELETE SET NULL;

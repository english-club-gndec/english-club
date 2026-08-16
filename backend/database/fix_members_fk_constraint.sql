-- SQL Migration Script to fix member & user deletion foreign key constraint in Supabase
-- Fixes: "update or delete on table 'users' violates foreign key constraint 'members_created_by_fkey'"

BEGIN;

-- 1. Drop existing triggers attempting direct storage table deletion
DROP TRIGGER IF EXISTS trigger_delete_member_image ON members;
DROP TRIGGER IF EXISTS trigger_delete_user_image ON members;
DROP TRIGGER IF EXISTS trigger_delete_user_image ON users;
DROP FUNCTION IF EXISTS delete_member_image_from_storage();
DROP FUNCTION IF EXISTS delete_user_image_from_storage();

-- 2. Make 'created_by' nullable in members table
ALTER TABLE members ALTER COLUMN created_by DROP NOT NULL;

-- 3. Re-configure the foreign key constraint 'members_created_by_fkey' to ON DELETE SET NULL
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_created_by_fkey;

ALTER TABLE members 
  ADD CONSTRAINT members_created_by_fkey 
  FOREIGN KEY (created_by) 
  REFERENCES users(user_id) 
  ON DELETE SET NULL;

COMMIT;

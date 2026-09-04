-- Migration Script to convert 'user_role' column in 'users' table from ENUM (user_role_type) to VARCHAR
-- This allows assigning dynamic custom roles (e.g., 'PARTICIPANT_SORTER', custom RBAC roles) without enum constraint errors.

BEGIN;

-- 1. Drop default constraint temporarily
ALTER TABLE users ALTER COLUMN user_role DROP DEFAULT;

-- 2. Convert user_role column to VARCHAR
ALTER TABLE users 
  ALTER COLUMN user_role TYPE VARCHAR 
  USING user_role::VARCHAR;

-- 3. Set standard default back
ALTER TABLE users ALTER COLUMN user_role SET DEFAULT 'MANAGER';

-- 4. Drop the obsolete user_role_type enum type
DROP TYPE IF EXISTS user_role_type;

COMMIT;

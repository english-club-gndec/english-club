-- CAUTION: This script will delete ALL data from ALL tables in the public schema.
-- Use with extreme care.

DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- Iterate through all tables in the 'public' schema
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        -- Truncate each table, including those with foreign key dependencies
        EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;

    -- Clear all files from Supabase Storage while keeping the buckets (folders) intact
    -- This removes all records from storage.objects
    TRUNCATE storage.objects CASCADE;

    -- NOTE: To delete only from a specific bucket like 'profile_pictures', 
    -- you could use: DELETE FROM storage.objects WHERE bucket_id = 'profile_pictures';
END $$;

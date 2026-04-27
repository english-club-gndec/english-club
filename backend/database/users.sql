CREATE TABLE IF NOT EXISTS users (
    user_id BIGSERIAL PRIMARY KEY,
    member_id UUID NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,
    user_name VARCHAR NOT NULL,
    user_password TEXT NOT NULL,
    user_role VARCHAR NOT NULL CHECK (user_role IN ('MASTER', 'ADMIN', 'MANAGER')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Trigger to update updated_at on change
CREATE OR REPLACE FUNCTION update_users_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_users_updated_at_column();

/*
  Note: Storage cleanup is now handled by a trigger on the 'members' table 
  since member_profile_picture_key resides there.
*/

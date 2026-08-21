-- Create custom ENUM type for audit log event names
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_event_name') THEN
        CREATE TYPE audit_event_name AS ENUM (
            'MEMBER_UPDATED',
            'MEMBER_DELETED',
            'CANDIDATE_UPDATED',
            'CANDIDATE_STATUS_UPDATED',
            'CANDIDATE_DELETED',
            'CANDIDATES_ARCHIVED',
            'USER_UPDATED',
            'USER_DELETED',
            'EVENT_UPDATED',
            'EVENT_DELETED',
            'SETTINGS_UPDATED'
        );
    END IF;

    -- Add values if missing
    ALTER TYPE audit_event_name ADD VALUE IF NOT EXISTS 'MEMBER_UPDATED';
    ALTER TYPE audit_event_name ADD VALUE IF NOT EXISTS 'MEMBER_DELETED';
    ALTER TYPE audit_event_name ADD VALUE IF NOT EXISTS 'CANDIDATE_UPDATED';
    ALTER TYPE audit_event_name ADD VALUE IF NOT EXISTS 'CANDIDATE_STATUS_UPDATED';
    ALTER TYPE audit_event_name ADD VALUE IF NOT EXISTS 'CANDIDATE_DELETED';
    ALTER TYPE audit_event_name ADD VALUE IF NOT EXISTS 'CANDIDATES_ARCHIVED';
    ALTER TYPE audit_event_name ADD VALUE IF NOT EXISTS 'USER_UPDATED';
    ALTER TYPE audit_event_name ADD VALUE IF NOT EXISTS 'USER_DELETED';
    ALTER TYPE audit_event_name ADD VALUE IF NOT EXISTS 'EVENT_UPDATED';
    ALTER TYPE audit_event_name ADD VALUE IF NOT EXISTS 'EVENT_DELETED';
    ALTER TYPE audit_event_name ADD VALUE IF NOT EXISTS 'SETTINGS_UPDATED';
END $$;

-- Create the audit_log table
CREATE TABLE IF NOT EXISTS audit_log (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name VARCHAR NOT NULL,
    table_name VARCHAR NOT NULL,
    table_primary_key_id TEXT,
    event_name audit_event_name NOT NULL,
    performed_by TEXT,
    old_value JSONB NOT NULL,
    new_value JSONB DEFAULT NULL, -- keep it NULL in case of delete
    event_time TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indices for fast querying and log filtering
CREATE INDEX IF NOT EXISTS idx_audit_log_event_time ON audit_log (event_time DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON audit_log (table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_event_name ON audit_log (event_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_performed_by ON audit_log (performed_by);

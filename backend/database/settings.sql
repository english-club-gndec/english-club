-- SQL Migration Script for settings table

CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    recruitments_active BOOLEAN NOT NULL DEFAULT FALSE,
    results_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT single_row CHECK (id = 1)
);

-- Add missing column 'results_active' if table was created previously without it
ALTER TABLE settings ADD COLUMN IF NOT EXISTS results_active BOOLEAN NOT NULL DEFAULT FALSE;

-- Ensure default row exists
INSERT INTO settings (id, recruitments_active, results_active)
VALUES (1, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;

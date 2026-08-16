CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    recruitments_active BOOLEAN NOT NULL DEFAULT FALSE,
    results_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT single_row CHECK (id = 1)
);
-- Add results visibility to existing installations
ALTER TABLE IF EXISTS settings
    ADD COLUMN IF NOT EXISTS results_active BOOLEAN NOT NULL DEFAULT FALSE;

INSERT INTO settings (id, recruitments_active, results_active)
VALUES (1, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;

-- Create roles table for custom roles and granular RBAC permissions
CREATE TABLE IF NOT EXISTS roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR UNIQUE NOT NULL,
    description TEXT,
    permissions TEXT[] NOT NULL DEFAULT '{}',
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Seed default system roles
INSERT INTO roles (role_name, description, permissions, is_system)
VALUES 
  (
    'MASTER', 
    'Full system administrative access to all panels, user accounts, and roles.', 
    ARRAY[
      'READ_MEMBERS', 'WRITE_MEMBERS', 'UPDATE_MEMBERS', 'DELETE_MEMBERS',
      'READ_EVENTS', 'WRITE_EVENTS', 'UPDATE_EVENTS', 'DELETE_EVENTS',
      'READ_REGISTRATIONS', 'WRITE_REGISTRATIONS', 'UPDATE_REGISTRATIONS', 'DELETE_REGISTRATIONS',
      'READ_RECRUITMENTS', 'WRITE_RECRUITMENTS', 'UPDATE_RECRUITMENTS', 'DELETE_RECRUITMENTS',
      'READ_SUBMISSIONS', 'WRITE_SUBMISSIONS', 'UPDATE_SUBMISSIONS', 'DELETE_SUBMISSIONS'
    ],
    true
  ),
  (
    'ADMIN', 
    'Administrative access to manage club data, users, and roles.', 
    ARRAY[
      'READ_MEMBERS', 'WRITE_MEMBERS', 'UPDATE_MEMBERS', 'DELETE_MEMBERS',
      'READ_EVENTS', 'WRITE_EVENTS', 'UPDATE_EVENTS', 'DELETE_EVENTS',
      'READ_REGISTRATIONS', 'WRITE_REGISTRATIONS', 'UPDATE_REGISTRATIONS', 'DELETE_REGISTRATIONS',
      'READ_RECRUITMENTS', 'WRITE_RECRUITMENTS', 'UPDATE_RECRUITMENTS', 'DELETE_RECRUITMENTS',
      'READ_SUBMISSIONS', 'WRITE_SUBMISSIONS', 'UPDATE_SUBMISSIONS', 'DELETE_SUBMISSIONS'
    ], 
    true
  ),
  (
    'MANAGER', 
    'Operational management across all feature panels with no access to user accounts.', 
    ARRAY[
      'READ_MEMBERS', 'WRITE_MEMBERS', 'UPDATE_MEMBERS', 'DELETE_MEMBERS',
      'READ_EVENTS', 'WRITE_EVENTS', 'UPDATE_EVENTS', 'DELETE_EVENTS',
      'READ_REGISTRATIONS', 'WRITE_REGISTRATIONS', 'UPDATE_REGISTRATIONS', 'DELETE_REGISTRATIONS',
      'READ_RECRUITMENTS', 'WRITE_RECRUITMENTS', 'UPDATE_RECRUITMENTS', 'DELETE_RECRUITMENTS',
      'READ_SUBMISSIONS', 'WRITE_SUBMISSIONS', 'UPDATE_SUBMISSIONS', 'DELETE_SUBMISSIONS'
    ], 
    true
  ),
  (
    'INTERVIEWEE', 
    'Restricted interviewer access for candidate evaluations and settings.', 
    ARRAY['READ_RECRUITMENTS', 'UPDATE_RECRUITMENTS'], 
    true
  )
ON CONFLICT (role_name) DO UPDATE 
SET 
  permissions = EXCLUDED.permissions,
  description = EXCLUDED.description,
  is_system = EXCLUDED.is_system;

-- Trigger to update updated_at on change
CREATE OR REPLACE FUNCTION update_roles_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW
    EXECUTE FUNCTION update_roles_updated_at_column();

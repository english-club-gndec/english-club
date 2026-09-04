// Standard Panel Permissions
const ALL_PERMISSIONS = [
  // Members
  'READ_MEMBERS',
  'WRITE_MEMBERS',
  'UPDATE_MEMBERS',
  'DELETE_MEMBERS',

  // Events
  'READ_EVENTS',
  'WRITE_EVENTS',
  'UPDATE_EVENTS',
  'DELETE_EVENTS',

  // Registrations
  'READ_REGISTRATIONS',
  'WRITE_REGISTRATIONS',
  'UPDATE_REGISTRATIONS',
  'DELETE_REGISTRATIONS',

  // Recruitments
  'READ_RECRUITMENTS',
  'WRITE_RECRUITMENTS',
  'UPDATE_RECRUITMENTS',
  'DELETE_RECRUITMENTS',

  // Submissions
  'READ_SUBMISSIONS',
  'WRITE_SUBMISSIONS',
  'UPDATE_SUBMISSIONS',
  'DELETE_SUBMISSIONS',
];

// Default System Roles and their permissions
const SYSTEM_ROLES = {
  MASTER: {
    role_name: 'MASTER',
    description: 'Full system administrative access to all panels, user accounts, and roles.',
    permissions: [...ALL_PERMISSIONS],
    is_system: true,
  },
  ADMIN: {
    role_name: 'ADMIN',
    description: 'Administrative access to manage club data, users, and roles.',
    permissions: [...ALL_PERMISSIONS],
    is_system: true,
  },
  MANAGER: {
    role_name: 'MANAGER',
    description: 'Operational management across all feature panels with no access to user accounts.',
    permissions: [...ALL_PERMISSIONS],
    is_system: true,
  },
  INTERVIEWEE: {
    role_name: 'INTERVIEWEE',
    description: 'Restricted interviewer access for candidate evaluations and settings.',
    permissions: ['READ_RECRUITMENTS', 'UPDATE_RECRUITMENTS'],
    is_system: true,
  },
};

module.exports = {
  ALL_PERMISSIONS,
  SYSTEM_ROLES,
};

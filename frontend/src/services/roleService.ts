const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface Role {
  role_id?: number;
  role_name: string;
  description?: string | null;
  permissions: string[];
  is_system?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const ALL_PANELS = [
  {
    key: 'MEMBERS',
    label: 'Members',
    permissions: [
      { id: 'READ_MEMBERS', label: 'View / Read Members' },
      { id: 'WRITE_MEMBERS', label: 'Add / Import Members' },
      { id: 'UPDATE_MEMBERS', label: 'Edit Members' },
      { id: 'DELETE_MEMBERS', label: 'Delete Members' },
    ],
  },
  {
    key: 'EVENTS',
    label: 'Events',
    permissions: [
      { id: 'READ_EVENTS', label: 'View Events' },
      { id: 'WRITE_EVENTS', label: 'Create Events' },
      { id: 'UPDATE_EVENTS', label: 'Edit Events' },
      { id: 'DELETE_EVENTS', label: 'Delete Events' },
    ],
  },
  {
    key: 'REGISTRATIONS',
    label: 'Registrations',
    permissions: [
      { id: 'READ_REGISTRATIONS', label: 'View Registrations' },
      { id: 'WRITE_REGISTRATIONS', label: 'Register Candidates' },
      { id: 'UPDATE_REGISTRATIONS', label: 'Edit Attendance / Details' },
      { id: 'DELETE_REGISTRATIONS', label: 'Delete Registrations' },
    ],
  },
  {
    key: 'RECRUITMENTS',
    label: 'Recruitments',
    permissions: [
      { id: 'READ_RECRUITMENTS', label: 'View Candidates & Feedback' },
      { id: 'WRITE_RECRUITMENTS', label: 'Add Questions' },
      { id: 'UPDATE_RECRUITMENTS', label: 'Evaluate & Update Status' },
      { id: 'DELETE_RECRUITMENTS', label: 'Delete / Archive Candidates' },
    ],
  },
  {
    key: 'SUBMISSIONS',
    label: 'Submissions',
    permissions: [
      { id: 'READ_SUBMISSIONS', label: 'View Submissions' },
      { id: 'WRITE_SUBMISSIONS', label: 'Submit Articles' },
      { id: 'UPDATE_SUBMISSIONS', label: 'Approve / Request Changes' },
      { id: 'DELETE_SUBMISSIONS', label: 'Delete Submissions' },
    ],
  },
];

export const roleService = {
  // Fetch all roles
  getRoles: async (): Promise<Role[]> => {
    const res = await fetch(`${API_URL}/roles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}`,
      },
      credentials: 'include',
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch roles');
    }

    return res.json();
  },

  // Create custom role
  createRole: async (roleData: { role_name: string; description?: string; permissions: string[] }): Promise<Role> => {
    const res = await fetch(`${API_URL}/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}`,
      },
      credentials: 'include',
      body: JSON.stringify(roleData),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to create role');
    }

    return res.json();
  },

  // Update custom role
  updateRole: async (roleId: number, roleData: { description?: string; permissions?: string[] }): Promise<Role> => {
    const res = await fetch(`${API_URL}/roles/${roleId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}`,
      },
      credentials: 'include',
      body: JSON.stringify(roleData),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update role');
    }

    return res.json();
  },

  // Delete custom role
  deleteRole: async (roleId: number): Promise<{ message: string }> => {
    const res = await fetch(`${API_URL}/roles/${roleId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}`,
      },
      credentials: 'include',
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to delete role');
    }

    return res.json();
  },
};

const supabase = require('../config/supabase');
const { ALL_PERMISSIONS, SYSTEM_ROLES } = require('../utils/permissions');

const roleController = {
  // GET /api/roles - Fetch all roles (System + Custom)
  getRoles: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('role_id', { ascending: true });

      if (error) {
        // Fallback to system roles if table is not yet seeded or errored
        console.warn('roles table query note:', error.message);
        return res.json(Object.values(SYSTEM_ROLES));
      }

      // Merge with default system roles if any system roles are missing
      const existingNames = new Set((data || []).map((r) => r.role_name.toUpperCase()));
      const combined = [...(data || [])];

      for (const [key, sysRole] of Object.entries(SYSTEM_ROLES)) {
        if (!existingNames.has(key)) {
          combined.push(sysRole);
        }
      }

      res.json(combined);
    } catch (err) {
      console.error('getRoles error:', err);
      res.status(500).json({ error: err.message || 'Failed to fetch roles' });
    }
  },

  // GET /api/roles/:role_name - Fetch role details
  getRoleByName: async (req, res) => {
    try {
      const roleName = String(req.params.role_name).toUpperCase();
      if (SYSTEM_ROLES[roleName]) {
        return res.json(SYSTEM_ROLES[roleName]);
      }

      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .eq('role_name', roleName)
        .single();

      if (error || !data) {
        return res.status(404).json({ error: 'Role not found' });
      }

      res.json(data);
    } catch (err) {
      console.error('getRoleByName error:', err);
      res.status(500).json({ error: err.message || 'Failed to fetch role' });
    }
  },

  // POST /api/roles - Create custom role (Admin/Master only)
  createRole: async (req, res) => {
    try {
      const { role_name, description, permissions } = req.body;

      if (!role_name || !role_name.trim()) {
        return res.status(400).json({ error: 'Role name is required' });
      }

      const formattedName = role_name.trim().toUpperCase().replace(/\s+/g, '_');

      if (SYSTEM_ROLES[formattedName]) {
        return res.status(400).json({ error: `Cannot create system role name '${formattedName}'` });
      }

      // Filter valid permissions
      const validPermissions = Array.isArray(permissions)
        ? permissions.filter((p) => ALL_PERMISSIONS.includes(p))
        : [];

      const newRole = {
        role_name: formattedName,
        description: description?.trim() || null,
        permissions: validPermissions,
        is_system: false,
      };

      const { data, error } = await supabase
        .from('roles')
        .insert([newRole])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return res.status(400).json({ error: `Role '${formattedName}' already exists` });
        }
        throw error;
      }

      res.status(201).json(data);
    } catch (err) {
      console.error('createRole error:', err);
      res.status(500).json({ error: err.message || 'Failed to create role' });
    }
  },

  // PATCH /api/roles/:role_id - Update custom role (Admin/Master only)
  updateRole: async (req, res) => {
    try {
      const { role_id } = req.params;
      const { description, permissions } = req.body;

      // Check if role exists and if it's a system role
      const { data: existingRole, error: fetchError } = await supabase
        .from('roles')
        .select('*')
        .eq('role_id', role_id)
        .single();

      if (fetchError || !existingRole) {
        return res.status(404).json({ error: 'Role not found' });
      }

      if (existingRole.is_system) {
        return res.status(403).json({ error: 'System roles cannot be modified' });
      }

      const updates = {};
      if (description !== undefined) updates.description = description?.trim() || null;
      if (permissions !== undefined && Array.isArray(permissions)) {
        updates.permissions = permissions.filter((p) => ALL_PERMISSIONS.includes(p));
      }

      const { data, error } = await supabase
        .from('roles')
        .update(updates)
        .eq('role_id', role_id)
        .select()
        .single();

      if (error) throw error;

      res.json(data);
    } catch (err) {
      console.error('updateRole error:', err);
      res.status(500).json({ error: err.message || 'Failed to update role' });
    }
  },

  // DELETE /api/roles/:role_id - Delete custom role (Admin/Master only)
  deleteRole: async (req, res) => {
    try {
      const { role_id } = req.params;

      const { data: existingRole, error: fetchError } = await supabase
        .from('roles')
        .select('*')
        .eq('role_id', role_id)
        .single();

      if (fetchError || !existingRole) {
        return res.status(404).json({ error: 'Role not found' });
      }

      if (existingRole.is_system) {
        return res.status(403).json({ error: 'System roles cannot be deleted' });
      }

      // Check if any users currently have this role
      const { data: usersWithRole, error: usersError } = await supabase
        .from('users')
        .select('user_id')
        .eq('user_role', existingRole.role_name);

      if (usersWithRole && usersWithRole.length > 0) {
        return res.status(400).json({
          error: `Cannot delete role '${existingRole.role_name}'. ${usersWithRole.length} user(s) are currently assigned to this role.`,
        });
      }

      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('role_id', role_id);

      if (error) throw error;

      res.json({ message: `Role '${existingRole.role_name}' deleted successfully` });
    } catch (err) {
      console.error('deleteRole error:', err);
      res.status(500).json({ error: err.message || 'Failed to delete role' });
    }
  },
};

module.exports = roleController;

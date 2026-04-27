const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');

const userController = {
  // GET /api/users/:user_id/getUsers
  getUsers: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          user_id,
          member_id,
          user_name,
          user_role,
          created_at,
          updated_at,
          members (
            member_name,
            member_email,
            member_profile_picture_key
          )
        `);

      if (error) throw error;
      res.json(data);
    } catch (err) {
      console.error('getUsers error:', err);
      res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  },

  // GET /api/users/:user_id (excluding password and id)
  getUserById: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('user_id, member_id, user_name, user_role, created_at, updated_at')
        .eq('user_id', req.params.user_id)
        .single();

      if (error) return res.status(404).json({ error: 'User not found' });
      res.json(data);
    } catch (err) {
      console.error('getUserById error:', err);
      res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  },

  // POST /api/users/:user_id/createUser (requester user_id in path)
  createUser: async (req, res) => {
    try {
      const { user_name, user_password, user_role, member_id } = req.body;

      if (!user_name) {
        return res.status(400).json({ error: 'User name is required' });
      }
      if (!user_password) {
        return res.status(400).json({ error: 'User password is required' });
      }
      if (!member_id) {
        return res.status(400).json({ error: 'Member ID is required' });
      }

      const validRoles = ['MASTER', 'ADMIN', 'MANAGER'];
      if (!user_role || !validRoles.includes(user_role.toUpperCase())) {
        return res.status(400).json({ error: 'Invalid or missing user role. Must be MASTER, ADMIN, or MANAGER' });
      }

      const role = user_role.toUpperCase();

      // Hash the password
      const hashedPassword = await bcrypt.hash(user_password, 10);

      const { data, error } = await supabase
        .from('users')
        .insert([
          { 
            user_name, 
            user_password: hashedPassword, 
            user_role: role,
            member_id: member_id || null
          }
        ])
        .select();

      if (error) throw error;
      res.status(201).json({ message: 'User created successfully', user: data[0] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // PATCH /api/users/:user_id/updateUser
  updateUser: async (req, res) => {
    try {
      const { user_id } = req.params;

      // Check if user exists first
      const { data: existingUser, error: existError } = await supabase
        .from('users')
        .select('user_id, member_id, user_name, user_role, created_at, updated_at')
        .eq('user_id', user_id)
        .single();

      if (existError || !existingUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Allow editing fields
      const updateData = { ...req.body };
      delete updateData.user_id;
      // Note: we can allow updating password if needed, but usually it's a separate route
      if (updateData.user_password) {
          updateData.user_password = await bcrypt.hash(updateData.user_password, 10);
      }

      if (Object.keys(updateData).length === 0) {
        return res.json({ message: 'No changes provided', user: existingUser });
      }

      // updated_at is handled by DB trigger

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('user_id', user_id)
        .select();

      if (error) throw error;

      res.json({ message: 'User details updated successfully', user: data[0] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // GET /api/user/:member_id/getUserByMemberId
  getUserByMemberId: async (req, res) => {
    try {
      const { member_id } = req.params;
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          members (*)
        `)
        .eq('member_id', member_id)
        .single();

      if (error || !data) {
        return res.status(404).json({ error: 'User/Member not found' });
      }

      // Remove password from response
      delete data.user_password;

      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = userController;

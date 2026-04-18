const supabase = require('../config/supabase');
const bcrypt = require('bcrypt');

const userController = {
  // GET /api/users/:user_id/getUsers
  getUsers: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('user_id, user_name, user_role, user_image_key, linkedin, github, instagram, portfolio');

      if (error) throw error;
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // GET /api/users/:user_id (excluding password and id)
  getUserById: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('user_name, user_role, user_image_key, linkedin, github, instagram, portfolio')
        .eq('user_id', req.params.user_id)
        .single();

      if (error) return res.status(404).json({ error: 'User not found' });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // POST /api/users/:user_id/createUser (requester user_id in path)
  createUser: async (req, res) => {
    try {
      const { user_name, user_password, user_role, user_image_key, linkedin, github, instagram, portfolio } = req.body;

      if (!user_name) {
        return res.status(400).json({ error: 'User name is required' });
      }
      if (!user_password) {
        return res.status(400).json({ error: 'User password is required' });
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
            user_image_key: user_image_key || null, 
            linkedin, 
            github, 
            instagram, 
            portfolio 
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
        .select('user_id, user_name, user_role, user_image_key, linkedin, github, instagram, portfolio')
        .eq('user_id', user_id)
        .single();

      if (existError || !existingUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Allow editing any fields except restricted ones (user_id, user_role, password)
      const updateData = { ...req.body };
      delete updateData.user_id;
      delete updateData.user_role;
      delete updateData.user_password;
      delete updateData.password;

      if (Object.keys(updateData).length === 0) {
        // If no key-value pairs are sent, return the current user details
        return res.json({ message: 'No changes provided', user: existingUser });
      }

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
  }
};

module.exports = userController;

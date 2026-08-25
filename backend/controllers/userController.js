const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { logAuditEvent } = require('../utils/auditLogger');

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
          members:members!users_member_id_fkey (
            member_name,
            member_email,
            member_profile_picture_key,
            member_postion,
            member_club_department
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
        .select(`
          user_id,
          member_id,
          user_name,
          user_role,
          created_at,
          updated_at,
          members:members!users_member_id_fkey (
            member_name,
            member_email,
            member_profile_picture_key,
            member_postion,
            member_club_department
          )
        `)
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

      const validRoles = ['MASTER', 'ADMIN', 'MANAGER', 'INTERVIEWEE'];
      if (!user_role || !validRoles.includes(user_role.toUpperCase())) {
        return res.status(400).json({ error: 'Invalid or missing user role. Must be MASTER, ADMIN, MANAGER, or INTERVIEWEE' });
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

      const sanitizeUser = (u) => {
        if (!u) return null;
        const copy = { ...u };
        delete copy.user_password;
        return copy;
      };

      logAuditEvent({
        serviceName: 'user_service',
        tableName: 'users',
        tablePrimaryKeyId: user_id,
        eventName: 'USER_UPDATED',
        performedBy: req.user?.user_id || req.params.user_id,
        oldValue: sanitizeUser(existingUser),
        newValue: sanitizeUser(data[0])
      });

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
          members:members!users_member_id_fkey (*)
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
  },

  // PATCH /api/users/:user_id/updatePassword
  updatePassword: async (req, res) => {
    try {
      const { user_id } = req.params;
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: 'Current and new passwords are required' });
      }

      // Fetch user's current hashed password
      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('user_password')
        .eq('user_id', user_id)
        .single();

      if (fetchError || !user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Compare old password with hashed password
      const isMatch = await bcrypt.compare(oldPassword, user.user_password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Incorrect current password' });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update password in database
      const { error: updateError } = await supabase
        .from('users')
        .update({ user_password: hashedNewPassword })
        .eq('user_id', user_id);

      if (updateError) throw updateError;

      res.json({ message: 'Password updated successfully' });
    } catch (err) {
      console.error('updatePassword error:', err);
      res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  },

  // POST /api/user/login
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      // Fetch user from database
      const { data: user, error } = await supabase
        .from('users')
        .select(`
          user_id,
          member_id,
          user_name,
          user_password,
          user_role,
          members:members!users_member_id_fkey (
            member_name,
            member_email,
            member_profile_picture_key,
            member_postion,
            member_club_department
          )
        `)
        .eq('user_name', username)
        .single();

      if (error || !user) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, user.user_password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      // Generate JWT token
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is not defined');
      }

      const token = jwt.sign(
        { user_id: user.user_id, user_name: user.user_name, user_role: user.user_role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      const isProduction = process.env.NODE_ENV === 'production';

      // Set HTTP-Only Cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      });

      // Return user data (excluding password) and token
      delete user.user_password;
      res.json({ message: 'Login successful', user, token });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  },

  // POST /api/user/logout
  logout: async (req, res) => {
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie('token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax'
    });
    res.json({ message: 'Logged out successfully' });
  },

  // GET /api/user/me
  getMe: async (req, res) => {
    try {
      const userId = req.user.user_id;
      const { data: user, error } = await supabase
        .from('users')
        .select(`
          user_id,
          member_id,
          user_name,
          user_role,
          created_at,
          updated_at,
          members:members!users_member_id_fkey (
            member_name,
            member_email,
            member_profile_picture_key,
            member_postion,
            member_club_department
          )
        `)
        .eq('user_id', userId)
        .single();

      if (error || !user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ user });
    } catch (err) {
      console.error('getMe error:', err);
      res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  },

  // DELETE /api/user/:user_id
  deleteUser: async (req, res) => {
    try {
      const { user_id } = req.params;
      const performerId = req.user?.user_id;

      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', user_id)
        .maybeSingle();

      if (!existingUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // 1. Find fallback admin user ID to reassign events / candidates to if needed
      let fallbackUserId = performerId && String(performerId) !== String(user_id) ? performerId : null;

      if (!fallbackUserId) {
        const { data: fallbackUsers } = await supabase
          .from('users')
          .select('user_id')
          .neq('user_id', user_id)
          .in('user_role', ['MASTER', 'ADMIN'])
          .limit(1);

        if (fallbackUsers && fallbackUsers.length > 0) {
          fallbackUserId = fallbackUsers[0].user_id;
        }
      }

      // 2. Reassign or set null for created events to satisfy foreign key constraint
      try {
        await supabase
          .from('events')
          .update({ created_by: fallbackUserId || null })
          .eq('created_by', user_id);
      } catch (eventsErr) {
        console.warn('Non-fatal: failed to update events created_by:', eventsErr);
      }

      // 3. Update candidates status_updated_by
      try {
        await supabase
          .from('candidates')
          .update({ status_updated_by: fallbackUserId || null })
          .eq('status_updated_by', user_id);
      } catch (candErr) {
        console.warn('Non-fatal: failed to update candidates status_updated_by:', candErr);
      }

      // 4. Delete the user
      const { data, error } = await supabase
        .from('users')
        .delete()
        .eq('user_id', user_id)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (existingUser) {
        delete existingUser.user_password;
      }

      logAuditEvent({
        serviceName: 'user_service',
        tableName: 'users',
        tablePrimaryKeyId: user_id,
        eventName: 'USER_DELETED',
        performedBy: performerId || user_id,
        oldValue: existingUser,
        newValue: null
      });

      res.json({ message: 'User deleted successfully' });
    } catch (err) {
      console.error('deleteUser error:', err);
      res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  }
};

module.exports = userController;

const supabase = require('../config/supabase');

const memberController = {
  // POST /:user_id/createMember
  createMember: async (req, res) => {
    try {
      const { 
        member_name, 
        member_postion, 
        member_profile_picture_key, 
        member_crn, 
        member_urn, 
        member_email, 
        member_department, 
        member_semester, 
        member_club_department,
        socials,
        created_by 
      } = req.body;

      // Validation
      if (!member_name || !member_postion || !member_urn || !member_email || !member_department || member_semester === undefined || !created_by) {
        return res.status(400).json({ error: 'All required fields must be provided' });
      }

      const { data, error } = await supabase
        .from('members')
        .insert([
          { 
            member_name, 
            member_postion, 
            member_profile_picture_key, 
            member_crn, 
            member_urn, 
            member_email, 
            member_department, 
            member_semester, 
            member_club_department,
            socials: socials || {},
            created_by 
          }
        ])
        .select();

      if (error) throw error;

      res.status(201).json({ message: 'Member created successfully', member: data[0] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // GET /:user_id/getAllMembers
  getAllMembers: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // GET /:user_id/:member_id/getMemberById
  getMemberById: async (req, res) => {
    try {
      const { member_id } = req.params;
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('member_id', member_id)
        .single();

      if (error || !data) {
        return res.status(404).json({ error: 'Member not found' });
      }

      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // PATCH /:user_id/:member_id/updateMemberById
  updateMemberById: async (req, res) => {
    try {
      const { member_id } = req.params;
      const updateData = req.body;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No update data provided' });
      }

      // Explicitly handle updated_at if trigger isn't enough or to be safe
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('members')
        .update(updateData)
        .eq('member_id', member_id)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Member not found' });
      }

      res.json({ message: 'Member updated successfully', member: data[0] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // DELETE /:user_id/deleteMembersById
  deleteMembersById: async (req, res) => {
    try {
      const { member_ids } = req.body; // Expecting an array of IDs

      if (!member_ids || !Array.isArray(member_ids) || member_ids.length === 0) {
        return res.status(400).json({ error: 'An array of member_ids is required' });
      }

      const { data, error } = await supabase
        .from('members')
        .delete()
        .in('member_id', member_ids)
        .select();

      if (error) throw error;

      res.json({ message: `${data.length} member(s) deleted successfully`, deletedCount: data.length });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = memberController;

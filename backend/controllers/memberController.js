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

  // GET /getAllMembers (Public team-card data only)
  getAllMembers: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('member_id, member_name, member_postion, member_profile_picture_key, member_email, member_club_department, socials')
        .order('created_at', { ascending: true });

      if (error) throw error;

      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // GET /:user_id/getAllMembers (Admin-only full member records)
  getAdminMembers: async (req, res) => {
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

      // 1. Fetch the members to get their profile picture keys
      const { data: members, error: fetchError } = await supabase
        .from('members')
        .select('member_profile_picture_key')
        .in('member_id', member_ids);

      if (fetchError) throw fetchError;

      // 2. Delete the profile pictures from Supabase Storage
      const keysToDelete = members
        .map(m => m.member_profile_picture_key)
        .filter(key => key !== null && key !== undefined && key !== '');

      if (keysToDelete.length > 0) {
        const { error: storageError } = await supabase
          .storage
          .from('profile_pictures')
          .remove(keysToDelete);

        if (storageError) {
          console.error('Failed to delete profile pictures from storage:', storageError.message);
        }
      }

      // 3. Delete the records from the database
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
  },

  // POST /:user_id/createMultipleMembers
  createMultipleMembers: async (req, res) => {
    try {
      const { user_id } = req.params;
      let membersList = req.body;
      if (!Array.isArray(membersList) && req.body && Array.isArray(req.body.members)) {
        membersList = req.body.members;
      }

      if (!membersList || !Array.isArray(membersList) || membersList.length === 0) {
        return res.status(400).json({ error: 'An array of members is required' });
      }

      const validPositions = [
        'CONVENOR',
        'CO-CONVENOR',
        'TECHNICAL_HEAD',
        'CO-TECHNICAL_HEAD',
        'EVENT_MANAGEMENT_HEAD',
        'CO-EVENT_MANAGEMENT_HEAD',
        'FINANCE_&_MARKET_RELATIONS_HEAD',
        'CO-FINANCE_&_MARKET_RELATIONS_HEAD',
        'CREATIVE_&_PHOTOGRAPHY_HEAD',
        'CO-CREATIVE_&_PHOTOGRAPHY_HEAD',
        'PROMOTION_HEAD',
        'CO-PROMOTION_HEAD',
        'ANCHORING_HEAD',
        'CO-ANCHORING_HEAD',
        'EXECUTIVE_MEMBER',
        'ACTIVE_MEMBER'
      ];

      const validDepartments = [
        'IT',
        'CSE',
        'RAI',
        'ECE',
        'CE',
        'EE',
        'ME',
        'BBA',
        'BCA'
      ];

      const formattedMembers = [];
      for (let i = 0; i < membersList.length; i++) {
        const m = membersList[i];
        if (!m || typeof m !== 'object') {
          return res.status(400).json({ error: `Member at index ${i} is invalid` });
        }

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
        } = m;

        if (!member_name) {
          return res.status(400).json({ error: `Member at index ${i} is missing member_name` });
        }
        if (!member_postion) {
          return res.status(400).json({ error: `Member at index ${i} is missing member_postion` });
        }
        if (!validPositions.includes(member_postion)) {
          return res.status(400).json({ error: `Member at index ${i} has invalid position: ${member_postion}` });
        }
        if (!member_urn) {
          return res.status(400).json({ error: `Member at index ${i} is missing member_urn` });
        }
        if (!member_email) {
          return res.status(400).json({ error: `Member at index ${i} is missing member_email` });
        }
        if (!member_department) {
          return res.status(400).json({ error: `Member at index ${i} is missing member_department` });
        }
        if (!validDepartments.includes(member_department)) {
          return res.status(400).json({ error: `Member at index ${i} has invalid department: ${member_department}` });
        }
        if (member_semester === undefined || member_semester === null) {
          return res.status(400).json({ error: `Member at index ${i} is missing member_semester` });
        }
        const sem = Number(member_semester);
        if (isNaN(sem) || sem < 0 || sem > 8) {
          return res.status(400).json({ error: `Member at index ${i} has invalid semester: ${member_semester} (must be 0-8)` });
        }

        const creator = created_by || user_id;
        if (!creator) {
          return res.status(400).json({ error: `Member at index ${i} has no created_by user` });
        }

        formattedMembers.push({
          member_name,
          member_postion,
          member_profile_picture_key: member_profile_picture_key || null,
          member_crn: member_crn ? Number(member_crn) : null,
          member_urn: Number(member_urn),
          member_email,
          member_department,
          member_semester: sem,
          member_club_department: member_club_department || null,
          socials: socials || {},
          created_by: Number(creator)
        });
      }

      const { data, error } = await supabase
        .from('members')
        .insert(formattedMembers)
        .select();

      if (error) throw error;

      res.status(201).json({ message: 'Members created successfully', members: data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = memberController;

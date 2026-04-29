const supabase = require('../config/supabase');

const recruitmentController = {
  // POST /createCandidate
  // Payload: candidate_name, candidate_class, candidate_crn, candidate_urn, candidate_email, interested_department, candidate_description, candidate_why_eligible
  createCandidate: async (req, res) => {
    try {
      const { 
        candidate_name, 
        candidate_class, 
        candidate_crn, 
        candidate_urn, 
        candidate_email, 
        interested_department,
        candidate_description,
        candidate_why_eligible
      } = req.body;

      // Validation
      if (!candidate_name || !candidate_class || !candidate_crn || !candidate_email || !interested_department || !candidate_description || !candidate_why_eligible) {
        return res.status(400).json({ error: 'All required fields must be provided' });
      }

      const { data, error } = await supabase
        .from('candidates')
        .insert([
          { 
            candidate_name, 
            candidate_class, 
            candidate_crn, 
            candidate_urn, 
            candidate_email, 
            interested_department,
            candidate_description,
            candidate_why_eligible
          }
        ])
        .select();

      if (error) throw error;

      res.status(201).json({ message: 'Candidate created successfully', candidate: data[0] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // GET /:user_id/getAllCandidates
  getAllCandidates: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // GET /:userId/:candidate_id/getCandidateById
  getCandidateById: async (req, res) => {
    try {
      const { candidate_id } = req.params;
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('candidate_id', candidate_id)
        .single();

      if (error || !data) {
        return res.status(404).json({ error: 'Candidate not found' });
      }

      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // PATCH /:candidate_id/updateCandidateById
  // Payload: candidate_name, candidate_class, candidate_crn, candidate_urn, candidate_email or interested_department
  updateCandidateById: async (req, res) => {
    try {
      const { candidate_id } = req.params;
      const updateData = req.body;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No update data provided' });
      }

      // Explicitly handle updated_at if trigger isn't enough or to be safe
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('candidates')
        .update(updateData)
        .eq('candidate_id', candidate_id)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Candidate not found' });
      }

      res.json({ message: 'Candidate updated successfully', candidate: data[0] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // PATCH /:user_id/:candidate_id/updateCandidateStatusById
  // Payload: candidate_status, status_updated_by, candidate_comment
  updateCandidateStatusById: async (req, res) => {
    try {
      const { candidate_id } = req.params;
      const { candidate_status, status_updated_by, candidate_comment } = req.body;

      if (!candidate_status || !status_updated_by) {
        return res.status(400).json({ error: 'candidate_status and status_updated_by are required' });
      }

      const updateData = {
        candidate_status,
        status_updated_by,
        updated_at: new Date().toISOString()
      };

      if (candidate_comment !== undefined) {
        updateData.candidate_comment = candidate_comment;
      }

      const { data, error } = await supabase
        .from('candidates')
        .update(updateData)
        .eq('candidate_id', candidate_id)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Candidate not found' });
      }

      res.json({ message: 'Candidate status updated successfully', candidate: data[0] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // DELETE /:user_id/archiveAllData
  // Payload: recruitment_date
  archiveAllData: async (req, res) => {
    try {
      const { recruitment_date } = req.body;

      if (!recruitment_date) {
        return res.status(400).json({ error: 'recruitment_date is required' });
      }

      // 1. Fetch all candidates
      const { data: candidates, error: fetchError } = await supabase
        .from('candidates')
        .select('*');

      if (fetchError) throw fetchError;

      if (!candidates || candidates.length === 0) {
        return res.status(400).json({ error: 'No candidate data to archive' });
      }

      // 2. Insert into recruitment_history
      const { error: insertError } = await supabase
        .from('recruitment_history')
        .insert([
          {
            recruitment_date,
            recruitment_participants_history: candidates
          }
        ]);

      if (insertError) throw insertError;

      // 3. Delete all candidates
      // Note: Supabase/PostgreSQL requires a filter for delete, so we use a filter that matches all rows (id is not null)
      const { error: deleteError } = await supabase
        .from('candidates')
        .delete()
        .neq('candidate_id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (deleteError) throw deleteError;

      res.json({ 
        message: 'All recruitment data archived and candidates table cleared successfully',
        archivedCount: candidates.length 
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = recruitmentController;

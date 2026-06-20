const supabase = require('../config/supabase');

const submissionController = {
  // POST /
  createSubmission: async (req, res) => {
    try {
      const {
        student_name,
        student_class,
        student_urn,
        student_crn,
        student_email,
        title,
        description,
        body,
        image_url,
        tags
      } = req.body;

      // Validation
      if (!student_name || !student_class || !student_urn || !student_email || !title || !description || !body) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }

      const { data, error } = await supabase
        .from('submissions')
        .insert([
          {
            student_name,
            student_class,
            student_urn,
            student_crn: student_crn || null,
            student_email,
            title,
            description,
            body,
            image_url: image_url || null,
            tags: tags || [],
            status: 'PENDING'
          }
        ])
        .select();

      if (error) throw error;

      res.status(201).json({
        message: 'Blog submitted successfully',
        submission: data[0]
      });
    } catch (err) {
      console.error('createSubmission error:', err);
      res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  },

  // PATCH /:submissionId/:userId
  // Admin updating status, rejection_reason, edit_token, reviewed_by
  updateSubmissionStatus: async (req, res) => {
    try {
      const { submissionId, userId } = req.params;
      const { status, rejection_reason, edit_token } = req.body;

      // Validate status
      const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'DELETED'];
      if (status && !validStatuses.includes(status.toUpperCase())) {
        return res.status(400).json({ error: 'Invalid status value' });
      }

      const statusUpper = status ? status.toUpperCase() : null;

      // Prepare updates, strictly allowing only: status, rejection_reason, edit_token, reviewed_by
      const updates = {};
      if (statusUpper) {
        updates.status = statusUpper;
        updates.reviewed_at = new Date().toISOString();
        updates.reviewed_by = userId;
      }
      if (rejection_reason !== undefined) {
        updates.rejection_reason = statusUpper === 'REJECTED' ? rejection_reason : null;
      }
      if (edit_token !== undefined) {
        updates.edit_token = edit_token;
      }

      const { data, error } = await supabase
        .from('submissions')
        .update(updates)
        .eq('submission_id', submissionId)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Submission not found' });
      }

      res.json({
        message: 'Submission status updated successfully',
        submission: data[0]
      });
    } catch (err) {
      console.error('updateSubmissionStatus error:', err);
      res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  },

  // GET /
  getAllSubmissions: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      res.json(data);
    } catch (err) {
      console.error('getAllSubmissions error:', err);
      res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  },

  // GET /approved
  getApprovedSubmissions: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('status', 'APPROVED')
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      res.json(data);
    } catch (err) {
      console.error('getApprovedSubmissions error:', err);
      res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  },

  // DELETE /:submissionId
  deleteSubmission: async (req, res) => {
    try {
      const { submissionId } = req.params;

      const { data, error } = await supabase
        .from('submissions')
        .delete()
        .eq('submission_id', submissionId)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Submission not found' });
      }

      res.json({
        message: 'Submission deleted successfully',
        deletedCount: data.length
      });
    } catch (err) {
      console.error('deleteSubmission error:', err);
      res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  },

  // PATCH /:submissionId/:edit_token
  // Student editing fields. Resets status to PENDING and clears reviewed info.
  editSubmissionByStudent: async (req, res) => {
    try {
      const { submissionId, edit_token } = req.params;
      const {
        student_name,
        student_class,
        student_urn,
        student_crn,
        student_email,
        title,
        description,
        body,
        image_url,
        tags
      } = req.body;

      if (!student_name || !student_class || !student_urn || !student_email || !title || !description || !body) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }

      // Verify submission_id and edit_token match
      const { data: existing, error: verifyError } = await supabase
        .from('submissions')
        .select('submission_id')
        .eq('submission_id', submissionId)
        .eq('edit_token', edit_token)
        .single();

      if (verifyError || !existing) {
        return res.status(404).json({ error: 'Invalid submission ID or edit token' });
      }

      // Perform update, resetting status to PENDING
      const { data, error } = await supabase
        .from('submissions')
        .update({
          student_name,
          student_class,
          student_urn,
          student_crn: student_crn || null,
          student_email,
          title,
          description,
          body,
          image_url: image_url || null,
          tags: tags || [],
          status: 'PENDING',
          rejection_reason: null,
          reviewed_by: null,
          reviewed_at: null
        })
        .eq('submission_id', submissionId)
        .select();

      if (error) throw error;

      res.json({
        message: 'Submission updated and resubmitted successfully',
        submission: data[0]
      });
    } catch (err) {
      console.error('editSubmissionByStudent error:', err);
      res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  }
};

module.exports = submissionController;

const supabase = require('../config/supabase');
const { sendRequestChangesEmail, sendRejectionEmail } = require('../services/emailService');
const { validateLegitEmail } = require('../utils/emailValidator');

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

      // Legit Email & DNS MX Validation
      const emailCheck = await validateLegitEmail(student_email);
      if (!emailCheck.valid) {
        return res.status(400).json({ error: emailCheck.reason });
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
      const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'DELETED', 'REQUESTED_CHANGE'];
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
        updates.rejection_reason = (statusUpper === 'REJECTED' || statusUpper === 'REQUESTED_CHANGE') ? rejection_reason : null;
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

      const updatedSubmission = data[0];

      // Send email if requested changes or rejected
      if (statusUpper === 'REQUESTED_CHANGE') {
        sendRequestChangesEmail({
          toEmail: updatedSubmission.student_email,
          studentName: updatedSubmission.student_name,
          title: updatedSubmission.title,
          feedback: rejection_reason || updatedSubmission.rejection_reason,
          submissionId: updatedSubmission.submission_id,
          editToken: updatedSubmission.edit_token
        }).catch(emailErr => {
          console.error('Non-blocking error sending email:', emailErr);
        });
      } else if (statusUpper === 'REJECTED') {
        sendRejectionEmail({
          toEmail: updatedSubmission.student_email,
          studentName: updatedSubmission.student_name,
          title: updatedSubmission.title,
          rejectionReason: rejection_reason || updatedSubmission.rejection_reason,
          isAutoRejected: false
        }).catch(emailErr => {
          console.error('Non-blocking error sending rejection email:', emailErr);
        });
      }

      res.json({
        message: 'Submission status updated successfully',
        submission: updatedSubmission
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

      // Legit Email & DNS MX Validation
      const emailCheck = await validateLegitEmail(student_email);
      if (!emailCheck.valid) {
        return res.status(400).json({ error: emailCheck.reason });
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
  },

  // GET /:submissionId/:edit_token
  // Retrieve submission details for student edit form using edit_token
  getSubmissionByEditToken: async (req, res) => {
    try {
      const { submissionId, edit_token } = req.params;

      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('submission_id', submissionId)
        .eq('edit_token', edit_token)
        .single();

      if (error || !data) {
        return res.status(404).json({ error: 'Submission not found or invalid token' });
      }

      res.json(data);
    } catch (err) {
      console.error('getSubmissionByEditToken error:', err);
      res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  },

  // POST /validate-email
  validateEmail: async (req, res) => {
    try {
      const { email } = req.body;
      const result = await validateLegitEmail(email);
      if (!result.valid) {
        return res.status(400).json({ valid: false, error: result.reason });
      }
      res.json({ valid: true });
    } catch (err) {
      res.status(500).json({ valid: false, error: 'Failed to validate email address' });
    }
  }
};

module.exports = submissionController;

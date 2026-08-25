const supabase = require('../config/supabase');
const { logAuditEvent } = require('../utils/auditLogger');

async function isResultsEnabled() {
  // Public results fail closed: only a successful database read of `true`
  // enables this endpoint. Local filesystem state must never override it.
  if (!supabase) return false;

  try {
    const { data, error } = await supabase
      .from('settings')
      .select('results_active')
      .eq('id', 1)
      .single();

    if (error) {
      console.error('Supabase results setting read error:', error);
      return false;
    }

    return data?.results_active === true;
  } catch (error) {
    console.error('Results availability check failed:', error.message);
    return false;
  }
}

const recruitmentController = {
  // POST /createCandidate
  // Payload: candidate_name, candidate_class, candidate_crn, candidate_urn, candidate_email, interested_department, candidate_description, candidate_why_eligible, custom_answers
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
        candidate_why_eligible,
        custom_answers
      } = req.body;

      // Validation
      if (!candidate_name || !candidate_class || !candidate_crn || !candidate_email || !interested_department) {
        return res.status(400).json({ error: 'Required fields (name, class, CRN, email, department) must be provided' });
      }

      // Check for duplicate CRN (0 and 123 are allowed as fallback duplicates)
      if (candidate_crn && Number(candidate_crn) !== 123 && Number(candidate_crn) !== 0) {
        const { data: existingCrn } = await supabase
          .from('candidates')
          .select('candidate_id')
          .eq('candidate_crn', candidate_crn)
          .maybeSingle();

        if (existingCrn) {
          return res.status(400).json({ error: `CRN ${candidate_crn} is already registered. Enter 123 if you haven't received your official CRN yet.` });
        }
      }

      // Check for duplicate URN (0 and 123 are allowed as fallback duplicates)
      if (candidate_urn && Number(candidate_urn) !== 123 && Number(candidate_urn) !== 0) {
        const { data: existingUrn } = await supabase
          .from('candidates')
          .select('candidate_id')
          .eq('candidate_urn', candidate_urn)
          .maybeSingle();

        if (existingUrn) {
          return res.status(400).json({ error: `URN ${candidate_urn} is already registered. Enter 123 if you haven't received your official URN yet.` });
        }
      }

      const insertData = {
        candidate_name, 
        candidate_class, 
        candidate_crn, 
        candidate_urn, 
        candidate_email, 
        interested_department,
        candidate_description: candidate_description || '',
        candidate_why_eligible: candidate_why_eligible || '',
        custom_answers: custom_answers || {}
      };

      const { data, error } = await supabase
        .from('candidates')
        .insert([insertData])
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
      let query = supabase
        .from('candidates')
        .select('*');

      if (req.user && req.user.user_role === 'INTERVIEWEE') {
        const { data: userData } = await supabase
          .from('users')
          .select('members:members!users_member_id_fkey(member_club_department)')
          .eq('user_id', req.user.user_id)
          .single();

        const rawDept = userData?.members?.member_club_department;
        if (rawDept && rawDept.toUpperCase().trim() !== 'ALL') {
          let dept = rawDept.toUpperCase().trim();
          if (dept === 'CREATIVE & PHOTOGRAPHY' || dept === 'CREATIVE AND PHOTOGRAPHY') dept = 'CREATIVE_&_PHOTOGRAPHY';
          if (dept === 'EVENT MANAGEMENT') dept = 'EVENT_MANAGEMENT';
          if (dept === 'FINANCE & MARKET RELATIONS') dept = 'FINANCE_&_MARKET_RELATIONS';
          
          query = query.eq('interested_department', dept);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: true });

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

      // Fetch existing record for audit logging
      const { data: existingCandidate } = await supabase
        .from('candidates')
        .select('*')
        .eq('candidate_id', candidate_id)
        .maybeSingle();

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

      logAuditEvent({
        serviceName: 'candidate_service',
        tableName: 'candidates',
        tablePrimaryKeyId: candidate_id,
        eventName: 'CANDIDATE_UPDATED',
        performedBy: req.user?.user_id || req.params.user_id,
        oldValue: existingCandidate,
        newValue: data[0]
      });

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

      // Verify if recruitment is active before allowing status updates
      const { data: settingsData, error: settingsError } = await supabase
        .from('settings')
        .select('recruitments_active')
        .eq('id', 1)
        .single();

      if (settingsError || !settingsData?.recruitments_active) {
        return res.status(403).json({ error: 'Recruitment is currently inactive. Status updates are disabled until recruitment is turned on.' });
      }

      // Fetch existing record for audit logging
      const { data: existingCandidate } = await supabase
        .from('candidates')
        .select('*')
        .eq('candidate_id', candidate_id)
        .maybeSingle();

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

      logAuditEvent({
        serviceName: 'candidate_service',
        tableName: 'candidates',
        tablePrimaryKeyId: candidate_id,
        eventName: 'CANDIDATE_STATUS_UPDATED',
        performedBy: req.user?.user_id || status_updated_by,
        oldValue: existingCandidate,
        newValue: data[0]
      });

      res.json({ message: 'Candidate status updated successfully', candidate: data[0] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // DELETE /:user_id/:candidate_id/deleteCandidateById
  deleteCandidateById: async (req, res) => {
    try {
      const { candidate_id } = req.params;

      const { data: existingCandidate } = await supabase
        .from('candidates')
        .select('*')
        .eq('candidate_id', candidate_id)
        .maybeSingle();

      const { data, error } = await supabase
        .from('candidates')
        .delete()
        .eq('candidate_id', candidate_id)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Candidate not found' });
      }

      logAuditEvent({
        serviceName: 'candidate_service',
        tableName: 'candidates',
        tablePrimaryKeyId: candidate_id,
        eventName: 'CANDIDATE_DELETED',
        performedBy: req.user?.user_id || req.params.user_id,
        oldValue: existingCandidate,
        newValue: null
      });

      res.json({ message: 'Candidate deleted successfully', candidate: data[0] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // DELETE /:user_id/deleteMultipleCandidates
  // Payload: candidate_ids array
  deleteMultipleCandidates: async (req, res) => {
    try {
      const { candidate_ids } = req.body;

      if (!candidate_ids || !Array.isArray(candidate_ids) || candidate_ids.length === 0) {
        return res.status(400).json({ error: 'candidate_ids array is required' });
      }

      const { data: existingCandidates } = await supabase
        .from('candidates')
        .select('*')
        .in('candidate_id', candidate_ids);

      const { data, error } = await supabase
        .from('candidates')
        .delete()
        .in('candidate_id', candidate_ids)
        .select();

      if (error) throw error;

      if (existingCandidates && Array.isArray(existingCandidates)) {
        for (const candidate of existingCandidates) {
          logAuditEvent({
            serviceName: 'candidate_service',
            tableName: 'candidates',
            tablePrimaryKeyId: candidate.candidate_id,
            eventName: 'CANDIDATE_DELETED',
            performedBy: req.user?.user_id || req.params.user_id,
            oldValue: candidate,
            newValue: null
          });
        }
      }

      res.json({ message: `${data ? data.length : 0} candidates deleted successfully`, count: data ? data.length : 0 });
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
      const { error: deleteError } = await supabase
        .from('candidates')
        .delete()
        .not('candidate_id', 'is', null);

      if (deleteError) throw deleteError;

      logAuditEvent({
        serviceName: 'candidate_service',
        tableName: 'candidates',
        tablePrimaryKeyId: 'ALL',
        eventName: 'CANDIDATES_ARCHIVED',
        performedBy: req.user?.user_id || req.params.user_id,
        oldValue: { count: candidates.length, recruitment_date },
        newValue: null
      });

      res.json({ 
        message: 'All recruitment data archived and candidates table cleared successfully',
        archivedCount: candidates.length 
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // GET /questions (Public - active questions sorted by order_index)
  getPublicQuestions: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('recruitment_questions')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      res.json(data || []);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // GET /:user_id/getAdminQuestions (Admin protected - all questions sorted by order_index)
  getAdminQuestions: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('recruitment_questions')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      res.json(data || []);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // POST /:user_id/createQuestion (Admin protected)
  createQuestion: async (req, res) => {
    try {
      const { question_label, question_type, options, placeholder, is_required, order_index, is_active } = req.body;

      if (!question_label || !question_type) {
        return res.status(400).json({ error: 'question_label and question_type are required' });
      }

      const { data, error } = await supabase
        .from('recruitment_questions')
        .insert([
          {
            question_label,
            question_type,
            options: options || [],
            placeholder: placeholder || '',
            is_required: is_required !== undefined ? is_required : true,
            order_index: order_index !== undefined ? order_index : 0,
            is_active: is_active !== undefined ? is_active : true
          }
        ])
        .select();

      if (error) throw error;

      res.status(201).json({ message: 'Question created successfully', question: data[0] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // PATCH /:user_id/:question_id/updateQuestion (Admin protected)
  updateQuestion: async (req, res) => {
    try {
      const { question_id } = req.params;
      const updateData = req.body;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No update data provided' });
      }

      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('recruitment_questions')
        .update(updateData)
        .eq('question_id', question_id)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Question not found' });
      }

      res.json({ message: 'Question updated successfully', question: data[0] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // DELETE /:user_id/:question_id/deleteQuestion (Admin protected)
  deleteQuestion: async (req, res) => {
    try {
      const { question_id } = req.params;

      const { data, error } = await supabase
        .from('recruitment_questions')
        .delete()
        .eq('question_id', question_id)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Question not found' });
      }

      res.json({ message: 'Question deleted successfully', question: data[0] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // GET /results (Public - selected candidates sorted by interested_department and candidate_name)
  getPublicResults: async (req, res) => {
    try {
      const resultsEnabled = await isResultsEnabled();
      if (!resultsEnabled) {
        return res.status(403).json({ error: 'Results are currently unavailable' });
      }

      const { data, error } = await supabase
        .from('candidates')
        .select('candidate_id, candidate_name, candidate_class, candidate_crn, candidate_urn, candidate_email, interested_department, candidate_status, candidate_description, custom_answers, created_at')
        .eq('candidate_status', 'SELECTED')
        .order('interested_department', { ascending: true })
        .order('candidate_name', { ascending: true });

      if (error) throw error;
      res.json(data || []);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = recruitmentController;

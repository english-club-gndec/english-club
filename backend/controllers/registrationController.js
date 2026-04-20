const supabase = require('../config/supabase');

const registrationController = {
  // POST /api/registration/register
  registerParticipant: async (req, res) => {
    try {
      const { 
        participant_name, 
        participant_class, 
        participant_crn, 
        participant_urn, 
        participant_email, 
        registered_event 
      } = req.body;

      if (!participant_name || !participant_class || !participant_crn || !participant_email || !registered_event) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }

      const { data, error } = await supabase
        .from('participants')
        .insert([
          { 
            participant_name, 
            participant_class, 
            participant_crn, 
            participant_urn: participant_urn || null, 
            participant_email, 
            registered_event 
          }
        ])
        .select(`
          *,
          events (
            event_name
          )
        `);

      if (error) throw error;

      // Format response
      const participantWithEvent = {
        ...data[0],
        event_name: data[0].events?.event_name,
        events: undefined
      };

      res.status(201).json({ message: 'Participant registered successfully', participant: participantWithEvent });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // GET /api/registration/getAllParticipants
  getAllParticipants: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('participants')
        .select(`
          *,
          events (
            event_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Format response
      const participantsWithEvent = data.map(p => ({
        ...p,
        event_name: p.events?.event_name,
        events: undefined
      }));

      res.json(participantsWithEvent);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // GET /api/registration/:event_id/getParticipantsByEventId
  getParticipantsByEventId: async (req, res) => {
    try {
      const { event_id } = req.params;
      const { data, error } = await supabase
        .from('participants')
        .select(`
          *,
          events (
            event_name
          )
        `)
        .eq('registered_event', event_id)
        .order('participant_name', { ascending: true });

      if (error) throw error;

      // Format response
      const participantsWithEvent = data.map(p => ({
        ...p,
        event_name: p.events?.event_name,
        events: undefined
      }));

      res.json(participantsWithEvent);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // PATCH /api/registration/:participant_id/updateParticipant
  updateParticipant: async (req, res) => {
    try {
      const { participant_id } = req.params;
      const { 
        participant_name, 
        participant_class, 
        participant_crn, 
        participant_urn, 
        participant_email, 
        registered_event 
      } = req.body;

      const updateData = {};
      if (participant_name !== undefined) updateData.participant_name = participant_name;
      if (participant_class !== undefined) updateData.participant_class = participant_class;
      if (participant_crn !== undefined) updateData.participant_crn = participant_crn;
      if (participant_urn !== undefined) updateData.participant_urn = participant_urn;
      if (participant_email !== undefined) updateData.participant_email = participant_email;
      if (registered_event !== undefined) updateData.registered_event = registered_event;

      updateData.updated_at = new Date().toISOString();

      if (Object.keys(updateData).length <= 1) {
        return res.status(400).json({ error: 'No update data provided' });
      }

      const { data, error } = await supabase
        .from('participants')
        .update(updateData)
        .eq('participant_id', participant_id)
        .select(`
          *,
          events (
            event_name
          )
        `);

      if (error) throw error;
      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Participant not found' });
      }

      // Format response
      const participantWithEvent = {
        ...data[0],
        event_name: data[0].events?.event_name,
        events: undefined
      };

      res.json({ message: 'Participant updated successfully', participant: participantWithEvent });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = registrationController;

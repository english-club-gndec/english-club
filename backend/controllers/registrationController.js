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
        participant_phone_no, 
        registered_event, 
        team_name,
        members,
        participants,
        custom_answers
      } = req.body;

      if (!registered_event) {
        return res.status(400).json({ error: 'registered_event is required' });
      }

      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('event_id, event_name, event_type, min_team_size, max_team_size')
        .eq('event_id', registered_event)
        .single();

      if (eventError || !event) {
        return res.status(404).json({ error: 'Registered event not found' });
      }

      const normalizedEventType = String(event.event_type || 'INDIVIDUAL').trim().toUpperCase();

      let participantsList = [];
      if (Array.isArray(members) && members.length > 0) {
        participantsList = members;
      } else if (Array.isArray(participants) && participants.length > 0) {
        participantsList = participants;
      } else {
        participantsList = [{
          participant_name,
          participant_class,
          participant_crn,
          participant_urn,
          participant_email,
          participant_phone_no
        }];
      }

      if (!participantsList.length) {
        return res.status(400).json({ error: 'At least one participant is required' });
      }

      for (let i = 0; i < participantsList.length; i++) {
        const p = participantsList[i];
        const trimmedPhone = String(p.participant_phone_no ?? '').trim();
        const trimmedName = String(p.participant_name ?? '').trim();
        const trimmedClass = String(p.participant_class ?? '').trim();
        const trimmedEmail = String(p.participant_email ?? '').trim();

        if (!trimmedName || !trimmedClass || !trimmedEmail || !trimmedPhone) {
          return res.status(400).json({ 
            error: `Participant ${i + 1} is missing required fields (name, class, email, and phone are required)` 
          });
        }

        const phoneValid = /^[0-9+()\-\s]{7,15}$/.test(trimmedPhone);
        if (!phoneValid) {
          return res.status(400).json({ error: `Participant ${i + 1} has an invalid phone number` });
        }
      }

      let assignedTeamId = null;

      if (normalizedEventType === 'TEAM') {
        if (!team_name || !String(team_name).trim()) {
          return res.status(400).json({ error: 'Team name is mandatory for team events' });
        }

        const maxTeamSize = Number(event.max_team_size);
        if (!Number.isInteger(maxTeamSize) || maxTeamSize < 1) {
          return res.status(400).json({ error: 'This team event does not have a valid max_team_size configured' });
        }

        const minTeamSize = Number(event.min_team_size);
        if (Number.isInteger(minTeamSize) && minTeamSize > 1 && participantsList.length < minTeamSize) {
          return res.status(400).json({
            error: `Team size (${participantsList.length}) is below the minimum required limit of ${minTeamSize} for this event`
          });
        }

        if (participantsList.length > maxTeamSize) {
          return res.status(400).json({ 
            error: `Team size (${participantsList.length}) exceeds maximum allowed limit of ${maxTeamSize} for this event` 
          });
        }

        const { data: teamData, error: teamError } = await supabase
          .from('participating_teams')
          .insert([{ 
            team_name: String(team_name).trim(),
            event_id: registered_event
          }])
          .select()
          .single();

        if (teamError) throw teamError;
        assignedTeamId = teamData.team_id;
      }

      const recordsToInsert = participantsList.map(p => ({
        participant_name: String(p.participant_name ?? '').trim(),
        participant_class: String(p.participant_class ?? '').trim(),
        participant_crn: p.participant_crn !== undefined && p.participant_crn !== null && p.participant_crn !== '' ? Number(p.participant_crn) : null,
        participant_urn: p.participant_urn !== undefined && p.participant_urn !== null && p.participant_urn !== '' ? Number(p.participant_urn) : null,
        participant_email: String(p.participant_email ?? '').trim(),
        participant_phone_no: String(p.participant_phone_no ?? '').trim(),
        registered_event: registered_event,
        team_id: assignedTeamId,
        custom_answers: custom_answers || {}
      }));

      const { data: insertedData, error: insertError } = await supabase
        .from('participants')
        .insert(recordsToInsert)
        .select(`
          *,
          events (
            event_name,
            event_type
          ),
          participating_teams (
            team_name
          )
        `);

      if (insertError) throw insertError;

      // Format response
      const formattedParticipants = insertedData.map(p => ({
        ...p,
        event_name: p.events?.event_name,
        team_name: p.participating_teams?.team_name || null,
        events: undefined,
        participating_teams: undefined
      }));

      res.status(201).json({ 
        message: event.event_type === 'TEAM' ? 'Team registered successfully' : 'Participant registered successfully',
        team_id: assignedTeamId,
        team_name: team_name || null,
        participants: formattedParticipants 
      });
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
            event_name,
            event_type
          ),
          participating_teams (
            team_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Format response
      const participantsWithEvent = data.map(p => ({
        ...p,
        event_name: p.events?.event_name,
        team_name: p.participating_teams?.team_name || null,
        events: undefined,
        participating_teams: undefined
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
            event_name,
            event_type
          ),
          participating_teams (
            team_name
          )
        `)
        .eq('registered_event', event_id)
        .order('participant_name', { ascending: true });

      if (error) throw error;

      // Format response
      const participantsWithEvent = data.map(p => ({
        ...p,
        event_name: p.events?.event_name,
        team_name: p.participating_teams?.team_name || null,
        events: undefined,
        participating_teams: undefined
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
        participant_phone_no,
        registered_event,
        team_id
      } = req.body;

      const updateData = {};
      if (participant_name !== undefined) updateData.participant_name = participant_name;
      if (participant_class !== undefined) updateData.participant_class = participant_class;
      if (participant_crn !== undefined) updateData.participant_crn = participant_crn;
      if (participant_urn !== undefined) updateData.participant_urn = participant_urn;
      if (participant_email !== undefined) updateData.participant_email = participant_email;
      if (participant_phone_no !== undefined) updateData.participant_phone_no = participant_phone_no;
      if (registered_event !== undefined) updateData.registered_event = registered_event;
      if (team_id !== undefined) updateData.team_id = team_id;

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
            event_name,
            event_type
          ),
          participating_teams (
            team_name
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
        team_name: data[0].participating_teams?.team_name || null,
        events: undefined,
        participating_teams: undefined
      };

      res.json({ message: 'Participant updated successfully', participant: participantWithEvent });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  
  // GET /api/registration/:event_id/getParticipationCountByEventId
  getParticipationCountByEventId: async (req, res) => {
    try {
      const { event_id } = req.params;
      
      const { count, error } = await supabase
        .from('participants')
        .select('*', { count: 'exact', head: true })
        .eq('registered_event', event_id);

      if (error) throw error;

      res.json({ event_id, total_participants: count || 0 });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // DELETE /api/registration/:participant_id
  deleteParticipant: async (req, res) => {
    try {
      const { participant_id } = req.params;

      if (!participant_id) {
        return res.status(400).json({ error: 'participant_id is required' });
      }

      const { data, error } = await supabase
        .from('participants')
        .delete()
        .eq('participant_id', participant_id)
        .select(`
          *,
          events (
            event_name,
            event_type
          ),
          participating_teams (
            team_name
          )
        `);

      if (error) throw error;
      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Participant not found' });
      }

      const participantWithEvent = {
        ...data[0],
        event_name: data[0].events?.event_name,
        team_name: data[0].participating_teams?.team_name || null,
        events: undefined,
        participating_teams: undefined
      };

      res.json({ message: 'Participant deleted successfully', participant: participantWithEvent });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // DELETE /api/registration/multipleParticipants
  deleteMultipleParticipants: async (req, res) => {
    try {
      let participant_ids = req.body?.participant_ids;
      if (!participant_ids && Array.isArray(req.body)) {
        participant_ids = req.body;
      } else if (!participant_ids && req.body?.ids) {
        participant_ids = req.body.ids;
      }

      if (!participant_ids || !Array.isArray(participant_ids) || participant_ids.length === 0) {
        return res.status(400).json({ error: 'participant_ids array is required' });
      }

      const { data, error } = await supabase
        .from('participants')
        .delete()
        .in('participant_id', participant_ids)
        .select(`
          *,
          events (
            event_name,
            event_type
          ),
          participating_teams (
            team_name
          )
        `);

      if (error) throw error;

      const deletedCount = data ? data.length : 0;
      const formattedParticipants = (data || []).map(p => ({
        ...p,
        event_name: p.events?.event_name,
        team_name: p.participating_teams?.team_name || null,
        events: undefined,
        participating_teams: undefined
      }));

      res.json({
        message: `${deletedCount} participant(s) deleted successfully`,
        count: deletedCount,
        deletedCount,
        participants: formattedParticipants
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = registrationController;


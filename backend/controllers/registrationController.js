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
        participants
      } = req.body;

      if (!registered_event) {
        return res.status(400).json({ error: 'registered_event is required' });
      }

      // 1. Fetch event details to check event_type and max_team_size
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('event_id, event_name, event_type, max_team_size')
        .eq('event_id', registered_event)
        .single();

      if (eventError || !event) {
        return res.status(404).json({ error: 'Registered event not found' });
      }

      // 2. Determine participants list from payload (single participant or array of members)
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

      // Validate required fields for every participant
      for (let i = 0; i < participantsList.length; i++) {
        const p = participantsList[i];
        if (!p.participant_name || !p.participant_class || !p.participant_email) {
          return res.status(400).json({ 
            error: `Participant ${i + 1} is missing required fields (name, class, and email are required)` 
          });
        }
      }

      let assignedTeamId = null;

      // 3. Handle TEAM vs INDIVIDUAL logic
      if (event.event_type === 'TEAM') {
        if (!team_name || !team_name.trim()) {
          return res.status(400).json({ error: 'Team name is mandatory for team events' });
        }

        if (event.max_team_size && participantsList.length > event.max_team_size) {
          return res.status(400).json({ 
            error: `Team size (${participantsList.length}) exceeds maximum allowed limit of ${event.max_team_size} for this event` 
          });
        }

        // Save team in participating_teams table
        const { data: teamData, error: teamError } = await supabase
          .from('participating_teams')
          .insert([{ 
            team_name: team_name.trim(),
            event_id: registered_event
          }])
          .select()
          .single();

        if (teamError) throw teamError;
        assignedTeamId = teamData.team_id;
      } else {
        // For INDIVIDUAL events, team_id remains null
        assignedTeamId = null;
      }

      // 4. Save participants in database
      const recordsToInsert = participantsList.map(p => ({
        participant_name: p.participant_name,
        participant_class: p.participant_class,
        participant_crn: p.participant_crn || null,
        participant_urn: p.participant_urn || null,
        participant_email: p.participant_email,
        participant_phone_no: p.participant_phone_no || null,
        registered_event: registered_event,
        team_id: assignedTeamId
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
  }
};

module.exports = registrationController;

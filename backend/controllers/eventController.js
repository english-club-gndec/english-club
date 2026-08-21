const supabase = require('../config/supabase');
const { logAuditEvent } = require('../utils/auditLogger');

const eventController = {
  // POST /api/events
  createEvent: async (req, res) => {
    try {
      const { event_name, event_short_description, event_long_description, event_venue, event_date, event_time, event_poster_key, created_by } = req.body;

      if (!event_name || !event_short_description || !created_by) {
        return res.status(400).json({ error: 'Name, short description, and created_by are required' });
      }

      const { data, error } = await supabase
        .from('events')
        .insert([
          { 
            event_name, 
            event_short_description, 
            event_long_description, 
            event_venue, 
            event_date, 
            event_time, 
            event_poster_key,
            created_by 
          }
        ])
        .select(`
          *,
          users (
            user_name,
            members:members!users_member_id_fkey (
              member_name
            )
          )
        `);

      if (error) throw error;

      // Format response to include creater_name (prefer member_name)
      const eventWithCreator = {
        ...data[0],
        creater_name: data[0].users?.members?.member_name || data[0].users?.user_name
      };
      delete eventWithCreator.users;

      res.status(201).json({ message: 'Event created successfully', event: eventWithCreator });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // GET /api/events
  getAllEvents: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          users (
            user_name,
            members:members!users_member_id_fkey (
              member_name
            )
          )
        `)
        .order('event_date', { ascending: false })
        .order('event_time', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Format response
      const eventsWithCreator = data.map(event => ({
        ...event,
        creater_name: event.users?.members?.member_name || event.users?.user_name,
        users: undefined
      }));

      res.json(eventsWithCreator);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // GET /api/events/:event_id
  getEventById: async (req, res) => {
    try {
      const { event_id } = req.params;
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          users (
            user_name,
            members:members!users_member_id_fkey (
              member_name
            )
          )
        `)
        .eq('event_id', event_id)
        .single();

      if (error || !data) {
        return res.status(404).json({ error: 'Event not found' });
      }

      // Format response
      const eventWithCreator = {
        ...data,
        creater_name: data.users?.members?.member_name || data.users?.user_name
      };
      delete eventWithCreator.users;

      res.json(eventWithCreator);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // PATCH /api/events/:event_id
    updateEvent: async (req, res) => {
    try {
      const { event_id } = req.params;
      const { event_name, event_short_description, event_long_description, event_venue, event_date, event_time, event_poster_key } = req.body;

      // Fetch existing record for audit logging
      const { data: existingEvent } = await supabase
        .from('events')
        .select('*')
        .eq('event_id', event_id)
        .maybeSingle();

      // Prepare update data (only include fields provided in the body)
      const updateData = {};
      if (event_name !== undefined) updateData.event_name = event_name;
      if (event_short_description !== undefined) updateData.event_short_description = event_short_description;
      if (event_long_description !== undefined) updateData.event_long_description = event_long_description;
      if (event_venue !== undefined) updateData.event_venue = event_venue;
      if (event_date !== undefined) updateData.event_date = event_date;
      if (event_time !== undefined) updateData.event_time = event_time;
      if (event_poster_key !== undefined) updateData.event_poster_key = event_poster_key;
      
      // Explicitly set updated_at (though the DB trigger would also handle this if set up)
      updateData.updated_at = new Date().toISOString();

      if (Object.keys(updateData).length <= 1) { // Only updated_at is there
        return res.status(400).json({ error: 'No update data provided' });
      }

      const { data, error } = await supabase
        .from('events')
        .update(updateData)
        .eq('event_id', event_id)
        .select(`
          *,
          users (
            user_name,
            members:members!users_member_id_fkey (
              member_name
            )
          )
        `);

      if (error) throw error;
      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }

      // Format response
      const eventWithCreator = {
        ...data[0],
        creater_name: data[0].users?.members?.member_name || data[0].users?.user_name
      };
      delete eventWithCreator.users;

      logAuditEvent({
        serviceName: 'event_service',
        tableName: 'events',
        tablePrimaryKeyId: event_id,
        eventName: 'EVENT_UPDATED',
        performedBy: req.user?.user_id || req.body.updated_by,
        oldValue: existingEvent,
        newValue: eventWithCreator
      });

      res.json({ message: 'Event updated successfully', event: eventWithCreator });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // DELETE /api/events/:event_id
  deleteEvent: async (req, res) => {
    try {
      const { event_id } = req.params;

      // 1. Fetch the event to get the poster key & details for audit logging
      const { data: event, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .eq('event_id', event_id)
        .single();

      if (fetchError || !event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      // 2. Delete the poster from Supabase Storage if it exists
      if (event.event_poster_key) {
        const { error: storageError } = await supabase
          .storage
          .from('event_posters')
          .remove([event.event_poster_key]);

        if (storageError) {
          console.error('Failed to delete event poster from storage:', storageError.message);
        }
      }

      // 3. Delete all participants registered for this event
      const { error: participantsError } = await supabase
        .from('participants')
        .delete()
        .eq('registered_event', event_id);

      if (participantsError) {
        console.error('Failed to delete event participants:', participantsError.message);
        throw participantsError;
      }

      // 4. Delete the event from the database
      const { data, error } = await supabase
        .from('events')
        .delete()
        .eq('event_id', event_id)
        .select();

      if (error) throw error;

      logAuditEvent({
        serviceName: 'event_service',
        tableName: 'events',
        tablePrimaryKeyId: event_id,
        eventName: 'EVENT_DELETED',
        performedBy: req.user?.user_id,
        oldValue: event,
        newValue: null
      });

      res.json({ message: 'Event deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = eventController;

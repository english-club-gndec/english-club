const supabase = require('../config/supabase');

const eventController = {
  // POST /api/events
  createEvent: async (req, res) => {
    try {
      const { event_name, event_description, event_venue, event_date, event_time, created_by } = req.body;

      if (!event_name || !event_description || !created_by) {
        return res.status(400).json({ error: 'Name, description, and created_by are required' });
      }

      const { data, error } = await supabase
        .from('events')
        .insert([
          { 
            event_name, 
            event_description, 
            event_venue, 
            event_date, 
            event_time, 
            created_by 
          }
        ])
        .select(`
          *,
          users (
            user_name
          )
        `);

      if (error) throw error;

      // Format response to include creater_name
      const eventWithCreator = {
        ...data[0],
        creater_name: data[0].users?.user_name
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
            user_name
          )
        `)
        .order('event_date', { ascending: true });

      if (error) throw error;

      // Format response
      const eventsWithCreator = data.map(event => ({
        ...event,
        creater_name: event.users?.user_name,
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
            user_name
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
        creater_name: data.users?.user_name
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
      const { event_name, event_description, event_venue, event_date, event_time } = req.body;

      // Prepare update data (only include fields provided in the body)
      const updateData = {};
      if (event_name !== undefined) updateData.event_name = event_name;
      if (event_description !== undefined) updateData.event_description = event_description;
      if (event_venue !== undefined) updateData.event_venue = event_venue;
      if (event_date !== undefined) updateData.event_date = event_date;
      if (event_time !== undefined) updateData.event_time = event_time;
      
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
            user_name
          )
        `);

      if (error) throw error;
      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }

      // Format response
      const eventWithCreator = {
        ...data[0],
        creater_name: data[0].users?.user_name
      };
      delete eventWithCreator.users;

      res.json({ message: 'Event updated successfully', event: eventWithCreator });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = eventController;

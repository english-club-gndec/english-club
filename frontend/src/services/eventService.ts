const BASE_URL = import.meta.env.VITE_API_URL || 'https://english-club-imxa.vercel.app/api';

export const eventService = {
  getAllEvents: async () => {
    try {
      const response = await fetch(`${BASE_URL}/events/getAllEvents`);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch events:', error);
      throw error;
    }
  },

  createEvent: async (eventData: any) => {
    try {
      const response = await fetch(`${BASE_URL}/events/createEvent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to create event:', error);
      throw error;
    }
  },

  updateEvent: async (eventId: number, eventData: any) => {
    try {
      const response = await fetch(`${BASE_URL}/events/${eventId}/updateEvent`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to update event:', error);
      throw error;
    }
  }
};

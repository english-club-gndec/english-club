const BASE_URL = import.meta.env.VITE_API_URL || 'https://english-club-imxa.vercel.app/api';

export const registrationService = {
  getAllParticipants: async () => {
    try {
      const response = await fetch(`${BASE_URL}/registration/getAllParticipants`);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch participants:', error);
      throw error;
    }
  }
};

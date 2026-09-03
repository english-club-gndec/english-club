const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const registrationService = {
  getAllParticipants: async () => {
    try {
      const response = await fetch(`${BASE_URL}/registration/getAllParticipants`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch participants:', error);
      throw error;
    }
  },

  deleteParticipant: async (participantId: string) => {
    const response = await fetch(`${BASE_URL}/registration/${participantId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `Error: ${response.statusText}`);
    }
    return await response.json();
  },

  deleteMultipleParticipants: async (participantIds: string[]) => {
    const response = await fetch(`${BASE_URL}/registration/multipleParticipants`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ participant_ids: participantIds })
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `Error: ${response.statusText}`);
    }
    return await response.json();
  }
};

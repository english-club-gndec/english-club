const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const registrationService = {
  registerParticipant: async (payload: {
    participant_name?: string;
    participant_class?: string;
    participant_crn?: number | null;
    participant_urn?: number | null;
    participant_email?: string;
    participant_phone_no?: string;
    registered_event?: number;
    team_name?: string;
    members?: any[];
    participants?: any[];
  }) => {
    try {
      const response = await fetch(`${BASE_URL}/registration/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Registration service error:', error);
      throw error;
    }
  }
};

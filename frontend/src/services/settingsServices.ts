const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const settingsServices = {
  getSettings: async () => {
    const response = await fetch(`${API_BASE_URL}/settings`);
    if (!response.ok) {
      throw new Error(`Failed to fetch settings`);
    }
    return response.json();
  },

  updateSettings: async (settings: any) => {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });
    if (!response.ok) {
      throw new Error(`Failed to update settings`);
    }
    return response.json();
  }
};

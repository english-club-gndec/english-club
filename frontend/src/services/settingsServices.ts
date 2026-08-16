const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface SettingsData {
  recruitmentsActive: boolean;
  resultsActive: boolean;
}

export const settingsServices = {
  getSettings: async () => {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch settings`);
    }
    return response.json() as Promise<SettingsData>;
  },

  updateSettings: async (settings: Partial<SettingsData>) => {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(settings),
    });
    if (!response.ok) {
      throw new Error(`Failed to update settings`);
    }
    return response.json() as Promise<SettingsData>;
  }
};

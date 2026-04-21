const BASE_URL = 'http://localhost:5000/api';

export const userService = {
  getUserById: async (userId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/user/${userId}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch user:', error);
      throw error;
    }
  },
  
  getUsers: async (adminId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/user/${adminId}/getUsers`);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  }
};

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const userService = {
  getUserById: async (userId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/user/${userId}`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
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
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  },

  createUser: async (adminId: string, userData: any) => {
    try {
      const response = await fetch(`${BASE_URL}/user/${adminId}/createUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  },

  updateUser: async (userId: string, userData: any) => {
    try {
      const response = await fetch(`${BASE_URL}/user/${userId}/updateUser`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  }
};



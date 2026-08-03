const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const userService = {
  getMe: async () => {
    try {
      const response = await fetch(`${BASE_URL}/user/me`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch session:', error);
      throw error;
    }
  },

  getUserById: async (userId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/user/${userId}`, {
        method: 'GET',
        credentials: 'include',
      });
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
      const response = await fetch(`${BASE_URL}/user/${adminId}/getUsers`, {
        method: 'GET',
        credentials: 'include',
      });
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
        credentials: 'include',
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
        credentials: 'include',
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
  },

  updatePassword: async (userId: string, passwordData: any) => {
    try {
      const response = await fetch(`${BASE_URL}/user/${userId}/updatePassword`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(passwordData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to update password:', error);
      throw error;
    }
  },

  login: async (credentials: any) => {
    try {
      const response = await fetch(`${BASE_URL}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to login:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await fetch(`${BASE_URL}/user/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to logout:', error);
      throw error;
    }
  },

  deleteUser: async (userId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/user/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  }
};

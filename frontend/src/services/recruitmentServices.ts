const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE_URL = `${BASE_URL}/recruitment`;

export const recruitmentServices = {
  createCandidate: async (candidateData: any) => {
    const response = await fetch(`${API_BASE_URL}/createCandidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(candidateData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to submit application: ${errorText}`);
    }

    return response.json();
  },

  getAllCandidates: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/${userId}/getAllCandidates`, {
      credentials: "include",
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch candidates: ${errorText}`);
    }
    return response.json();
  },

  getCandidateById: async (userId: string, candidateId: string) => {
    const response = await fetch(`${API_BASE_URL}/${userId}/${candidateId}/getCandidateById`, {
      credentials: "include",
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch candidate details: ${errorText}`);
    }
    return response.json();
  },

  updateCandidateById: async (candidateId: string, candidateData: any) => {
    const response = await fetch(`${API_BASE_URL}/${candidateId}/updateCandidateById`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(candidateData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update candidate: ${errorText}`);
    }

    return response.json();
  },

  updateCandidateStatusById: async (userId: string, candidateId: string, statusData: any) => {
    const response = await fetch(`${API_BASE_URL}/${userId}/${candidateId}/updateCandidateStatusById`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(statusData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update candidate status: ${errorText}`);
    }

    return response.json();
  },
};

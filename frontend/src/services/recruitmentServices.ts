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

  deleteCandidateById: async (userId: string, candidateId: string) => {
    const response = await fetch(`${API_BASE_URL}/${userId}/${candidateId}/deleteCandidateById`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete candidate: ${errorText}`);
    }
    return response.json();
  },

  deleteMultipleCandidates: async (userId: string, candidateIds: string[]) => {
    const response = await fetch(`${API_BASE_URL}/${userId}/deleteMultipleCandidates`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ candidate_ids: candidateIds }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete selected candidates: ${errorText}`);
    }
    return response.json();
  },

  archiveAllData: async (userId: string, recruitmentDate: string) => {
    const response = await fetch(`${API_BASE_URL}/${userId}/archiveAllData`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ recruitment_date: recruitmentDate }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to archive recruitment data: ${errorText}`);
    }
    return response.json();
  },

  getPublicQuestions: async () => {
    const response = await fetch(`${API_BASE_URL}/questions`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch recruitment questions: ${errorText}`);
    }
    return response.json();
  },

  getAdminQuestions: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/${userId}/adminQuestions`, {
      credentials: "include",
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch questions: ${errorText}`);
    }
    return response.json();
  },

  createQuestion: async (userId: string, questionData: any) => {
    const response = await fetch(`${API_BASE_URL}/${userId}/createQuestion`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(questionData),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create question: ${errorText}`);
    }
    return response.json();
  },

  updateQuestion: async (userId: string, questionId: string, questionData: any) => {
    const response = await fetch(`${API_BASE_URL}/${userId}/${questionId}/updateQuestion`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(questionData),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update question: ${errorText}`);
    }
    return response.json();
  },

  deleteQuestion: async (userId: string, questionId: string) => {
    const response = await fetch(`${API_BASE_URL}/${userId}/${questionId}/deleteQuestion`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete question: ${errorText}`);
    }
    return response.json();
  },
};

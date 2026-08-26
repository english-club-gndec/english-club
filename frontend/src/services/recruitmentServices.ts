const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE_URL = `${BASE_URL}/recruitment`;

const parseErrorResponse = async (response: Response, defaultPrefix: string): Promise<string> => {
  try {
    const errorText = await response.text();
    try {
      const parsed = JSON.parse(errorText);
      if (parsed && parsed.error) {
        return parsed.error;
      }
    } catch {
      if (errorText && errorText.trim()) {
        return `${defaultPrefix}: ${errorText}`;
      }
    }
  } catch {
    // Ignore error reading body
  }
  return defaultPrefix;
};

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
      const errorMessage = await parseErrorResponse(response, "Failed to submit application");
      throw new Error(errorMessage);
    }

    return response.json();
  },

  getAllCandidates: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/${userId}/getAllCandidates`, {
      credentials: "include",
    });
    if (!response.ok) {
      const errorMessage = await parseErrorResponse(response, "Failed to fetch candidates");
      throw new Error(errorMessage);
    }
    return response.json();
  },

  getCandidateById: async (userId: string, candidateId: string) => {
    const response = await fetch(`${API_BASE_URL}/${userId}/${candidateId}/getCandidateById`, {
      credentials: "include",
    });
    if (!response.ok) {
      const errorMessage = await parseErrorResponse(response, "Failed to fetch candidate details");
      throw new Error(errorMessage);
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
      const errorMessage = await parseErrorResponse(response, "Failed to update candidate");
      throw new Error(errorMessage);
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
      const errorMessage = await parseErrorResponse(response, "Failed to update candidate status");
      throw new Error(errorMessage);
    }

    return response.json();
  },

  deleteCandidateById: async (userId: string, candidateId: string) => {
    const response = await fetch(`${API_BASE_URL}/${userId}/${candidateId}/deleteCandidateById`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!response.ok) {
      const errorMessage = await parseErrorResponse(response, "Failed to delete candidate");
      throw new Error(errorMessage);
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
      const errorMessage = await parseErrorResponse(response, "Failed to delete selected candidates");
      throw new Error(errorMessage);
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
      const errorMessage = await parseErrorResponse(response, "Failed to archive recruitment data");
      throw new Error(errorMessage);
    }
    return response.json();
  },

  getPublicQuestions: async () => {
    const response = await fetch(`${API_BASE_URL}/questions`);
    if (!response.ok) {
      const errorMessage = await parseErrorResponse(response, "Failed to fetch recruitment questions");
      throw new Error(errorMessage);
    }
    return response.json();
  },

  getAdminQuestions: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/${userId}/adminQuestions`, {
      credentials: "include",
    });
    if (!response.ok) {
      const errorMessage = await parseErrorResponse(response, "Failed to fetch questions");
      throw new Error(errorMessage);
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
      const errorMessage = await parseErrorResponse(response, "Failed to create question");
      throw new Error(errorMessage);
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
      const errorMessage = await parseErrorResponse(response, "Failed to update question");
      throw new Error(errorMessage);
    }
    return response.json();
  },

  deleteQuestion: async (userId: string, questionId: string) => {
    const response = await fetch(`${API_BASE_URL}/${userId}/${questionId}/deleteQuestion`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!response.ok) {
      const errorMessage = await parseErrorResponse(response, "Failed to delete question");
      throw new Error(errorMessage);
    }
    return response.json();
  },

  getPublicResults: async () => {
    const response = await fetch(`${API_BASE_URL}/results`);
    if (!response.ok) {
      const errorMessage = await parseErrorResponse(response, "Failed to fetch public recruitment results");
      throw new Error(errorMessage);
    }
    return response.json();
  },
};

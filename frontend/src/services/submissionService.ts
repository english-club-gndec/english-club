const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface SubmissionData {
  student_name: string;
  student_class: string;
  student_urn: string;
  student_crn: string;
  student_email: string;
  title: string;
  description: string;
  body: string;
  image_url: string;
  tags: string[];
}

export interface Submission {
  submission_id: string;
  student_name: string;
  student_class: string;
  student_urn: string;
  student_crn?: string;
  student_email: string;
  title: string;
  description: string;
  body: string;
  image_url?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELETED' | 'REQUESTED_CHANGE';
  rejection_reason?: string;
  edit_token?: string;
  tags: string[];
  submitted_at: string;
}

export const submissionService = {
  createSubmission: async (data: SubmissionData) => {
    try {
      const response = await fetch(`${BASE_URL}/submission`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to create submission:', error);
      throw error;
    }
  },

  getApprovedSubmissions: async (): Promise<Submission[]> => {
    try {
      const response = await fetch(`${BASE_URL}/submission/approved`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get approved submissions:', error);
      throw error;
    }
  },

  getAllSubmissions: async (): Promise<Submission[]> => {
    try {
      const response = await fetch(`${BASE_URL}/submission`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get all submissions:', error);
      throw error;
    }
  },

  getSubmissionByToken: async (submissionId: string, editToken: string): Promise<Submission> => {
    try {
      const response = await fetch(`${BASE_URL}/submission/${submissionId}/${editToken}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get submission by token:', error);
      throw error;
    }
  },

  updateSubmissionStatus: async (
    submissionId: string,
    userId: string,
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELETED' | 'REQUESTED_CHANGE',
    rejectionReason?: string
  ): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/submission/${submissionId}/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status,
          rejection_reason: rejectionReason || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to update submission status:', error);
      throw error;
    }
  },

  editSubmissionByStudent: async (
    submissionId: string,
    editToken: string,
    data: SubmissionData
  ): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/submission/${submissionId}/${editToken}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to edit submission by student:', error);
      throw error;
    }
  },

  deleteSubmission: async (submissionId: string): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/submission/${submissionId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to delete submission:', error);
      throw error;
    }
  },

  validateEmail: async (email: string): Promise<{ valid: boolean; error?: string }> => {
    try {
      const response = await fetch(`${BASE_URL}/submission/validate-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        return { valid: false, error: errorData.error || 'Invalid email address' };
      }
      return await response.json();
    } catch (error) {
      return { valid: false, error: 'Could not verify email server' };
    }
  }
};

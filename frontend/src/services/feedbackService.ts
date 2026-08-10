const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface FeedbackData {
  event_id: number;
  overall_rating: number;
  organization_rating?: number;
  content_quality_rating?: number;
  highlights?: string;
  improvements?: string;
  additional_comments?: string;
  would_recommend?: boolean;
}

export interface FeedbackStats {
  totalResponses: number;
  avgOverallRating: number;
  avgOrganizationRating: number;
  avgContentQualityRating: number;
  recommendationRate: number;
  feedbacks: Array<{
    feedback_id: string;
    event_id: number;
    overall_rating: number;
    organization_rating: number | null;
    content_quality_rating: number | null;
    highlights: string | null;
    improvements: string | null;
    additional_comments: string | null;
    would_recommend: boolean;
    created_at: string;
  }>;
}

export const feedbackService = {
  submitFeedback: async (data: FeedbackData) => {
    try {
      const response = await fetch(`${BASE_URL}/feedback`, {
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
      console.error('Failed to submit feedback:', error);
      throw error;
    }
  },

  getEventFeedback: async (eventId: number): Promise<FeedbackStats> => {
    try {
      const response = await fetch(`${BASE_URL}/feedback/event/${eventId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch event feedback:', error);
      throw error;
    }
  }
};

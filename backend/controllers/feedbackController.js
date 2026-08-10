const supabase = require('../config/supabase');

const feedbackController = {
  // POST /api/feedback - Submit feedback for an event
  submitFeedback: async (req, res) => {
    try {
      const {
        event_id,
        overall_rating,
        organization_rating,
        content_quality_rating,
        highlights,
        improvements,
        additional_comments,
        would_recommend
      } = req.body;

      if (!event_id) {
        return res.status(400).json({ error: 'event_id is required' });
      }

      if (!overall_rating || overall_rating < 1 || overall_rating > 5) {
        return res.status(400).json({ error: 'overall_rating is required and must be between 1 and 5' });
      }

      const { data, error } = await supabase
        .from('feedback')
        .insert([
          {
            event_id,
            overall_rating,
            organization_rating: organization_rating || null,
            content_quality_rating: content_quality_rating || null,
            highlights: highlights || null,
            improvements: improvements || null,
            additional_comments: additional_comments || null,
            would_recommend: would_recommend !== undefined ? would_recommend : true
          }
        ])
        .select();

      if (error) throw error;

      res.status(201).json({
        message: 'Feedback submitted successfully',
        feedback: data[0]
      });
    } catch (err) {
      console.error('Error submitting feedback:', err.message);
      res.status(500).json({ error: err.message });
    }
  },

  // GET /api/feedback/event/:event_id - Get feedback analytics and entries for an event
  getEventFeedback: async (req, res) => {
    try {
      const { event_id } = req.params;

      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('event_id', event_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const totalResponses = data.length;

      if (totalResponses === 0) {
        return res.json({
          totalResponses: 0,
          avgOverallRating: 0,
          avgOrganizationRating: 0,
          avgContentQualityRating: 0,
          recommendationRate: 0,
          feedbacks: []
        });
      }

      const sumOverall = data.reduce((acc, curr) => acc + (curr.overall_rating || 0), 0);
      
      const orgRatings = data.filter(d => d.organization_rating != null);
      const sumOrg = orgRatings.reduce((acc, curr) => acc + curr.organization_rating, 0);

      const contentRatings = data.filter(d => d.content_quality_rating != null);
      const sumContent = contentRatings.reduce((acc, curr) => acc + curr.content_quality_rating, 0);

      const recommendedCount = data.filter(d => d.would_recommend === true).length;

      const stats = {
        totalResponses,
        avgOverallRating: Number((sumOverall / totalResponses).toFixed(1)),
        avgOrganizationRating: orgRatings.length > 0 ? Number((sumOrg / orgRatings.length).toFixed(1)) : 0,
        avgContentQualityRating: contentRatings.length > 0 ? Number((sumContent / contentRatings.length).toFixed(1)) : 0,
        recommendationRate: Math.round((recommendedCount / totalResponses) * 100),
        feedbacks: data
      };

      res.json(stats);
    } catch (err) {
      console.error('Error fetching event feedback:', err.message);
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = feedbackController;

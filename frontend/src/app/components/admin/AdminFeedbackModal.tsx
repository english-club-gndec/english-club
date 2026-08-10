import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Star, ThumbsUp, Loader2, MessageSquare, TrendingUp, Sparkles, Award } from "lucide-react";
import { feedbackService, FeedbackStats } from "../../../services/feedbackService";
import { toast } from "sonner";

interface AdminFeedbackModalProps {
  eventId: number;
  eventName: string;
  onClose: () => void;
}

export function AdminFeedbackModal({ eventId, eventName, onClose }: AdminFeedbackModalProps) {
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'highlights' | 'improvements' | 'comments'>('all');

  useEffect(() => {
    fetchFeedback();
  }, [eventId]);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const data = await feedbackService.getEventFeedback(eventId);
      setStats(data);
    } catch (error: any) {
      toast.error("Failed to load feedback results");
    } finally {
      setLoading(false);
    }
  };

  const getRatingBadge = (rating: number) => {
    if (rating >= 4.5) return { label: "GOATed 🐐", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" };
    if (rating >= 3.5) return { label: "Banger 🔥", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" };
    if (rating >= 2.5) return { label: "Valid 😐", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" };
    return { label: "Needs Help 💀", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" };
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-4xl w-full my-auto overflow-hidden shadow-2xl relative"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-950 via-indigo-900 to-slate-900 p-6 text-white relative flex items-center justify-between border-b border-gray-800">
            <div>
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-widest mb-1">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Event Feedback Analytics
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {eventName}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center transition-all"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Fetching feedback analytics...</p>
            </div>
          ) : !stats || stats.totalResponses === 0 ? (
            <div className="py-20 text-center px-6">
              <div className="w-16 h-16 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                No Feedback Yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
                No participants have submitted feedback for this event yet. Check back once attendees start rating!
              </p>
            </div>
          ) : (
            <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto space-y-6">
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total Responses */}
                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 flex flex-col justify-between">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Responses</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats.totalResponses}</span>
                    <span className="text-xs text-purple-500 font-medium">entries</span>
                  </div>
                </div>

                {/* Overall Rating */}
                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 flex flex-col justify-between">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Overall Rating</span>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats.avgOverallRating}</span>
                      <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${getRatingBadge(stats.avgOverallRating).color}`}>
                      {getRatingBadge(stats.avgOverallRating).label}
                    </span>
                  </div>
                </div>

                {/* Organization Rating */}
                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 flex flex-col justify-between">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Organization</span>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats.avgOrganizationRating || 'N/A'}</span>
                    <Star className="w-5 h-5 text-blue-400 fill-blue-400" />
                  </div>
                </div>

                {/* Recommendation Rate */}
                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 flex flex-col justify-between">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recommend Rate</span>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{stats.recommendationRate}%</span>
                    <ThumbsUp className="w-5 h-5 text-emerald-500" />
                  </div>
                </div>
              </div>

              {/* Progress Bars for Detailed Ratings */}
              <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700/60 space-y-4">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  Rating Averages Breakdown
                </h4>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div>
                    <div className="flex justify-between font-semibold mb-1 text-gray-700 dark:text-gray-300">
                      <span>Overall Satisfaction</span>
                      <span>{stats.avgOverallRating} / 5</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: `${(stats.avgOverallRating / 5) * 100}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-1 text-gray-700 dark:text-gray-300">
                      <span>Event Organization</span>
                      <span>{stats.avgOrganizationRating} / 5</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(stats.avgOrganizationRating / 5) * 100}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-1 text-gray-700 dark:text-gray-300">
                      <span>Content & Activity Quality</span>
                      <span>{stats.avgContentQualityRating} / 5</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${(stats.avgContentQualityRating / 5) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Qualitative Responses Tabs */}
              <div>
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3 mb-4">
                  <h4 className="text-base font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Attendee Responses
                  </h4>
                  <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                    <button
                      onClick={() => setActiveTab('all')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === 'all' ? 'bg-white dark:bg-gray-700 text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                      All ({stats.feedbacks.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('highlights')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === 'highlights' ? 'bg-white dark:bg-gray-700 text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                      Highlights 🌟
                    </button>
                    <button
                      onClick={() => setActiveTab('improvements')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === 'improvements' ? 'bg-white dark:bg-gray-700 text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                      Improvements 🛠️
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {stats.feedbacks
                    .filter(item => {
                      if (activeTab === 'highlights') return !!item.highlights;
                      if (activeTab === 'improvements') return !!item.improvements;
                      return true;
                    })
                    .map((item, idx) => (
                      <div
                        key={item.feedback_id || idx}
                        className="p-5 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/80 shadow-sm space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/50 pb-2.5">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-gray-400">#{stats.feedbacks.length - idx}</span>
                            <div className="flex items-center gap-1 bg-amber-400/10 px-2.5 py-1 rounded-md text-amber-600 dark:text-amber-400 font-bold text-xs">
                              <Star className="w-3.5 h-3.5 fill-amber-400" />
                              <span>{item.overall_rating}/5</span>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.would_recommend ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                              {item.would_recommend ? 'Would Recommend 🔥' : 'Would Not Recommend 👻'}
                            </span>
                          </div>
                          <span className="text-[11px] text-gray-400">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        {item.highlights && (
                          <div>
                            <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block mb-0.5">🌟 Highlights:</span>
                            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 bg-purple-500/5 dark:bg-purple-500/10 p-3 rounded-xl border border-purple-500/10">
                              "{item.highlights}"
                            </p>
                          </div>
                        )}

                        {item.improvements && (
                          <div>
                            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-0.5">🛠️ Improvements:</span>
                            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 bg-amber-500/5 dark:bg-amber-500/10 p-3 rounded-xl border border-amber-500/10">
                              "{item.improvements}"
                            </p>
                          </div>
                        )}

                        {item.additional_comments && (
                          <div>
                            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-0.5">💬 Comments:</span>
                            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 bg-blue-500/5 dark:bg-blue-500/10 p-3 rounded-xl border border-blue-500/10">
                              "{item.additional_comments}"
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

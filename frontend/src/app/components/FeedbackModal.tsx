import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Star, Send, Sparkles, CheckCircle2, MessageSquareHeart, Loader2 } from "lucide-react";

import { toast } from "sonner";
import { feedbackService } from "../../services/feedbackService";

interface FeedbackModalProps {
  eventId: number;
  eventName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function FeedbackModal({ eventId, eventName, onClose, onSuccess }: FeedbackModalProps) {
  const [overallRating, setOverallRating] = useState<number>(0);
  const [organizationRating, setOrganizationRating] = useState<number>(0);
  const [contentQualityRating, setContentQualityRating] = useState<number>(0);
  const [highlights, setHighlights] = useState("");
  const [improvements, setImprovements] = useState("");
  const [additionalComments, setAdditionalComments] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const overallLabels: Record<number, string> = {
    1: "💀 Total L",
    2: "😬 Mid ngl",
    3: "😐 Valid",
    4: "🔥 Banger",
    5: "🐐 GOATed"
  };

  const orgLabels: Record<number, string> = {
    1: "🤡 Circus",
    2: "🫠 Chaos",
    3: "🆗 Decent",
    4: "⚡ Smooth",
    5: "🧠 Mastermind"
  };

  const contentLabels: Record<number, string> = {
    1: "😴 Snooze",
    2: "📉 Aura lost",
    3: "🛋️ Passed vibe",
    4: "⚡ High key",
    5: "✨ Peak fiction"
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overallRating) {
      toast.error("Please give an overall rating before submitting!");
      return;
    }

    setIsSubmitting(true);
    try {
      await feedbackService.submitFeedback({
        event_id: eventId,
        overall_rating: overallRating,
        organization_rating: organizationRating || undefined,
        content_quality_rating: contentQualityRating || undefined,
        highlights: highlights.trim() || undefined,
        improvements: improvements.trim() || undefined,
        additional_comments: additionalComments.trim() || undefined,
        would_recommend: wouldRecommend
      });

      setIsSubmitted(true);
      toast.success("Feedback submitted! Thanks for keeping it real ✨");
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit feedback. Try again!");
    } finally {
      setIsSubmitting(false);
    }
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
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-2xl w-full my-auto overflow-hidden shadow-2xl relative"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center transition-all"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-widest mb-1">
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
              Anonymous Feedback
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {eventName}
            </h2>
            <p className="text-purple-200/80 text-xs sm:text-sm mt-1" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              Spill the tea! Your response is 100% anonymous & keeps our events GOATed.
            </p>
          </div>

          {isSubmitted ? (
            <div className="p-10 text-center flex flex-col items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-20 h-20 rounded-full bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4"
              >
                <CheckCircle2 className="w-12 h-12" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Aura Saved +1000 ✨
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm max-w-md mb-6" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                Your feedback has been received! We appreciate you taking the time to help us cook better events.
              </p>
              <button
                onClick={onClose}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-sm hover:shadow-lg transition-all"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Overall Rating */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  1. On a scale of 'cooked' to 'absolute cinema', how was the event? <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setOverallRating(star)}
                      className={`p-2 sm:p-3 rounded-2xl border transition-all flex flex-col items-center justify-center text-center ${
                        overallRating >= star
                          ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/20 scale-[1.02]'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700 hover:border-purple-300'
                      }`}
                    >
                      <Star className={`w-5 h-5 sm:w-6 sm:h-6 mb-1 ${overallRating >= star ? 'fill-white' : ''}`} />
                      <span className="text-[10px] sm:text-xs font-bold leading-tight">{overallLabels[star]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Organization Rating */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  2. Did the organizers cook or was it chaos?
                </label>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setOrganizationRating(star)}
                      className={`p-2 sm:p-2.5 rounded-xl border transition-all flex flex-col items-center justify-center text-center ${
                        organizationRating >= star
                          ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20 scale-[1.02]'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700 hover:border-blue-300'
                      }`}
                    >
                      <Star className={`w-5 h-5 mb-1 ${organizationRating >= star ? 'fill-white' : ''}`} />
                      <span className="text-[10px] sm:text-xs font-bold leading-tight">{orgLabels[star]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Quality Rating */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  3. Was the content giving main character energy or bore snore?
                </label>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setContentQualityRating(star)}
                      className={`p-2 sm:p-2.5 rounded-xl border transition-all flex flex-col items-center justify-center text-center ${
                        contentQualityRating >= star
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20 scale-[1.02]'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                      }`}
                    >
                      <Star className={`w-5 h-5 mb-1 ${contentQualityRating >= star ? 'fill-white' : ''}`} />
                      <span className="text-[10px] sm:text-xs font-bold leading-tight">{contentLabels[star]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Highlights (Option 2: Lighter GenZ) */}
              <div className="space-y-1.5">
                <label htmlFor="highlights" className="block text-sm font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  4. Best moment? 🌟 What hit different for you?
                </label>
                <textarea
                  id="highlights"
                  rows={2}
                  value={highlights}
                  onChange={(e) => setHighlights(e.target.value)}
                  placeholder="Share what you enjoyed most about the session..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  style={{ fontFamily: 'Open Sans, sans-serif' }}
                />
              </div>

              {/* Improvements (Option 2: Lighter GenZ) */}
              <div className="space-y-1.5">
                <label htmlFor="improvements" className="block text-sm font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  5. Room for improvement 🛠️ What didn't quite hit the mark?
                </label>
                <textarea
                  id="improvements"
                  rows={2}
                  value={improvements}
                  onChange={(e) => setImprovements(e.target.value)}
                  placeholder="Timing, venue, content — let us know what needed work..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  style={{ fontFamily: 'Open Sans, sans-serif' }}
                />
              </div>

              {/* Additional Comments */}
              <div className="space-y-1.5">
                <label htmlFor="additionalComments" className="block text-sm font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  6. Any other suggestions or future event ideas?
                </label>
                <textarea
                  id="additionalComments"
                  rows={2}
                  value={additionalComments}
                  onChange={(e) => setAdditionalComments(e.target.value)}
                  placeholder="Drop your ideas for the next club event..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  style={{ fontFamily: 'Open Sans, sans-serif' }}
                />
              </div>

              {/* Would Recommend */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  7. Would you drag your bestie to our next event?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setWouldRecommend(true)}
                    className={`py-3 px-4 rounded-xl border font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                      wouldRecommend === true
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <span>Fr fr, we pullin up! 🔥</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWouldRecommend(false)}
                    className={`py-3 px-4 rounded-xl border font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                      wouldRecommend === false
                        ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-500/20'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <span>Nah, ghosting 👻</span>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 rounded-xl border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-sm hover:shadow-xl hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Cooking feedback...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Before Aura Drop ✨</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

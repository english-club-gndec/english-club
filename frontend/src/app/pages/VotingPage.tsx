import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, User, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { votingService, AwardParticipant, AwardSettings } from "../../services/votingService";

export function VotingPage() {
  const [participants, setParticipants] = useState<AwardParticipant[]>([]);
  const [settings, setSettings] = useState<AwardSettings | null>(null);
  const [voterName, setVoterName] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const [pData, sData] = await Promise.all([
          votingService.getParticipants(),
          votingService.getSettings()
        ]);
        setParticipants(pData);
        setSettings(sData);

        // Simple device identifier using fingerprint (in real app, use more robust method)
        const deviceId = localStorage.getItem('voting_device_id') || 
                         Math.random().toString(36).substring(2, 15);
        if (!localStorage.getItem('voting_device_id')) {
          localStorage.setItem('voting_device_id', deviceId);
        }

        const alreadyVoted = await votingService.checkIfVoted(deviceId);
        setHasVoted(alreadyVoted);
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voterName || !selectedId) {
      toast.error("Please fill all fields");
      return;
    }

    if (!settings?.is_active) {
      toast.error("Voting is currently closed");
      return;
    }

    try {
      setIsSubmitting(true);
      const deviceId = localStorage.getItem('voting_device_id')!;
      await votingService.submitVote(selectedId, voterName, deviceId);
      setHasVoted(true);
      toast.success("Vote Submitted Successfully 🎉");
    } catch (error) {
      toast.error("Failed to submit vote. You may have already voted.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 selection:bg-purple-500/30 overflow-hidden relative">
      <Toaster position="top-center" />
      
      {/* Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            x: [0, -50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-24 -right-24 w-[500px] h-[500px] bg-purple-600/10 blur-[100px] rounded-full"
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 mb-6"
          >
            <Trophy className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-wider">English Club Presents</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl text-gray-900 dark:text-white mb-6"
            style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800 }}
          >
            People's Choice <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Awards 🏆</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-400 max-w-xl mx-auto"
            style={{ fontFamily: 'Open Sans, sans-serif' }}
          >
            Your voice matters. Vote for your favorite participant and help them win the most prestigious award of the year.
          </motion.p>
        </div>

        {/* Voting Form Card */}
        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-[2.5rem] shadow-2xl p-8 md:p-12"
          >
            <AnimatePresence mode="wait">
              {hasVoted ? (
                <motion.div
                  key="voted"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-10"
                >
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-3xl text-gray-900 dark:text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                    Vote Submitted! 🎉
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Thank you for participating. You have already cast your vote from this device.
                  </p>
                  <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 flex items-center gap-3 text-sm text-blue-700 dark:text-blue-400">
                    <AlertCircle className="w-5 h-5" />
                    <span>Each device can vote only once to ensure fairness.</span>
                  </div>
                </motion.div>
              ) : !settings?.is_active ? (
                <motion.div
                  key="closed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-10"
                >
                  <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                  </div>
                  <h2 className="text-3xl text-gray-900 dark:text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                    Voting Closed
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    The voting period has ended or has not started yet. Please check back later or wait for the live ceremony!
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleSubmit}
                  className="space-y-8"
                >
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 ml-2 uppercase tracking-widest">
                      Full Name
                    </label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                      <input
                        type="text"
                        value={voterName}
                        onChange={(e) => setVoterName(e.target.value)}
                        required
                        placeholder="Enter your name"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 ml-2 uppercase tracking-widest">
                      Choose Participant
                    </label>
                    <div className="grid grid-cols-1 gap-4">
                      {participants.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedId(p.id)}
                          className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                            selectedId === p.id 
                              ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20" 
                              : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
                          }`}
                        >
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden border-2 border-white dark:border-gray-900 shadow-sm">
                            {p.image_url ? (
                              <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              p.name.charAt(0)
                            )}
                          </div>
                          <span className="flex-1 font-semibold text-gray-900 dark:text-white">{p.name}</span>
                          {selectedId === p.id && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                              <CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </motion.div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      "Cast Your Vote"
                    )}
                  </button>

                  <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                    Each device can vote only once. All votes are anonymous and secure.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="mt-20 pt-8 border-t border-gray-100 dark:border-gray-900 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <img src="/images/logo.png" alt="Logo" className="w-8 h-8 rounded-full" />
            <span className="font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>English Club</span>
          </div>
          <p className="text-sm text-gray-500">© 2026 People's Choice Awards. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

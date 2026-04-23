import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Trophy, 
  Users, 
  Clock, 
  BarChart3, 
  Plus, 
  Trash2, 
  Play, 
  Square, 
  Timer,
  Activity,
  UserPlus,
  Loader2,
  TrendingUp,
  Image as ImageIcon,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { votingService, AwardParticipant, AwardSettings } from "../../../services/votingService";
import { supabase } from "../../../lib/supabase";

export function AdminPeoplesChoice() {
  const [participants, setParticipants] = useState<AwardParticipant[]>([]);
  const [settings, setSettings] = useState<AwardSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newParticipantName, setNewParticipantName] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [timeLeft, setTimeLeft] = useState<string>("00:00:00");

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pData, sData, votes] = await Promise.all([
          votingService.getParticipants(),
          votingService.getSettings(),
          votingService.getVoteCounts()
        ]);
        
        const participantsWithVotes = pData.map(p => ({
          ...p,
          vote_count: votes[p.id] || 0
        }));
        
        setParticipants(participantsWithVotes);
        setSettings(sData);
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    // Subscribe to realtime votes
    const channel = supabase
      .channel('realtime_votes')
      .on(
        'postgres_changes' as any, 
        { event: 'INSERT', schema: 'public', table: 'award_votes' }, 
        async () => {
          // Refresh vote counts
          const votes = await votingService.getVoteCounts();
          setParticipants(prev => prev.map(p => ({
            ...p,
            vote_count: votes[p.id] || 0
          })));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Timer Logic
  useEffect(() => {
    if (!settings?.end_time || !settings.is_active) {
      setTimeLeft("00:00:00");
      return;
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(settings.end_time!).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("00:00:00");
        clearInterval(interval);
        if (settings.is_active) {
           handleStopVoting();
        }
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        const seconds = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
        setTimeLeft(`${hours}:${minutes}:${seconds}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [settings]);

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParticipantName) return;
    try {
      const added = await votingService.addParticipant(newParticipantName);
      setParticipants([...participants, { ...added, vote_count: 0 }]);
      setNewParticipantName("");
      setIsAddModalOpen(false);
      toast.success("Participant added successfully");
    } catch (error) {
      toast.error("Failed to add participant");
    }
  };

  const handleDeleteParticipant = async (id: string) => {
    if (!confirm("Are you sure? This will remove all their votes too.")) return;
    try {
      await votingService.deleteParticipant(id);
      setParticipants(participants.filter(p => p.id !== id));
      toast.success("Participant removed");
    } catch (error) {
      toast.error("Failed to delete participant");
    }
  };

  const handleStartVoting = async () => {
    try {
      // Use custom duration from state
      const endTime = new Date(Date.now() + durationMinutes * 60000).toISOString();
      const updated = await votingService.updateSettings({ 
        is_active: true, 
        start_time: new Date().toISOString(),
        end_time: endTime
      });
      setSettings(updated);
      toast.success(`Voting started for ${durationMinutes} minutes! 🚀`);
    } catch (error) {
      toast.error("Failed to start voting");
    }
  };

  const handleStopVoting = async () => {
    try {
      const updated = await votingService.updateSettings({ is_active: false });
      setSettings(updated);
      toast.success("Voting stopped");
    } catch (error) {
      toast.error("Failed to stop voting");
    }
  };

  const sortedParticipants = useMemo(() => {
    return [...participants].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
  }, [participants]);

  const totalVotes = participants.reduce((sum, p) => sum + (p.vote_count || 0), 0);
  const leadingParticipant = sortedParticipants[0];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl text-gray-900 dark:text-white mb-2 flex items-center gap-3" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800 }}>
            <Trophy className="w-10 h-10 text-yellow-500" />
            People's Choice Awards
          </h1>
          <p className="text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>
            Live voting monitor and control panel
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white dark:bg-gray-900 p-2 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-2 px-4 py-2">
            <div className={`w-3 h-3 rounded-full ${settings?.is_active ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
              {settings?.is_active ? 'LIVE UPDATES ENABLED' : 'VOTING CLOSED'}
            </span>
          </div>
          <div className="h-8 w-px bg-gray-200 dark:bg-gray-800" />
          <div className="flex items-center gap-3 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
            <Timer className="w-5 h-5 text-purple-600" />
            <span className="text-xl font-mono font-bold text-purple-700 dark:text-purple-400">
              {timeLeft}
            </span>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Live Vote Graph Section (Centerpiece) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[2rem] p-8 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingUp className="w-32 h-32 text-purple-600" />
             </div>
             
             <div className="flex items-center justify-between mb-10 relative z-10">
                <div>
                   <h3 className="text-2xl text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>Live Vote Distribution</h3>
                   <p className="text-sm text-gray-500">Real-time standings of all participants</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-2">
                   <Activity className="w-4 h-4 text-green-500" />
                   <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-tighter">Syncing with Supabase</span>
                </div>
             </div>

             <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={participants} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 600 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                    />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ 
                        backgroundColor: '#111827', 
                        border: 'none', 
                        borderRadius: '12px',
                        color: '#fff',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="vote_count" 
                      radius={[10, 10, 0, 0]} 
                      barSize={40}
                      animationDuration={1500}
                    >
                      {participants.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.id === leadingParticipant?.id ? '#7C3AED' : '#1E3A8A'} 
                          fillOpacity={0.8}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Manage Participants Section */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[2rem] p-8 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>Manage Participants</h3>
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-900 to-purple-700 text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="text-sm font-bold">Add Participant</span>
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {participants.map(p => (
                  <motion.div 
                    key={p.id}
                    layout
                    className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-purple-500/50 transition-all group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-700 dark:text-purple-400 font-bold text-xl overflow-hidden">
                       {p.image_url ? <img src={p.image_url} className="w-full h-full object-cover" /> : p.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                       <h4 className="font-bold text-gray-900 dark:text-white">{p.name}</h4>
                       <p className="text-xs text-gray-500">{p.vote_count} votes so far</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteParticipant(p.id)}
                      className="p-3 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))}
             </div>
          </div>
        </div>

        {/* Sidebar Controls & Stats */}
        <div className="space-y-8">
          
          {/* Voting Control Panel */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[2rem] p-8 shadow-sm">
             <h3 className="text-xl text-gray-900 dark:text-white mb-6" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>Control Panel</h3>
             
             <div className="space-y-4">
                <div className={`p-6 rounded-3xl flex flex-col gap-4 border ${settings?.is_active ? 'bg-green-50 border-green-100 dark:bg-green-900/10 dark:border-green-900/30' : 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30'}`}>
                   <div className="flex items-center justify-between">
                      <span className="text-sm font-bold uppercase tracking-widest text-gray-500">Status</span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${settings?.is_active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        {settings?.is_active ? 'Active' : 'Closed'}
                      </span>
                   </div>
                   <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {settings?.is_active 
                        ? 'Voting is currently live. Participants can cast their votes from the public portal.' 
                        : 'Voting is closed. No new votes can be submitted until you start a new session.'}
                   </p>
                </div>

                <div className="grid grid-cols-1 gap-3 pt-4">
                   {!settings?.is_active && (
                     <div className="mb-4">
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Session Duration (Minutes)</label>
                        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800 focus-within:border-purple-500/50 transition-all">
                           <input 
                             type="number" 
                             min="1"
                             max="1440"
                             value={durationMinutes}
                             onChange={(e) => setDurationMinutes(Number(e.target.value))}
                             className="flex-1 bg-transparent border-none outline-none px-4 py-2 font-bold text-gray-900 dark:text-white"
                           />
                           <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-xs font-bold text-purple-600">
                              MINS
                           </div>
                        </div>
                     </div>
                   )}
                   
                   {settings?.is_active ? (
                     <button 
                       onClick={handleStopVoting}
                       className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold hover:bg-red-200 transition-all border border-red-200 dark:border-red-900/30"
                     >
                       <Square className="w-5 h-5" />
                       Stop Voting Session
                     </button>
                   ) : (
                     <button 
                       onClick={handleStartVoting}
                       className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all"
                     >
                       <Play className="w-5 h-5" />
                       Start Live Voting
                     </button>
                   )}
                </div>
             </div>
          </div>

          {/* Analytics Panel */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[2rem] p-8 shadow-sm">
             <h3 className="text-xl text-gray-900 dark:text-white mb-6" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>Quick Analytics</h3>
             
             <div className="space-y-6">
                <div className="flex items-center justify-between p-5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                   <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Votes</p>
                      <h4 className="text-3xl font-bold text-gray-900 dark:text-white">{totalVotes}</h4>
                   </div>
                   <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                      <TrendingUp className="w-6 h-6" />
                   </div>
                </div>

                <div>
                   <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Top 3 Standings</p>
                   <div className="space-y-3">
                      {sortedParticipants.slice(0, 3).map((p, i) => (
                        <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 shadow-sm">
                           <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-700' : 'bg-orange-100 text-orange-700'}`}>
                              {i + 1}
                           </div>
                           <span className="flex-1 font-bold text-sm text-gray-900 dark:text-white truncate">{p.name}</span>
                           <span className="text-sm font-black text-purple-600">{((p.vote_count || 0) / (totalVotes || 1) * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                   <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <p className="text-xs leading-relaxed font-semibold">
                         The graph and counters update automatically as soon as a vote is cast. No refresh required.
                      </p>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>

      {/* Add Participant Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
            onClick={() => setIsAddModalOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                    <UserPlus className="w-6 h-6" />
                 </div>
                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>New Participant</h2>
              </div>

              <form onSubmit={handleAddParticipant} className="space-y-6">
                 <div>
                    <label className="block text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-3 ml-1">Name</label>
                    <input 
                      type="text" 
                      autoFocus
                      value={newParticipantName}
                      onChange={e => setNewParticipantName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 focus:border-purple-500 focus:bg-white dark:focus:bg-gray-900 transition-all outline-none text-gray-900 dark:text-white font-semibold"
                    />
                 </div>

                 <div>
                    <label className="block text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-3 ml-1">Avatar (Optional)</label>
                    <div className="w-full h-32 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400 hover:text-purple-500 hover:border-purple-500 transition-all cursor-pointer">
                       <ImageIcon className="w-8 h-8 mb-2" />
                       <span className="text-xs font-bold">Coming Soon</span>
                    </div>
                 </div>

                 <div className="flex gap-4 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setIsAddModalOpen(false)}
                      className="flex-1 py-4 rounded-2xl text-gray-500 font-bold hover:bg-gray-100 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all"
                    >
                      Save
                    </button>
                 </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

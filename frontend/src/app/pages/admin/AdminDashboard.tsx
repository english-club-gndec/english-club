import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Users, Calendar, ClipboardList, TrendingUp, UserPlus, FileText } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "../../../lib/supabase";

export function AdminDashboard() {
  const [statsData, setStatsData] = useState({
    totalMembers: 0,
    totalEvents: 0,
    avgParticipants: 0,
  });
  const [engagementData, setEngagementData] = useState<{ name: string; users: number }[]>([]);

  useEffect(() => {
    async function fetchStats() {
      // Fetch Total Members
      const { count: usersCount } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });

      // Fetch Total Events
      const { count: eventsCount } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true });

      // Fetch Total Participants and unique events for average
      const { data: participantsData } = await supabase
        .from("participants")
        .select("registered_event");

      const totalParticipants = participantsData?.length || 0;
      const uniqueEventsWithParticipants = new Set(participantsData?.map(p => p.registered_event)).size || 1;
      const avg = totalParticipants / uniqueEventsWithParticipants;

      // Fetch Events with Participant Counts for the chart
      const { data: eventsWithParticipants, error: eventsError } = await supabase
        .from("events")
        .select(`
          event_name,
          participants:participants(count)
        `)
        .order("created_at", { ascending: false })
        .limit(7);

      if (eventsWithParticipants && !eventsError) {
        const chartData = eventsWithParticipants.map((event: any) => ({
          name: event.event_name.length > 10 ? event.event_name.substring(0, 10) + "..." : event.event_name,
          users: event.participants[0]?.count || 0
        })).reverse(); // Reverse to show chronological order if sorted by descending
        setEngagementData(chartData);
      }

      setStatsData({
        totalMembers: usersCount || 0,
        totalEvents: eventsCount || 0,
        avgParticipants: parseFloat(avg.toFixed(1)),
      });
    }

    fetchStats();
  }, []);

  const stats = [
    { label: "Total Members", value: statsData.totalMembers.toString(), change: "+12%", icon: Users, color: "from-blue-500 to-blue-600" },
    { label: "Total Events", value: statsData.totalEvents.toString(), change: "+8%", icon: Calendar, color: "from-purple-500 to-purple-600" },
    { label: "Avg Participants", value: statsData.avgParticipants.toString(), change: "+24%", icon: ClipboardList, color: "from-green-500 to-green-600" },
    { label: "Active Users", value: "203", change: "+5%", icon: TrendingUp, color: "from-orange-500 to-orange-600" },
  ];


  const eventData = [
    { name: "Jan", events: 3 },
    { name: "Feb", events: 5 },
    { name: "Mar", events: 4 },
    { name: "Apr", events: 6 },
    { name: "May", events: 5 },
    { name: "Jun", events: 7 },
  ];


  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
          Welcome back, Admin 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>
          Here's what's happening with your English Club today.
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            variants={item}
            className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                {stat.change}
              </span>
            </div>
            <div className="text-3xl text-gray-900 dark:text-white mb-1" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
              {stat.value}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              {stat.label}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 gap-6">
        <motion.div
          className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-xl text-gray-900 dark:text-white mb-6" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
            Event Engagement
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis dataKey="name" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff'
                }}
              />
              <Line type="monotone" dataKey="users" stroke="#7C3AED" strokeWidth={3} dot={{ fill: '#7C3AED', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>


      <motion.div
        className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h2 className="text-xl text-gray-900 dark:text-white mb-6" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
          Recent Activity
        </h2>
        <div className="relative overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-800/50 p-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-20 h-20 bg-gradient-to-br from-blue-900/20 to-purple-700/20 rounded-full flex items-center justify-center mb-6"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </motion.div>
          
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Real-time Activity Feed
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm" style={{ fontFamily: 'Open Sans, sans-serif' }}>
            We're currently building a live synchronization system to track every club activity as it happens.
          </p>
          
          <div className="mt-8 flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            Coming Soon
          </div>
        </div>

      </motion.div>
    </div>
  );
}

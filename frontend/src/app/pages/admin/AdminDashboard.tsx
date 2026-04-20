import { motion } from "motion/react";
import { Users, Calendar, ClipboardList, TrendingUp, UserPlus, FileText } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function AdminDashboard() {
  const stats = [
    { label: "Total Members", value: "248", change: "+12%", icon: Users, color: "from-blue-500 to-blue-600" },
    { label: "Total Events", value: "42", change: "+8%", icon: Calendar, color: "from-purple-500 to-purple-600" },
    { label: "Registrations", value: "186", change: "+24%", icon: ClipboardList, color: "from-green-500 to-green-600" },
    { label: "Active Users", value: "203", change: "+5%", icon: TrendingUp, color: "from-orange-500 to-orange-600" },
  ];

  const engagementData = [
    { name: "Mon", users: 45 },
    { name: "Tue", users: 52 },
    { name: "Wed", users: 48 },
    { name: "Thu", users: 61 },
    { name: "Fri", users: 55 },
    { name: "Sat", users: 38 },
    { name: "Sun", users: 42 },
  ];

  const eventData = [
    { name: "Jan", events: 3 },
    { name: "Feb", events: 5 },
    { name: "Mar", events: 4 },
    { name: "Apr", events: 6 },
    { name: "May", events: 5 },
    { name: "Jun", events: 7 },
  ];

  const recentActivities = [
    { type: "registration", name: "Sarah Wilson", event: "Public Speaking Workshop", time: "2 hours ago", icon: UserPlus },
    { type: "member", name: "James Chen", action: "joined the club", time: "5 hours ago", icon: Users },
    { type: "submission", name: "Emma Davis", action: "submitted an article", time: "1 day ago", icon: FileText },
    { type: "registration", name: "Michael Brown", event: "Creative Writing Competition", time: "1 day ago", icon: UserPlus },
    { type: "member", name: "Olivia Martinez", action: "joined the club", time: "2 days ago", icon: Users },
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

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-xl text-gray-900 dark:text-white mb-6" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
            Weekly Engagement
          </h2>
          <ResponsiveContainer width="100%" height={300}>
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

        <motion.div
          className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-xl text-gray-900 dark:text-white mb-6" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
            Event Participation
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={eventData}>
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
              <Bar dataKey="events" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1E3A8A" />
                  <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
              </defs>
            </BarChart>
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
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-900 to-purple-700 flex items-center justify-center flex-shrink-0">
                <activity.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                  <span className="font-semibold">{activity.name}</span>{" "}
                  {activity.event ? (
                    <>
                      registered for <span className="font-semibold">{activity.event}</span>
                    </>
                  ) : (
                    activity.action
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

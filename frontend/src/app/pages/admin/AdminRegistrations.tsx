import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Search, Filter, Eye, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { registrationService } from "../../../services/registrationService";

interface Registration {
  participant_id: string;
  participant_name: string;
  participant_email: string;
  participant_class: string;
  event_name: string;
  created_at: string;
}

export function AdminRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEvent, setFilterEvent] = useState("all");

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setIsLoading(true);
        const data = await registrationService.getAllParticipants();
        setRegistrations(data);
      } catch (error) {
        toast.error("Failed to fetch registrations");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRegistrations();
  }, []);

  const events = ["all", ...Array.from(new Set(registrations.map(r => r.event_name)))];

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = reg.participant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.participant_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEvent = filterEvent === "all" || reg.event_name === filterEvent;
    return matchesSearch && matchesEvent;
  });



  const totalEvents = events.length - 1;
  const totalParticipants = registrations.length;
  const avgParticipants = totalEvents > 0 ? Math.round(totalParticipants / totalEvents) : 0;

  const summaryStats = [
    { label: "Total Events", value: totalEvents },
    { label: "Total Participants", value: totalParticipants },
    { label: "Avg. Participants", value: avgParticipants },
  ];

  return (
    <>
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
            Registrations
          </h1>
          <p className="text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>
            Manage event registrations and participants
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {summaryStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6"
            >
              <div className="text-3xl text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                {isLoading ? "..." : stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                style={{ fontFamily: 'Open Sans, sans-serif' }}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterEvent}
                onChange={(e) => setFilterEvent(e.target.value)}
                className="pl-12 pr-8 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none"
                style={{ fontFamily: 'Open Sans, sans-serif' }}
              >
                {events.map(event => (
                  <option key={event} value={event}>
                    {event === "all" ? "All Events" : event}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center gap-4 py-20"
                >
                  <div className="relative">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-500"
                    />
                    <Loader2 className="w-8 h-8 text-purple-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin-slow" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 animate-pulse" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                    Loading registrations...
                  </p>
                </motion.div>
              ) : filteredRegistrations.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-20"
                >
                  <p className="text-gray-500 dark:text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                    No registrations found.
                  </p>
                </motion.div>
              ) : (
                <motion.table 
                  key="table"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full"
                >
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider font-bold">Participant</th>
                      <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider font-bold">Class</th>
                      <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider font-bold">Event</th>
                      <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider font-bold">Registered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {filteredRegistrations.map((reg) => (
                      <motion.tr
                        key={reg.participant_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm text-gray-900 dark:text-white font-semibold">
                              {reg.participant_name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {reg.participant_email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {reg.participant_class}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-bold">
                            {reg.event_name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(reg.created_at).toLocaleDateString()}
                          </span>
                        </td>

                      </motion.tr>
                    ))}
                  </tbody>
                </motion.table>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}


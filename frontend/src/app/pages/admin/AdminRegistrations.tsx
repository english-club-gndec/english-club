import { motion } from "motion/react";
import { useState } from "react";
import { Search, Filter, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "sonner";

interface Registration {
  id: number;
  name: string;
  email: string;
  class: string;
  event: string;
  registeredAt: string;
}

export function AdminRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([
    {
      id: 1,
      name: "Sarah Wilson",
      email: "sarah.w@student.edu",
      class: "CSE - 3rd Year",
      event: "Public Speaking Workshop",
      registeredAt: "2026-04-18"
    },
    {
      id: 2,
      name: "James Chen",
      email: "james.c@student.edu",
      class: "ECE - 2nd Year",
      event: "Creative Writing Competition",
      registeredAt: "2026-04-17"
    },
    {
      id: 3,
      name: "Emma Davis",
      email: "emma.d@student.edu",
      class: "ME - 4th Year",
      event: "Public Speaking Workshop",
      registeredAt: "2026-04-16"
    },
    {
      id: 4,
      name: "Michael Brown",
      email: "michael.b@student.edu",
      class: "IT - 1st Year",
      event: "Debate Championship",
      registeredAt: "2026-04-15"
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterEvent, setFilterEvent] = useState("all");

  const events = ["all", ...Array.from(new Set(registrations.map(r => r.event)))];

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEvent = filterEvent === "all" || reg.event === filterEvent;
    return matchesSearch && matchesEvent;
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this registration?")) {
      setRegistrations(registrations.filter(r => r.id !== id));
      toast.success("Registration deleted successfully!");
    }
  };

  const eventStats = events.slice(1).map(event => ({
    event,
    count: registrations.filter(r => r.event === event).length
  }));

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
          {eventStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6"
            >
              <div className="text-3xl text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                {stat.count}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                {stat.event}
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
                className="pl-12 pr-8 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                    Participant
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                    Class
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                    Event
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                    Registered
                  </th>
                  <th className="px-6 py-4 text-right text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredRegistrations.map((reg) => (
                  <motion.tr
                    key={reg.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900 dark:text-white" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                          {reg.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                          {reg.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                        {reg.class}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                        {reg.event}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                        {new Date(reg.registeredAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(reg.id)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

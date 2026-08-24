import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Search, Filter, Loader2, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { registrationService } from "../../../services/registrationService";

interface Registration {
  participant_id: string;
  participant_name: string;
  participant_email: string;
  participant_class: string;
  participant_crn?: number | null;
  participant_urn?: number | null;
  registered_event: number;
  event_name: string;
  created_at: string;
  updated_at?: string;
}

import { useAdminSearch } from "../../context/AdminSearchContext";

export function AdminRegistrations() {
  const { searchQuery, setSearchQuery, setSearchPlaceholder } = useAdminSearch();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterEventId, setFilterEventId] = useState("all");
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);

  useEffect(() => {
    setSearchPlaceholder("Search registrations by participant, email, class, event...");
  }, [setSearchPlaceholder]);

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

  const events = [
    { id: "all", name: "All Events" },
    ...Array.from(
      new Map(
        registrations.map((registration) => [
          String(registration.registered_event),
          { id: String(registration.registered_event), name: registration.event_name }
        ])
      ).values()
    )
  ];

  const filteredRegistrations = registrations.filter(reg => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      (reg.participant_name && reg.participant_name.toLowerCase().includes(q)) ||
      (reg.participant_email && reg.participant_email.toLowerCase().includes(q)) ||
      (reg.participant_class && reg.participant_class.toLowerCase().includes(q)) ||
      (reg.event_name && reg.event_name.toLowerCase().includes(q)) ||
      (reg.participant_crn && String(reg.participant_crn).includes(q)) ||
      (reg.participant_urn && String(reg.participant_urn).includes(q));

    const matchesEvent = filterEventId === "all" || String(reg.registered_event) === filterEventId;
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

  const toFilenamePart = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const downloadRegistrationsExcel = async () => {
    if (isDownloadingExcel) return;

    try {
      setIsDownloadingExcel(true);
      const latestRegistrations: Registration[] = await registrationService.getAllParticipants();
      const registrationsToExport = filterEventId === "all"
        ? latestRegistrations
        : latestRegistrations.filter((registration) => String(registration.registered_event) === filterEventId);

      if (registrationsToExport.length === 0) {
        toast.info("There are no registrations to download.");
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(
        registrationsToExport.map((registration) => ({
          "Participant Name": registration.participant_name,
          "Email": registration.participant_email,
          "Class": registration.participant_class,
          "CRN": registration.participant_crn ?? "",
          "URN": registration.participant_urn ?? "",
          "Event": registration.event_name || "",
          "Registration Date": registration.created_at
            ? new Date(registration.created_at).toLocaleString()
            : "",
          "Last Updated": registration.updated_at
            ? new Date(registration.updated_at).toLocaleString()
            : ""
        }))
      );
      worksheet["!cols"] = [
        { wch: 28 }, { wch: 32 }, { wch: 18 }, { wch: 14 },
        { wch: 14 }, { wch: 28 }, { wch: 22 }, { wch: 22 }
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");
      const selectedEvent = events.find((event) => event.id === filterEventId);
      const filename = filterEventId === "all"
        ? "event-registrations.xlsx"
        : `${toFilenamePart(selectedEvent?.name || "event") || "event"}-registrations.xlsx`;

      XLSX.writeFile(workbook, filename);
      toast.success("Registration Excel file downloaded.");
    } catch (error) {
      console.error("Failed to download registrations Excel:", error);
      toast.error("Failed to download registrations Excel.");
    } finally {
      setIsDownloadingExcel(false);
    }
  };

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
                placeholder="Search registrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                style={{ fontFamily: 'Open Sans, sans-serif' }}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterEventId}
                onChange={(e) => setFilterEventId(e.target.value)}
                className="pl-12 pr-8 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none"
                style={{ fontFamily: 'Open Sans, sans-serif' }}
              >
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={downloadRegistrationsExcel}
              disabled={isDownloadingExcel}
              className="px-5 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloadingExcel ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              {isDownloadingExcel ? "Preparing Excel..." : "Download Excel"}
            </button>
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


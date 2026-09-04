import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Search,
  Filter,
  Loader2,
  Download,
  Trash2,
  X,
  Users,
  User,
  ChevronDown,
  ChevronRight,
  LayoutList,
  Layers,
  Phone,
  MessageSquareText,
  CheckSquare,
  Square,
  Mail,
  Calendar,
  Eye,
  Check,
} from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { registrationService } from "../../../services/registrationService";
import { eventService } from "../../../services/eventService";
import { useAdminSearch } from "../../context/AdminSearchContext";
import { useAuth } from "../../context/AuthContext";

interface FilterOption {
  value: string;
  label: string;
}

function SearchableFilter({
  icon: Icon,
  value,
  options,
  placeholder,
  searchPlaceholder,
  onChange,
  className = "",
}: {
  icon: typeof Search;
  value: string;
  options: FilterOption[];
  placeholder: string;
  searchPlaceholder: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full min-w-[180px] flex items-center gap-2 pl-12 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-left cursor-pointer"
        style={{ fontFamily: "Open Sans, sans-serif" }}
      >
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        <span className="truncate text-sm font-medium">
          {selected?.label || placeholder}
        </span>
        <ChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-30 mt-2 w-full min-w-[220px] max-w-[min(100vw-2rem,320px)] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl overflow-hidden"
          >
            <div className="p-2 border-b border-gray-100 dark:border-gray-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  style={{ fontFamily: "Open Sans, sans-serif" }}
                />
              </div>
            </div>
            <ul className="max-h-56 overflow-y-auto overflow-x-hidden py-1">
              {filtered.length === 0 ? (
                <li className="px-3 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                  No matches
                </li>
              ) : (
                filtered.map((option) => {
                  const isActive = option.value === value;
                  return (
                    <li key={option.value}>
                      <button
                        type="button"
                        onClick={() => {
                          onChange(option.value);
                          setOpen(false);
                          setQuery("");
                        }}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left text-sm transition-colors cursor-pointer min-w-0 ${
                          isActive
                            ? "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold"
                            : "text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        <span className="truncate min-w-0 break-words [overflow-wrap:anywhere]">
                          {option.label}
                        </span>
                        {isActive && <Check className="w-4 h-4 shrink-0" />}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface EventQuestion {
  question_id: string;
  question_label: string;
  question_type: string;
  options?: string[];
  is_required?: boolean;
  order_index?: number;
  is_active?: boolean;
}

interface Registration {
  participant_id: string;
  participant_name: string;
  participant_email: string;
  participant_class: string;
  participant_crn?: number | null;
  participant_urn?: number | null;
  participant_phone_no?: string | null;
  registered_event: number;
  event_name: string;
  team_id?: string | null;
  team_name?: string | null;
  custom_answers?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

type TeamFilter = "all" | "solo" | string;
type ViewMode = "flat" | "grouped";

interface TeamGroup {
  key: string;
  label: string;
  teamId: string | null;
  members: Registration[];
}

const formatAnswerValue = (value: unknown): string => {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const countAnswers = (answers?: Record<string, unknown>) => {
  if (!answers) return 0;
  return Object.values(answers).filter((v) => {
    if (v === null || v === undefined || v === "") return false;
    if (Array.isArray(v) && v.length === 0) return false;
    return true;
  }).length;
};

export function AdminRegistrations() {
  const { hasPermission } = useAuth();
  const { searchQuery, setSearchQuery, setSearchPlaceholder } = useAdminSearch();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [eventQuestionsMap, setEventQuestionsMap] = useState<Map<number, EventQuestion[]>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [filterEventId, setFilterEventId] = useState("all");
  const [filterTeam, setFilterTeam] = useState<TeamFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("flat");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteConfirmIds, setDeleteConfirmIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewingRegistration, setViewingRegistration] = useState<Registration | null>(null);

  useEffect(() => {
    setSearchPlaceholder("Search registrations by name, email, phone, team, class, event...");
  }, [setSearchPlaceholder]);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [participants, events] = await Promise.all([
        registrationService.getAllParticipants(),
        eventService.getAllEvents(),
      ]);

      setRegistrations(participants || []);

      const qMap = new Map<number, EventQuestion[]>();
      (events || []).forEach((ev: { event_id: number; form_questions?: EventQuestion[] }) => {
        qMap.set(ev.event_id, ev.form_questions || []);
      });
      setEventQuestionsMap(qMap);
    } catch {
      toast.error("Failed to fetch registrations");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const events = useMemo(
    () => [
      { id: "all", name: "All Events" },
      ...Array.from(
        new Map(
          registrations.map((registration) => [
            String(registration.registered_event),
            { id: String(registration.registered_event), name: registration.event_name },
          ])
        ).values()
      ),
    ],
    [registrations]
  );

  const filteredByEventAndSearch = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return registrations.filter((reg) => {
      const matchesSearch =
        !q ||
        (reg.participant_name && reg.participant_name.toLowerCase().includes(q)) ||
        (reg.participant_email && reg.participant_email.toLowerCase().includes(q)) ||
        (reg.participant_class && reg.participant_class.toLowerCase().includes(q)) ||
        (reg.event_name && reg.event_name.toLowerCase().includes(q)) ||
        (reg.team_name && reg.team_name.toLowerCase().includes(q)) ||
        (reg.participant_phone_no && reg.participant_phone_no.toLowerCase().includes(q)) ||
        (reg.participant_crn && String(reg.participant_crn).includes(q)) ||
        (reg.participant_urn && String(reg.participant_urn).includes(q));

      const matchesEvent =
        filterEventId === "all" || String(reg.registered_event) === filterEventId;

      return matchesSearch && matchesEvent;
    });
  }, [registrations, searchQuery, filterEventId]);

  const teamOptions = useMemo(() => {
    const names = new Map<string, string>();
    filteredByEventAndSearch.forEach((reg) => {
      if (reg.team_name) names.set(reg.team_name, reg.team_name);
    });
    return Array.from(names.values()).sort((a, b) => a.localeCompare(b));
  }, [filteredByEventAndSearch]);

  useEffect(() => {
    if (filterTeam !== "all" && filterTeam !== "solo" && !teamOptions.includes(filterTeam)) {
      setFilterTeam("all");
    }
  }, [filterTeam, teamOptions]);

  const filteredRegistrations = useMemo(() => {
    return filteredByEventAndSearch.filter((reg) => {
      if (filterTeam === "all") return true;
      if (filterTeam === "solo") return !reg.team_name;
      return reg.team_name === filterTeam;
    });
  }, [filteredByEventAndSearch, filterTeam]);

  const teamGroups = useMemo((): TeamGroup[] => {
    const groups = new Map<string, TeamGroup>();

    filteredRegistrations.forEach((reg) => {
      const key = reg.team_id || (reg.team_name ? `name:${reg.team_name}` : "solo");
      const label = reg.team_name || "Individual";
      const existing = groups.get(key);
      if (existing) {
        existing.members.push(reg);
      } else {
        groups.set(key, {
          key,
          label,
          teamId: reg.team_id || null,
          members: [reg],
        });
      }
    });

    return Array.from(groups.values()).sort((a, b) => {
      if (a.key === "solo") return 1;
      if (b.key === "solo") return -1;
      return a.label.localeCompare(b.label);
    });
  }, [filteredRegistrations]);

  const allFilteredSelected =
    filteredRegistrations.length > 0 &&
    filteredRegistrations.every((r) => selectedIds.includes(r.participant_id));

  useEffect(() => {
    setSelectedIds((prev) => {
      const existing = new Set(registrations.map((r) => r.participant_id));
      return prev.filter((id) => existing.has(id));
    });
  }, [registrations]);

  const totalEvents = events.length - 1;
  const totalParticipants = registrations.length;
  const avgParticipants = totalEvents > 0 ? Math.round(totalParticipants / totalEvents) : 0;
  const teamCount = useMemo(() => {
    const ids = new Set(
      registrations.filter((r) => r.team_id || r.team_name).map((r) => r.team_id || r.team_name!)
    );
    return ids.size;
  }, [registrations]);

  const summaryStats = [
    { label: "Total Events", value: totalEvents },
    { label: "Total Participants", value: totalParticipants },
    { label: "Teams", value: teamCount },
    { label: "Avg. / Event", value: avgParticipants },
  ];

  const getQuestionLabel = (eventId: number, questionId: string) => {
    const questions = eventQuestionsMap.get(eventId) || [];
    const found = questions.find((q) => q.question_id === questionId);
    return found?.question_label || `Question (${questionId.slice(0, 8)})`;
  };

  const buildGlobalQuestionLabelMap = (regs: Registration[]) => {
    const labelMap = new Map<string, string>();
    regs.forEach((reg) => {
      const questions = eventQuestionsMap.get(reg.registered_event) || [];
      questions.forEach((q) => {
        if (!labelMap.has(q.question_id)) labelMap.set(q.question_id, q.question_label);
      });
    });
    return labelMap;
  };

  const toFilenamePart = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    setSelectedIds(filteredRegistrations.map((r) => r.participant_id));
  };

  const unselectAllFiltered = () => {
    setSelectedIds([]);
  };

  const toggleGroupSelect = (group: TeamGroup) => {
    const memberIds = group.members.map((m) => m.participant_id);
    const allSelected = memberIds.every((id) => selectedIds.includes(id));
    setSelectedIds((prev) => {
      if (allSelected) return prev.filter((id) => !memberIds.includes(id));
      const next = new Set([...prev, ...memberIds]);
      return [...next];
    });
  };

  const toggleGroupCollapse = (key: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const promptDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    setDeleteConfirmIds(selectedIds);
  };

  const promptDeleteOne = (id: string) => {
    setDeleteConfirmIds([id]);
  };

  const confirmDelete = async () => {
    if (deleteConfirmIds.length === 0 || isDeleting) return;
    try {
      setIsDeleting(true);
      if (deleteConfirmIds.length === 1) {
        await registrationService.deleteParticipant(deleteConfirmIds[0]);
      } else {
        await registrationService.deleteMultipleParticipants(deleteConfirmIds);
      }

      const deletedSet = new Set(deleteConfirmIds);
      setRegistrations((prev) => prev.filter((r) => !deletedSet.has(r.participant_id)));
      setSelectedIds((prev) => prev.filter((id) => !deletedSet.has(id)));
      if (viewingRegistration && deletedSet.has(viewingRegistration.participant_id)) {
        setViewingRegistration(null);
      }
      toast.success(
        deleteConfirmIds.length === 1
          ? "Registration deleted"
          : `${deleteConfirmIds.length} registrations deleted`
      );
      setDeleteConfirmIds([]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete registrations");
    } finally {
      setIsDeleting(false);
    }
  };

  const downloadRegistrationsExcel = async () => {
    if (isDownloadingExcel) return;

    try {
      setIsDownloadingExcel(true);
      const latestRegistrations: Registration[] = await registrationService.getAllParticipants();
      const registrationsToExport =
        filterEventId === "all"
          ? latestRegistrations
          : latestRegistrations.filter((r) => String(r.registered_event) === filterEventId);

      const afterTeamFilter =
        filterTeam === "all"
          ? registrationsToExport
          : filterTeam === "solo"
            ? registrationsToExport.filter((r) => !r.team_name)
            : registrationsToExport.filter((r) => r.team_name === filterTeam);

      if (afterTeamFilter.length === 0) {
        toast.info("There are no registrations to download.");
        return;
      }

      const questionLabels = buildGlobalQuestionLabelMap(afterTeamFilter);
      const answerKeys = Array.from(
        new Set(
          afterTeamFilter.flatMap((reg) => Object.keys(reg.custom_answers || {}))
        )
      );
      const answerColumns = answerKeys.map((questionId) => ({
        questionId,
        label: questionLabels.get(questionId) || `Question (${questionId.slice(0, 8)})`,
      }));

      const worksheet = XLSX.utils.json_to_sheet(
        afterTeamFilter.map((registration) => {
          const row: Record<string, string | number> = {
            "Participant Name": registration.participant_name,
            Email: registration.participant_email,
            Phone: registration.participant_phone_no || "",
            Class: registration.participant_class,
            CRN: registration.participant_crn ?? "",
            URN: registration.participant_urn ?? "",
            Event: registration.event_name || "",
            Team: registration.team_name || "Solo",
            "Registration Date": registration.created_at
              ? new Date(registration.created_at).toLocaleString()
              : "",
            "Last Updated": registration.updated_at
              ? new Date(registration.updated_at).toLocaleString()
              : "",
          };

          const customAnswers = registration.custom_answers || {};
          answerColumns.forEach(({ questionId, label }) => {
            row[label] = formatAnswerValue(customAnswers[questionId]);
          });

          return row;
        })
      );

      worksheet["!cols"] = [
        { wch: 28 },
        { wch: 32 },
        { wch: 16 },
        { wch: 18 },
        { wch: 14 },
        { wch: 14 },
        { wch: 28 },
        { wch: 22 },
        { wch: 22 },
        { wch: 22 },
        ...answerColumns.map(() => ({ wch: 32 })),
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");
      const selectedEvent = events.find((event) => event.id === filterEventId);
      const filename =
        filterEventId === "all"
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

  const deletePreviewNames = deleteConfirmIds
    .map((id) => registrations.find((r) => r.participant_id === id)?.participant_name)
    .filter(Boolean) as string[];

  const renderParticipantRow = (reg: Registration, nested = false) => {
    const isSelected = selectedIds.includes(reg.participant_id);
    const answerCount = countAnswers(reg.custom_answers);

    return (
      <motion.tr
        key={reg.participant_id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => {
          if (!isSelectionMode) setViewingRegistration(reg);
        }}
        className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
          !isSelectionMode ? "cursor-pointer" : ""
        } ${isSelected ? "bg-blue-50/50 dark:bg-blue-950/20" : ""}`}
      >
        {isSelectionMode && (
          <td className="px-4 py-4 text-center">
            <button
              type="button"
              onClick={() => toggleSelect(reg.participant_id)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
              aria-label={`Select ${reg.participant_name}`}
            >
              {isSelected ? (
                <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              ) : (
                <Square className="w-5 h-5" />
              )}
            </button>
          </td>
        )}
        <td className={`px-6 py-4 ${nested ? "pl-10" : ""}`}>
          <div>
            <div className="text-sm text-gray-900 dark:text-white font-semibold">
              {reg.participant_name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{reg.participant_email}</div>
          </div>
        </td>
        <td className="px-6 py-4">
          <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
            {reg.participant_phone_no ? (
              <>
                <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                {reg.participant_phone_no}
              </>
            ) : (
              <span className="text-gray-400">—</span>
            )}
          </span>
        </td>
        <td className="px-6 py-4">
          {reg.team_name ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 text-xs font-semibold">
              <Users className="w-3 h-3" />
              {reg.team_name}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-medium">
              <User className="w-3 h-3" />
              Solo
            </span>
          )}
        </td>
        <td className="px-6 py-4">
          <span className="inline-block px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-bold">
            {reg.event_name}
          </span>
        </td>
        <td className="px-6 py-4">
          {answerCount > 0 ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!isSelectionMode) setViewingRegistration(reg);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors cursor-pointer"
            >
              <MessageSquareText className="w-3 h-3" />
              {answerCount} {answerCount === 1 ? "answer" : "answers"}
            </button>
          ) : (
            <span className="text-sm text-gray-400">—</span>
          )}
        </td>
        <td className="px-6 py-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {new Date(reg.created_at).toLocaleDateString()}
          </span>
        </td>
      </motion.tr>
    );
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1
              className="text-3xl text-gray-900 dark:text-white mb-2"
              style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700 }}
            >
              Registrations
            </h1>
            <p className="text-gray-600 dark:text-gray-400" style={{ fontFamily: "Open Sans, sans-serif" }}>
              Manage event registrations, teams, and custom form answers
            </p>
          </div>
          <div className="flex gap-3 items-center flex-wrap">
            {selectedIds.length > 0 && hasPermission('DELETE_REGISTRATIONS') && (
              <button
                type="button"
                onClick={promptDeleteSelected}
                className="px-5 py-3 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 transition-all shadow-lg shadow-red-500/30 flex items-center gap-2 hover:-translate-y-0.5 cursor-pointer"
              >
                <Trash2 className="w-5 h-5" />
                Delete Selected ({selectedIds.length})
              </button>
            )}
            <button
              type="button"
              onClick={downloadRegistrationsExcel}
              disabled={isDownloadingExcel}
              className="px-5 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isDownloadingExcel ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              {isDownloadingExcel ? "Preparing Excel..." : "Download Excel"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {summaryStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 md:p-6"
            >
              <div
                className="text-2xl md:text-3xl text-gray-900 dark:text-white mb-1"
                style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700 }}
              >
                {isLoading ? "..." : stat.value}
              </div>
              <div
                className="text-sm text-gray-600 dark:text-gray-400"
                style={{ fontFamily: "Open Sans, sans-serif" }}
              >
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, phone, team..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  style={{ fontFamily: "Open Sans, sans-serif" }}
                />
              </div>

              <SearchableFilter
                icon={Filter}
                value={filterEventId}
                options={events.map((event) => ({
                  value: event.id,
                  label: event.name,
                }))}
                placeholder="All Events"
                searchPlaceholder="Search events..."
                onChange={(next) => {
                  setFilterEventId(next);
                  setFilterTeam("all");
                }}
                className="w-full lg:w-auto"
              />

              <SearchableFilter
                icon={Users}
                value={filterTeam}
                options={[
                  { value: "all", label: "All teams" },
                  { value: "solo", label: "Solo only" },
                  ...teamOptions.map((name) => ({ value: name, label: name })),
                ]}
                placeholder="All teams"
                searchPlaceholder="Search teams..."
                onChange={setFilterTeam}
                className="w-full lg:w-auto"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800">
                  <button
                    type="button"
                    onClick={() => setViewMode("flat")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                      viewMode === "flat"
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                    }`}
                  >
                    <LayoutList className="w-4 h-4" />
                    Flat
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("grouped")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                      viewMode === "grouped"
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    Group by team
                  </button>
                </div>

                {!isSelectionMode ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsSelectionMode(true);
                      setViewingRegistration(null);
                    }}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckSquare className="w-4 h-4" />
                    Select Multiple
                  </button>
                ) : (
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={selectAllFiltered}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Select All ({filteredRegistrations.length})
                    </button>
                    <button
                      type="button"
                      onClick={unselectAllFiltered}
                      className="text-sm font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:underline cursor-pointer"
                    >
                      Unselect All
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSelectionMode(false);
                        unselectAllFiltered();
                      }}
                      className="text-sm font-semibold text-red-500 hover:text-red-600 hover:underline cursor-pointer"
                    >
                      Exit Selection
                    </button>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400" style={{ fontFamily: "Open Sans, sans-serif" }}>
                {filteredRegistrations.length} registration
                {filteredRegistrations.length !== 1 ? "s" : ""}
              </p>
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
                    <Loader2 className="w-8 h-8 text-purple-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p
                    className="text-gray-500 dark:text-gray-400 animate-pulse"
                    style={{ fontFamily: "Open Sans, sans-serif" }}
                  >
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
                  <p className="text-gray-500 dark:text-gray-400" style={{ fontFamily: "Open Sans, sans-serif" }}>
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
                      {isSelectionMode && (
                        <th className="px-4 py-4 text-center w-12">
                          <button
                            type="button"
                            onClick={
                              allFilteredSelected ? unselectAllFiltered : selectAllFiltered
                            }
                            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
                            aria-label="Select all visible registrations"
                          >
                            {allFilteredSelected ? (
                              <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            ) : (
                              <Square className="w-5 h-5" />
                            )}
                          </button>
                        </th>
                      )}
                      <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider font-bold">
                        Participant
                      </th>
                      <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider font-bold">
                        Phone
                      </th>
                      <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider font-bold">
                        Team
                      </th>
                      <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider font-bold">
                        Event
                      </th>
                      <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider font-bold">
                        Answers
                      </th>
                      <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider font-bold">
                        Registered
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {viewMode === "flat"
                      ? filteredRegistrations.map((reg) => renderParticipantRow(reg))
                      : teamGroups.map((group) => {
                          const isCollapsed = collapsedGroups.has(group.key);
                          const groupAllSelected = group.members.every((m) =>
                            selectedIds.includes(m.participant_id)
                          );
                          const groupSomeSelected =
                            group.members.some((m) => selectedIds.includes(m.participant_id)) &&
                            !groupAllSelected;

                          return [
                            <tr key={`header-${group.key}`} className="bg-gray-50/80 dark:bg-gray-800/50">
                              {isSelectionMode && (
                                <td className="px-4 py-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => toggleGroupSelect(group)}
                                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
                                    aria-label={`Select team ${group.label}`}
                                  >
                                    {groupAllSelected ? (
                                      <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    ) : groupSomeSelected ? (
                                      <CheckSquare className="w-5 h-5 text-blue-400/70 dark:text-blue-500/70" />
                                    ) : (
                                      <Square className="w-5 h-5" />
                                    )}
                                  </button>
                                </td>
                              )}
                              <td colSpan={6} className="px-6 py-3">
                                <button
                                  type="button"
                                  onClick={() => toggleGroupCollapse(group.key)}
                                  className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-100 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                >
                                  {isCollapsed ? (
                                    <ChevronRight className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                  {group.key === "solo" ? (
                                    <User className="w-4 h-4 text-gray-400" />
                                  ) : (
                                    <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                                  )}
                                  <span>{group.label}</span>
                                  <span className="font-medium text-gray-500 dark:text-gray-400">
                                    · {group.members.length} member
                                    {group.members.length !== 1 ? "s" : ""}
                                  </span>
                                </button>
                              </td>
                            </tr>,
                            ...(!isCollapsed
                              ? group.members.map((reg) => renderParticipantRow(reg, true))
                              : []),
                          ];
                        }).flat()}
                  </tbody>
                </motion.table>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Detail modal — centered, answer-first */}
      <AnimatePresence>
        {viewingRegistration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/55 backdrop-blur-sm"
              onClick={() => setViewingRegistration(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              className="relative w-full max-w-2xl max-h-[88vh] rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="relative shrink-0 px-6 pt-6 pb-5 border-b border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setViewingRegistration(null)}
                  className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-start gap-4 pr-10">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-lg shadow-purple-500/25">
                    {(viewingRegistration.participant_name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3
                      className="text-xl font-bold text-gray-900 dark:text-white truncate"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      {viewingRegistration.participant_name}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-semibold">
                        {viewingRegistration.event_name}
                      </span>
                      {viewingRegistration.team_name ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 text-xs font-semibold">
                          <Users className="w-3 h-3" />
                          {viewingRegistration.team_name}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs font-medium">
                          Solo
                        </span>
                      )}
                      {viewingRegistration.participant_class && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-medium">
                          {viewingRegistration.participant_class}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Compact contact strip */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 min-w-0">
                    <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{viewingRegistration.participant_email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{viewingRegistration.participant_phone_no || "No phone"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Eye className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>
                      CRN {viewingRegistration.participant_crn ?? "—"} · URN{" "}
                      {viewingRegistration.participant_urn ?? "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>
                      {viewingRegistration.created_at
                        ? new Date(viewingRegistration.created_at).toLocaleString()
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Answers — primary focus */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-5 min-w-0">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquareText className="w-4 h-4 text-amber-500" />
                  <h4
                    className="text-sm font-bold text-gray-900 dark:text-white"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    Form responses
                  </h4>
                  <span className="text-xs text-gray-400 font-medium">
                    · {countAnswers(viewingRegistration.custom_answers)}
                  </span>
                </div>

                {viewingRegistration.custom_answers &&
                Object.keys(viewingRegistration.custom_answers).length > 0 ? (
                  <div className="space-y-4 min-w-0 max-w-full">
                    {Object.entries(viewingRegistration.custom_answers).map(([qId, ans], idx) => {
                      const label = getQuestionLabel(viewingRegistration.registered_event, qId);
                      const formatted = formatAnswerValue(ans);
                      if (!formatted) return null;

                      return (
                        <div key={qId} className="space-y-2 min-w-0">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <span className="mt-0.5 w-5 h-5 rounded-md bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 leading-snug pt-0.5 min-w-0 break-words">
                              {label}
                            </p>
                          </div>
                          <div className="ml-7 min-w-0 max-w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 overflow-hidden">
                            <div className="max-h-40 max-w-full overflow-y-auto overflow-x-auto px-4 py-3">
                              <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                                {formatted}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 px-4 py-10 text-center">
                    <MessageSquareText className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No custom form answers for this registration.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="shrink-0 px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3 bg-gray-50/80 dark:bg-gray-950/40">
                <button
                  type="button"
                  onClick={() => setViewingRegistration(null)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Close
                </button>
                {hasPermission('DELETE_REGISTRATIONS') && (
                  <button
                    type="button"
                    onClick={() => promptDeleteOne(viewingRegistration.participant_id)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirm modal */}
      <AnimatePresence>
        {deleteConfirmIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => !isDeleting && setDeleteConfirmIds([])}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md max-h-[85vh] rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col overflow-hidden min-w-0"
            >
              <div className="p-6 pb-0 shrink-0 min-w-0">
                <h3
                  className="text-xl font-bold text-gray-900 dark:text-white mb-2 break-words"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Delete {deleteConfirmIds.length === 1 ? "registration" : "registrations"}?
                </h3>
                <p
                  className="text-sm text-gray-600 dark:text-gray-400 mb-4 break-words"
                  style={{ fontFamily: "Open Sans, sans-serif" }}
                >
                  You are about to permanently delete{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {deleteConfirmIds.length}
                  </span>{" "}
                  registration{deleteConfirmIds.length !== 1 ? "s" : ""}. This cannot be undone.
                </p>
              </div>

              {deletePreviewNames.length > 0 && (
                <div className="px-6 min-w-0">
                  <ul className="mb-5 text-sm text-gray-700 dark:text-gray-300 space-y-1.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 max-h-40 overflow-y-auto overflow-x-hidden min-w-0 max-w-full">
                    {deletePreviewNames.map((name, idx) => (
                      <li
                        key={`${name}-${idx}`}
                        className="font-medium min-w-0 max-w-full break-words [overflow-wrap:anywhere]"
                      >
                        · {name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end gap-3 p-6 pt-0 shrink-0">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeleteConfirmIds([])}
                  className="px-4 py-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium text-sm cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={confirmDelete}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isDeleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

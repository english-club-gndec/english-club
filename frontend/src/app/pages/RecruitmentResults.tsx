import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useMemo } from "react";
import {
  Trophy,
  Search,
  Sparkles,
  Award,
  Code,
  Palette,
  Megaphone,
  Calendar,
  Shield,
  Camera,
  Database,
  Mic,
  Users,
  CheckCircle2,
  Share2,
  Printer,
  ChevronDown,
  ChevronUp,
  Loader2,
  ArrowLeft,
  GraduationCap,
  Mail,
  UserCheck
} from "lucide-react";
import confetti from "canvas-confetti";
import { Link } from "react-router";
import { recruitmentServices } from "../../services/recruitmentServices";
import { usePublicSettings } from "../hooks/usePublicSettings";

interface SelectedCandidate {
  candidate_id: string;
  candidate_name: string;
  candidate_class: string;
  candidate_crn: number | null;
  candidate_urn: number | null;
  candidate_email: string;
  interested_department: string;
  candidate_status: string;
  candidate_description?: string;
  custom_answers?: Record<string, any>;
  created_at?: string;
}

const DEPARTMENT_CONFIG: Record<
  string,
  { label: string; icon: any; gradient: string; textGlow: string; badgeBg: string; border: string }
> = {
  TECHNICAL: {
    label: "Technical",
    icon: Code,
    gradient: "from-blue-600 to-cyan-500",
    textGlow: "text-cyan-400",
    badgeBg: "bg-blue-500/10 text-cyan-400 border-cyan-500/30",
    border: "border-cyan-500/20"
  },
  CREATIVE: {
    label: "Creative",
    icon: Palette,
    gradient: "from-purple-600 to-pink-500",
    textGlow: "text-pink-400",
    badgeBg: "bg-purple-500/10 text-pink-400 border-pink-500/30",
    border: "border-pink-500/20"
  },
  EVENT_MANAGEMENT: {
    label: "Event Management",
    icon: Sparkles,
    gradient: "from-emerald-600 to-teal-400",
    textGlow: "text-emerald-400",
    badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    border: "border-emerald-500/20"
  },
  "FINANCE_&_MARKET_RELATIONS": {
    label: "Finance & Market Relations",
    icon: Shield,
    gradient: "from-amber-600 to-yellow-500",
    textGlow: "text-amber-400",
    badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    border: "border-amber-500/20"
  },
  "CREATIVE_&_PHOTOGRAPHY": {
    label: "Creative & Photography",
    icon: Camera,
    gradient: "from-sky-600 to-indigo-500",
    textGlow: "text-sky-400",
    badgeBg: "bg-sky-500/10 text-sky-400 border-sky-500/30",
    border: "border-sky-500/20"
  },
  PROMOTION: {
    label: "Promotion",
    icon: Megaphone,
    gradient: "from-orange-500 to-amber-500",
    textGlow: "text-orange-400",
    badgeBg: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    border: "border-orange-500/20"
  },
  ANCHORING: {
    label: "Anchoring",
    icon: Mic,
    gradient: "from-yellow-500 to-amber-400",
    textGlow: "text-yellow-400",
    badgeBg: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    border: "border-yellow-500/20"
  }
};

const DEFAULT_DEPT = {
  label: "General",
  icon: Award,
  gradient: "from-blue-600 to-purple-600",
  textGlow: "text-purple-400",
  badgeBg: "bg-blue-500/10 text-purple-400 border-purple-500/30",
  border: "border-purple-500/20"
};

export function RecruitmentResults() {
  const [candidates, setCandidates] = useState<SelectedCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("ALL");
  const [expandedCandidateId, setExpandedCandidateId] = useState<string | null>(null);
  const { loading: settingsLoading, resultsActive } = usePublicSettings();

  useEffect(() => {
    if (settingsLoading || !resultsActive) {
      return;
    }

    const fetchResults = async () => {
      try {
        setLoading(true);
        setLoadError("");
        const data = await recruitmentServices.getPublicResults();
        setCandidates(data || []);
        if (data && data.length > 0) {
          // Trigger celebratory confetti
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      } catch (err) {
        console.error("Failed to load recruitment results:", err);
        setLoadError("Unable to load results right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [resultsActive, settingsLoading]);

  // Filter candidates based on search & department selection
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const matchesSearch =
        c.candidate_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.candidate_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.candidate_class.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.candidate_crn && c.candidate_crn.toString().includes(searchQuery)) ||
        (c.candidate_urn && c.candidate_urn.toString().includes(searchQuery));

      const candidateDept = c.interested_department;
      const matchesDept =
        selectedDeptFilter === "ALL" || candidateDept === selectedDeptFilter;

      return matchesSearch && matchesDept;
    });
  }, [candidates, searchQuery, selectedDeptFilter]);

  // Group filtered candidates by department
  const groupedCandidates = useMemo(() => {
    const groups: Record<string, SelectedCandidate[]> = {};

    filteredCandidates.forEach((c) => {
      const deptKey = c.interested_department || "OTHER";
      if (!groups[deptKey]) {
        groups[deptKey] = [];
      }
      groups[deptKey].push(c);
    });

    return groups;
  }, [filteredCandidates]);

  // Department order sequence
  const departmentOrder = [
    "TECHNICAL",
    "CREATIVE",
    "EVENT_MANAGEMENT",
    "FINANCE_&_MARKET_RELATIONS",
    "CREATIVE_&_PHOTOGRAPHY",
    "PROMOTION",
    "ANCHORING"
  ];

  const sortedDepartmentKeys = useMemo(() => {
    const keys = Object.keys(groupedCandidates);
    return keys.sort((a, b) => {
      const idxA = departmentOrder.indexOf(a);
      const idxB = departmentOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [groupedCandidates]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "GNDEC English Club Recruitment Results",
        text: "Check out the official recruitment results for GNDEC English Club!",
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Page link copied to clipboard!");
    }
  };

  const formatDepartmentLabel = (deptKey: string) => {
    return DEPARTMENT_CONFIG[deptKey]?.label || deptKey;
  };

  if (settingsLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-purple-400" />
          <p className="text-gray-300" style={{ fontFamily: "Open Sans, sans-serif" }}>
            Checking result availability...
          </p>
        </div>
      </div>
    );
  }

  if (!resultsActive) {
    return (
      <div className="min-h-screen bg-slate-950 text-white selection:bg-purple-500 selection:text-white relative overflow-hidden font-sans">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs sm:text-sm font-semibold backdrop-blur-md mx-auto">
            <Trophy className="w-4 h-4 text-amber-400" />
            Results Unavailable
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight" style={{ fontFamily: "Poppins, sans-serif" }}>
            Results are currently unavailable
          </h1>
          <p className="text-gray-300 text-base sm:text-lg leading-relaxed" style={{ fontFamily: "Open Sans, sans-serif" }}>
            The admin has turned off public access to recruitment results for now. Please check back later.
          </p>
          <Link
            to="/join"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-900 to-purple-700 text-white font-semibold shadow-lg shadow-purple-500/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Join Us
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-purple-500 selection:text-white relative overflow-hidden font-sans">
      {/* Background Glows & Aesthetics */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370f_1px,transparent_1px),linear-gradient(to_bottom,#1f29370f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 space-y-10">
        
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            to="/join"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all text-sm font-semibold backdrop-blur-md"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Join Us
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all text-xs sm:text-sm font-semibold backdrop-blur-md"
            >
              <Share2 className="w-4 h-4 text-blue-400" /> Share
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all text-xs sm:text-sm font-semibold backdrop-blur-md print:hidden"
            >
              <Printer className="w-4 h-4 text-purple-400" /> Print
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-5 max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-emerald-500/20 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-bold tracking-widest uppercase backdrop-blur-xl shadow-lg shadow-amber-500/10">
            <Trophy className="w-4 h-4 text-amber-400 animate-bounce" />
            Official Recruitment Results
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>

          <h1
            className="text-4xl sm:text-6xl font-black tracking-tight"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Welcome to the{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              English Club Family!
            </span>
          </h1>

          <p
            className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed"
            style={{ fontFamily: "'Open Sans', sans-serif" }}
          >
            Congratulations to all selected candidates! Here is the list of inducted students sorted by their respective departments.
          </p>

          {/* Quick Metrics Bar */}
          <div className="pt-4 grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col items-center">
              <span className="text-3xl font-extrabold text-cyan-400">{candidates.length}</span>
              <span className="text-xs text-gray-400 font-semibold uppercase mt-1">Total Selected</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col items-center">
              <span className="text-3xl font-extrabold text-amber-400">2026-27</span>
              <span className="text-xs text-gray-400 font-semibold uppercase mt-1">Session</span>
            </div>
          </div>
        </motion.div>

        {/* Filter & Search Bar */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search name, CRN, URN, class..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm backdrop-blur-md"
              />
            </div>

            {/* Department Filter Tabs */}
            <div className="w-full min-w-0 overflow-x-auto pb-2 sm:pb-0 custom-scrollbar">
              <div className="flex w-max items-center gap-2 flex-nowrap">
                <button
                  onClick={() => setSelectedDeptFilter("ALL")}
                  className={`shrink-0 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                    selectedDeptFilter === "ALL"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/25"
                      : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
                  }`}
                >
                  All Departments ({candidates.length})
                </button>

                {Object.keys(DEPARTMENT_CONFIG).map((deptKey) => {
                  const count = candidates.filter((c) => c.interested_department === deptKey).length;

                  if (count === 0 && selectedDeptFilter !== deptKey) return null;

                  const cfg = DEPARTMENT_CONFIG[deptKey];
                  return (
                    <button
                      key={deptKey}
                      onClick={() => setSelectedDeptFilter(deptKey)}
                      className={`shrink-0 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
                        selectedDeptFilter === deptKey
                          ? `bg-gradient-to-r ${cfg.gradient} text-white shadow-lg`
                          : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
                      }`}
                    >
                      <cfg.icon className="w-3.5 h-3.5" />
                      {cfg.label} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Candidates Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
            <p className="text-gray-400 font-medium">Fetching recruitment results...</p>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 rounded-3xl bg-white/5 border border-white/10 text-center p-8 backdrop-blur-xl">
            <Trophy className="w-16 h-16 text-gray-600" />
            <h3 className="text-2xl font-bold text-gray-200">Unable to load results</h3>
            <p className="text-gray-400 max-w-md text-sm">{loadError}</p>
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 rounded-3xl bg-white/5 border border-white/10 text-center p-8 backdrop-blur-xl">
            <Trophy className="w-16 h-16 text-gray-600" />
            <h3 className="text-2xl font-bold text-gray-200">No Selected Candidates Found</h3>
            <p className="text-gray-400 max-w-md text-sm">
              {searchQuery
                ? `No candidates matched "${searchQuery}". Try clearing search filters.`
                : "Results have not been released yet or no candidates are currently marked as selected."}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            {sortedDepartmentKeys.map((deptKey) => {
              const deptCandidates = groupedCandidates[deptKey];
              if (!deptCandidates || deptCandidates.length === 0) return null;

              const config = DEPARTMENT_CONFIG[deptKey] || DEFAULT_DEPT;
              const DeptIcon = config.icon;

              return (
                <motion.div
                  key={deptKey}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4"
                >
                  {/* Department Title Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${config.gradient} p-0.5 shadow-lg flex items-center justify-center`}
                      >
                        <div className="w-full h-full bg-slate-950/80 rounded-[14px] flex items-center justify-center text-white">
                          <DeptIcon className="w-5 h-5" />
                        </div>
                      </div>
                      <div>
                        <h2
                          className="text-2xl font-bold text-white flex items-center gap-2"
                          style={{ fontFamily: "'Poppins', sans-serif" }}
                        >
                          {formatDepartmentLabel(deptKey)}
                        </h2>
                        <p className="text-xs text-gray-400 font-medium">
                          {deptCandidates.length} Selected Student{deptCandidates.length > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${config.badgeBg}`}
                    >
                      {deptCandidates.length} Member{deptCandidates.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Vibing Glassmorphic Student Table */}
                  <div className="rounded-3xl bg-slate-900/60 border border-white/10 overflow-hidden shadow-2xl backdrop-blur-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 bg-white/5 text-xs font-bold uppercase tracking-wider text-gray-400">
                            <th className="px-6 py-4 w-16 text-center">#</th>
                            <th className="px-6 py-4">Student Name</th>
                            <th className="px-6 py-4">Class & Stream</th>
                            <th className="px-6 py-4">CRN</th>
                            <th className="px-6 py-4">URN</th>
                            <th className="px-6 py-4">Email</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                          {deptCandidates.map((candidate, index) => {
                            const isExpanded = expandedCandidateId === candidate.candidate_id;

                            return (
                              <tr
                                key={candidate.candidate_id}
                                onClick={() =>
                                  setExpandedCandidateId(isExpanded ? null : candidate.candidate_id)
                                }
                                className={`transition-all hover:bg-white/5 cursor-pointer ${
                                  isExpanded ? "bg-white/5" : ""
                                }`}
                              >
                                <td className="px-6 py-4 text-center font-semibold text-gray-500">
                                  {index + 1}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="font-bold text-white text-base">
                                    {candidate.candidate_name}
                                  </div>
                                </td>

                                <td className="px-6 py-4">
                                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 font-semibold text-xs text-gray-200">
                                    <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                                    {candidate.candidate_class}
                                  </div>
                                </td>

                                <td className="px-6 py-4 font-mono text-xs text-gray-300 font-semibold">
                                  {candidate.candidate_crn ? (
                                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-cyan-300">
                                      {candidate.candidate_crn}
                                    </span>
                                  ) : (
                                    <span className="text-gray-600">N/A</span>
                                  )}
                                </td>

                                <td className="px-6 py-4 font-mono text-xs text-gray-300 font-semibold">
                                  {candidate.candidate_urn ? (
                                    <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300">
                                      {candidate.candidate_urn}
                                    </span>
                                  ) : (
                                    <span className="text-gray-600">N/A</span>
                                  )}
                                </td>

                                <td className="px-6 py-4 text-xs text-gray-400 font-medium">
                                  <div className="flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                                    {candidate.candidate_email}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Footer Note */}
        <div className="pt-12 text-center border-t border-white/10 text-xs text-gray-400 font-medium">
          GNDEC English Club • Inducted Candidates Directory • Session 2026-27
        </div>
      </div>
    </div>
  );
}

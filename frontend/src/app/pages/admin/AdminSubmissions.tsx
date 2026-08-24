import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Search, Filter, Check, X, Eye, Calendar, Tag, AlertTriangle, Image as ImageIcon, LayoutGrid, List, Trash2, FileEdit, Send, Loader2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { submissionService, Submission } from "../../../services/submissionService";

import { useAdminSearch } from "../../context/AdminSearchContext";

export function AdminSubmissions() {
  const { userId } = useAuth();
  const { searchQuery, setSearchQuery, setSearchPlaceholder } = useAdminSearch();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  useEffect(() => {
    setSearchPlaceholder("Search blog submissions by title, author, description...");
  }, [setSearchPlaceholder]);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [skipWarningCheckbox, setSkipWarningCheckbox] = useState(false);

  const [requestChangeTarget, setRequestChangeTarget] = useState<Submission | null>(null);
  const [requestChangeReason, setRequestChangeReason] = useState("");
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const data = await submissionService.getAllSubmissions();
      setSubmissions(data);
    } catch (err) {
      console.error("Failed to load submissions:", err);
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleApprove = async (submissionId: string) => {
    try {
      await submissionService.updateSubmissionStatus(submissionId, userId || "admin", "APPROVED");
      toast.success("Submission approved!");
      fetchSubmissions();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to approve submission");
    }
  };

  const handleReject = async (submissionId: string) => {
    const reason = prompt("Enter rejection reason (optional):");
    if (reason === null) return; // Cancelled
    try {
      await submissionService.updateSubmissionStatus(submissionId, userId || "admin", "REJECTED", reason);
      toast.success("Submission rejected");
      fetchSubmissions();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reject submission");
    }
  };

  const handleRequestChangeClick = (submission: Submission) => {
    setRequestChangeTarget(submission);
    setRequestChangeReason("");
  };

  const handleRequestChangeConfirm = async () => {
    if (!requestChangeTarget) return;
    if (!requestChangeReason.trim()) {
      toast.error("Please enter a reason or feedback for requested changes");
      return;
    }

    setIsSendingRequest(true);
    try {
      await submissionService.updateSubmissionStatus(
        requestChangeTarget.submission_id,
        userId || "admin",
        "REQUESTED_CHANGE",
        requestChangeReason
      );
      toast.success(`Request for changes sent to ${requestChangeTarget.student_name}!`);
      fetchSubmissions();
      setRequestChangeTarget(null);
      setRequestChangeReason("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to request changes");
    } finally {
      setIsSendingRequest(false);
    }
  };

  const handleDeleteConfirm = async (submissionId: string) => {
    try {
      await submissionService.deleteSubmission(submissionId);
      toast.success("Submission deleted successfully!");
      fetchSubmissions();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete submission");
    } finally {
      setDeleteTargetId(null);
    }
  };

  const handleDeleteClick = (submissionId: string) => {
    if (localStorage.getItem("skip_delete_warning") === "true") {
      handleDeleteConfirm(submissionId);
    } else {
      setSkipWarningCheckbox(false);
      setDeleteTargetId(submissionId);
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      sub.student_name.toLowerCase().includes(q) ||
      sub.title.toLowerCase().includes(q) ||
      sub.description.toLowerCase().includes(q) ||
      (sub.student_class && sub.student_class.toLowerCase().includes(q)) ||
      (sub.student_urn && String(sub.student_urn).includes(q));
    
    const matchesStatus = filterStatus === "all" || sub.status.toUpperCase() === filterStatus.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING": return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/40";
      case "APPROVED": return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/40";
      case "REJECTED": return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/40";
      case "REQUESTED_CHANGE": return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40";
      default: return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400";
    }
  };

  const formatStatusText = (status: string) => {
    if (status.toUpperCase() === "REQUESTED_CHANGE") return "REQUESTED CHANGE";
    return status;
  };

  const stats = [
    { label: "Total Submissions", value: submissions.length, color: "from-blue-500 to-blue-600" },
    { label: "Pending", value: submissions.filter(s => s.status.toUpperCase() === "PENDING").length, color: "from-yellow-500 to-yellow-600" },
    { label: "Requested Change", value: submissions.filter(s => s.status.toUpperCase() === "REQUESTED_CHANGE").length, color: "from-purple-500 to-purple-600" },
    { label: "Approved", value: submissions.filter(s => s.status.toUpperCase() === "APPROVED").length, color: "from-green-500 to-green-600" },
  ];

  return (
    <>
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
            Submissions
          </h1>
          <p className="text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>
            Review and approve student blogs and articles
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm"
            >
              <div className="text-3xl text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search submissions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                style={{ fontFamily: 'Open Sans, sans-serif' }}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-12 pr-8 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none cursor-pointer font-semibold"
                style={{ fontFamily: 'Open Sans, sans-serif' }}
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="REQUESTED_CHANGE">Requested Change</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <div className="flex gap-1 border border-gray-200 dark:border-gray-700 rounded-xl p-1 bg-gray-50 dark:bg-gray-800 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Loading submissions...</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No submissions found</h3>
              <p className="text-gray-500 text-sm">Try adjusting your filters or search terms.</p>
            </div>
          ) : viewMode === "list" ? (
            <div className="space-y-4">
              {filteredSubmissions.map((submission) => (
                <motion.div
                  key={submission.submission_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      {submission.image_url ? (
                        <img 
                          src={submission.image_url} 
                          alt={submission.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-700 flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-white/40" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg text-gray-900 dark:text-white mb-1 font-semibold truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {submission.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                            by <span className="font-semibold">{submission.student_name}</span> ({submission.student_class}) • {new Date(submission.submitted_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${getStatusBadge(submission.status)}`} style={{ fontFamily: 'Open Sans, sans-serif' }}>
                          {formatStatusText(submission.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 leading-relaxed" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                        {submission.description}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => setSelectedSubmission(submission)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors text-sm font-semibold cursor-pointer"
                          style={{ fontFamily: 'Open Sans, sans-serif' }}
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        {(submission.status.toUpperCase() === "PENDING" || submission.status.toUpperCase() === "REQUESTED_CHANGE") && (
                          <>
                            <button
                              onClick={() => handleApprove(submission.submission_id)}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 transition-colors text-sm font-semibold cursor-pointer"
                              style={{ fontFamily: 'Open Sans, sans-serif' }}
                            >
                              <Check className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleRequestChangeClick(submission)}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 transition-colors text-sm font-semibold cursor-pointer"
                              style={{ fontFamily: 'Open Sans, sans-serif' }}
                            >
                              <FileEdit className="w-4 h-4" />
                              Request Change
                            </button>
                            <button
                              onClick={() => handleReject(submission.submission_id)}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 transition-colors text-sm font-semibold cursor-pointer"
                              style={{ fontFamily: 'Open Sans, sans-serif' }}
                            >
                              <X className="w-4 h-4" />
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeleteClick(submission.submission_id)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 transition-colors text-sm font-semibold cursor-pointer"
                          style={{ fontFamily: 'Open Sans, sans-serif' }}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSubmissions.map((submission) => (
                <motion.div
                  key={submission.submission_id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-lg transition-all duration-300 flex flex-col h-full"
                >
                  <div className="relative h-44 overflow-hidden shrink-0">
                    {submission.image_url ? (
                      <img
                        src={submission.image_url}
                        alt={submission.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-700 flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-white/40" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm ${getStatusBadge(submission.status)}`}>
                        {formatStatusText(submission.status)}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-base text-gray-900 dark:text-white mb-2 font-semibold line-clamp-2 leading-snug" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {submission.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                      by <span className="font-semibold">{submission.student_name}</span> ({submission.student_class})
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 leading-relaxed flex-grow" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                      {submission.description}
                    </p>
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex gap-2 shrink-0 flex-wrap">
                      <button
                        onClick={() => setSelectedSubmission(submission)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors text-xs font-semibold cursor-pointer min-w-[70px]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                      {(submission.status.toUpperCase() === "PENDING" || submission.status.toUpperCase() === "REQUESTED_CHANGE") && (
                        <>
                          <button
                            onClick={() => handleApprove(submission.submission_id)}
                            title="Approve"
                            className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 transition-colors cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRequestChangeClick(submission)}
                            title="Request Change"
                            className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 transition-colors cursor-pointer"
                          >
                            <FileEdit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleReject(submission.submission_id)}
                            title="Reject"
                            className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteClick(submission.submission_id)}
                        className="p-2 rounded-lg bg-red-50 dark:bg-red-950/20 hover:bg-red-150 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reader Modal */}
      <AnimatePresence>
        {selectedSubmission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedSubmission(null)}
            className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 30, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-950 rounded-[2rem] max-w-4xl w-full shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]"
            >
              {/* Modal Cover Image */}
              <div className="relative h-64 md:h-80 w-full shrink-0">
                {selectedSubmission.image_url ? (
                  <img
                    src={selectedSubmission.image_url}
                    alt={selectedSubmission.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-900 to-purple-800 flex items-center justify-center">
                    <AlertTriangle className="w-16 h-16 text-white/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full backdrop-blur-md transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>

                {/* Cover info */}
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedSubmission.tags?.map(tag => (
                      <span key={tag} className="text-xs font-semibold px-2 py-0.5 bg-white/20 text-white rounded-md backdrop-blur-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2
                    className="text-2xl md:text-4xl font-extrabold tracking-tight"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    {selectedSubmission.title}
                  </h2>
                </div>
              </div>

              {/* Modal Content Details */}
              <div className="overflow-y-auto p-6 md:p-10 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-700 dark:text-purple-300 font-bold text-sm">
                      {selectedSubmission.student_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">{selectedSubmission.student_name}</p>
                      <p className="text-xs">Class: {selectedSubmission.student_class} • URN: {selectedSubmission.student_urn}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {new Date(selectedSubmission.submitted_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Tag size={14} />
                      {selectedSubmission.tags?.join(", ")}
                    </span>
                  </div>
                </div>

                <div
                  className="prose prose-purple dark:prose-invert max-w-none prose-headings:font-bold prose-headings:font-sans prose-p:leading-relaxed prose-p:text-gray-700 dark:prose-p:text-gray-300"
                  dangerouslySetInnerHTML={{ __html: selectedSubmission.body }}
                />
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
                <div className="flex gap-2 flex-wrap">
                  {(selectedSubmission.status.toUpperCase() === "PENDING" || selectedSubmission.status.toUpperCase() === "REQUESTED_CHANGE") && (
                    <>
                      <button
                        onClick={() => {
                          handleApprove(selectedSubmission.submission_id);
                          setSelectedSubmission(null);
                        }}
                        className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check size={16} />
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          const target = selectedSubmission;
                          setSelectedSubmission(null);
                          handleRequestChangeClick(target);
                        }}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileEdit size={16} />
                        Request Change
                      </button>
                      <button
                        onClick={() => {
                          handleReject(selectedSubmission.submission_id);
                          setSelectedSubmission(null);
                        }}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <X size={16} />
                        Reject
                      </button>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="px-6 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Close Reader
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Request Changes Modal */}
      <AnimatePresence>
        {requestChangeTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 max-w-lg w-full text-left shadow-2xl border border-gray-100 dark:border-gray-800"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/40 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                  <FileEdit className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Request Changes
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    For: <span className="font-semibold">{requestChangeTarget.title}</span> ({requestChangeTarget.student_name})
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                Provide specific feedback or requested revisions. An artistic & professional email with an edit link will be dispatched automatically to <span className="font-semibold text-gray-800 dark:text-gray-200">{requestChangeTarget.student_email}</span>.
              </p>

              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                  Editorial Feedback / Revisions Needed
                </label>
                <textarea
                  rows={4}
                  value={requestChangeReason}
                  onChange={(e) => setRequestChangeReason(e.target.value)}
                  placeholder="e.g. Please clarify the second paragraph, review formatting, and resubmit using your link..."
                  className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm resize-none"
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setRequestChangeTarget(null)}
                  disabled={isSendingRequest}
                  className="flex-1 px-5 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold transition-all text-sm cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRequestChangeConfirm}
                  disabled={isSendingRequest}
                  className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold transition-all text-sm cursor-pointer shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSendingRequest ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Request
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Warning Modal */}
      <AnimatePresence>
        {deleteTargetId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 max-w-md w-full text-center shadow-2xl border border-gray-100 dark:border-gray-800"
            >
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Delete Submission
              </h3>
              <p className="text-sm text-gray-650 dark:text-gray-400 mb-6 leading-relaxed">
                Are you sure you want to delete this submission? This action cannot be undone and the record will be removed permanently from database storage.
              </p>

              {/* Checkbox wrapper */}
              <div className="flex items-center justify-center mb-6">
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 select-none cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={skipWarningCheckbox}
                    onChange={(e) => setSkipWarningCheckbox(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-purple-600 focus:ring-purple-500 bg-gray-50 dark:bg-gray-800 cursor-pointer"
                  />
                  Don't show this warning again
                </label>
              </div>

              {/* Action buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setDeleteTargetId(null)}
                  className="flex-1 px-5 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-300 font-semibold transition-all text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (skipWarningCheckbox) {
                      localStorage.setItem("skip_delete_warning", "true");
                    }
                    handleDeleteConfirm(deleteTargetId);
                  }}
                  className="flex-1 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all text-sm cursor-pointer shadow-lg shadow-red-500/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

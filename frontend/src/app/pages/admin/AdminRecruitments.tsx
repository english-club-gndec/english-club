import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { 
  Loader2, Edit2, X, Trash2, Archive, CheckSquare, Square, AlertTriangle, 
  Plus, ArrowUp, ArrowDown, Layers, FileText, ToggleLeft, ToggleRight, CheckCircle2, Trophy, ExternalLink, Download
} from "lucide-react";
import * as XLSX from "xlsx";
import { toast, Toaster } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { recruitmentServices } from "../../../services/recruitmentServices";
import { settingsServices } from "../../../services/settingsServices";
import { Switch } from "../../components/ui/switch";

interface RecruitmentQuestion {
  question_id: string;
  question_label: string;
  question_type: 'SHORT_TEXT' | 'LONG_TEXT' | 'DROPDOWN' | 'MULTIPLE_CHOICE' | 'CHECKBOX';
  options: string[];
  placeholder?: string;
  is_required: boolean;
  order_index: number;
  is_active: boolean;
  created_at?: string;
}

interface Candidate {
  candidate_id: string;
  candidate_name: string;
  candidate_class: string;
  candidate_crn: number | null;
  candidate_urn: number | null;
  candidate_email: string;
  interested_department: string;
  candidate_description?: string;
  candidate_why_eligible?: string;
  candidate_comment?: string;
  candidate_status: string;
  custom_answers?: Record<string, any>;
  created_at: string;
  updated_at?: string;
  status_updated_by?: number | null;
}

import { useAdminSearch } from "../../context/AdminSearchContext";

export function AdminRecruitments() {
  const { userId, logout, user } = useAuth();
  const { searchQuery, setSearchPlaceholder } = useAdminSearch();
  const isInterviewee = user?.user_role === 'INTERVIEWEE';

  useEffect(() => {
    setSearchPlaceholder("Search candidates by name, email, class, CRN, URN...");
  }, [setSearchPlaceholder]);

  const [activeTab, setActiveTab] = useState<'applications' | 'form_builder'>('applications');
  
  // Candidate States
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [viewingCandidate, setViewingCandidate] = useState<Candidate | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [recruitmentsActive, setRecruitmentsActive] = useState(false);
  const [resultsActive, setResultsActive] = useState(false);
  const [isRecruitmentStarted, setIsRecruitmentStarted] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [isTogglingResultsStatus, setIsTogglingResultsStatus] = useState(false);
  const [isTogglingRecruitmentStarted, setIsTogglingRecruitmentStarted] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [newStatus, setNewStatus] = useState<string>("");
  const [newComment, setNewComment] = useState<string>("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Candidate Selection & Delete States
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [deleteConfirmIds, setDeleteConfirmIds] = useState<string[]>([]);
  const [candidateToDelete, setCandidateToDelete] = useState<Candidate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Archive States
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [recruitmentArchiveDate, setRecruitmentArchiveDate] = useState<string>(() => {
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'long' });
    return `Recruitment ${month} ${now.getFullYear()}`;
  });
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);

  // Question / Form Builder States
  const [questions, setQuestions] = useState<RecruitmentQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<RecruitmentQuestion | null>(null);
  const [questionFormData, setQuestionFormData] = useState({
    question_label: "",
    question_type: "SHORT_TEXT" as RecruitmentQuestion['question_type'],
    options: [] as string[],
    placeholder: "",
    is_required: true,
    is_active: true
  });
  const [newOptionInput, setNewOptionInput] = useState("");
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<RecruitmentQuestion | null>(null);
  const [isDeletingQuestion, setIsDeletingQuestion] = useState(false);

  const formatDepartment = (dept: string) => {
    if (!dept) return '';
    if (dept === "ALL") return "All Departments";
    if (dept === "FINANCE_&_MARKET_RELATIONS") return "Finance & Market Relations";
    if (dept === "CREATIVE_&_PHOTOGRAPHY") return "Creative & Photography";
    if (dept === "EVENT_MANAGEMENT") return "Event Management";
    if (dept === "TECHNICAL") return "Technical";
    if (dept === "PROMOTION") return "Promotion";
    if (dept === "ANCHORING") return "Anchoring";
    return dept;
  };

  const normalizeDepartment = (dept: string) => {
    if (!dept) return '';
    const upper = dept.toUpperCase().trim();
    if (upper === 'CREATIVE & PHOTOGRAPHY' || upper === 'CREATIVE_&_PHOTOGRAPHY' || upper === 'CREATIVE AND PHOTOGRAPHY') {
      return 'CREATIVE_&_PHOTOGRAPHY';
    }
    if (upper === 'EVENT MANAGEMENT' || upper === 'EVENT_MANAGEMENT') {
      return 'EVENT_MANAGEMENT';
    }
    if (upper === 'FINANCE & MARKET RELATIONS' || upper === 'FINANCE_&_MARKET_RELATIONS') {
      return 'FINANCE_&_MARKET_RELATIONS';
    }
    return upper;
  };

  const intervieweeDept = user?.members?.member_club_department || '';
  const normalizedIntervieweeDept = normalizeDepartment(intervieweeDept);

  const filteredCandidates = candidates.filter(candidate => {
    let matchesDepartment = filterDepartment === "ALL" || candidate.interested_department === filterDepartment;

    if (isInterviewee && normalizedIntervieweeDept && normalizedIntervieweeDept !== 'ALL') {
      matchesDepartment = normalizeDepartment(candidate.interested_department) === normalizedIntervieweeDept;
    }

    const matchesStatus = filterStatus === "ALL" || candidate.candidate_status === filterStatus;

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query ||
      (candidate.candidate_name && candidate.candidate_name.toLowerCase().includes(query)) ||
      (candidate.candidate_email && candidate.candidate_email.toLowerCase().includes(query)) ||
      (candidate.candidate_class && candidate.candidate_class.toLowerCase().includes(query)) ||
      (candidate.candidate_crn && String(candidate.candidate_crn).includes(query)) ||
      (candidate.candidate_urn && String(candidate.candidate_urn).includes(query)) ||
      (candidate.interested_department && candidate.interested_department.toLowerCase().includes(query));
    
    if (filterStatus === "PENDING" && !candidate.candidate_status) {
      return matchesDepartment && matchesSearch;
    }
    
    return matchesDepartment && matchesStatus && matchesSearch;
  });

  const fetchCandidates = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const [candidatesData, settingsData] = await Promise.all([
        recruitmentServices.getAllCandidates(userId),
        settingsServices.getSettings()
      ]);
      setCandidates(candidatesData);
      setRecruitmentsActive(settingsData.recruitmentsActive || false);
      setResultsActive(settingsData.resultsActive || false);
      setIsRecruitmentStarted(settingsData.isRecruitmentStarted || false);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch candidates");
      if (error.message && error.message.includes("404")) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    if (!userId) return;
    try {
      setLoadingQuestions(true);
      const data = await recruitmentServices.getAdminQuestions(userId);
      setQuestions(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch form questions");
    } finally {
      setLoadingQuestions(false);
    }
  };

  const formatExcelValue = (value: unknown) => {
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (value === null || value === undefined) return "";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const downloadRecruitmentExcel = async () => {
    if (!userId || isDownloadingExcel) return;

    try {
      setIsDownloadingExcel(true);
      const [latestCandidates, latestQuestions] = await Promise.all([
        recruitmentServices.getAllCandidates(userId),
        recruitmentServices.getAdminQuestions(userId)
      ]);

      if (latestCandidates.length === 0) {
        toast.info("There are no recruitment applications to download.");
        return;
      }

      const questionLabels = new Map<string, string>(
        latestQuestions.map((question: RecruitmentQuestion) => [question.question_id, question.question_label])
      );
      const answerKeys = Array.from(
        new Set<string>(
          latestCandidates.flatMap((candidate: Candidate) =>
            Object.keys((candidate.custom_answers || {}) as Record<string, any>)
          )
        )
      );
      const answerColumns: { questionId: string; label: string }[] = answerKeys.map((questionId: string) => ({
        questionId,
        label: (questionLabels.get(questionId) || `Question (${questionId.slice(0, 8)})`) as string
      }));

      const worksheet = XLSX.utils.json_to_sheet(
        latestCandidates.map((candidate: Candidate) => {
          const row: Record<string, any> = {
            "Application ID": candidate.candidate_id,
            "Name": candidate.candidate_name,
            "Email": candidate.candidate_email,
            "Class": candidate.candidate_class,
            "CRN": candidate.candidate_crn ?? "",
            "URN": candidate.candidate_urn ?? "",
            "Department": formatDepartment(candidate.interested_department),
            "Status": candidate.candidate_status || "PENDING",
            "About the Candidate": candidate.candidate_description || "",
            "Why Eligible": candidate.candidate_why_eligible || "",
            "Reviewer Comment": candidate.candidate_comment || "",
            "Status Updated By": candidate.status_updated_by ?? "",
            "Application Date": candidate.created_at ? new Date(candidate.created_at).toLocaleString() : "",
            "Last Updated": candidate.updated_at ? new Date(candidate.updated_at).toLocaleString() : ""
          };

          const customAnswers = (candidate.custom_answers || {}) as Record<string, any>;
          answerColumns.forEach(({ questionId, label }: { questionId: string; label: string }) => {
            row[label] = formatExcelValue(customAnswers[questionId]);
          });

          return row;
        })
      );
      worksheet["!cols"] = [
        { wch: 38 }, { wch: 26 }, { wch: 32 }, { wch: 18 }, { wch: 14 }, { wch: 14 },
        { wch: 24 }, { wch: 14 }, { wch: 42 }, { wch: 42 }, { wch: 32 }, { wch: 18 },
        { wch: 22 }, { wch: 22 }, ...answerColumns.map(() => ({ wch: 32 }))
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Recruitment");
      XLSX.writeFile(workbook, "recruitment-data.xlsx");
      toast.success("Recruitment Excel file downloaded.");
    } catch (error) {
      console.error("Failed to download recruitment Excel:", error);
      toast.error("Failed to download recruitment Excel.");
    } finally {
      setIsDownloadingExcel(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchCandidates();
      fetchQuestions();
    }
  }, [userId]);

  const toggleRecruitmentStatus = async () => {
    try {
      setIsTogglingStatus(true);
      const newStatus = !recruitmentsActive;
      await settingsServices.updateSettings({ recruitmentsActive: newStatus });
      setRecruitmentsActive(newStatus);
      toast.success(newStatus ? "Registrations started successfully" : "Registrations stopped successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update registration status");
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const toggleRecruitmentStartedStatus = async () => {
    try {
      setIsTogglingRecruitmentStarted(true);
      const newStartedStatus = !isRecruitmentStarted;
      await settingsServices.updateSettings({ isRecruitmentStarted: newStartedStatus });
      setIsRecruitmentStarted(newStartedStatus);
      toast.success(newStartedStatus ? "Recruitment started successfully" : "Recruitment stopped successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update recruitment status");
    } finally {
      setIsTogglingRecruitmentStarted(false);
    }
  };

  const toggleResultsStatus = async (checked: boolean) => {
    try {
      setIsTogglingResultsStatus(true);
      const updated = await settingsServices.updateSettings({ resultsActive: checked });
      setResultsActive(updated.resultsActive);
      toast.success(checked ? "Results enabled successfully" : "Results disabled successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update results visibility");
    } finally {
      setIsTogglingResultsStatus(false);
    }
  };

  const handleEditClick = (candidate: Candidate) => {
    setEditingCandidate(candidate);
  };

  const handleViewCandidate = async (candidate: Candidate) => {
    if (!userId) return;
    
    try {
      const [details, settingsData] = await Promise.all([
        recruitmentServices.getCandidateById(userId, candidate.candidate_id),
        settingsServices.getSettings()
      ]);
      setViewingCandidate(details);
      setRecruitmentsActive(settingsData.recruitmentsActive || false);
      setIsRecruitmentStarted(settingsData.isRecruitmentStarted || false);
      setNewStatus(details.candidate_status || 'PENDING');
      setNewComment(details.candidate_comment || '');
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch candidate details");
    }
  };

  const handleStatusUpdate = async () => {
    if (!userId || !viewingCandidate) return;
    if (isInterviewee && normalizedIntervieweeDept === 'ALL' && newStatus !== 'PENDING' && newStatus !== 'PRESENT') {
      toast.error("Interviewees with ALL department access can only set status to PENDING or PRESENT.");
      return;
    }
    try {
      setIsUpdatingStatus(true);
      const payload: any = {
        candidate_status: newStatus,
        status_updated_by: Number(userId)
      };

      if (!(isInterviewee && normalizedIntervieweeDept === 'ALL')) {
        payload.candidate_comment = newComment;
      }

      await recruitmentServices.updateCandidateStatusById(userId, viewingCandidate.candidate_id, payload);
      toast.success("Candidate status updated successfully");
      setViewingCandidate({ 
        ...viewingCandidate, 
        candidate_status: newStatus,
        candidate_comment: !(isInterviewee && normalizedIntervieweeDept === 'ALL') ? newComment : viewingCandidate.candidate_comment
      });
      fetchCandidates();
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCandidate) return;

    try {
      setIsUpdating(true);
      const payload = {
        candidate_name: editingCandidate.candidate_name,
        candidate_class: editingCandidate.candidate_class,
        candidate_crn: Number(editingCandidate.candidate_crn),
        candidate_urn: editingCandidate.candidate_urn ? Number(editingCandidate.candidate_urn) : null,
        candidate_email: editingCandidate.candidate_email,
        interested_department: editingCandidate.interested_department,
      };

      await recruitmentServices.updateCandidateById(editingCandidate.candidate_id, payload);
      toast.success("Candidate updated successfully");
      setEditingCandidate(null);
      fetchCandidates();
    } catch (error: any) {
      toast.error(error.message || "Failed to update candidate");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editingCandidate) return;
    const { name, value } = e.target;
    
    if (name === "candidate_crn" || name === "candidate_urn") {
      const numericValue = value.replace(/\D/g, "");
      setEditingCandidate({ ...editingCandidate, [name]: numericValue ? Number(numericValue) : null });
    } else {
      setEditingCandidate({ ...editingCandidate, [name]: value });
    }
  };

  // Selection Handlers
  const toggleSelectCandidate = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const selectAllCandidates = () => {
    setSelectedIds(filteredCandidates.map(c => c.candidate_id));
  };

  const unselectAllCandidates = () => {
    setSelectedIds([]);
  };

  // Candidate Delete Handlers
  const promptDeleteSingle = (candidate: Candidate) => {
    setCandidateToDelete(candidate);
    setDeleteConfirmIds([candidate.candidate_id]);
  };

  const promptDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    setCandidateToDelete(null);
    setDeleteConfirmIds(selectedIds);
  };

  const confirmDeleteCandidates = async () => {
    if (!userId || deleteConfirmIds.length === 0) return;
    try {
      setIsDeleting(true);
      if (deleteConfirmIds.length === 1) {
        await recruitmentServices.deleteCandidateById(userId, deleteConfirmIds[0]);
        toast.success("Candidate deleted successfully");
      } else {
        await recruitmentServices.deleteMultipleCandidates(userId, deleteConfirmIds);
        toast.success(`${deleteConfirmIds.length} candidates deleted successfully`);
      }

      setSelectedIds(prev => prev.filter(id => !deleteConfirmIds.includes(id)));
      
      if (viewingCandidate && deleteConfirmIds.includes(viewingCandidate.candidate_id)) {
        setViewingCandidate(null);
      }

      setDeleteConfirmIds([]);
      setCandidateToDelete(null);
      fetchCandidates();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete candidate(s)");
    } finally {
      setIsDeleting(false);
    }
  };

  // Archive Handlers
  const handleArchiveConfirm = async () => {
    if (!userId || !recruitmentArchiveDate.trim()) {
      toast.error("Please enter a valid recruitment date/title");
      return;
    }
    try {
      setIsArchiving(true);
      const result = await recruitmentServices.archiveAllData(userId, recruitmentArchiveDate.trim());
      toast.success(result.message || "Recruitment data archived successfully");
      setIsArchiveModalOpen(false);
      setSelectedIds([]);
      fetchCandidates();
    } catch (error: any) {
      toast.error(error.message || "Failed to archive recruitment data");
    } finally {
      setIsArchiving(false);
    }
  };

  // --- Form Builder Question Handlers ---
  const openAddQuestionModal = () => {
    setEditingQuestion(null);
    setQuestionFormData({
      question_label: "",
      question_type: "SHORT_TEXT",
      options: [],
      placeholder: "",
      is_required: true,
      is_active: true
    });
    setNewOptionInput("");
    setIsQuestionModalOpen(true);
  };

  const openEditQuestionModal = (q: RecruitmentQuestion) => {
    setEditingQuestion(q);
    setQuestionFormData({
      question_label: q.question_label,
      question_type: q.question_type,
      options: q.options || [],
      placeholder: q.placeholder || "",
      is_required: q.is_required,
      is_active: q.is_active
    });
    setNewOptionInput("");
    setIsQuestionModalOpen(true);
  };

  const handleAddOption = () => {
    if (!newOptionInput.trim()) return;
    if (questionFormData.options.includes(newOptionInput.trim())) {
      toast.error("Option already exists");
      return;
    }
    setQuestionFormData(prev => ({
      ...prev,
      options: [...prev.options, newOptionInput.trim()]
    }));
    setNewOptionInput("");
  };

  const handleRemoveOption = (index: number) => {
    setQuestionFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    if (!questionFormData.question_label.trim()) {
      toast.error("Question prompt/label is required");
      return;
    }

    if (
      (questionFormData.question_type === 'DROPDOWN' || questionFormData.question_type === 'MULTIPLE_CHOICE') &&
      questionFormData.options.length === 0
    ) {
      toast.error("Please add at least one choice option for dropdown/multiple choice questions");
      return;
    }

    try {
      setIsSavingQuestion(true);
      if (editingQuestion) {
        await recruitmentServices.updateQuestion(userId, editingQuestion.question_id, questionFormData);
        toast.success("Question updated successfully");
      } else {
        const payload = {
          ...questionFormData,
          order_index: questions.length
        };
        await recruitmentServices.createQuestion(userId, payload);
        toast.success("Question added successfully");
      }
      setIsQuestionModalOpen(false);
      fetchQuestions();
    } catch (error: any) {
      toast.error(error.message || "Failed to save question");
    } finally {
      setIsSavingQuestion(false);
    }
  };

  const toggleQuestionActive = async (q: RecruitmentQuestion) => {
    if (!userId) return;
    try {
      const updatedStatus = !q.is_active;
      await recruitmentServices.updateQuestion(userId, q.question_id, { is_active: updatedStatus });
      toast.success(updatedStatus ? "Question activated" : "Question deactivated");
      fetchQuestions();
    } catch (error: any) {
      toast.error(error.message || "Failed to update question status");
    }
  };

  const moveQuestion = async (index: number, direction: 'up' | 'down') => {
    if (!userId) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;

    const currentQ = questions[index];
    const targetQ = questions[targetIndex];

    try {
      await Promise.all([
        recruitmentServices.updateQuestion(userId, currentQ.question_id, { order_index: targetIndex }),
        recruitmentServices.updateQuestion(userId, targetQ.question_id, { order_index: index })
      ]);
      fetchQuestions();
    } catch (error: any) {
      toast.error("Failed to reorder questions");
    }
  };

  const confirmDeleteQuestion = async () => {
    if (!userId || !questionToDelete) return;
    try {
      setIsDeletingQuestion(true);
      await recruitmentServices.deleteQuestion(userId, questionToDelete.question_id);
      toast.success("Question deleted successfully");
      setQuestionToDelete(null);
      fetchQuestions();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete question");
    } finally {
      setIsDeletingQuestion(false);
    }
  };

  const getQuestionTypeLabel = (type: RecruitmentQuestion['question_type']) => {
    switch (type) {
      case 'SHORT_TEXT': return 'Short Text Input';
      case 'LONG_TEXT': return 'Long Paragraph (Textarea)';
      case 'DROPDOWN': return 'Dropdown (Single Select)';
      case 'MULTIPLE_CHOICE': return 'Multiple Choice Checkboxes';
      case 'CHECKBOX': return 'Single Checkbox (Agreement)';
      default: return type;
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Page Title & Main Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
              Recruitments
            </h1>
            <p className="text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              Manage recruitment applications and form builder questions
            </p>
          </div>
          <div className="flex gap-3 items-center flex-wrap">
            {!isInterviewee && activeTab === 'applications' && selectedIds.length > 0 && (
              <button
                onClick={promptDeleteSelected}
                className="px-5 py-3 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 transition-all shadow-lg shadow-red-500/30 flex items-center gap-2 hover:-translate-y-0.5"
              >
                <Trash2 className="w-5 h-5" />
                Delete Selected ({selectedIds.length})
              </button>
            )}

            {!isInterviewee && activeTab === 'applications' && (
              <button
                onClick={downloadRecruitmentExcel}
                disabled={isDownloadingExcel || !userId}
                className="px-5 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDownloadingExcel ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                {isDownloadingExcel ? "Preparing Excel..." : "Download Excel"}
              </button>
            )}

            {!isInterviewee && activeTab === 'applications' && (
              <button
                onClick={() => setIsArchiveModalOpen(true)}
                disabled={candidates.length === 0}
                className="px-5 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Archive current recruitment data to history and clear list"
              >
                <Archive className="w-5 h-5" />
                Archive & Clear All
              </button>
            )}

            {!isInterviewee && activeTab === 'form_builder' && (
              <button
                onClick={openAddQuestionModal}
                className="px-5 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2 hover:-translate-y-0.5"
              >
                <Plus className="w-5 h-5" />
                Add Question
              </button>
            )}

            {!isInterviewee && (
              <Link
                to="/results"
                className="px-5 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-2 hover:-translate-y-0.5"
                title="View public selected candidates results page"
              >
                <Trophy className="w-5 h-5 text-amber-300 animate-pulse" />
                Show Results
                <ExternalLink className="w-4 h-4 text-emerald-200" />
              </Link>
            )}

            {!isInterviewee && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                    Results
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                    {resultsActive ? "ON" : "OFF"}
                  </span>
                </div>
                <Switch
                  checked={resultsActive}
                  onCheckedChange={toggleResultsStatus}
                  disabled={isTogglingResultsStatus}
                />
              </div>
            )}

            {!isInterviewee && (
              <button
                onClick={toggleRecruitmentStatus}
                disabled={isTogglingStatus}
                className={`px-6 py-3 rounded-xl font-semibold text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 ${
                  recruitmentsActive 
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-red-500/30' 
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/30'
                }`}
              >
                {isTogglingStatus ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                {recruitmentsActive ? "Stop Registrations" : "Start Registrations"}
              </button>
            )}

            {!isInterviewee && (
              <button
                onClick={toggleRecruitmentStartedStatus}
                disabled={isTogglingRecruitmentStarted}
                className={`px-6 py-3 rounded-xl font-semibold text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 ${
                  isRecruitmentStarted 
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-orange-500/30'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/30'
                }`}
              >
                {isTogglingRecruitmentStarted ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                {isRecruitmentStarted ? "Stop Recruitment" : "Start Recruitment"}
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs (Applications vs Form Builder) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3 gap-4">
          <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl overflow-x-auto">
            <button
              onClick={() => setActiveTab('applications')}
              className={`px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'applications'
                  ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              Applications ({filteredCandidates.length})
            </button>

            {!isInterviewee && (
              <button
                onClick={() => setActiveTab('form_builder')}
                className={`px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'form_builder'
                    ? 'bg-white dark:bg-gray-900 text-purple-600 dark:text-purple-400 shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4" />
                Form Builder ({questions.length})
              </button>
            )}
          </div>

          {activeTab === 'applications' && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {!isInterviewee || normalizedIntervieweeDept === 'ALL' ? (
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 font-semibold text-sm"
                >
                  <option value="ALL">All Departments</option>
                  <option value="TECHNICAL">Technical</option>
                  <option value="EVENT_MANAGEMENT">Event Management</option>
                  <option value="FINANCE_&_MARKET_RELATIONS">Finance & Market Relations</option>
                  <option value="CREATIVE_&_PHOTOGRAPHY">Creative & Photography</option>
                  <option value="PROMOTION">Promotion</option>
                  <option value="ANCHORING">Anchoring</option>
                </select>
              ) : (
                <div className="px-4 py-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-bold text-sm">
                  Department: {formatDepartment(normalizedIntervieweeDept) || 'Assigned Department'}
                </div>
              )}

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 font-semibold text-sm"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="PRESENT">Present</option>
                <option value="SELECTED">Selected</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          )}
        </div>

        {/* --- TAB 1: APPLICATIONS LIST --- */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            {!isInterviewee && (
              <div className="flex items-center gap-4">
                {!isSelectionMode ? (
                  <button
                    onClick={() => setIsSelectionMode(true)}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1.5"
                  >
                    <CheckSquare className="w-4 h-4" />
                    Select Multiple
                  </button>
                ) : (
                  <div className="flex items-center gap-4">
                    <button
                      onClick={selectAllCandidates}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
                    >
                      Select All ({filteredCandidates.length})
                    </button>
                    <button
                      onClick={unselectAllCandidates}
                      className="text-sm font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:underline"
                    >
                      Unselect All
                    </button>
                    <button
                      onClick={() => {
                        setIsSelectionMode(false);
                        unselectAllCandidates();
                      }}
                      className="text-sm font-semibold text-red-500 hover:text-red-600 hover:underline"
                    >
                      Exit Selection
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden min-h-[400px] flex flex-col shadow-sm">
            <div className="overflow-x-auto flex-1">
              <AnimatePresence mode="wait">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                     <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                     <p className="text-gray-500">Loading candidates...</p>
                  </div>
                ) : filteredCandidates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                     <p className="text-gray-500">No candidates found.</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        {isSelectionMode && (
                          <th className="px-4 py-4 text-center w-12">
                            <button
                              onClick={selectedIds.length === filteredCandidates.length ? unselectAllCandidates : selectAllCandidates}
                              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                              {selectedIds.length > 0 && selectedIds.length === filteredCandidates.length ? (
                                <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              ) : (
                                <Square className="w-5 h-5" />
                              )}
                            </button>
                          </th>
                        )}
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Class</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">CRN</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">URN</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Department</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        {!isInterviewee && (
                          <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {filteredCandidates.map((candidate) => {
                        const isSelected = selectedIds.includes(candidate.candidate_id);
                        return (
                          <tr 
                            key={candidate.candidate_id} 
                            onClick={() => {
                              if (isSelectionMode) {
                                toggleSelectCandidate(candidate.candidate_id);
                              } else {
                                handleViewCandidate(candidate);
                              }
                            }}
                            className={`transition-colors ${
                              isSelected ? 'bg-blue-50/60 dark:bg-blue-950/30' : ''
                            } hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer`}
                          >
                            {isSelectionMode && (
                              <td className="px-4 py-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    toggleSelectCandidate(candidate.candidate_id);
                                  }}
                                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                                />
                              </td>
                            )}
                            <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{candidate.candidate_name}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{candidate.candidate_email}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{candidate.candidate_class}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{candidate.candidate_crn || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{candidate.candidate_urn || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{formatDepartment(candidate.interested_department)}</td>
                            <td className="px-6 py-4 text-sm">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                candidate.candidate_status === 'SELECTED' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' :
                                candidate.candidate_status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' :
                                candidate.candidate_status === 'IN_REVIEW' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' :
                                candidate.candidate_status === 'PRESENT' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
                                'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
                              }`}>
                                {candidate.candidate_status === 'IN_REVIEW' ? 'IN REVIEW' : (candidate.candidate_status || 'PENDING')}
                              </span>
                            </td>
                            {!isInterviewee && (
                              <td className="px-6 py-4 text-sm text-center">
                                <div className="flex items-center justify-center gap-1">
                                  {!recruitmentsActive && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditClick(candidate);
                                      }}
                                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                                      title="Edit Candidate"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      promptDeleteSingle(candidate);
                                    }}
                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                                    title="Delete Candidate"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                      </tbody>
                    </table>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: FORM BUILDER --- */}
        {activeTab === 'form_builder' && (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-2xl p-4 flex items-center justify-between text-sm text-blue-900 dark:text-blue-200">
              <div>
                <span className="font-bold">Dynamic Form Builder:</span> Add custom questions that candidates will be required/prompted to answer on the recruitment form.
              </div>
              <button
                onClick={openAddQuestionModal}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" /> Add Question
              </button>
            </div>

            {loadingQuestions ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
                <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
                <p className="text-gray-500 font-medium">Loading form questions...</p>
              </div>
            ) : questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
                <Layers className="w-12 h-12 text-gray-400" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Custom Questions Configured</h3>
                <p className="text-sm text-gray-500 max-w-sm text-center">Add custom questions to tailor your recruitment application form.</p>
                <button
                  onClick={openAddQuestionModal}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add First Question
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((q, index) => (
                  <motion.div
                    key={q.question_id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-6 rounded-2xl border transition-all ${
                      q.is_active 
                        ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm' 
                        : 'bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-800/60 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center gap-1 pt-0.5">
                          <button
                            onClick={() => moveQuestion(index, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 transition-colors"
                            title="Move Up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <span className="text-xs font-bold text-gray-400">#{index + 1}</span>
                          <button
                            onClick={() => moveQuestion(index, 'down')}
                            disabled={index === questions.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 transition-colors"
                            title="Move Down"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h4 className="text-base font-bold text-gray-900 dark:text-white">
                              {q.question_label}
                            </h4>

                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                              {getQuestionTypeLabel(q.question_type)}
                            </span>

                            {q.is_required ? (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                                Required
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                Optional
                              </span>
                            )}

                            {!q.is_active && (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                                Inactive / Hidden
                              </span>
                            )}
                          </div>

                          {q.placeholder && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                              Placeholder: "{q.placeholder}"
                            </p>
                          )}

                          {/* Options Preview for Dropdown / Multiple Choice */}
                          {(q.question_type === 'DROPDOWN' || q.question_type === 'MULTIPLE_CHOICE') && q.options?.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap pt-1">
                              <span className="text-xs text-gray-400 font-semibold">Options:</span>
                              {q.options.map((opt, oIdx) => (
                                <span key={oIdx} className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                  {opt}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleQuestionActive(q)}
                          className={`p-2 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold ${
                            q.is_active 
                              ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50' 
                              : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                          title={q.is_active ? "Deactivate Question" : "Activate Question"}
                        >
                          {q.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                          {q.is_active ? 'Active' : 'Inactive'}
                        </button>

                        <button
                          onClick={() => openEditQuestionModal(q)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-xl transition-colors"
                          title="Edit Question"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setQuestionToDelete(q)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-xl transition-colors"
                          title="Delete Question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Candidate Modal */}
      <AnimatePresence>
        {editingCandidate && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg overflow-hidden shadow-xl border border-gray-200 dark:border-gray-800"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Candidate</h3>
                <button
                  onClick={() => setEditingCandidate(null)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleUpdate} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    name="candidate_name"
                    value={editingCandidate.candidate_name}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    name="candidate_email"
                    value={editingCandidate.candidate_email}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class</label>
                  <input
                    type="text"
                    name="candidate_class"
                    value={editingCandidate.candidate_class}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CRN</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      name="candidate_crn"
                      value={editingCandidate.candidate_crn || ''}
                      onChange={handleEditChange}
                      required
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URN</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      name="candidate_urn"
                      value={editingCandidate.candidate_urn || ''}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                  <select
                    name="interested_department"
                    value={editingCandidate.interested_department}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="TECHNICAL">Technical</option>
                    <option value="EVENT_MANAGEMENT">Event Management</option>
                    <option value="FINANCE_&_MARKET_RELATIONS">Finance & Market Relations</option>
                    <option value="CREATIVE_&_PHOTOGRAPHY">Creative & Photography</option>
                    <option value="PROMOTION">Promotion</option>
                    <option value="ANCHORING">Anchoring</option>
                  </select>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingCandidate(null)}
                    className="px-5 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors flex items-center gap-2 shadow-md shadow-blue-500/20"
                  >
                    {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isUpdating ? "Updating..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Candidate Details Modal (With Dynamic Q&A Answers) */}
      <AnimatePresence>
        {viewingCandidate && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-800"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Candidate Details</h3>
                <button
                  onClick={() => setViewingCandidate(null)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Name</h4>
                    <p className="text-gray-900 dark:text-white mt-1 font-medium">{viewingCandidate.candidate_name}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Email</h4>
                    <p className="text-gray-900 dark:text-white mt-1 font-medium">{viewingCandidate.candidate_email}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Class</h4>
                    <p className="text-gray-900 dark:text-white mt-1 font-medium">{viewingCandidate.candidate_class}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Department</h4>
                    <p className="text-gray-900 dark:text-white mt-1 font-medium">{formatDepartment(viewingCandidate.interested_department)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">CRN</h4>
                    <p className="text-gray-900 dark:text-white mt-1 font-medium">{viewingCandidate.candidate_crn || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">URN</h4>
                    <p className="text-gray-900 dark:text-white mt-1 font-medium">{viewingCandidate.candidate_urn || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Status</h4>
                    {isRecruitmentStarted ? (
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className={`mt-1 px-3 py-1 rounded-full text-xs font-bold border-2 transition-colors focus:outline-none ${
                          newStatus === 'SELECTED' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800' :
                          newStatus === 'REJECTED' ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800' :
                          newStatus === 'IN_REVIEW' ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800' :
                          newStatus === 'PRESENT' ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800' :
                          'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-800'
                        }`}
                      >
                        <option value="PENDING" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-semibold">PENDING</option>
                        {!(isInterviewee && normalizedIntervieweeDept === 'ALL') && (
                          <option value="IN_REVIEW" className="bg-white dark:bg-gray-900 text-purple-700 dark:text-purple-400 font-semibold">IN REVIEW</option>
                        )}
                        <option value="PRESENT" className="bg-white dark:bg-gray-900 text-blue-700 dark:text-blue-400 font-semibold">PRESENT</option>
                        {!(isInterviewee && normalizedIntervieweeDept === 'ALL') && (
                          <>
                            <option value="SELECTED" className="bg-white dark:bg-gray-900 text-green-700 dark:text-green-400 font-semibold">SELECTED</option>
                            <option value="REJECTED" className="bg-white dark:bg-gray-900 text-red-700 dark:text-red-400 font-semibold">REJECTED</option>
                          </>
                        )}
                      </select>
                    ) : (
                      <div className="mt-1">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border-2 ${
                          viewingCandidate.candidate_status === 'SELECTED' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800' :
                          viewingCandidate.candidate_status === 'REJECTED' ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800' :
                          viewingCandidate.candidate_status === 'IN_REVIEW' ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800' :
                          viewingCandidate.candidate_status === 'PRESENT' ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800' :
                          'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-800'
                        }`}>
                          {viewingCandidate.candidate_status === 'IN_REVIEW' ? 'IN REVIEW' : (viewingCandidate.candidate_status || 'PENDING')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Legacy / Direct Description */}
                {viewingCandidate.candidate_description && (
                  <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Introduction</h4>
                    <p className="text-gray-900 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                      {viewingCandidate.candidate_description}
                    </p>
                  </div>
                )}

                {/* Legacy / Direct Why Eligible */}
                {viewingCandidate.candidate_why_eligible && (
                  <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Why eligible & Contribution</h4>
                    <p className="text-gray-900 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                      {viewingCandidate.candidate_why_eligible}
                    </p>
                  </div>
                )}

                {/* Dynamic Questions & Answers Display */}
                {viewingCandidate.custom_answers && Object.keys(viewingCandidate.custom_answers).length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-800 pt-6 space-y-4">
                    <h4 className="text-sm font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                      Recruiter Dynamic Form Responses
                    </h4>

                    {Object.entries(viewingCandidate.custom_answers).map(([qId, val]) => {
                      const matchedQuestion = questions.find(q => q.question_id === qId);
                      const label = matchedQuestion ? matchedQuestion.question_label : `Question (${qId.slice(0, 8)}...)`;
                      
                      let displayVal = 'No response provided';
                      if (Array.isArray(val)) {
                        displayVal = val.length > 0 ? val.join(', ') : 'None selected';
                      } else if (typeof val === 'boolean') {
                        displayVal = val ? 'Yes / Agreed' : 'No';
                      } else if (val) {
                        displayVal = String(val);
                      }

                      return (
                        <div key={qId} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                          <h5 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{label}</h5>
                          <p className="text-sm text-gray-900 dark:text-gray-200 font-medium whitespace-pre-wrap">
                            {displayVal}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {isRecruitmentStarted && !(isInterviewee && normalizedIntervieweeDept === 'ALL') && (
                  <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Reviewer Comments</h4>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add an internal comment about this candidate..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                    />
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-800">
                  {!isInterviewee ? (
                    <button
                      onClick={() => promptDeleteSingle(viewingCandidate)}
                      className="px-4 py-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 font-semibold transition-colors flex items-center gap-2 border border-red-200 dark:border-red-900/50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Candidate
                    </button>
                  ) : <div />}

                  {isRecruitmentStarted && (
                    newStatus !== viewingCandidate.candidate_status ||
                    (!(isInterviewee && normalizedIntervieweeDept === 'ALL') && newComment !== (viewingCandidate.candidate_comment || ''))
                  ) ? (
                    <button
                      onClick={handleStatusUpdate}
                      disabled={isUpdatingStatus}
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/30"
                    >
                      {isUpdatingStatus && <Loader2 className="w-4 h-4 animate-spin" />}
                      {isUpdatingStatus ? "Saving..." : "Save Status"}
                    </button>
                  ) : null}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Candidate Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmIds.length > 0 && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center gap-3 text-red-600 dark:text-red-500">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Confirm Deletion</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">This action cannot be undone</p>
                </div>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-300">
                {deleteConfirmIds.length === 1 ? (
                  <p>
                    Are you sure you want to delete candidate{" "}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {candidateToDelete?.candidate_name || 'this candidate'}
                    </span>
                    ?
                  </p>
                ) : (
                  <p>
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {deleteConfirmIds.length} candidate applications
                    </span>
                    ?
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteConfirmIds([]);
                    setCandidateToDelete(null);
                  }}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteCandidates}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors flex items-center gap-2 text-sm shadow-md shadow-red-500/20"
                >
                  {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isDeleting ? "Deleting..." : "Delete Permanently"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Archive Confirmation Modal */}
      <AnimatePresence>
        {isArchiveModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center gap-3 text-amber-600 dark:text-amber-500">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                  <Archive className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Archive Recruitment Data</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Save to history and clear candidates</p>
                </div>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-300 space-y-3">
                <p>
                  This operation will archive all current candidate records ({candidates.length}) into the recruitment history table, and then clear the current active candidates list.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Recruitment Session / Date Label
                  </label>
                  <input
                    type="text"
                    value={recruitmentArchiveDate}
                    onChange={(e) => setRecruitmentArchiveDate(e.target.value)}
                    placeholder="e.g. Recruitment August 2026"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 font-medium text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsArchiveModalOpen(false)}
                  disabled={isArchiving}
                  className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleArchiveConfirm}
                  disabled={isArchiving}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold transition-colors flex items-center gap-2 text-sm shadow-md shadow-amber-500/20"
                >
                  {isArchiving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isArchiving ? "Archiving..." : "Archive & Clear All"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- ADD / EDIT QUESTION MODAL --- */}
      <AnimatePresence>
        {isQuestionModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingQuestion ? 'Edit Question' : 'Add Form Question'}
                </h3>
                <button
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveQuestion} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Question Label / Prompt *
                  </label>
                  <input
                    type="text"
                    value={questionFormData.question_label}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, question_label: e.target.value })}
                    placeholder="e.g. What skills can you contribute to English Club?"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Question Type *
                  </label>
                  <select
                    value={questionFormData.question_type}
                    onChange={(e) => setQuestionFormData({ 
                      ...questionFormData, 
                      question_type: e.target.value as RecruitmentQuestion['question_type'] 
                    })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 text-sm font-semibold"
                  >
                    <option value="SHORT_TEXT">Short Text Input (Single Line)</option>
                    <option value="LONG_TEXT">Long Paragraph (Multi-line Textarea)</option>
                    <option value="DROPDOWN">Dropdown (Single Selection)</option>
                    <option value="MULTIPLE_CHOICE">Multiple Choice Checkboxes</option>
                    <option value="CHECKBOX">Single Checkbox (Agreement / Confirmation)</option>
                  </select>
                </div>

                {/* Options Builder for Dropdown and Multiple Choice */}
                {(questionFormData.question_type === 'DROPDOWN' || questionFormData.question_type === 'MULTIPLE_CHOICE') && (
                  <div className="space-y-2 border-t border-gray-200 dark:border-gray-800 pt-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Choices / Options *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newOptionInput}
                        onChange={(e) => setNewOptionInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddOption();
                          }
                        }}
                        placeholder="Type option name and click Add..."
                        className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      />
                      <button
                        type="button"
                        onClick={handleAddOption}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition-colors"
                      >
                        Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {questionFormData.options.map((opt, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-xs font-semibold border border-purple-200 dark:border-purple-800">
                          {opt}
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(idx)}
                            className="text-purple-500 hover:text-purple-700 dark:hover:text-purple-200"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Placeholder Hint (Optional)
                  </label>
                  <input
                    type="text"
                    value={questionFormData.placeholder}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, placeholder: e.target.value })}
                    placeholder="e.g. Type your response..."
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-800">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={questionFormData.is_required}
                      onChange={(e) => setQuestionFormData({ ...questionFormData, is_required: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                    />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Mandatory / Required</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={questionFormData.is_active}
                      onChange={(e) => setQuestionFormData({ ...questionFormData, is_active: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Active on Form</span>
                  </label>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => setIsQuestionModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingQuestion}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors flex items-center gap-2 text-sm shadow-md shadow-purple-500/20"
                  >
                    {isSavingQuestion && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSavingQuestion ? "Saving..." : "Save Question"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- DELETE QUESTION CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {questionToDelete && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center gap-3 text-red-600 dark:text-red-500">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Question</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Remove question from recruitment form</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300">
                Are you sure you want to delete question{" "}
                <span className="font-bold text-gray-900 dark:text-white">"{questionToDelete.question_label}"</span>?
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setQuestionToDelete(null)}
                  disabled={isDeletingQuestion}
                  className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteQuestion}
                  disabled={isDeletingQuestion}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors flex items-center gap-2 text-sm shadow-md shadow-red-500/20"
                >
                  {isDeletingQuestion && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isDeletingQuestion ? "Deleting..." : "Delete Question"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

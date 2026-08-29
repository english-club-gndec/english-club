import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Loader2, Edit2, X, Trash2, Archive, CheckSquare, Square, AlertTriangle,
  Plus, ArrowUp, ArrowDown, Layers, FileText, ToggleLeft, ToggleRight, CheckCircle2, Trophy, ExternalLink, Download,
  MessageCircle, Star, Sparkles, User, Hash, Phone, Mail, BookOpen, ThumbsUp, Smile, HelpCircle, Eye, RefreshCw
} from "lucide-react";
import * as XLSX from "xlsx";
import { toast, Toaster } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { recruitmentServices } from "../../../services/recruitmentServices";
import { settingsServices } from "../../../services/settingsServices";
import { Switch } from "../../components/ui/switch";
import { supabase } from "../../../lib/supabase";
import { useAdminSearch } from "../../context/AdminSearchContext";

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
  candidate_mobile_no?: string;
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

interface InterviewFeedback {
  feedback_id: string;
  candidate_name: string;
  branch_section: string;
  crn: string;
  phone_number: string;
  email_id: string;
  overall_experience?: string;
  issues_faced?: string;
  rating_process?: number | null;
  comfortable_organized?: string;
  liked_aspects?: string;
  suggestions?: string;
  excitement_level?: number | null;
  understanding_gained?: string;
  additional_thoughts?: string;
  future_interest?: string;
  created_at: string;
}

export function AdminRecruitments() {
  const { userId, logout, user } = useAuth();
  const { searchQuery, setSearchPlaceholder } = useAdminSearch();
  const isInterviewee = user?.user_role === 'INTERVIEWEE';

  useEffect(() => {
    setSearchPlaceholder("Search candidates by name, email, class, CRN, URN...");
  }, [setSearchPlaceholder]);

  const [activeTab, setActiveTab] = useState<'applications' | 'form_builder' | 'interview_feedback'>('applications');

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
  const [newMobileNo, setNewMobileNo] = useState<string>("");
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

  // Interview Feedback States
  const [feedbackList, setFeedbackList] = useState<InterviewFeedback[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [viewingFeedback, setViewingFeedback] = useState<InterviewFeedback | null>(null);
  const [feedbackToDelete, setFeedbackToDelete] = useState<InterviewFeedback | null>(null);
  const [isDeletingFeedback, setIsDeletingFeedback] = useState(false);
  const [isClearingAllFeedback, setIsClearingAllFeedback] = useState(false);
  const [isClearFeedbackModalOpen, setIsClearFeedbackModalOpen] = useState(false);
  const [feedbackRatingFilter, setFeedbackRatingFilter] = useState<string>("ALL");
  const [feedbackInterestFilter, setFeedbackInterestFilter] = useState<string>("ALL");
  const [isDownloadingFeedbackExcel, setIsDownloadingFeedbackExcel] = useState(false);

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

      const currentStatus = candidate.candidate_status || 'PENDING';
      if (currentStatus === 'PENDING') {
        return false;
      }
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

  const filteredFeedbackList = feedbackList.filter(fb => {
    const matchesRating = feedbackRatingFilter === "ALL" || String(fb.rating_process) === feedbackRatingFilter;
    const matchesInterest = feedbackInterestFilter === "ALL" || fb.future_interest === feedbackInterestFilter;

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query ||
      (fb.candidate_name && fb.candidate_name.toLowerCase().includes(query)) ||
      (fb.email_id && fb.email_id.toLowerCase().includes(query)) ||
      (fb.crn && String(fb.crn).toLowerCase().includes(query)) ||
      (fb.phone_number && fb.phone_number.toLowerCase().includes(query)) ||
      (fb.branch_section && fb.branch_section.toLowerCase().includes(query));

    return matchesRating && matchesInterest && matchesSearch;
  });

  const fetchCandidates = async (isSilent = false) => {
    if (!userId) return;
    try {
      if (!isSilent) setLoading(true);
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
      if (!isSilent) setLoading(false);
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

  const fetchInterviewFeedback = async (isSilent = false) => {
    if (!userId) return;
    try {
      if (!isSilent) setLoadingFeedback(true);
      const data = await recruitmentServices.getAllInterviewFeedback(userId);
      setFeedbackList(data || []);
    } catch (error: any) {
      console.error("Failed to fetch interview feedback:", error);
      toast.error(error.message || "Failed to fetch interview feedback responses");
    } finally {
      if (!isSilent) setLoadingFeedback(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchCandidates();
      fetchQuestions();
      fetchInterviewFeedback();

      const channel = supabase
        .channel('realtime_recruitments_candidates')
        .on(
          'postgres_changes' as any,
          { event: '*', schema: 'public', table: 'candidates' },
          () => {
            if (!document.hidden) {
              fetchCandidates(true);
            }
          }
        )
        .subscribe();

      const feedbackChannel = supabase
        .channel('realtime_interview_feedback')
        .on(
          'postgres_changes' as any,
          { event: '*', schema: 'public', table: 'interview_feedback' },
          () => {
            if (!document.hidden) {
              fetchInterviewFeedback(true);
            }
          }
        )
        .subscribe();

      const handleVisibilityChange = () => {
        if (!document.hidden) {
          fetchCandidates(true);
          fetchInterviewFeedback(true);
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);

      return () => {
        supabase.removeChannel(channel);
        supabase.removeChannel(feedbackChannel);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    }
  }, [userId]);

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

  const downloadFeedbackExcel = () => {
    if (feedbackList.length === 0) {
      toast.info("No interview feedback responses to download.");
      return;
    }
    try {
      setIsDownloadingFeedbackExcel(true);
      const worksheet = XLSX.utils.json_to_sheet(
        feedbackList.map((fb, idx) => ({
          "S.No": idx + 1,
          "Feedback ID": fb.feedback_id,
          "Candidate Name": fb.candidate_name,
          "Branch & Section": fb.branch_section,
          "CRN": fb.crn,
          "Phone Number": fb.phone_number,
          "Email ID": fb.email_id,
          "Overall Experience (Q6)": fb.overall_experience || "",
          "Issues Faced (Q7)": fb.issues_faced || "",
          "Rating Process 1-5 (Q8)": fb.rating_process ?? "",
          "Comfortable & Organized (Q9)": fb.comfortable_organized || "",
          "Liked Aspects (Q10)": fb.liked_aspects || "",
          "Suggestions (Q11)": fb.suggestions || "",
          "Excitement Level 1-5 (Q12)": fb.excitement_level ?? "",
          "Understanding Gained (Q13)": fb.understanding_gained || "",
          "Additional Thoughts (Q14)": fb.additional_thoughts || "",
          "Future Event Interest (Q15)": fb.future_interest || "",
          "Submitted At": fb.created_at ? new Date(fb.created_at).toLocaleString() : ""
        }))
      );

      worksheet["!cols"] = [
        { wch: 6 }, { wch: 38 }, { wch: 22 }, { wch: 18 }, { wch: 14 },
        { wch: 18 }, { wch: 28 }, { wch: 35 }, { wch: 35 }, { wch: 18 },
        { wch: 22 }, { wch: 35 }, { wch: 35 }, { wch: 18 }, { wch: 22 },
        { wch: 35 }, { wch: 22 }, { wch: 22 }
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Interview Feedback");
      XLSX.writeFile(workbook, "english-club-interview-feedback.xlsx");
      toast.success("Interview Feedback Excel downloaded successfully!");
    } catch (err: any) {
      toast.error("Failed to download feedback Excel.");
    } finally {
      setIsDownloadingFeedbackExcel(false);
    }
  };

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
      setNewMobileNo(details.candidate_mobile_no || '');
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
    if (isInterviewee && normalizedIntervieweeDept !== 'ALL' && newStatus === 'PENDING') {
      toast.error("You cannot set candidate status back to PENDING.");
      return;
    }
    if (isInterviewee && normalizedIntervieweeDept === 'ALL' && !newMobileNo.trim()) {
      toast.error("Phone number is required.");
      return;
    }
    try {
      setIsUpdatingStatus(true);
      const payload: any = {
        candidate_status: newStatus,
        status_updated_by: Number(userId)
      };

      if (isInterviewee && normalizedIntervieweeDept === 'ALL') {
        payload.candidate_mobile_no = newMobileNo.trim();
      } else if (newMobileNo.trim()) {
        payload.candidate_mobile_no = newMobileNo.trim();
      }

      if (!(isInterviewee && normalizedIntervieweeDept === 'ALL')) {
        payload.candidate_comment = newComment;
      }

      await recruitmentServices.updateCandidateStatusById(userId, viewingCandidate.candidate_id, payload);
      toast.success("Candidate details updated successfully");
      setViewingCandidate(null);
      fetchCandidates(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Candidate Selection & Delete Handlers
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

  // Interview Feedback Delete Handlers
  const confirmDeleteFeedback = async () => {
    if (!userId || !feedbackToDelete) return;
    try {
      setIsDeletingFeedback(true);
      await recruitmentServices.deleteInterviewFeedback(userId, feedbackToDelete.feedback_id);
      toast.success("Interview feedback response deleted");
      setFeedbackToDelete(null);
      if (viewingFeedback?.feedback_id === feedbackToDelete.feedback_id) {
        setViewingFeedback(null);
      }
      fetchInterviewFeedback();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete feedback response");
    } finally {
      setIsDeletingFeedback(false);
    }
  };

  const confirmClearAllFeedback = async () => {
    if (!userId) return;
    try {
      setIsClearingAllFeedback(true);
      const result = await recruitmentServices.clearAllInterviewFeedback(userId);
      toast.success(result.message || "All interview feedback responses cleared");
      setIsClearFeedbackModalOpen(false);
      fetchInterviewFeedback();
    } catch (error: any) {
      toast.error(error.message || "Failed to clear interview feedback responses");
    } finally {
      setIsClearingAllFeedback(false);
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

  // Feedback Analytics Calculations
  const totalFeedbackResponses = feedbackList.length;
  const ratedFeedbackCount = feedbackList.filter(f => f.rating_process).length;
  const avgProcessRating = ratedFeedbackCount > 0
    ? (feedbackList.reduce((acc, curr) => acc + (curr.rating_process || 0), 0) / ratedFeedbackCount).toFixed(1)
    : "0.0";

  const excitedFeedbackCount = feedbackList.filter(f => f.excitement_level).length;
  const avgExcitementLevel = excitedFeedbackCount > 0
    ? (feedbackList.reduce((acc, curr) => acc + (curr.excitement_level || 0), 0) / excitedFeedbackCount).toFixed(1)
    : "0.0";

  const comfortableCount = feedbackList.filter(f =>
    f.comfortable_organized === "Yes, completely" || f.comfortable_organized === "Mostly"
  ).length;
  const comfortablePct = totalFeedbackResponses > 0 ? Math.round((comfortableCount / totalFeedbackResponses) * 100) : 0;

  const futureInterestedCount = feedbackList.filter(f =>
    f.future_interest === "Yes, definitely" || f.future_interest === "Maybe"
  ).length;
  const futureInterestedPct = totalFeedbackResponses > 0 ? Math.round((futureInterestedCount / totalFeedbackResponses) * 100) : 0;

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
              Manage recruitment applications, form builder questions, and interview feedback
            </p>
          </div>
          <div className="flex gap-3 items-center flex-wrap">
            {!isInterviewee && activeTab === 'applications' && selectedIds.length > 0 && (
              <button
                onClick={promptDeleteSelected}
                className="px-5 py-3 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 transition-all shadow-lg shadow-red-500/30 flex items-center gap-2 hover:-translate-y-0.5 cursor-pointer"
              >
                <Trash2 className="w-5 h-5" />
                Delete Selected ({selectedIds.length})
              </button>
            )}

            {!isInterviewee && activeTab === 'applications' && (
              <button
                onClick={downloadRecruitmentExcel}
                disabled={isDownloadingExcel || !userId}
                className="px-5 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isDownloadingExcel ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                {isDownloadingExcel ? "Preparing Excel..." : "Download Excel"}
              </button>
            )}

            {!isInterviewee && activeTab === 'applications' && (
              <button
                onClick={() => setIsArchiveModalOpen(true)}
                disabled={candidates.length === 0}
                className="px-5 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                title="Archive current recruitment data to history and clear list"
              >
                <Archive className="w-5 h-5" />
                Archive & Clear All
              </button>
            )}

            {!isInterviewee && activeTab === 'interview_feedback' && (
              <button
                onClick={downloadFeedbackExcel}
                disabled={isDownloadingFeedbackExcel || feedbackList.length === 0}
                className="px-5 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isDownloadingFeedbackExcel ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                Download Feedback Excel
              </button>
            )}

            {!isInterviewee && activeTab === 'interview_feedback' && (
              <button
                onClick={() => setIsClearFeedbackModalOpen(true)}
                disabled={feedbackList.length === 0}
                className="px-5 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 transition-all shadow-lg shadow-rose-500/20 flex items-center gap-2 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Trash2 className="w-5 h-5" />
                Clear All Feedback
              </button>
            )}

            {!isInterviewee && activeTab === 'form_builder' && (
              <button
                onClick={openAddQuestionModal}
                className="px-5 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2 hover:-translate-y-0.5 cursor-pointer"
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
                className={`px-6 py-3 rounded-xl font-semibold text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer ${recruitmentsActive
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
                className={`px-6 py-3 rounded-xl font-semibold text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer ${isRecruitmentStarted
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

        {/* Navigation Tabs (Applications vs Form Builder vs Interview Feedback) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3 gap-4">
          <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl overflow-x-auto">
            <button
              onClick={() => setActiveTab('applications')}
              className={`px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === 'applications'
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
                className={`px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === 'form_builder'
                    ? 'bg-white dark:bg-gray-900 text-purple-600 dark:text-purple-400 shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                <Layers className="w-4 h-4" />
                Form Builder ({questions.length})
              </button>
            )}

            <button
              onClick={() => setActiveTab('interview_feedback')}
              className={`px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === 'interview_feedback'
                  ? 'bg-white dark:bg-gray-900 text-amber-600 dark:text-amber-400 shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              <MessageCircle className="w-4 h-4 text-amber-500" />
              Interview Feedback ({feedbackList.length})
            </button>
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
                {!(isInterviewee && normalizedIntervieweeDept !== 'ALL') && (
                  <option value="PENDING">Pending</option>
                )}
                <option value="IN_REVIEW">In Review</option>
                <option value="PRESENT">Present</option>
                <option value="SELECTED">Selected</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          )}

          {activeTab === 'interview_feedback' && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <select
                value={feedbackRatingFilter}
                onChange={(e) => setFeedbackRatingFilter(e.target.value)}
                className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 font-semibold text-sm"
              >
                <option value="ALL">All Ratings (1-5)</option>
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Good</option>
                <option value="3">3 - Average</option>
                <option value="2">2 - Poor</option>
                <option value="1">1 - Very Poor</option>
              </select>

              <select
                value={feedbackInterestFilter}
                onChange={(e) => setFeedbackInterestFilter(e.target.value)}
                className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 font-semibold text-sm"
              >
                <option value="ALL">All Event Interests</option>
                <option value="Yes, definitely">Yes, definitely</option>
                <option value="Maybe">Maybe</option>
                <option value="No">No</option>
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
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckSquare className="w-4 h-4" />
                    Select Multiple
                  </button>
                ) : (
                  <div className="flex items-center gap-4">
                    <button
                      onClick={selectAllCandidates}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Select All ({filteredCandidates.length})
                    </button>
                    <button
                      onClick={unselectAllCandidates}
                      className="text-sm font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:underline cursor-pointer"
                    >
                      Unselect All
                    </button>
                    <button
                      onClick={() => {
                        setIsSelectionMode(false);
                        unselectAllCandidates();
                      }}
                      className="text-sm font-semibold text-red-500 hover:text-red-600 hover:underline cursor-pointer"
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
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Phone No</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Class</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">CRN</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Department</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {filteredCandidates.map((candidate) => {
                          const isSelected = selectedIds.includes(candidate.candidate_id);
                          return (
                            <tr key={candidate.candidate_id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${isSelected ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}>
                              {isSelectionMode && (
                                <td className="px-4 py-4 text-center">
                                  <button
                                    onClick={() => toggleSelectCandidate(candidate.candidate_id)}
                                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                  >
                                    {isSelected ? (
                                      <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    ) : (
                                      <Square className="w-5 h-5" />
                                    )}
                                  </button>
                                </td>
                              )}
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                                {candidate.candidate_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                {candidate.candidate_email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600 dark:text-gray-400">
                                {candidate.candidate_mobile_no || "—"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                {candidate.candidate_class}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600 dark:text-gray-400">
                                {candidate.candidate_crn ?? "—"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                {formatDepartment(candidate.interested_department)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${candidate.candidate_status === 'SELECTED'
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                    : candidate.candidate_status === 'REJECTED'
                                      ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                                      : candidate.candidate_status === 'IN_REVIEW' || candidate.candidate_status === 'PRESENT'
                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                  }`}>
                                  {candidate.candidate_status || 'PENDING'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                                <button
                                  onClick={() => handleViewCandidate(candidate)}
                                  className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors font-medium text-xs cursor-pointer"
                                >
                                  View / Review
                                </button>
                                {!isInterviewee && (
                                  <button
                                    onClick={() => promptDeleteSingle(candidate)}
                                    className="px-2.5 py-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </td>
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

        {/* --- TAB 2: FORM BUILDER QUESTIONS --- */}
        {activeTab === 'form_builder' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configure dynamic questions for student recruitment applications
              </p>
              <button
                onClick={fetchQuestions}
                disabled={loadingQuestions}
                className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingQuestions ? 'animate-spin' : ''}`} />
                Refresh Questions
              </button>
            </div>

            <div className="space-y-3">
              {questions.map((q, index) => (
                <div
                  key={q.question_id}
                  className={`p-5 rounded-2xl bg-white dark:bg-gray-900 border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${q.is_active ? 'border-gray-200 dark:border-gray-800' : 'border-gray-200 dark:border-gray-800 opacity-60 bg-gray-50 dark:bg-gray-900/40'
                    }`}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <span className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-bold text-xs flex items-center justify-center shrink-0">
                      Q{index + 1}
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-900 dark:text-white text-base">
                          {q.question_label}
                        </h3>
                        {q.is_required && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-300 uppercase">
                            Required
                          </span>
                        )}
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300 font-mono">
                          {getQuestionTypeLabel(q.question_type)}
                        </span>
                      </div>

                      {q.options && q.options.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {q.options.map((opt, oIdx) => (
                            <span key={oIdx} className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs">
                              {opt}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => moveQuestion(index, 'up')}
                      disabled={index === 0}
                      className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveQuestion(index, 'down')}
                      disabled={index === questions.length - 1}
                      className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => toggleQuestionActive(q)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${q.is_active
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                    >
                      {q.is_active ? 'Active' : 'Inactive'}
                    </button>

                    <button
                      onClick={() => openEditQuestionModal(q)}
                      className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/50 cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setQuestionToDelete(q)}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 3: INTERVIEW FEEDBACK RESULTS DASHBOARD --- */}
        {activeTab === 'interview_feedback' && (
          <div className="space-y-8">
            {/* Analytics Metric Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Total Responses */}
              <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 font-bold">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Responses</div>
                  <div className="text-2xl font-black text-gray-900 dark:text-white font-mono">{totalFeedbackResponses}</div>
                </div>
              </div>

              {/* Avg Rating Process (Q8) */}
              <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center shrink-0 font-bold">
                  <Star className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Process Rating</div>
                  <div className="text-2xl font-black text-gray-900 dark:text-white font-mono flex items-center gap-1">
                    {avgProcessRating} <span className="text-sm font-normal text-gray-400">/ 5</span>
                  </div>
                </div>
              </div>

              {/* Avg Excitement Level (Q12) */}
              <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 flex items-center justify-center shrink-0 font-bold">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Excitement</div>
                  <div className="text-2xl font-black text-gray-900 dark:text-white font-mono flex items-center gap-1">
                    {avgExcitementLevel} <span className="text-sm font-normal text-gray-400">/ 5</span>
                  </div>
                </div>
              </div>

              {/* Process Comfort % (Q9) */}
              <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 font-bold">
                  <ThumbsUp className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Comfortable</div>
                  <div className="text-2xl font-black text-gray-900 dark:text-white font-mono">{comfortablePct}%</div>
                </div>
              </div>

              {/* Event Interest % (Q15) */}
              <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0 font-bold">
                  <Smile className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Future Interest</div>
                  <div className="text-2xl font-black text-gray-900 dark:text-white font-mono">{futureInterestedPct}%</div>
                </div>
              </div>
            </div>

            {/* Response Table */}
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
              <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between flex-wrap gap-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-amber-500" />
                  Interview Feedback Responses ({filteredFeedbackList.length})
                </h3>

                <button
                  onClick={() => fetchInterviewFeedback()}
                  disabled={loadingFeedback}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingFeedback ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              <div className="overflow-x-auto">
                {loadingFeedback ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
                    <p className="text-gray-500 text-sm">Loading feedback responses...</p>
                  </div>
                ) : filteredFeedbackList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <MessageCircle className="w-12 h-12 text-gray-400 opacity-40" />
                    <p className="text-gray-500 font-medium">No interview feedback responses recorded yet.</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Candidate Details</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Branch / CRN</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Process Rating (Q8)</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Excitement (Q12)</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Comfort (Q9)</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Future Interest (Q15)</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {filteredFeedbackList.map((fb) => (
                        <tr key={fb.feedback_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                            {fb.candidate_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            <div>{fb.branch_section}</div>
                            <div className="text-xs font-mono text-gray-400">CRN: {fb.crn || "—"}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            <div>{fb.phone_number}</div>
                            <div className="text-xs text-gray-400">{fb.email_id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold font-mono">
                            {fb.rating_process ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                                {fb.rating_process} / 5
                              </span>
                            ) : "—"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold font-mono">
                            {fb.excitement_level ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                                {fb.excitement_level} / 5
                              </span>
                            ) : "—"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 text-xs font-medium">
                              {fb.comfortable_organized || "—"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${fb.future_interest === "Yes, definitely"
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : fb.future_interest === "Maybe"
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                              }`}>
                              {fb.future_interest || "—"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                            <button
                              onClick={() => setViewingFeedback(fb)}
                              className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-950/50 dark:text-purple-400 dark:hover:bg-purple-900/50 transition-colors font-semibold text-xs cursor-pointer inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" /> Full Response
                            </button>
                            {!isInterviewee && (
                              <button
                                onClick={() => setFeedbackToDelete(fb)}
                                className="px-2.5 py-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* --- CANDIDATE VIEW / EDIT MODAL --- */}
      <AnimatePresence>
        {viewingCandidate && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 my-8 p-6 sm:p-8 space-y-6"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {viewingCandidate.candidate_name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    CRN: {viewingCandidate.candidate_crn} • Class: {viewingCandidate.candidate_class}
                  </p>
                </div>
                <button
                  onClick={() => setViewingCandidate(null)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-gray-400 uppercase font-semibold block">Email</span>
                  <span className="text-gray-900 dark:text-white font-medium">{viewingCandidate.candidate_email}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 uppercase font-semibold block">Department</span>
                  <span className="text-gray-900 dark:text-white font-medium">{formatDepartment(viewingCandidate.interested_department)}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 uppercase font-semibold block">Phone Number</span>
                  <input
                    type="tel"
                    value={newMobileNo}
                    onChange={(e) => setNewMobileNo(e.target.value)}
                    placeholder="Enter candidate phone number..."
                    className="w-full mt-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <span className="text-xs text-gray-400 uppercase font-semibold block">Application Status</span>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-semibold"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="IN_REVIEW">IN_REVIEW</option>
                    <option value="PRESENT">PRESENT</option>
                    <option value="SELECTED">SELECTED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
              </div>

              {viewingCandidate.candidate_description && (
                <div className="space-y-1">
                  <span className="text-xs text-gray-400 uppercase font-semibold block">Introduce Yourself</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl leading-relaxed">
                    {viewingCandidate.candidate_description}
                  </p>
                </div>
              )}

              {viewingCandidate.candidate_why_eligible && (
                <div className="space-y-1">
                  <span className="text-xs text-gray-400 uppercase font-semibold block">Why join English Club?</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl leading-relaxed">
                    {viewingCandidate.candidate_why_eligible}
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <span className="text-xs text-gray-400 uppercase font-semibold block">Reviewer Comment</span>
                <textarea
                  rows={2}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add evaluation comments..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setViewingCandidate(null)}
                  className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  disabled={isUpdatingStatus}
                  className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition-colors flex items-center gap-2 shadow-md"
                >
                  {isUpdatingStatus && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- INTERVIEW FEEDBACK RESPONSE DETAIL MODAL --- */}
      <AnimatePresence>
        {viewingFeedback && (
          <motion.div
            className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 my-8 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-mono font-bold uppercase mb-1">
                    Interview Feedback Response
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {viewingFeedback.candidate_name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    {viewingFeedback.branch_section} • CRN: {viewingFeedback.crn || "—"} • Submitted: {new Date(viewingFeedback.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setViewingFeedback(null)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Candidate Info Summary Box */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-gray-400 font-semibold uppercase block">Phone Number</span>
                  <span className="font-bold text-gray-900 dark:text-white">{viewingFeedback.phone_number}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold uppercase block">Email ID</span>
                  <span className="font-bold text-gray-900 dark:text-white">{viewingFeedback.email_id}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold uppercase block">Process Rating (Q8)</span>
                  <span className="font-bold text-amber-500 font-mono text-sm">{viewingFeedback.rating_process ? `${viewingFeedback.rating_process} / 5 Stars` : "N/A"}</span>
                </div>
              </div>

              {/* 15 Questions Breakdown */}
              <div className="space-y-6 text-sm">
                {/* Q6 */}
                <div className="p-4 rounded-2xl bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 space-y-2">
                  <div className="font-bold text-gray-900 dark:text-white">
                    6. Overall experience of Wednesday interview:
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-sans">
                    {viewingFeedback.overall_experience || "No response provided."}
                  </p>
                </div>

                {/* Q7 */}
                <div className="p-4 rounded-2xl bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 space-y-2">
                  <div className="font-bold text-gray-900 dark:text-white">
                    7. Issues or difficulties faced during process:
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-sans">
                    {viewingFeedback.issues_faced || "No issues reported."}
                  </p>
                </div>

                {/* Q8 & Q9 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 space-y-1">
                    <div className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase">
                      8. Overall Process Rating
                    </div>
                    <div className="text-lg font-black text-purple-900 dark:text-white font-mono">
                      {viewingFeedback.rating_process ? `${viewingFeedback.rating_process} / 5` : "Not Rated"}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-1">
                    <div className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase">
                      9. Comfortable & Organized
                    </div>
                    <div className="text-base font-black text-blue-900 dark:text-white">
                      {viewingFeedback.comfortable_organized || "—"}
                    </div>
                  </div>
                </div>

                {/* Q10 */}
                <div className="p-4 rounded-2xl bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 space-y-2">
                  <div className="font-bold text-gray-900 dark:text-white">
                    10. Particularly liked aspects:
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-sans">
                    {viewingFeedback.liked_aspects || "No specific feedback."}
                  </p>
                </div>

                {/* Q11 */}
                <div className="p-4 rounded-2xl bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 space-y-2">
                  <div className="font-bold text-gray-900 dark:text-white">
                    11. Suggestions for future interviews or events:
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-sans">
                    {viewingFeedback.suggestions || "No suggestions provided."}
                  </p>
                </div>

                {/* Q12 & Q13 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 space-y-1">
                    <div className="text-xs font-bold text-cyan-700 dark:text-cyan-300 uppercase">
                      12. Excitement Level
                    </div>
                    <div className="text-lg font-black text-cyan-900 dark:text-white font-mono">
                      {viewingFeedback.excitement_level ? `${viewingFeedback.excitement_level} / 5` : "Not Rated"}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-1">
                    <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase">
                      13. Understanding Gained
                    </div>
                    <div className="text-base font-black text-emerald-900 dark:text-white">
                      {viewingFeedback.understanding_gained || "—"}
                    </div>
                  </div>
                </div>

                {/* Q14 */}
                <div className="p-4 rounded-2xl bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 space-y-2">
                  <div className="font-bold text-gray-900 dark:text-white">
                    14. Additional thoughts shared:
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-sans">
                    {viewingFeedback.additional_thoughts || "None."}
                  </p>
                </div>

                {/* Q15 */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800 space-y-1">
                  <div className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase">
                    15. Future Event Participation Interest
                  </div>
                  <div className="text-base font-extrabold text-amber-900 dark:text-white">
                    {viewingFeedback.future_interest || "Not specified"}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setViewingFeedback(null)}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors text-sm cursor-pointer shadow-md"
                >
                  Close Response
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- SINGLE DELETE FEEDBACK CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {feedbackToDelete && (
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
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Feedback Response</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Permanently delete feedback item</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300">
                Are you sure you want to delete feedback from{" "}
                <span className="font-bold text-gray-900 dark:text-white">"{feedbackToDelete.candidate_name}"</span>?
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFeedbackToDelete(null)}
                  disabled={isDeletingFeedback}
                  className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteFeedback}
                  disabled={isDeletingFeedback}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors flex items-center gap-2 text-sm shadow-md shadow-red-500/20 cursor-pointer"
                >
                  {isDeletingFeedback && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isDeletingFeedback ? "Deleting..." : "Delete Response"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- CLEAR ALL FEEDBACK CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {isClearFeedbackModalOpen && (
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
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Clear All Interview Feedback</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Irreversible action</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300">
                Are you sure you want to delete all <span className="font-bold text-red-600">{feedbackList.length}</span> interview feedback responses? This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsClearFeedbackModalOpen(false)}
                  disabled={isClearingAllFeedback}
                  className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmClearAllFeedback}
                  disabled={isClearingAllFeedback}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors flex items-center gap-2 text-sm shadow-md shadow-red-500/20 cursor-pointer"
                >
                  {isClearingAllFeedback && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isClearingAllFeedback ? "Clearing All..." : "Clear All Feedback"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- ARCHIVE CONFIRMATION MODAL --- */}
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
                  <p className="text-xs text-gray-500 dark:text-gray-400">Save snapshot & clear active list</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                  Archive Batch Name / Date *
                </label>
                <input
                  type="text"
                  value={recruitmentArchiveDate}
                  onChange={(e) => setRecruitmentArchiveDate(e.target.value)}
                  placeholder="e.g. Recruitment August 2026"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsArchiveModalOpen(false)}
                  disabled={isArchiving}
                  className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleArchiveConfirm}
                  disabled={isArchiving}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold transition-colors flex items-center gap-2 text-sm shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  {isArchiving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isArchiving ? "Archiving..." : "Archive & Clear"}
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 my-8 p-6 sm:p-8 space-y-6"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingQuestion ? 'Edit Question' : 'Add New Question'}
                </h3>
                <button
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveQuestion} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Question Prompt / Label *
                  </label>
                  <input
                    type="text"
                    value={questionFormData.question_label}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, question_label: e.target.value })}
                    required
                    placeholder="e.g. Why do you want to join the English Club?"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Response Type *
                  </label>
                  <select
                    value={questionFormData.question_type}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, question_type: e.target.value as any })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-semibold"
                  >
                    <option value="SHORT_TEXT">Short Text Input</option>
                    <option value="LONG_TEXT">Long Paragraph (Textarea)</option>
                    <option value="DROPDOWN">Dropdown (Single Select)</option>
                    <option value="MULTIPLE_CHOICE">Multiple Choice Checkboxes</option>
                    <option value="CHECKBOX">Single Checkbox (Agreement)</option>
                  </select>
                </div>

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
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition-colors cursor-pointer"
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
                            className="text-purple-500 hover:text-purple-700 dark:hover:text-purple-200 cursor-pointer"
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
                    className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium text-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingQuestion}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors flex items-center gap-2 text-sm shadow-md shadow-purple-500/20 cursor-pointer"
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
                  className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteQuestion}
                  disabled={isDeletingQuestion}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors flex items-center gap-2 text-sm shadow-md shadow-red-500/20 cursor-pointer"
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

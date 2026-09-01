import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Calendar as CalendarIcon, Clock, MapPin, Loader2, Image as ImageIcon, LayoutGrid, List, BarChart3, Layers, ArrowUp, ArrowDown, RefreshCw, AlertTriangle, FileText } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { eventService } from "../../../services/eventService";
import { userService } from "../../../services/userService";
import { recruitmentServices } from "../../../services/recruitmentServices";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../../lib/supabase";
import { AdminFeedbackModal } from "../../components/admin/AdminFeedbackModal";

interface Event {
  id: number;
  name: string;
  shortDescription: string;
  longDescription: string;
  date: string;
  time: string;
  venue: string;
  eventType: 'INDIVIDUAL' | 'TEAM';
  maxTeamSize: number | null;
  whatsappGroupLink?: string;
  createdBy: string;
  creatorId: number;
  poster?: string;
  rulebookPdfKey?: string;
  formQuestions?: EventQuestion[];
}

interface EventQuestion {
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

import { useAdminSearch } from "../../context/AdminSearchContext";

export function AdminEvents() {
  const { userId } = useAuth();
  const { searchQuery, setSearchPlaceholder } = useAdminSearch();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    setSearchPlaceholder("Search events by title, venue, creator...");
  }, [setSearchPlaceholder]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string>("");
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const [feedbackEvent, setFeedbackEvent] = useState<{ id: number; name: string } | null>(null);
  const [usersMap, setUsersMap] = useState<Record<number, { name: string, profileUrl: string | null }>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPdfDragging, setIsPdfDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form Builder Question States
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<EventQuestion | null>(null);
  const [questionFormData, setQuestionFormData] = useState({
    question_label: "",
    question_type: "SHORT_TEXT" as EventQuestion['question_type'],
    options: [] as string[],
    placeholder: "",
    is_required: true,
    is_active: true
  });
  const [newOptionInput, setNewOptionInput] = useState("");
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<EventQuestion | null>(null);
  const [isDeletingQuestion, setIsDeletingQuestion] = useState(false);

  useEffect(() => {
    fetchEventsList();
    fetchAllUsers();
  }, [userId]);

  const fetchAllUsers = async () => {
    if (!userId) return;
    try {
      const usersData = await userService.getUsers(userId);
      const map: Record<number, { name: string, profileUrl: string | null }> = {};
      usersData.forEach((u: any) => {
        let profileUrl = null;
        const profileKey = u.members?.member_profile_picture_key;
        if (profileKey) {
          const { data } = supabase.storage.from('profile_pictures').getPublicUrl(profileKey);
          profileUrl = data.publicUrl;
        }
        map[u.user_id] = {
          name: u.members?.member_name || u.user_name,
          profileUrl
        };
      });
      setUsersMap(map);
    } catch (error) {
      console.error("Failed to fetch users for profile pictures:", error);
    }
  };

  const fetchEventsList = async () => {
    setIsLoading(true);
    try {
      const data = await eventService.getAllEvents();
      const transformedEvents = data.map((ev: any) => ({
        id: ev.event_id,
        name: ev.event_name,
        shortDescription: ev.event_short_description,
        longDescription: ev.event_long_description || "",
        date: ev.event_date,
        time: ev.event_time,
        venue: ev.event_venue,
        eventType: (ev.event_type || 'INDIVIDUAL').toUpperCase(),
        maxTeamSize: ev.max_team_size ? Number(ev.max_team_size) : null,
        whatsappGroupLink: ev.whatsapp_group_link || "",
        createdBy: ev.creater_name || "System",
        creatorId: ev.created_by,
        poster: ev.event_poster_key,
        rulebookPdfKey: ev.event_rulebook_pdf_key || "",
        formQuestions: ev.form_questions || []
      }));
      setEvents(transformedEvents);
    } catch (error) {
      toast.error("Failed to fetch events");
    } finally {
      setIsLoading(false);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    shortDescription: "",
    longDescription: "",
    date: "",
    time: "12:00 PM",
    venue: "",
    eventType: "INDIVIDUAL" as 'INDIVIDUAL' | 'TEAM',
    maxTeamSize: "",
    whatsappGroupLink: "",
    eventPoster: "",
    rulebookPdfKey: "",
    formQuestions: [] as EventQuestion[]
  });

  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [tempTime, setTempTime] = useState({ hour: "12", minute: "00", period: "PM" });

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];
  const processImageFile = (file: File, inputElement?: HTMLInputElement) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPG or PNG).");
      if (inputElement) inputElement.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const aspectRatio = img.width / img.height;
      const targetRatio = 4 / 3;
      const tolerance = 0.05;

      if (Math.abs(aspectRatio - targetRatio) > tolerance) {
        toast.error(`Invalid image aspect ratio (${img.width}x${img.height}). Only 4:3 images are allowed (e.g. 800x600, 1024x768).`);
        setPosterFile(null);
        setPreviewUrl(editingEvent?.poster ? getPublicUrl(editingEvent.poster) : "");
        if (inputElement) inputElement.value = "";
        URL.revokeObjectURL(objectUrl);
      } else {
        setPosterFile(file);
        setPreviewUrl(objectUrl);
      }
    };

    img.onerror = () => {
      toast.error("Failed to load image file.");
      setPosterFile(null);
      if (inputElement) inputElement.value = "";
      URL.revokeObjectURL(objectUrl);
    };

    img.src = objectUrl;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0], e.target);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const uploadImage = async (file: File, eventName: string) => {
    const ext = (file.name.split('.').pop() || 'png').toLowerCase();
    const eventSlug = eventName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'event';
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const fileName = `${eventSlug}-${uniqueId}.${ext}`;

    const { error } = await supabase.storage
      .from('event_posters')
      .upload(fileName, file, {
        upsert: false,
        contentType: file.type
      });

    if (error) throw error;
    return fileName;
  };

  const uploadPdf = async (file: File, eventName: string) => {
    const eventSlug = eventName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'event';
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const fileName = `${eventSlug}-rulebook-${uniqueId}.pdf`;

    const { error } = await supabase.storage
      .from('event_pdfs')
      .upload(fileName, file, {
        upsert: false,
        contentType: 'application/pdf'
      });

    if (error) throw error;
    return fileName;
  };

  const processPdfFile = (file: File, inputElement?: HTMLInputElement) => {
    if (file.type !== 'application/pdf') {
      toast.error("Please select a valid PDF file.");
      if (inputElement) inputElement.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("PDF file must be under 10 MB.");
      if (inputElement) inputElement.value = "";
      return;
    }
    setPdfFile(file);
    setPdfFileName(file.name);
  };

  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processPdfFile(e.target.files[0], e.target);
    }
  };

  const handlePdfDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isPdfDragging) setIsPdfDragging(true);
  };

  const handlePdfDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPdfDragging(false);
  };

  const handlePdfDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPdfDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processPdfFile(e.dataTransfer.files[0]);
    }
  };

  const getPdfPublicUrl = (key: string | undefined) => {
    if (!key) return "";
    const { data } = supabase.storage.from('event_pdfs').getPublicUrl(key);
    return data.publicUrl;
  };

  const getPublicUrl = (key: string | undefined) => {
    if (!key) return "";
    const { data } = supabase.storage.from('event_posters').getPublicUrl(key);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    if (formData.eventType === 'TEAM') {
      const maxTeamSize = Number(formData.maxTeamSize);
      if (!Number.isInteger(maxTeamSize) || maxTeamSize < 2) {
        toast.error("Please enter a valid maximum team size for team events.");
        return;
      }
    }

    setIsSaving(true);
    try {
      if (editingEvent) {
        let posterKey = formData.eventPoster;
        if (posterFile) {
          posterKey = await uploadImage(posterFile, formData.name);
        }

        let rulebookPdfKey = formData.rulebookPdfKey;
        if (pdfFile) {
          rulebookPdfKey = await uploadPdf(pdfFile, formData.name);
        }

        const payload = {
          event_name: formData.name,
          event_short_description: formData.shortDescription,
          event_long_description: formData.longDescription,
          event_date: formData.date,
          event_time: formData.time,
          event_venue: formData.venue,
          event_type: formData.eventType,
          max_team_size: formData.eventType === 'TEAM' ? Number(formData.maxTeamSize) : null,
          whatsapp_group_link: formData.whatsappGroupLink,
          event_poster_key: posterKey,
          event_rulebook_pdf_key: rulebookPdfKey,
          form_questions: formData.formQuestions
        };
        await eventService.updateEvent(editingEvent.id, payload);
        toast.success("Event updated successfully!");
        
        await fetchEventsList();
        closeModal();
      } else {
        if (!userId) {
          setIsSaving(false);
          return;
        }
        let posterKey = "";
        if (posterFile) {
          posterKey = await uploadImage(posterFile, formData.name);
        }
        let rulebookPdfKey = "";
        if (pdfFile) {
          rulebookPdfKey = await uploadPdf(pdfFile, formData.name);
        }
        const payload = {
          event_name: formData.name,
          event_short_description: formData.shortDescription,
          event_long_description: formData.longDescription,
          event_date: formData.date,
          event_time: formData.time,
          event_venue: formData.venue,
          event_type: formData.eventType,
          max_team_size: formData.eventType === 'TEAM' ? Number(formData.maxTeamSize) : null,
          whatsapp_group_link: formData.whatsappGroupLink,
          event_poster_key: posterKey,
          event_rulebook_pdf_key: rulebookPdfKey,
          created_by: parseInt(userId),
          form_questions: formData.formQuestions
        };
        await eventService.createEvent(payload);
        toast.success("Event created successfully!");
        
        await fetchEventsList();
        closeModal();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save event");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    setDeleteConfirmId(id);
  };

  const openModal = (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      let formattedDate = "";
      if (event.date) {
        const d = new Date(event.date);
        if (!isNaN(d.getTime())) {
          formattedDate = d.toISOString().split('T')[0];
        }
      }
      setFormData({
        name: event.name,
        shortDescription: event.shortDescription,
        longDescription: event.longDescription,
        date: formattedDate,
        time: event.time,
        venue: event.venue,
        eventType: event.eventType || 'INDIVIDUAL',
        maxTeamSize: event.maxTeamSize ? String(event.maxTeamSize) : "",
        whatsappGroupLink: event.whatsappGroupLink || "",
        eventPoster: event.poster || "",
        rulebookPdfKey: event.rulebookPdfKey || "",
        formQuestions: event.formQuestions || []
      });
      setPreviewUrl(event.poster ? getPublicUrl(event.poster) : "");
      setPdfFile(null);
      setPdfFileName(event.rulebookPdfKey ? event.rulebookPdfKey.split('/').pop() || "Rulebook.pdf" : "");
    } else {
      setEditingEvent(null);
      setFormData({
        name: "",
        shortDescription: "",
        longDescription: "",
        date: "",
        time: "12:00 PM",
        venue: "",
        eventType: "INDIVIDUAL",
        maxTeamSize: "",
        whatsappGroupLink: "",
        eventPoster: "",
        rulebookPdfKey: "",
        formQuestions: []
      });
      setPreviewUrl("");
      setPdfFile(null);
      setPdfFileName("");
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
    setPosterFile(null);
    setPreviewUrl("");
    setPdfFile(null);
    setPdfFileName("");
    setIsDragging(false);
    setIsSaving(false);
  };

  const filteredEvents = events.filter(event => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (event.name && event.name.toLowerCase().includes(q)) ||
      (event.venue && event.venue.toLowerCase().includes(q)) ||
      (event.shortDescription && event.shortDescription.toLowerCase().includes(q)) ||
      (event.longDescription && event.longDescription.toLowerCase().includes(q)) ||
      (event.createdBy && event.createdBy.toLowerCase().includes(q))
    );
  });

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

  const openEditQuestionModal = (q: EventQuestion) => {
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

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();

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

    setFormData(prev => {
      const newQuestions = [...prev.formQuestions];
      if (editingQuestion) {
        const idx = newQuestions.findIndex(q => q.question_id === editingQuestion.question_id);
        if (idx !== -1) {
          newQuestions[idx] = { ...editingQuestion, ...questionFormData };
        }
      } else {
        newQuestions.push({
          ...questionFormData,
          question_id: Date.now().toString(),
          order_index: newQuestions.length
        });
      }
      return { ...prev, formQuestions: newQuestions };
    });
    
    setIsQuestionModalOpen(false);
  };

  const toggleQuestionActive = (q: EventQuestion) => {
    setFormData(prev => {
      const newQuestions = prev.formQuestions.map(item => 
        item.question_id === q.question_id ? { ...item, is_active: !item.is_active } : item
      );
      return { ...prev, formQuestions: newQuestions };
    });
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= formData.formQuestions.length) return;
    
    setFormData(prev => {
      const newQuestions = [...prev.formQuestions];
      const temp = newQuestions[index];
      newQuestions[index] = newQuestions[targetIndex];
      newQuestions[targetIndex] = temp;
      return { ...prev, formQuestions: newQuestions };
    });
  };

  const confirmDeleteQuestion = () => {
    if (!questionToDelete) return;
    setFormData(prev => ({
      ...prev,
      formQuestions: prev.formQuestions.filter(q => q.question_id !== questionToDelete.question_id)
    }));
    setQuestionToDelete(null);
  };

  const getQuestionTypeLabel = (type: EventQuestion['question_type']) => {
    switch (type) {
      case 'SHORT_TEXT':
        return 'Short Text Input';
      case 'LONG_TEXT':
        return 'Long Paragraph (Textarea)';
      case 'DROPDOWN':
        return 'Dropdown (Single Select)';
      case 'MULTIPLE_CHOICE':
        return 'Multiple Choice Checkboxes';
      case 'CHECKBOX':
        return 'Single Checkbox (Agreement)';
      default:
        return type;
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl text-gray-900 dark:text-white mb-1 sm:mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
              Events Management
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              Create and manage club events & registration forms
            </p>
          </div>
          <div className="flex items-center gap-3">
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                  title="List View"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => openModal()}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-900 to-purple-700 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all text-xs sm:text-sm font-semibold cursor-pointer"
                style={{ fontFamily: 'Open Sans, sans-serif' }}
              >
                <Plus className="w-5 h-5" />
                Create Event
              </button>
          </div>
        </div>

        {/* --- EVENTS LIST / GRID --- */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center gap-4 py-20 min-h-[400px] w-full"
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
                  Loading upcoming events...
                </p>
              </motion.div>
            ) : filteredEvents.length === 0 ? (
              <motion.div 
                key="no-events"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-20 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl w-full"
              >
                <p className="text-gray-500 dark:text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                  {searchQuery ? `No events matched "${searchQuery}".` : "No events found. Create one to get started!"}
                </p>
              </motion.div>
            ) : viewMode === 'grid' ? (
              <motion.div 
                key="events-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 w-full"
              >
                {filteredEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setViewingEvent(event)}
                    className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:shadow-purple-500/10 transition-all group cursor-pointer flex flex-col h-full"
                  >
                    <div className="w-full aspect-[4/3] overflow-hidden relative">
                      <img 
                        src={event.poster ? getPublicUrl(event.poster) : "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=800"} 
                        alt={event.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <h3 className="text-xl text-gray-900 dark:text-white flex-1 font-bold line-clamp-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {event.name}
                        </h3>
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setFeedbackEvent({ id: event.id, name: event.name });
                            }}
                            className="p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400 transition-colors"
                            title="Feedback Results"
                          >
                            <BarChart3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal(event);
                            }}
                            className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(event.id);
                            }}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                        {event.shortDescription}
                      </p>

                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <CalendarIcon className="w-4 h-4 text-purple-700 dark:text-purple-400 flex-shrink-0" />
                          <span style={{ fontFamily: 'Open Sans, sans-serif' }}>
                            {new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4 text-purple-700 dark:text-purple-400 flex-shrink-0" />
                          <span style={{ fontFamily: 'Open Sans, sans-serif' }}>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <MapPin className="w-4 h-4 text-purple-700 dark:text-purple-400 flex-shrink-0" />
                          <span className="truncate" style={{ fontFamily: 'Open Sans, sans-serif' }}>{event.venue}</span>
                        </div>
                      </div>

                      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {usersMap[event.creatorId]?.profileUrl ? (
                            <div className="w-7 h-7 rounded-full overflow-hidden border border-purple-500/20">
                              <img src={usersMap[event.creatorId].profileUrl!} alt="" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                              {event.createdBy.charAt(0)}
                            </div>
                          )}
                          <p className="text-sm text-gray-600 dark:text-gray-300" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                            <span className="font-semibold">{event.createdBy}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="events-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider font-bold">Event</th>
                        <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider font-bold">Date & Time</th>
                        <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider font-bold">Venue</th>
                        <th className="px-6 py-4 text-right text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {filteredEvents.map((event) => (
                        <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                  <img 
                                    src={event.poster ? getPublicUrl(event.poster) : "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=200"} 
                                    alt="" 
                                    className="w-full h-full object-cover"
                                  />
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-gray-900 dark:text-white truncate">{event.name}</div>
                                <div className="text-xs text-gray-500 truncate max-w-[200px]">{event.shortDescription}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <CalendarIcon className="w-3 h-3 text-purple-500" />
                                <span>{new Date(event.date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Clock className="w-3 h-3 text-purple-400" />
                                <span>{event.time}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <MapPin className="w-3 h-3 text-purple-500" />
                              <span>{event.venue}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setFeedbackEvent({ id: event.id, name: event.name })}
                                className="p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                                title="Feedback Results"
                              >
                                <BarChart3 className="w-4 h-4" />
                                <span className="hidden sm:inline">Feedback</span>
                              </button>
                              <button
                                onClick={() => openModal(event)}
                                className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(event.id)}
                                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-8 py-6 flex items-center justify-between">
                <h2 className="text-2xl text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                  {editingEvent ? "Edit Event" : "Create New Event"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                    Event Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    style={{ fontFamily: 'Open Sans, sans-serif' }}
                  />
                </div>

                <div>
                  <label htmlFor="shortDescription" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                    Short Description
                  </label>
                  <textarea
                    id="shortDescription"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    required
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    style={{ fontFamily: 'Open Sans, sans-serif' }}
                    placeholder="Brief overview of the event"
                  />
                </div>

                <div>
                  <label htmlFor="longDescription" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                    Long Description
                  </label>
                  <textarea
                    id="longDescription"
                    value={formData.longDescription}
                    onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    style={{ fontFamily: 'Open Sans, sans-serif' }}
                    placeholder="Detailed information about the event"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="date" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                      Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      style={{ fontFamily: 'Open Sans, sans-serif' }}
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                      Time
                    </label>
                    <button
                      type="button"
                      onClick={() => setTimePickerOpen(!timePickerOpen)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white flex items-center justify-between hover:border-purple-500 transition-all"
                      style={{ fontFamily: 'Open Sans, sans-serif' }}
                    >
                      <span>{formData.time || "Select Time"}</span>
                      <Clock className="w-4 h-4 text-purple-500" />
                    </button>

                    <AnimatePresence>
                      {timePickerOpen && (
                        <>
                          <div className="fixed inset-0 z-[60]" onClick={() => setTimePickerOpen(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute bottom-full left-0 mb-2 w-72 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-4 z-[70]"
                          >
                            <div className="flex gap-4 mb-4">
                              <div className="flex-1">
                                <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 font-bold">Hour</p>
                                <div className="grid grid-cols-4 gap-1">
                                  {hours.map(h => (
                                    <button
                                      key={h}
                                      type="button"
                                      onClick={() => setTempTime({ ...tempTime, hour: h })}
                                      className={`p-1 text-xs rounded-md transition-all ${tempTime.hour === h ? 'bg-purple-600 text-white' : 'hover:bg-purple-50 dark:hover:bg-purple-900/20 text-gray-700 dark:text-gray-300'}`}
                                    >
                                      {h}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-4 mb-4">
                              <div className="flex-1">
                                <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 font-bold">Minute</p>
                                <div className="grid grid-cols-4 gap-1">
                                  {minutes.map(m => (
                                    <button
                                      key={m}
                                      type="button"
                                      onClick={() => setTempTime({ ...tempTime, minute: m })}
                                      className={`p-1 text-xs rounded-md transition-all ${tempTime.minute === m ? 'bg-purple-600 text-white' : 'hover:bg-purple-50 dark:hover:bg-purple-900/20 text-gray-700 dark:text-gray-300'}`}
                                    >
                                      {m}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                              <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                                {["AM", "PM"].map(p => (
                                  <button
                                    key={p}
                                    type="button"
                                    onClick={() => setTempTime({ ...tempTime, period: p })}
                                    className={`px-3 py-1 text-xs rounded-md transition-all ${tempTime.period === p ? 'bg-white dark:bg-gray-700 text-purple-600 shadow-sm' : 'text-gray-500'}`}
                                  >
                                    {p}
                                  </button>
                                ))}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, time: `${tempTime.hour}:${tempTime.minute} ${tempTime.period}` });
                                  setTimePickerOpen(false);
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-blue-900 to-purple-700 text-white text-xs rounded-lg font-bold"
                              >
                                Done
                              </button>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="eventType" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                      Event Type
                    </label>
                    <select
                      id="eventType"
                      value={formData.eventType}
                      onChange={(e) => setFormData({ ...formData, eventType: e.target.value as 'INDIVIDUAL' | 'TEAM' })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      style={{ fontFamily: 'Open Sans, sans-serif' }}
                    >
                      <option value="INDIVIDUAL">Individual</option>
                      <option value="TEAM">Team</option>
                    </select>
                  </div>

                  {formData.eventType === 'TEAM' && (
                    <div>
                      <label htmlFor="maxTeamSize" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                        Maximum Team Size
                      </label>
                      <input
                        type="number"
                        id="maxTeamSize"
                        min="2"
                        value={formData.maxTeamSize}
                        onChange={(e) => setFormData({ ...formData, maxTeamSize: e.target.value })}
                        required={formData.eventType === 'TEAM'}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        style={{ fontFamily: 'Open Sans, sans-serif' }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="venue" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                    Venue
                  </label>
                  <input
                    type="text"
                    id="venue"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    style={{ fontFamily: 'Open Sans, sans-serif' }}
                  />
                </div>

                <div>
                  <label htmlFor="whatsappGroupLink" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                    WhatsApp Group Link <span className="text-xs font-normal text-purple-600 dark:text-purple-400">(Optional)</span>
                  </label>
                  <input
                    type="url"
                    id="whatsappGroupLink"
                    value={formData.whatsappGroupLink}
                    onChange={(e) => setFormData({ ...formData, whatsappGroupLink: e.target.value })}
                    placeholder="https://chat.whatsapp.com/..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    style={{ fontFamily: 'Open Sans, sans-serif' }}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                    Event Poster <span className="text-xs text-purple-600 dark:text-purple-400 font-normal">(4:3 Aspect Ratio Only)</span>
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`flex flex-col items-center justify-center w-full min-h-[160px] border-2 border-dashed rounded-xl cursor-pointer transition-all overflow-hidden relative group ${
                        isDragging
                          ? 'border-purple-500 bg-purple-500/10 scale-[1.01] shadow-lg shadow-purple-500/20'
                          : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {previewUrl ? (
                        <>
                          <img src={previewUrl} className="w-full aspect-[4/3] object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Plus className="w-8 h-8 text-white" />
                            <span className="text-white text-xs font-semibold">Replace Poster</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-500 dark:text-gray-400 p-4 text-center">
                          <Plus className={`w-8 h-8 mb-2 transition-transform ${isDragging ? 'scale-125 text-purple-500 animate-bounce' : ''}`} />
                          <p className="text-xs uppercase font-bold tracking-widest" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                            {isDragging ? 'Drop 4:3 Poster Here' : 'Upload or Drag & Drop 4:3 Poster'}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-1">Supports JPG or PNG (4:3 ratio)</p>
                        </div>
                      )}
                      <input type="file" className="hidden" accept="image/jpeg,image/png" onChange={handleFileChange} />
                    </label>
                  </div>
                </div>

                {/* --- RULEBOOK PDF UPLOAD --- */}
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                    Rulebook PDF <span className="text-xs font-normal text-purple-600 dark:text-purple-400">(Optional — Max 10 MB)</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <label
                      onDragOver={handlePdfDragOver}
                      onDragLeave={handlePdfDragLeave}
                      onDrop={handlePdfDrop}
                      className={`flex items-center gap-3 flex-1 px-4 py-4 rounded-xl border-2 border-dashed cursor-pointer transition-all group ${
                        isPdfDragging
                          ? 'border-purple-500 bg-purple-500/10 scale-[1.01] shadow-lg shadow-purple-500/20'
                          : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <FileText className={`w-6 h-6 text-purple-500 transition-transform flex-shrink-0 ${isPdfDragging ? 'scale-125 animate-bounce' : 'group-hover:scale-110'}`} />
                      <div className="flex-1 min-w-0">
                        {pdfFileName ? (
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{pdfFileName}</p>
                        ) : (
                          <>
                            <p className="text-xs uppercase font-bold tracking-widest text-gray-500 dark:text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                              {isPdfDragging ? 'Drop PDF Here' : 'Upload or Drag & Drop Rulebook PDF'}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-0.5">PDF format only (max 10 MB)</p>
                          </>
                        )}
                      </div>
                      <input type="file" className="hidden" accept="application/pdf" onChange={handlePdfFileChange} />
                    </label>
                    {(pdfFileName || formData.rulebookPdfKey) && (
                      <div className="flex items-center gap-1">
                        {formData.rulebookPdfKey && !pdfFile && (
                          <a
                            href={getPdfPublicUrl(formData.rulebookPdfKey)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400 transition-colors"
                            title="View current PDF"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FileText className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setPdfFile(null);
                            setPdfFileName("");
                            setFormData({ ...formData, rulebookPdfKey: "" });
                          }}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                          title="Remove PDF"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* --- FORM BUILDER IN MODAL --- */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Form Questions
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingQuestion(null);
                        setQuestionFormData({
                          question_label: "",
                          question_type: "SHORT_TEXT",
                          options: [],
                          placeholder: "",
                          is_required: true,
                          is_active: true
                        });
                        setIsQuestionModalOpen(true);
                      }}
                      className="px-4 py-2 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 rounded-lg text-sm font-semibold hover:bg-purple-200 dark:hover:bg-purple-800/60 transition-colors"
                    >
                      + Add Question
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.formQuestions.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic">No custom questions added.</p>
                    ) : (
                      formData.formQuestions.map((q, index) => (
                        <div key={q.question_id || index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-gray-900 dark:text-white">{q.question_label}</span>
                              {q.is_required && <span className="px-2 py-0.5 text-[10px] bg-red-100 text-red-600 rounded-full font-bold">Required</span>}
                            </div>
                            <p className="text-xs text-gray-500">{getQuestionTypeLabel(q.question_type)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => moveQuestion(index, 'up')} disabled={index === 0} className="p-1.5 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md disabled:opacity-30"><ArrowUp className="w-4 h-4"/></button>
                            <button type="button" onClick={() => moveQuestion(index, 'down')} disabled={index === formData.formQuestions.length - 1} className="p-1.5 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md disabled:opacity-30"><ArrowDown className="w-4 h-4"/></button>
                            <button type="button" onClick={() => toggleQuestionActive(q)} className={`px-2 py-1 text-xs rounded-md font-bold ${q.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-700'}`}>{q.is_active ? 'Active' : 'Inactive'}</button>
                            <button type="button" onClick={() => { setEditingQuestion(q); setQuestionFormData({ question_label: q.question_label, question_type: q.question_type, options: q.options || [], placeholder: q.placeholder || "", is_required: q.is_required, is_active: q.is_active }); setIsQuestionModalOpen(true); }} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md"><Edit2 className="w-4 h-4"/></button>
                            <button type="button" onClick={() => setQuestionToDelete(q)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-md"><Trash2 className="w-4 h-4"/></button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isSaving}
                    className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-900 to-purple-700 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                        <span>{editingEvent ? "Updating Event..." : "Creating Event..."}</span>
                      </>
                    ) : (
                      <span>{editingEvent ? "Update Event" : "Create Event"}</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {viewingEvent && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewingEvent(null)}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <img 
                  src={viewingEvent.poster ? getPublicUrl(viewingEvent.poster) : "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=800"} 
                  alt={viewingEvent.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <button
                  onClick={() => setViewingEvent(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="absolute bottom-6 left-8 right-8">
                  <h2 className="text-3xl text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                    {viewingEvent.name}
                  </h2>
                </div>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <CalendarIcon className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-500">Date</p>
                      <p className="text-sm font-semibold dark:text-white">{new Date(viewingEvent.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-500">Time</p>
                      <p className="text-sm font-semibold dark:text-white">{viewingEvent.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 col-span-2">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-500">Venue</p>
                      <p className="text-sm font-semibold dark:text-white">{viewingEvent.venue}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-2">Short Description</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                      {viewingEvent.shortDescription}
                    </p>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-2">Detailed Information</h3>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap italic" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                        {viewingEvent.longDescription || "That's all for now, folks :)"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {usersMap[viewingEvent.creatorId]?.profileUrl ? (
                      <div className="w-10 h-10 rounded-full border-2 border-purple-500/20 overflow-hidden">
                        <img src={usersMap[viewingEvent.creatorId].profileUrl!} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                        {viewingEvent.createdBy.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-500">Created By</p>
                      <p className="text-xs font-semibold dark:text-white">{viewingEvent.createdBy}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewingEvent(null)}
                    className="px-6 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirmId !== null && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setDeleteConfirmId(null)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl flex flex-col items-center gap-6" 
              onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-600 dark:text-red-400">
                <Trash2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Event</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Are you sure you want to delete this event? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-4 w-full">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-5 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-850 text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const id = deleteConfirmId;
                    setDeleteConfirmId(null);
                    try {
                      await eventService.deleteEvent(id);
                      toast.success("Event deleted successfully");
                      await fetchEventsList();
                    } catch (error: any) {
                      toast.error(error.message || "Failed to delete event");
                    }
                  }}
                  className="flex-1 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-lg shadow-red-500/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {feedbackEvent && (
          <AdminFeedbackModal
            eventId={feedbackEvent.id}
            eventName={feedbackEvent.name}
            onClose={() => setFeedbackEvent(null)}
          />
        )}
      </AnimatePresence>

      {/* --- ADD/EDIT QUESTION MODAL --- */}
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
                    placeholder="e.g. Why do you want to participate?"
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
                  <p className="text-xs text-gray-500 dark:text-gray-400">Remove question from form</p>
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

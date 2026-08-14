import { motion, AnimatePresence } from "motion/react";
import { useState, useRef, useEffect, useMemo } from "react";
import {
  CheckCircle,
  X,
  Image as ImageIcon,
  Upload,
  Loader2,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code,
  ArrowLeft,
  AlertTriangle
} from "lucide-react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import UnderlineExtension from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { all, createLowlight } from 'lowlight';
import { useNavigate, useParams, useBlocker } from "react-router";
import { toast, Toaster } from "sonner";
import { supabase } from "../../lib/supabase";
import { submissionService } from "../../services/submissionService";

const lowlight = createLowlight(all);

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Force component re-render on editor transactions or selection changes
  const [, setTick] = useState(0);
  useEffect(() => {
    const handleUpdate = () => setTick(t => t + 1);
    editor.on('transaction', handleUpdate);
    editor.on('selectionUpdate', handleUpdate);
    return () => {
      editor.off('transaction', handleUpdate);
      editor.off('selectionUpdate', handleUpdate);
    };
  }, [editor]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        editor.chain().focus().setImage({ src: result }).run();
      };
      reader.readAsDataURL(file);
    }
    event.target.value = '';
  };

  const getBtnClass = (name: string, attributes?: any) => {
    const isActive = editor.isActive(name, attributes);
    return `p-2 rounded transition-all duration-200 border ${isActive
        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 font-semibold border-purple-200/50 dark:border-purple-500/30"
        : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 border-transparent"
      }`;
  };

  return (
    <div className="flex flex-wrap gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-t-xl border-b border-gray-200 dark:border-gray-700">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={getBtnClass('bold')}><Bold size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={getBtnClass('italic')}><Italic size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={getBtnClass('underline')}><UnderlineIcon size={18} /></button>
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 my-auto mx-1"></div>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={getBtnClass('heading', { level: 1 })}><Heading1 size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={getBtnClass('heading', { level: 2 })}><Heading2 size={18} /></button>
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 my-auto mx-1"></div>
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={getBtnClass('bulletList')}><List size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={getBtnClass('orderedList')}><ListOrdered size={18} /></button>
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 my-auto mx-1"></div>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={getBtnClass('blockquote')}><Quote size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={getBtnClass('codeBlock')}><Code size={18} /></button>
      <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 rounded transition-all text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"><ImageIcon size={18} /></button>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
      <div className="flex-1"></div>
      <div className="text-xs text-gray-500 my-auto px-2">Drag & Drop or click to insert images</div>
    </div>
  );
};

export function SubmitArticle() {
  const navigate = useNavigate();
  const { submissionId, editToken } = useParams<{ submissionId?: string; editToken?: string }>();
  const isEditMode = Boolean(submissionId && editToken);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loadingSubmission, setLoadingSubmission] = useState(false);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isValidatingEmail, setIsValidatingEmail] = useState(false);

  // Form States
  const [studentName, setStudentName] = useState("");
  const [year, setYear] = useState("");
  const [branch, setBranch] = useState("Select");
  const [section, setSection] = useState("");
  const [studentUrn, setStudentUrn] = useState("");
  const [studentCrn, setStudentCrn] = useState("");
  const [studentEmail, setStudentEmail] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");

  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Cropper States
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const viewportRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const branches = ['IT', 'CSE', 'RAI', 'ECE', 'CE', 'EE', 'ME', 'BBA', 'BCA'];

  const extensions = useMemo(() => [
    StarterKit.configure({
      codeBlock: false,
    }),
    CodeBlockLowlight.configure({
      lowlight,
    }),
    UnderlineExtension,
    ImageExtension.configure({
      inline: true,
      allowBase64: true,
    }),
    Placeholder.configure({
      placeholder: 'Start writing your blog/article here...',
    }),
  ], []);

  const editor = useEditor({
    extensions,
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg mx-auto focus:outline-none min-h-[400px] p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100',
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const result = e.target?.result as string;
              const { schema } = view.state;
              const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
              const node = schema.nodes.image.create({ src: result });
              const transaction = view.state.tr.insert(coordinates?.pos || 0, node);
              view.dispatch(transaction);
            };
            reader.readAsDataURL(file);
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event, slice) => {
        if (event.clipboardData && event.clipboardData.files && event.clipboardData.files[0]) {
          const file = event.clipboardData.files[0];
          if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const result = e.target?.result as string;
              const { schema } = view.state;
              const node = schema.nodes.image.create({ src: result });
              const transaction = view.state.tr.replaceSelectionWith(node);
              view.dispatch(transaction);
            };
            reader.readAsDataURL(file);
            return true;
          }
        }
        return false;
      }
    },
  });

  const checkIfDirty = () => {
    if (isSubmitting || isSubmitted) return false;
    const hasStudentName = studentName.trim() !== "";
    const hasStudentEmail = studentEmail.trim() !== "";
    const hasYear = year.trim() !== "";
    const hasSection = section.trim() !== "";
    const hasUrn = studentUrn.trim() !== "";
    const hasCrn = studentCrn.trim() !== "";
    const hasTitle = title.trim() !== "";
    const hasDescription = description.trim() !== "";
    const hasTags = tags.length > 0;
    const hasCover = coverImage !== null;
    const hasEditorContent = editor && !editor.isEmpty;

    return !!(
      hasStudentName ||
      hasStudentEmail ||
      hasYear ||
      hasSection ||
      hasUrn ||
      hasCrn ||
      hasTitle ||
      hasDescription ||
      hasTags ||
      hasCover ||
      hasEditorContent
    );
  };

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      checkIfDirty() && currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    if (blocker.state === "blocked") {
      const confirmLeave = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (confirmLeave) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (checkIfDirty()) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [studentName, studentEmail, year, section, studentUrn, studentCrn, title, description, tags, coverImage, editor, isSubmitting, isSubmitted]);

  const handleAddTag = (e: React.KeyboardEvent | React.FocusEvent) => {
    if ((e.type === 'keydown' && (e as React.KeyboardEvent).key === 'Enter') || e.type === 'blur') {
      e.preventDefault();
      if (currentTag.trim() && !tags.includes(currentTag.trim())) {
        setTags([...tags, currentTag.trim()]);
      }
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImage(file);

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCropSrc(event.target.result as string);
          setZoom(1);
          setPosition({ x: 0, y: 0 });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropCancel = () => {
    setCropSrc(null);
    if (!coverPreview) {
      setCoverImage(null);
    }
    if (coverInputRef.current) {
      coverInputRef.current.value = "";
    }
  };

  const getClientCoords = (e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) {
      if (e.touches.length > 0) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      return null;
    }
    return { x: e.clientX, y: e.clientY };
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const coords = getClientCoords(e);
    if (!coords) return;
    setIsDragging(true);
    setDragStart({ x: coords.x - position.x, y: coords.y - position.y });
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const coords = getClientCoords(e);
    if (!coords) return;
    setPosition({
      x: coords.x - dragStart.x,
      y: coords.y - dragStart.y
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleCropConfirm = () => {
    if (!viewportRef.current || !imgRef.current || !cropSrc) return;

    const viewportRect = viewportRef.current.getBoundingClientRect();
    const imgRect = imgRef.current.getBoundingClientRect();

    const L = imgRect.left - viewportRect.left;
    const T = imgRect.top - viewportRect.top;
    const W = imgRect.width;
    const H = imgRect.height;

    const naturalWidth = imgRef.current.naturalWidth;
    const naturalHeight = imgRef.current.naturalHeight;

    const S = naturalWidth / W;

    const sourceX = -L * S;
    const sourceY = -T * S;
    const sourceWidth = viewportRect.width * S;
    const sourceHeight = viewportRect.height * S;

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 450; // 16:9

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        imgRef.current,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, canvas.width, canvas.height
      );
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const originalName = coverImage?.name || "cover.png";
        const croppedFile = new File([blob], originalName, { type: blob.type });
        setCoverImage(croppedFile);

        const objectUrl = URL.createObjectURL(croppedFile);
        setCoverPreview(objectUrl);
      }
      setCropSrc(null);
    }, coverImage?.type || 'image/png', 0.9);
  };

  const processTiptapImages = async (htmlContent: string, titleSlug: string): Promise<string> => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const images = doc.querySelectorAll('img');

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const src = img.getAttribute('src');
      if (src && src.startsWith('data:image/')) {
        try {
          const fetchRes = await fetch(src);
          const blob = await fetchRes.blob();
          const ext = blob.type.split('/')[1] || 'png';
          const fileName = `blob_images/${titleSlug}-${Date.now()}-${i}.${ext}`;

          const { error } = await supabase.storage
            .from('SubmissionImages')
            .upload(fileName, blob, {
              contentType: blob.type,
              upsert: false
            });

          if (error) throw error;

          const { data: publicUrlData } = supabase.storage
            .from('SubmissionImages')
            .getPublicUrl(fileName);

          img.setAttribute('src', publicUrlData.publicUrl);
        } catch (err) {
          console.error("Failed to upload inline image", err);
        }
      }
    }
    return doc.body.innerHTML;
  };

  useEffect(() => {
    if (isEditMode && submissionId && editToken) {
      setLoadingSubmission(true);
      submissionService.getSubmissionByToken(submissionId, editToken)
        .then((sub) => {
          setStudentName(sub.student_name || "");
          setStudentEmail(sub.student_email || "");
          setStudentUrn(sub.student_urn?.toString() || "");
          setStudentCrn(sub.student_crn?.toString() || "");
          setTitle(sub.title || "");
          setDescription(sub.description || "");
          setTags(sub.tags || []);
          if (sub.image_url) {
            setCoverPreview(sub.image_url);
          }
          if (sub.rejection_reason) {
            setRejectionReason(sub.rejection_reason);
          }

          if (sub.student_class) {
            const match = sub.student_class.match(/^D(\d+)([A-Z]+)(.*)$/i);
            if (match) {
              setYear(match[1]);
              if (branches.includes(match[2].toUpperCase())) {
                setBranch(match[2].toUpperCase());
              }
              setSection(match[3]);
            } else {
              setSection(sub.student_class);
            }
          }

          if (editor && sub.body) {
            editor.commands.setContent(sub.body);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch submission for edit:", err);
          setErrorMsg(err.message || "Failed to load submission for editing.");
        })
        .finally(() => {
          setLoadingSubmission(false);
        });
    }
  }, [isEditMode, submissionId, editToken, editor]);

  const scrollToField = (fieldId: string, message: string) => {
    setErrorMsg(message);
    toast.error(message);
    setTimeout(() => {
      const element = document.getElementById(fieldId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if ('focus' in element && typeof element.focus === 'function') {
          (element as HTMLElement).focus();
        }
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
  };

  const handleEmailBlur = async () => {
    if (!studentEmail.trim() || !studentEmail.includes('@')) return;
    setIsValidatingEmail(true);
    setEmailError(null);
    const result = await submissionService.validateEmail(studentEmail);
    setIsValidatingEmail(false);
    if (!result.valid) {
      setEmailError(result.error || 'Invalid email address');
    }
  };

  const resetForm = () => {
    setStudentName(""); setYear(""); setBranch("Select"); setSection(""); setStudentUrn(""); setStudentCrn(""); setStudentEmail("");
    setTitle(""); setDescription(""); setTags([]); setCoverImage(null); setCoverPreview(null);
    setEmailError(null);
    editor?.commands.setContent('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentName.trim()) {
      scrollToField("student-name-input", "Full Name is required.");
      return;
    }
    if (!studentEmail.trim()) {
      scrollToField("student-email-input", "Email Address is required.");
      return;
    }
    if (!year.trim()) {
      scrollToField("year-input", "Academic Year is required.");
      return;
    }
    if (!branch || branch === "Select") {
      scrollToField("branch-select", "Please select your academic branch.");
      return;
    }
    if (!section.trim()) {
      scrollToField("section-input", "Section is required.");
      return;
    }
    if (!studentUrn.trim()) {
      scrollToField("urn-input", "URN is required.");
      return;
    }
    if (!studentCrn.trim()) {
      scrollToField("crn-input", "CRN is required.");
      return;
    }
    if (!title.trim()) {
      scrollToField("title-input", "Article Title is required.");
      return;
    }
    if (!description.trim()) {
      scrollToField("description-input", "Short Description is required.");
      return;
    }
    if (!coverImage && !coverPreview) {
      scrollToField("cover-image-section", "Cover image is required for your article.");
      return;
    }
    if (!editor || editor.isEmpty) {
      scrollToField("editor-section", "Blog content cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setEmailError(null);

    // Validate email with DNS MX Records & Disposable check before submitting
    const emailCheck = await submissionService.validateEmail(studentEmail);
    if (!emailCheck.valid) {
      setEmailError(emailCheck.error || 'Invalid email address');
      scrollToField("student-email-input", emailCheck.error || 'Please provide a valid and active email address.');
      setIsSubmitting(false);
      return;
    }

    try {
      const titleSlug = slugify(title) || 'article';
      let finalImageUrl = coverPreview || "";

      if (coverImage) {
        const coverExt = (coverImage.name.split('.').pop() || 'png').toLowerCase();
        const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const coverFileName = `${titleSlug}-${uniqueId}.${coverExt}`;

        const { error: coverUploadError } = await supabase.storage
          .from('SubmissionImages')
          .upload(coverFileName, coverImage, { upsert: false });

        if (coverUploadError) throw coverUploadError;

        const { data: coverPublicUrl } = supabase.storage
          .from('SubmissionImages')
          .getPublicUrl(coverFileName);

        finalImageUrl = coverPublicUrl.publicUrl;
      }

      const rawHtml = editor.getHTML();
      const processedHtml = await processTiptapImages(rawHtml, titleSlug);

      const student_class = `D${year}${branch}${section}`;

      const payload = {
        student_name: studentName,
        student_class,
        student_urn: studentUrn,
        student_crn: studentCrn,
        student_email: studentEmail,
        title,
        description,
        body: processedHtml,
        image_url: finalImageUrl,
        tags
      };

      if (isEditMode && submissionId && editToken) {
        await submissionService.editSubmissionByStudent(submissionId, editToken, payload);
      } else {
        await submissionService.createSubmission(payload);
      }

      setIsSubmitted(true);

      setTimeout(() => {
        setIsSubmitted(false);
        resetForm();
        navigate("/submit");
      }, 3000);

    } catch (error: unknown) {
      console.error("Submission error:", error);
      setErrorMsg(error instanceof Error ? error.message : "Failed to submit blog. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen py-10 md:py-24 transition-colors duration-300">
      <Toaster position="top-right" richColors />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {loadingSubmission ? (
          <div className="text-center py-32">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">Loading your submission details...</p>
          </div>
        ) : (
          <motion.div
            key="submission-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-4xl mx-auto"
          >
            <button
              onClick={() => navigate("/submit")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer font-semibold mb-6 sm:mb-8 text-sm"
            >
              <ArrowLeft size={16} />
              Back to Articles
            </button>

            <div className="text-center mb-8 sm:mb-12">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl text-gray-900 dark:text-white mb-3 sm:mb-4 tracking-tight font-extrabold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {isEditMode ? "Revise Your " : "Submit Your "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                  {isEditMode ? "Article" : "Contribution"}
                </span>
              </h1>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                {isEditMode ? "Update your article content based on editorial feedback and resubmit for review." : "Fill out your academic details and compose your publication using the rich text editor."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-gray-900 rounded-3xl sm:rounded-[2rem] shadow-xl p-4 sm:p-8 lg:p-12 border border-gray-100 dark:border-gray-800">
              {rejectionReason && (
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-5 rounded-2xl flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-base">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Editorial Feedback / Requested Changes</span>
                  </div>
                  <p className="text-sm text-amber-700 dark:text-amber-300 italic pl-7 leading-relaxed font-serif">
                    "{rejectionReason}"
                  </p>
                </div>
              )}

              {errorMsg && (
                <div id="error-banner" className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm animate-pulse">
                  <X className="w-5 h-5 shrink-0" />
                  <p className="font-semibold">{errorMsg}</p>
                </div>
              )}

            {/* Personal Details Section */}
            <div className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4">Personal Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                  <input id="student-name-input" type="text" value={studentName} onChange={e => setStudentName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                  <div className="relative">
                    <input
                      id="student-email-input"
                      type="email"
                      value={studentEmail}
                      onChange={e => {
                        setStudentEmail(e.target.value);
                        if (emailError) setEmailError(null);
                      }}
                      onBlur={handleEmailBlur}
                      className={`w-full px-4 py-3 rounded-xl border ${emailError ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-purple-500'} bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:border-transparent transition-all outline-none`}
                      placeholder="john@example.com"
                    />
                    {isValidatingEmail && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-purple-600 dark:text-purple-400 font-medium animate-pulse">
                        Checking domain...
                      </span>
                    )}
                  </div>
                  {emailError && (
                    <p className="text-xs text-red-500 font-medium mt-1.5 flex items-center gap-1">
                      <X className="w-3.5 h-3.5" />
                      {emailError}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Year</label>
                    <input id="year-input" type="text" value={year} onChange={e => setYear(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 transition-all outline-none" placeholder="3" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Branch</label>
                    <select id="branch-select" value={branch} onChange={e => setBranch(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 transition-all outline-none">
                      <option value="Select" disabled>Select Branch</option>
                      {branches.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Section</label>
                    <input id="section-input" type="text" value={section} onChange={e => setSection(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 transition-all outline-none" placeholder="B" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">URN</label>
                    <input id="urn-input" type="text" value={studentUrn} onChange={e => setStudentUrn(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 transition-all outline-none" placeholder="" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">CRN</label>
                    <input id="crn-input" type="text" value={studentCrn} onChange={e => setStudentCrn(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 transition-all outline-none" placeholder="" />
                  </div>
                </div>
              </div>
            </div>

            {/* Blog Details Section */}
            <div className="space-y-6 pt-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4">Blog Details</h2>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Title</label>
                <input id="title-input" type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-lg font-medium focus:ring-2 focus:ring-purple-500 transition-all outline-none" placeholder="Enter an engaging title..." />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Short Description</label>
                <textarea id="description-input" rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 transition-all outline-none resize-none" placeholder="Briefly describe what this blog is about..." />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Cover Image</label>
                <div id="cover-image-section" onClick={() => coverInputRef.current?.click()} className="relative overflow-hidden group border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl hover:border-purple-500 dark:hover:border-purple-400 transition-colors cursor-pointer bg-gray-50 dark:bg-gray-800/50 w-full aspect-[16/9] flex flex-col items-center justify-center p-4">
                  <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverImageChange} className="hidden" />
                  {coverPreview ? (
                    <div className="absolute inset-0 w-full h-full">
                      <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <p className="text-white font-medium flex items-center gap-2"><Upload size={20} /> Change Image</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 relative z-10 text-center">
                      <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto shadow-sm border border-gray-100 dark:border-gray-700">
                        <ImageIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 font-medium">Click to upload cover image</p>
                      <p className="text-xs text-gray-500">High quality images make your blog stand out</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tags</label>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-purple-500 transition-all flex flex-wrap gap-2 items-center">
                  <AnimatePresence>
                    {tags.map(tag => (
                      <motion.span key={tag} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-medium flex items-center gap-1">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-purple-900 dark:hover:text-purple-100"><X size={14} /></button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                  <input type="text" value={currentTag} onChange={e => setCurrentTag(e.target.value)} onKeyDown={handleAddTag} onBlur={handleAddTag} className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm p-1" placeholder={tags.length === 0 ? "Add tags (press Enter)..." : ""} />
                </div>
              </div>
            </div>

            {/* Editor Section */}
            <div className="space-y-6 pt-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4">Content</h2>
              <div id="editor-section" className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-purple-500 transition-all">
                <MenuBar editor={editor} />
                <EditorContent editor={editor} />
              </div>
            </div>

            <div className="pt-6 flex flex-col-reverse sm:flex-row gap-4">
              <button type="button" onClick={resetForm} className="px-6 py-3.5 sm:py-4 rounded-xl font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full sm:w-1/3 border border-transparent">
                Clear
              </button>
              <button type="submit" disabled={isSubmitting} className="w-full sm:flex-1 flex items-center justify-center gap-2 px-8 py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-base sm:text-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                {isSubmitting ? <><Loader2 className="animate-spin" size={24} /> Publishing...</> : "Submit Blog"}
              </button>
            </div>
          </form>
        </motion.div>
        )}
      </div>

      {/* Cropper Modal */}
      <AnimatePresence>
        {cropSrc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-950 rounded-3xl sm:rounded-[2.5rem] max-w-xl w-[92vw] p-4 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col items-center gap-4 sm:gap-6"
            >
              <div className="w-full text-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Crop Cover Image
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Drag the image to position and use the slider to zoom.
                </p>
              </div>

              {/* Viewport Box */}
              <div
                ref={viewportRef}
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={handleDragStart}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
                className="relative overflow-hidden w-full aspect-[16/9] bg-black rounded-2xl cursor-move select-none border border-gray-200 dark:border-gray-800 flex items-center justify-center shadow-inner"
              >
                <img
                  ref={imgRef}
                  src={cropSrc}
                  alt="Crop preview"
                  draggable={false}
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                    transformOrigin: "center",
                    transition: isDragging ? "none" : "transform 0.1s ease-out",
                  }}
                  className="max-w-none max-h-none pointer-events-none select-none min-w-full min-h-full object-cover"
                />

                {/* Crop frame indicator overlay */}
                <div className="absolute inset-0 border-2 border-dashed border-white/40 rounded-2xl pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"></div>
              </div>

              {/* Zoom Slider */}
              <div className="w-full flex items-center gap-4 py-2 px-1">
                <span className="text-xs font-semibold text-gray-400">Zoom</span>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.01"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-600 focus:outline-none"
                />
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 w-12 text-right">
                  {Math.round(zoom * 100)}%
                </span>
              </div>

              {/* Actions */}
              <div className="w-full flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleCropCancel}
                  className="flex-1 px-6 py-3.5 rounded-xl bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-850 text-gray-700 dark:text-gray-300 font-semibold transition-all text-sm text-center cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCropConfirm}
                  className="flex-1 px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg hover:shadow-purple-500/20 text-white font-bold transition-all text-sm text-center cursor-pointer"
                >
                  Apply Crop
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Submission Popup */}
      <AnimatePresence>
        {isSubmitted && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-[2rem] p-12 max-w-sm w-full text-center shadow-2xl border border-gray-100 dark:border-gray-800"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}>
                <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Success!</h3>
              <p className="text-gray-600 dark:text-gray-400">Your blog has been submitted successfully for review.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

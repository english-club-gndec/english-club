import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import {
  Trophy,
  Sparkles,
  Clock,
  CheckCircle,
  Calendar,
  Users,
  Megaphone,
  ArrowRight,
  Maximize2,
  X,
  Code,
  Shield,
  Camera,
  Mic,
  Award,
  ChevronDown,
  Loader2,
  MessageCircle,
  HeartHandshake,
  Sparkle,
  Zap,
  Layers,
  ArrowUpRight,
  Radio,
  Share2
} from "lucide-react";
import confetti from "canvas-confetti";
import { recruitmentServices } from "../../services/recruitmentServices";
import { settingsServices } from "../../services/settingsServices";
import { usePublicSettings } from "../hooks/usePublicSettings";
import { useAuth } from "../context/AuthContext";

interface RecruitmentQuestion {
  question_id: string;
  question_label: string;
  question_type: 'SHORT_TEXT' | 'LONG_TEXT' | 'DROPDOWN' | 'MULTIPLE_CHOICE' | 'CHECKBOX';
  options: string[];
  placeholder?: string;
  is_required: boolean;
  order_index: number;
  is_active: boolean;
}

const WhatsAppIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.572-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.119.554 4.108 1.523 5.834L0 24l6.326-1.503C8.01 23.447 9.948 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.841 0-3.578-.49-5.086-1.345l-.365-.207-3.766.895.918-3.666-.231-.382C2.55 15.753 2 13.935 2 12 2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
  </svg>
);

// Particle Canvas Background for High-Art Visual Aesthetic
function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Generate artistic floating particles
    const particleCount = Math.min(Math.floor(width / 18), 65);
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 1,
      color: [
        "rgba(147, 197, 253, ", // blue-300
        "rgba(216, 180, 254, ", // purple-300
        "rgba(252, 211, 77, ",  // amber-300
        "rgba(110, 231, 183, "  // emerald-300
      ][Math.floor(Math.random() * 4)],
      alpha: Math.random() * 0.6 + 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.005
    }));

    let mouseX = width / 2;
    let mouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render glowing lines connecting nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const lineAlpha = (1 - dist / 140) * 0.15;
            ctx.strokeStyle = `rgba(167, 139, 250, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw mouse aura glow
      const grad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 250);
      grad.addColorStop(0, "rgba(139, 92, 246, 0.08)");
      grad.addColorStop(1, "rgba(15, 23, 42, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Update and draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        p.alpha += Math.sin(Date.now() * p.pulseSpeed) * 0.01;
        const currentAlpha = Math.max(0.1, Math.min(0.8, p.alpha));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color + currentAlpha + ")";
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color + "0.6)";
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
    />
  );
}

export function JoinUs() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPosterOpen, setIsPosterOpen] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [cheerCount, setCheerCount] = useState(128);
  const [hasCheered, setHasCheered] = useState(false);

  const [formData, setFormData] = useState({
    candidate_name: "",
    year: "",
    stream: "",
    section: "",
    candidate_crn: "",
    candidate_urn: "",
    candidate_email: "",
    interested_department: "TECHNICAL",
    candidate_description: "",
    candidate_why_eligible: "",
  });

  const [dynamicQuestions, setDynamicQuestions] = useState<RecruitmentQuestion[]>([]);
  const [customAnswers, setCustomAnswers] = useState<Record<string, any>>({});
  const [recruitmentsActive, setRecruitmentsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { loading: settingsLoading, resultsActive } = usePublicSettings();
  const { isAuthenticated } = useAuth();

  // Dynamic ticker estimation
  const [timeLeft, setTimeLeft] = useState({
    hours: 18,
    minutes: 42,
    seconds: 15
  });

  const WHATSAPP_GROUP_LINK = "https://chat.whatsapp.com/DVYzuZhA0mJKE8db3YLH8a";
  const POSTER_IMAGE = "/images/recruitment-poster.jpg";

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsData, questionsData] = await Promise.all([
          settingsServices.getSettings(),
          recruitmentServices.getPublicQuestions().catch(() => [])
        ]);
        setRecruitmentsActive(settingsData.recruitmentsActive || false);
        setDynamicQuestions(questionsData || []);
      } catch (error) {
        console.error("Failed to fetch recruitment details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const triggerCheer = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 }
    });
    if (!hasCheered) {
      setCheerCount((prev) => prev + 1);
      setHasCheered(true);
    }
  };

  const handleCustomAnswerChange = (questionId: string, value: any) => {
    setCustomAnswers((prev) => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const payload = {
        candidate_name: formData.candidate_name,
        candidate_class: `D${formData.year}${formData.stream}${formData.section}`,
        candidate_crn: parseInt(formData.candidate_crn, 10),
        candidate_urn: formData.candidate_urn ? parseInt(formData.candidate_urn, 10) : undefined,
        candidate_email: formData.candidate_email,
        interested_department: formData.interested_department,
        candidate_description: formData.candidate_description,
        candidate_why_eligible: formData.candidate_why_eligible,
        custom_answers: customAnswers
      };

      await recruitmentServices.createCandidate(payload);

      setIsSubmitted(true);
      setFormData({
        candidate_name: "",
        year: "",
        stream: "",
        section: "",
        candidate_crn: "",
        candidate_urn: "",
        candidate_email: "",
        interested_department: "TECHNICAL",
        candidate_description: "",
        candidate_why_eligible: "",
      });
      setCustomAnswers({});
    } catch (error: any) {
      console.error("Error submitting application:", error);
      alert(error.message || "An error occurred while submitting. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "candidate_crn" || name === "candidate_urn") {
      const numericValue = value.replace(/\D/g, "");
      setFormData({ ...formData, [name]: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const departments = [
    {
      id: "TECHNICAL",
      title: "Technical Department",
      subtitle: "Code, Web Dev & Digital Infrastructure",
      icon: Code,
      color: "from-blue-600 to-cyan-400",
      glow: "shadow-cyan-500/20",
      badge: "Tech & Systems",
      desc: "Architecting web platforms, voting hubs, digital automation, and technical infrastructure for all club operations."
    },
    {
      id: "EVENT_MANAGEMENT",
      title: "Event Management",
      subtitle: "Stage Production & Execution",
      icon: Sparkles,
      color: "from-emerald-600 to-teal-400",
      glow: "shadow-emerald-500/20",
      badge: "Logistics & Ops",
      desc: "Orchestrating debates, stage setups, auditorium scheduling, and seamless execution of flagships events."
    },
    {
      id: "FINANCE_MARKET",
      title: "Finance & Relations",
      subtitle: "Sponsorship & Strategic Budgeting",
      icon: Shield,
      color: "from-amber-500 to-yellow-400",
      glow: "shadow-amber-500/20",
      badge: "Budget & Outreach",
      desc: "Managing resource allocations, corporate sponsorships, venue partnerships, and financial auditing."
    },
    {
      id: "CREATIVE_PHOTO",
      title: "Creative & Media",
      subtitle: "Design, Visual Art & Photography",
      icon: Camera,
      color: "from-sky-500 to-indigo-500",
      glow: "shadow-sky-500/20",
      badge: "Art & Lens",
      desc: "Crafting captivating poster art, event graphics, photography coverage, and artistic club branding."
    },
    {
      id: "PROMOTION",
      title: "Promotion & Hype",
      subtitle: "Social Media & Public Outreach",
      icon: Megaphone,
      color: "from-orange-500 to-amber-500",
      glow: "shadow-orange-500/20",
      badge: "Outreach & Hype",
      desc: "Driving campus buzz, managing Instagram & digital campaigns, and leading candidate registration drives."
    },
    {
      id: "ANCHORING",
      title: "Anchoring & Oratory",
      subtitle: "Stage Hosting & Voice of the Club",
      icon: Mic,
      color: "from-yellow-400 to-amber-400",
      glow: "shadow-yellow-500/20",
      badge: "Public Speaking",
      desc: "Commanding the stage, hosting flagship sessions, podcast discussions, and articulating the club's voice."
    }
  ];

  const pipelineSteps = [
    {
      step: "01",
      title: "Registrations Closed",
      date: "25 Aug 2026",
      status: "COMPLETED",
      icon: CheckCircle,
      desc: "Over 300+ student applications received across departments."
    },
    {
      step: "02",
      title: "Auditorium Interviews",
      date: "26 Aug 2026",
      status: "COMPLETED",
      icon: CheckCircle,
      desc: "Dynamic live interview rounds held at College Auditorium."
    },
    {
      step: "03",
      title: "Jury Deliberation",
      date: "In Progress",
      status: "ACTIVE",
      icon: Zap,
      desc: "Panel review and score aggregation across department heads."
    },
    {
      step: "04",
      title: "Official Results Unveil",
      date: "Coming Soon",
      status: "PENDING",
      icon: Trophy,
      desc: "Inducted candidate lists will be released officially."
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-purple-400" />
          <p className="text-gray-400 text-sm font-mono animate-pulse">
            Loading English Club Recruitment Portal...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-purple-500 selection:text-white relative overflow-hidden font-sans">
      {/* Interactive Particle Canvas */}
      <ParticleBackground />

      {/* Ambient Radial Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-purple-600/15 via-blue-600/10 to-transparent blur-[160px] pointer-events-none z-0" />
      <div className="absolute top-1/3 left-[-200px] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[180px] pointer-events-none z-0" />
      <div className="absolute bottom-10 right-[-150px] w-[700px] h-[700px] bg-purple-600/10 rounded-full blur-[180px] pointer-events-none z-0" />
      <div className="absolute top-2/3 right-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293712_1px,transparent_1px),linear-gradient(to_bottom,#1f293712_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10 space-y-16">
        
        {/* ========================================================================= */}
        {/* HERO SECTION: "THE VERDICT IS BREWING" / RESULTS COMING SOON */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center space-y-6 max-w-4xl mx-auto"
        >
          {/* Pulsing Status Pill */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-slate-900/90 border border-purple-500/40 text-purple-300 text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-xl shadow-xl shadow-purple-500/10 hover:border-purple-400 transition-all">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
            </span>
            <span className="font-mono text-amber-300 font-bold uppercase tracking-wider">
              RECRUITMENT RESULTS • COMING SOON
            </span>
            <span className="hidden sm:inline text-purple-400/50">|</span>
            <span className="hidden sm:inline text-gray-300 text-xs">Session 2026-27</span>
          </div>

          {/* Main Glowing Headline */}
          <div className="space-y-3">
            <h1
              className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              The Verdict is{" "}
              <span className="bg-gradient-to-r from-amber-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_10px_35px_rgba(168,85,247,0.3)]">
                Brewing.
              </span>
            </h1>
            <p
              className="text-lg sm:text-2xl text-blue-100/90 font-medium max-w-2xl mx-auto"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              "Words create impact. Ideas spark change. Your new journey is taking shape."
            </p>
          </div>

          {/* Subtle Descriptive Subtext */}
          <p
            className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed"
            style={{ fontFamily: "'Open Sans', sans-serif" }}
          >
            The interview rounds at the College Auditorium have concluded. Our executive panel is currently evaluating candidate scores and final allocations. Inducted lists will be announced shorty!
          </p>

          {/* Dynamic Live Ticker Cards */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6">
            <div className="bg-slate-900/80 border border-purple-500/30 hover:border-purple-500/60 rounded-2xl px-5 py-3.5 backdrop-blur-xl shadow-xl flex items-center gap-3 transition-all hover:scale-105">
              <Clock className="w-5 h-5 text-amber-400 animate-spin-slow" />
              <div className="text-left">
                <div className="text-[10px] text-gray-400 font-mono uppercase tracking-widest font-semibold">
                  Status Matrix
                </div>
                <div className="text-sm font-extrabold text-white flex items-center gap-1.5 font-mono">
                  EVALUATION IN PROGRESS
                </div>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-cyan-500/30 hover:border-cyan-500/60 rounded-2xl px-5 py-3.5 backdrop-blur-xl shadow-xl flex items-center gap-3 transition-all hover:scale-105">
              <Users className="w-5 h-5 text-cyan-400" />
              <div className="text-left">
                <div className="text-[10px] text-gray-400 font-mono uppercase tracking-widest font-semibold">
                  Auditorium Desk
                </div>
                <div className="text-sm font-extrabold text-cyan-300 font-mono">
                  300+ APPLICANTS
                </div>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-emerald-500/30 hover:border-emerald-500/60 rounded-2xl px-5 py-3.5 backdrop-blur-xl shadow-xl flex items-center gap-3 transition-all hover:scale-105">
              <Award className="w-5 h-5 text-emerald-400" />
              <div className="text-left">
                <div className="text-[10px] text-gray-400 font-mono uppercase tracking-widest font-semibold">
                  Departments
                </div>
                <div className="text-sm font-extrabold text-emerald-300 font-mono">
                  6 SPECIALIZED TEAMS
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons Hub */}
          <div className="pt-6 flex flex-wrap justify-center items-center gap-4">
            {/* Interview Feedback Button */}
            <Link
              to="/interview-feedback"
              className="inline-flex items-center gap-2.5 px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-0.5 transition-all group"
            >
              <MessageCircle className="w-5 h-5 text-amber-300 group-hover:scale-110 transition-transform" />
              <span>Give Interview Feedback</span>
              <ArrowUpRight className="w-4 h-4 text-cyan-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>

            {/* WhatsApp Candidates Link */}
            <a
              href={WHATSAPP_GROUP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all group"
            >
              <WhatsAppIcon className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
              <span>Join Official WhatsApp Channel</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            {/* Interactive Good Luck / Cheer Button */}
            <button
              onClick={triggerCheer}
              className="inline-flex items-center gap-2.5 px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-extrabold text-sm sm:text-base backdrop-blur-xl shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-amber-300 animate-bounce" />
              <span>Send Good Luck ({cheerCount})</span>
            </button>

            {/* View Official Results Button (when resultsActive is true or user is logged in admin) */}
            {!settingsLoading && (resultsActive || isAuthenticated) && (
              <Link
                to="/results"
                className="inline-flex items-center gap-2.5 px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-0.5 transition-all"
              >
                <Trophy className="w-5 h-5 text-amber-300" />
                <span>View Inducted Candidates</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            {/* Optional Application Form Toggle if recruitmentsActive is enabled */}
            {recruitmentsActive && (
              <button
                onClick={() => setShowApplyForm(!showApplyForm)}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-purple-600/30 border border-purple-500/40 text-purple-200 hover:bg-purple-600/40 font-semibold text-sm transition-all"
              >
                <Layers className="w-4 h-4 text-purple-300" />
                {showApplyForm ? "Hide Application Form" : "Open Application Form"}
                <ChevronDown className={`w-4 h-4 transition-transform ${showApplyForm ? "rotate-180" : ""}`} />
              </button>
            )}
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* RECRUITMENT PIPELINE TIMELINE TRACKER */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl p-6 sm:p-10 bg-slate-900/70 border border-white/10 backdrop-blur-2xl shadow-2xl space-y-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                Live Status Tracker
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Recruitment Journey & Milestones
              </h2>
            </div>
            <div className="text-xs text-gray-400 font-mono">
              Guru Nanak Dev Engineering College • Ludhiana
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Connecting Track Line for Desktop */}
            <div className="hidden md:block absolute top-1/2 left-8 right-8 h-0.5 bg-gradient-to-r from-emerald-500 via-amber-500 to-purple-500/40 -translate-y-6 z-0" />

            {pipelineSteps.map((stepItem, idx) => {
              const StepIcon = stepItem.icon;
              const isCompleted = stepItem.status === "COMPLETED";
              const isActive = stepItem.status === "ACTIVE";

              return (
                <div
                  key={idx}
                  className={`relative z-10 rounded-2xl p-5 border transition-all ${
                    isActive
                      ? "bg-gradient-to-b from-amber-500/15 via-slate-900 to-slate-900 border-amber-500/60 shadow-xl shadow-amber-500/10 scale-105"
                      : isCompleted
                      ? "bg-slate-900/90 border-emerald-500/40 text-gray-300"
                      : "bg-slate-900/40 border-white/5 opacity-70"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-gray-400">
                      STAGE {stepItem.step}
                    </span>
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shadow-md ${
                        isCompleted
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : isActive
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 animate-pulse"
                          : "bg-white/5 text-gray-500 border border-white/10"
                      }`}
                    >
                      <StepIcon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    {stepItem.title}
                  </h3>
                  <div className="text-xs font-mono text-amber-300/90 font-semibold mb-2">
                    {stepItem.date}
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed font-sans">
                    {stepItem.desc}
                  </p>

                  {isActive && (
                    <div className="mt-4 pt-3 border-t border-amber-500/20 flex items-center gap-2 text-[11px] text-amber-300 font-semibold font-mono">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                      </span>
                      Currently Underway
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* INTERACTIVE DEPARTMENT SHOWCASE CARDS */}
        {/* ========================================================================= */}
        <div className="space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-mono uppercase font-semibold">
              <Sparkle className="w-3.5 h-3.5 text-blue-400" /> Elite Wings & Teams
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Explore Our Club Departments
            </h2>
            <p className="text-sm text-gray-400">
              Each candidate is evaluated based on passion, creativity, and department compatibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept, index) => {
              const DeptIcon = dept.icon;

              return (
                <motion.div
                  key={dept.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative rounded-3xl p-6 bg-slate-900/60 border border-white/10 hover:border-white/20 transition-all hover:-translate-y-2 hover:shadow-2xl backdrop-blur-xl overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-36 h-36 bg-gradient-to-br ${dept.color} opacity-10 rounded-full blur-2xl group-hover:opacity-25 transition-opacity pointer-events-none`} />

                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${dept.color} p-0.5 shadow-lg`}>
                      <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-white">
                        <DeptIcon className="w-6 h-6" />
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-white/5 border border-white/10 text-gray-300">
                      {dept.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    {dept.title}
                  </h3>
                  <div className="text-xs font-mono text-cyan-300/80 mb-3">
                    {dept.subtitle}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-sans">
                    {dept.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* POSTER & WHATSAPP CANDIDATE SUPPORT SECTION */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Poster Showcase Box */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 flex flex-col"
          >
            <div className="relative group w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-4 flex flex-col justify-between">
              <div className="relative rounded-2xl overflow-hidden cursor-pointer flex-grow" onClick={() => setIsPosterOpen(true)}>
                <img
                  src={POSTER_IMAGE}
                  alt="English Club Recruitment Poster"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-6">
                  <span className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/90 text-slate-950 font-bold shadow-lg text-sm">
                    <Maximize2 className="w-4 h-4" /> Expand Poster
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 px-2">
                <span className="text-xs text-gray-400 font-mono">GNDEC English Club Official Campaign</span>
                <button
                  onClick={() => setIsPosterOpen(true)}
                  className="text-xs text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1 cursor-pointer"
                >
                  View High-Res <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Candidate Support & WhatsApp Hub Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 flex flex-col justify-between space-y-6"
          >
            {/* WhatsApp Official Candidates Banner */}
            <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-emerald-950/80 via-slate-900 to-teal-950/90 border border-emerald-500/40 shadow-2xl backdrop-blur-2xl overflow-hidden space-y-6">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0 text-emerald-400 shadow-inner">
                  <WhatsAppIcon className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-mono font-bold uppercase tracking-wider">
                    Official Announcement Desk
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Candidate WhatsApp Community
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                    Be the first to receive result drops, induction orientation schedules, venue guidelines, and direct updates on your phone.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-emerald-500/20">
                <span className="text-xs text-emerald-300/80 flex items-center gap-1.5 font-mono">
                  <Sparkles className="w-4 h-4 text-emerald-400" /> Free to join • Verified Channel
                </span>

                <a
                  href={WHATSAPP_GROUP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                  <span>Join Candidates Group</span>
                </a>
              </div>
            </div>

            {/* Direct Convenor Contact Box */}
            <div className="rounded-3xl p-6 bg-slate-900/70 border border-white/10 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] text-blue-300 font-mono font-bold uppercase tracking-wider">Candidate Support</div>
                  <div className="text-base font-extrabold text-white">Raghav Kamboj</div>
                  <div className="text-xs text-gray-400 font-medium">Convenor • GNDEC English Club</div>
                </div>
              </div>

              <a
                href="https://wa.me/917696045458?text=Hi,%20I%20have%20a%20query%20regarding%20English%20Club%20recruitment%20results"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs shadow-md transition-all hover:scale-105"
              >
                <WhatsAppIcon className="w-4 h-4 text-emerald-400" />
                <span>Chat on WhatsApp (+91 76960 45458)</span>
              </a>
            </div>
          </motion.div>
        </div>

        {/* ========================================================================= */}
        {/* OPTIONAL APPLICATION FORM (EXPANDED IF RECRUITMENTS ARE ACTIVE) */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {recruitmentsActive && showApplyForm && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              id="application-form"
              className="pt-8 overflow-hidden"
            >
              <div className="rounded-3xl p-6 sm:p-10 bg-slate-900/90 border border-purple-500/40 shadow-2xl backdrop-blur-2xl space-y-8">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono uppercase font-bold">
                    <Sparkles className="w-3.5 h-3.5" /> Registrations Open
                  </div>
                  <h2 className="text-3xl font-extrabold text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Candidate Registration Form
                  </h2>
                  <p className="text-sm text-gray-400">
                    Fill out the form details below to submit your application.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="candidate_name"
                        value={formData.candidate_name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="candidate_email"
                        value={formData.candidate_email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>

                    <div className="md:col-span-2 grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">
                          Year *
                        </label>
                        <select
                          name="year"
                          value={formData.year}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        >
                          <option value="" disabled>Select Year</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">
                          Stream *
                        </label>
                        <select
                          name="stream"
                          value={formData.stream}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        >
                          <option value="" disabled>Select Stream</option>
                          {['IT', 'CSE', 'RAI', 'ECE', 'CE', 'EE', 'ME', 'BBA', 'BCA'].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">
                          Section *
                        </label>
                        <input
                          type="text"
                          name="section"
                          value={formData.section}
                          onChange={handleChange}
                          required
                          placeholder="e.g. A"
                          className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">
                        CRN *
                      </label>
                      <input
                        type="text"
                        name="candidate_crn"
                        value={formData.candidate_crn}
                        onChange={handleChange}
                        placeholder="e.g. 2315001"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">
                        URN (Optional)
                      </label>
                      <input
                        type="text"
                        name="candidate_urn"
                        value={formData.candidate_urn}
                        onChange={handleChange}
                        placeholder="e.g. 2303001"
                        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">
                        Interested Department *
                      </label>
                      <select
                        name="interested_department"
                        value={formData.interested_department}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      >
                        <option value="TECHNICAL">Technical</option>
                        <option value="EVENT_MANAGEMENT">Event Management</option>
                        <option value="FINANCE_&_MARKET_RELATIONS">Finance & Market Relations</option>
                        <option value="CREATIVE_&_PHOTOGRAPHY">Creative & Photography</option>
                        <option value="PROMOTION">Promotion</option>
                        <option value="ANCHORING">Anchoring</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">
                      Introduce Yourself *
                    </label>
                    <textarea
                      name="candidate_description"
                      value={formData.candidate_description}
                      onChange={handleChange}
                      required
                      rows={3}
                      placeholder="Share your interests, skills, and background..."
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">
                      Why do you want to join English Club? *
                    </label>
                    <textarea
                      name="candidate_why_eligible"
                      value={formData.candidate_why_eligible}
                      onChange={handleChange}
                      required
                      rows={3}
                      placeholder="Explain how you can contribute..."
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-base shadow-xl hover:shadow-purple-500/30 hover:scale-[1.02] transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" /> Submitting Application...
                      </span>
                    ) : (
                      "Submit Application"
                    )}
                  </button>
                </form>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Footer Accent */}
        <div className="pt-8 text-center border-t border-white/10 text-xs text-gray-400 font-mono tracking-widest uppercase">
          GNDEC ENGLISH CLUB • COMMUNICATE &nbsp;|&nbsp; CREATE &nbsp;|&nbsp; CONNECT &nbsp;|&nbsp; GROW
        </div>
      </div>

      {/* Lightbox Modal for Poster */}
      <AnimatePresence>
        {isPosterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsPosterOpen(false)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div
              className="relative max-w-4xl max-h-[90vh] overflow-auto rounded-2xl bg-slate-900 p-2 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsPosterOpen(false)}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors z-10 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={POSTER_IMAGE}
                alt="Full Recruitment Poster"
                className="w-full h-auto max-h-[85vh] object-contain rounded-xl"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submission Success Modal */}
      <AnimatePresence>
        {isSubmitted && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-slate-900 rounded-3xl p-8 sm:p-12 max-w-md text-center shadow-2xl relative border border-white/10"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <CheckCircle className="w-20 h-20 text-emerald-400 mx-auto mb-4 animate-bounce" />
              <h3 className="text-2xl font-extrabold text-white mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Application Received!
              </h3>
              <p className="text-gray-300 text-sm mb-6">
                Thank you for applying to GNDEC English Club! Join our official WhatsApp candidates group for immediate updates.
              </p>
              <a
                href={WHATSAPP_GROUP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsSubmitted(false)}
                className="inline-flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-lg"
              >
                <WhatsAppIcon className="w-5 h-5 fill-current" />
                <span>Join WhatsApp Group</span>
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

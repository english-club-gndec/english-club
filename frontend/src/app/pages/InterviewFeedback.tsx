import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import {
  Sparkles,
  CheckCircle,
  MessageCircle,
  Star,
  Send,
  HelpCircle,
  ThumbsUp,
  Smile,
  User,
  Hash,
  Phone,
  Mail,
  BookOpen,
  Zap,
  ArrowLeft,
  Loader2
} from "lucide-react";
import confetti from "canvas-confetti";
import { recruitmentServices } from "../../services/recruitmentServices";

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

    const particleCount = Math.min(Math.floor(width / 18), 65);
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 1,
      color: [
        "rgba(147, 197, 253, ",
        "rgba(216, 180, 254, ",
        "rgba(252, 211, 77, ",
        "rgba(110, 231, 183, "
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

      const grad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 250);
      grad.addColorStop(0, "rgba(139, 92, 246, 0.08)");
      grad.addColorStop(1, "rgba(15, 23, 42, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

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

export function InterviewFeedbackPage() {
  const navigate = useNavigate();

  const [feedbackForm, setFeedbackForm] = useState({
    candidate_name: "",
    branch_section: "",
    crn: "",
    phone_number: "",
    email_id: "",
    overall_experience: "",
    issues_faced: "",
    rating_process: 0,
    comfortable_organized: "",
    liked_aspects: "",
    suggestions: "",
    excitement_level: 0,
    understanding_gained: "",
    additional_thoughts: "",
    future_interest: ""
  });

  const [isFeedbackSubmitting, setIsFeedbackSubmitting] = useState(false);
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);

  const handleFeedbackChange = (field: string, value: any) => {
    setFeedbackForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFeedbackSubmitting) return;

    if (
      !feedbackForm.candidate_name ||
      !feedbackForm.branch_section ||
      !feedbackForm.phone_number ||
      !feedbackForm.email_id
    ) {
      alert("Please fill in required candidate details (Name, Branch & Section, Phone Number, Email ID).");
      return;
    }

    setIsFeedbackSubmitting(true);
    try {
      await recruitmentServices.submitInterviewFeedback(feedbackForm);
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
      setIsFeedbackSubmitted(true);
      setFeedbackForm({
        candidate_name: "",
        branch_section: "",
        crn: "",
        phone_number: "",
        email_id: "",
        overall_experience: "",
        issues_faced: "",
        rating_process: 0,
        comfortable_organized: "",
        liked_aspects: "",
        suggestions: "",
        excitement_level: 0,
        understanding_gained: "",
        additional_thoughts: "",
        future_interest: ""
      });
    } catch (error: any) {
      console.error("Feedback submission error:", error);
      alert(error.message || "Failed to submit feedback. Please try again.");
    } finally {
      setIsFeedbackSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-purple-500 selection:text-white relative overflow-hidden font-sans py-10 sm:py-14">
      {/* Particle Canvas */}
      <ParticleBackground />

      {/* Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-purple-600/15 via-blue-600/10 to-transparent blur-[160px] pointer-events-none z-0" />
      <div className="absolute top-1/3 left-[-200px] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[180px] pointer-events-none z-0" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        
        {/* Back Link */}
        <Link
          to="/join"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-semibold text-xs sm:text-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Join Us Portal
        </Link>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/90 border border-purple-500/40 text-purple-300 text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-xl shadow-xl">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="font-mono text-amber-300 uppercase tracking-wider font-bold">
              GNDEC ENGLISH CLUB • INTERVIEW FEEDBACK
            </span>
          </div>

          <h1
            className="text-3xl sm:text-5xl font-black tracking-tight leading-tight"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Interview{" "}
            <span className="bg-gradient-to-r from-amber-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
              Feedback Form
            </span>
          </h1>
          <p className="text-sm sm:text-base text-gray-300 font-medium max-w-xl mx-auto">
            We value your voice! Tell us how your Wednesday interview went so we can keep improving and crafting awesome experiences.
          </p>
        </motion.div>

        {/* Form Container */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          onSubmit={handleFeedbackSubmit}
          className="space-y-10"
        >

          {/* SECTION 1: CANDIDATE DETAILS (Questions 1-5) */}
          <div className="rounded-3xl p-6 sm:p-10 bg-slate-900/80 border border-purple-500/30 backdrop-blur-xl shadow-2xl space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Candidate Details
                </h2>
                <p className="text-xs text-gray-400">Basic identification & contact details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. Name */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-purple-400" /> 1. Name *
                </label>
                <input
                  type="text"
                  value={feedbackForm.candidate_name}
                  onChange={(e) => handleFeedbackChange('candidate_name', e.target.value)}
                  required
                  placeholder="e.g. Amanpreet Singh"
                  className="w-full px-4 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all text-sm"
                />
              </div>

              {/* 2. Branch & Section */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> 2. Branch & Section *
                </label>
                <input
                  type="text"
                  value={feedbackForm.branch_section}
                  onChange={(e) => handleFeedbackChange('branch_section', e.target.value)}
                  required
                  placeholder="e.g. D3 CSE A"
                  className="w-full px-4 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all text-sm"
                />
              </div>

              {/* 3. CRN */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5 text-emerald-400" /> 3. CRN
                </label>
                <input
                  type="text"
                  value={feedbackForm.crn}
                  onChange={(e) => handleFeedbackChange('crn', e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 2315001"
                  className="w-full px-4 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all text-sm"
                />
              </div>

              {/* 4. Phone Number */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-amber-400" /> 4. Phone Number *
                </label>
                <input
                  type="tel"
                  value={feedbackForm.phone_number}
                  onChange={(e) => handleFeedbackChange('phone_number', e.target.value)}
                  required
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-4 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all text-sm"
                />
              </div>

              {/* 5. Email ID */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-xs font-mono font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-rose-400" /> 5. Email ID *
                </label>
                <input
                  type="email"
                  value={feedbackForm.email_id}
                  onChange={(e) => handleFeedbackChange('email_id', e.target.value)}
                  required
                  placeholder="e.g. candidate@gndec.ac.in"
                  className="w-full px-4 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all text-sm"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: INTERVIEW FEEDBACK (Questions 6-14) */}
          <div className="rounded-3xl p-6 sm:p-10 bg-slate-900/80 border border-cyan-500/30 backdrop-blur-xl shadow-2xl space-y-8">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Interview Feedback
                </h2>
                <p className="text-xs text-gray-400">Share your thoughts on Wednesday's interview process</p>
              </div>
            </div>

            {/* 6 */}
            <div className="space-y-3">
              <label className="block text-sm sm:text-base font-bold text-white leading-relaxed">
                6. How was your overall experience of the English Club interview held on Wednesday?
              </label>
              <textarea
                rows={4}
                value={feedbackForm.overall_experience}
                onChange={(e) => handleFeedbackChange('overall_experience', e.target.value)}
                placeholder="Describe your overall experience, interaction with interviewers, auditorium atmosphere, etc..."
                className="w-full px-4 py-3.5 rounded-2xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none transition-all resize-none text-sm"
              />
            </div>

            {/* 7 */}
            <div className="space-y-3">
              <label className="block text-sm sm:text-base font-bold text-white leading-relaxed">
                7. What issues or difficulties did you face during the interview process, if any?
              </label>
              <textarea
                rows={3}
                value={feedbackForm.issues_faced}
                onChange={(e) => handleFeedbackChange('issues_faced', e.target.value)}
                placeholder="Mention any waiting time, hall guidance, audio clarity, or scheduling challenges..."
                className="w-full px-4 py-3.5 rounded-2xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none transition-all resize-none text-sm"
              />
            </div>

            {/* 8. Process Rating */}
            <div className="space-y-4 p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="block text-sm sm:text-base font-bold text-white">
                  8. How would you rate the overall interview process?
                </label>
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 w-fit">
                  1 = Very Poor &nbsp;•&nbsp; 5 = Excellent
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2 sm:gap-4 pt-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => handleFeedbackChange('rating_process', val)}
                    className={`py-3.5 rounded-xl font-mono font-black text-base sm:text-lg transition-all border flex flex-col items-center gap-1 cursor-pointer ${
                      feedbackForm.rating_process === val
                        ? 'bg-gradient-to-br from-amber-500 to-yellow-500 border-amber-300 text-slate-950 shadow-lg shadow-amber-500/30 scale-105'
                        : 'bg-slate-900/80 border-white/10 text-gray-300 hover:border-amber-400/50 hover:bg-white/10'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-1">
                      <Star className={`w-4 h-4 ${feedbackForm.rating_process === val ? 'fill-current' : 'text-amber-400'}`} />
                      {val}
                    </span>
                    <span className="text-[10px] font-sans font-normal opacity-80 hidden sm:inline">
                      {val === 1 ? "Very Poor" : val === 2 ? "Poor" : val === 3 ? "Average" : val === 4 ? "Good" : "Excellent"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 9. Comfortable & Organized */}
            <div className="space-y-3 p-5 rounded-2xl bg-white/5 border border-white/10">
              <label className="block text-sm sm:text-base font-bold text-white">
                9. Did you find the interview process comfortable and well-organized?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {["Yes, completely", "Mostly", "Somewhat", "No"].map((option) => (
                  <button
                    type="button"
                    key={option}
                    onClick={() => handleFeedbackChange('comfortable_organized', option)}
                    className={`p-3 rounded-xl text-xs sm:text-sm font-bold text-center transition-all border cursor-pointer ${
                      feedbackForm.comfortable_organized === option
                        ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-500/30 scale-105'
                        : 'bg-slate-900/80 border-white/10 text-gray-300 hover:border-purple-500/50 hover:bg-white/10'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* 10 */}
            <div className="space-y-3">
              <label className="block text-sm sm:text-base font-bold text-white leading-relaxed">
                10. Was there anything about the interview process that you particularly liked?
              </label>
              <textarea
                rows={3}
                value={feedbackForm.liked_aspects}
                onChange={(e) => handleFeedbackChange('liked_aspects', e.target.value)}
                placeholder="Friendly seniors, smooth registration desk, engaging question rounds..."
                className="w-full px-4 py-3.5 rounded-2xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none transition-all resize-none text-sm"
              />
            </div>

            {/* 11 */}
            <div className="space-y-3">
              <label className="block text-sm sm:text-base font-bold text-white leading-relaxed">
                11. Do you have any suggestions for the English Club team to improve future interviews or events?
              </label>
              <textarea
                rows={3}
                value={feedbackForm.suggestions}
                onChange={(e) => handleFeedbackChange('suggestions', e.target.value)}
                placeholder="Share creative suggestions for upcoming club events, workshops, or future interview setups..."
                className="w-full px-4 py-3.5 rounded-2xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none transition-all resize-none text-sm"
              />
            </div>

            {/* 12. Excitement Level */}
            <div className="space-y-4 p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="block text-sm sm:text-base font-bold text-white">
                  12. After attending the interview, how excited are you to be a part of the English Club team?
                </label>
                <span className="text-xs font-mono font-bold text-purple-300 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 w-fit">
                  1 = Not excited &nbsp;•&nbsp; 5 = Extremely excited
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2 sm:gap-4 pt-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => handleFeedbackChange('excitement_level', val)}
                    className={`py-3.5 rounded-xl font-mono font-black text-base sm:text-lg transition-all border flex flex-col items-center gap-1 cursor-pointer ${
                      feedbackForm.excitement_level === val
                        ? 'bg-gradient-to-br from-purple-500 to-indigo-500 border-purple-300 text-white shadow-lg shadow-purple-500/30 scale-105'
                        : 'bg-slate-900/80 border-white/10 text-gray-300 hover:border-purple-400/50 hover:bg-white/10'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-1">
                      <Zap className={`w-4 h-4 ${feedbackForm.excitement_level === val ? 'text-amber-300 fill-current' : 'text-purple-400'}`} />
                      {val}
                    </span>
                    <span className="text-[10px] font-sans font-normal opacity-80 hidden sm:inline">
                      {val === 1 ? "Not excited" : val === 2 ? "Slightly" : val === 3 ? "Neutral" : val === 4 ? "Excited" : "Extremely!"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 13 */}
            <div className="space-y-3 p-5 rounded-2xl bg-white/5 border border-white/10">
              <label className="block text-sm sm:text-base font-bold text-white">
                13. Did the interview give you a better understanding of the English Club and what we do?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {["Yes", "To some extent", "Not really"].map((option) => (
                  <button
                    type="button"
                    key={option}
                    onClick={() => handleFeedbackChange('understanding_gained', option)}
                    className={`p-3.5 rounded-xl text-xs sm:text-sm font-bold text-center transition-all border cursor-pointer ${
                      feedbackForm.understanding_gained === option
                        ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-500/30 scale-105'
                        : 'bg-slate-900/80 border-white/10 text-gray-300 hover:border-emerald-500/50 hover:bg-white/10'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* 14 */}
            <div className="space-y-3">
              <label className="block text-sm sm:text-base font-bold text-white leading-relaxed">
                14. Is there anything else you would like to share with us about your interview experience or the English Club?
              </label>
              <textarea
                rows={3}
                value={feedbackForm.additional_thoughts}
                onChange={(e) => handleFeedbackChange('additional_thoughts', e.target.value)}
                placeholder="Any final thoughts, compliments, or queries for the team..."
                className="w-full px-4 py-3.5 rounded-2xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none transition-all resize-none text-sm"
              />
            </div>
          </div>

          {/* SECTION 3: OPTIONAL CLOSING QUESTION (Question 15) */}
          <div className="rounded-3xl p-6 sm:p-10 bg-slate-900/80 border border-emerald-500/30 backdrop-blur-xl shadow-2xl space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Optional Closing Question
                </h2>
                <p className="text-xs text-gray-400">Future involvement & event interest</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm sm:text-base font-bold text-white leading-relaxed">
                15. Would you be interested in participating in or contributing to upcoming English Club events, even if you are not selected as a core team member?
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                {[
                  { label: "Yes, definitely", icon: ThumbsUp },
                  { label: "Maybe", icon: Smile },
                  { label: "No", icon: HelpCircle }
                ].map((item) => {
                  const ItemIcon = item.icon;
                  const isSelected = feedbackForm.future_interest === item.label;

                  return (
                    <button
                      type="button"
                      key={item.label}
                      onClick={() => handleFeedbackChange('future_interest', item.label)}
                      className={`p-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-300 text-white shadow-xl shadow-emerald-500/30 scale-105'
                          : 'bg-slate-900/80 border-white/10 text-gray-300 hover:border-emerald-500/40 hover:bg-white/10'
                      }`}
                    >
                      <ItemIcon className={`w-5 h-5 ${isSelected ? 'text-amber-300' : 'text-gray-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 text-center">
            <button
              type="submit"
              disabled={isFeedbackSubmitting}
              className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-black text-lg shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-3 mx-auto"
            >
              {isFeedbackSubmitting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Submitting Feedback...</span>
                </>
              ) : (
                <>
                  <Send className="w-6 h-6 text-amber-300" />
                  <span>Submit Interview Feedback</span>
                </>
              )}
            </button>
          </div>
        </motion.form>
      </div>

      {/* Feedback Submission Success Modal */}
      <AnimatePresence>
        {isFeedbackSubmitted && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-slate-900 rounded-3xl p-8 sm:p-12 max-w-md text-center shadow-2xl relative border border-purple-500/40"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <CheckCircle className="w-20 h-20 text-emerald-400 mx-auto mb-4 animate-bounce" />
              <h3 className="text-2xl font-extrabold text-white mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Feedback Submitted!
              </h3>
              <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                Thank you for helping us make GNDEC English Club better! Your responses have been recorded successfully.
              </p>
              <button
                onClick={() => {
                  setIsFeedbackSubmitted(false);
                  navigate('/join');
                }}
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold transition-all shadow-lg hover:scale-105 cursor-pointer"
              >
                <span>Return to Join Us Portal</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

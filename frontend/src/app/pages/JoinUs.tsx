import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import {
  MessageCircle,
  Users,
  TrendingUp,
  CheckCircle,
  Loader2,
  Sparkles,
  Maximize2,
  X,
  Phone,
  ArrowRight,
  Megaphone,
  Calendar,
  Sparkle
} from "lucide-react";
import { recruitmentServices } from "../../services/recruitmentServices";
import { settingsServices } from "../../services/settingsServices";

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

export function JoinUs() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPosterOpen, setIsPosterOpen] = useState(false);
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

  const WHATSAPP_GROUP_LINK = "https://chat.whatsapp.com/DVYzuZhA0mJKE8db3YLH8a";
  const POSTER_IMAGE = "/images/recruitment-poster.jpg";

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

  const benefits = [
    {
      icon: MessageCircle,
      title: "Improve Communication",
      description: "Develop exceptional verbal and written communication skills through regular practice and workshops.",
    },
    {
      icon: Users,
      title: "Build Confidence",
      description: "Overcome stage fright and build self-assurance through public speaking and group activities.",
    },
    {
      icon: TrendingUp,
      title: "Networking Opportunities",
      description: "Connect with like-minded individuals, mentors, and professionals in the field.",
    },
  ];

  const posterHighlights = [
    { label: "Improve Communication", desc: "Sharpen public speaking & articulation" },
    { label: "Explore Creativity", desc: "Unleash your writing & expression" },
    { label: "Engage in Discussions", desc: "Debates, discussions & podcasts" },
    { label: "Build Leadership Skills", desc: "Lead events & organize initiatives" },
    { label: "Supportive Team", desc: "Grow together with an energetic community" },
  ];

  const handleCustomAnswerChange = (questionId: string, value: any) => {
    setCustomAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setTimeout(() => {
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
        setIsSubmitted(false);
      }, 3000);
    } catch (error: any) {
      console.error("Error submitting application:", error);
      alert(error.message || "An error occurred while submitting. Please try again.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "candidate_crn" || name === "candidate_urn") {
      const numericValue = value.replace(/\D/g, "");
      setFormData({ ...formData, [name]: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
      </div>
    );
  }

  // RECRUITMENTS NOT ACTIVE
  if (!recruitmentsActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-purple-950 text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4 max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold tracking-wide backdrop-blur-md">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              RECRUITMENT STARTING SOON!
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
              English Club <span className="bg-gradient-to-r from-blue-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">Recruitments</span>
            </h1>

            <p className="text-lg sm:text-xl text-blue-100/80 font-medium" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              "New voices. New ideas. New you. Be heard. Be you. Belong here."
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5 flex flex-col items-center"
            >
              <div className="relative group w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-3">
                <div className="relative rounded-2xl overflow-hidden">
                  <img
                    src={POSTER_IMAGE}
                    alt="English Club Recruitment Starting Soon Poster"
                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-6">
                    <button
                      onClick={() => setIsPosterOpen(true)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/90 text-slate-900 font-semibold shadow-lg hover:bg-white transition-colors text-sm"
                    >
                      <Maximize2 className="w-4 h-4" /> Expand Poster
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 px-2">
                  <span className="text-xs text-blue-200/70 font-mono">GNDEC English Club Official Poster</span>
                  <button
                    onClick={() => setIsPosterOpen(true)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                  >
                    View Full Poster <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-emerald-950/80 via-slate-900 to-emerald-900/40 border border-emerald-500/30 shadow-2xl backdrop-blur-xl overflow-hidden group">
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
                
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0 text-emerald-400 shadow-inner">
                    <WhatsAppIcon className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                      Official Updates Group
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Join Our WhatsApp Group
                    </h2>
                    <p className="text-sm sm:text-base text-gray-300" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                      Be the first to get recruitment form release alerts, interview schedules, orientation details, and live updates directly on WhatsApp!
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-emerald-500/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <span className="text-xs text-emerald-200/80 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" /> Free to join • Instant updates
                  </span>

                  <a
                    href={WHATSAPP_GROUP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all"
                  >
                    <WhatsAppIcon className="w-5 h-5" /> Join WhatsApp Group
                  </a>
                </div>
              </div>

              <div className="rounded-3xl p-6 sm:p-8 bg-white/5 border border-white/10 backdrop-blur-xl space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <Megaphone className="w-5 h-5 text-purple-400" /> What You'll Experience in English Club
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {posterHighlights.map((hl, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/30 transition-colors flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-semibold text-white">{hl.label}</div>
                        <div className="text-xs text-gray-400">{hl.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl p-5 bg-blue-900/20 border border-blue-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <WhatsAppIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-blue-300 font-semibold uppercase tracking-wider">In Case of Any Queries</div>
                    <div className="text-base font-bold text-white">Raghav Kamboj</div>
                    <div className="text-xs text-blue-200/80 font-medium">Convenor</div>
                  </div>
                </div>

                <a
                  href="https://wa.me/917696045458?text=Hi,%20I%20have%20a%20query%20regarding%20English%20Club%20recruitment"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md hover:shadow-emerald-500/30 transition-all"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  Chat on WhatsApp (+91 76960 45458)
                </a>
              </div>
            </motion.div>
          </div>

          <div className="text-center pt-6 border-t border-white/10 text-xs sm:text-sm text-gray-400 font-medium tracking-wide">
            COMMUNICATE &nbsp;|&nbsp; CREATE &nbsp;|&nbsp; CONNECT &nbsp;|&nbsp; GROW TOGETHER
          </div>
        </div>

        <AnimatePresence>
          {isPosterOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPosterOpen(false)}
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            >
              <div className="relative max-w-4xl max-h-[90vh] overflow-auto rounded-2xl bg-slate-900 p-2 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setIsPosterOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors z-10"
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
      </div>
    );
  }

  // RECRUITMENTS ARE ACTIVE
  return (
    <div className="bg-white dark:bg-gray-950">
      <section className="relative py-12 bg-gradient-to-br from-blue-900 via-slate-900 to-purple-950 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Applications Now Open!
            </div>

            <h1 className="text-4xl lg:text-5xl font-extrabold" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Become a Part of <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">Our Community</span>
            </h1>

            <p className="text-base lg:text-lg text-gray-300" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              Join a vibrant community of passionate learners, speakers, and creators. Fill out the application form below!
            </p>

            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <a
                href={WHATSAPP_GROUP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg hover:shadow-emerald-500/30 transition-all"
              >
                <WhatsAppIcon className="w-5 h-5" /> Join WhatsApp Group
              </a>

              <button
                onClick={() => setIsPosterOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-all"
              >
                <Maximize2 className="w-4 h-4" /> View Official Poster
              </button>
            </div>
          </div>

          <div className="md:col-span-5 flex justify-center">
            <div
              onClick={() => setIsPosterOpen(true)}
              className="relative cursor-pointer group w-64 rounded-2xl overflow-hidden shadow-2xl border border-white/20 hover:scale-105 transition-transform"
            >
              <img
                src={POSTER_IMAGE}
                alt="Recruitment Poster Preview"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                <Maximize2 className="w-4 h-4" /> Click to Expand
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={item}
                className="group p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/20 transition-all hover:-translate-y-2"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-900 to-purple-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Application Form Section */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl lg:text-5xl text-gray-900 dark:text-white mb-6" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
              Ready to Join?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              Fill out the form below and start your journey with us
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="hidden lg:block relative sticky top-24"
            >
              <div
                onClick={() => setIsPosterOpen(true)}
                className="relative rounded-3xl overflow-hidden shadow-2xl cursor-pointer group border border-gray-200 dark:border-gray-800"
              >
                <img
                  src={POSTER_IMAGE}
                  alt="English Club Recruitment Poster"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-6 text-white text-sm font-semibold gap-2">
                  <Maximize2 className="w-4 h-4" /> Expand Poster
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-blue-900 to-purple-700 rounded-3xl blur-3xl opacity-50 pointer-events-none"></div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="candidate_name" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="candidate_name"
                      name="candidate_name"
                      value={formData.candidate_name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      style={{ fontFamily: 'Open Sans, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label htmlFor="candidate_email" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="candidate_email"
                      name="candidate_email"
                      value={formData.candidate_email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      style={{ fontFamily: 'Open Sans, sans-serif' }}
                    />
                  </div>

                  <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <label htmlFor="year" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                        Year *
                      </label>
                      <select
                        id="year"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        style={{ fontFamily: 'Open Sans, sans-serif' }}
                      >
                        <option value="" disabled>Select Year</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="stream" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                        Stream *
                      </label>
                      <select
                        id="stream"
                        name="stream"
                        value={formData.stream}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        style={{ fontFamily: 'Open Sans, sans-serif' }}
                      >
                        <option value="" disabled>Select Stream</option>
                        {['IT', 'CSE', 'RAI', 'ECE', 'CE', 'EE', 'ME', 'BBA', 'BCA'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="section" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                        Section *
                      </label>
                      <input
                        type="text"
                        id="section"
                        name="section"
                        value={formData.section}
                        onChange={handleChange}
                        required
                        placeholder="e.g. A"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        style={{ fontFamily: 'Open Sans, sans-serif' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="candidate_crn" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                      CRN *
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      id="candidate_crn"
                      name="candidate_crn"
                      value={formData.candidate_crn}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      style={{ fontFamily: 'Open Sans, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label htmlFor="candidate_urn" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                      URN (Optional)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      id="candidate_urn"
                      name="candidate_urn"
                      value={formData.candidate_urn}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      style={{ fontFamily: 'Open Sans, sans-serif' }}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="interested_department" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                      Interested Department *
                    </label>
                    <select
                      id="interested_department"
                      name="interested_department"
                      value={formData.interested_department}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      style={{ fontFamily: 'Open Sans, sans-serif' }}
                    >
                      <option value="TECHNICAL">Technical</option>
                      <option value="CREATIVE">Creative</option>
                      <option value="PROMOTION">Promotion</option>
                      <option value="EVENT_MANAGEMENT">Event Management</option>
                      <option value="DISICIPLINE">Discipline</option>
                      <option value="PHOTOGRAPHY">Photography/Videography</option>
                      <option value="DATABASE">Database</option>
                      <option value="ANCHORING">Anchoring</option>
                    </select>
                  </div>
                </div>

                {/* --- DYNAMIC CUSTOM FORM QUESTIONS --- */}
                {dynamicQuestions.length > 0 ? (
                  <div className="space-y-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                    {dynamicQuestions.map((q) => (
                      <div key={q.question_id} className="space-y-2">
                        <label className="block text-sm text-gray-700 dark:text-gray-300 font-semibold">
                          {q.question_label} {q.is_required && <span className="text-red-500">*</span>}
                        </label>

                        {/* SHORT TEXT */}
                        {q.question_type === 'SHORT_TEXT' && (
                          <input
                            type="text"
                            value={customAnswers[q.question_id] || ''}
                            onChange={(e) => handleCustomAnswerChange(q.question_id, e.target.value)}
                            placeholder={q.placeholder || ''}
                            required={q.is_required}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          />
                        )}

                        {/* LONG TEXT */}
                        {q.question_type === 'LONG_TEXT' && (
                          <textarea
                            value={customAnswers[q.question_id] || ''}
                            onChange={(e) => handleCustomAnswerChange(q.question_id, e.target.value)}
                            placeholder={q.placeholder || ''}
                            required={q.is_required}
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                          />
                        )}

                        {/* DROPDOWN */}
                        {q.question_type === 'DROPDOWN' && (
                          <select
                            value={customAnswers[q.question_id] || ''}
                            onChange={(e) => handleCustomAnswerChange(q.question_id, e.target.value)}
                            required={q.is_required}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          >
                            <option value="" disabled>Select an option...</option>
                            {q.options?.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        )}

                        {/* MULTIPLE CHOICE CHECKBOXES */}
                        {q.question_type === 'MULTIPLE_CHOICE' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            {q.options?.map((opt) => {
                              const selectedList: string[] = customAnswers[q.question_id] || [];
                              const isChecked = selectedList.includes(opt);
                              return (
                                <label key={opt} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      const newList = e.target.checked
                                        ? [...selectedList, opt]
                                        : selectedList.filter((item) => item !== opt);
                                      handleCustomAnswerChange(q.question_id, newList);
                                    }}
                                    className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                                  />
                                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{opt}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}

                        {/* SINGLE CHECKBOX */}
                        {q.question_type === 'CHECKBOX' && (
                          <label className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!customAnswers[q.question_id]}
                              onChange={(e) => handleCustomAnswerChange(q.question_id, e.target.checked)}
                              required={q.is_required}
                              className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                            />
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                              {q.placeholder || 'I confirm / agree'}
                            </span>
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Fallback standard questions if no dynamic questions exist in DB */
                  <>
                    <div>
                      <label htmlFor="candidate_description" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                        Introduce Yourself *
                      </label>
                      <textarea
                        id="candidate_description"
                        name="candidate_description"
                        value={formData.candidate_description}
                        onChange={handleChange}
                        required
                        rows={3}
                        placeholder="Tell us a little about yourself..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                        style={{ fontFamily: 'Open Sans, sans-serif' }}
                      />
                    </div>

                    <div>
                      <label htmlFor="candidate_why_eligible" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                        Why do you want to be part of this club and how can you contribute? *
                      </label>
                      <textarea
                        id="candidate_why_eligible"
                        name="candidate_why_eligible"
                        value={formData.candidate_why_eligible}
                        onChange={handleChange}
                        required
                        rows={4}
                        placeholder="Share your motivation and potential contributions..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                        style={{ fontFamily: 'Open Sans, sans-serif' }}
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-blue-900 to-purple-700 text-white hover:shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-105"
                  style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}
                >
                  Submit Application
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Submission Success Modal */}
      {isSubmitted && (
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white dark:bg-gray-900 rounded-3xl p-12 max-w-md text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            </motion.div>
            <h3 className="text-3xl text-gray-900 dark:text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
              Application Submitted!
            </h3>
            <p className="text-gray-600 dark:text-gray-300" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              Thank you for your interest. We'll review your application and get back to you soon!
            </p>
          </motion.div>
        </motion.div>
      )}

      {/* Poster Lightbox Modal */}
      <AnimatePresence>
        {isPosterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsPosterOpen(false)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="relative max-w-4xl max-h-[90vh] overflow-auto rounded-2xl bg-slate-900 p-2 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setIsPosterOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors z-10"
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

    </div>
  );
}

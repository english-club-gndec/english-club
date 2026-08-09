import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { 
  X, 
  Image as ImageIcon, 
  PenTool, 
  Search, 
  Calendar, 
  Tag,
  Sparkles,
  RotateCcw,
  BookOpen,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router";
import { submissionService, Submission } from "../../services/submissionService";

export function Articles() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      const data = await submissionService.getApprovedSubmissions();
      setSubmissions(data);
    } catch (err) {
      console.error("Failed to load submissions:", err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // Filter list
  const filteredArticles = submissions.filter(art => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTag = !selectedTag || art.tags?.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  // Get unique tags
  const allTags = Array.from(new Set(submissions.flatMap(art => art.tags || [])));

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen py-10 md:py-24 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          key="articles-feed"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-10 sm:space-y-16"
        >
          {/* Header Hero */}
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1
              className="text-3xl sm:text-5xl lg:text-6xl text-gray-900 dark:text-white mb-4 sm:mb-6 tracking-tight"
              style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800 }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              Student <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">Publications</span>
            </motion.h1>
            <p className="text-base sm:text-xl text-gray-600 dark:text-gray-400 mb-6 sm:mb-8" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              Explore student blogs, writing pieces, and communication guides, or submit your own work.
            </p>
            <Link
              to="/submit-article"
              className="inline-flex items-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-blue-900 to-purple-700 text-white font-bold text-base sm:text-lg hover:shadow-2xl hover:shadow-purple-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              style={{ fontFamily: 'Open Sans, sans-serif' }}
            >
              <PenTool className="w-5 h-5 animate-pulse" />
              Submit Yours
            </Link>
          </div>

          {/* Filters Panel */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/50 dark:shadow-none">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles, stories, author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                style={{ fontFamily: 'Open Sans, sans-serif' }}
              />
            </div>

            {/* Horizontal scrollable tags list */}
            <div className="flex gap-2 overflow-x-auto py-1 max-w-full md:max-w-[50%] scrollbar-none">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 cursor-pointer ${!selectedTag
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                    : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
              >
                All Tags
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 cursor-pointer ${tag === selectedTag
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                      : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Articles Grid */}
          {loadingSubmissions ? (
            <div className="text-center py-20">
              <div className="animate-spin w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Loading publications...</p>
            </div>
          ) : submissions.length === 0 ? (
            /* Scenario A: No publications exist in database yet */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-purple-950 to-blue-950 border border-purple-500/20 shadow-2xl p-8 sm:p-12 text-center text-white"
            >
              {/* Glow Accents */}
              <div className="absolute -top-24 -left-24 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-purple-600 to-pink-500 p-0.5 shadow-xl shadow-purple-500/30">
                  <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-purple-400">
                    <Sparkles className="w-10 h-10 animate-pulse" />
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold tracking-wide uppercase">
                  Call For Student Writers
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Be the Pioneer — Publish the <span className="bg-gradient-to-r from-purple-400 via-pink-300 to-blue-400 bg-clip-text text-transparent">First Article!</span>
                </h2>

                <p className="text-gray-300 text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                  The English Club student publication showcase is waiting for your voice. Share your blogs, opinion pieces, technical writing, or creative stories with GNDEC.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    to="/submit-article"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-base shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-105 transition-all cursor-pointer"
                  >
                    <PenTool className="w-5 h-5" /> Submit Your Article
                  </Link>
                </div>

                {/* Inspiring Topics Ideas */}
                <div className="pt-8 border-t border-white/10 mt-8">
                  <p className="text-xs uppercase font-bold text-purple-300 tracking-wider mb-4">
                    Need Inspiration? Ideas you can write about:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-purple-400/30 transition-colors">
                      <div className="text-purple-400 font-semibold text-sm mb-1">💡 Tech & Innovation</div>
                      <div className="text-xs text-gray-300">How modern tech and AI are shaping campus learning.</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-pink-400/30 transition-colors">
                      <div className="text-pink-400 font-semibold text-sm mb-1">🎙️ Communication</div>
                      <div className="text-xs text-gray-300">Public speaking guides, debates & oratory experiences.</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-blue-400/30 transition-colors">
                      <div className="text-blue-400 font-semibold text-sm mb-1">📖 Creative & Stories</div>
                      <div className="text-xs text-gray-300">Short stories, poems, book reviews & student journeys.</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : filteredArticles.length === 0 ? (
            /* Scenario B: Search/Filter returned 0 results */
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 px-6 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 shadow-xl space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                No matching publications found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                We couldn't find any articles matching {searchTerm ? `"${searchTerm}"` : "your filter"}. Try adjusting your search query or resetting filters.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedTag(null);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition-all shadow-md shadow-purple-500/20 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Reset Search & Filters
              </button>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article, index) => (
                <motion.div
                  key={article.submission_id || index}
                  onClick={() => setSelectedSubmission(article)}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="group cursor-pointer rounded-[2rem] overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:shadow-purple-500/5 dark:hover:shadow-none hover:-translate-y-2 transition-all duration-300 flex flex-col h-full"
                >
                  <div className="relative h-56 overflow-hidden">
                    {article.image_url ? (
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-800 flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-white/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-950/90 text-purple-700 dark:text-purple-400 px-3 py-1 rounded-lg text-xs font-bold shadow-sm backdrop-blur-sm">
                      {article.student_class}
                    </div>
                  </div>

                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.tags?.slice(0, 3).map(tag => (
                        <span key={tag} className="text-xs font-semibold px-2.5 py-1 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <h3
                      className="text-xl text-gray-900 dark:text-white mb-3 font-semibold group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      {article.title}
                    </h3>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-3 leading-relaxed" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                      {article.description}
                    </p>

                    <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                          {article.student_name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">{article.student_name}</span>
                      </div>
                      <span>{new Date(article.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
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
                    <ImageIcon className="w-16 h-16 text-white/30" />
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
                      <p className="text-xs">Class: {selectedSubmission.student_class}</p>
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
              <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex justify-end shrink-0">
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
    </div>
  );
}

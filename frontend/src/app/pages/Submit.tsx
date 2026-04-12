import { motion } from "motion/react";
import { useState } from "react";
import { FileText, Image as ImageIcon, CheckCircle } from "lucide-react";

export function Submit() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeForm, setActiveForm] = useState<"article" | "photo">("article");

  const articles = [
    {
      title: "The Power of Effective Communication",
      author: "Sarah Martinez",
      date: "March 28, 2026",
      preview: "Exploring how effective communication shapes our personal and professional lives...",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop",
    },
    {
      title: "My Journey with Creative Writing",
      author: "Alex Thompson",
      date: "March 15, 2026",
      preview: "A personal narrative about discovering the joy of creative expression through writing...",
      image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop",
    },
    {
      title: "Public Speaking: Overcoming Fear",
      author: "Priya Kumar",
      date: "March 5, 2026",
      preview: "Tips and techniques I used to overcome my fear of public speaking...",
      image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&h=300&fit=crop",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
    }, 3000);
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

  return (
    <div className="bg-white dark:bg-gray-950 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl lg:text-6xl text-gray-900 dark:text-white mb-6" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800 }}>
            Submit Your Work
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto" style={{ fontFamily: 'Open Sans, sans-serif' }}>
            Share your articles, stories, and event photos with our community
          </p>
        </motion.div>

        <section className="mb-20">
          <motion.h2
            className="text-3xl lg:text-4xl text-gray-900 dark:text-white mb-12"
            style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Featured Student Blogs
          </motion.h2>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {articles.map((article, index) => (
              <motion.div
                key={index}
                variants={item}
                className="group cursor-pointer rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-2xl hover:shadow-purple-500/20 transition-all hover:-translate-y-2"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl text-gray-900 dark:text-white mb-2 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                    {article.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <span style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>{article.author}</span>
                    <span>•</span>
                    <span style={{ fontFamily: 'Open Sans, sans-serif' }}>{article.date}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                    {article.preview}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <section>
          <motion.h2
            className="text-3xl lg:text-4xl text-gray-900 dark:text-white mb-12 text-center"
            style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Submit Your Contribution
          </motion.h2>

          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => setActiveForm("article")}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl transition-all ${
                  activeForm === "article"
                    ? "bg-gradient-to-r from-blue-900 to-purple-700 text-white shadow-lg shadow-purple-500/50"
                    : "bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
                }`}
                style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}
              >
                <FileText className="w-5 h-5" />
                Submit Article
              </button>
              <button
                onClick={() => setActiveForm("photo")}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl transition-all ${
                  activeForm === "photo"
                    ? "bg-gradient-to-r from-blue-900 to-purple-700 text-white shadow-lg shadow-purple-500/50"
                    : "bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
                }`}
                style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}
              >
                <ImageIcon className="w-5 h-5" />
                Submit Photos
              </button>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700">
              <form onSubmit={handleSubmit} className="space-y-6">
                {activeForm === "article" ? (
                  <>
                    <div>
                      <label htmlFor="title" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                        Article Title
                      </label>
                      <input
                        type="text"
                        id="title"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        style={{ fontFamily: 'Open Sans, sans-serif' }}
                      />
                    </div>

                    <div>
                      <label htmlFor="author" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                        Author Name
                      </label>
                      <input
                        type="text"
                        id="author"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        style={{ fontFamily: 'Open Sans, sans-serif' }}
                      />
                    </div>

                    <div>
                      <label htmlFor="article" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                        Article Content
                      </label>
                      <textarea
                        id="article"
                        required
                        rows={8}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                        style={{ fontFamily: 'Open Sans, sans-serif' }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label htmlFor="event-name" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                        Event Name
                      </label>
                      <input
                        type="text"
                        id="event-name"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        style={{ fontFamily: 'Open Sans, sans-serif' }}
                      />
                    </div>

                    <div>
                      <label htmlFor="photos" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                        Upload Photos
                      </label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-purple-500 dark:hover:border-purple-500 transition-colors cursor-pointer">
                        <ImageIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                          Drag and drop your photos here, or click to browse
                        </p>
                        <input
                          type="file"
                          id="photos"
                          multiple
                          accept="image/*"
                          className="hidden"
                        />
                        <label
                          htmlFor="photos"
                          className="inline-block px-6 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-colors text-sm"
                          style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}
                        >
                          Choose Files
                        </label>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label htmlFor="description" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                    Description
                  </label>
                  <textarea
                    id="description"
                    required
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    style={{ fontFamily: 'Open Sans, sans-serif' }}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-blue-900 to-purple-700 text-white hover:shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-105"
                  style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}
                >
                  Submit
                </button>
              </form>
            </div>
          </motion.div>
        </section>
      </div>

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
              Submission Received!
            </h3>
            <p className="text-gray-600 dark:text-gray-300" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              Thank you for your contribution. We'll review and publish it soon!
            </p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

import { motion } from "motion/react";
import { useState } from "react";
import { BookOpen, FileText, Award, Brain } from "lucide-react";

export function Resources() {
  const [activeTab, setActiveTab] = useState<"grammar" | "vocabulary" | "books" | "quiz">("grammar");

  const grammarTips = [
    {
      title: "Subject-Verb Agreement",
      description: "Learn how to match subjects with their verbs correctly in different contexts.",
      example: "The team is ready. (collective noun takes singular verb)",
    },
    {
      title: "Active vs Passive Voice",
      description: "Understand when to use active and passive voice for effective communication.",
      example: "Active: The chef prepared the meal. Passive: The meal was prepared by the chef.",
    },
    {
      title: "Comma Usage",
      description: "Master the art of using commas correctly in various sentence structures.",
      example: "Use commas to separate items in a list, after introductory phrases, and before conjunctions.",
    },
    {
      title: "Apostrophes for Possession",
      description: "Learn the correct usage of apostrophes to show ownership.",
      example: "The student's book (singular) vs. The students' books (plural)",
    },
  ];

  const vocabulary = [
    {
      word: "Eloquent",
      meaning: "Fluent or persuasive in speaking or writing",
      example: "The speaker delivered an eloquent speech that moved the audience.",
    },
    {
      word: "Resilience",
      meaning: "The capacity to recover quickly from difficulties",
      example: "Her resilience in the face of adversity inspired everyone.",
    },
    {
      word: "Paradigm",
      meaning: "A typical example or pattern of something",
      example: "This discovery represents a paradigm shift in scientific thinking.",
    },
    {
      word: "Ephemeral",
      meaning: "Lasting for a very short time",
      example: "The beauty of cherry blossoms is ephemeral, lasting only a few weeks.",
    },
  ];

  const books = [
    {
      title: "The Elements of Style",
      author: "William Strunk Jr. & E.B. White",
      image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop",
      description: "A timeless guide to writing with clarity and precision.",
    },
    {
      title: "On Writing Well",
      author: "William Zinsser",
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop",
      description: "The classic guide to writing nonfiction with style and substance.",
    },
    {
      title: "Bird by Bird",
      author: "Anne Lamott",
      image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop",
      description: "Insightful advice on writing and life from a celebrated author.",
    },
    {
      title: "The Sense of Style",
      author: "Steven Pinker",
      image: "https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=300&h=400&fit=crop",
      description: "A modern guide to writing with clarity, elegance, and grace.",
    },
  ];

  const quizzes = [
    {
      title: "Weekly Grammar Challenge",
      difficulty: "Intermediate",
      questions: 15,
      time: "20 minutes",
    },
    {
      title: "Vocabulary Builder Quiz",
      difficulty: "Advanced",
      questions: 20,
      time: "25 minutes",
    },
    {
      title: "Idioms & Phrases Test",
      difficulty: "Beginner",
      questions: 10,
      time: "15 minutes",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const tabs = [
    { id: "grammar" as const, label: "Grammar Tips", icon: FileText },
    { id: "vocabulary" as const, label: "Vocabulary", icon: Brain },
    { id: "books" as const, label: "Recommended Books", icon: BookOpen },
    { id: "quiz" as const, label: "Weekly Quiz", icon: Award },
  ];

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
            Learning Resources
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto" style={{ fontFamily: 'Open Sans, sans-serif' }}>
            Curated materials to enhance your English language skills
          </p>
        </motion.div>

        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-wrap gap-4 justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-blue-900 to-purple-700 text-white shadow-lg shadow-purple-500/50"
                    : "bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
                }`}
                style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {activeTab === "grammar" && (
          <motion.div
            className="grid md:grid-cols-2 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {grammarTips.map((tip, index) => (
              <motion.div
                key={index}
                variants={item}
                className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/10 transition-all"
              >
                <h3 className="text-xl text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                  {tip.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                  {tip.description}
                </p>
                <div className="px-4 py-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <p className="text-sm text-purple-900 dark:text-purple-300" style={{ fontFamily: 'Open Sans, sans-serif', fontStyle: 'italic' }}>
                    {tip.example}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === "vocabulary" && (
          <motion.div
            className="grid md:grid-cols-2 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {vocabulary.map((word, index) => (
              <motion.div
                key={index}
                variants={item}
                className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/10 transition-all"
              >
                <h3 className="text-2xl text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                  {word.word}
                </h3>
                <p className="text-sm text-purple-700 dark:text-purple-400 mb-3" style={{ fontFamily: 'Open Sans, sans-serif', fontStyle: 'italic' }}>
                  {word.meaning}
                </p>
                <div className="px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-900 dark:text-blue-300" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                    <strong>Example:</strong> {word.example}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === "books" && (
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {books.map((book, index) => (
              <motion.div
                key={index}
                variants={item}
                className="group rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-2xl hover:shadow-purple-500/20 transition-all hover:-translate-y-2"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={book.image}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg text-gray-900 dark:text-white mb-1" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                    {book.title}
                  </h3>
                  <p className="text-sm text-purple-700 dark:text-purple-400 mb-3" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                    by {book.author}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                    {book.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === "quiz" && (
          <motion.div
            className="grid md:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {quizzes.map((quiz, index) => (
              <motion.div
                key={index}
                variants={item}
                className="p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/10 transition-all hover:-translate-y-2"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-900 to-purple-700 flex items-center justify-center mb-6">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                  {quiz.title}
                </h3>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>Difficulty:</span>
                    <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                      {quiz.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>Questions:</span>
                    <span className="text-gray-900 dark:text-white" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>{quiz.questions}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>Time:</span>
                    <span className="text-gray-900 dark:text-white" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>{quiz.time}</span>
                  </div>
                </div>
                <button
                  className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-900 to-purple-700 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                  style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}
                >
                  Start Quiz
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.section
          className="mt-20 p-8 rounded-3xl bg-gradient-to-br from-blue-900 to-purple-700 text-white"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl mb-4" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
              Applied Science Department Resources
            </h2>
            <p className="text-lg mb-6" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              Access specialized English learning materials designed specifically for Applied Science students, including technical writing guides, scientific vocabulary, and academic communication resources.
            </p>
            <button
              className="px-8 py-3 rounded-xl bg-white text-blue-900 hover:bg-gray-100 transition-all"
              style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}
            >
              Access Department Resources
            </button>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

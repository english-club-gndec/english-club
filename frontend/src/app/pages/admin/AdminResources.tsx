import { motion } from "motion/react";
import { useState } from "react";
import { Plus, Edit2, Trash2, BookOpen, Brain, FileText, Award } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "sonner";

export function AdminResources() {
  const [activeTab, setActiveTab] = useState<"grammar" | "vocabulary" | "books" | "quiz">("grammar");

  const tabs = [
    { id: "grammar" as const, label: "Grammar Tips", icon: FileText },
    { id: "vocabulary" as const, label: "Vocabulary", icon: Brain },
    { id: "books" as const, label: "Books", icon: BookOpen },
    { id: "quiz" as const, label: "Quizzes", icon: Award },
  ];

  const handleDelete = (type: string, id: number) => {
    if (confirm(`Are you sure you want to delete this ${type}?`)) {
      toast.success(`${type} deleted successfully!`);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
              Resources Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              Manage learning resources for students
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-900 to-purple-700 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all"
            style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}
          >
            <Plus className="w-5 h-5" />
            Add Resource
          </button>
        </div>

        <div className="flex flex-wrap gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-900 to-purple-700 text-white shadow-lg shadow-purple-500/50"
                  : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
              style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: item * 0.1 }}
              className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 hover:shadow-xl hover:shadow-purple-500/10 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg text-gray-900 dark:text-white flex-1" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                  Resource Title {item}
                </h3>
                <div className="flex gap-2">
                  <button
                    className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete("resource", item)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                This is a sample description for the resource. It provides helpful information for students.
              </p>
              <div className="px-4 py-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-purple-900 dark:text-purple-300" style={{ fontFamily: 'Open Sans, sans-serif', fontStyle: 'italic' }}>
                  Example content or tip goes here
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}

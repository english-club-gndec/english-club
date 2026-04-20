import { motion } from "motion/react";
import { useState } from "react";
import { Search, Filter, Check, X, Eye } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "sonner";

interface Submission {
  id: number;
  studentName: string;
  type: "Blog" | "Photo";
  title: string;
  preview: string;
  status: "Pending" | "Approved" | "Rejected";
  submittedAt: string;
}

export function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([
    {
      id: 1,
      studentName: "Sarah Martinez",
      type: "Blog",
      title: "The Power of Effective Communication",
      preview: "Exploring how effective communication shapes our lives...",
      status: "Pending",
      submittedAt: "2026-04-18"
    },
    {
      id: 2,
      studentName: "Alex Thompson",
      type: "Blog",
      title: "My Journey with Creative Writing",
      preview: "A personal narrative about discovering creative expression...",
      status: "Approved",
      submittedAt: "2026-04-17"
    },
    {
      id: 3,
      studentName: "Emma Davis",
      type: "Photo",
      title: "Literary Festival Photos",
      preview: "Event photos from Literary Festival 2026",
      status: "Pending",
      submittedAt: "2026-04-16"
    },
  ]);

  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const handleApprove = (id: number) => {
    setSubmissions(submissions.map(s => s.id === id ? { ...s, status: "Approved" as const } : s));
    toast.success("Submission approved!");
  };

  const handleReject = (id: number) => {
    if (confirm("Are you sure you want to reject this submission?")) {
      setSubmissions(submissions.map(s => s.id === id ? { ...s, status: "Rejected" as const } : s));
      toast.success("Submission rejected");
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = sub.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || sub.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400";
      case "Approved": return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
      case "Rejected": return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
      default: return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400";
    }
  };

  const stats = [
    { label: "Total Submissions", value: submissions.length, color: "from-blue-500 to-blue-600" },
    { label: "Pending", value: submissions.filter(s => s.status === "Pending").length, color: "from-yellow-500 to-yellow-600" },
    { label: "Approved", value: submissions.filter(s => s.status === "Approved").length, color: "from-green-500 to-green-600" },
  ];

  return (
    <>
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
            Submissions
          </h1>
          <p className="text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>
            Review and approve student blogs and photos
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6"
            >
              <div className="text-3xl text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search submissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                style={{ fontFamily: 'Open Sans, sans-serif' }}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-12 pr-8 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                style={{ fontFamily: 'Open Sans, sans-serif' }}
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredSubmissions.map((submission) => (
              <motion.div
                key={submission.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-900 to-purple-700 flex items-center justify-center flex-shrink-0 text-white text-xs" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                    {submission.type}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg text-gray-900 dark:text-white mb-1" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                          {submission.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                          by <span className="font-semibold">{submission.studentName}</span> • {new Date(submission.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs ${getStatusBadge(submission.status)}`} style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                        {submission.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                      {submission.preview}
                    </p>
                    <div className="flex gap-2">
                      <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors text-sm" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      {submission.status === "Pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(submission.id)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 transition-colors text-sm"
                            style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}
                          >
                            <Check className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(submission.id)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 transition-colors text-sm"
                            style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}
                          >
                            <X className="w-4 h-4" />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

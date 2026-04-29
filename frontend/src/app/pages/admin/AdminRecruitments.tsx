import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, Circle, Edit2, X } from "lucide-react";
import { toast, Toaster } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { recruitmentServices } from "../../../services/recruitmentServices";
import { settingsServices } from "../../../services/settingsServices";

interface Candidate {
  candidate_id: string;
  candidate_name: string;
  candidate_class: string;
  candidate_crn: number | null;
  candidate_urn: number | null;
  candidate_email: string;
  interested_department: string;
  candidate_description?: string;
  candidate_why_eligible?: string;
  candidate_comment?: string;
  candidate_status: string;
  created_at: string;
}

export function AdminRecruitments() {
  const { userId, logout } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [viewingCandidate, setViewingCandidate] = useState<Candidate | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [recruitmentsActive, setRecruitmentsActive] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [isRecruitmentStarted, setIsRecruitmentStarted] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [newStatus, setNewStatus] = useState<string>("");
  const [newComment, setNewComment] = useState<string>("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const filteredCandidates = candidates.filter(candidate => {
    const matchesDepartment = filterDepartment === "ALL" || candidate.interested_department === filterDepartment;
    const matchesStatus = filterStatus === "ALL" || candidate.candidate_status === filterStatus;
    
    // For pending, if the DB returns null, it might be interpreted as "PENDING"
    if (filterStatus === "PENDING" && !candidate.candidate_status) {
      return matchesDepartment && true;
    }
    
    return matchesDepartment && matchesStatus;
  });

  const fetchCandidates = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const [candidatesData, settingsData] = await Promise.all([
        recruitmentServices.getAllCandidates(userId),
        settingsServices.getSettings()
      ]);
      setCandidates(candidatesData);
      setRecruitmentsActive(settingsData.recruitmentsActive || false);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch candidates");
      if (error.message && error.message.includes("404")) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [userId]);

  const toggleRecruitmentStatus = async () => {
    try {
      setIsTogglingStatus(true);
      const newStatus = !recruitmentsActive;
      await settingsServices.updateSettings({ recruitmentsActive: newStatus });
      setRecruitmentsActive(newStatus);
      toast.success(newStatus ? "Registrations started successfully" : "Registrations stopped successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update registration status");
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleEditClick = (candidate: Candidate) => {
    setEditingCandidate(candidate);
  };

  const handleViewCandidate = async (candidate: Candidate) => {
    if (!userId) return;
    if (!isRecruitmentStarted) {
      return;
    }
    
    try {
      const details = await recruitmentServices.getCandidateById(userId, candidate.candidate_id);
      setViewingCandidate(details);
      setNewStatus(details.candidate_status || 'PENDING');
      setNewComment(details.candidate_comment || '');
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch candidate details");
    }
  };

  const handleStatusUpdate = async () => {
    if (!userId || !viewingCandidate) return;
    try {
      setIsUpdatingStatus(true);
      await recruitmentServices.updateCandidateStatusById(userId, viewingCandidate.candidate_id, {
        candidate_status: newStatus,
        candidate_comment: newComment,
        status_updated_by: Number(userId)
      });
      toast.success("Candidate status updated successfully");
      setViewingCandidate({ 
        ...viewingCandidate, 
        candidate_status: newStatus,
        candidate_comment: newComment 
      });
      fetchCandidates();
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCandidate) return;

    try {
      setIsUpdating(true);
      const payload = {
        candidate_name: editingCandidate.candidate_name,
        candidate_class: editingCandidate.candidate_class,
        candidate_crn: Number(editingCandidate.candidate_crn),
        candidate_urn: editingCandidate.candidate_urn ? Number(editingCandidate.candidate_urn) : null,
        candidate_email: editingCandidate.candidate_email,
        interested_department: editingCandidate.interested_department,
      };

      await recruitmentServices.updateCandidateById(editingCandidate.candidate_id, payload);
      toast.success("Candidate updated successfully");
      setEditingCandidate(null);
      fetchCandidates();
    } catch (error: any) {
      toast.error(error.message || "Failed to update candidate");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editingCandidate) return;
    const { name, value } = e.target;
    
    if (name === "candidate_crn" || name === "candidate_urn") {
      const numericValue = value.replace(/\D/g, "");
      setEditingCandidate({ ...editingCandidate, [name]: numericValue ? Number(numericValue) : null });
    } else {
      setEditingCandidate({ ...editingCandidate, [name]: value });
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
              Recruitments
            </h1>
            <p className="text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              View candidate applications
            </p>
          </div>
          <div className="flex gap-4 items-center flex-wrap">
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all font-semibold"
            >
              <option value="ALL">All Departments</option>
              <option value="TECHNICAL">Technical</option>
              <option value="CREATIVE">Creative</option>
              <option value="PROMOTION">Promotion</option>
              <option value="EVENT_MANAGEMENT">Event Management</option>
              <option value="DISICIPLINE">Discipline</option>
              <option value="PHOTOGRAPHY">Photography</option>
              <option value="DATABASE">Database</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all font-semibold"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="SELECTED">Selected</option>
              <option value="REJECTED">Rejected</option>
            </select>
            
            <button
              onClick={toggleRecruitmentStatus}
              disabled={isTogglingStatus}
              className={`px-6 py-3 rounded-xl font-semibold text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 ${
                recruitmentsActive 
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-red-500/30' 
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-green-500/30'
              }`}
            >
              {isTogglingStatus ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {recruitmentsActive ? "Stop Registrations" : "Start Registrations"}
            </button>
            
            <button
              className={`px-6 py-3 rounded-xl font-semibold text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 ${
                isRecruitmentStarted 
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-orange-500/30'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/30'
              }`}
              onClick={() => setIsRecruitmentStarted(!isRecruitmentStarted)}
            >
              {isRecruitmentStarted ? "Stop Recruitment" : "Start Recruitment"}
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden min-h-[400px] flex flex-col">
          <div className="overflow-x-auto flex-1">
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                   <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                   <p className="text-gray-500">Loading candidates...</p>
                </div>
              ) : filteredCandidates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                   <p className="text-gray-500">No candidates found.</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Class</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">CRN</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">URN</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      {!isRecruitmentStarted && (
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {filteredCandidates.map((candidate) => (
                      <tr 
                        key={candidate.candidate_id} 
                        onClick={() => handleViewCandidate(candidate)}
                        className={`transition-colors ${isRecruitmentStarted ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer' : ''}`}
                      >
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{candidate.candidate_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{candidate.candidate_email}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{candidate.candidate_class}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{candidate.candidate_crn || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{candidate.candidate_urn || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{candidate.interested_department}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            candidate.candidate_status === 'SELECTED' ? 'bg-green-100 text-green-700' :
                            candidate.candidate_status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {candidate.candidate_status || 'PENDING'}
                          </span>
                        </td>
                        {!isRecruitmentStarted && (
                          <td className="px-6 py-4 text-sm text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(candidate);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                              title="Edit Candidate"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {editingCandidate && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg overflow-hidden shadow-xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Candidate</h3>
                <button
                  onClick={() => setEditingCandidate(null)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleUpdate} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    name="candidate_name"
                    value={editingCandidate.candidate_name}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    name="candidate_email"
                    value={editingCandidate.candidate_email}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class</label>
                  <input
                    type="text"
                    name="candidate_class"
                    value={editingCandidate.candidate_class}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CRN</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      name="candidate_crn"
                      value={editingCandidate.candidate_crn || ''}
                      onChange={handleEditChange}
                      required
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URN</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      name="candidate_urn"
                      value={editingCandidate.candidate_urn || ''}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                  <select
                    name="interested_department"
                    value={editingCandidate.interested_department}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="TECHNICAL">Technical</option>
                    <option value="CREATIVE">Creative</option>
                    <option value="PROMOTION">Promotion</option>
                    <option value="EVENT_MANAGEMENT">Event Management</option>
                    <option value="DISICIPLINE">Discipline</option>
                    <option value="PHOTOGRAPHY">Photography</option>
                    <option value="DATABASE">Database</option>
                  </select>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingCandidate(null)}
                    className="px-5 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2"
                  >
                    {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isUpdating ? "Updating..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingCandidate && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Candidate Details</h3>
                <button
                  onClick={() => setViewingCandidate(null)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Name</h4>
                    <p className="text-gray-900 dark:text-white mt-1">{viewingCandidate.candidate_name}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Email</h4>
                    <p className="text-gray-900 dark:text-white mt-1">{viewingCandidate.candidate_email}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Class</h4>
                    <p className="text-gray-900 dark:text-white mt-1">{viewingCandidate.candidate_class}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Department</h4>
                    <p className="text-gray-900 dark:text-white mt-1">{viewingCandidate.interested_department}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">CRN</h4>
                    <p className="text-gray-900 dark:text-white mt-1">{viewingCandidate.candidate_crn || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">URN</h4>
                    <p className="text-gray-900 dark:text-white mt-1">{viewingCandidate.candidate_urn || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Status</h4>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className={`mt-1 px-3 py-1 rounded-full text-xs font-bold border-2 transition-colors focus:outline-none ${
                        newStatus === 'SELECTED' ? 'bg-green-100 text-green-700 border-green-200' :
                        newStatus === 'REJECTED' ? 'bg-red-100 text-red-700 border-red-200' :
                        'bg-yellow-100 text-yellow-700 border-yellow-200'
                      }`}
                    >
                      <option value="PENDING" className="bg-white text-gray-900 font-semibold">PENDING</option>
                      <option value="SELECTED" className="bg-white text-green-700 font-semibold">SELECTED</option>
                      <option value="REJECTED" className="bg-white text-red-700 font-semibold">REJECTED</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                  <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Introduction</h4>
                  <p className="text-gray-900 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                    {viewingCandidate.candidate_description || 'Not provided'}
                  </p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                  <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Why eligible & Contribution</h4>
                  <p className="text-gray-900 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                    {viewingCandidate.candidate_why_eligible || 'Not provided'}
                  </p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                  <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Admin Comments</h4>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add an internal comment about this candidate..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                  />
                </div>
                
                {viewingCandidate && (newStatus !== viewingCandidate.candidate_status || newComment !== (viewingCandidate.candidate_comment || '')) && (
                  <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
                    <button
                      onClick={handleStatusUpdate}
                      disabled={isUpdatingStatus}
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/30"
                    >
                      {isUpdatingStatus && <Loader2 className="w-4 h-4 animate-spin" />}
                      {isUpdatingStatus ? "Saving..." : "Save Status"}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

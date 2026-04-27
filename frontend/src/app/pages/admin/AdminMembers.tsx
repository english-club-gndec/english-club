import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Instagram, Linkedin, Mail, Github, Loader2, User as UserIcon, CheckCircle2, Circle } from "lucide-react";
import { toast, Toaster } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { memberService } from "../../../services/memberService";
import { supabase } from "../../../lib/supabase";

interface Member {
  member_id: string;
  member_name: string;
  member_postion: string;
  member_profile_picture_key: string;
  member_crn: number | null;
  member_urn: number;
  member_email: string;
  member_department: string;
  member_semester: number;
  member_club_department: string;
  socials: {
    instagram?: string;
    linkedin?: string;
    github?: string;
  };
  created_at: string;
}

export function AdminMembers() {
  const { userId, logout } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchMembers = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await memberService.getAllMembers(userId);
      setMembers(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch members");
      // If the admin's own ID is not found, force logout
      if (error.message && error.message.includes("404")) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [userId]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState({
    member_name: "",
    member_postion: "ACTIVE_MEMBER",
    member_profile_picture_key: "",
    member_crn: "" as string | number,
    member_urn: "" as string | number,
    member_email: "",
    member_department: "IT",
    member_semester: 1,
    member_club_department: "",
    instagram: "",
    linkedin: "",
    github: ""
  });

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast.error("Only JPEG and PNG images are allowed");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }

    setProfileImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const uploadImage = async (file: File, name: string) => {
    const extension = file.name.split('.').pop();
    const fileName = `${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.${extension}`;
    
    const { error } = await supabase.storage
      .from('profile_pictures')
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type
      });

    if (error) throw error;
    return fileName;
  };

  const getPublicUrl = (key: string | undefined) => {
    if (!key) return "";
    const { data } = supabase.storage.from('profile_pictures').getPublicUrl(key);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      let imageKey = formData.member_profile_picture_key;
      if (profileImageFile) {
        imageKey = await uploadImage(profileImageFile, formData.member_name);
      }

      const payload = {
        member_name: formData.member_name,
        member_postion: formData.member_postion,
        member_profile_picture_key: imageKey,
        member_crn: formData.member_crn ? Number(formData.member_crn) : null,
        member_urn: Number(formData.member_urn),
        member_email: formData.member_email,
        member_department: formData.member_department,
        member_semester: Number(formData.member_semester),
        member_club_department: formData.member_club_department,
        socials: {
          instagram: formData.instagram || undefined,
          linkedin: formData.linkedin || undefined,
          github: formData.github || undefined,
        },
        created_by: userId
      };

      if (editingMember) {
        await memberService.updateMember(userId, editingMember.member_id, payload);
        toast.success("Member updated successfully!");
      } else {
        await memberService.createMember(userId, payload);
        toast.success("Member added successfully!");
      }
      
      await fetchMembers();
      closeModal();
    } catch (error: any) {
      toast.error(error.message || "Operation failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!userId) return;
    if (!confirm("Are you sure you want to delete this member?")) return;

    try {
      await memberService.deleteMembers(userId, [id]);
      toast.success("Member deleted successfully!");
      await fetchMembers();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete member");
    }
  };

  const handleBulkDelete = async () => {
    if (!userId || selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} members?`)) return;

    try {
      await memberService.deleteMembers(userId, selectedIds);
      toast.success(`${selectedIds.length} members deleted successfully!`);
      setSelectedIds([]);
      await fetchMembers();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete members");
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedIds(members.map(m => m.member_id));
  const unselectAll = () => setSelectedIds([]);

  const openModal = (member?: Member) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        member_name: member.member_name,
        member_postion: member.member_postion,
        member_profile_picture_key: member.member_profile_picture_key,
        member_crn: member.member_crn || "",
        member_urn: member.member_urn,
        member_email: member.member_email,
        member_department: member.member_department,
        member_semester: member.member_semester,
        member_club_department: member.member_club_department,
        instagram: member.socials.instagram || "",
        linkedin: member.socials.linkedin || "",
        github: member.socials.github || ""
      });
      setPreviewUrl(member.member_profile_picture_key ? getPublicUrl(member.member_profile_picture_key) : "");
    } else {
      setEditingMember(null);
      setFormData({
        member_name: "",
        member_postion: "ACTIVE_MEMBER",
        member_profile_picture_key: "",
        member_crn: "",
        member_urn: "",
        member_email: "",
        member_department: "IT",
        member_semester: 1,
        member_club_department: "",
        instagram: "",
        linkedin: "",
        github: ""
      });
      setPreviewUrl("");
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMember(null);
    setProfileImageFile(null);
    setPreviewUrl("");
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
              Club Members
            </h1>
            <p className="text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              Manage English Club members and their information
            </p>
          </div>
          <div className="flex gap-4">
            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg shadow-red-500/30"
              >
                <Trash2 className="w-5 h-5" />
                Delete Selected ({selectedIds.length})
              </button>
            )}
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-900 to-purple-700 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Member
            </button>
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          <button onClick={selectAll} className="text-sm font-semibold text-blue-600 hover:underline">Select All</button>
          <button onClick={unselectAll} className="text-sm font-semibold text-gray-500 hover:underline">Unselect All</button>
        </div>

        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden min-h-[400px] flex flex-col">
          <div className="overflow-x-auto flex-1">
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                   <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                   <p className="text-gray-500">Loading members...</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left w-10"></th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Profile</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Position</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Dept / Sem</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {members.map((member) => (
                      <tr key={member.member_id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${selectedIds.includes(member.member_id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                        <td className="px-6 py-4">
                          <button onClick={() => toggleSelect(member.member_id)}>
                            {selectedIds.includes(member.member_id) ? (
                              <CheckCircle2 className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-300" />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                            {member.member_profile_picture_key ? (
                              <img src={getPublicUrl(member.member_profile_picture_key)} className="w-full h-full object-cover" />
                            ) : (
                              <UserIcon className="w-full h-full p-2 text-gray-400" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{member.member_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{member.member_postion.replace('_', ' ')}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{member.member_email}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{member.member_department} / Sem {member.member_semester}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => openModal(member)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(member.member_id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
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
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6 overflow-y-auto" onClick={closeModal}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-900 rounded-3xl max-w-2xl w-full my-auto" 
              onClick={e => e.stopPropagation()}
            >
              <div className="p-8 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <h2 className="text-2xl font-bold">{editingMember ? "Edit Member" : "Add New Member"}</h2>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6" /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                      {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" /> : <UserIcon className="w-10 h-10 text-gray-400" />}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                      <Plus className="w-6 h-6" />
                      <input type="file" className="hidden" accept="image/jpeg,image/png" onChange={handleFileChange} />
                    </label>
                  </div>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Profile Picture</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Full Name</label>
                    <input type="text" required value={formData.member_name} onChange={e => setFormData({...formData, member_name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Position</label>
                    <select value={formData.member_postion} onChange={e => setFormData({...formData, member_postion: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
                      <option value="CONVENOR">Convenor</option>
                      <option value="CO-CONVENOR">Co-Convenor</option>
                      <option value="TECH_HEAD">Tech Head</option>
                      <option value="CO-TECH_HEAD">Co-Tech Head</option>
                      <option value="CREATIVE_HEAD">Creative Head</option>
                      <option value="CO-CREATIVE_HEAD">Co-Creative Head</option>
                      <option value="EXECUTIVE_MEMBER">Executive Member</option>
                      <option value="ACTIVE_MEMBER">Active Member</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Email</label>
                    <input type="email" required value={formData.member_email} onChange={e => setFormData({...formData, member_email: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">URN</label>
                    <input type="number" required value={formData.member_urn} onChange={e => setFormData({...formData, member_urn: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Dept</label>
                    <select value={formData.member_department} onChange={e => setFormData({...formData, member_department: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
                      {['IT', 'CSE', 'ECE', 'CE', 'ME', 'BBA', 'BCA'].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Sem</label>
                    <input type="number" min="1" max="8" value={formData.member_semester} onChange={e => setFormData({...formData, member_semester: Number(e.target.value)})} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">CRN</label>
                    <input type="number" value={formData.member_crn} onChange={e => setFormData({...formData, member_crn: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" />
                  </div>
                </div>

                <div>
                   <label className="block text-sm font-semibold mb-2">Club Dept</label>
                   <input type="text" value={formData.member_club_department} onChange={e => setFormData({...formData, member_club_department: e.target.value})} placeholder="e.g. Technical Department" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" />
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <h3 className="font-bold flex items-center gap-2"><Instagram className="w-4 h-4" /> Socials</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <input type="text" placeholder="Instagram URL" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} className="px-4 py-2 rounded-lg border border-gray-200 text-sm" />
                    <input type="text" placeholder="LinkedIn URL" value={formData.linkedin} onChange={e => setFormData({...formData, linkedin: e.target.value})} className="px-4 py-2 rounded-lg border border-gray-200 text-sm" />
                    <input type="text" placeholder="GitHub URL" value={formData.github} onChange={e => setFormData({...formData, github: e.target.value})} className="px-4 py-2 rounded-lg border border-gray-200 text-sm" />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={closeModal} className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-all">Cancel</button>
                  <button type="submit" className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-900 to-purple-700 text-white font-bold hover:shadow-lg transition-all">
                    {editingMember ? "Update Member" : "Add Member"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

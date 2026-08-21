import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Mail, Loader2, User as UserIcon, Check, Search } from "lucide-react";
import { toast, Toaster } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../../services/userService";
import { memberService } from "../../../services/memberService";
import { supabase } from "../../../lib/supabase";

interface User {
  id: number;
  member_id: string;
  name: string;
  role: "MASTER" | "ADMIN" | "MANAGER" | "INTERVIEWEE";
  profilePicture?: string;
  memberName?: string;
  memberClubDepartment?: string;
}

interface Member {
  member_id: string;
  member_name: string;
  member_email: string;
  member_profile_picture_key: string;
  member_club_department?: string;
}

export function AdminUsers() {
  const { userId, logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Select Member, Step 2: Set User Details
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "MANAGER" as "MASTER" | "ADMIN" | "MANAGER" | "INTERVIEWEE",
    department: "TECHNICAL"
  });

  const fetchUsers = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await userService.getUsers(userId);
      setUsers(data.map((u: any) => ({
        id: u.user_id,
        member_id: u.member_id,
        name: u.user_name,
        role: u.user_role,
        profilePicture: u.members?.member_profile_picture_key,
        memberName: u.members?.member_name,
        memberEmail: u.members?.member_email,
        memberClubDepartment: u.members?.member_club_department
      })));
    } catch (error: any) {
      toast.error("Failed to fetch users");
      // If the admin's own ID is not found, force logout
      if (error.message && error.message.includes("404")) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [userId]);

  const openAddModal = async () => {
    if (!userId) return;
    try {
      const memberData = await memberService.getAllMembers();
      setMembers(memberData);
      setStep(1);
      setSelectedMember(null);
      setEditingUser(null);
      setFormData({ username: "", password: "", role: "MANAGER", department: "TECHNICAL" });
      setIsModalOpen(true);
    } catch (error) {
      toast.error("Failed to fetch members list");
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setSelectedMember({
      member_id: user.member_id,
      member_name: user.name,
      member_email: "",
      member_profile_picture_key: user.profilePicture || "",
      member_club_department: user.memberClubDepartment
    });
    setFormData({
      username: user.name,
      password: "",
      role: user.role,
      department: user.memberClubDepartment || "TECHNICAL"
    });
    setStep(2);
    setIsModalOpen(true);
  };

  const handleSelectMember = (member: Member) => {
    const alreadyHasAccount = users.some(u => u.member_id === member.member_id);
    if (alreadyHasAccount) {
      toast.error("This member already has a user account");
      return;
    }
    setSelectedMember(member);
    setFormData({
      ...formData,
      username: member.member_name.toLowerCase().replace(/\s+/g, '_'),
      department: member.member_club_department || "TECHNICAL"
    });
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !selectedMember) return;

    try {
      if (editingUser) {
        const payload: any = {
          user_name: formData.username,
          user_role: formData.role,
        };
        if (formData.password) {
          payload.user_password = formData.password;
        }
        await userService.updateUser(String(editingUser.id), payload);
        if (formData.role === "INTERVIEWEE" && formData.department) {
          await memberService.updateMember(userId, selectedMember.member_id, {
            member_club_department: formData.department
          });
        }
        toast.success("User account updated successfully!");
      } else {
        const payload = {
          user_name: formData.username,
          user_password: formData.password,
          user_role: formData.role,
          member_id: selectedMember.member_id
        };
        await userService.createUser(userId, payload);
        if (formData.role === "INTERVIEWEE" && formData.department) {
          await memberService.updateMember(userId, selectedMember.member_id, {
            member_club_department: formData.department
          });
        }
        toast.success("User account created successfully!");
      }
      await fetchUsers();
      closeModal();
    } catch (error: any) {
      toast.error(error.message || "Failed to save user account");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setStep(1);
    setSelectedMember(null);
    setEditingUser(null);
  };

  const handleDelete = (id: number) => {
    setDeleteConfirmId(id);
  };

  const getPublicUrl = (key: string | undefined) => {
    if (!key) return "";
    const { data } = supabase.storage.from('profile_pictures').getPublicUrl(key);
    return data.publicUrl;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "MASTER": return "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300";
      case "ADMIN": return "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300";
      case "MANAGER": return "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300";
      case "INTERVIEWEE": return "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const filteredMembers = members.filter(m => 
    m.member_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.member_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">User Accounts</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage login credentials for club members</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-900 to-purple-700 text-white font-bold hover:shadow-lg transition-all text-sm"
          >
            <Plus className="w-5 h-5" />
            Add User Account
          </button>
        </div>

        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Account Holder</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={3} className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" /></td></tr>
              ) : users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                       {user.profilePicture ? (
                         <img src={getPublicUrl(user.profilePicture)} className="w-full h-full object-cover" />
                       ) : (
                         <UserIcon className="text-gray-400" />
                       )}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white leading-none mb-1">{user.memberName}</div>
                      <div className="text-xs text-gray-500 font-medium italic">@{user.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                      {user.role === "INTERVIEWEE" && user.memberClubDepartment && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          {user.memberClubDepartment}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => openEditModal(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={closeModal}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full" 
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <h2 className="text-xl font-bold">
                  {editingUser ? "Edit Account" : (step === 1 ? "Select Member" : "Account Details")}
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-6">
                {step === 1 ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Search members..." 
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {filteredMembers.map(member => {
                        const hasAccount = users.some(u => u.member_id === member.member_id);
                        return (
                          <button
                            key={member.member_id}
                            disabled={hasAccount}
                            onClick={() => handleSelectMember(member)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${hasAccount ? 'bg-gray-50 border-gray-100 opacity-60 grayscale' : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                {member.member_profile_picture_key ? (
                                  <img src={getPublicUrl(member.member_profile_picture_key)} className="w-full h-full object-cover" />
                                ) : (
                                  <UserIcon className="p-1 text-gray-400" />
                                )}
                              </div>
                              <div className="text-left">
                                <p className="text-sm font-bold">{member.member_name}</p>
                                <p className="text-[10px] text-gray-500">{member.member_email}</p>
                              </div>
                            </div>
                            {hasAccount && <span className="text-[10px] font-bold text-green-600 flex items-center gap-1"><Check className="w-3 h-3" /> Done</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl mb-4 border border-blue-100">
                       <div className="w-10 h-10 rounded-full bg-blue-200 overflow-hidden">
                         {selectedMember?.member_profile_picture_key ? (
                           <img src={getPublicUrl(selectedMember.member_profile_picture_key)} className="w-full h-full object-cover" />
                         ) : (
                           <UserIcon className="p-2 text-blue-600" />
                         )}
                       </div>
                       <div>
                         <p className="text-sm font-bold text-blue-900">{selectedMember?.member_name}</p>
                         <button type="button" onClick={() => setStep(1)} className="text-[10px] text-blue-600 hover:underline">Change Member</button>
                       </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Username</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.username} 
                        onChange={e => setFormData({...formData, username: e.target.value})}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                        {editingUser ? "New Password (leave blank to keep current)" : "Password"}
                      </label>
                      <input 
                        type="password" 
                        required={!editingUser} 
                        value={formData.password} 
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Role</label>
                      <select 
                        value={formData.role} 
                        onChange={e => setFormData({...formData, role: e.target.value as any})}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200"
                      >
                        <option value="MANAGER">Manager</option>
                        <option value="ADMIN">Admin</option>
                        <option value="MASTER">Master</option>
                        <option value="INTERVIEWEE">Interviewee</option>
                      </select>
                    </div>

                    {formData.role === "INTERVIEWEE" && (
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">
                          Interviewee Department *
                        </label>
                        <select
                          value={formData.department}
                          onChange={e => setFormData({ ...formData, department: e.target.value })}
                          className="w-full px-4 py-2 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 font-semibold text-sm"
                        >
                          <option value="TECHNICAL">Technical</option>
                          <option value="EVENT_MANAGEMENT">Event Management</option>
                          <option value="FINANCE_&_MARKET_RELATIONS">Finance & Market Relations</option>
                          <option value="CREATIVE_&_PHOTOGRAPHY">Creative & Photography</option>
                          <option value="PROMOTION">Promotion</option>
                          <option value="ANCHORING">Anchoring</option>
                        </select>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      {!editingUser && <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 text-sm font-bold text-gray-500">Back</button>}
                      <button type="submit" className="flex-[2] py-3 bg-gradient-to-r from-blue-900 to-purple-700 text-white rounded-xl font-bold shadow-lg">
                        {editingUser ? "Update Account" : "Create Account"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirmId !== null && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-6"
            onClick={() => setDeleteConfirmId(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl flex flex-col items-center gap-6" 
              onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-600 dark:text-red-400">
                <Trash2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete User</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Are you sure you want to delete this user account? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-4 w-full">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-5 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-850 text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const id = deleteConfirmId;
                    setDeleteConfirmId(null);
                    try {
                      await userService.deleteUser(String(id));
                      toast.success("User account deleted successfully!");
                      await fetchUsers();
                    } catch (error: any) {
                      toast.error(error.message || "Failed to delete user account");
                    }
                  }}
                  className="flex-1 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-lg shadow-red-500/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

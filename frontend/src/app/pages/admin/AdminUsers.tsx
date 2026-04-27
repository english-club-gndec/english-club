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
  role: "MASTER" | "ADMIN" | "MANAGER";
  profilePicture?: string;
  memberName?: string;
}

interface Member {
  member_id: string;
  member_name: string;
  member_email: string;
  member_profile_picture_key: string;
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
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "MANAGER" as "MASTER" | "ADMIN" | "MANAGER"
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
        memberEmail: u.members?.member_email
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
      const memberData = await memberService.getAllMembers(userId);
      setMembers(memberData);
      setStep(1);
      setSelectedMember(null);
      setEditingUser(null);
      setFormData({ username: "", password: "", role: "MANAGER" });
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
      member_profile_picture_key: user.profilePicture || ""
    });
    setFormData({
      username: user.name,
      password: "",
      role: user.role
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
    setFormData({ ...formData, username: member.member_name.toLowerCase().replace(/\s+/g, '_') });
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
        toast.success("User account updated successfully!");
      } else {
        const payload = {
          user_name: formData.username,
          user_password: formData.password,
          user_role: formData.role,
          member_id: selectedMember.member_id
        };
        await userService.createUser(userId, payload);
        toast.success("User account created successfully!");
      }
      await fetchUsers();
      closeModal();
    } catch (error: any) {
      toast.error(error.message || "Failed to create user");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setStep(1);
    setSelectedMember(null);
    setEditingUser(null);
  };

  const getPublicUrl = (key: string | undefined) => {
    if (!key) return "";
    const { data } = supabase.storage.from('profile_pictures').getPublicUrl(key);
    return data.publicUrl;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "MASTER": return "bg-purple-100 text-purple-700";
      case "ADMIN": return "bg-blue-100 text-blue-700";
      case "MANAGER": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">User Accounts</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage login credentials for club members</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-900 to-purple-700 text-white font-bold hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Add User Account
          </button>
        </div>

        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden">
          <table className="w-full">
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
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => openEditModal(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
                      </select>
                    </div>

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
    </>
  );
}

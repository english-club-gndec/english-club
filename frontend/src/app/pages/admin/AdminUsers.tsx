import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Instagram, Linkedin, Mail, Github, Loader2, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../../services/userService";

interface User {
  id: number;
  name: string;
  role: "MASTER" | "ADMIN" | "MANAGER";
  email: string;
  profilePicture?: string;
  socials: {
    instagram?: string;
    linkedin?: string;
    github?: string;
  };
}

export function AdminUsers() {
  const { userId } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      if (userId) {
        try {
          const data = await userService.getUsers(userId);
          const transformedUsers = data.map((u: any) => ({
            id: u.user_id,
            name: u.user_name,
            email: u.user_email,
            role: u.user_role,
            profilePicture: u.user_image_key,
            socials: {
              instagram: u.instagram,
              linkedin: u.linkedin,
              github: u.github
            }
          }));
          setUsers(transformedUsers);
        } catch (error) {
          toast.error("Failed to fetch users");
        } finally {
          setLoading(false);
        }
      }
    }
    fetchUsers();
  }, [userId]);


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "MANAGER" as "MASTER" | "ADMIN" | "MANAGER",
    instagram: "",
    linkedin: "",
    github: "",
    description: "",
    profileImage: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUser) {
      if (!userId) return;
      try {
        const payload = {
          user_name: formData.name,
          instagram: formData.instagram || undefined,
          linkedin: formData.linkedin || undefined,
          github: formData.github || undefined,
        };
        await userService.updateUser(editingUser.id.toString(), payload);
        toast.success("User updated successfully!");
        
        // Refresh users list
        const data = await userService.getUsers(userId);
        const transformedUsers = data.map((u: any) => ({
          id: u.user_id,
          name: u.user_name,
          email: u.user_email,
          role: u.user_role,
          profilePicture: u.user_image_key,
          socials: {
            instagram: u.instagram,
            linkedin: u.linkedin,
            github: u.github
          }
        }));
        setUsers(transformedUsers);
      } catch (error: any) {
        toast.error(error.message || "Failed to update user");
        return;
      }
    } else {
      if (!userId) return;
      try {
        const payload = {
          user_name: formData.name,
          user_password: formData.password,
          user_role: formData.role,
          instagram: formData.instagram || undefined,
          linkedin: formData.linkedin || undefined,
          github: formData.github || undefined,
        };
        await userService.createUser(userId, payload);
        toast.success("User added successfully!");
        
        // Refresh users list
        const data = await userService.getUsers(userId);
        const transformedUsers = data.map((u: any) => ({
          id: u.user_id,
          name: u.user_name,
          email: u.user_email,
          role: u.user_role,
          profilePicture: u.user_image_key,
          socials: {
            instagram: u.instagram,
            linkedin: u.linkedin,
            github: u.github
          }
        }));
        setUsers(transformedUsers);
      } catch (error: any) {
        toast.error(error.message || "Failed to create user");
        return;
      }
    }

    closeModal();
  };

  const handleDelete = (_id: number) => {
    toast.info("Deletion is currently disabled (placeholder)");
  };

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: "",
        role: user.role,
        instagram: user.socials.instagram || "",
        linkedin: user.socials.linkedin || "",
        github: user.socials.github || "",
        description: "",
        profileImage: ""
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "MANAGER",
        instagram: "",
        linkedin: "",
        github: "",
        description: "",
        profileImage: ""
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "MASTER": return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400";
      case "ADMIN": return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
      case "MANAGER": return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
      default: return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400";
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
              Users Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              Manage admin users and their roles
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-900 to-purple-700 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all"
            style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}
          >
            <Plus className="w-5 h-5" />
            Add User
          </button>
        </div>

        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden min-h-[400px] flex flex-col">
          <div className="overflow-x-auto flex-1 flex flex-col">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center gap-4 py-20"
                >
                  <div className="relative">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500"
                    />
                    <Loader2 className="w-8 h-8 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin-slow" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 animate-pulse" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                    Fetching membership records...
                  </p>
                </motion.div>
              ) : (
                <motion.table
                  key="table"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-full"
                >
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                        Profile
                      </th>
                      <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                        Social Links
                      </th>
                      <th className="px-6 py-4 text-right text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {users.map((user) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            {user.profilePicture ? (
                              <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              <UserIcon className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                            {user.name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                            <Mail className="w-4 h-4" />
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs ${getRoleBadgeColor(user.role)}`} style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {user.socials.instagram && (
                              <a href={user.socials.instagram} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-br hover:from-blue-900 hover:to-purple-700 transition-all group">
                                <Instagram className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-white" />
                              </a>
                            )}
                            {user.socials.linkedin && (
                              <a href={user.socials.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-br hover:from-blue-900 hover:to-purple-700 transition-all group">
                                <Linkedin className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-white" />
                              </a>
                            )}
                            {user.socials.github && (
                              <a href={user.socials.github} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-br hover:from-blue-900 hover:to-purple-700 transition-all group">
                                <Github className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-white" />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openModal(user)}
                              className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </motion.table>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-8 py-6 flex items-center justify-between">
                <h2 className="text-2xl text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                  {editingUser ? "Edit User" : "Add New User"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                      Username (for now)
                    </label>
                    <input
                      type="text"
                      id="name"
                      placeholder="firstname_lastname_position"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      autoComplete="off"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                      style={{ fontFamily: 'Open Sans, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                      Email Address (api connection left)
                    </label>
                    <input
                      type="email"
                      id="email"
                      placeholder="abc123@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                      style={{ fontFamily: 'Open Sans, sans-serif' }}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                    Description (api connection left)
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all min-h-[100px]"
                    style={{ fontFamily: 'Open Sans, sans-serif' }}
                  />
                </div>

                <div>
                  <label htmlFor="profileImage" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                    Profile Image (api connection left)
                  </label>
                  <input
                    type="file"
                    id="profileImage"
                    onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    style={{ fontFamily: 'Open Sans, sans-serif' }}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="password" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                      Password {editingUser && "(leave blank to keep current)"}
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!editingUser}
                      autoComplete="new-password"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      style={{ fontFamily: 'Open Sans, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                      Role
                    </label>
                    <select
                      id="role"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      style={{ fontFamily: 'Open Sans, sans-serif' }}
                    >
                      <option value="MANAGER">Manager</option>
                      <option value="ADMIN">Admin</option>
                      <option value="MASTER">Master</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                    Social Links (Optional)
                  </h3>

                  <div>
                    <label htmlFor="instagram" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                      Instagram
                    </label>
                    <input
                      type="url"
                      id="instagram"
                      value={formData.instagram}
                      onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                      placeholder="https://instagram.com/username"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      style={{ fontFamily: 'Open Sans, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label htmlFor="linkedin" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      id="linkedin"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      style={{ fontFamily: 'Open Sans, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label htmlFor="github" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                      GitHub
                    </label>
                    <input
                      type="url"
                      id="github"
                      value={formData.github}
                      onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                      placeholder="https://github.com/username"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      style={{ fontFamily: 'Open Sans, sans-serif' }}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                    style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-900 to-purple-700 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                    style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}
                  >
                    {editingUser ? "Update User" : "Add User"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

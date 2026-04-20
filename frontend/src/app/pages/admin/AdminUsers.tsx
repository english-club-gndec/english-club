import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Plus, Edit2, Trash2, X, Instagram, Linkedin, Mail, Github } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "sonner";

interface User {
  id: number;
  name: string;
  role: "MASTER" | "ADMIN" | "MANAGER";
  email: string;
  socials: {
    instagram?: string;
    linkedin?: string;
    github?: string;
  };
}

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: "John Doe",
      role: "MASTER",
      email: "john@englishclub.edu",
      socials: { instagram: "#", linkedin: "#", github: "#" }
    },
    {
      id: 2,
      name: "Jane Smith",
      role: "ADMIN",
      email: "jane@englishclub.edu",
      socials: { instagram: "#", linkedin: "#" }
    },
    {
      id: 3,
      name: "Mike Johnson",
      role: "MANAGER",
      email: "mike@englishclub.edu",
      socials: { linkedin: "#" }
    },
  ]);

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
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? {
        ...u,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        socials: {
          instagram: formData.instagram || undefined,
          linkedin: formData.linkedin || undefined,
          github: formData.github || undefined,
        }
      } : u));
      toast.success("User updated successfully!");
    } else {
      const newUser: User = {
        id: Math.max(...users.map(u => u.id)) + 1,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        socials: {
          instagram: formData.instagram || undefined,
          linkedin: formData.linkedin || undefined,
          github: formData.github || undefined,
        }
      };
      setUsers([...users, newUser]);
      toast.success("User added successfully!");
    }

    closeModal();
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter(u => u.id !== id));
      toast.success("User deleted successfully!");
    }
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

        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
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
                          <a href={user.socials.instagram} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-br hover:from-blue-900 hover:to-purple-700 transition-all group">
                            <Instagram className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-white" />
                          </a>
                        )}
                        {user.socials.linkedin && (
                          <a href={user.socials.linkedin} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-br hover:from-blue-900 hover:to-purple-700 transition-all group">
                            <Linkedin className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-white" />
                          </a>
                        )}
                        {user.socials.github && (
                          <a href={user.socials.github} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-br hover:from-blue-900 hover:to-purple-700 transition-all group">
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
            </table>
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
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      style={{ fontFamily: 'Open Sans, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      style={{ fontFamily: 'Open Sans, sans-serif' }}
                    />
                  </div>
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

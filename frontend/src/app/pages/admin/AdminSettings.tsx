import { motion } from "motion/react";
import { useState } from "react";
import { User, Lock, Shield } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "sonner";

export function AdminSettings() {
  const [profileData, setProfileData] = useState({
    name: "Admin User",
    email: "admin@englishclub.edu",
    role: "MASTER"
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile updated successfully!");
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    toast.success("Password changed successfully!");
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-900 to-purple-700">
                <User className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                Profile Settings
              </h2>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
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
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  style={{ fontFamily: 'Open Sans, sans-serif' }}
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                  Role
                </label>
                <input
                  type="text"
                  id="role"
                  value={profileData.role}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  style={{ fontFamily: 'Open Sans, sans-serif' }}
                />
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-900 to-purple-700 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}
              >
                Save Profile
              </button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-900 to-purple-700">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                Change Password
              </h2>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  style={{ fontFamily: 'Open Sans, sans-serif' }}
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  style={{ fontFamily: 'Open Sans, sans-serif' }}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  style={{ fontFamily: 'Open Sans, sans-serif' }}
                />
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-900 to-purple-700 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}
              >
                Update Password
              </button>
            </form>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-900 to-purple-700">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
              Security & Permissions
            </h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-sm text-gray-900 dark:text-white mb-1" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                    Two-Factor Authentication
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                    Add an extra layer of security to your account
                  </p>
                </div>
                <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-900 to-purple-700 text-white hover:shadow-lg transition-all text-sm" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                  Enable
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-sm text-gray-900 dark:text-white mb-1" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                    Login Activity
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                    View recent login history and active sessions
                  </p>
                </div>
                <button className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-sm" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                  View
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Search, Bell, User, LogOut, Settings as SettingsIcon, Moon, Sun, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../ThemeProvider";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../../services/userService";
import { supabase } from "../../../lib/supabase";
import { useAdminSearch } from "../../context/AdminSearchContext";

interface AdminNavbarProps {
  onOpenMobileMenu?: () => void;
}

export function AdminNavbar({ onOpenMobileMenu }: AdminNavbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [adminName, setAdminName] = useState("Admin User");
  const [adminEmail, setAdminEmail] = useState("admin@englishclub.edu");
  const [adminProfilePic, setAdminProfilePic] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();
  const { logout, userId, user } = useAuth();
  const { searchQuery, setSearchQuery, searchPlaceholder, clearSearch } = useAdminSearch();

  useEffect(() => {
    async function fetchAdminDetails() {
      let current = user;

      if (!current?.members && userId) {
        try {
          const userData = await userService.getUserById(userId);
          if (userData) {
            current = userData;
          }
        } catch (err: any) {
          console.error("Failed to fetch admin details:", err);
          if (err.message && err.message.includes("404")) {
            logout();
          }
        }
      }

      if (current) {
        if (current.members?.member_name) {
          setAdminName(current.members.member_name);
        } else if (current.user_name) {
          setAdminName(current.user_name);
        }

        if (current.members) {
          if (current.members.member_email) {
            setAdminEmail(current.members.member_email);
          }
          if (current.members.member_profile_picture_key) {
            setAdminProfilePic(current.members.member_profile_picture_key);
          }
        }
      }
    }
    fetchAdminDetails();
  }, [user, userId]);


  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-2xl">
            {onOpenMobileMenu && (
              <button
                onClick={onOpenMobileMenu}
                className="lg:hidden p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shrink-0"
                aria-label="Open Mobile Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div className="lg:hidden flex items-center gap-1.5 shrink-0">
              <img src="/images/gndec-logo.png" alt="GNDEC Logo" className="w-8 h-8 object-contain p-0.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white" />
              <img src="/images/logo.png" alt="English Club Logo" className="w-8 h-8 object-contain p-0.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white" />
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-12 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm sm:text-base outline-none"
                style={{ fontFamily: 'Open Sans, sans-serif' }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>

            {/* <button className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button> */}

            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-900 to-purple-700 flex items-center justify-center overflow-hidden border border-gray-200">
                  {adminProfilePic ? (
                    <img 
                      src={supabase.storage.from('profile_pictures').getPublicUrl(adminProfilePic).data.publicUrl} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm text-gray-900 dark:text-white" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                    {adminName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                    {adminEmail}
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsProfileOpen(false)}
                    />
                    <motion.div
                      className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl z-50"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <div className="p-2">
                        <Link
                          to="/admin/settings"
                          onClick={() => setIsProfileOpen(false)}
                          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-left transition-colors"
                          style={{ fontFamily: 'Open Sans, sans-serif' }}
                        >
                          <SettingsIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Settings</span>
                        </Link>
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-left transition-colors"
                          style={{ fontFamily: 'Open Sans, sans-serif' }}
                        >
                          <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                          <span className="text-sm text-red-600 dark:text-red-400">Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

import { useState } from "react";
import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  BookOpen,
  FileText,
  Settings,
  X,
  Menu
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function AdminSidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/users", label: "Users", icon: Users },
    { path: "/admin/events", label: "Events", icon: Calendar },
    { path: "/admin/registrations", label: "Registrations", icon: ClipboardList },
    { path: "/admin/resources", label: "Resources", icon: BookOpen },
    { path: "/admin/submissions", label: "Submissions", icon: FileText },
    { path: "/admin/settings", label: "Settings", icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-white dark:bg-gray-900 shadow-lg"
      >
        <Menu className="w-6 h-6 text-gray-900 dark:text-white" />
      </button>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 transition-transform lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src="/images/logo.png" alt="English Club Logo" className="w-10 h-10 object-contain rounded-full border border-gray-200 dark:border-gray-800" />
              <div>
                <div className="text-lg text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                  English Club
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                  Admin Panel
                </div>
              </div>
            </Link>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive(item.path)
                    ? "bg-gradient-to-r from-blue-900 to-purple-700 text-white shadow-lg shadow-purple-500/30"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <Link
              to="/"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
              style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}
            >
              Back to Website
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

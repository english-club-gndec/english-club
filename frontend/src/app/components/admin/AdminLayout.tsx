import { useState } from "react";
import { Outlet, useLocation, Navigate } from "react-router";
import { AdminSidebar } from "./AdminSidebar";
import { AdminNavbar } from "./AdminNavbar";
import { PageTitle } from "../PageTitle";
import { useAuth } from "../../context/AuthContext";
import { AdminSearchProvider } from "../../context/AdminSearchContext";

export function AdminLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  if (user?.user_role === "INTERVIEWEE") {
    const allowedPaths = ["/admin/recruitments", "/admin/settings"];
    const isAllowed = allowedPaths.some(path => location.pathname === path || location.pathname.startsWith(`${path}/`));
    if (!isAllowed) {
      return <Navigate to="/admin/recruitments" replace />;
    }
  }

  return (
    <AdminSearchProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
        <PageTitle />
        <AdminSidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
        <div className="lg:pl-64">
          <AdminNavbar onOpenMobileMenu={() => setIsMobileOpen(true)} />
          <main className="p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </AdminSearchProvider>
  );
}

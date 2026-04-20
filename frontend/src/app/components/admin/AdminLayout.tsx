import { Outlet } from "react-router";
import { AdminSidebar } from "./AdminSidebar";
import { AdminNavbar } from "./AdminNavbar";

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <AdminSidebar />
      <div className="lg:pl-64">
        <AdminNavbar />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { useEffect } from "react";
import { useLocation } from "react-router";

const routeTitles: Record<string, string> = {
  "/": "English Club",
  "/events": "Events",
  "/register": "Event Registration",
  "/join": "Join Us",
  "/team": "Our Team",
  "/submit": "Student Publications",
  "/submit-article": "Submit Article",
  "/vote": "Voting Page",
  "/admin/login": "Admin Login",
  "/admin": "Admin Dashboard",
  "/admin/users": "Admin Users",
  "/admin/members": "Admin Members",
  "/admin/events": "Admin Events",
  "/admin/registrations": "Admin Registrations",
  "/admin/submissions": "Admin Submissions",
  "/admin/vote": "Admin Voting",
  "/admin/recruitments": "Admin Recruitments",
  "/admin/settings": "Admin Settings",
};

export function PageTitle() {
  const location = useLocation();

  useEffect(() => {
    // Exact match from the map
    let title = routeTitles[location.pathname];

    // Fallback logic for nested or unknown routes
    if (!title) {
      if (location.pathname.startsWith("/admin/")) {
        title = "Admin";
      } else {
        title = "Page Not Found";
      }
    }

    document.title = title === "English Club" ? title : `${title} | English Club`;
  }, [location]);

  return null;
}

import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Events } from "./pages/Events";
import { EventRegistration } from "./pages/EventRegistration";
import { JoinUs } from "./pages/JoinUs";
import { Team } from "./pages/Team";
import { Resources } from "./pages/Resources";
import { Submit } from "./pages/Submit";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminEvents } from "./pages/admin/AdminEvents";
import { AdminRegistrations } from "./pages/admin/AdminRegistrations";
import { AdminResources } from "./pages/admin/AdminResources";
import { AdminSubmissions } from "./pages/admin/AdminSubmissions";
import { AdminSettings } from "./pages/admin/AdminSettings";
import { ErrorPage } from "./pages/ErrorPage";
import { LoginPage } from "./pages/admin/LoginPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    errorElement: <ErrorPage />,
    children: [
      { index: true, Component: Home },
      { path: "events", Component: Events },
      { path: "register", Component: EventRegistration },
      { path: "join", Component: JoinUs },
      { path: "team", Component: Team },
      { path: "resources", Component: Resources },
      { path: "submit", Component: Submit },
    ],
  },
  {
    path: "/admin/login",
    Component: LoginPage,
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "users", Component: AdminUsers },
      { path: "events", Component: AdminEvents },
      { path: "registrations", Component: AdminRegistrations },
      { path: "resources", Component: AdminResources },
      { path: "submissions", Component: AdminSubmissions },
      { path: "settings", Component: AdminSettings },
    ],
  },
]);

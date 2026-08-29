import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Events } from "./pages/Events";
import { EventRegistration } from "./pages/EventRegistration";
import { JoinUs } from "./pages/JoinUs";
import { Team } from "./pages/Team";
import { Developers } from "./pages/Developers";
import { Articles } from "./pages/Articles";
import { SubmitArticle } from "./pages/SubmitArticle";
import { VotingPage } from "./pages/VotingPage"; // Added
import { RecruitmentResults } from "./pages/RecruitmentResults";
import { InterviewFeedbackPage } from "./pages/InterviewFeedback";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminMembers } from "./pages/admin/AdminMembers";
import { AdminEvents } from "./pages/admin/AdminEvents";
import { AdminRegistrations } from "./pages/admin/AdminRegistrations";
import { AdminSubmissions } from "./pages/admin/AdminSubmissions";
import { AdminPeoplesChoice } from "./pages/admin/AdminPeoplesChoice"; // Added
import { AdminRecruitments } from "./pages/admin/AdminRecruitments";
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
      { path: "developers", Component: Developers },
      { path: "submit", Component: Articles },
      { path: "submit-article", Component: SubmitArticle },
      { path: "edit-submission/:submissionId/:editToken", Component: SubmitArticle },
      { path: "vote", Component: VotingPage }, // Added
      { path: "recruitment-results", Component: RecruitmentResults },
      { path: "results", Component: RecruitmentResults },
      { path: "interview-feedback", Component: InterviewFeedbackPage },
      { path: "feedback", Component: InterviewFeedbackPage },
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
      { path: "members", Component: AdminMembers },
      { path: "events", Component: AdminEvents },
      { path: "registrations", Component: AdminRegistrations },
      { path: "submissions", Component: AdminSubmissions },
      { path: "vote", Component: AdminPeoplesChoice }, // Added
      { path: "recruitments", Component: AdminRecruitments },
      { path: "settings", Component: AdminSettings },
    ],
  },
]);

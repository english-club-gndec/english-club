import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Events } from "./pages/Events";
import { EventRegistration } from "./pages/EventRegistration";
import { JoinUs } from "./pages/JoinUs";
import { Team } from "./pages/Team";
import { Resources } from "./pages/Resources";
import { Submit } from "./pages/Submit";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
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
]);

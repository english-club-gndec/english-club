import { Outlet } from "react-router";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { PageTitle } from "./PageTitle";

export function Layout() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      <PageTitle />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

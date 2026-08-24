import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "react-router";

interface AdminSearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchPlaceholder: string;
  setSearchPlaceholder: (placeholder: string) => void;
  clearSearch: () => void;
}

const AdminSearchContext = createContext<AdminSearchContextType | undefined>(undefined);

export function AdminSearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchPlaceholder, setSearchPlaceholder] = useState("Search admin panel...");
  const location = useLocation();

  // Reset search query whenever navigating between admin pages
  useEffect(() => {
    setSearchQuery("");
  }, [location.pathname]);

  const clearSearch = () => setSearchQuery("");

  return (
    <AdminSearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        searchPlaceholder,
        setSearchPlaceholder,
        clearSearch
      }}
    >
      {children}
    </AdminSearchContext.Provider>
  );
}

export function useAdminSearch() {
  const context = useContext(AdminSearchContext);
  if (!context) {
    return {
      searchQuery: "",
      setSearchQuery: () => {},
      searchPlaceholder: "Search...",
      setSearchPlaceholder: () => {},
      clearSearch: () => {}
    };
  }
  return context;
}

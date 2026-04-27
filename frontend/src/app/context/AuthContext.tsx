import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  userId: string | null;
  login: (id: string | number) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(() => {
    return localStorage.getItem("admin_user_id");
  });

  const isAuthenticated = !!userId;

  const login = (id: string | number) => {
    const stringId = String(id);
    setUserId(stringId);
    localStorage.setItem("admin_user_id", stringId);
  };

  const logout = () => {
    setUserId(null);
    localStorage.removeItem("admin_user_id");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

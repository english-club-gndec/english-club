import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { userService } from "../../services/userService";

export interface UserProfile {
  user_id: string;
  user_name: string;
  user_role: string;
  member_id?: string | null;
  members?: any;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userId: string | null;
  user: UserProfile | null;
  isLoading: boolean;
  login: (user: any) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userId, setUserId] = useState<string | null>(() => {
    return localStorage.getItem("admin_user_id");
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const verifySession = async () => {
      try {
        const data = await userService.getMe();
        if (isMounted && data?.user) {
          setUser(data.user);
          setUserId(String(data.user.user_id));
          localStorage.setItem("admin_user_id", String(data.user.user_id));
        }
      } catch (err) {
        if (isMounted) {
          setUser(null);
          setUserId(null);
          localStorage.removeItem("admin_user_id");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    verifySession();
    return () => {
      isMounted = false;
    };
  }, []);

  const isAuthenticated = !!userId || !!user;

  const login = (userData: any) => {
    // If passed user_id directly or user object
    if (typeof userData === "object" && userData !== null) {
      setUser(userData);
      const stringId = String(userData.user_id);
      setUserId(stringId);
      localStorage.setItem("admin_user_id", stringId);
    } else {
      const stringId = String(userData);
      setUserId(stringId);
      localStorage.setItem("admin_user_id", stringId);
    }
  };

  const logout = async () => {
    try {
      await userService.logout();
    } catch (err) {
      console.error("Error during backend logout:", err);
    } finally {
      setUser(null);
      setUserId(null);
      localStorage.removeItem("admin_user_id");
      localStorage.removeItem("auth_token");
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userId, user, isLoading, login, logout }}>
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

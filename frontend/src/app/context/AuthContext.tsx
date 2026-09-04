import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { userService } from "../../services/userService";

export interface UserProfile {
  user_id: string;
  user_name: string;
  user_role: string;
  permissions?: string[];
  member_id?: string | null;
  members?: any;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userId: string | null;
  user: UserProfile | null;
  isLoading: boolean;
  isMasterOrAdmin: boolean;
  isManager: boolean;
  hasPermission: (permission: string) => boolean;
  canAccessPanel: (panel: 'members' | 'events' | 'registrations' | 'recruitments' | 'submissions' | 'users' | 'settings' | 'vote') => boolean;
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
  const roleUpper = String(user?.user_role || '').toUpperCase();
  const isMasterOrAdmin = roleUpper === 'MASTER' || roleUpper === 'ADMIN';
  const isManager = roleUpper === 'MANAGER';

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    // MASTER and ADMIN have universal access
    if (isMasterOrAdmin) return true;
    // MANAGER has access to all standard features
    if (isManager) return true;
    // Check custom role permissions array
    const userPermissions = user.permissions || [];
    return userPermissions.includes(permission);
  };

  const canAccessPanel = (panel: 'members' | 'events' | 'registrations' | 'recruitments' | 'submissions' | 'users' | 'settings' | 'vote'): boolean => {
    if (!user) return false;

    // Settings is open to all authenticated users
    if (panel === 'settings') return true;

    // User Accounts is strictly reserved for MASTER and ADMIN
    if (panel === 'users') return isMasterOrAdmin;

    // People's Choice voting panel
    if (panel === 'vote') return roleUpper !== 'INTERVIEWEE';

    // MASTER and ADMIN have universal panel access
    if (isMasterOrAdmin) return true;

    // MANAGER has access to all feature panels (except users)
    if (isManager) return true;

    // Specific panel read permissions
    const panelPermMap: Record<string, string> = {
      members: 'READ_MEMBERS',
      events: 'READ_EVENTS',
      registrations: 'READ_REGISTRATIONS',
      recruitments: 'READ_RECRUITMENTS',
      submissions: 'READ_SUBMISSIONS',
    };

    const requiredPerm = panelPermMap[panel];
    if (requiredPerm) {
      return hasPermission(requiredPerm);
    }

    return false;
  };

  const login = (userData: any) => {
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
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userId, 
      user, 
      isLoading, 
      isMasterOrAdmin, 
      isManager, 
      hasPermission, 
      canAccessPanel, 
      login, 
      logout 
    }}>
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

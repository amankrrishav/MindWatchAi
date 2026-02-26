import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { fetchMe } from "./api/auth";

export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);

  const setUser = (u: AuthUser | null) => {
    setUserState(u);
  };

  useEffect(() => {
    const token = window.localStorage.getItem("mw_access_token");
    if (!token) return;
    fetchMe()
      .then(setUser)
      .catch(() => {
        window.localStorage.removeItem("mw_access_token");
        setUser(null);
      });
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}


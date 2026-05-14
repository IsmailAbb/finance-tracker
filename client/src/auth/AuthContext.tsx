import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { fetchMe } from "../services/auth";
import { readStoredToken, registerUnauthorizedHandler, setAuthToken, writeStoredToken } from "../services/api";
import type { User } from "../types";

type AuthState = {
  user: User | null;
  loading: boolean;
  setUser: (u: User | null) => void;
  signOut: () => void;
};

const Ctx = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // Ref so the 401 handler always sees the latest user, without re-registering on every change.
  const userRef = useRef<User | null>(null);
  useEffect(() => { userRef.current = user; }, [user]);

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      // Only toast if the user was actively signed in (avoids a "session expired" toast
      // on initial page load with an expired token).
      if (userRef.current) {
        toast.error("Your session has expired. Please sign in again.");
      }
      writeStoredToken(null);
      setAuthToken(null);
      setUser(null);
    });
  }, []);

  useEffect(() => {
    const token = readStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }
    setAuthToken(token);
    fetchMe()
      .then(setUser)
      .catch(() => {
        writeStoredToken(null);
        setAuthToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const signOut = () => {
    writeStoredToken(null);
    setAuthToken(null);
    setUser(null);
  };

  return <Ctx.Provider value={{ user, loading, setUser, signOut }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}

"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

interface UserProfile {
  email: string;
  firstName: string;
  lastName: string;
}

interface UserContextType {
  user: UserProfile | null;
  isSignedIn: boolean;
  signIn: (email: string, firstName?: string, lastName?: string) => void;
  signOut: () => void;
}

const STORAGE_KEY = "electric-user";

const UserContext = createContext<UserContextType>({
  user: null,
  isSignedIn: false,
  signIn: () => {},
  signOut: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [hydrated, setHydrated] = useState(false);

  /* Hydrate from localStorage */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setUser(JSON.parse(saved));
    } catch {
      /* ignore parse errors */
    }
    setHydrated(true);
  }, []);

  /* Persist to localStorage */
  useEffect(() => {
    if (!hydrated) return;
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user, hydrated]);

  const signIn = (email: string, firstName?: string, lastName?: string) => {
    setUser({
      email,
      firstName: firstName || "",
      lastName: lastName || "",
    });
  };

  const signOut = () => setUser(null);

  return (
    <UserContext.Provider value={{ user, isSignedIn: !!user, signIn, signOut }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

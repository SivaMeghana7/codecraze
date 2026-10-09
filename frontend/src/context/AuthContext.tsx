"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { UserRole } from "@/types/common";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  department: string;
  avatarId: string;
  studentId?: string;
}

export const DEMO_ACCOUNTS: Record<UserRole, AuthUser & { password: string }> = {
  student: {
    id: "std-alex-mercer-084",
    name: "Alex Mercer",
    email: "alex.mercer@campus.edu",
    password: "student@2026",
    role: "student",
    title: "B.Tech Computer Science & Engineering (3rd Year)",
    department: "Computer Science & Engineering",
    avatarId: "AM",
    studentId: "SCI-2024-CS084",
  },
  faculty: {
    id: "fac-evelyn-reed-102",
    name: "Dr. Evelyn Reed",
    email: "evelyn.reed@campus.edu",
    password: "faculty@2026",
    role: "faculty",
    title: "Associate Professor & Faculty Mentor",
    department: "Computer Science & Engineering",
    avatarId: "ER",
  },
  admin: {
    id: "adm-dean-academics-001",
    name: "Dr. Alistair Vance",
    email: "dean.academics@campus.edu",
    password: "admin@2026",
    role: "admin",
    title: "Dean of Academic Affairs & Institutional Analytics",
    department: "Office of the Dean & Planning",
    avatarId: "AV",
  },
};

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (identifier: string, password: string, fallbackRole?: UserRole) => { success: boolean; error?: string; role?: UserRole };
  quickLogin: (role: UserRole) => void;
  logout: () => void;
  isStudent: boolean;
  isFaculty: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "sci_auth_session";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Load session from localStorage on mount (defaults to student if fresh for demo convenience)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } else {
        // Default to student demo user initially
        setUser(DEMO_ACCOUNTS.student);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEMO_ACCOUNTS.student));
      }
    } catch {
      setUser(DEMO_ACCOUNTS.student);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const login = (identifier: string, password: string, fallbackRole?: UserRole) => {
    const trimmed = (identifier || "").trim().toLowerCase();
    const trimmedPass = (password || "").trim();

    // Determine target role by identifier keywords or fallback role
    let resolvedRole: UserRole | undefined = undefined;

    if (trimmed.includes("fac") || trimmed.includes("evelyn") || trimmed.includes("faculty")) {
      resolvedRole = "faculty";
    } else if (trimmed.includes("adm") || trimmed.includes("dean") || trimmed.includes("admin")) {
      resolvedRole = "admin";
    } else if (trimmed.includes("sci") || trimmed.includes("alex") || trimmed.includes("student") || trimmed.includes("cs084")) {
      resolvedRole = "student";
    } else if (fallbackRole) {
      resolvedRole = fallbackRole;
    } else {
      // Default to student if unspecified
      resolvedRole = "student";
    }

    const account = DEMO_ACCOUNTS[resolvedRole];
    setUser(account);

    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(account));
    } catch (e) {
      console.warn("Could not save session to localStorage", e);
    }

    const targetPath = resolvedRole === "admin" ? "/admin" : resolvedRole === "faculty" ? "/faculty" : "/student";
    
    // Perform instant navigation
    router.push(targetPath);
    if (typeof window !== "undefined") {
      window.location.href = targetPath;
    }

    return { success: true, role: resolvedRole };
  };

  const quickLogin = (selectedRole: UserRole) => {
    const account = DEMO_ACCOUNTS[selectedRole];
    setUser(account);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(account));
    } catch (e) {
      console.warn("Could not save session to localStorage", e);
    }

    // Role-based redirection
    if (selectedRole === "student") {
      router.push("/student");
    } else if (selectedRole === "faculty") {
      router.push("/faculty");
    } else if (selectedRole === "admin") {
      router.push("/admin");
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.warn("Could not remove session from localStorage", e);
    }
    router.push("/login");
  };

  const currentRole: UserRole = user?.role || "student";

  const value: AuthContextType = {
    user,
    role: currentRole,
    isAuthenticated: !!user,
    login,
    quickLogin,
    logout,
    isStudent: currentRole === "student",
    isFaculty: currentRole === "faculty",
    isAdmin: currentRole === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

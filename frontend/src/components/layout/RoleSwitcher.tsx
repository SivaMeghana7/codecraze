"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { GraduationCap, Users, ShieldAlert } from "lucide-react";
import { UserRole } from "@/types/common";

export const RoleSwitcher: React.FC = () => {
  const { role, quickLogin } = useAuth();

  return (
    <div className="flex items-center rounded-lg bg-slate-100 p-1 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
      <button
        type="button"
        onClick={() => quickLogin("student")}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all",
          role === "student"
            ? "bg-white text-teal-700 shadow-xs dark:bg-slate-900 dark:text-teal-400 font-bold"
            : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        )}
      >
        <GraduationCap className="h-3.5 w-3.5 text-teal-600" />
        <span>Student</span>
      </button>

      <button
        type="button"
        onClick={() => quickLogin("faculty")}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all",
          role === "faculty"
            ? "bg-white text-sky-700 shadow-xs dark:bg-slate-900 dark:text-sky-400 font-bold"
            : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        )}
      >
        <Users className="h-3.5 w-3.5 text-sky-600" />
        <span>Faculty</span>
      </button>

      <button
        type="button"
        onClick={() => quickLogin("admin")}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all",
          role === "admin"
            ? "bg-white text-indigo-700 shadow-xs dark:bg-slate-900 dark:text-indigo-400 font-bold"
            : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        )}
      >
        <ShieldAlert className="h-3.5 w-3.5 text-navy-900 dark:text-indigo-400" />
        <span>Admin</span>
      </button>
    </div>
  );
};

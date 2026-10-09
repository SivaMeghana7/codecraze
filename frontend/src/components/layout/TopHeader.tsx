"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Bell,
  Menu,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  LogOut,
  User,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TopHeaderProps {
  onToggleSidebar?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onToggleSidebar }) => {
  const { user, role, logout } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Role-Specific Notifications (Requested by User)
  const roleNotifications = {
    student: [
      {
        id: "s-1",
        title: "Attendance Deficit in CS603",
        time: "1 hour ago",
        type: "warning",
        text: "Current rate is 71.4% (below 75% cutoff). 5 consecutive attendances required.",
      },
      {
        id: "s-2",
        title: "Weekly AI Placement Interview Open",
        time: "Today",
        type: "info",
        text: "Weekly proctored slot available. Remember: 1 attempt allowed per week.",
      },
      {
        id: "s-3",
        title: "Faculty Feedback Posted by Dr. Evelyn Reed",
        time: "Yesterday",
        type: "success",
        text: "Review: 'Strong conceptual clarity in SQL; improve OS morning lecture attendance.'",
      },
    ],
    faculty: [
      {
        id: "f-1",
        title: "4 Cohort Mentees Require Attendance Nudges",
        time: "2 hours ago",
        type: "warning",
        text: "Alex Mercer (71.4%) and 3 others slipped below institutional 75% threshold.",
      },
      {
        id: "f-2",
        title: "3 Student Tests Awaiting Evaluation",
        time: "Today",
        type: "info",
        text: "CS603 Thread Synchronization & Race Prevention MCQ test submissions ready for review.",
      },
      {
        id: "f-3",
        title: "Mentorship Advisory Ledger Updated",
        time: "1 day ago",
        type: "success",
        text: "Action logged for Rohan Varma: Remedial Discrete Math schedule assigned.",
      },
    ],
    admin: [
      {
        id: "a-1",
        title: "Campus Placement Readiness Index: 82.4%",
        time: "30 mins ago",
        type: "success",
        text: "+3.2% rise following completion of weekly technical mock interviews.",
      },
      {
        id: "a-2",
        title: "Department Audit Report Ready",
        time: "2 hours ago",
        type: "info",
        text: "Computer Science & Engineering leads college benchmarks with 8.12 avg CGPA.",
      },
      {
        id: "a-3",
        title: "Institutional Dual-Risk Alert",
        time: "Yesterday",
        type: "warning",
        text: "146 students identified in Critical Dual-Risk segment. Automated advisory sent.",
      },
    ],
  };

  const notifications = roleNotifications[role as keyof typeof roleNotifications] || roleNotifications.student;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 md:px-6 backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/95">
      {/* Left: Mobile Toggle & Breadcrumb info */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex flex-col">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-900 dark:text-white">
              {user?.department || "Dept. of Computer Science & Engineering"}
            </span>
            <span>•</span>
            <span className="font-medium text-teal-700 dark:text-teal-400">
              {role === "student"
                ? "Semester 6 (Academic Year 2026-27)"
                : role === "faculty"
                ? "Faculty Mentorship & Early Warnings"
                : "Institutional Executive Scoreboard"}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Notifications, Profile Menu with Logout */}
      <div className="flex items-center gap-3">

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600" />
            </span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  Notifications & Alerts
                </span>
                <span className="text-[11px] text-teal-600 font-medium">3 unread</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-1 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="py-2.5 text-xs">
                    <div className="flex items-start gap-2">
                      {n.type === "warning" ? (
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{n.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{n.text}</p>
                        <span className="text-[10px] text-slate-400 mt-1 inline-block">{n.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 pt-2 text-center dark:border-slate-800">
                {role === "student" ? (
                  <Link
                    href="/student/recommendations"
                    onClick={() => setNotificationsOpen(false)}
                    className="text-[11px] font-medium text-teal-600 hover:underline"
                  >
                    View all recommendations →
                  </Link>
                ) : (
                  <span className="text-[11px] text-slate-400">All alerts synchronized with SIS</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Logout Menu */}
        <div className="relative">
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="h-7 w-7 rounded-full bg-navy-900 text-white flex items-center justify-center font-bold text-xs ring-1 ring-slate-200 dark:ring-slate-700">
              {user?.avatarId || "AM"}
            </div>
            <span className="hidden lg:inline text-xs font-semibold text-slate-800 dark:text-slate-200">
              {user?.name || "Alex Mercer"}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400 hidden lg:inline" />
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user?.name}
                </p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {user?.email}
                </p>
                <Badge
                  variant={role === "student" ? "emerald" : role === "faculty" ? "teal" : "outline"}
                  className="mt-1.5 text-[9px] uppercase font-bold"
                >
                  {role} Account
                </Badge>
              </div>

              <div className="py-1">
                {role === "student" && (
                  <Link
                    href="/student/profile"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span>My Student Profile</span>
                  </Link>
                )}
                {role === "faculty" && (
                  <Link
                    href="/faculty"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                    <span>Faculty Roster</span>
                  </Link>
                )}
                {role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                    <span>Admin Scoreboard</span>
                  </Link>
                )}
              </div>

              <div className="border-t border-slate-100 pt-1 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors font-medium"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

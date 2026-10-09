"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  GraduationCap,
  CalendarCheck,
  Briefcase,
  Sparkles,
  User,
  ShieldCheck,
  Layers,
  Database,
  BookOpen,
  ChevronRight,
  School,
  X,
  LogOut,
  Users,
  ShieldAlert,
  Award,
  Code2,
  MessageSquareHeart,
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  alert?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { user, role, logout } = useAuth();

  // Navigation specifically for Students (Covering all 7 Core Intelligence Sources)
  const studentNav: NavItem[] = [
    {
      title: "Unified Overview",
      href: "/student",
      icon: LayoutDashboard,
      badge: "84/100",
    },
    {
      title: "1. Academic Performance",
      href: "/student/academics",
      icon: GraduationCap,
    },
    {
      title: "2. Attendance Tracker",
      href: "/student/attendance",
      icon: CalendarCheck,
      alert: "CS603 Alert",
    },
    {
      title: "3. LMS & Coursework",
      href: "/student/lms",
      icon: BookOpen,
    },
    {
      title: "4. Engagement & Co-Curricular",
      href: "/student/engagement",
      icon: Award,
      badge: "SIH Finalist",
    },
    {
      title: "5. Placement Readiness",
      href: "/student/placement",
      icon: Briefcase,
    },
    {
      title: "6. Skills & Diagnostics",
      href: "/student/skills",
      icon: Code2,
    },
    {
      title: "7. Feedback & Mentorship",
      href: "/student/feedback",
      icon: MessageSquareHeart,
    },
    {
      title: "AI Recommendations",
      href: "/student/recommendations",
      icon: Sparkles,
      badge: "Active",
    },
    {
      title: "My Profile & Dossier",
      href: "/student/profile",
      icon: User,
    },
  ];

  // Navigation specifically for Faculty / Mentors
  const facultyNav: NavItem[] = [
    {
      title: "Faculty Mentorship Hub",
      href: "/faculty",
      icon: Users,
      badge: "Active",
    },
  ];

  // Navigation specifically for Administrators
  const adminNav: NavItem[] = [
    {
      title: "Admin Command Center",
      href: "/admin",
      icon: ShieldAlert,
      badge: "Campus",
    },
    {
      title: "Methodology & Weights",
      href: "/methodology",
      icon: BookOpen,
    },
  ];

  // Pick navigation items strictly based on authenticated role
  const activeNavigation =
    role === "student" ? studentNav : role === "faculty" ? facultyNav : adminNav;

  const roleTitle =
    role === "student"
      ? "Student Success Hub"
      : role === "faculty"
      ? "Faculty & Mentor Workstation"
      : "Administrator Command";

  const userBannerConfig = {
    student: {
      avatarBg: "bg-teal-600",
      avatarText: "AM",
      name: user?.name || "Alex Mercer",
      subtitle: `${user?.studentId || "SCI-2024-CS084"} • 3rd Yr (CS-B)`,
      badge: "Student",
      badgeColor: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
    },
    faculty: {
      avatarBg: "bg-sky-600",
      avatarText: "ER",
      name: user?.name || "Dr. Evelyn Reed",
      subtitle: "Faculty Mentor • CSE Dept",
      badge: "Faculty",
      badgeColor: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200",
    },
    admin: {
      avatarBg: "bg-navy-900",
      avatarText: "AV",
      name: user?.name || "Dr. Alistair Vance",
      subtitle: "Dean of Academic Affairs",
      badge: "Administrator",
      badgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    },
  }[role];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-900/40 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200/80 bg-white shadow-xs transition-transform duration-300 md:static md:translate-x-0 dark:border-slate-800 dark:bg-slate-900",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5 dark:border-slate-800">
          <Link href={role === "student" ? "/student" : role === "faculty" ? "/faculty" : "/admin"} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white shadow-sm shadow-teal-500/20">
              <School className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-navy-900 dark:text-white">
                SmartCampus
              </span>
              <span className="text-[10px] font-semibold text-teal-600 uppercase tracking-wider">
                {role === "student" ? "Student Intelligence" : role === "faculty" ? "Mentor Intelligence" : "Executive Analytics"}
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 md:hidden dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Authenticated User Persona Banner */}
        <div className="p-3">
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-2.5 border border-slate-200/80 dark:bg-slate-800/50 dark:border-slate-700">
            <div className={cn("h-8 w-8 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs", userBannerConfig.avatarBg)}>
              {userBannerConfig.avatarText}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <p className="text-xs font-semibold text-navy-900 dark:text-white truncate">
                  {userBannerConfig.name}
                </p>
                <span className={cn("rounded px-1.5 py-0.2 text-[9px] font-bold uppercase", userBannerConfig.badgeColor)}>
                  {userBannerConfig.badge}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                {userBannerConfig.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Role-Scoped Navigation Group */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
          <div>
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {roleTitle}
            </div>
            <nav className="space-y-1">
              {activeNavigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => onClose && onClose()}
                    className={cn(
                      "group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                      isActive
                        ? "bg-teal-600 text-white shadow-xs font-semibold"
                        : "text-slate-600 hover:bg-slate-100 hover:text-navy-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          isActive ? "text-white" : "text-slate-400 group-hover:text-teal-600"
                        )}
                      />
                      <span>{item.title}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.2 text-[10px] font-semibold",
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                    {item.alert && (
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.2 text-[10px] font-semibold",
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                        )}
                      >
                        {item.alert}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer with Authenticated Session & Logout */}
        <div className="border-t border-slate-100 p-3 space-y-2 dark:border-slate-800">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Institutional Access</span>
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Verified Session
            </span>
          </div>

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 rounded-lg py-2 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors border border-rose-200/60 dark:hover:bg-rose-950/30 dark:border-rose-900/50"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>
    </>
  );
};

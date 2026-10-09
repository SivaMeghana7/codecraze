"use client";

import React from "react";
import { StudentProfile } from "@/types/student";
import { Sparkles, Calendar, BookOpen, Award, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StudentPageHeaderProps {
  profile: StudentProfile;
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

export const StudentPageHeader: React.FC<StudentPageHeaderProps> = ({
  profile,
  title,
  description,
  children,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy-900 via-navy-800 to-teal-900 p-6 md:p-8 text-white shadow-md">
      {/* Decorative ambient backdrop */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-10 h-48 w-48 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/20 px-3 py-1 text-xs font-semibold text-teal-300 backdrop-blur-xs border border-teal-500/30">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Academic Intelligence • Fall Semester 2026</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            {title || `Good morning, ${profile.name.split(" ")[0]}!`}
          </h1>

          <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
            {description ||
              "Track your academic momentum, attendance buffers, LMS engagement velocity, and placement readiness in real time."}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-300">
            <span className="font-semibold text-white">{profile.name}</span>
            <span>•</span>
            <span className="font-mono text-teal-300">{profile.studentId}</span>
            <span>•</span>
            <span>{profile.department}</span>
            <span>•</span>
            <span className="rounded bg-white/10 px-2 py-0.5 text-[11px] font-medium text-teal-200">
              {profile.academicYear}, Sem {profile.semester} ({profile.section})
            </span>
          </div>
        </div>

        {children && <div className="flex items-center gap-3 shrink-0">{children}</div>}
      </div>
    </div>
  );
};

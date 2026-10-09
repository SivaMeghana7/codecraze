"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Video,
  Download,
} from "lucide-react";

export const StudentLmsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"modules" | "assignments" | "activity">("modules");

  const lmsStats = [
    { label: "Assignment Completion", value: "94.2%", desc: "17 of 18 Submitted", color: "text-emerald-600" },
    { label: "Weekly Login Frequency", value: "5.4 days/wk", desc: "Top 12% in CS Dept", color: "text-teal-600" },
    { label: "Lecture Video Hours", value: "38.5 hrs", desc: "Across 6 Enrolled Courses", color: "text-sky-600" },
    { label: "LMS Velocity Score", value: "88/100", desc: "+6 pts vs Sem 5", color: "text-indigo-600" },
  ];

  const courseModules = [
    {
      code: "CS601",
      title: "Advanced Database Systems",
      instructor: "Prof. Rajesh Sharma",
      progress: 88,
      modulesCompleted: 7,
      totalModules: 8,
      nextDeadline: "Query Optimizer Lab • Tomorrow, 11:59 PM",
      urgent: false,
    },
    {
      code: "CS602",
      title: "Compiler Design & Code Generation",
      instructor: "Dr. K. Swaminathan",
      progress: 75,
      modulesCompleted: 6,
      totalModules: 8,
      nextDeadline: "LR(1) Parser Implementation • Oct 14",
      urgent: false,
    },
    {
      code: "CS603",
      title: "Operating Systems & Concurrency",
      instructor: "Dr. Evelyn Reed",
      progress: 62,
      modulesCompleted: 5,
      totalModules: 8,
      nextDeadline: "Mutex & Deadlock Simulator • Due in 2 days",
      urgent: true,
    },
    {
      code: "CS604",
      title: "Computer Networks & Sockets",
      instructor: "Prof. Priya Nair",
      progress: 92,
      modulesCompleted: 8,
      totalModules: 8,
      nextDeadline: "TCP Congestion Final Report • Oct 18",
      urgent: false,
    },
  ];

  const lmsAssignments = [
    {
      id: "asg-1",
      title: "CS603: Distributed Concurrency & Mutex Hazards",
      dueDate: "Oct 12, 2026",
      status: "Pending Submission",
      points: 50,
      urgent: true,
    },
    {
      id: "asg-2",
      title: "CS601: B+ Tree Indexing & Buffer Manager Implementation",
      dueDate: "Oct 06, 2026",
      status: "Graded • 48/50",
      points: 50,
      urgent: false,
    },
    {
      id: "asg-3",
      title: "CS602: Lexical Analyzer Syntax Tree Construction",
      dueDate: "Sep 28, 2026",
      status: "Graded • 45/50",
      points: 50,
      urgent: false,
    },
    {
      id: "asg-4",
      title: "CS604: Multi-Threaded HTTP Proxy Server",
      dueDate: "Sep 20, 2026",
      status: "Graded • 50/50",
      points: 50,
      urgent: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-navy-950 via-slate-900 to-teal-950 p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-teal-300 border border-teal-500/30">
                <BookOpen className="h-3.5 w-3.5" />
                <span>Integrated Canvas & Moodle LMS Telemetry</span>
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">LMS Learning Management & Coursework</h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              Track course module progression, assignment submissions, digital reading materials, and weekly portal activity signals that feed into your Student Success Score.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {lmsStats.map((st) => (
          <Card key={st.label} className="p-4 bg-white dark:bg-slate-900 border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">{st.label}</span>
            <div className={`text-2xl font-bold mt-1 ${st.color}`}>{st.value}</div>
            <span className="text-[11px] text-slate-400">{st.desc}</span>
          </Card>
        ))}
      </div>

      {/* Main Tabs */}
      <Card className="border border-slate-200 bg-white dark:bg-slate-900">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-teal-600" />
                <span>Course Modules & Assignment Submissions</span>
              </CardTitle>
              <CardDescription>
                Synced with institutional LMS API (Canvas/Moodle)
              </CardDescription>
            </div>

            <div className="flex items-center rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab("modules")}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === "modules" ? "bg-white text-teal-700 shadow-xs dark:bg-slate-900 dark:text-teal-400" : "text-slate-600"
                }`}
              >
                Course Modules
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("assignments")}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === "assignments" ? "bg-white text-teal-700 shadow-xs dark:bg-slate-900 dark:text-teal-400" : "text-slate-600"
                }`}
              >
                Assignments ({lmsAssignments.length})
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          {activeTab === "modules" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {courseModules.map((m) => (
                <div
                  key={m.code}
                  className="p-4 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="teal" className="text-[10px] font-bold">{m.code}</Badge>
                        <span className="text-xs text-slate-500">{m.instructor}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                        {m.title}
                      </h4>
                    </div>
                    <span className="text-sm font-extrabold text-teal-600">{m.progress}%</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>{m.modulesCompleted} of {m.totalModules} Units Completed</span>
                    </div>
                    <Progress value={m.progress} className="h-1.5" />
                  </div>

                  <div className={`p-2.5 rounded-lg text-xs flex items-center justify-between ${
                    m.urgent ? "bg-rose-50 text-rose-800 border border-rose-200" : "bg-slate-50 text-slate-700 border border-slate-100"
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{m.nextDeadline}</span>
                    </div>
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-teal-700">
                      View Unit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              {lmsAssignments.map((a) => (
                <div
                  key={a.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-teal-600" />
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {a.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>Due: {a.dueDate}</span>
                      <span>•</span>
                      <span>Weight: {a.points} Pts</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={a.urgent ? "rose" : "emerald"} className="text-xs font-semibold">
                      {a.status}
                    </Badge>
                    <Button size="sm" variant="outline" className="text-xs h-8">
                      {a.urgent ? "Submit File" : "Review Graded"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/components/shared/RoleGuard";
import {
  Layers,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  UserCheck,
  Calendar,
  Sparkles,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface InterventionItem {
  id: string;
  student: string;
  studentId: string;
  title: string;
  category: "Attendance" | "Academic Remedial" | "Placement Coaching";
  status: "In Progress" | "Pending" | "Completed";
  mentor: string;
  assignedDate: string;
  scoreDelta: string;
  notes: string;
}

export default function InterventionsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [interventions, setInterventions] = useState<InterventionItem[]>([
    {
      id: "INT-801",
      student: "Alex Mercer",
      studentId: "SCI-2024-CS084",
      title: "Biometric Attendance Recovery in CS603",
      category: "Attendance",
      status: "In Progress",
      mentor: "Dr. Evelyn Reed",
      assignedDate: "Oct 02, 2026",
      scoreDelta: "+4.2% Attendance",
      notes: "Student pledged 100% attendance in morning theory sessions to clear 75% threshold.",
    },
    {
      id: "INT-802",
      student: "Rohan Varma",
      studentId: "SCI-2024-CS045",
      title: "Remedial Discrete Mathematics & Operating Systems",
      category: "Academic Remedial",
      status: "Pending",
      mentor: "Prof. K. Rao",
      assignedDate: "Oct 05, 2026",
      scoreDelta: "--",
      notes: "Awaiting student response to weekly tutorial schedule.",
    },
    {
      id: "INT-803",
      student: "Dev Patel",
      studentId: "SCI-2024-CS089",
      title: "Dynamic Programming & Algorithm Coaching",
      category: "Placement Coaching",
      status: "Completed",
      mentor: "Dr. Evelyn Reed",
      assignedDate: "Sep 20, 2026",
      scoreDelta: "+12 pts (Test II)",
      notes: "Successfully completed 15 DP drill problems on campus coding portal.",
    },
    {
      id: "INT-804",
      student: "Vikram Malhotra",
      studentId: "SCI-2024-CS119",
      title: "Academic Probation Warning Counseling",
      category: "Attendance",
      status: "In Progress",
      mentor: "Dr. Alistair Vance",
      assignedDate: "Oct 06, 2026",
      scoreDelta: "+2.0% Attendance",
      notes: "Biometric monitoring flag active for remaining 4 weeks of semester.",
    },
    {
      id: "INT-805",
      student: "Priya Sharma",
      studentId: "SCI-2024-CS012",
      title: "Senior Product Engineering Mock Interview Prep",
      category: "Placement Coaching",
      status: "Completed",
      mentor: "Dr. Evelyn Reed",
      assignedDate: "Sep 15, 2026",
      scoreDelta: "+18 pts (Mock II)",
      notes: "Cleared mock interview bar with high rating in System Design.",
    },
  ]);

  const handleAdvanceStatus = (id: string) => {
    setInterventions((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus: "In Progress" | "Completed" =
            item.status === "Pending" ? "In Progress" : "Completed";
          return {
            ...item,
            status: nextStatus,
            scoreDelta: nextStatus === "Completed" ? "+8.5 pts verified" : item.scoreDelta,
          };
        }
        return item;
      })
    );
  };

  const filtered = interventions.filter((item) => {
    const matchesFilter =
      statusFilter === "all" || item.status.toLowerCase().replace(" ", "") === statusFilter;
    const matchesSearch =
      item.student.toLowerCase().includes(search.toLowerCase()) ||
      item.studentId.toLowerCase().includes(search.toLowerCase()) ||
      item.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <RoleGuard allowedRoles={["faculty", "admin"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-r from-teal-900 via-navy-900 to-slate-900 p-6 md:p-8 text-white shadow-md">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/20 px-3 py-1 text-xs font-semibold text-teal-300 border border-teal-500/30">
              <Layers className="h-3.5 w-3.5" />
              <span>Closed-Loop Student Success Workflows</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              Closed-Loop Interventions Management
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Track student early warning triggers, assigned faculty mentors, and measurable score deltas post-intervention.
            </p>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 border-slate-200/90 shadow-sm bg-white">
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Interventions</span>
            <p className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">{interventions.length}</p>
            <span className="text-[10px] text-teal-600 font-medium">Logged Across Cohort</span>
          </Card>
          <Card className="p-4 border-slate-200/90 shadow-sm bg-white">
            <span className="text-xs text-slate-500 font-semibold uppercase">In Progress</span>
            <p className="text-2xl md:text-3xl font-bold text-sky-700 mt-1">
              {interventions.filter((i) => i.status === "In Progress").length}
            </p>
            <span className="text-[10px] text-sky-600 font-medium">Active Mentorship</span>
          </Card>
          <Card className="p-4 border-slate-200/90 shadow-sm bg-white">
            <span className="text-xs text-slate-500 font-semibold uppercase">Pending Action</span>
            <p className="text-2xl md:text-3xl font-bold text-amber-600 mt-1">
              {interventions.filter((i) => i.status === "Pending").length}
            </p>
            <span className="text-[10px] text-amber-600 font-medium">Needs Response</span>
          </Card>
          <Card className="p-4 border-slate-200/90 shadow-sm bg-white">
            <span className="text-xs text-slate-500 font-semibold uppercase">Resolved & Validated</span>
            <p className="text-2xl md:text-3xl font-bold text-emerald-600 mt-1">
              {interventions.filter((i) => i.status === "Completed").length}
            </p>
            <span className="text-[10px] text-emerald-600 font-medium">Avg +7.8 pts Improvement</span>
          </Card>
        </div>

        {/* Interventions Board */}
        <Card className="border border-slate-200/90 shadow-sm bg-white">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="h-4 w-4 text-teal-600" />
                  <span>Intervention Action Ledger</span>
                </CardTitle>
                <CardDescription>
                  Audit trail linking student early warning indicators to measurable improvement outcomes
                </CardDescription>
              </div>
            </div>

            {/* Filter controls */}
            <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search student, mentor, or intervention title..."
                  className="pl-8 text-xs h-9 w-full"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-colors font-medium ${
                    statusFilter === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All ({interventions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("inprogress")}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-colors font-medium ${
                    statusFilter === "inprogress" ? "bg-sky-600 text-white" : "bg-sky-50 text-sky-700 hover:bg-sky-100"
                  }`}
                >
                  In Progress
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("pending")}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-colors font-medium ${
                    statusFilter === "pending" ? "bg-amber-600 text-white" : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                  }`}
                >
                  Pending
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("completed")}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-colors font-medium ${
                    statusFilter === "completed" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <div key={item.id} className="p-4 hover:bg-slate-50/70 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-400 font-semibold">{item.id}</span>
                        <span className="font-bold text-slate-900 text-sm">{item.title}</span>
                        <Badge variant="outline" className="text-[10px] bg-slate-50">
                          {item.category}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>Student: <strong className="text-slate-800">{item.student}</strong> ({item.studentId})</span>
                        <span>•</span>
                        <span>Assigned Mentor: <strong className="text-slate-800">{item.mentor}</strong></span>
                        <span>•</span>
                        <span>Logged: {item.assignedDate}</span>
                      </div>

                      <p className="text-xs text-slate-500 italic mt-0.5">
                        &quot;{item.notes}&quot;
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <Badge
                          variant={
                            item.status === "Completed"
                              ? "emerald"
                              : item.status === "In Progress"
                              ? "teal"
                              : "secondary"
                          }
                          className="text-[10px] font-semibold"
                        >
                          {item.status}
                        </Badge>
                        <div className="text-xs font-mono font-bold text-emerald-600 mt-1">
                          {item.scoreDelta}
                        </div>
                      </div>

                      {item.status !== "Completed" && (
                        <Button
                          size="sm"
                          onClick={() => handleAdvanceStatus(item.id)}
                          className="text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white gap-1"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>{item.status === "Pending" ? "Start" : "Resolve"}</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No interventions found matching this filter.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}

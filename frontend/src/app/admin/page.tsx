"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/components/shared/RoleGuard";
import {
  ShieldAlert,
  BarChart3,
  Users,
  TrendingUp,
  Award,
  Layers,
  Sparkles,
  PieChart,
  Target,
  ArrowUpRight,
  Database,
  Building,
  Search,
  IdCard,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { StudentSegmentationCard } from "@/components/student/StudentSegmentationCard";

export default function AdminPage() {
  const [lookupRegNo, setLookupRegNo] = React.useState("SCI-2024-CS084");
  const [searchedStudent, setSearchedStudent] = React.useState<any>({
    id: "SCI-2024-CS084",
    name: "Alex Mercer",
    department: "Computer Science & Engineering",
    cgpa: 8.14,
    attendance: 79.2,
    placementScore: 78,
    acadRisk: "Low",
    placeRisk: "Low",
    persona: "Unpolished Gem",
    notes: "Operating Systems (CS603) attendance deficit flagged. Excellent DSA performance.",
  });

  const studentsDatabase = [
    {
      id: "SCI-2024-CS084",
      name: "Alex Mercer",
      department: "Computer Science & Engineering",
      cgpa: 8.14,
      attendance: 79.2,
      placementScore: 78,
      acadRisk: "Low",
      placeRisk: "Low",
      persona: "Unpolished Gem",
      notes: "Operating Systems (CS603) attendance deficit flagged. Excellent DSA performance.",
    },
    {
      id: "SCI-2024-CS012",
      name: "Priya Sharma",
      department: "Computer Science & Engineering",
      cgpa: 9.20,
      attendance: 94.0,
      placementScore: 92,
      acadRisk: "Low",
      placeRisk: "Low",
      persona: "Consistent Achiever",
      notes: "Top 5% in cohort. Completed AWS certification. Ready for Tier-1 placements.",
    },
    {
      id: "SCI-2024-CS045",
      name: "Rohan Varma",
      department: "Computer Science & Engineering",
      cgpa: 6.45,
      attendance: 68.5,
      placementScore: 54,
      acadRisk: "High",
      placeRisk: "High",
      persona: "Disengaged",
      notes: "Missed 6 consecutive operating systems lectures. Academic probation flag.",
    },
  ];

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const query = lookupRegNo.trim().toLowerCase();
    const found = studentsDatabase.find((s) => s.id.toLowerCase() === query || s.name.toLowerCase().includes(query));
    if (found) {
      setSearchedStudent(found);
    } else {
      alert(`No student found for "${lookupRegNo}". Try SCI-2024-CS084, SCI-2024-CS012, or SCI-2024-CS045.`);
    }
  };
  const departments = [
    { name: "Computer Science & Engineering", head: "Dr. K. Raghavan", students: 480, cgpa: 8.12, att: "83.1%", placed: "84%", status: "Top Performing" },
    { name: "Information Technology", head: "Dr. M. Sridhar", students: 360, cgpa: 7.91, att: "84.0%", placed: "81%", status: "Top Performing" },
    { name: "Electronics & Communication", head: "Dr. A. Banerjee", students: 320, cgpa: 7.74, att: "81.5%", placed: "76%", status: "On Track" },
    { name: "Mechanical Engineering", head: "Prof. P. Sharma", students: 260, cgpa: 7.42, att: "80.2%", placed: "71%", status: "Focus Needed" },
  ];

  const funnelStages = [
    { stage: "Campus Placement Eligible", count: 1240, pct: 100 },
    { stage: "Passed Diagnostic Aptitude", count: 980, pct: 79 },
    { stage: "Cleared Technical Coding Benchmark", count: 810, pct: 65 },
    { stage: "Cleared Senior Panel Mock Interview", count: 690, pct: 55 },
    { stage: "Confirmed Offer Received", count: 540, pct: 43 },
  ];

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="space-y-6">
        {/* Admin Executive Header */}
        <div className="rounded-2xl bg-gradient-to-r from-navy-900 via-navy-800 to-slate-900 p-6 md:p-8 text-white shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/30">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Office of the Dean • Academic Affairs Executive Scoreboard</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              Institutional Intelligence Command Center
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Campus-wide academic metrics, multi-department comparison heatmaps, placement funnel trajectories, and resource allocation.
            </p>
          </div>
        </div>

        {/* Executive KPI Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 border-slate-200/90 shadow-sm bg-white">
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Enrollment</span>
            <p className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">1,420</p>
            <span className="text-[10px] text-emerald-600 font-medium">Across 4 Engineering Schools</span>
          </Card>
          <Card className="p-4 border-slate-200/90 shadow-sm bg-white">
            <span className="text-xs text-slate-500 font-semibold uppercase">Institutional CGPA</span>
            <p className="text-2xl md:text-3xl font-bold text-teal-700 mt-1">7.82</p>
            <span className="text-[10px] text-emerald-600 font-medium">+0.08 vs 2025 Cohort Average</span>
          </Card>
          <Card className="p-4 border-slate-200/90 shadow-sm bg-white">
            <span className="text-xs text-slate-500 font-semibold uppercase">Overall Attendance</span>
            <p className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">82.4%</p>
            <span className="text-[10px] text-emerald-600 font-medium">&gt;75% Institutional Compliance</span>
          </Card>
          <Card className="p-4 border-slate-200/90 shadow-sm bg-white">
            <span className="text-xs text-slate-500 font-semibold uppercase">Placement Forecast</span>
            <p className="text-2xl md:text-3xl font-bold text-indigo-700 mt-1">78.5%</p>
            <span className="text-[10px] text-indigo-600 font-medium">Batch 2026-27 ML Projection</span>
          </Card>
        </div>

        {/* Student 360 Individual Record Lookup */}
        <Card className="border border-slate-200 shadow-sm bg-white p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <IdCard className="h-4 w-4 text-teal-600" />
                <span>Executive Student 360° Dossier Lookup</span>
              </h3>
              <p className="text-xs text-slate-500">Search institutional records by student registration number or name</p>
            </div>

            <form onSubmit={handleLookup} className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  value={lookupRegNo}
                  onChange={(e) => setLookupRegNo(e.target.value)}
                  placeholder="e.g. SCI-2024-CS084..."
                  className="pl-8 text-xs h-9"
                />
              </div>
              <Button type="submit" size="sm" className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-9">
                Lookup
              </Button>
            </form>
          </div>

          {searchedStudent && (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{searchedStudent.name}</span>
                  <Badge variant="outline" className="font-mono text-xs">{searchedStudent.id}</Badge>
                  <Badge variant="teal" className="text-[10px]">{searchedStudent.persona}</Badge>
                </div>
                <p className="text-xs text-slate-500">
                  {searchedStudent.department} • CGPA: <strong className="text-slate-800">{searchedStudent.cgpa}</strong> • Attendance: <strong className={searchedStudent.attendance < 75 ? "text-rose-600" : "text-emerald-700"}>{searchedStudent.attendance}%</strong> • Placement: <strong className="text-indigo-700">{searchedStudent.placementScore}/100</strong>
                </p>
                <p className="text-xs text-slate-500 italic mt-0.5">
                  &quot;{searchedStudent.notes}&quot;
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={searchedStudent.acadRisk === "High" ? "rose" : "emerald"} className="text-xs">
                  Acad: {searchedStudent.acadRisk}
                </Badge>
                <Badge variant={searchedStudent.placeRisk === "High" ? "rose" : "teal"} className="text-xs">
                  Placement: {searchedStudent.placeRisk}
                </Badge>
              </div>
            </div>
          )}
        </Card>

        {/* Bonus Feature: Institutional Student Segmentation Pie Chart Engine */}
        <StudentSegmentationCard />

        {/* Department Comparison Scoreboard */}
        <Card className="border border-slate-200/90 shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Building className="h-4 w-4 text-teal-600" />
                <span>Department Comparison Heatmap & Performance Scoreboard</span>
              </CardTitle>
              <CardDescription>Multi-criteria benchmarking across student enrollment, CGPA, and placement index</CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-semibold">
              Fall 2026 Audit
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {departments.map((dept) => (
              <div
                key={dept.name}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{dept.name}</h4>
                  <p className="text-slate-500 mt-0.5">
                    HOD: <strong className="text-slate-700">{dept.head}</strong> • Enrollment: <strong>{dept.students} students</strong>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Avg CGPA</span>
                    <span className="font-bold text-teal-700">{dept.cgpa}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Attendance</span>
                    <span className="font-bold text-slate-800">{dept.att}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Placed Rate</span>
                    <span className="font-bold text-indigo-700">{dept.placed}</span>
                  </div>
                  <Badge
                    variant={dept.status === "Top Performing" ? "emerald" : dept.status === "On Track" ? "teal" : "amber"}
                    className="text-[10px]"
                  >
                    {dept.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Placement Pipeline Funnel */}
        <Card className="border border-slate-200/90 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-teal-600" />
              <span>Campus Recruitment Funnel & Candidate Conversion</span>
            </CardTitle>
            <CardDescription>
              Progression from institutional eligibility through coding assessments to final corporate offers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {funnelStages.map((stg) => (
              <div key={stg.stage} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-800">{stg.stage}</span>
                  <span className="text-teal-700 font-bold">{stg.count} Students ({stg.pct}%)</span>
                </div>
                <Progress value={stg.pct} indicatorClassName="bg-teal-600" className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}

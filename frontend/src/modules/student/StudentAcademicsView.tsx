"use client";

import React, { useState } from "react";
import { mockAcademicData, mockStudentProfile } from "@/lib/mockData";
import { StudentPageHeader } from "@/components/student/StudentPageHeader";
import { AcademicTrendChart } from "@/components/student/AcademicTrendChart";
import { SubjectPerformanceChart } from "@/components/student/SubjectPerformanceChart";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  GraduationCap,
  Award,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Filter,
  BookOpen,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export const StudentAcademicsView: React.FC = () => {
  const [selectedSemester, setSelectedSemester] = useState<string>("Sem 6");

  const academic = mockAcademicData;

  // Filter trends based on selectedSemester
  const filteredTrends =
    selectedSemester === "All"
      ? academic.trends
      : academic.trends.filter((t) => t.semester <= selectedSemester);

  // Subject marks
  const displayedSubjects = academic.currentSubjects;

  // Correlation data: Attendance % vs Total Marks (100)
  const attendanceVsMarksData = displayedSubjects.map((s) => ({
    name: s.code,
    fullName: s.name,
    attendance: s.attendancePercentage,
    marks: s.totalMarks,
    grade: s.grade,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <StudentPageHeader
        profile={mockStudentProfile}
        title="Academic Performance & Course Ledger"
        description="Detailed grade analytics, credit accumulation, backlog audits, and marks-attendance correlation."
      >
        {/* Semester Filter Selector */}
        <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-lg border border-white/20">
          <Filter className="h-4 w-4 text-teal-300 ml-1" />
          <span className="text-xs text-slate-200">Filter:</span>
          {["Sem 4", "Sem 5", "Sem 6", "All"].map((sem) => (
            <button
              key={sem}
              onClick={() => setSelectedSemester(sem)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                selectedSemester === sem
                  ? "bg-teal-600 text-white shadow-xs"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              {sem}
            </button>
          ))}
        </div>
      </StudentPageHeader>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-slate-200/90 shadow-sm bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Cumulative CGPA</span>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
              <GraduationCap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-teal-700 dark:text-teal-400">
              {academic.currentCgpa}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ 10.0</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>+0.12 vs Sem 5 ({academic.previousSemesterCgpa})</span>
          </p>
        </Card>

        <Card className="p-4 border-slate-200/90 shadow-sm bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Current SGPA</span>
            <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">
              {academic.currentSemesterGpa}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ 10.0</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 font-medium">
            Semester 6 internal evaluation
          </p>
        </Card>

        <Card className="p-4 border-slate-200/90 shadow-sm bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Credits</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">
              {academic.totalCreditsEarned}
            </span>
            <span className="text-xs text-slate-400 font-medium">Credits</span>
          </div>
          <p className="mt-1 text-[11px] text-teal-600 font-medium">
            Degree Target: 160 Credits
          </p>
        </Card>

        <Card className="p-4 border-slate-200/90 shadow-sm bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Active Backlogs</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-emerald-600">
              {academic.activeBacklogs}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-600 font-medium">
            Zero Backlogs (Eligible for all campus drives)
          </p>
        </Card>
      </div>

      {/* Strongest vs Weakest Subject Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border border-emerald-200/80 bg-emerald-50/30 p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Strongest Subject Areas
              </span>
              <ul className="mt-2 space-y-1 text-xs text-slate-700">
                {academic.strongestSubjects.map((sub) => (
                  <li key={sub} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-slate-800">{sub}</span>
                    <Badge variant="emerald" className="text-[10px]">Grade A+</Badge>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
                Strong conceptual mastery in cloud design and relational storage architectures.
              </p>
            </div>
          </div>
        </Card>

        <Card className="border border-amber-200/80 bg-amber-50/30 p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Subjects Requiring Focus
              </span>
              <ul className="mt-2 space-y-1 text-xs text-slate-700">
                {academic.weakestSubjects.map((sub) => (
                  <li key={sub} className="flex items-center gap-2">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    <span className="font-semibold text-slate-800">{sub}</span>
                    <Badge variant="amber" className="text-[10px]">Grade B</Badge>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
                Distributed Systems requires additional lab drills on consensus protocols before finals.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Charts: Trends & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AcademicTrendChart data={filteredTrends} />
        <SubjectPerformanceChart subjects={displayedSubjects} />
      </div>

      {/* Marks vs Attendance Correlation Chart */}
      <Card className="border border-slate-200/90 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-teal-600" />
                <span>Attendance vs Marks Correlation Analysis</span>
              </CardTitle>
              <CardDescription>
                Empirical relationship between lecture attendance percentage and total subject score
              </CardDescription>
            </div>
            <span className="text-xs text-teal-700 font-semibold bg-teal-50 px-2.5 py-1 rounded-full">
              Positive Correlation (r = 0.84)
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[260px] w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 30, bottom: 10, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  dataKey="attendance"
                  name="Attendance %"
                  unit="%"
                  domain={[65, 95]}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  label={{ value: "Attendance Rate (%)", position: "insideBottom", offset: -5, fontSize: 11 }}
                />
                <YAxis
                  type="number"
                  dataKey="marks"
                  name="Total Marks"
                  unit=" marks"
                  domain={[50, 100]}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  label={{ value: "Marks Scored (out of 100)", angle: -90, position: "insideLeft", fontSize: 11 }}
                />
                <ZAxis range={[100, 100]} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-md text-xs dark:bg-slate-900 dark:border-slate-800">
                          <p className="font-bold text-slate-900 dark:text-white">
                            {data.name}: {data.fullName}
                          </p>
                          <p className="text-teal-700 font-semibold mt-1">
                            Marks: {data.marks}/100 (Grade {data.grade})
                          </p>
                          <p className="text-slate-600">
                            Attendance: {data.attendance}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Subjects" data={attendanceVsMarksData} fill="#0d9488" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">
            Higher attendance strongly correlates with higher internal exam and assignment scores.
          </p>
        </CardContent>
      </Card>

      {/* Comprehensive Course Ledger Table */}
      <Card className="border border-slate-200/90 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-teal-600" />
            <span>Semester 6 Enrolled Subjects & Grading Breakdown</span>
          </CardTitle>
          <CardDescription>
            Detailed scores across Internals, Midterm examinations, and Attendance compliance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Code</TableHead>
                <TableHead>Subject Name</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Midterms (50)</TableHead>
                <TableHead>Internals (30)</TableHead>
                <TableHead>Lab/Proj (20)</TableHead>
                <TableHead>Total (100)</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Attendance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedSubjects.map((sub) => (
                <TableRow key={sub.code}>
                  <TableCell className="font-mono text-xs font-bold text-teal-700">
                    {sub.code}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900 dark:text-white">
                    {sub.name}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">{sub.instructor}</TableCell>
                  <TableCell className="text-xs">{sub.credits}</TableCell>
                  <TableCell className="text-xs font-semibold">{sub.midtermMarks}</TableCell>
                  <TableCell className="text-xs font-semibold">{sub.internalMarks}</TableCell>
                  <TableCell className="text-xs font-semibold">{sub.assignmentMarks}</TableCell>
                  <TableCell className="text-xs font-bold text-slate-900 dark:text-white">
                    {sub.totalMarks}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        sub.grade.startsWith("A")
                          ? "emerald"
                          : sub.grade.startsWith("B")
                          ? "teal"
                          : "secondary"
                      }
                      className="text-xs font-bold"
                    >
                      {sub.grade}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-xs font-semibold ${
                        sub.attendancePercentage < 75 ? "text-rose-600" : "text-emerald-600"
                      }`}
                    >
                      {sub.attendancePercentage}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

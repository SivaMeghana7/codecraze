"use client";

import React, { useState } from "react";
import { mockAttendanceData, mockStudentProfile } from "@/lib/mockData";
import { StudentPageHeader } from "@/components/student/StudentPageHeader";
import { AttendanceChart } from "@/components/student/AttendanceChart";
import { AttendanceMarginMeter } from "@/components/student/AttendanceMarginMeter";
import { LmsActivityChart } from "@/components/student/LmsActivityChart";
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
  CalendarCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Laptop,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  FileText,
} from "lucide-react";
import Link from "next/link";

export const StudentAttendanceView: React.FC = () => {
  const attendance = mockAttendanceData;
  const lms = attendance.lms;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <StudentPageHeader
        profile={mockStudentProfile}
        title="Attendance & Learning Engagement Analytics"
        description="Biometric session attendance logs, safe margin buffers, and LMS Canvas learning consistency metrics."
      />

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-slate-200/90 shadow-sm bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Overall Attendance</span>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
              <CalendarCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-teal-700 dark:text-teal-400">
              {attendance.overallPercentage}%
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            {attendance.totalClassesAttended} of {attendance.totalClassesConducted} conducted classes
          </p>
        </Card>

        <Card className="p-4 border-slate-200/90 shadow-sm bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Safe Margin Buffer</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-emerald-600">
              +{attendance.marginDaysBeforeCritical}
            </span>
            <span className="text-xs text-slate-400 font-medium">Classes</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-600 font-medium">
            Can miss before dropping under 75%
          </p>
        </Card>

        <Card className="p-4 border-slate-200/90 shadow-sm bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">LMS Weekly Hours</span>
            <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
              <Laptop className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">
              {lms.weeklyHoursSpent}
            </span>
            <span className="text-xs text-slate-400 font-medium">hrs/wk</span>
          </div>
          <p className="mt-1 text-[11px] text-teal-600 font-medium">
            Active {lms.loginFrequencyDaysPerWeek} days / week
          </p>
        </Card>

        <Card className="p-4 border-slate-200/90 shadow-sm bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Pending Tasks</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-amber-600">
              {lms.pendingAssignmentsCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">Assignments</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 font-medium">
            Completion Rate: {lms.assignmentCompletionRate}%
          </p>
        </Card>
      </div>

      {/* Attendance Margin Buffer Calculator */}
      <AttendanceMarginMeter attendance={attendance} />

      {/* Attendance Chart */}
      <AttendanceChart
        subjects={attendance.subjects}
        threshold={attendance.configuredThreshold}
      />

      {/* Detailed Subject Attendance Ledger */}
      <Card className="border border-slate-200/90 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-teal-600" />
            <span>Subject Attendance Ledger & Recovery Actions</span>
          </CardTitle>
          <CardDescription>
            Official institutional biometric records and recovery recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Code</TableHead>
                <TableHead>Subject Name</TableHead>
                <TableHead>Attended</TableHead>
                <TableHead>Conducted</TableHead>
                <TableHead>Attendance %</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Buffer / Deficit</TableHead>
                <TableHead>Required Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendance.subjects.map((sub) => (
                <TableRow key={sub.code}>
                  <TableCell className="font-mono text-xs font-bold text-teal-700">
                    {sub.code}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900 dark:text-white">
                    {sub.name}
                  </TableCell>
                  <TableCell className="text-xs font-medium">{sub.attended}</TableCell>
                  <TableCell className="text-xs font-medium">{sub.conducted}</TableCell>
                  <TableCell className="text-xs font-bold">
                    <span
                      className={
                        sub.percentage < 75
                          ? "text-rose-600"
                          : sub.percentage < 80
                          ? "text-amber-600"
                          : "text-emerald-600"
                      }
                    >
                      {sub.percentage}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        sub.status === "Critical"
                          ? "rose"
                          : sub.status === "Warning"
                          ? "amber"
                          : "emerald"
                      }
                      className="text-[10px]"
                    >
                      {sub.status === "Critical" ? "Low Alert" : sub.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {sub.missableClassesCount < 0 ? (
                      <span className="font-bold text-rose-600">
                        {sub.missableClassesCount} (Deficit)
                      </span>
                    ) : (
                      <span className="font-bold text-emerald-600">
                        +{sub.missableClassesCount} (Buffer)
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 dark:text-slate-300 max-w-xs">
                    {sub.recommendation}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* LMS Canvas Activity & Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LmsActivityChart lms={lms} />

        <Card className="border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-teal-600" />
              <span>Recent LMS Canvas Activity & Assignments</span>
            </CardTitle>
            <CardDescription>
              Submission timeline across lab assignments and quizzes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {lms.recentActivities.map((act) => (
              <div
                key={act.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200/80 bg-slate-50/50 dark:bg-slate-900/40 dark:border-slate-800"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {act.title}
                    </span>
                    <Badge
                      variant={act.status === "Completed" ? "emerald" : "amber"}
                      className="text-[9px]"
                    >
                      {act.status}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {act.course} • Due {act.dueDate}
                  </p>
                </div>
                {act.score ? (
                  <span className="text-xs font-bold text-teal-700 dark:text-teal-400">
                    {act.score}
                  </span>
                ) : (
                  <Button size="sm" variant="outline" className="h-7 text-xs text-teal-700">
                    Submit
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

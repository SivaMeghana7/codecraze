"use client";

import React from "react";
import { AttendanceAnalyticsData } from "@/types/student";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ShieldCheck, AlertTriangle, AlertCircle, Calendar, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface AttendanceMarginMeterProps {
  attendance: AttendanceAnalyticsData;
}

export const AttendanceMarginMeter: React.FC<AttendanceMarginMeterProps> = ({ attendance }) => {
  const { overallPercentage, configuredThreshold, marginDaysBeforeCritical, totalClassesAttended, totalClassesConducted, subjects } = attendance;

  const criticalSubject = subjects.find((s) => s.status === "Critical" || s.percentage < configuredThreshold);
  const warningSubject = subjects.find((s) => s.status === "Warning");

  return (
    <Card className="border border-slate-200/90 shadow-sm overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-teal-50 to-slate-50 dark:from-teal-950/20 dark:to-slate-900 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400">
                Attendance Margin & Safe Buffer Calculator
              </span>
              <Badge variant="emerald" className="text-[10px]">
                Target: {configuredThreshold}%
              </Badge>
            </div>
            <CardTitle className="text-lg mt-1 font-bold text-slate-900 dark:text-white">
              Overall Rate: {overallPercentage}% ({totalClassesAttended}/{totalClassesConducted} Attended)
            </CardTitle>
          </div>

          <div className="rounded-xl bg-white p-3 shadow-xs dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 flex items-center gap-3">
            <div className="rounded-lg bg-teal-50 p-2 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Safe Margin Buffer</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {marginDaysBeforeCritical} Sessions Missable
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {/* Progress with threshold marker */}
        <div>
          <div className="flex justify-between text-xs mb-1.5 font-medium">
            <span className="text-slate-600 dark:text-slate-400">Current Attendance Progress</span>
            <span className="text-teal-700 dark:text-teal-400 font-bold">{overallPercentage}%</span>
          </div>
          <div className="relative">
            <Progress
              value={overallPercentage}
              indicatorClassName={overallPercentage >= configuredThreshold ? "bg-teal-600" : "bg-rose-500"}
              className="h-2.5"
            />
            {/* 75% mark line */}
            <div
              className="absolute -top-1 bottom-0 w-0.5 bg-rose-500 z-10"
              style={{ left: `${configuredThreshold}%` }}
              title={`Minimum Threshold: ${configuredThreshold}%`}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 mt-1">
            <span>0%</span>
            <span className="text-rose-500 font-medium">Threshold: {configuredThreshold}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Actionable Insights based on subjects */}
        {criticalSubject && (
          <div className="rounded-xl bg-rose-50/70 p-3.5 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-900 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-900 dark:text-rose-200">
                  Deficit Alert: {criticalSubject.code} {criticalSubject.name}
                </span>
                <Badge variant="rose" className="text-[10px]">
                  {criticalSubject.percentage}% Current
                </Badge>
              </div>
              <p className="text-rose-800 dark:text-rose-300">
                You have attended {criticalSubject.attended} out of {criticalSubject.conducted} classes.
                To reach {configuredThreshold}%, you must attend the next <strong>{Math.abs(criticalSubject.missableClassesCount)} consecutive lectures</strong> without absence.
              </p>
              <div className="pt-1">
                <Link
                  href="/student/attendance"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-400 hover:underline"
                >
                  View full attendance ledger & timetable →
                </Link>
              </div>
            </div>
          </div>
        )}

        {warningSubject && (
          <div className="rounded-xl bg-amber-50/70 p-3.5 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-900 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900 dark:text-amber-200">
                  Borderline Warning: {warningSubject.code} {warningSubject.name}
                </span>
                <Badge variant="amber" className="text-[10px]">
                  {warningSubject.percentage}%
                </Badge>
              </div>
              <p className="text-amber-800 dark:text-amber-300">
                You cannot miss any upcoming session in this subject without dropping beneath the 75% threshold.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

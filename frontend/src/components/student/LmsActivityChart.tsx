"use client";

import React from "react";
import { LmsActivityData } from "@/types/student";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Laptop, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LmsActivityChartProps {
  lms: LmsActivityData;
}

export const LmsActivityChart: React.FC<LmsActivityChartProps> = ({ lms }) => {
  return (
    <Card className="border border-slate-200/90 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Laptop className="h-4 w-4 text-teal-600" />
              <span>LMS Canvas Engagement Velocity</span>
            </CardTitle>
            <CardDescription>
              Daily active study hours and lecture module completion
            </CardDescription>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Weekly Total: <strong className="text-teal-700 dark:text-teal-400">{lms.weeklyHoursSpent} hrs</strong>
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Active: <strong className="text-teal-700 dark:text-teal-400">{lms.loginFrequencyDaysPerWeek} days/wk</strong>
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[220px] w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={lms.dailyLogins} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: "#64748b" }}
                tickLine={false}
                axisLine={{ stroke: "#cbd5e1" }}
              />
              <YAxis
                domain={[0, 4]}
                tick={{ fontSize: 12, fill: "#64748b" }}
                tickLine={false}
                axisLine={{ stroke: "#cbd5e1" }}
                unit="h"
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-md text-xs dark:bg-slate-900 dark:border-slate-800">
                        <p className="font-semibold text-slate-900 dark:text-white">{label}</p>
                        <p className="text-teal-700 dark:text-teal-400 font-bold">
                          Study Time: {data.hours} hours
                        </p>
                        <p className="text-slate-500">
                          Modules Finished: {data.modulesCompleted}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="hours" name="Hours Active" fill="#0d9488" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Summary Strip */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="rounded-lg bg-slate-50 p-2 text-center dark:bg-slate-800/50">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Completion</span>
            <p className="text-sm font-bold text-teal-700 dark:text-teal-400">{lms.assignmentCompletionRate}%</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-2 text-center dark:bg-slate-800/50">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Pending</span>
            <p className="text-sm font-bold text-amber-600">{lms.pendingAssignmentsCount} Tasks</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-2 text-center dark:bg-slate-800/50">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">On-Time Submissions</span>
            <p className="text-sm font-bold text-emerald-600">{lms.submittedOnTimeCount}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-2 text-center dark:bg-slate-800/50">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Late Submissions</span>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{lms.lateSubmissionsCount}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

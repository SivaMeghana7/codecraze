"use client";

import React from "react";
import { SemesterTrend } from "@/types/student";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { TrendingUp } from "lucide-react";

interface AcademicTrendChartProps {
  data: SemesterTrend[];
}

export const AcademicTrendChart: React.FC<AcademicTrendChartProps> = ({ data }) => {
  return (
    <Card className="border border-slate-200/90 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-teal-600" />
              <span>Semester-Wise CGPA & GPA Trajectory</span>
            </CardTitle>
            <CardDescription>
              Progression across Semesters 1 to 6 compared with Cohort Average
            </CardDescription>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Current CGPA</span>
            <p className="text-lg font-bold text-teal-700 dark:text-teal-400">
              {data[data.length - 1]?.cgpa.toFixed(2)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="semester"
                tick={{ fontSize: 12, fill: "#64748b" }}
                tickLine={false}
                axisLine={{ stroke: "#cbd5e1" }}
              />
              <YAxis
                domain={[6.5, 10]}
                tick={{ fontSize: 12, fill: "#64748b" }}
                tickLine={false}
                axisLine={{ stroke: "#cbd5e1" }}
                ticks={[7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0]}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-md text-xs dark:bg-slate-900 dark:border-slate-800">
                        <p className="font-semibold text-slate-900 dark:text-white mb-1.5">{label}</p>
                        {payload.map((entry, index) => (
                          <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
                            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                              {entry.name}:
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {Number(entry.value).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                iconType="circle"
              />
              <Line
                type="monotone"
                dataKey="cgpa"
                name="Cumulative CGPA"
                stroke="#0d9488"
                strokeWidth={3}
                dot={{ r: 4, fill: "#0d9488", strokeWidth: 2, stroke: "#ffffff" }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="gpa"
                name="Semester GPA"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: "#3b82f6" }}
              />
              <Line
                type="monotone"
                dataKey="classAvg"
                name="Cohort Average"
                stroke="#94a3b8"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

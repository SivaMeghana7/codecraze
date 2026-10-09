"use client";

import React from "react";
import { SubjectAttendance } from "@/types/student";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
} from "recharts";
import { CalendarCheck, AlertTriangle } from "lucide-react";

interface AttendanceChartProps {
  subjects: SubjectAttendance[];
  threshold?: number;
}

export const AttendanceChart: React.FC<AttendanceChartProps> = ({
  subjects,
  threshold = 75,
}) => {
  const chartData = subjects.map((s) => ({
    name: s.code,
    fullName: s.name,
    percentage: s.percentage,
    attended: s.attended,
    conducted: s.conducted,
    status: s.status,
    missableClassesCount: s.missableClassesCount,
  }));

  return (
    <Card className="border border-slate-200/90 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-teal-600" />
              <span>Subject-Wise Attendance vs Institutional Target</span>
            </CardTitle>
            <CardDescription>
              Mandatory minimum threshold: {threshold}% (Classes below target highlighted in amber/rose)
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 font-semibold text-rose-600">
              <span className="h-2 w-2 rounded-full bg-rose-500" /> &lt;{threshold}% Alert
            </span>
            <span className="flex items-center gap-1 font-semibold text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-teal-600" /> Safe Buffer
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#64748b" }}
                tickLine={false}
                axisLine={{ stroke: "#cbd5e1" }}
              />
              <YAxis
                domain={[50, 100]}
                tick={{ fontSize: 12, fill: "#64748b" }}
                tickLine={false}
                axisLine={{ stroke: "#cbd5e1" }}
                unit="%"
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const item = chartData.find((c) => c.name === label);
                    return (
                      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-md text-xs dark:bg-slate-900 dark:border-slate-800">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {label}: {item?.fullName}
                        </p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white my-1">
                          Attendance: {item?.percentage}% ({item?.attended}/{item?.conducted} sessions)
                        </p>
                        {item && item.percentage < threshold ? (
                          <p className="text-rose-600 font-semibold flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Deficit: Attend next {Math.abs(item.missableClassesCount)} classes to recover to {threshold}%
                          </p>
                        ) : (
                          <p className="text-emerald-600 font-semibold">
                            Buffer: Can miss {item?.missableClassesCount} more sessions safely
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                y={threshold}
                stroke="#f43f5e"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{
                  value: `Target (${threshold}%)`,
                  fill: "#f43f5e",
                  fontSize: 11,
                  position: "insideTopRight",
                }}
              />
              <Bar dataKey="percentage" name="Attendance %" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.percentage < threshold ? "#f43f5e" : "#0d9488"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

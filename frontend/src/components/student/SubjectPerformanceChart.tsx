"use client";

import React from "react";
import { SubjectMark } from "@/types/student";
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
} from "recharts";
import { BookOpen } from "lucide-react";

interface SubjectPerformanceChartProps {
  subjects: SubjectMark[];
}

export const SubjectPerformanceChart: React.FC<SubjectPerformanceChartProps> = ({ subjects }) => {
  const chartData = subjects.map((s) => ({
    name: s.code,
    fullName: s.name,
    Internal: s.internalMarks,
    Midterm: s.midtermMarks,
    Assignment: s.assignmentMarks,
    Total: s.totalMarks,
    grade: s.grade,
  }));

  return (
    <Card className="border border-slate-200/90 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-teal-600" />
              <span>Current Semester Subject Marks & Distribution</span>
            </CardTitle>
            <CardDescription>
              Detailed breakdown across Internals (30), Midterms (50), and Assignments (20)
            </CardDescription>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-300">
            Total Max: 100
          </span>
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
                domain={[0, 100]}
                tick={{ fontSize: 12, fill: "#64748b" }}
                tickLine={false}
                axisLine={{ stroke: "#cbd5e1" }}
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
                        <p className="text-teal-700 dark:text-teal-400 font-bold mb-1.5">
                          Grade: {item?.grade} • Total: {item?.Total}/100
                        </p>
                        {payload.map((entry, index) => (
                          <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
                            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                              {entry.name}:
                            </span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {entry.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} iconType="circle" />
              <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "Pass (40)", fill: "#ef4444", fontSize: 10, position: "insideTopLeft" }} />
              <Bar dataKey="Midterm" name="Midterm Exam" fill="#0d9488" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Internal" name="Internal Assessment" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Assignment" name="Lab / Assignments" fill="#a78bfa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

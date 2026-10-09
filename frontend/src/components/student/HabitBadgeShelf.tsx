"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Flame, Award, Zap, BookCheck, ShieldAlert, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const HabitBadgeShelf: React.FC = () => {
  const habits = [
    {
      id: "h-1",
      title: "14-Day Attendance Streak",
      subtitle: "Zero unexcused absences",
      icon: Flame,
      color: "bg-amber-50 text-amber-600 border-amber-200",
      status: "Active (Day 11)",
    },
    {
      id: "h-2",
      title: "LMS Weekly Explorer",
      subtitle: "14+ hours study logged",
      icon: Zap,
      color: "bg-teal-50 text-teal-600 border-teal-200",
      status: "Achieved",
    },
    {
      id: "h-3",
      title: "Assignment Sprint Star",
      subtitle: "100% on-time lab submissions",
      icon: BookCheck,
      color: "bg-sky-50 text-sky-600 border-sky-200",
      status: "Achieved",
    },
    {
      id: "h-4",
      title: "Competitive Coder",
      subtitle: "Solved 50+ DSA problems",
      icon: Star,
      color: "bg-purple-50 text-purple-600 border-purple-200",
      status: "In Progress (42/50)",
    },
  ];

  return (
    <Card className="border border-slate-200/90 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-4 w-4 text-teal-600" />
              <span>Learning Consistency & Achievement Badges</span>
            </CardTitle>
            <CardDescription>
              Gamified habits that drive academic momentum and placement readiness
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {habits.map((habit) => {
            const Icon = habit.icon;
            return (
              <div
                key={habit.id}
                className="flex flex-col items-center text-center p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all dark:bg-slate-900/40 dark:border-slate-800"
              >
                <div className={`p-2.5 rounded-xl border ${habit.color} mb-2`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {habit.title}
                </h5>
                <p className="text-[10px] text-slate-400 mt-0.5">{habit.subtitle}</p>
                <Badge variant="outline" className="mt-2 text-[9px] px-1.5 py-0">
                  {habit.status}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

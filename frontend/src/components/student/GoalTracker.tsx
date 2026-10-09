"use client";

import React, { useState } from "react";
import { WeeklyGoal } from "@/types/student";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Target, Calendar, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface GoalTrackerProps {
  initialGoals: WeeklyGoal[];
  onToggleGoal?: (goalId: string, completed: boolean) => void;
}

export const GoalTracker: React.FC<GoalTrackerProps> = ({
  initialGoals,
  onToggleGoal,
}) => {
  const [goals, setGoals] = useState<WeeklyGoal[]>(initialGoals);

  const completedCount = goals.filter((g) => g.completed).length;
  const totalCount = goals.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleToggle = (id: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const newStatus = !g.completed;
          if (onToggleGoal) onToggleGoal(id, newStatus);
          return {
            ...g,
            completed: newStatus,
            currentCount: newStatus ? g.targetCount : Math.max(0, g.currentCount - 1),
          };
        }
        return g;
      })
    );
  };

  return (
    <Card className="border border-slate-200/90 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-teal-600" />
              <span>Weekly Goals & Milestone Sprints</span>
            </CardTitle>
            <CardDescription>
              {completedCount} of {totalCount} goals achieved this sprint
            </CardDescription>
          </div>
          <span className="text-sm font-bold text-teal-700 dark:text-teal-400">
            {percentage}% Achieved
          </span>
        </div>
        <div className="mt-2">
          <Progress value={percentage} indicatorClassName="bg-teal-600" className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-2.5">
        {goals.map((goal) => (
          <div
            key={goal.id}
            onClick={() => handleToggle(goal.id)}
            className={cn(
              "group flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer select-none",
              goal.completed
                ? "bg-slate-50/70 border-slate-200/60 dark:bg-slate-900/40 dark:border-slate-800"
                : "bg-white border-slate-200 hover:border-teal-300 hover:shadow-xs dark:bg-slate-900 dark:border-slate-800"
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                className={cn(
                  "h-5 w-5 rounded-md flex items-center justify-center transition-colors shrink-0",
                  goal.completed
                    ? "bg-teal-600 text-white"
                    : "border border-slate-300 group-hover:border-teal-500 text-transparent"
                )}
                aria-label={goal.completed ? "Mark incomplete" : "Mark completed"}
              >
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </button>
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-xs font-semibold tracking-tight transition-colors truncate",
                    goal.completed
                      ? "line-through text-slate-400 dark:text-slate-500"
                      : "text-slate-800 dark:text-slate-200"
                  )}
                >
                  {goal.title}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                  <span className="font-medium text-slate-500 dark:text-slate-400">
                    {goal.category}
                  </span>
                  <span>•</span>
                  <span>
                    {goal.currentCount}/{goal.targetCount} {goal.unit}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {goal.deadline}
                  </span>
                </div>
              </div>
            </div>

            <Button
              size="sm"
              variant={goal.completed ? "ghost" : "outline"}
              className="h-7 text-[11px] shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                handleToggle(goal.id);
              }}
            >
              {goal.completed ? "Completed" : "Mark as Done"}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

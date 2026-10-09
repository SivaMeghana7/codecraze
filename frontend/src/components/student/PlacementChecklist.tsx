"use client";

import React, { useState } from "react";
import { PlacementChecklistItem } from "@/types/student";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckSquare, Calendar, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlacementChecklistProps {
  initialItems: PlacementChecklistItem[];
}

export const PlacementChecklist: React.FC<PlacementChecklistProps> = ({ initialItems }) => {
  const [items, setItems] = useState<PlacementChecklistItem[]>(initialItems);

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const completedCount = items.filter((i) => i.completed).length;

  return (
    <Card className="border border-slate-200/90 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-teal-600" />
              <span>Placement Preparation Sprint Checklist</span>
            </CardTitle>
            <CardDescription>
              {completedCount} of {items.length} critical preparation milestones completed
            </CardDescription>
          </div>
          <span className="text-xs font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2.5 py-1 rounded-full border border-teal-200 dark:border-teal-800">
            {completedCount}/{items.length} Completed
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer select-none",
              item.completed
                ? "bg-slate-50/60 border-slate-200/60 dark:bg-slate-900/40 dark:border-slate-800"
                : "bg-white border-slate-200 hover:border-teal-300 dark:bg-slate-900 dark:border-slate-800"
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                className={cn(
                  "h-5 w-5 rounded flex items-center justify-center transition-colors shrink-0",
                  item.completed
                    ? "bg-teal-600 text-white"
                    : "border border-slate-300 hover:border-teal-500 text-transparent"
                )}
                aria-label={item.completed ? "Mark incomplete" : "Mark complete"}
              >
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </button>
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-xs font-semibold tracking-tight transition-colors truncate",
                    item.completed
                      ? "line-through text-slate-400 dark:text-slate-500"
                      : "text-slate-800 dark:text-slate-200"
                  )}
                >
                  {item.title}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                  <span className="font-medium text-slate-500 dark:text-slate-400">
                    {item.category}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Due {item.dueDate}
                  </span>
                </div>
              </div>
            </div>

            <Badge
              variant={item.priority === "High" ? "rose" : item.priority === "Medium" ? "amber" : "teal"}
              className="text-[10px] shrink-0"
            >
              {item.priority}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

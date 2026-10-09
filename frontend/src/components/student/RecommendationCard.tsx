"use client";

import React from "react";
import { RecommendationItem } from "@/types/student";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RecommendationCardProps {
  item: RecommendationItem;
  onComplete?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  item,
  onComplete,
  onDismiss,
}) => {
  const priorityConfig = {
    High: {
      badge: "rose" as const,
      border: "border-l-4 border-l-rose-500",
      label: "High Priority",
    },
    Medium: {
      badge: "amber" as const,
      border: "border-l-4 border-l-amber-500",
      label: "Medium Priority",
    },
    Low: {
      badge: "teal" as const,
      border: "border-l-4 border-l-teal-500",
      label: "Low Priority",
    },
  }[item.priority];

  return (
    <Card
      className={cn(
        "overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-md transition-all",
        priorityConfig.border,
        item.status === "Completed" && "opacity-75 bg-slate-50/50 dark:bg-slate-900/30",
        item.status === "Dismissed" && "opacity-50"
      )}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
          <div className="flex items-center gap-2">
            <Badge variant={priorityConfig.badge} className="text-[10px]">
              {priorityConfig.label}
            </Badge>
            <Badge variant="outline" className="text-[10px] text-slate-600 dark:text-slate-300">
              {item.category}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Clock className="h-3 w-3" />
            <span>Target: {item.targetDate}</span>
          </div>
        </div>

        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
          {item.title}
        </h4>

        {/* Diagnostic Reason */}
        <div className="mt-2.5 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-700 dark:bg-slate-800/60 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-3.5 w-3.5 text-teal-600 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="font-medium text-slate-900 dark:text-white">Why this is recommended:</p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{item.reason}</p>
            </div>
          </div>
        </div>

        {/* Suggested Action */}
        <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <span className="font-semibold text-slate-800 dark:text-slate-200">Recommended Next Step: </span>
          {item.suggestedAction}
        </p>

        {/* Impact Metric & Actions */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-teal-700 dark:text-teal-400 font-medium">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Impact: {item.relatedMetric} ({item.metricCurrentValue})</span>
          </div>

          <div className="flex items-center gap-2">
            {item.status === "Active" ? (
              <>
                {onDismiss && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-xs text-slate-500 hover:text-slate-700"
                    onClick={() => onDismiss(item.id)}
                  >
                    Dismiss
                  </Button>
                )}
                {onComplete && (
                  <Button
                    size="sm"
                    variant="default"
                    className="h-8 text-xs gap-1.5 bg-teal-600 hover:bg-teal-700 text-white"
                    onClick={() => onComplete(item.id)}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Mark as Done</span>
                  </Button>
                )}
              </>
            ) : item.status === "Completed" ? (
              <Badge variant="emerald" className="gap-1 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Completed</span>
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                Dismissed
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

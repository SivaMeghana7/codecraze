import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RiskBadge } from "./RiskBadge";
import { RiskLevel } from "@/types/common";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: number | string;
  unit?: string;
  explanation: string;
  icon: LucideIcon;
  riskLevel?: RiskLevel;
  previousValue?: number | string;
  changeDirection?: "up" | "down" | "neutral";
  changeText?: string;
  progressValue?: number;
  progressMax?: number;
  accentColor?: "teal" | "blue" | "emerald" | "amber" | "rose" | "indigo";
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  unit,
  explanation,
  icon: Icon,
  riskLevel,
  previousValue,
  changeDirection,
  changeText,
  progressValue,
  progressMax = 100,
  accentColor = "teal",
  className,
}) => {
  const accentStyles = {
    teal: "bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400",
    blue: "bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
    rose: "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400",
    indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400",
  }[accentColor];

  const progressBarColors = {
    teal: "bg-teal-600",
    blue: "bg-sky-600",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
    indigo: "bg-indigo-600",
  }[accentColor];

  return (
    <Card className={cn("overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {title}
            </span>
            <div className="flex items-baseline space-x-1.5 pt-1">
              <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {value}
              </span>
              {unit && <span className="text-sm font-medium text-slate-500">{unit}</span>}
            </div>
          </div>
          <div className={cn("rounded-xl p-2.5 shrink-0", accentStyles)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>

        {riskLevel && (
          <div className="mt-3">
            <RiskBadge level={riskLevel} size="sm" />
          </div>
        )}

        {typeof progressValue === "number" && (
          <div className="mt-3 space-y-1">
            <Progress value={progressValue} max={progressMax} indicatorClassName={progressBarColors} className="h-1.5" />
          </div>
        )}

        <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
          {explanation}
        </p>

        {changeText && (
          <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1 text-slate-600 dark:text-slate-400 font-medium">
              {changeDirection === "up" && <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />}
              {changeDirection === "down" && <TrendingDown className="h-3.5 w-3.5 text-rose-600" />}
              {changeDirection === "neutral" && <Minus className="h-3.5 w-3.5 text-slate-400" />}
              <span>{changeText}</span>
            </div>
            {previousValue !== undefined && (
              <span className="text-slate-400 text-[11px]">Prev: {previousValue}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

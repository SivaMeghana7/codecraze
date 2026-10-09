import React from "react";
import { cn } from "@/lib/utils";

interface ScoreGaugeProps {
  score: number; // 0 to 100
  size?: number; // width and height in px
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  className?: string;
  colorScheme?: "teal" | "emerald" | "amber" | "rose" | "auto";
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  size = 120,
  strokeWidth = 10,
  label,
  sublabel,
  className,
  colorScheme = "teal",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(Math.max(score, 0), 100);
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let strokeColor = "#0d9488"; // teal-600
  if (colorScheme === "emerald" || (colorScheme === "auto" && clampedScore >= 75)) {
    strokeColor = "#10b981"; // emerald-500
  } else if (colorScheme === "amber" || (colorScheme === "auto" && clampedScore >= 50 && clampedScore < 75)) {
    strokeColor = "#f59e0b"; // amber-500
  } else if (colorScheme === "rose" || (colorScheme === "auto" && clampedScore < 50)) {
    strokeColor = "#ef4444"; // rose-500
  }

  return (
    <div className={cn("relative inline-flex flex-col items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-100 dark:text-slate-800"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {Math.round(clampedScore)}
        </span>
        {label && <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{label}</span>}
      </div>
      {sublabel && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 text-center">{sublabel}</p>}
    </div>
  );
};

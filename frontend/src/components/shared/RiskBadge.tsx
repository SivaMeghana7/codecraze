import React from "react";
import { RiskLevel } from "@/types/common";
import { cn } from "@/lib/utils";
import { ShieldCheck, AlertTriangle, AlertCircle } from "lucide-react";

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  className,
  showIcon = true,
  size = "md",
}) => {
  const config = {
    Low: {
      label: "Low Risk",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      text: "text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-200 dark:border-emerald-800",
      icon: ShieldCheck,
      dot: "bg-emerald-500",
    },
    Moderate: {
      label: "Moderate Risk",
      bg: "bg-amber-50 dark:bg-amber-950/40",
      text: "text-amber-700 dark:text-amber-300",
      border: "border-amber-200 dark:border-amber-800",
      icon: AlertTriangle,
      dot: "bg-amber-500",
    },
    High: {
      label: "High Risk",
      bg: "bg-rose-50 dark:bg-rose-950/40",
      text: "text-rose-700 dark:text-rose-300",
      border: "border-rose-200 dark:border-rose-800",
      icon: AlertCircle,
      dot: "bg-rose-500",
    },
  }[level] || {
    label: "Unknown",
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
    icon: AlertCircle,
    dot: "bg-slate-400",
  };

  const IconComponent = config.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3.5 py-1.5 text-sm gap-2",
  }[size];

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border transition-all",
        config.bg,
        config.text,
        config.border,
        sizeClasses,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", config.dot)} />
      {showIcon && <IconComponent className="h-3.5 w-3.5 shrink-0" />}
      <span>{config.label}</span>
    </span>
  );
};

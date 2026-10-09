import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StatusStateProps {
  type?: "empty" | "loading" | "error";
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const StatusState: React.FC<StatusStateProps> = ({
  type = "empty",
  title,
  description,
  actionText,
  onAction,
  className,
}) => {
  const defaults = {
    empty: {
      icon: Inbox,
      title: "No Data Available",
      description: "There are no records matching your current filter criteria.",
      color: "text-slate-400",
    },
    loading: {
      icon: Loader2,
      title: "Loading Campus Data...",
      description: "Fetching analytics indicators and student metrics from the engine.",
      color: "text-teal-600 animate-spin",
    },
    error: {
      icon: AlertCircle,
      title: "Unable to Load Data",
      description: "An error occurred while fetching information. Please verify your connection or retry.",
      color: "text-rose-500",
    },
  }[type];

  const IconComponent = defaults.icon;

  return (
    <div
      className={cn(
        "flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center dark:border-slate-800 dark:bg-slate-900/40",
        className
      )}
    >
      <div className="mb-3 rounded-full bg-white p-3 shadow-xs dark:bg-slate-800">
        <IconComponent className={cn("h-6 w-6", defaults.color)} />
      </div>
      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
        {title || defaults.title}
      </h4>
      <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        {description || defaults.description}
      </p>
      {actionText && onAction && (
        <Button size="sm" variant="outline" className="mt-4 text-xs" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

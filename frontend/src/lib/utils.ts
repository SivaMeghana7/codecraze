import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatGpa(value: number): string {
  return value.toFixed(2);
}

export function getRiskColorClass(level: "Low" | "Moderate" | "High") {
  switch (level) {
    case "Low":
      return {
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
        indicator: "bg-emerald-500",
        text: "text-emerald-600 dark:text-emerald-400",
        border: "border-emerald-200 dark:border-emerald-800",
      };
    case "Moderate":
      return {
        badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
        indicator: "bg-amber-500",
        text: "text-amber-600 dark:text-amber-400",
        border: "border-amber-200 dark:border-amber-800",
      };
    case "High":
      return {
        badge: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
        indicator: "bg-rose-500",
        text: "text-rose-600 dark:text-rose-400",
        border: "border-rose-200 dark:border-rose-800",
      };
  }
}

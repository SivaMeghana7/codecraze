"use client";

import React, { useState } from "react";
import {
  mockRecommendations,
  mockWeeklyGoals,
  mockStudentProfile,
} from "@/lib/mockData";
import { StudentPageHeader } from "@/components/student/StudentPageHeader";
import { RecommendationCard } from "@/components/student/RecommendationCard";
import { GoalTracker } from "@/components/student/GoalTracker";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Filter,
  CheckCircle2,
  Clock,
  ListFilter,
  RotateCcw,
  Target,
} from "lucide-react";
import { RecommendationCategory, RecommendationItem } from "@/types/student";

const ALL_CATEGORIES: (RecommendationCategory | "All")[] = [
  "All",
  "Academics",
  "Attendance",
  "LMS and Learning",
  "Placement",
  "Technical Skills",
  "Soft Skills",
  "Engagement",
];

export const StudentRecommendationsView: React.FC = () => {
  const [items, setItems] = useState<RecommendationItem[]>(mockRecommendations);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedPriority, setSelectedPriority] = useState<string>("All");
  const [activeTab, setActiveTab] = useState<"Active" | "Completed" | "All">("Active");

  const handleComplete = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "Completed" as const } : item))
    );
  };

  const handleDismiss = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "Dismissed" as const } : item))
    );
  };

  const handleResetFilters = () => {
    setSelectedCategory("All");
    setSelectedPriority("All");
    setActiveTab("Active");
  };

  const filteredItems = items.filter((item) => {
    // Status filter
    if (activeTab === "Active" && item.status !== "Active") return false;
    if (activeTab === "Completed" && item.status !== "Completed") return false;
    // Category filter
    if (selectedCategory !== "All" && item.category !== selectedCategory) return false;
    // Priority filter
    if (selectedPriority !== "All" && item.priority !== selectedPriority) return false;
    return true;
  });

  const activeCount = items.filter((i) => i.status === "Active").length;
  const completedCount = items.filter((i) => i.status === "Completed").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <StudentPageHeader
        profile={mockStudentProfile}
        title="Personalized Recommendations & Milestones"
        description="Explainable, closed-loop diagnostic actions generated directly from your academic, attendance, and skills indicators."
      />

      {/* Goal Sprints Banner */}
      <GoalTracker initialGoals={mockWeeklyGoals} />

      {/* Control Bar: Categories, Priority, Status Tabs */}
      <Card className="border border-slate-200/90 shadow-sm p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("Active")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === "Active"
                  ? "bg-white text-teal-700 shadow-xs dark:bg-slate-900 dark:text-teal-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setActiveTab("Completed")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === "Completed"
                  ? "bg-white text-teal-700 shadow-xs dark:bg-slate-900 dark:text-teal-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              Completed ({completedCount})
            </button>
            <button
              onClick={() => setActiveTab("All")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === "All"
                  ? "bg-white text-teal-700 shadow-xs dark:bg-slate-900 dark:text-teal-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              All Records ({items.length})
            </button>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Priority:</span>
            {["All", "High", "Medium", "Low"].map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPriority(p)}
                className={`px-2.5 py-1 rounded text-xs font-semibold border transition-all ${
                  selectedPriority === p
                    ? "bg-teal-600 text-white border-teal-600"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                }`}
              >
                {p}
              </button>
            ))}

            {(selectedCategory !== "All" || selectedPriority !== "All" || activeTab !== "Active") && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleResetFilters}
                className="h-7 text-xs text-slate-500 gap-1 ml-2"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-medium text-slate-500 mr-1 flex items-center gap-1">
            <ListFilter className="h-3.5 w-3.5 text-teal-600" />
            Category:
          </span>
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-teal-700 text-white font-semibold shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </Card>

      {/* Recommendations Feed */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-dashed border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
            <CheckCircle2 className="h-8 w-8 text-teal-600 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No Recommendations Found
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              You have completed or cleared all recommendations in this filter view.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleResetFilters}
              className="mt-4 text-xs"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          filteredItems.map((item) => (
            <RecommendationCard
              key={item.id}
              item={item}
              onComplete={handleComplete}
              onDismiss={handleDismiss}
            />
          ))
        )}
      </div>
    </div>
  );
};

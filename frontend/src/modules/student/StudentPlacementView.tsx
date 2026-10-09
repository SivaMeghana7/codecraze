"use client";

import React, { useState } from "react";
import { mockPlacementData, mockStudentProfile } from "@/lib/mockData";
import { StudentPageHeader } from "@/components/student/StudentPageHeader";
import { SkillRadarChart } from "@/components/student/SkillRadarChart";
import { PlacementChecklist } from "@/components/student/PlacementChecklist";
import { CareerMatchRadar } from "@/components/student/CareerMatchRadar";
import { AiMockInterviewSimulator } from "@/components/student/AiMockInterviewSimulator";
import { AssessmentsAndAssignmentsHub } from "@/components/student/AssessmentsAndAssignmentsHub";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Briefcase,
  Code2,
  Brain,
  MessageSquare,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Award,
  BookOpen,
} from "lucide-react";

export const StudentPlacementView: React.FC = () => {
  const [placement, setPlacement] = useState(mockPlacementData);
  const [recentAiRiskTopic, setRecentAiRiskTopic] = useState<string | null>(null);

  const scores = placement.assessmentScores;

  const handleScoreUpdated = (newScore: number, highRiskTopic: string) => {
    setRecentAiRiskTopic(highRiskTopic);
    setPlacement((prev) => ({
      ...prev,
      overallReadinessScore: Math.round((prev.overallReadinessScore + newScore) / 2),
      assessmentScores: {
        ...prev.assessmentScores,
        mockInterviewScore: newScore,
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <StudentPageHeader
        profile={mockStudentProfile}
        title="Placement Readiness & AI Interview Simulator"
        description="Weekly AI mock interviews, skills benchmarking, coursework hub, and career vector matching."
      />

      {/* Prominent Score Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-3.5 border-slate-200/90 shadow-sm bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Readiness</span>
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
              <Briefcase className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-teal-700 dark:text-teal-400">
              {placement.overallReadinessScore}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">
            Tier-1 Placement Range
          </span>
        </Card>

        <Card className="p-3.5 border-slate-200/90 shadow-sm bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">AI Mock Interview</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <MessageSquare className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {scores.mockInterviewScore}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <span className="text-[10px] text-indigo-600 font-medium">
            {recentAiRiskTopic ? `Updated via Interview Evaluation` : "Week 5 Evaluated"}
          </span>
        </Card>

        <Card className="p-3.5 border-slate-200/90 shadow-sm bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Coding Drills</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Code2 className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-amber-600">
              {scores.codingScore}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <span className="text-[10px] text-amber-600 font-medium">Requires DP Focus</span>
        </Card>

        <Card className="p-3.5 border-slate-200/90 shadow-sm bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Aptitude Tests</span>
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
              <Brain className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {scores.aptitudeScore}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <span className="text-[10px] text-teal-600 font-medium">Top 25% Cohort</span>
        </Card>

        <Card className="p-3.5 border-slate-200/90 shadow-sm bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Core Technical</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {scores.technicalSkillsScore}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <span className="text-[10px] text-teal-600 font-medium">Strong Systems & DB</span>
        </Card>
      </div>

      {/* Feature 1: Weekly AI Mock Interview Simulator */}
      <AiMockInterviewSimulator onScoreUpdated={handleScoreUpdated} />

      {/* Feature 2: Assessments, AI Mock Tests & Coursework Hub */}
      <AssessmentsAndAssignmentsHub />

      {/* Feature 3: Radar Chart & Skills Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-6">
          <SkillRadarChart
            scores={scores}
            overallScore={placement.overallReadinessScore}
          />
        </div>

        <div className="lg:col-span-6 space-y-4">
          {/* Verified Core Competencies */}
          <Card className="border border-slate-200/90 shadow-sm p-4 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="h-4 w-4 text-emerald-600" />
                Verified Core Competencies
              </span>
              <span className="text-[11px] text-teal-600 font-medium">Top Strengths</span>
            </div>
            <div className="mt-3 space-y-2.5">
              {placement.skills.slice(0, 5).map((skill) => (
                <div key={skill.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-800 dark:text-slate-200">{skill.name}</span>
                    <span className="text-teal-700 font-bold">{skill.levelPercentage}%</span>
                  </div>
                  <Progress value={skill.levelPercentage} indicatorClassName="bg-teal-600" className="h-1.5" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Target Career Roles & Vector Match */}
      <CareerMatchRadar matches={placement.careerMatches} />

      {/* Weekly Placement Sprint Checklist */}
      <PlacementChecklist initialItems={placement.checklist} />
    </div>
  );
};

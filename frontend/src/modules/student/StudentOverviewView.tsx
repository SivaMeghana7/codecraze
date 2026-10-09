"use client";

import React, { useState } from "react";
import { mockStudentDashboardData } from "@/lib/mockData";
import { StudentPageHeader } from "@/components/student/StudentPageHeader";
import { KpiCard } from "@/components/shared/KpiCard";
import { AcademicTrendChart } from "@/components/student/AcademicTrendChart";
import { SubjectPerformanceChart } from "@/components/student/SubjectPerformanceChart";
import { AttendanceChart } from "@/components/student/AttendanceChart";
import { AttendanceMarginMeter } from "@/components/student/AttendanceMarginMeter";
import { SkillRadarChart } from "@/components/student/SkillRadarChart";
import { LmsActivityChart } from "@/components/student/LmsActivityChart";
import { RecommendationCard } from "@/components/student/RecommendationCard";
import { GoalTracker } from "@/components/student/GoalTracker";
import { WhatIfSimulator } from "@/components/student/WhatIfSimulator";
import { HabitBadgeShelf } from "@/components/student/HabitBadgeShelf";
import { ExplainableScoreDrivers } from "@/components/student/ExplainableScoreDrivers";
import { StudentSegmentationCard } from "@/components/student/StudentSegmentationCard";
import {
  GraduationCap,
  ShieldCheck,
  Briefcase,
  CalendarCheck,
  CheckCircle2,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { RecommendationItem } from "@/types/student";
import { cn } from "@/lib/utils";

export const StudentOverviewView: React.FC = () => {
  const data = mockStudentDashboardData;
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>(
    data.recommendations
  );

  const handleCompleteRecommendation = (id: string) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Completed" as const } : r))
    );
  };

  const handleDismissRecommendation = (id: string) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Dismissed" as const } : r))
    );
  };

  // Top 3 high priority actionable recommendations for the overview
  const prioritizedRecommendations = recommendations.filter(
    (r) => r.status === "Active"
  ).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* 4.A Welcome & Student Header */}
      <StudentPageHeader profile={data.profile}>
        <div className="flex gap-2">
          <Link
            href="/student/recommendations"
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "bg-teal-600 hover:bg-teal-700 text-white gap-1.5 shadow-sm font-semibold"
            )}
          >
            <Sparkles className="h-4 w-4" />
            <span>Recommended Actions</span>
          </Link>
          <Link
            href="/student/profile"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "border-white/20 text-white bg-white/10 hover:bg-white/20 font-semibold"
            )}
          >
            <span>View Profile</span>
          </Link>
        </div>
      </StudentPageHeader>

      {/* 4.B Key Performance Indicators (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Student Success Score */}
        <KpiCard
          title={data.kpis.successScore.title}
          value={data.kpis.successScore.value}
          unit={data.kpis.successScore.unit}
          explanation={data.kpis.successScore.explanation}
          icon={GraduationCap}
          changeDirection={data.kpis.successScore.changeDirection}
          changeText={data.kpis.successScore.changeText}
          previousValue={data.kpis.successScore.previousValue}
          progressValue={Number(data.kpis.successScore.value)}
          accentColor="teal"
        />

        {/* KPI 2: Academic Risk */}
        <KpiCard
          title={data.kpis.academicRisk.title}
          value={data.kpis.academicRisk.value}
          explanation={data.kpis.academicRisk.explanation}
          icon={ShieldCheck}
          riskLevel={data.kpis.academicRisk.riskLevel}
          changeDirection={data.kpis.academicRisk.changeDirection}
          changeText={data.kpis.academicRisk.changeText}
          progressValue={data.kpis.academicRisk.progressValue}
          accentColor="emerald"
        />

        {/* KPI 3: Placement Readiness */}
        <KpiCard
          title={data.kpis.placementReadiness.title}
          value={data.kpis.placementReadiness.value}
          unit={data.kpis.placementReadiness.unit}
          explanation={data.kpis.placementReadiness.explanation}
          icon={Briefcase}
          changeDirection={data.kpis.placementReadiness.changeDirection}
          changeText={data.kpis.placementReadiness.changeText}
          previousValue={data.kpis.placementReadiness.previousValue}
          progressValue={Number(data.kpis.placementReadiness.value)}
          accentColor="indigo"
        />

        {/* KPI 4: Attendance Rate */}
        <KpiCard
          title={data.kpis.attendanceRate.title}
          value={data.kpis.attendanceRate.value}
          unit={data.kpis.attendanceRate.unit}
          explanation={data.kpis.attendanceRate.explanation}
          icon={CalendarCheck}
          riskLevel={data.kpis.attendanceRate.riskLevel}
          changeDirection={data.kpis.attendanceRate.changeDirection}
          changeText={data.kpis.attendanceRate.changeText}
          previousValue={`${data.kpis.attendanceRate.previousValue}%`}
          progressValue={Number(data.kpis.attendanceRate.value)}
          accentColor="blue"
        />
      </div>

      {/* Explainable Student Success Score & Risk Attribution */}
      <ExplainableScoreDrivers />

      {/* Bonus Feature: Institutional Student Segmentation Pie Chart Engine */}
      <StudentSegmentationCard />

      {/* 4.C Academic Performance Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-navy-900 dark:text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-teal-600" />
              <span>Academic Performance & Trajectory</span>
            </h2>
            <p className="text-xs text-slate-500">
              Semester grades, cumulative CGPA progression, and subject distribution
            </p>
          </div>
          <Link
            href="/student/academics"
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            Detailed Analytics <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Academic Highlights Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-3 bg-white border-slate-200/90 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Current CGPA</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-bold text-teal-700 dark:text-teal-400">
                {data.academics.currentCgpa}
              </span>
              <span className="text-xs text-slate-400">/ 10.0</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">
              +0.12 vs Sem 5 ({data.academics.previousSemesterCgpa})
            </span>
          </Card>

          <Card className="p-3 bg-white border-slate-200/90 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Semester 6 SGPA</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {data.academics.currentSemesterGpa}
              </span>
              <span className="text-xs text-slate-400">/ 10.0</span>
            </div>
            <span className="text-[10px] text-slate-400">Target: 8.50</span>
          </Card>

          <Card className="p-3 bg-white border-slate-200/90 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Active Backlogs</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-bold text-emerald-600">
                {data.academics.activeBacklogs}
              </span>
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">Clean Academic Record</span>
          </Card>

          <Card className="p-3 bg-white border-slate-200/90 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Strongest Area</span>
            <div className="mt-1">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {data.academics.strongestSubjects[0]}
              </p>
              <p className="text-[10px] text-teal-600">Grade: A+ (92/100)</p>
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AcademicTrendChart data={data.academics.trends} />
          <SubjectPerformanceChart subjects={data.academics.currentSubjects} />
        </div>
      </div>

      {/* 4.D Attendance Overview & Deficit Meter */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-navy-900 dark:text-white flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-teal-600" />
              <span>Attendance Ledger & Learning Continuity</span>
            </h2>
            <p className="text-xs text-slate-500">
              Institutional threshold tracking with missable session calculations
            </p>
          </div>
          <Link
            href="/student/attendance"
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            Attendance Ledger <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <AttendanceMarginMeter attendance={data.attendance} />
        <AttendanceChart subjects={data.attendance.subjects} threshold={data.attendance.configuredThreshold} />
      </div>

      {/* 4.E Placement Readiness & Assessments */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-navy-900 dark:text-white flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-teal-600" />
              <span>Placement Preparation & Benchmark Vectors</span>
            </h2>
            <p className="text-xs text-slate-500">
              Multi-axial assessments evaluated for upcoming campus recruitment drives
            </p>
          </div>
          <Link
            href="/student/placement"
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            Placement Roadmap <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7">
            <SkillRadarChart
              scores={data.placement.assessmentScores}
              overallScore={data.placement.overallReadinessScore}
            />
          </div>
          <div className="lg:col-span-5 space-y-3">
            <Card className="border border-slate-200/90 shadow-sm h-full flex flex-col justify-between p-5">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase">Assessment Breakdown</span>
                <div className="mt-3 space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span>Quantitative Aptitude</span>
                      <span className="font-bold text-teal-700">{data.placement.assessmentScores.aptitudeScore}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-600" style={{ width: `${data.placement.assessmentScores.aptitudeScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span>Coding Drills & DSA</span>
                      <span className="font-bold text-sky-700">{data.placement.assessmentScores.codingScore}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-600" style={{ width: `${data.placement.assessmentScores.codingScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span>Mock Technical Interview</span>
                      <span className="font-bold text-indigo-700">{data.placement.assessmentScores.mockInterviewScore}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600" style={{ width: `${data.placement.assessmentScores.mockInterviewScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span>Technical Core Knowledge</span>
                      <span className="font-bold text-purple-700">{data.placement.assessmentScores.technicalSkillsScore}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600" style={{ width: `${data.placement.assessmentScores.technicalSkillsScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span>Soft Skills & Behavioral</span>
                      <span className="font-bold text-emerald-700">{data.placement.assessmentScores.softSkillsScore}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600" style={{ width: `${data.placement.assessmentScores.softSkillsScore}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                Evaluation index derived from 3 diagnostic tests and 1 mock interview.
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* 4.F Learning and LMS Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LmsActivityChart lms={data.attendance.lms} />
        <HabitBadgeShelf />
      </div>

      {/* Interactive What-If Simulator */}
      <WhatIfSimulator
        baseAttendance={data.attendance.overallPercentage}
        baseCgpa={data.academics.currentCgpa}
        baseCodingScore={data.placement.assessmentScores.codingScore}
        baseSuccessScore={Number(data.kpis.successScore.value)}
      />

      {/* 4.G Recommended Next Steps & 4.H Weekly Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 4.G Next Steps */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-navy-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-teal-600" />
              <span>Recommended Next Steps</span>
            </h2>
            <Link
              href="/student/recommendations"
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              All {recommendations.length} Recommendations <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {prioritizedRecommendations.map((item) => (
              <RecommendationCard
                key={item.id}
                item={item}
                onComplete={handleCompleteRecommendation}
                onDismiss={handleDismissRecommendation}
              />
            ))}
          </div>
        </div>

        {/* 4.H Weekly Goals */}
        <div className="lg:col-span-5">
          <GoalTracker initialGoals={data.weeklyGoals} />
        </div>
      </div>
    </div>
  );
};

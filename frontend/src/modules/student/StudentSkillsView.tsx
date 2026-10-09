"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SkillRadarChart } from "@/components/student/SkillRadarChart";
import { mockStudentDashboardData } from "@/lib/mockData";
import {
  Code2,
  Cpu,
  Layers,
  CheckCircle2,
  Terminal,
  Brain,
  MessageSquare,
  Users2,
  Sparkles,
} from "lucide-react";

export const StudentSkillsView: React.FC = () => {
  const radarData = mockStudentDashboardData.placement.skills;

  const technicalSkills = [
    { name: "Data Structures & Algorithms", level: 86, tag: "Advanced", problemsSolved: "240+ LeetCode", icon: Code2 },
    { name: "Distributed Systems & Concurrency", level: 68, tag: "Intermediate", problemsSolved: "12 Systems Labs", icon: Cpu },
    { name: "Database Engineering & SQL", level: 90, tag: "Proficient", problemsSolved: "45 SQL Drills", icon: Layers },
    { name: "Full Stack (Next.js & Python)", level: 88, tag: "Advanced", problemsSolved: "6 Projects Built", icon: Terminal },
  ];

  const softSkills = [
    { name: "Technical Communication", level: 82, rating: "Very Good", notes: "Clear articulation during code reviews", icon: MessageSquare },
    { name: "Collaborative Problem Solving", level: 88, rating: "Excellent", notes: "SIH Hackathon team leader", icon: Users2 },
    { name: "Analytical & Aptitude Reasoning", level: 78, rating: "Good", notes: "Speed test in logical syllogisms", icon: Brain },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-300 border border-indigo-500/30">
                <Brain className="h-3.5 w-3.5" />
                <span>Competency & Skill Matrix</span>
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Skills & Technical Competencies</h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              Comprehensive technical and soft-skill assessments benchmarked against corporate recruitment cutoffs.
            </p>
          </div>
        </div>
      </div>

      {/* Grid with Radar and Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <SkillRadarChart
          scores={mockStudentDashboardData.placement.assessmentScores}
          overallScore={mockStudentDashboardData.placement.overallReadinessScore}
        />

        {/* Technical Competency Breakdown */}
        <Card className="border border-slate-200 bg-white dark:bg-slate-900">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-base flex items-center gap-2">
              <Code2 className="h-4 w-4 text-teal-600" />
              <span>Core Technical Stack Benchmarks</span>
            </CardTitle>
            <CardDescription>
              Evaluated via mock assessments, coding platforms, and lab submissions
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 space-y-3.5">
            {technicalSkills.map((sk) => {
              const Icon = sk.icon;
              return (
                <div key={sk.name} className="space-y-1.5 p-3 rounded-xl border border-slate-100 bg-slate-50/60 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-teal-600" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {sk.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">{sk.problemsSolved}</span>
                      <Badge variant={sk.level >= 80 ? "emerald" : "teal"} className="text-[10px] font-bold">
                        {sk.level}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={sk.level} className="h-1.5" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Soft Skills & Communication */}
      <Card className="border border-slate-200 bg-white dark:bg-slate-900">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-indigo-600" />
            <span>Soft Skills & Professional Competencies</span>
          </CardTitle>
          <CardDescription>
            Evaluated through mock interviews and mentor reviews
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {softSkills.map((ss) => {
              const Icon = ss.icon;
              return (
                <div key={ss.name} className="p-4 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <Icon className="h-5 w-5 text-indigo-600" />
                    <Badge variant="teal" className="text-xs font-bold">{ss.level}%</Badge>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{ss.name}</h4>
                  <p className="text-[11px] text-slate-500">{ss.notes}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

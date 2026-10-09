"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scale, ArrowUp, ArrowDown, HelpCircle, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const ExplainableScoreDrivers: React.FC = () => {
  const drivers = [
    {
      category: "Academic CGPA (8.14)",
      weight: "30%",
      contribution: "+24.4",
      direction: "positive" as const,
      detail: "Clean record, 0 active backlogs, strong midterm grades in Systems.",
    },
    {
      category: "Biometric Attendance (79.2%)",
      weight: "25%",
      contribution: "+19.8",
      direction: "positive" as const,
      detail: "Meets overall 75% statutory bar across 5 of 6 subjects.",
    },
    {
      category: "LMS Learning Velocity",
      weight: "20%",
      contribution: "+15.6",
      direction: "positive" as const,
      detail: "94% assignment on-time submission rate and regular portal logins.",
    },
    {
      category: "Placement & Mock Interviews",
      weight: "15%",
      contribution: "+11.7",
      direction: "positive" as const,
      detail: "Tier-1 aptitude cleared; weekly AI mock interview evaluated at 74/100.",
    },
    {
      category: "Campus Grievance / Engagement",
      weight: "10%",
      contribution: "+8.5",
      direction: "positive" as const,
      detail: "Active hackathon badges and positive mentor feedback score.",
    },
  ];

  const riskFactors = [
    {
      risk: "CS603 Attendance Deficit (71.4%)",
      impact: "-3.6 pts",
      solution: "Need 5 consecutive attendances to clear minimum statutory threshold.",
    },
    {
      risk: "Concurrency & DP Gap in Mock Test",
      impact: "-2.4 pts",
      solution: "Complete Week 6 Concurrency Drill and LeetCode DP practice list.",
    },
  ];

  return (
    <Card className="border-2 border-teal-500/40 shadow-md bg-white dark:bg-slate-900 overflow-hidden">
      {/* Score Formula Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 px-5 py-3 text-white border-b border-teal-500/30 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold text-xs border border-teal-500/40">
            <Scale className="h-3.5 w-3.5 text-teal-400" />
            <span>Success Score Weight Breakdown</span>
          </span>
          <span className="text-xs text-slate-300 font-medium hidden sm:inline">
            Transparent Core Indicator Weights
          </span>
        </div>
        <span className="text-[11px] font-mono text-emerald-400 font-bold">
          Weighted Success Score: 84 / 100
        </span>
      </div>

      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Scale className="h-4 w-4 text-teal-600" />
              <span>Explainable Student Success Score & Risk Attribution</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Mathematical formulation: <strong>Score = 0.30(Academic) + 0.25(Attendance) + 0.20(LMS) + 0.15(Placement) + 0.10(Engagement)</strong>
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="emerald" className="text-xs font-semibold">
              Segment: High Academic, Low Placement
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Core formula summary */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
          {drivers.map((d) => (
            <div
              key={d.category}
              className="p-3 rounded-xl border border-slate-200/80 bg-slate-50 dark:bg-slate-800/40 space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase">
                  {d.weight} Weight
                </span>
                <span className="text-xs font-extrabold text-emerald-600 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-0.5" />
                  {d.contribution}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                {d.category}
              </p>
              <p className="text-[10px] text-slate-500 line-clamp-2">
                {d.detail}
              </p>
            </div>
          ))}
        </div>

        {/* Deductions / Risk Flags */}
        <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/60 dark:bg-amber-950/20 dark:border-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
              <span>Identified Score Risk Deductions:</span>
            </span>
            <div className="flex flex-wrap gap-2 pt-0.5">
              {riskFactors.map((rf, idx) => (
                <div
                  key={idx}
                  className="text-[11px] bg-white dark:bg-slate-800 border border-amber-200 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-200"
                >
                  <strong className="text-rose-600 mr-1">{rf.impact}</strong>
                  <span>{rf.risk}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Net Student Success Score</span>
            <div className="text-2xl font-black text-teal-700 dark:text-teal-400">
              84.0 / 100
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

"use client";

import React from "react";
import { PlacementAssessmentBreakdown } from "@/types/student";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts";
import { Briefcase, AlertCircle } from "lucide-react";

interface SkillRadarChartProps {
  scores: PlacementAssessmentBreakdown;
  overallScore: number;
}

export const SkillRadarChart: React.FC<SkillRadarChartProps> = ({ scores, overallScore }) => {
  const radarData = [
    { subject: "Aptitude Tests", score: scores.aptitudeScore, benchmark: 70 },
    { subject: "Coding Drills", score: scores.codingScore, benchmark: 72 },
    { subject: "Mock Interview", score: scores.mockInterviewScore, benchmark: 65 },
    { subject: "Technical Skills", score: scores.technicalSkillsScore, benchmark: 68 },
    { subject: "Soft Skills", score: scores.softSkillsScore, benchmark: 65 },
  ];

  return (
    <Card className="border border-slate-200/90 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-teal-600" />
              <span>Placement Readiness Assessment Radar</span>
            </CardTitle>
            <CardDescription>
              Multi-axial evaluation vs Campus Benchmark Average
            </CardDescription>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Readiness Score</span>
            <p className="text-lg font-bold text-teal-700 dark:text-teal-400">
              {overallScore} / 100
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "#475569", fontSize: 11, fontWeight: 500 }}
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
              <Radar
                name="Your Score"
                dataKey="score"
                stroke="#0d9488"
                fill="#0d9488"
                fillOpacity={0.4}
              />
              <Radar
                name="Batch Average"
                dataKey="benchmark"
                stroke="#94a3b8"
                fill="#94a3b8"
                fillOpacity={0.15}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-md text-xs dark:bg-slate-900 dark:border-slate-800">
                        <p className="font-semibold text-slate-900 dark:text-white mb-1">
                          {data.subject}
                        </p>
                        <p className="text-teal-700 dark:text-teal-400 font-bold">
                          Your Score: {data.score} / 100
                        </p>
                        <p className="text-slate-500">
                          Batch Avg: {data.benchmark} / 100
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-2 rounded-lg bg-teal-50/60 p-2.5 text-[11px] text-teal-800 dark:bg-teal-950/30 dark:text-teal-300 border border-teal-100 dark:border-teal-900/50 flex items-start gap-2">
          <AlertCircle className="h-3.5 w-3.5 text-teal-600 mt-0.5 shrink-0" />
          <span>
            Diagnostic indicator scores are evaluated through campus mock assessments and do not guarantee corporate hiring results.
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

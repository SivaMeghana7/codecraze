"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Users,
  Trophy,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  PieChart as PieIcon,
  HelpCircle,
  Filter,
} from "lucide-react";

interface SegmentInfo {
  name: string;
  count: number;
  percentage: number;
  color: string;
  badgeVariant: "rose" | "teal" | "emerald" | "amber" | "indigo";
  characteristics: string;
  criteria: string;
  targetIntervention: string;
  isCurrentStudentSegment?: boolean;
}

const SEGMENT_DATA: SegmentInfo[] = [
  {
    name: "High Academic, Low Placement (Unpolished Gems)",
    count: 342,
    percentage: 28,
    color: "#0d9488", // teal-600
    badgeVariant: "teal",
    criteria: "CGPA > 8.0 & Placement Readiness < 65%",
    characteristics: "Excellent theoretical foundations & exam grades, but lack DSA/System Design interview velocity and confidence.",
    targetIntervention: "Enroll in 1-on-1 AI Mock Interview Drills and intensive LeetCode DP & Concurrency Bootcamps.",
    isCurrentStudentSegment: true,
  },
  {
    name: "High Placement / Hackers, Attendance Deficit",
    count: 220,
    percentage: 18,
    color: "#f59e0b", // amber-500
    badgeVariant: "amber",
    criteria: "Placement Index > 82% & Biometric Attendance < 75%",
    characteristics: "Elite competitive programmers and hackathon winners who skip morning lectures. At risk of university debarment.",
    targetIntervention: "Statutory attendance recovery compact, lecture make-up labs, and faculty advisory alerts.",
  },
  {
    name: "All-Round Star Performers",
    count: 295,
    percentage: 24,
    color: "#10b981", // emerald-500
    badgeVariant: "emerald",
    criteria: "CGPA > 8.5 & Attendance > 85% & Placement > 85%",
    characteristics: "Top quartile across all six telemetry streams with flawless co-curricular engagements.",
    targetIntervention: "Fast-track access to Tier-1 'Super Dream' hiring drives (Google, Microsoft) & research fellowships.",
  },
  {
    name: "Critical Dual-Risk Cohort",
    count: 146,
    percentage: 12,
    color: "#e11d48", // rose-600
    badgeVariant: "rose",
    criteria: "CGPA < 6.5 or Backlogs & Placement < 50%",
    characteristics: "Simultaneous academic underperformance, active backlogs, and poor mock test scores.",
    targetIntervention: "Mandatory Faculty Mentor 1-on-1 counseling, remedial coursework, and peer tutoring.",
  },
  {
    name: "Steady Core Growth Cohort",
    count: 221,
    percentage: 18,
    color: "#6366f1", // indigo-500
    badgeVariant: "indigo",
    criteria: "CGPA 7.0 - 7.8 & Balanced Engagement",
    characteristics: "Consistent median performers with high LMS submission rates who need incremental skill pushes.",
    targetIntervention: "Targeted aptitude modules and soft-skill communication clinics to elevate to Star status.",
  },
];

export const StudentSegmentationCard: React.FC = () => {
  const [selectedSegment, setSelectedSegment] = useState<SegmentInfo>(SEGMENT_DATA[0]);

  return (
    <Card className="border-2 border-teal-500/40 shadow-md bg-white dark:bg-slate-900 overflow-hidden">
      {/* Cohort Segmentation Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 px-5 py-3 text-white border-b border-teal-500/30 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold text-xs border border-teal-500/40">
            <Trophy className="h-3.5 w-3.5 text-teal-400" />
            <span>Student Cohort Segmentation</span>
          </span>
          <span className="text-xs text-slate-300 font-medium hidden sm:inline">
            Actionable Cohort Intelligence & Targeted Actions
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          N = 1,224 Monitored Students
        </span>
      </div>

      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-teal-600" />
              <span>Institutional Student Segmentation</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Algorithmic clustering grouping students by academic strengths vs placement readiness to trigger targeted interventions
            </CardDescription>
          </div>

          <div className="flex items-center gap-1.5">
            <Badge variant="teal" className="text-xs font-bold gap-1">
              <Sparkles className="h-3 w-3" />
              Your Segment: High Academic, Low Placement
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Pie Chart (Recharts) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={SEGMENT_DATA}
                    dataKey="percentage"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={50}
                    paddingAngle={3}
                    cursor="pointer"
                    onClick={(data) => {
                      const match = SEGMENT_DATA.find((s) => s.name === data.name);
                      if (match) setSelectedSegment(match);
                    }}
                  >
                    {SEGMENT_DATA.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke={selectedSegment.name === entry.name ? "#ffffff" : "transparent"}
                        strokeWidth={selectedSegment.name === entry.name ? 3 : 1}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [`${value}% of Cohort`, name]}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "0.5rem",
                      color: "#0f172a",
                      fontSize: "12px",
                      border: "1px solid #cbd5e1",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                    itemStyle={{ color: "#0f172a", fontWeight: "bold" }}
                    labelStyle={{ color: "#0f172a", fontWeight: "bold" }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Centered Total Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-extrabold text-slate-800 dark:text-white">
                  5 Cohorts
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Clustered by AI
                </span>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 italic text-center">
              Click any pie slice to inspect the targeted intervention protocol
            </span>
          </div>

          {/* Interactive Cohort Details Card */}
          <div className="lg:col-span-7 space-y-3">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: selectedSegment.color }}
                    />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {selectedSegment.name}
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block">
                    Criteria: {selectedSegment.criteria}
                  </span>
                </div>

                <Badge variant={selectedSegment.badgeVariant} className="text-xs font-bold shrink-0">
                  {selectedSegment.percentage}% ({selectedSegment.count} Students)
                </Badge>
              </div>

              <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                <p>
                  <strong>Characteristics:</strong> {selectedSegment.characteristics}
                </p>
              </div>

              {/* Targeted Intervention Box */}
              <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 text-teal-950 dark:text-teal-200 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-teal-800 dark:text-teal-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Targeted Institutional Action Protocol:</span>
                </div>
                <p className="leading-relaxed">
                  {selectedSegment.targetIntervention}
                </p>
              </div>

              {/* If current student belongs to this cohort */}
              {selectedSegment.isCurrentStudentSegment && (
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Your Profile Match:</strong> With your 8.14 CGPA and 74/100 mock interview index, clearing your weekly concurrency drill will accelerate your progression to the <em>All-Round Star</em> cohort.
                  </span>
                </div>
              )}
            </div>

            {/* Segment Selector Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {SEGMENT_DATA.map((seg) => (
                <button
                  key={seg.name}
                  type="button"
                  onClick={() => setSelectedSegment(seg)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                    selectedSegment.name === seg.name
                      ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: seg.color }} />
                  <span className="truncate max-w-[150px]">{seg.name.split(" (")[0]}</span>
                  <span className="text-[10px] opacity-70">({seg.percentage}%)</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

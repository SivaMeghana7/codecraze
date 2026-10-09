"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Sparkles, Sliders, RotateCcw, TrendingUp } from "lucide-react";
import { ScoreGauge } from "@/components/shared/ScoreGauge";
import { Badge } from "@/components/ui/badge";

interface WhatIfSimulatorProps {
  baseAttendance?: number;
  baseCgpa?: number;
  baseCodingScore?: number;
  baseSuccessScore?: number;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  baseAttendance = 79.2,
  baseCgpa = 8.14,
  baseCodingScore = 68,
  baseSuccessScore = 78,
}) => {
  const [simAttendance, setSimAttendance] = useState(baseAttendance);
  const [simMidtermMarks, setSimMidtermMarks] = useState(82);
  const [simCodingHours, setSimCodingHours] = useState(10);
  const [simMockInterview, setSimMockInterview] = useState(75);

  // Normalized prediction formula (Weights: Academics 30%, Attendance 25%, LMS/Coding 25%, Interview 20%)
  const calculateSimulatedScore = () => {
    const attendanceFactor = (simAttendance / 100) * 25;
    const academicFactor = (simMidtermMarks / 100) * 30;
    const codingFactor = Math.min((simCodingHours / 15) * 25, 25);
    const interviewFactor = (simMockInterview / 100) * 20;
    const calculated = Math.round(attendanceFactor + academicFactor + codingFactor + interviewFactor);
    return Math.min(Math.max(calculated, 40), 98);
  };

  const simulatedScore = calculateSimulatedScore();
  const delta = simulatedScore - baseSuccessScore;

  const handleReset = () => {
    setSimAttendance(baseAttendance);
    setSimMidtermMarks(82);
    setSimCodingHours(10);
    setSimMockInterview(75);
  };

  return (
    <Card className="border border-slate-200/90 shadow-sm overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-teal-50/50 to-white pb-3 border-b border-slate-100 dark:bg-slate-900/60 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Sliders className="h-4 w-4 text-teal-600" />
              <span>Real-Time "What-If" Success Simulator</span>
            </CardTitle>
            <CardDescription>
              Adjust sliders to preview how target behaviors dynamically uplift your Success Score
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleReset}
            className="h-8 gap-1 text-xs text-slate-500 hover:text-slate-800"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Sliders</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Sliders Area */}
          <div className="md:col-span-8 space-y-5">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-700 dark:text-slate-300">
                  Target Attendance Consistency
                </span>
                <span className="text-teal-700 dark:text-teal-400">{simAttendance.toFixed(1)}%</span>
              </div>
              <Slider
                value={simAttendance}
                min={65}
                max={100}
                step={0.5}
                onChange={setSimAttendance}
              />
              <span className="text-[11px] text-slate-400 mt-0.5 inline-block">
                Baseline: {baseAttendance}% • Safe target: &gt;75%
              </span>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-700 dark:text-slate-300">
                  Target Midterm Exam Marks (%)
                </span>
                <span className="text-teal-700 dark:text-teal-400">{simMidtermMarks}%</span>
              </div>
              <Slider
                value={simMidtermMarks}
                min={50}
                max={100}
                step={1}
                onChange={setSimMidtermMarks}
              />
              <span className="text-[11px] text-slate-400 mt-0.5 inline-block">
                Midterm scoring correlates strongly with final semester GPA
              </span>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-700 dark:text-slate-300">
                  Weekly Coding & Lab Practice Hours
                </span>
                <span className="text-teal-700 dark:text-teal-400">{simCodingHours} hrs/week</span>
              </div>
              <Slider
                value={simCodingHours}
                min={2}
                max={20}
                step={1}
                onChange={setSimCodingHours}
              />
              <span className="text-[11px] text-slate-400 mt-0.5 inline-block">
                10-14 hours weekly maximizes placement coding benchmarks
              </span>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-700 dark:text-slate-300">
                  Mock Interview Evaluation Score
                </span>
                <span className="text-teal-700 dark:text-teal-400">{simMockInterview} / 100</span>
              </div>
              <Slider
                value={simMockInterview}
                min={50}
                max={100}
                step={1}
                onChange={setSimMockInterview}
              />
              <span className="text-[11px] text-slate-400 mt-0.5 inline-block">
                Includes STAR method behavioral and live coding ratings
              </span>
            </div>
          </div>

          {/* Outcome Gauge */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-50/80 rounded-xl border border-slate-200/60 dark:bg-slate-900/40 dark:border-slate-800 text-center">
            <ScoreGauge
              score={simulatedScore}
              size={130}
              strokeWidth={10}
              label="Simulated Score"
              colorScheme="teal"
            />
            <div className="mt-3">
              <Badge
                variant={delta >= 0 ? "emerald" : "rose"}
                className="text-xs px-2.5 py-1 font-semibold"
              >
                <TrendingUp className="h-3 w-3 mr-1 inline" />
                {delta >= 0 ? `+${delta} pts Uplift` : `${delta} pts Impact`}
              </Badge>
            </div>
            <p className="mt-2 text-[11px] text-slate-500 max-w-[180px] leading-relaxed">
              Based on the 5-variable success formula engine.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

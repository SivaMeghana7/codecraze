"use client";

import React from "react";
import { CareerMatchVector } from "@/types/student";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Compass, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

interface CareerMatchRadarProps {
  matches: CareerMatchVector[];
}

export const CareerMatchRadar: React.FC<CareerMatchRadarProps> = ({ matches }) => {
  return (
    <Card className="border border-slate-200/90 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Compass className="h-4 w-4 text-teal-600" />
              <span>Target Career Role Alignment & Skill Gap Analysis</span>
            </CardTitle>
            <CardDescription>
              Vector match comparing your verified skills against industry job descriptions
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {matches.map((role) => (
          <div
            key={role.roleTitle}
            className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 dark:bg-slate-900/40 dark:border-slate-800 space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {role.roleTitle}
                </h4>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                  <Badge
                    variant={role.matchPercentage >= 80 ? "emerald" : role.matchPercentage >= 70 ? "teal" : "amber"}
                    className="text-[10px]"
                  >
                    {role.matchStatus}
                  </Badge>
                  <span>•</span>
                  <span>Demand: <strong>{role.industryDemand}</strong></span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-lg font-bold text-teal-700 dark:text-teal-400">
                  {role.matchPercentage}%
                </span>
                <span className="text-xs text-slate-400 ml-1">fit</span>
              </div>
            </div>

            <Progress
              value={role.matchPercentage}
              indicatorClassName={role.matchPercentage >= 80 ? "bg-teal-600" : "bg-sky-500"}
              className="h-2"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Your Matching Strengths:
                </span>
                <div className="flex flex-wrap gap-1">
                  {role.topMatchingSkills.map((s) => (
                    <span
                      key={s}
                      className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Skills to Acquire:
                </span>
                <div className="flex flex-wrap gap-1">
                  {role.skillsToAcquire.map((s) => (
                    <span
                      key={s}
                      className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                    >
                      +{s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

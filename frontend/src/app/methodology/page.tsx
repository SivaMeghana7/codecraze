"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Scale } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RoleGuard } from "@/components/shared/RoleGuard";

export default function MethodologyPage() {
  const weights = [
    { variable: "Academic Performance", weight: "30%", metric: "CGPA & Internal Midterm Grades (Normalized 0-10)", source: "SIS Database" },
    { variable: "Biometric Attendance Rate", weight: "25%", metric: "Verified Attendance Percentage (>75% Benchmark)", source: "Biometric Readers" },
    { variable: "LMS Learning Velocity", weight: "20%", metric: "Canvas Study Hours & Assignment Submissions", source: "LMS Canvas API" },
    { variable: "Placement Assessment Score", weight: "15%", metric: "Aptitude & DSA Coding Benchmarks", source: "Coding Portal" },
    { variable: "Campus Grievance / Engagement", weight: "10%", metric: "NLP Sentiment of Feedback & Hackathon Badges", source: "Campus Portal" },
  ];

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-teal-900 to-navy-900 p-6 text-white">
          <h1 className="text-2xl font-bold">Methodology & Explainability Architecture</h1>
          <p className="text-xs text-slate-300 mt-1">
            Formula weighting documentation (sum = 100%), risk threshold matrices, and SHAP explainability standards.
          </p>
        </div>

        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Scale className="h-4 w-4 text-teal-600" />
              <span>Normalized 5-Variable Student Success Score Formula</span>
            </CardTitle>
            <CardDescription>All indicators are scaled to 0-100 before applying standardized linear weights</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evaluation Indicator</TableHead>
                  <TableHead>Formula Weight</TableHead>
                  <TableHead>Measurement Standard</TableHead>
                  <TableHead>Primary Data Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weights.map((w) => (
                  <TableRow key={w.variable}>
                    <TableCell className="font-bold text-slate-900">{w.variable}</TableCell>
                    <TableCell>
                      <Badge variant="teal" className="font-bold">{w.weight}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">{w.metric}</TableCell>
                    <TableCell className="text-xs font-mono text-slate-500">{w.source}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}

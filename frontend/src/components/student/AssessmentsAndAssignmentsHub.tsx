"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Bot,
  UserCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  Play,
  Upload,
  Check,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AssignmentItem {
  id: string;
  title: string;
  subject: string;
  creator: "Faculty: Dr. Evelyn Reed" | "AI Academic Agent";
  evaluator: "Evaluated by Faculty Only";
  dueDate: string;
  status: "Pending Submission" | "Submitted - Under Faculty Review" | "Graded by Faculty";
  facultyScore?: string;
  facultyRemarks?: string;
}

interface AiMockTestItem {
  id: string;
  title: string;
  subject: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  questionsCount: number;
  aiEvaluated: boolean;
  bestScore?: number;
  status: "Available" | "Completed";
}

export const AssessmentsAndAssignmentsHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"ai-tests" | "assignments">("ai-tests");
  const [selectedMockTest, setSelectedMockTest] = useState<AiMockTestItem | null>(null);
  const [testScore, setTestScore] = useState<number | null>(null);
  const [isTestSubmitting, setIsTestSubmitting] = useState(false);

  // Assignment submission dialog state
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentItem | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);

  const [aiMockTests, setAiMockTests] = useState<AiMockTestItem[]>([
    {
      id: "MOCK-101",
      title: "Data Structures: Trees, Tries & Graph Traversals",
      subject: "Placement Coding & Algorithms",
      difficulty: "Advanced",
      questionsCount: 10,
      aiEvaluated: true,
      bestScore: 84,
      status: "Completed",
    },
    {
      id: "MOCK-102",
      title: "CS603 Virtual Memory, Paging & Thrashing Diagnostic",
      subject: "Academics: Operating Systems",
      difficulty: "Intermediate",
      questionsCount: 8,
      aiEvaluated: true,
      status: "Available",
    },
    {
      id: "MOCK-103",
      title: "SQL Query Optimization & B+ Tree Index Mechanics",
      subject: "Academics: Database Systems",
      difficulty: "Intermediate",
      questionsCount: 10,
      aiEvaluated: true,
      bestScore: 90,
      status: "Completed",
    },
    {
      id: "MOCK-104",
      title: "Dynamic Programming Memoization Sprint",
      subject: "Placement Remedial Practice",
      difficulty: "Advanced",
      questionsCount: 6,
      aiEvaluated: true,
      status: "Available",
    },
  ]);

  const [assignments, setAssignments] = useState<AssignmentItem[]>([
    {
      id: "ASN-201",
      title: "CS603 Raft Distributed Consensus Implementation",
      subject: "Operating Systems (CS603)",
      creator: "Faculty: Dr. Evelyn Reed",
      evaluator: "Evaluated by Faculty Only",
      dueDate: "Oct 16, 2026",
      status: "Pending Submission",
    },
    {
      id: "ASN-202",
      title: "Database Index Tuning Benchmark Report",
      subject: "Database Management Systems (CS602)",
      creator: "AI Academic Agent",
      evaluator: "Evaluated by Faculty Only",
      dueDate: "Oct 20, 2026",
      status: "Submitted - Under Faculty Review",
    },
    {
      id: "ASN-203",
      title: "Memory Profiler & Valgrind Leak Investigation",
      subject: "Operating Systems (CS603)",
      creator: "Faculty: Dr. Evelyn Reed",
      evaluator: "Evaluated by Faculty Only",
      dueDate: "Sep 28, 2026",
      status: "Graded by Faculty",
      facultyScore: "94 / 100",
      facultyRemarks: "Exceptional memory footprint isolation and clear lock contention diagnostics.",
    },
  ]);

  const handleRunAiMockTest = (test: AiMockTestItem) => {
    setSelectedMockTest(test);
    setIsTestSubmitting(true);
    setTestScore(null);

    // Simulate instant AI evaluation
    setTimeout(() => {
      const generatedScore = Math.floor(78 + Math.random() * 18);
      setTestScore(generatedScore);
      setIsTestSubmitting(false);

      setAiMockTests((prev) =>
        prev.map((t) =>
          t.id === test.id
            ? { ...t, status: "Completed", bestScore: Math.max(t.bestScore || 0, generatedScore) }
            : t
        )
      );
    }, 1200);
  };

  const handleSubmitAssignmentWork = (assignmentId: string) => {
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === assignmentId ? { ...a, status: "Submitted - Under Faculty Review" } : a
      )
    );
    setSelectedAssignment(null);
    setSubmissionSuccess("Coursework uploaded successfully! Queued for Faculty Evaluation by Dr. Evelyn Reed.");
    setTimeout(() => setSubmissionSuccess(null), 5000);
  };

  return (
    <Card className="border border-slate-200/90 shadow-sm bg-white dark:bg-slate-900">
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-teal-600" />
              <span>Assessments, Mock Tests & Coursework Hub</span>
            </CardTitle>
            <CardDescription>
              AI-evaluated mock tests for instant feedback + Faculty-evaluated formal assignments
            </CardDescription>
          </div>

          {/* Tab buttons */}
          <div className="flex items-center rounded-lg bg-slate-100 p-1 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setActiveTab("ai-tests")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all",
                activeTab === "ai-tests"
                  ? "bg-white text-teal-700 shadow-xs dark:bg-slate-900 dark:text-teal-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
              )}
            >
              <Bot className="h-3.5 w-3.5 text-teal-600" />
              <span>AI Mock Tests (Auto Evaluated)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("assignments")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all",
                activeTab === "assignments"
                  ? "bg-white text-sky-700 shadow-xs dark:bg-slate-900 dark:text-sky-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
              )}
            >
              <UserCheck className="h-3.5 w-3.5 text-sky-600" />
              <span>Coursework (Faculty Evaluated)</span>
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {submissionSuccess && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{submissionSuccess}</span>
          </div>
        )}

        {/* TAB 1: AI MOCK TESTS */}
        {activeTab === "ai-tests" && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {aiMockTests.map((test) => (
                <div
                  key={test.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-teal-300 transition-all bg-white dark:bg-slate-800 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Badge variant="teal" className="text-[10px] font-bold">
                        {test.subject}
                      </Badge>
                      <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                        <Bot className="h-3 w-3 text-teal-600" />
                        AI Auto-Evaluated
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {test.title}
                    </h4>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{test.questionsCount} Questions</span>
                      <span>•</span>
                      <span>Difficulty: {test.difficulty}</span>
                      {test.bestScore && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-600 font-bold">
                            Best: {test.bestScore}/100
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Instant Feedback & Risk Analysis
                    </span>
                    {test.status === "Completed" ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Completed • No Retest
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleRunAiMockTest(test)}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs gap-1.5 h-8"
                      >
                        <Play className="h-3 w-3 fill-current" />
                        <span>Start Test</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Test result modal */}
            {selectedMockTest && (
              <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/70 dark:bg-teal-950/30 text-teal-950 dark:text-teal-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-teal-600" />
                    <span className="text-xs font-bold">
                      AI Instant Evaluation: {selectedMockTest.title}
                    </span>
                  </div>
                  {testScore && (
                    <Badge variant="emerald" className="font-bold text-xs">
                      Score: {testScore} / 100
                    </Badge>
                  )}
                </div>

                {isTestSubmitting ? (
                  <p className="text-xs text-teal-700 animate-pulse">
                    AI Agent is verifying your diagnostic answers and compiling report...
                  </p>
                ) : (
                  <div className="text-xs space-y-1">
                    <p>
                      <strong>Evaluation Verdict:</strong> High accuracy in core algorithmic complexity. Minor edge case gap in graph cycle detection.
                    </p>
                    <p className="text-teal-700 font-medium">
                      +3.5 pts added to Placement Readiness score. Keep up the consistent pace!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: COURSEWORK & ASSIGNMENTS (FACULTY EVALUATED ONLY) */}
        {activeTab === "assignments" && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 text-xs text-sky-800 flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-sky-600 shrink-0" />
              <span>
                <strong>Academic Governance Rule:</strong> While assignments can be initiated by faculty or AI agents, all formal grading, rubric checks, and credit validations are conducted strictly by <strong>Faculty Mentors</strong>.
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {assignments.map((asn) => (
                <div key={asn.id} className="py-3.5 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {asn.title}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {asn.subject}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>Initiated by: <strong className="text-slate-700">{asn.creator}</strong></span>
                        <span>•</span>
                        <span className="text-sky-700 font-semibold">{asn.evaluator}</span>
                        <span>•</span>
                        <span>Due: {asn.dueDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant={
                          asn.status === "Graded by Faculty"
                            ? "emerald"
                            : asn.status === "Submitted - Under Faculty Review"
                            ? "teal"
                            : "amber"
                        }
                        className="text-xs font-semibold"
                      >
                        {asn.status}
                      </Badge>

                      {asn.status === "Pending Submission" && (
                        <Button
                          size="sm"
                          onClick={() => setSelectedAssignment(asn)}
                          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold h-8 gap-1.5"
                        >
                          <Upload className="h-3 w-3" />
                          <span>Submit Work</span>
                        </Button>
                      )}
                    </div>
                  </div>

                  {asn.status === "Graded by Faculty" && (
                    <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span>Faculty Evaluator Grade: {asn.facultyScore}</span>
                        <span className="text-[10px] text-emerald-700 font-normal">Dr. Evelyn Reed</span>
                      </div>
                      <p className="text-[11px] text-emerald-800 italic">
                        &quot;{asn.facultyRemarks}&quot;
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Assignment Submit Modal */}
            {selectedAssignment && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/50 backdrop-blur-xs p-4">
                <Card className="w-full max-w-md bg-white border border-slate-200 shadow-2xl p-5 space-y-3">
                  <h4 className="text-sm font-bold text-slate-900">
                    Submit Work for Faculty Evaluation
                  </h4>
                  <p className="text-xs text-slate-500">
                    Assignment: <strong>{selectedAssignment.title}</strong>
                  </p>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      GitHub Repository / Document URL:
                    </label>
                    <input
                      type="url"
                      defaultValue="https://github.com/alex-mercer/cs603-raft-consensus"
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Submission Notes for Dr. Evelyn Reed:
                    </label>
                    <textarea
                      rows={2}
                      defaultValue="Implemented leader election with randomized timeouts and log replication tests pass 100%."
                      className="w-full text-xs p-2 rounded-lg border border-slate-200"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedAssignment(null)}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSubmitAssignmentWork(selectedAssignment.id)}
                      className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold"
                    >
                      Submit for Faculty Evaluation
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

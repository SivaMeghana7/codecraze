"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageSquareHeart,
  UserCheck,
  Star,
  CheckCircle2,
  Calendar,
  Send,
  HelpCircle,
  Clock,
  Sparkles,
} from "lucide-react";

export const StudentFeedbackView: React.FC = () => {
  const [feedbackInput, setFeedbackInput] = useState("");
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const facultyReviews = [
    {
      id: "rev-1",
      facultyName: "Dr. Evelyn Reed",
      role: "Faculty Mentor & OS Course Lead",
      date: "Oct 04, 2026",
      rating: 4.8,
      comment:
        "Alex demonstrates impressive conceptual clarity in algorithmic thinking and systems architecture. Needs to be more consistent with CS603 morning attendance to ensure eligibility for campus placement drives.",
      actionItem: "Attend 5 consecutive OS lectures & complete concurrency drill.",
    },
    {
      id: "rev-2",
      facultyName: "Prof. Rajesh Sharma",
      role: "Database Systems Head",
      date: "Sep 22, 2026",
      rating: 5.0,
      comment:
        "Top performer in SQL query optimization and B+ tree indexing lab. Recommended for campus technical teaching assistantship.",
      actionItem: "Continue leading peer study group on database internals.",
    },
  ];

  const satisfactionSurveys = [
    { title: "Mid-Term Course Experience Survey (Sem 6)", status: "Completed", date: "Sep 2026", score: "4.6 / 5.0" },
    { title: "Campus Placement Cell Preparation Feedback", status: "Completed", date: "Aug 2026", score: "4.2 / 5.0" },
    { title: "Faculty Mentorship Quality Feedback", status: "Pending Review", date: "Oct 2026", score: "Active" },
  ];

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackInput.trim()) return;
    setSubmittedMessage("Feedback transmitted directly to Academic Mentorship Council & Faculty Lead!");
    setFeedbackInput("");
    setTimeout(() => setSubmittedMessage(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-teal-950 via-slate-900 to-navy-950 p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-teal-300 border border-teal-500/30">
                <MessageSquareHeart className="h-3.5 w-3.5" />
                <span>360° Mentor & Student Feedback Loop</span>
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Feedback & Mentorship Notes</h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              Transparent review notes from faculty mentors and institutional course satisfaction metrics. Mentorship interventions are fed into the Student Success Intelligence engine.
            </p>
          </div>
        </div>
      </div>

      {submittedMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{submittedMessage}</span>
        </div>
      )}

      {/* Faculty Reviews */}
      <Card className="border border-slate-200 bg-white dark:bg-slate-900">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-base flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-teal-600" />
            <span>Faculty Mentor Observation Records</span>
          </CardTitle>
          <CardDescription>
            Official faculty evaluations and actionable guidance
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 space-y-3">
          {facultyReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-4 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 space-y-2.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {rev.facultyName}
                  </h4>
                  <p className="text-xs text-slate-500">{rev.role} • {rev.date}</p>
                </div>

                <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-amber-800 text-xs font-bold">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  <span>{rev.rating}</span>
                </div>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed italic">
                &ldquo;{rev.comment}&rdquo;
              </p>

              <div className="p-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/30 text-teal-900 dark:text-teal-200 text-xs flex items-center gap-2 border border-teal-200/60">
                <Sparkles className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                <span>
                  <strong>Action Recommended:</strong> {rev.actionItem}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Satisfaction Surveys & Submit Feedback */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-slate-200 bg-white dark:bg-slate-900">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-bold">Course & Department Surveys</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            {satisfactionSurveys.map((sv, i) => (
              <div
                key={i}
                className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-semibold text-slate-800">{sv.title}</p>
                  <span className="text-[11px] text-slate-400">{sv.date}</span>
                </div>
                <Badge variant={sv.status === "Completed" ? "emerald" : "teal"} className="text-[10px] font-bold">
                  {sv.score}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Submit Direct Feedback */}
        <Card className="border border-slate-200 bg-white dark:bg-slate-900">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-bold">Submit Feedback / Grievance to Mentor</CardTitle>
            <CardDescription className="text-xs">
              Direct confidential channel to your assigned faculty advisor
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <form onSubmit={handleSendFeedback} className="space-y-3">
              <textarea
                required
                rows={3}
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                placeholder="Share academic concerns, lab resource requests, or timetable conflicts..."
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs focus:outline-teal-600"
              />
              <Button
                type="submit"
                size="sm"
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs gap-1.5 w-full"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Submit Confidential Feedback</span>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

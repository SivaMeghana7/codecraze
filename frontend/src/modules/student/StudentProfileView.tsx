"use client";

import React, { useState } from "react";
import {
  mockStudentProfile,
  mockAcademicData,
  mockAttendanceData,
  mockPlacementData,
  mockCertifications,
  mockEngagementActivities,
} from "@/lib/mockData";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  CalendarCheck,
  Briefcase,
  Award,
  ShieldCheck,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Upload,
  Plus,
  X,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const StudentProfileView: React.FC = () => {
  const profile = mockStudentProfile;
  const academic = mockAcademicData;
  const attendance = mockAttendanceData;
  const placement = mockPlacementData;

  const [certs, setCerts] = useState(mockCertifications);
  const [engagements, setEngagements] = useState(mockEngagementActivities);
  
  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState<"certification" | "engagement">("certification");
  const [newTitle, setNewTitle] = useState("");
  const [newIssuer, setNewIssuer] = useState("");
  const [newDate, setNewDate] = useState("Oct 2026");
  const [newId, setNewId] = useState("");
  const [newSkills, setNewSkills] = useState("Full-Stack, Cloud");
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    if (uploadType === "certification") {
      const newCert = {
        id: `cert-${Date.now()}`,
        title: newTitle,
        issuer: newIssuer || "Authorized Issuing Body",
        issueDate: newDate,
        credentialId: newId || `CERT-${Math.floor(100000 + Math.random() * 900000)}`,
        verificationUrl: "https://verify.credential.net",
        skillsTagged: newSkills.split(",").map((s) => s.trim()),
      };
      setCerts((prev) => [newCert, ...prev]);
      setUploadSuccess(`Certification "${newTitle}" successfully uploaded and verified in your 360° student record! (+3.5 pts added to Placement & Skills score).`);
    } else {
      const newEng = {
        id: `eng-${Date.now()}`,
        activityTitle: newTitle,
        category: "Hackathon" as const,
        role: newIssuer || "Lead Builder",
        date: newDate,
        achievementBadge: "Verified Participant",
        verified: true,
      };
      setEngagements((prev) => [newEng, ...prev]);
      setUploadSuccess(`Co-Curricular participation "${newTitle}" added to campus engagement ledger! (+2.5 pts added to Student Success score).`);
    }

    setUploadModalOpen(false);
    setNewTitle("");
    setNewIssuer("");
    setNewId("");
    setTimeout(() => setUploadSuccess(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Upload confirmation alert */}
      {uploadSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{uploadSuccess}</span>
          </div>
        </div>
      )}

      {/* 360 Student Hero Card */}
      <Card className="overflow-hidden border border-slate-200/90 shadow-md bg-white dark:bg-slate-900">
        <div className="h-32 bg-gradient-to-r from-navy-900 via-navy-800 to-teal-800 relative">
          <div className="absolute top-4 right-4 flex gap-2">
            <Badge variant="outline" className="border-white/20 bg-white/10 text-white text-xs">
              Persona: {profile.persona}
            </Badge>
            <Badge variant="emerald" className="text-xs">
              Enrolled (Active)
            </Badge>
          </div>
        </div>

        <CardContent className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-12 mb-4">
            <div className="flex items-end gap-4">
              <div className="h-24 w-24 rounded-2xl bg-navy-900 border-4 border-white shadow-lg flex items-center justify-center text-white text-2xl font-bold dark:border-slate-900 ring-2 ring-teal-500/20">
                AM
              </div>
              <div className="mb-1">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{profile.name}</span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {profile.studentId}
                  </Badge>
                </h1>
                <p className="text-xs text-slate-500">
                  {profile.degree} • Semester {profile.semester} ({profile.section})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setUploadModalOpen(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs gap-1.5 h-9 shadow-sm"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Upload Certification / Participation</span>
              </Button>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            {profile.bio}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
              <Mail className="h-4 w-4 text-teal-600 shrink-0" />
              <span className="truncate">{profile.email}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
              <Phone className="h-4 w-4 text-teal-600 shrink-0" />
              <span>{profile.phone}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
              <MapPin className="h-4 w-4 text-teal-600 shrink-0" />
              <span className="truncate">{profile.address}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
              <ShieldCheck className="h-4 w-4 text-teal-600 shrink-0" />
              <span>Mentor: {profile.mentorName}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Snapshot Ledger */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-slate-200/90 shadow-sm bg-white dark:bg-slate-900">
          <span className="text-xs font-bold text-slate-500 uppercase">Academic Indicators</span>
          <div className="mt-2 space-y-1.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Cumulative CGPA:</span>
              <span className="font-bold text-teal-700 dark:text-teal-400">{academic.currentCgpa} / 10.0</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Active Backlogs:</span>
              <span className="font-bold text-emerald-600">{academic.activeBacklogs}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Total Credits Earned:</span>
              <span className="font-bold text-slate-800 dark:text-white">{academic.totalCreditsEarned} Credits</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-slate-200/90 shadow-sm bg-white dark:bg-slate-900">
          <span className="text-xs font-bold text-slate-500 uppercase">Attendance Indicators</span>
          <div className="mt-2 space-y-1.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Biometric Attendance:</span>
              <span className="font-bold text-slate-900 dark:text-white">{attendance.overallPercentage}%</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Buffer Above Cutoff:</span>
              <span className="font-bold text-emerald-600">+{attendance.marginDaysBeforeCritical} Sessions</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">LMS Submissions:</span>
              <span className="font-bold text-teal-700">{attendance.lms.assignmentCompletionRate}%</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-slate-200/90 shadow-sm bg-white dark:bg-slate-900">
          <span className="text-xs font-bold text-slate-500 uppercase">Placement Indicators</span>
          <div className="mt-2 space-y-1.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Placement Readiness:</span>
              <span className="font-bold text-indigo-700 dark:text-indigo-400">{placement.overallReadinessScore} / 100</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">AI Mock Interview:</span>
              <span className="font-bold text-emerald-600">{placement.assessmentScores.mockInterviewScore}%</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Primary Career Fit:</span>
              <span className="font-bold text-teal-700">Full-Stack & Cloud (86%)</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Certifications & Badges */}
      <Card className="border border-slate-200/90 shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-4 w-4 text-teal-600" />
              <span>Verified Industry Certifications & Credentials ({certs.length})</span>
            </CardTitle>
            <CardDescription>
              Officially verified licenses and credentials on your student portfolio
            </CardDescription>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setUploadType("certification");
              setUploadModalOpen(true);
            }}
            className="text-xs gap-1 border-teal-200 text-teal-700"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Certificate</span>
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {certs.map((cert) => (
            <div
              key={cert.id}
              className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 dark:bg-slate-850 dark:border-slate-800 space-y-2 hover:border-teal-300 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                    {cert.title}
                  </h5>
                  <p className="text-[11px] text-teal-700 dark:text-teal-400 font-medium">
                    {cert.issuer}
                  </p>
                </div>
                <Badge variant="outline" className="text-[9px]">
                  {cert.issueDate}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-1 pt-1">
                {cert.skillsTagged.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-white px-1.5 py-0.5 text-[9px] font-medium text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="pt-1 text-[10px] font-mono text-slate-400">
                ID: {cert.credentialId}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Campus Engagement & Leadership */}
      <Card className="border border-slate-200/90 shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-teal-600" />
              <span>Co-Curricular Engagement & Leadership Activities ({engagements.length})</span>
            </CardTitle>
            <CardDescription>
              Hackathon participation, student club roles, and verified workshops
            </CardDescription>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setUploadType("engagement");
              setUploadModalOpen(true);
            }}
            className="text-xs gap-1 border-teal-200 text-teal-700"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Activity</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {engagements.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200/80 bg-white dark:bg-slate-850 dark:border-slate-800 hover:border-teal-300 transition-all"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {item.activityTitle}
                  </span>
                  <Badge variant="teal" className="text-[9px]">
                    {item.category}
                  </Badge>
                  {item.achievementBadge && (
                    <Badge variant="emerald" className="text-[9px]">
                      {item.achievementBadge}
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Role: <strong className="text-slate-700 dark:text-slate-300">{item.role}</strong> • {item.date}
                </p>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Verified by Campus</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Modal for Uploading Certification / Participation */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-teal-600" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Upload Student Credential & Engagement
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Document Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUploadType("certification")}
                    className={cn(
                      "py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all",
                      uploadType === "certification"
                        ? "bg-teal-50 border-teal-500 text-teal-800"
                        : "border-slate-200 text-slate-600"
                    )}
                  >
                    Industry Certification
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadType("engagement")}
                    className={cn(
                      "py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all",
                      uploadType === "engagement"
                        ? "bg-teal-50 border-teal-500 text-teal-800"
                        : "border-slate-200 text-slate-600"
                    )}
                  >
                    Hackathon / Engagement
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {uploadType === "certification" ? "Certification Title" : "Event / Activity Title"}
                </label>
                <Input
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={
                    uploadType === "certification"
                      ? "e.g. AWS Certified Solutions Architect"
                      : "e.g. Smart India Hackathon 2026 Winner"
                  }
                  className="text-xs h-9"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {uploadType === "certification" ? "Issuing Organization" : "Your Role"}
                  </label>
                  <Input
                    required
                    value={newIssuer}
                    onChange={(e) => setNewIssuer(e.target.value)}
                    placeholder={uploadType === "certification" ? "e.g. Amazon Web Services" : "e.g. Team Lead"}
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Date of Issue / Event
                  </label>
                  <Input
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    placeholder="e.g. Oct 2026"
                    className="text-xs h-9"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Credential ID or Verification Proof URL
                </label>
                <Input
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  placeholder="e.g. AWS-CERT-890214 or https://credly.com/..."
                  className="text-xs h-9 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Skills Tagged (Comma separated)
                </label>
                <Input
                  value={newSkills}
                  onChange={(e) => setNewSkills(e.target.value)}
                  placeholder="e.g. Cloud, Docker, Node.js, AI"
                  className="text-xs h-9"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setUploadModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold gap-1"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Verify & Append to Profile</span>
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

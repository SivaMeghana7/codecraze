"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { RoleGuard } from "@/components/shared/RoleGuard";
import {
  Users,
  AlertTriangle,
  ShieldCheck,
  Mail,
  ArrowUpRight,
  Search,
  Filter,
  Layers,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  Calendar,
  Clock,
  Send,
  UserCheck,
  FileText,
  Plus,
  Upload,
  BookOpen,
  Award,
  IdCard,
  Check,
  X,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { StudentSegmentationCard } from "@/components/student/StudentSegmentationCard";

interface StudentCohortMember {
  id: string;
  name: string;
  cgpa: number;
  attendance: number;
  acadRisk: "Low" | "Moderate" | "High";
  placeRisk: "Low" | "Moderate" | "High";
  persona: string;
  lastActive: string;
  notes: string;
  semester: string;
  backlogs: number;
  placementScore: number;
}

interface FacultyAssessment {
  id: string;
  title: string;
  subject: string;
  type: "Multiple Choice (MCQ)" | "Coding Mock Test" | "Remedial Problem Set";
  startDate: string;
  deadline: string;
  totalMarks: number;
  submissionsCount: number;
  status: "Active" | "Closed";
  personalizedDetails?: {
    question?: string;
    options?: { A: string; B: string; C: string; D: string };
    correctOption?: "A" | "B" | "C" | "D";
    codingTitle?: string;
    codingLanguage?: string;
    codingStatement?: string;
    sampleInput?: string;
    sampleOutput?: string;
    constraints?: string;
  };
  submissions: {
    studentId: string;
    studentName: string;
    submittedAt: string;
    score: number;
    status: "Graded" | "Evaluated" | "Under Review";
    facultyFeedback?: string;
  }[];
}

export default function FacultyPage() {
  const [activeTab, setActiveTab] = useState<"cohort" | "lookup" | "assessments">("cohort");

  // Cohort state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRisk, setFilterRisk] = useState<string>("all");
  const [filterSegment, setFilterSegment] = useState<string>("all");
  const [selectedStudentForAction, setSelectedStudentForAction] = useState<StudentCohortMember | null>(null);
  const [interventionSuccess, setInterventionSuccess] = useState<string | null>(null);

  // Student 360 Lookup State
  const [lookupRegNo, setLookupRegNo] = useState("SCI-2024-CS084");
  const [searchedStudent, setSearchedStudent] = useState<StudentCohortMember | null>(null);

  // Assessments state
  const [assessments, setAssessments] = useState<FacultyAssessment[]>([
    {
      id: "ASM-101",
      title: "CS603 Virtual Memory & Paging Mechanics Diagnostic",
      subject: "Operating Systems (CS603)",
      type: "Multiple Choice (MCQ)",
      startDate: "Oct 01, 2026",
      deadline: "Oct 15, 2026",
      totalMarks: 50,
      submissionsCount: 28,
      status: "Active",
      personalizedDetails: {
        question: "Which CPU scheduling algorithm prevents starvation while optimizing average turnaround time?",
        options: {
          A: "Round Robin with Aging Dynamic Quantum",
          B: "Shortest Job First without preemption",
          C: "First Come First Serve",
          D: "Static Priority Scheduling",
        },
        correctOption: "A",
      },
      submissions: [
        {
          studentId: "SCI-2024-CS084",
          studentName: "Alex Mercer",
          submittedAt: "Oct 04, 2026 14:20",
          score: 44,
          status: "Evaluated",
          facultyFeedback: "Strong mastery of virtual page replacement algorithms. Revise multi-level page table walk overhead.",
        },
        {
          studentId: "SCI-2024-CS012",
          studentName: "Priya Sharma",
          submittedAt: "Oct 02, 2026 11:05",
          score: 48,
          status: "Evaluated",
          facultyFeedback: "Near perfect score. Exceptional clarity on TLB hit ratio derivations and hardware page faults.",
        },
        {
          studentId: "SCI-2024-CS089",
          studentName: "Dev Patel",
          submittedAt: "Oct 06, 2026 17:40",
          score: 38,
          status: "Under Review",
          facultyFeedback: "Good attempt; needs tutorial revision on Belady's anomaly in FIFO page replacement.",
        },
      ],
    },
    {
      id: "ASM-102",
      title: "Database Indexing & B+ Tree Concurrency Drill",
      subject: "Database Management (CS602)",
      type: "Coding Mock Test",
      startDate: "Oct 05, 2026",
      deadline: "Oct 22, 2026",
      totalMarks: 100,
      submissionsCount: 22,
      status: "Active",
      personalizedDetails: {
        codingTitle: "Implement B+ Tree Node Split & Latch Crabbing",
        codingLanguage: "Python 3.11",
        codingStatement: "Implement a thread-safe B+ tree leaf node splitting routine using reader-writer locks and latch crabbing.",
        sampleInput: "tree = BPlusTree(order=4); [tree.insert(k, v) for k, v in [(10,'A'),(20,'B'),(30,'C'),(40,'D')]]",
        sampleOutput: "Root node split: parent=[30], left=[10,20], right=[30,40]",
        constraints: "O(log N) search and insert, thread-safe with 16 concurrent workers.",
      },
      submissions: [
        {
          studentId: "SCI-2024-CS084",
          studentName: "Alex Mercer",
          submittedAt: "Oct 07, 2026 19:15",
          score: 88,
          status: "Evaluated",
          facultyFeedback: "Excellent latch crabbing implementation. Ensure edge case for empty root under high concurrency is guarded.",
        },
        {
          studentId: "SCI-2024-CS045",
          studentName: "Rohan Varma",
          submittedAt: "Oct 08, 2026 09:30",
          score: 62,
          status: "Under Review",
          facultyFeedback: "Basic node split functions properly, but deadlocks occurred under concurrent stress test. Please attend lab hours.",
        },
      ],
    },
  ]);

  // New assessment modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("Operating Systems (CS603)");
  const [newType, setNewType] = useState<"Multiple Choice (MCQ)" | "Coding Mock Test">("Multiple Choice (MCQ)");
  const [newStartDate, setNewStartDate] = useState("Oct 10, 2026");
  const [newDeadline, setNewDeadline] = useState("Oct 25, 2026");
  const [newMarks, setNewMarks] = useState(50);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  // Personalized MCQ Question Builder State
  const [mcqQuestion, setMcqQuestion] = useState("Which synchronization mechanism prevents race conditions without busy waiting?");
  const [mcqOptionA, setMcqOptionA] = useState("Counting Semaphore with Block/Wakeup sleep queue");
  const [mcqOptionB, setMcqOptionB] = useState("Spinlock with Test-and-Set instruction");
  const [mcqOptionC, setMcqOptionC] = useState("Peterson's Algorithm with while(turn==1) loop");
  const [mcqOptionD, setMcqOptionD] = useState("Disabling hardware interrupts in user mode");
  const [mcqCorrect, setMcqCorrect] = useState<"A" | "B" | "C" | "D">("A");

  // Personalized Coding Mock Test Builder State
  const [codingProblemTitle, setCodingProblemTitle] = useState("Thread-Safe Concurrent Circular Buffer");
  const [codingLanguage, setCodingLanguage] = useState("Python 3.11");
  const [codingStatement, setCodingStatement] = useState("Write a thread-safe circular buffer with mutex locks and condition variables supporting put() and get() with bounded capacity.");
  const [codingSampleInput, setCodingSampleInput] = useState("buf = CircularBuffer(size=3); buf.put('A'); buf.put('B'); buf.get()");
  const [codingSampleOutput, setCodingSampleOutput] = useState("'A'");
  const [codingConstraints, setCodingConstraints] = useState("O(1) operations, zero memory leaks, supports 32 concurrent threads");

  // Faculty Evaluation of Student Test State
  const [evaluatingSubmission, setEvaluatingSubmission] = useState<{
    asmId: string;
    asmTitle: string;
    studentId: string;
    studentName: string;
    currentScore: number;
    totalMarks: number;
    submittedAt: string;
    feedback: string;
  } | null>(null);
  const [evalScoreInput, setEvalScoreInput] = useState(40);
  const [evalFeedbackInput, setEvalFeedbackInput] = useState("");
  const [evaluationSuccess, setEvaluationSuccess] = useState<string | null>(null);

  const initialStudents: StudentCohortMember[] = [
    {
      id: "SCI-2024-CS084",
      name: "Alex Mercer",
      cgpa: 8.14,
      attendance: 79.2,
      acadRisk: "Low",
      placeRisk: "Low",
      persona: "Unpolished Gem",
      lastActive: "15 mins ago",
      notes: "CS603 attendance dipped to 71.4%. Excellent DSA coding performance.",
      semester: "6th Semester (CS-B)",
      backlogs: 0,
      placementScore: 78,
    },
    {
      id: "SCI-2024-CS012",
      name: "Priya Sharma",
      cgpa: 9.20,
      attendance: 94.0,
      acadRisk: "Low",
      placeRisk: "Low",
      persona: "Consistent Achiever",
      lastActive: "1 hour ago",
      notes: "Top 5% in cohort. Completed AWS certification. Ready for Tier-1 placements.",
      semester: "6th Semester (CS-B)",
      backlogs: 0,
      placementScore: 92,
    },
    {
      id: "SCI-2024-CS045",
      name: "Rohan Varma",
      cgpa: 6.45,
      attendance: 68.5,
      acadRisk: "High",
      placeRisk: "High",
      persona: "Disengaged",
      lastActive: "4 days ago",
      notes: "Missed 6 consecutive operating systems lectures. Academic probation flag.",
      semester: "6th Semester (CS-B)",
      backlogs: 2,
      placementScore: 54,
    },
    {
      id: "SCI-2024-CS089",
      name: "Dev Patel",
      cgpa: 7.30,
      attendance: 74.0,
      acadRisk: "Moderate",
      placeRisk: "Moderate",
      persona: "Resilient Try-Hard",
      lastActive: "3 hours ago",
      notes: "Struggling in Dynamic Programming midterm; attending remedial tutorials.",
      semester: "6th Semester (CS-B)",
      backlogs: 0,
      placementScore: 68,
    },
    {
      id: "SCI-2024-CS104",
      name: "Ananya Iyer",
      cgpa: 8.65,
      attendance: 88.5,
      acadRisk: "Low",
      placeRisk: "Low",
      persona: "Consistent Achiever",
      lastActive: "2 hours ago",
      notes: "Leading hackathon submission. On track for senior placement drives.",
      semester: "6th Semester (CS-B)",
      backlogs: 0,
      placementScore: 86,
    },
    {
      id: "SCI-2024-CS119",
      name: "Vikram Malhotra",
      cgpa: 6.92,
      attendance: 71.0,
      acadRisk: "High",
      placeRisk: "Moderate",
      persona: "Disengaged",
      lastActive: "2 days ago",
      notes: "Low LMS quiz submission rate. In danger of internal exam debarment.",
      semester: "6th Semester (CS-B)",
      backlogs: 1,
      placementScore: 62,
    },
  ];

  // Initialize searched student with default on load
  React.useEffect(() => {
    setSearchedStudent(initialStudents[0]);
  }, []);

  const handleSearchStudentLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const query = lookupRegNo.trim().toLowerCase();
    const found = initialStudents.find(
      (s) => s.id.toLowerCase() === query || s.name.toLowerCase().includes(query)
    );
    if (found) {
      setSearchedStudent(found);
    } else {
      alert(`No student record found matching registration number "${lookupRegNo}". Try SCI-2024-CS084, SCI-2024-CS012, or SCI-2024-CS045.`);
    }
  };

  const handleCreateAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created: FacultyAssessment = {
      id: `ASM-${Math.floor(100 + Math.random() * 900)}`,
      title: newTitle,
      subject: newSubject,
      type: newType,
      startDate: newStartDate,
      deadline: newDeadline,
      totalMarks: newMarks,
      submissionsCount: 0,
      status: "Active",
      personalizedDetails:
        newType === "Multiple Choice (MCQ)"
          ? {
              question: mcqQuestion,
              options: {
                A: mcqOptionA,
                B: mcqOptionB,
                C: mcqOptionC,
                D: mcqOptionD,
              },
              correctOption: mcqCorrect,
            }
          : {
              codingTitle: codingProblemTitle,
              codingLanguage,
              codingStatement,
              sampleInput: codingSampleInput,
              sampleOutput: codingSampleOutput,
              constraints: codingConstraints,
            },
      submissions: [
        {
          studentId: "SCI-2024-CS084",
          studentName: "Alex Mercer",
          submittedAt: "Just now",
          score: Math.round(newMarks * 0.84),
          status: "Under Review",
          facultyFeedback: "Automated preliminary submission received. Awaiting faculty evaluation.",
        },
      ],
    };

    setAssessments([created, ...assessments]);
    setCreateModalOpen(false);
    setNewTitle("");
    setCreateSuccess(`Assessment "${newTitle}" with personalized questions published! Students can now attempt before ${newDeadline}.`);
    setTimeout(() => setCreateSuccess(null), 6000);
  };

  const handleOpenEvaluateModal = (asm: FacultyAssessment, sub: any) => {
    setEvaluatingSubmission({
      asmId: asm.id,
      asmTitle: asm.title,
      studentId: sub.studentId,
      studentName: sub.studentName,
      currentScore: sub.score,
      totalMarks: asm.totalMarks,
      submittedAt: sub.submittedAt,
      feedback: sub.facultyFeedback || "",
    });
    setEvalScoreInput(sub.score);
    setEvalFeedbackInput(sub.facultyFeedback || "");
  };

  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatingSubmission) return;

    setAssessments((prev) =>
      prev.map((asm) => {
        if (asm.id !== evaluatingSubmission.asmId) return asm;
        return {
          ...asm,
          submissions: asm.submissions.map((sub) => {
            if (sub.studentId !== evaluatingSubmission.studentId) return sub;
            return {
              ...sub,
              score: evalScoreInput,
              status: "Evaluated",
              facultyFeedback: evalFeedbackInput,
            };
          }),
        };
      })
    );

    setEvaluationSuccess(
      `Evaluation saved for ${evaluatingSubmission.studentName}: Score ${evalScoreInput}/${evaluatingSubmission.totalMarks} with personalized faculty feedback.`
    );
    setEvaluatingSubmission(null);
    setTimeout(() => setEvaluationSuccess(null), 5000);
  };

  const filteredStudents = initialStudents.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk =
      filterRisk === "all" ||
      (filterRisk === "high" && (s.acadRisk === "High" || s.placeRisk === "High")) ||
      (filterRisk === "moderate" && (s.acadRisk === "Moderate" || s.placeRisk === "Moderate")) ||
      (filterRisk === "low" && s.acadRisk === "Low" && s.placeRisk === "Low");
    const matchesSegment =
      filterSegment === "all" ||
      s.persona.toLowerCase().includes(filterSegment.toLowerCase());

    return matchesSearch && matchesRisk && matchesSegment;
  });

  const handleTriggerIntervention = (student: StudentCohortMember) => {
    setSelectedStudentForAction(student);
  };

  const handleConfirmIntervention = (type: string) => {
    if (!selectedStudentForAction) return;
    setInterventionSuccess(`Intervention successfully logged for ${selectedStudentForAction.name}: "${type}". Updated in Closed-Loop tracking.`);
    setSelectedStudentForAction(null);
    setTimeout(() => setInterventionSuccess(null), 5000);
  };

  return (
    <RoleGuard allowedRoles={["faculty", "admin"]}>
      <div className="space-y-6">
        {/* Mentor Header */}
        <div className="rounded-2xl bg-gradient-to-r from-sky-900 via-navy-900 to-slate-900 p-6 md:p-8 text-white shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/20 px-3 py-1 text-xs font-semibold text-sky-300 border border-sky-500/30">
              <Users className="h-3.5 w-3.5" />
              <span>Dr. Evelyn Reed • Computer Science Cohort B</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              Faculty Mentorship, Roster & Assessments
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Manage mentee cohorts, publish assessments with start/end deadlines, inspect individual student records by registration number, and track test outcomes.
            </p>
          </div>
        </div>

        {/* Success toast notification */}
        {interventionSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{interventionSuccess}</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              Logged
            </span>
          </div>
        )}

        {createSuccess && (
          <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-center gap-2 shadow-xs animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
            <span className="font-semibold">{createSuccess}</span>
          </div>
        )}

        {/* 3 Faculty Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("cohort")}
            className={cn(
              "px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2",
              activeTab === "cohort"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <Users className="h-4 w-4" />
            <span>Mentee Cohort Roster ({initialStudents.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("lookup")}
            className={cn(
              "px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2",
              activeTab === "lookup"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <IdCard className="h-4 w-4 text-sky-500" />
            <span>Search Student by Reg Number</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("assessments")}
            className={cn(
              "px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2",
              activeTab === "assessments"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <FileText className="h-4 w-4 text-teal-500" />
            <span>Assessment Publisher & Test Records ({assessments.length})</span>
          </button>
        </div>

        {/* TAB 1: COHORT ROSTER */}
        {activeTab === "cohort" && (
          <div className="space-y-4">
            {/* Faculty Summary KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 border-slate-200/90 shadow-sm bg-white">
                <span className="text-xs text-slate-500 font-semibold uppercase">Assigned Mentees</span>
                <p className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">32</p>
                <span className="text-[10px] text-teal-600 font-medium">CS-B 3rd Year Cohort</span>
              </Card>
              <Card className="p-4 border-slate-200/90 shadow-sm bg-white">
                <span className="text-xs text-slate-500 font-semibold uppercase">At-Risk Alerts</span>
                <p className="text-2xl md:text-3xl font-bold text-rose-600 mt-1">4</p>
                <span className="text-[10px] text-rose-600 font-medium">Requires Immediate Nudge</span>
              </Card>
              <Card className="p-4 border-slate-200/90 shadow-sm bg-white">
                <span className="text-xs text-slate-500 font-semibold uppercase">Active Interventions</span>
                <p className="text-2xl md:text-3xl font-bold text-sky-700 mt-1">6</p>
                <span className="text-[10px] text-sky-600 font-medium">3 Closed in Last 14 Days</span>
              </Card>
              <Card className="p-4 border-slate-200/90 shadow-sm bg-white">
                <span className="text-xs text-slate-500 font-semibold uppercase">Cohort Avg Attendance</span>
                <p className="text-2xl md:text-3xl font-bold text-teal-700 mt-1">81.4%</p>
                <span className="text-[10px] text-emerald-600 font-medium">+2.1% Above Min Benchmark</span>
              </Card>
            </div>

            {/* Bonus Credit: Institutional Student Segmentation Pie Chart Engine */}
            <StudentSegmentationCard />

            {/* Student Roster Section */}
            <Card className="border border-slate-200/90 shadow-sm bg-white">
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4 text-sky-600" />
                      <span>Assigned Mentee Roster</span>
                    </CardTitle>
                    <CardDescription>
                      Filter by multi-variable risk attribution and persona segmentation
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-semibold text-slate-700 bg-slate-50">
                      {initialStudents.length} Assigned Mentees
                    </Badge>
                  </div>
                </div>

                {/* Filter controls */}
                <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search mentee name or student ID..."
                      className="pl-8 text-xs h-9 w-full"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 w-full sm:w-auto">
                    <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <button
                      type="button"
                      onClick={() => setFilterRisk("all")}
                      className={cn(
                        "px-2.5 py-1 text-xs rounded-lg transition-colors font-medium",
                        filterRisk === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      )}
                    >
                      All ({initialStudents.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterRisk("high")}
                      className={cn(
                        "px-2.5 py-1 text-xs rounded-lg transition-colors font-medium",
                        filterRisk === "high" ? "bg-rose-600 text-white" : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                      )}
                    >
                      High Risk (2)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterRisk("moderate")}
                      className={cn(
                        "px-2.5 py-1 text-xs rounded-lg transition-colors font-medium",
                        filterRisk === "moderate" ? "bg-amber-600 text-white" : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                      )}
                    >
                      Moderate (1)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterRisk("low")}
                      className={cn(
                        "px-2.5 py-1 text-xs rounded-lg transition-colors font-medium",
                        filterRisk === "low" ? "bg-teal-600 text-white" : "bg-teal-50 text-teal-700 hover:bg-teal-100"
                      )}
                    >
                      Low Risk (3)
                    </button>
                  </div>
                </div>

                {/* Persona Segmentation Pills */}
                <div className="pt-2 flex items-center gap-1.5 overflow-x-auto text-xs text-slate-500">
                  <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">Persona Segments:</span>
                  <button
                    type="button"
                    onClick={() => setFilterSegment("all")}
                    className={cn(
                      "px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors shrink-0",
                      filterSegment === "all" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    All Segments
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterSegment("Unpolished Gem")}
                    className={cn(
                      "px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors shrink-0",
                      filterSegment === "Unpolished Gem" ? "bg-teal-700 text-white" : "bg-teal-50 text-teal-700 hover:bg-teal-100"
                    )}
                  >
                    Unpolished Gem
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterSegment("Consistent Achiever")}
                    className={cn(
                      "px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors shrink-0",
                      filterSegment === "Consistent Achiever" ? "bg-emerald-700 text-white" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    )}
                  >
                    Consistent Achiever
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterSegment("Disengaged")}
                    className={cn(
                      "px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors shrink-0",
                      filterSegment === "Disengaged" ? "bg-rose-700 text-white" : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                    )}
                  >
                    Disengaged (At-Risk)
                  </button>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {filteredStudents.map((s) => (
                    <div key={s.id} className="p-4 hover:bg-slate-50/70 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{s.name}</span>
                            <span className="text-slate-400 font-mono text-xs">{s.id}</span>
                            <Badge variant="outline" className="text-[10px] text-slate-600 bg-slate-50">
                              {s.persona}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span>CGPA: <strong className="text-slate-700">{s.cgpa}</strong></span>
                            <span>•</span>
                            <span>
                              Attendance:{" "}
                              <strong className={s.attendance < 75 ? "text-rose-600 font-bold" : "text-emerald-700"}>
                                {s.attendance}%
                              </strong>
                            </span>
                            <span>•</span>
                            <span>Last Active: {s.lastActive}</span>
                          </div>

                          <p className="text-xs text-slate-500 italic mt-1 max-w-xl">
                            &quot;{s.notes}&quot;
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex flex-col gap-1 items-end mr-2">
                            <Badge
                              variant={s.acadRisk === "High" ? "rose" : s.acadRisk === "Moderate" ? "amber" : "emerald"}
                              className="text-[10px]"
                            >
                              Acad: {s.acadRisk}
                            </Badge>
                            <Badge
                              variant={s.placeRisk === "High" ? "rose" : s.placeRisk === "Moderate" ? "amber" : "emerald"}
                              className="text-[10px]"
                            >
                              Placement: {s.placeRisk}
                            </Badge>
                          </div>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTriggerIntervention(s)}
                            className="text-xs font-semibold border-sky-300 text-sky-800 hover:bg-sky-50 gap-1.5"
                          >
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                            <span>Intervene</span>
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setLookupRegNo(s.id);
                              setSearchedStudent(s);
                              setActiveTab("lookup");
                            }}
                            className="text-xs text-teal-700 font-semibold gap-1"
                          >
                            <span>Lookup Dossier</span>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 2: INDIVIDUAL STUDENT RECORD LOOKUP BY REG NUMBER */}
        {activeTab === "lookup" && (
          <div className="space-y-4">
            <Card className="border border-slate-200/90 shadow-sm bg-white p-5">
              <form onSubmit={handleSearchStudentLookup} className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <IdCard className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    value={lookupRegNo}
                    onChange={(e) => setLookupRegNo(e.target.value)}
                    placeholder="Enter Student Registration Number (e.g. SCI-2024-CS084)..."
                    className="pl-9 text-xs h-10 w-full"
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-10 px-6 gap-2 w-full sm:w-auto"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>Retrieve Student Record</span>
                </Button>
              </form>
            </Card>

            {searchedStudent && (
              <Card className="border border-slate-200/90 shadow-md bg-white overflow-hidden">
                <div className="bg-gradient-to-r from-slate-900 via-navy-900 to-teal-950 p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-lg">
                      {searchedStudent.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold">{searchedStudent.name}</h3>
                        <Badge variant="outline" className="border-white/30 text-white font-mono text-xs">
                          {searchedStudent.id}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-300">
                        {searchedStudent.semester} • Segment: {searchedStudent.persona}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={searchedStudent.acadRisk === "High" ? "rose" : "emerald"} className="text-xs font-bold">
                      Academic Risk: {searchedStudent.acadRisk}
                    </Badge>
                    <Badge variant={searchedStudent.placeRisk === "High" ? "rose" : "teal"} className="text-xs font-bold">
                      Placement Risk: {searchedStudent.placeRisk}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6 space-y-5">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 space-y-1">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase">Cumulative CGPA</span>
                      <div className="text-2xl font-bold text-teal-700">{searchedStudent.cgpa} / 10.0</div>
                      <span className="text-[10px] text-slate-400">Backlogs: {searchedStudent.backlogs}</span>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 space-y-1">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase">Overall Attendance</span>
                      <div className={cn("text-2xl font-bold", searchedStudent.attendance < 75 ? "text-rose-600" : "text-emerald-700")}>
                        {searchedStudent.attendance}%
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {searchedStudent.attendance < 75 ? "Deficit: Debarment Risk" : "Meets >75% Mandate"}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 space-y-1">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase">Placement Readiness</span>
                      <div className="text-2xl font-bold text-indigo-700">{searchedStudent.placementScore} / 100</div>
                      <span className="text-[10px] text-indigo-600 font-medium">Weekly AI Mock Evaluated</span>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 space-y-1">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase">Last Activity</span>
                      <div className="text-base font-bold text-slate-800">{searchedStudent.lastActive}</div>
                      <span className="text-[10px] text-slate-400">Canvas LMS Synced</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                    <span className="text-xs font-bold text-slate-700 uppercase">Advisor & Mentor Case Notes:</span>
                    <p className="text-xs text-slate-600 leading-relaxed italic">
                      &quot;{searchedStudent.notes}&quot;
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <Button
                      onClick={() => handleTriggerIntervention(searchedStudent)}
                      className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs gap-1.5"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Log Counseling Intervention</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Success toast notification */}
        {evaluationSuccess && (
          <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-center gap-2 shadow-xs animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
            <span className="font-semibold">{evaluationSuccess}</span>
          </div>
        )}

        {/* TAB 3: FACULTY ASSESSMENT PUBLISHER & TEST RECORDS */}
        {activeTab === "assessments" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Faculty Assessments & Scheduled Drills</h3>
                <p className="text-xs text-slate-500">Personalize questions, publish coursework, and evaluate student test submissions</p>
              </div>

              <Button
                onClick={() => setCreateModalOpen(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs gap-1.5 h-9"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Upload New Assessment</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assessments.map((asm) => (
                <Card key={asm.id} className="border border-slate-200 shadow-sm bg-white overflow-hidden flex flex-col justify-between">
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="teal" className="text-[10px] font-bold">
                        {asm.type}
                      </Badge>
                      <span className="text-xs font-mono font-bold text-slate-400">{asm.id}</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{asm.title}</h4>
                    <p className="text-xs text-slate-500">{asm.subject}</p>

                    {/* Display personalized details preview */}
                    {asm.personalizedDetails && (
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                        {asm.personalizedDetails.question && (
                          <div>
                            <span className="text-[10px] font-bold text-teal-700 uppercase block">Configured Question:</span>
                            <p className="text-xs text-slate-800 font-medium line-clamp-2">{asm.personalizedDetails.question}</p>
                            <span className="text-[10px] text-slate-500 block mt-0.5">
                              Correct Key: <strong className="text-teal-700">Option {asm.personalizedDetails.correctOption}</strong>
                            </span>
                          </div>
                        )}
                        {asm.personalizedDetails.codingTitle && (
                          <div>
                            <span className="text-[10px] font-bold text-indigo-700 uppercase block">
                              Coding Drill ({asm.personalizedDetails.codingLanguage}):
                            </span>
                            <p className="text-xs text-slate-800 font-medium">{asm.personalizedDetails.codingTitle}</p>
                            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                              Test: {asm.personalizedDetails.sampleInput?.slice(0, 40)}...
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block">Start Date</span>
                        <strong className="text-slate-800">{asm.startDate}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block">Submission Deadline</span>
                        <strong className="text-rose-600">{asm.deadline}</strong>
                      </div>
                    </div>

                    {/* Student Test Records List with Evaluate Action */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          Student Test Records ({asm.submissions.length} Submissions)
                        </span>
                        <span className="text-[10px] text-teal-600 font-semibold">Click to Evaluate</span>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {asm.submissions.map((sub, i) => (
                          <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/90 space-y-1.5 text-xs">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-bold text-slate-800">{sub.studentName}</p>
                                <span className="text-[10px] text-slate-400 font-mono">{sub.studentId} • {sub.submittedAt}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-emerald-600 text-xs">
                                  {sub.score} / {asm.totalMarks}
                                </span>
                                <Badge
                                  variant={sub.status === "Evaluated" ? "emerald" : "amber"}
                                  className="text-[9px]"
                                >
                                  {sub.status}
                                </Badge>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleOpenEvaluateModal(asm, sub)}
                                  className="h-6 text-[10px] px-2 font-bold text-teal-700 hover:bg-teal-100 border-teal-300"
                                >
                                  Evaluate & Feedback
                                </Button>
                              </div>
                            </div>
                            {sub.facultyFeedback && (
                              <p className="text-[11px] text-slate-700 bg-white/90 p-1.5 rounded border border-slate-200 italic">
                                <strong className="text-teal-700 not-italic">Feedback: </strong>
                                &quot;{sub.facultyFeedback}&quot;
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Total Marks: {asm.totalMarks}</span>
                    <Badge variant="emerald" className="text-[10px]">Active in Student Portal</Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Modal for Creating New Assessment with Personalized Questions */}
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/60 backdrop-blur-xs p-4 overflow-y-auto">
            <Card className="w-full max-w-xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-teal-600" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Publish Assessment with Custom Questions & Deadlines
                    </h4>
                    <p className="text-[11px] text-slate-500">Configure questions and options for student evaluation</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateAssessment} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Assessment Title</label>
                  <Input
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. CS603 Thread Synchronization & Race Prevention MCQ Drill"
                    className="text-xs h-9"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Course / Subject</label>
                    <select
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      className="w-full text-xs h-9 p-2 rounded-lg border border-slate-200"
                    >
                      <option value="Operating Systems (CS603)">Operating Systems (CS603)</option>
                      <option value="Database Systems (CS602)">Database Systems (CS602)</option>
                      <option value="Cloud Architecture (CS601)">Cloud Architecture (CS601)</option>
                      <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Assessment Format</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                      className="w-full text-xs h-9 p-2 rounded-lg border border-slate-200 font-semibold text-teal-800"
                    >
                      <option value="Multiple Choice (MCQ)">Multiple Choice (MCQ)</option>
                      <option value="Coding Mock Test">Coding Mock Test</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Start Date</label>
                    <Input
                      value={newStartDate}
                      onChange={(e) => setNewStartDate(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Deadline (End Date)</label>
                    <Input
                      value={newDeadline}
                      onChange={(e) => setNewDeadline(e.target.value)}
                      className="text-xs h-9 text-rose-600 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Total Marks</label>
                    <Input
                      type="number"
                      value={newMarks}
                      onChange={(e) => setNewMarks(Number(e.target.value))}
                      className="text-xs h-9 font-bold"
                    />
                  </div>
                </div>

                {/* PERSONALIZED MCQ QUESTION & OPTIONS BUILDER */}
                {newType === "Multiple Choice (MCQ)" ? (
                  <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 uppercase">Personalize MCQ Questions & Options</span>
                      <Badge variant="teal" className="text-[9px]">Custom Question Builder</Badge>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700">Question Statement</label>
                      <Input
                        value={mcqQuestion}
                        onChange={(e) => setMcqQuestion(e.target.value)}
                        placeholder="Enter the question text..."
                        className="text-xs h-8 bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <label className="text-[10px] font-semibold text-slate-600">Option A</label>
                        <Input
                          value={mcqOptionA}
                          onChange={(e) => setMcqOptionA(e.target.value)}
                          className="text-xs h-8 bg-white"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[10px] font-semibold text-slate-600">Option B</label>
                        <Input
                          value={mcqOptionB}
                          onChange={(e) => setMcqOptionB(e.target.value)}
                          className="text-xs h-8 bg-white"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[10px] font-semibold text-slate-600">Option C</label>
                        <Input
                          value={mcqOptionC}
                          onChange={(e) => setMcqOptionC(e.target.value)}
                          className="text-xs h-8 bg-white"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[10px] font-semibold text-slate-600">Option D</label>
                        <Input
                          value={mcqOptionD}
                          onChange={(e) => setMcqOptionD(e.target.value)}
                          className="text-xs h-8 bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700">Designate Correct Answer Option</label>
                      <select
                        value={mcqCorrect}
                        onChange={(e) => setMcqCorrect(e.target.value as any)}
                        className="w-full text-xs h-8 p-1.5 rounded-lg border border-slate-200 font-bold text-teal-800 bg-white"
                      >
                        <option value="A">Option A is the Correct Answer</option>
                        <option value="B">Option B is the Correct Answer</option>
                        <option value="C">Option C is the Correct Answer</option>
                        <option value="D">Option D is the Correct Answer</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  /* PERSONALIZED CODING MOCK TEST BUILDER */
                  <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 uppercase">Personalize Coding Problem & Test Cases</span>
                      <Badge variant="teal" className="text-[9px]">Coding Sandbox Config</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-600">Problem Title</label>
                        <Input
                          value={codingProblemTitle}
                          onChange={(e) => setCodingProblemTitle(e.target.value)}
                          className="text-xs h-8 bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-600">Target Language</label>
                        <select
                          value={codingLanguage}
                          onChange={(e) => setCodingLanguage(e.target.value)}
                          className="w-full text-xs h-8 p-1.5 rounded border border-slate-200 font-semibold bg-white"
                        >
                          <option value="Python 3.11">Python 3.11</option>
                          <option value="Java 17">Java 17</option>
                          <option value="C++ 20">C++ 20</option>
                          <option value="TypeScript">TypeScript</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-600">Problem Statement & Requirements</label>
                      <textarea
                        rows={2}
                        value={codingStatement}
                        onChange={(e) => setCodingStatement(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-600">Sample Input</label>
                        <Input
                          value={codingSampleInput}
                          onChange={(e) => setCodingSampleInput(e.target.value)}
                          className="text-xs h-8 font-mono bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-600">Expected Output</label>
                        <Input
                          value={codingSampleOutput}
                          onChange={(e) => setCodingSampleOutput(e.target.value)}
                          className="text-xs h-8 font-mono text-emerald-700 font-bold bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-600">Complexity Constraints</label>
                      <Input
                        value={codingConstraints}
                        onChange={(e) => setCodingConstraints(e.target.value)}
                        className="text-xs h-8 bg-white"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCreateModalOpen(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold gap-1.5"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Publish Assessment to Student Body</span>
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* FACULTY EVALUATION & FEEDBACK MODAL */}
        {evaluatingSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/60 backdrop-blur-xs p-4">
            <Card className="w-full max-w-lg bg-white border border-slate-200 shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-teal-600" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Evaluate Final Test & Submit Faculty Feedback
                    </h4>
                    <p className="text-[11px] text-slate-500">{evaluatingSubmission.asmTitle}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEvaluatingSubmission(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800 text-sm">{evaluatingSubmission.studentName}</span>
                  <p className="text-slate-500 font-mono text-[11px]">{evaluatingSubmission.studentId} • Submitted: {evaluatingSubmission.submittedAt}</p>
                </div>
                <Badge variant="teal" className="text-xs">
                  Max Marks: {evaluatingSubmission.totalMarks}
                </Badge>
              </div>

              <form onSubmit={handleSaveEvaluation} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Awarded Score (out of {evaluatingSubmission.totalMarks})
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={evaluatingSubmission.totalMarks}
                    value={evalScoreInput}
                    onChange={(e) => setEvalScoreInput(Number(e.target.value))}
                    className="text-sm h-10 font-bold text-emerald-700"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Personalized Faculty Feedback on Student Performance
                  </label>
                  <textarea
                    rows={4}
                    value={evalFeedbackInput}
                    onChange={(e) => setEvalFeedbackInput(e.target.value)}
                    placeholder="Provide constructive feedback on technical accuracy, edge cases, and areas to improve..."
                    className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                  <p className="text-[10px] text-slate-400">
                    This evaluation and feedback will be directly visible to the student in their assessments tab.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEvaluatingSubmission(null)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold gap-1.5"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Save Evaluation & Send Feedback</span>
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Modal / Action Dialog for Faculty Intervention */}
        {selectedStudentForAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/50 backdrop-blur-xs p-4">
            <Card className="w-full max-w-md bg-white border border-slate-200 shadow-2xl p-5 space-y-3">
              <h4 className="text-sm font-bold text-slate-900">
                Launch Mentorship Intervention for {selectedStudentForAction.name}
              </h4>
              <p className="text-xs text-slate-500">
                Student ID: <strong>{selectedStudentForAction.id}</strong> • Persona: {selectedStudentForAction.persona}
              </p>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleConfirmIntervention("1-on-1 Attendance Recovery Advisory")}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-left hover:bg-sky-50 text-xs font-semibold text-slate-800"
                >
                  Schedule 1-on-1 Attendance Advisory
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmIntervention("Remedial Tutorial & Peer Study Group Enrollment")}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-left hover:bg-teal-50 text-xs font-semibold text-slate-800"
                >
                  Assign Remedial Tutorial & Study Group
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmIntervention("Formal Academic Probation Warning")}
                  className="w-full p-2.5 rounded-lg border border-rose-200 text-left hover:bg-rose-50 text-xs font-semibold text-rose-700"
                >
                  Issue Formal Academic Probation Notice
                </button>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedStudentForAction(null)}
                  className="text-xs"
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}

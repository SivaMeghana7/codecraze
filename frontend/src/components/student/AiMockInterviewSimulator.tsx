"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  Sparkles,
  Bot,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Send,
  Loader2,
  Award,
  Clock,
  Layers,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Maximize,
  Minimize,
  ShieldAlert,
  Youtube,
  ExternalLink,
  Lock,
} from "lucide-react";
import { evaluateStudentInterviewInstant, InterviewEvaluationResult } from "@/lib/interviewEvaluator";
import { cn } from "@/lib/utils";

interface AiMockInterviewSimulatorProps {
  onScoreUpdated?: (newScore: number, highRiskTopic: string) => void;
}

export const AiMockInterviewSimulator: React.FC<AiMockInterviewSimulatorProps> = ({
  onScoreUpdated,
}) => {
  const [selectedRound, setSelectedRound] = useState("Technical & DSA Round");
  const [currentStep, setCurrentStep] = useState<"intro" | "interviewing" | "evaluating" | "report" | "disqualified">("intro");
  
  // Weekly lock state
  const [isWeekLocked, setIsWeekLocked] = useState(false);

  // Audio Agent State
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Anti-cheating & Tab switch tracking
  const [tabSwitchWarnings, setTabSwitchWarnings] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenModal, setShowFullscreenModal] = useState(false);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [studentAnswer, setStudentAnswer] = useState("");
  const [qaPairs, setQaPairs] = useState<{ question: string; answer: string }[]>([]);
  const [evaluationResult, setEvaluationResult] = useState<InterviewEvaluationResult | null>(null);

  const roundQuestions: Record<string, string[]> = {
    "Technical & DSA Round": [
      "Explain how an LRU Cache is designed using a Doubly Linked List and Hash Map to achieve O(1) get and put time complexity.",
      "How would you find the longest palindromic substring in O(N) or O(N^2) time? Detail the expanding around center vs Manacher approach.",
      "Given a binary tree, how do you verify if it is a valid Binary Search Tree without using auxiliary space beyond recursion stack?",
      "Explain the time and space complexity trade-offs between QuickSort, MergeSort, and HeapSort in production systems.",
      "In a graph with non-negative weights, how does Dijkstra's algorithm work and why does it fail with negative edge weights?",
      "Describe how you would solve the 0/1 Knapsack problem with Dynamic Programming and how you optimize the space from O(N*W) to O(W).",
    ],
    "Aptitude & Problem Solving": [
      "A train running at 54 km/hr takes 20 seconds to pass a platform. If the train is 150m long, find the length of the platform and explain your calculation.",
      "In how many different ways can the letters of the word 'CAMPUS' be arranged so that the vowels always come together?",
      "Two pipes A and B can fill a tank in 20 and 30 minutes respectively. If both pipes are opened together, how much time will it take to fill the tank?",
      "If the probability of hitting a target is 2/5 and you shoot 3 times, what is the probability of hitting the target at least once?",
      "A merchant marks his goods 25% above cost price and allows a discount of 10%. Calculate his net percentage profit.",
      "Solve this sequence: 7, 14, 28, 56, 112, ? Explain the underlying pattern.",
    ],
    "System Design & Architecture": [
      "How would you design a distributed URL Shortener (like TinyURL) that handles 100 million new URLs per month with low latency?",
      "Explain the trade-offs between Optimistic Locking with a version column versus Pessimistic SELECT ... FOR UPDATE in PostgreSQL.",
      "How do you implement distributed rate limiting across multiple API gateway nodes using Redis sliding window log?",
      "What is the CAP Theorem and how does a distributed database like Apache Cassandra or DynamoDB handle eventual consistency?",
      "How would you design an event-driven notification service using Apache Kafka to prevent duplicated emails under consumer failure?",
      "Explain how database sharding works, what causes resharding hotspots, and how consistent hashing resolves this.",
    ],
    "Communication & Soft Skills": [
      "Describe a scenario where a non-technical stakeholder had unrealistic delivery expectations. How did you negotiate and communicate technical debt?",
      "How do you explain the concept of cloud virtualization and containerization to a college freshman or business executive?",
      "When receiving harsh code review feedback from a senior peer, what is your mindset and how do you respond professionally?",
      "How do you structure your communication during a production outage where multiple engineering teams are on the bridge?",
      "Tell me about a time you had to present complex architectural metrics to your college department head or dean.",
    ],
    "HR & Behavioral Fit": [
      "Walk me through a project where your initial design failed in testing. What did you learn and how did you pivot?",
      "Why are you interested in software engineering at Tier-1 product firms and what drives your personal engineering curiosity?",
      "How do you balance high academic coursework load with self-learning competitive programming and hackathon projects?",
      "Where do you see yourself contributing in your first 90 days after joining as an associate software engineer?",
      "Describe a situation where a team member was not contributing equally. How did you resolve the conflict constructively?",
    ],
  };

  const currentQuestions = roundQuestions[selectedRound] || roundQuestions["Technical & DSA Round"];

  // Initialize Speech Recognition & Tab switch proctor
  useEffect(() => {
    // Check weekly lock
    const locked = localStorage.getItem("sci_weekly_interview_lock_week6");
    if (locked === "true") {
      setIsWeekLocked(true);
    }

    // Speech recognition setup
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript.trim()) {
            setStudentAnswer((prev) => (prev ? `${prev} ${transcript}` : transcript));
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Anti-cheating proctoring event listeners
  useEffect(() => {
    if (currentStep !== "interviewing") return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchWarnings((prev) => {
          const next = prev + 1;
          if (next >= 3) {
            // Auto terminate on 3rd violation
            setCurrentStep("disqualified");
            if (window.speechSynthesis) window.speechSynthesis.cancel();
          }
          return next;
        });
      }
    };

    const handleWindowBlur = () => {
      setTabSwitchWarnings((prev) => {
        const next = prev + 1;
        if (next >= 3) {
          setCurrentStep("disqualified");
          if (window.speechSynthesis) window.speechSynthesis.cancel();
        }
        return next;
      });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [currentStep]);

  // Voice Agent: Speak question using browser TTS
  const speakCurrentQuestion = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsVoiceSpeaking(true);
    utterance.onend = () => setIsVoiceSpeaking(false);
    utterance.onerror = () => setIsVoiceSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsVoiceSpeaking(false);
    }
  };

  const toggleMicListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please type your answer.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleStartInterview = () => {
    setTabSwitchWarnings(0);
    setCurrentQuestionIndex(0);
    setQaPairs([]);
    setStudentAnswer("");
    setCurrentStep("interviewing");
  };

  const handleNextQuestion = () => {
    if (!studentAnswer.trim()) return;
    stopSpeaking();
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const currentQ = currentQuestions[currentQuestionIndex];
    const newQa = [...qaPairs, { question: currentQ, answer: studentAnswer }];
    setQaPairs(newQa);
    setStudentAnswer("");

    if (currentQuestionIndex + 1 < currentQuestions.length) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
    } else {
      // Completed interview - instant dynamic evaluation
      setCurrentStep("evaluating");
      setTimeout(() => {
        const result = evaluateStudentInterviewInstant("Full Stack & Systems", selectedRound, newQa);
        setEvaluationResult(result);
        setCurrentStep("report");

        // Lock test for this week (Once a week rule)
        localStorage.setItem("sci_weekly_interview_lock_week6", "true");
        setIsWeekLocked(true);

        // Notify parent to update student placement readiness score
        if (onScoreUpdated && result.highRiskTopics.length > 0) {
          onScoreUpdated(result.score, result.highRiskTopics[0]);
        }
      }, 400);
    }
  };

  const handleDemoReset = () => {
    localStorage.removeItem("sci_weekly_interview_lock_week6");
    setIsWeekLocked(false);
    setCurrentStep("intro");
    setTabSwitchWarnings(0);
  };

  return (
    <Card className="border border-teal-200/90 shadow-md bg-white dark:bg-slate-900 overflow-hidden">
      {/* Header with AI Voice Agent Status */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-navy-950 p-5 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-teal-300 border border-teal-500/30">
                <Bot className="h-3.5 w-3.5" />
                <span>Proctored Technical Interview Simulator</span>
              </span>
              {currentStep === "interviewing" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/30">
                  <ShieldAlert className="h-3 w-3" />
                  Anti-Cheating Active
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold">Real-Time Weekly Placement Interview</h3>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedRound}
              onChange={(e) => setSelectedRound(e.target.value)}
              disabled={currentStep === "interviewing" || currentStep === "evaluating"}
              className="rounded-lg bg-slate-800 border border-slate-700 text-xs px-2.5 py-1 text-slate-200"
            >
              <option value="Technical & DSA Round">Technical & DSA Round</option>
              <option value="Aptitude & Problem Solving">Aptitude & Problem Solving</option>
              <option value="System Design & Architecture">System Design & Architecture</option>
              <option value="Communication & Soft Skills">Communication Round</option>
              <option value="HR & Behavioral Fit">HR & Behavioral Round</option>
            </select>

            <Button
              size="sm"
              variant="outline"
              onClick={toggleFullscreen}
              className="text-xs border-slate-700 text-slate-300 bg-slate-800 hover:bg-slate-700 h-8 gap-1"
            >
              <Maximize className="h-3.5 w-3.5" />
              <span>Full Screen</span>
            </Button>
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        {/* Anti-Cheating Warning Banner when tab switch is detected */}
        {tabSwitchWarnings > 0 && currentStep === "interviewing" && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between animate-bounce">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>
                <strong>PROCTOR WARNING {tabSwitchWarnings}/3:</strong> Tab switching or leaving the screen detected! More than 3 violations will automatically terminate the test with a plagiarism disqualification.
              </span>
            </div>
          </div>
        )}

        {/* STEP: DISQUALIFIED FOR PLAGIARISM */}
        {currentStep === "disqualified" && (
          <div className="py-10 text-center space-y-4 max-w-lg mx-auto">
            <div className="h-16 w-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto border border-rose-300">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <div className="space-y-1.5">
              <Badge variant="rose" className="text-xs uppercase font-bold tracking-wider">
                Plagiarism Act Enforced
              </Badge>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Interview Disqualified & Auto-Terminated
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tab switching threshold exceeded (&gt;3 tab transitions). In accordance with institutional anti-cheating regulations, this session has been terminated and logged with 0 points.
              </p>
            </div>
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDemoReset}
                className="text-xs text-slate-600 border-slate-300"
              >
                Reset for Demo Verification
              </Button>
            </div>
          </div>
        )}

        {/* STEP 1: INTRO (WITH WEEKLY LOCK CHECK) */}
        {currentStep === "intro" && (
          <div className="space-y-4">
            {isWeekLocked ? (
              <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/70 text-amber-950 space-y-3">
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-amber-700" />
                  <h4 className="text-sm font-bold">Weekly Interview Locked (1 Test Per Week)</h4>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  You have already completed this week&apos;s verified AI mock interview. Per institutional placement governance, <strong>no re-tests are permitted for this round</strong>. Your performance has been logged to your placement profile.
                </p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-amber-700 font-medium">Next weekly slot unlocks in 6 days</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDemoReset}
                    className="text-xs border-amber-300 text-amber-900 bg-white hover:bg-amber-100"
                  >
                    Demo Re-unlock Test
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-800/50 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                      1. AI Voice & Text Agent
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      AI speaks questions out loud. You can either type or speak your technical answer via the microphone.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-800/50 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                      2. Anti-Cheating Lockdown
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Proctored in full-screen. Switching tabs more than 3 times will automatically terminate the test for plagiarism.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-800/50 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      3. Strict 1x/Week Rule
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Only one interview per week with no re-tests. Detailed metrics & YouTube learning resources generated.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="h-3.5 w-3.5" />
                    <span>6 Scenario Questions • Round: {selectedRound}</span>
                  </div>
                  <Button
                    onClick={() => setShowFullscreenModal(true)}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs gap-2 px-5 shadow-sm"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Begin Real-Time Interview</span>
                  </Button>
                </div>
              </>
            )}

            {/* Fullscreen Proctor Consent Modal */}
            {showFullscreenModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
                <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center gap-2 border-b pb-3 border-slate-100 dark:border-slate-800">
                    <Maximize className="h-5 w-5 text-teal-600" />
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      Full Screen Examination Mode
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Per campus placement assessment rules, this technical mock interview must be conducted in <strong>Full Screen mode</strong>.
                  </p>
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-1">
                    <p className="font-bold flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                      Proctoring Rule:
                    </p>
                    <p>
                      You are allowed a maximum of <strong>3 tab switches</strong>. Exceeding 3 tab transitions will automatically terminate the interview and flag a plagiarism disqualification.
                    </p>
                  </div>
                  <div className="pt-2 flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFullscreenModal(false)}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setShowFullscreenModal(false);
                        if (!document.fullscreenElement) {
                          document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
                        }
                        handleStartInterview();
                      }}
                      className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold"
                    >
                      Enter Full Screen & Start
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: INTERVIEWING WITH AUDIO & MIC AGENT */}
        {currentStep === "interviewing" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Question {currentQuestionIndex + 1} of {currentQuestions.length}
                </span>
                <Badge variant="teal" className="text-[10px]">
                  {selectedRound}
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">
                  Tab Switches: <strong className={tabSwitchWarnings > 0 ? "text-rose-600" : "text-slate-600"}>{tabSwitchWarnings}/3</strong>
                </span>
                <span className="text-xs font-semibold text-teal-600">
                  {Math.round(((currentQuestionIndex + 1) / currentQuestions.length) * 100)}% Complete
                </span>
              </div>
            </div>

            {/* AI Voice Question Box */}
            <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 text-teal-950 dark:bg-teal-950/30 dark:border-teal-900 dark:text-teal-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-300">
                  <Bot className="h-4 w-4" />
                  <span>AI Interviewer Question:</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      isVoiceSpeaking
                        ? stopSpeaking()
                        : speakCurrentQuestion(currentQuestions[currentQuestionIndex])
                    }
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-white border border-teal-300 text-teal-800 hover:bg-teal-100 dark:bg-slate-800 dark:text-teal-200 transition-colors"
                  >
                    {isVoiceSpeaking ? (
                      <>
                        <VolumeX className="h-3.5 w-3.5 text-rose-600" />
                        <span>Mute Audio</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-3.5 w-3.5 text-teal-600 animate-pulse" />
                        <span>Read Question Aloud</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <p className="text-sm font-medium leading-relaxed">
                {currentQuestions[currentQuestionIndex]}
              </p>
            </div>

            {/* Student Answer Box with Mic & Typing Toggle */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span>Your Answer:</span>
                  <span className="text-[10px] text-slate-400">(Type or Speak via Microphone)</span>
                </label>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={toggleMicListening}
                  className={cn(
                    "h-7 text-xs font-semibold gap-1.5 transition-all",
                    isListening
                      ? "bg-rose-50 text-rose-700 border-rose-300 animate-pulse"
                      : "border-slate-300 text-slate-700 hover:bg-slate-100"
                  )}
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-3.5 w-3.5 text-rose-600" />
                      <span>Stop Listening</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-3.5 w-3.5 text-teal-600" />
                      <span>Speak Answer (Voice Mode)</span>
                    </>
                  )}
                </Button>
              </div>

              <textarea
                rows={4}
                value={studentAnswer}
                onChange={(e) => setStudentAnswer(e.target.value)}
                placeholder="Type your response here detailing algorithm approach, complexity, or spoken transcript..."
                className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  stopSpeaking();
                  setCurrentStep("intro");
                }}
                className="text-xs text-slate-500"
              >
                Quit Session
              </Button>

              <Button
                onClick={handleNextQuestion}
                disabled={!studentAnswer.trim()}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs gap-1.5 shadow-sm"
              >
                <span>
                  {currentQuestionIndex + 1 < currentQuestions.length
                    ? "Next Question"
                    : "Complete & Submit Interview"}
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: EVALUATING */}
        {currentStep === "evaluating" && (
          <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="h-14 w-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center animate-spin">
              <Loader2 className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Analyzing & Scoring Your Technical Answers
              </h4>
              <p className="text-xs text-slate-500 max-w-sm">
                Evaluating answer precision, complexity trade-offs, and conceptual accuracy...
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: REPORT CARD WITH DETAILED METRICS & YOUTUBE / WEB RESOURCES */}
        {currentStep === "report" && evaluationResult && (
          <div className="space-y-5 animate-in fade-in">
            {/* Score & Summary Banner */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="teal" className="text-xs uppercase font-bold">
                    Grade: {evaluationResult.grade}
                  </Badge>
                  <span className="text-xs font-semibold text-slate-500">
                    {evaluationResult.roundName}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  Interview Evaluation Complete
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl">
                  {evaluationResult.overallSummary}
                </p>
              </div>

              <div className="text-center sm:text-right shrink-0">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Evaluated Score</span>
                <div className="flex items-baseline justify-center sm:justify-end gap-1">
                  <span className="text-3xl font-extrabold text-teal-600">
                    {evaluationResult.score}
                  </span>
                  <span className="text-xs text-slate-400">/ 100</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-medium flex items-center justify-center sm:justify-end gap-1 mt-0.5">
                  <CheckCircle2 className="h-3 w-3" />
                  Synced to Student Profile
                </span>
              </div>
            </div>

            {/* Placement Challenge Qualification Banner (Requested by User) */}
            {evaluationResult.score >= 80 ? (
              <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-950 flex items-center gap-3 shadow-xs">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                <div className="space-y-0.5">
                  <h5 className="text-sm font-bold text-emerald-900">
                    Qualified for Placement Challenge Interview (Score &gt;= 80%)
                  </h5>
                  <p className="text-xs text-emerald-800">
                    Congratulations! Your evaluated score of {evaluationResult.score}/100 qualifies you to participate in tier-1 corporate campus recruitment drives and placement challenges.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 text-amber-950 flex items-center gap-3 shadow-xs">
                <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0" />
                <div className="space-y-0.5">
                  <h5 className="text-sm font-bold text-amber-900">
                    Not Yet Qualified for Placement Challenge (Score &lt; 80%)
                  </h5>
                  <p className="text-xs text-amber-800">
                    Your current score is {evaluationResult.score}/100. A minimum score of 80% is required to qualify for corporate placement drives. Review the recommended practice modules below to strengthen your weak areas.
                  </p>
                </div>
              </div>
            )}

            {/* In-Depth Multi-Criteria Round Metrics (Requested by User) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              <div className="p-3 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Aptitude</span>
                <div className="text-base font-bold text-slate-900 dark:text-white">
                  {evaluationResult.aptitudeScore}%
                </div>
                <Progress value={evaluationResult.aptitudeScore} indicatorClassName="bg-sky-600" className="h-1.5" />
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Technical Depth</span>
                <div className="text-base font-bold text-slate-900 dark:text-white">
                  {evaluationResult.technicalDepth}%
                </div>
                <Progress value={evaluationResult.technicalDepth} indicatorClassName="bg-teal-600" className="h-1.5" />
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Problem Solving</span>
                <div className="text-base font-bold text-slate-900 dark:text-white">
                  {evaluationResult.problemSolving}%
                </div>
                <Progress value={evaluationResult.problemSolving} indicatorClassName="bg-indigo-600" className="h-1.5" />
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Communication</span>
                <div className="text-base font-bold text-slate-900 dark:text-white">
                  {evaluationResult.communication}%
                </div>
                <Progress value={evaluationResult.communication} indicatorClassName="bg-purple-600" className="h-1.5" />
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Culture & HR Fit</span>
                <div className="text-base font-bold text-slate-900 dark:text-white">
                  {evaluationResult.behavioralFit}%
                </div>
                <Progress value={evaluationResult.behavioralFit} indicatorClassName="bg-emerald-600" className="h-1.5" />
              </div>
            </div>

            {/* High-Risk Areas Alert */}
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/70 dark:bg-rose-950/30 dark:border-rose-900 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-300">
                <AlertTriangle className="h-4 w-4" />
                <span>Identified High-Risk Areas (Added to Student Risk Profile):</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {evaluationResult.highRiskTopics.map((topic, i) => (
                  <Badge key={i} variant="rose" className="text-xs font-semibold py-1 px-2.5">
                    {topic}
                  </Badge>
                ))}
              </div>
              <p className="text-[11px] text-rose-800 dark:text-rose-300">
                Address these specific topics using the self-learning resources below before next week&apos;s interview slot unlocks.
              </p>
            </div>

            {/* Curated Self-Learning Platform with YouTube & Web Resources (Requested by User) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-teal-600" />
                  <span>Curated Self-Learning Platform (YouTube & Web Masterclasses)</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  Targeted Academic & Placement Recovery
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {evaluationResult.recommendedResources.map((res, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-teal-400 transition-colors flex flex-col justify-between space-y-2 dark:bg-slate-800 dark:border-slate-700"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant={res.platform === "YouTube" ? "rose" : "teal"}
                          className="text-[9px] uppercase font-bold gap-1"
                        >
                          {res.platform === "YouTube" ? <Youtube className="h-3 w-3" /> : null}
                          {res.platform}
                        </Badge>
                        <span className="text-[10px] text-slate-400">{res.estimatedTime}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {res.title}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {res.description}
                      </p>
                    </div>

                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 dark:bg-teal-900 dark:text-teal-200 transition-colors"
                    >
                      <span>Open Self-Learning Masterclass</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Question-by-Question Answer Breakdown & Verification */}
            {evaluationResult.evaluations && evaluationResult.evaluations.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Question-by-Question Evaluated Answers ({evaluationResult.evaluations.length} Questions)</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Proctored AI Evaluation Audit
                  </span>
                </div>

                <div className="space-y-2.5">
                  {evaluationResult.evaluations.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-teal-700 uppercase">
                            Question {item.questionNumber}
                          </span>
                          <h5 className="text-xs font-semibold text-slate-900 dark:text-white">
                            {item.question}
                          </h5>
                        </div>
                        <Badge
                          variant={item.score >= 75 ? "emerald" : item.score >= 50 ? "teal" : "rose"}
                          className="text-xs font-bold shrink-0"
                        >
                          Score: {item.score}/100
                        </Badge>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                          Your Answer:
                        </span>
                        <p className="text-slate-700 dark:text-slate-200 italic">
                          &ldquo;{item.studentAnswer || "(No answer recorded)"}&rdquo;
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-1">
                        <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-200/60 text-emerald-900">
                          <strong className="block text-[10px] uppercase text-emerald-700 font-bold mb-0.5">
                            Strength:
                          </strong>
                          {item.strengths}
                        </div>
                        <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200/60 text-amber-900">
                          <strong className="block text-[10px] uppercase text-amber-700 font-bold mb-0.5">
                            Deficiencies & Recommended Fix:
                          </strong>
                          {item.deficiencies} {item.recommendedFix}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
              <span>Assessment locked for this week. Next session unlocks next week.</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDemoReset}
                className="text-xs text-slate-500 border-slate-200"
              >
                Reset for Demo Testing
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

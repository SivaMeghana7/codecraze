"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bot,
  Sparkles,
  X,
  Send,
  Minimize2,
  Maximize2,
  RotateCcw,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { askRagStudentCopilot, StudentRagContext } from "@/lib/gemini";
import { mockStudentProfile, mockAcademicData, mockAttendanceData, mockPlacementData } from "@/lib/mockData";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export const AiRagChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m-0",
      role: "assistant",
      content: `Hello Alex! I'm your **Campus Copilot AI**, synchronized with your real-time academic records. 

I see your CGPA is strong at **8.14**, but **CS603 Operating Systems** attendance is at **71.4%** and your mock interview highlighted **concurrency** gaps. 

How can I help you reduce your risk factor today?`,
      timestamp: "Just now",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const studentContext: StudentRagContext = {
    studentName: mockStudentProfile.name,
    studentId: mockStudentProfile.studentId,
    semester: `Semester ${mockStudentProfile.semester}`,
    cgpa: mockAcademicData.currentCgpa,
    attendanceOverall: mockAttendanceData.overallPercentage,
    lowAttendanceCourse: {
      course: "CS603 Operating Systems",
      rate: 71.4,
      neededSessions: 5,
    },
    placementScore: mockPlacementData.overallReadinessScore,
    weakAreas: ["Distributed Concurrency", "Dynamic Programming Space Optimization"],
    strongAreas: ["Database Architecture", "System Design Modularity", "Web Engineering"],
    recentMockScore: 74,
  };

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const botReply = await askRagStudentCopilot(studentContext, text, history);

      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 rounded-full bg-gradient-to-r from-teal-600 to-sky-600 text-white px-4 py-3 shadow-xl hover:shadow-teal-500/30 hover:scale-105 transition-all group border border-white/20"
        >
          <div className="relative">
            <Bot className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-white" />
          </div>
          <span className="text-xs font-bold tracking-tight">AI Copilot</span>
          <Badge variant="outline" className="bg-white/20 text-white border-none text-[10px] px-1.5 py-0">
            RAG Active
          </Badge>
        </button>
      )}

      {/* Expanded Chat Drawer */}
      {isOpen && (
        <Card className="w-[380px] sm:w-[420px] h-[520px] border border-slate-200 shadow-2xl flex flex-col bg-white dark:bg-slate-900 rounded-2xl overflow-hidden animate-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-navy-900 p-3.5 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-500/30">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold">Campus Copilot AI</h4>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </div>
                <p className="text-[10px] text-slate-300">
                  Grounded in Alex Mercer&apos;s SIS & LMS Data
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-slate-300 hover:text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick RAG Grounding Bar */}
          <div className="bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
            <span>CGPA: <strong>8.14</strong> • Att: <strong>79.2%</strong></span>
            <span className="text-amber-600 font-semibold flex items-center gap-1">
              <AlertTriangle className="h-2.5 w-2.5" />
              CS603: 71.4%
            </span>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex flex-col max-w-[85%] text-xs leading-relaxed",
                  m.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div
                  className={cn(
                    "p-3 rounded-2xl",
                    m.role === "user"
                      ? "bg-teal-600 text-white rounded-br-xs"
                      : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 rounded-bl-xs border border-slate-200/60 dark:border-slate-700"
                  )}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
                <span className="text-[9px] text-slate-400 mt-0.5 px-1">{m.timestamp}</span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 p-2 rounded-xl w-fit">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-600" />
                <span>Copilot is analyzing student indicators...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Suggestions */}
          <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 flex gap-1.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => handleSendMessage("Why is my risk level moderate?")}
              className="px-2 py-1 rounded-md bg-white border border-slate-200 text-[10px] text-slate-600 hover:text-teal-700 hover:border-teal-300 shrink-0 shadow-2xs"
            >
              Why is my risk moderate?
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage("How do I fix my attendance in CS603?")}
              className="px-2 py-1 rounded-md bg-white border border-slate-200 text-[10px] text-slate-600 hover:text-teal-700 hover:border-teal-300 shrink-0 shadow-2xs"
            >
              How to fix CS603 attendance?
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage("What resources will raise my placement score?")}
              className="px-2 py-1 rounded-md bg-white border border-slate-200 text-[10px] text-slate-600 hover:text-teal-700 hover:border-teal-300 shrink-0 shadow-2xs"
            >
              Raise placement score
            </button>
          </div>

          {/* Input form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Copilot about risk, tests, or attendance..."
              className="text-xs h-9"
            />
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              size="sm"
              className="h-9 px-3 bg-teal-600 hover:bg-teal-700 text-white"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
};

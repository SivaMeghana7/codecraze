"use client";

import React, { useState } from "react";
import { useAuth, DEMO_ACCOUNTS } from "@/context/AuthContext";
import { UserRole } from "@/types/common";
import {
  School,
  Lock,
  Mail,
  ArrowRight,
  GraduationCap,
  Users,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
  IdCard,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const { login } = useAuth();

  const defaultCredentials: Record<UserRole, { id: string; pass: string }> = {
    student: { id: "SCI-2024-CS084", pass: "student@2026" },
    faculty: { id: "FAC-102", pass: "faculty@2026" },
    admin: { id: "ADM-001", pass: "admin@2026" },
  };

  const [selectedPortal, setSelectedPortal] = useState<UserRole>("student");
  const [identifier, setIdentifier] = useState(defaultCredentials.student.id);
  const [password, setPassword] = useState(defaultCredentials.student.pass);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Forgot password modal state
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetSubmitted, setResetSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const loginId = identifier.trim() || defaultCredentials[selectedPortal].id;
    const loginPass = password || defaultCredentials[selectedPortal].pass;

    login(loginId, loginPass, selectedPortal);
  };

  const handlePortalSwitch = (role: UserRole) => {
    setSelectedPortal(role);
    setError(null);
    setIdentifier(defaultCredentials[role].id);
    setPassword(defaultCredentials[role].pass);
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetSubmitted(true);
  };

  const portalConfig = {
    student: {
      title: "Student Portal Login",
      badge: "Student Access",
      badgeStyle: "bg-teal-50 text-teal-700 border-teal-200",
      idLabel: "Registration Number or Email",
      idPlaceholder: "e.g. SCI-2024-CS084 or alex.mercer@campus.edu",
      icon: GraduationCap,
      accentColor: "teal",
      btnClass: "bg-teal-600 hover:bg-teal-700 text-white",
    },
    faculty: {
      title: "Faculty & Mentor Portal Login",
      badge: "Faculty Access",
      badgeStyle: "bg-sky-50 text-sky-700 border-sky-200",
      idLabel: "Faculty ID or Email",
      idPlaceholder: "e.g. FAC-102 or evelyn.reed@campus.edu",
      icon: Users,
      accentColor: "sky",
      btnClass: "bg-sky-600 hover:bg-sky-700 text-white",
    },
    admin: {
      title: "Administrator Command Login",
      badge: "Administrator Access",
      badgeStyle: "bg-indigo-50 text-indigo-700 border-indigo-200",
      idLabel: "Administrator ID or Email",
      idPlaceholder: "e.g. ADM-001 or dean.academics@campus.edu",
      icon: Shield,
      accentColor: "indigo",
      btnClass: "bg-slate-900 hover:bg-slate-800 text-white",
    },
  }[selectedPortal];

  const CurrentIcon = portalConfig.icon;

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center py-12 px-4 overflow-hidden bg-slate-50 selection:bg-teal-500 selection:text-white">
      {/* 3D Isometric Campus Visual Background Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Real 3D Isometric Campus Render */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-multiply filter blur-[0.5px] scale-105 transition-transform duration-1000"
          style={{ backgroundImage: `url('/campus_3d_bg.jpg')` }}
        />
        
        {/* Soft Ambient Light Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-slate-50/70 to-white/95" />

        {/* 3D Floating Radial Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-300/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-sky-300/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl" />

        {/* Fine Geometric Dot Grid Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* Decorative 3D Floating Glass Badges (Visible on larger screens) */}
      <div className="hidden lg:block absolute left-12 top-1/3 z-10 pointer-events-none transform -translate-y-1/2 -rotate-3 hover:rotate-0 transition-transform duration-500">
        <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-white/80 shadow-2xl shadow-teal-900/10 space-y-1.5 w-60">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider font-modern">Placement Telemetry</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 font-classic">94.2%</p>
          <span className="text-[11px] text-slate-500 font-medium block">Institutional Career Conversion</span>
        </div>
      </div>

      <div className="hidden lg:block absolute right-12 top-1/3 z-10 pointer-events-none transform -translate-y-1/2 rotate-3 hover:rotate-0 transition-transform duration-500">
        <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-white/80 shadow-2xl shadow-sky-900/10 space-y-1.5 w-60">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider font-modern">Student Success Index</span>
            <Badge variant="teal" className="text-[9px]">Live Sync</Badge>
          </div>
          <p className="text-xl font-extrabold text-slate-900 font-classic">81.4 / 100</p>
          <span className="text-[11px] text-slate-500 font-medium block">Holistic Multi-Domain Cohort Avg</span>
        </div>
      </div>

      <div className="relative z-20 w-full max-w-md space-y-5">
        {/* Brand Header with 3D Crystal Crest & Classic Typography */}
        <div className="text-center space-y-2.5">
          <div className="relative inline-flex items-center justify-center">
            {/* Ambient Aura */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-teal-500 to-sky-500 blur-lg opacity-40 animate-pulse" />
            {/* 3D Crystal Crest Icon */}
            <div className="relative h-20 w-20 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/90 border border-teal-200 bg-white">
              <img 
                src="/campus_crest_3d.jpg" 
                alt="Smart Campus Crest" 
                className="h-full w-full object-cover transform hover:scale-110 transition-transform duration-300"
              />
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-classic tracking-wider uppercase drop-shadow-xs">
              Smart Campus Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-editorial italic font-medium">
              Student Analytics, Placement Readiness & Success Portal
            </p>
            <div className="pt-0.5">
              <span className="text-[10px] font-extrabold font-modern text-teal-800 tracking-widest uppercase bg-teal-50 border border-teal-200/80 px-3 py-0.5 rounded-full shadow-2xs">
                Unified Institutional Access System
              </span>
            </div>
          </div>
        </div>

        {/* 3 Portal Selectors */}
        <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <button
            type="button"
            onClick={() => handlePortalSwitch("student")}
            className={cn(
              "flex flex-col items-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all",
              selectedPortal === "student"
                ? "bg-teal-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            )}
          >
            <GraduationCap className="h-4 w-4 mb-1" />
            <span>Student</span>
          </button>

          <button
            type="button"
            onClick={() => handlePortalSwitch("faculty")}
            className={cn(
              "flex flex-col items-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all",
              selectedPortal === "faculty"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            )}
          >
            <Users className="h-4 w-4 mb-1" />
            <span>Faculty</span>
          </button>

          <button
            type="button"
            onClick={() => handlePortalSwitch("admin")}
            className={cn(
              "flex flex-col items-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all",
              selectedPortal === "admin"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            )}
          >
            <Shield className="h-4 w-4 mb-1" />
            <span>Admin</span>
          </button>
        </div>

        {/* Login Card */}
        <Card className="border border-slate-200 shadow-xl bg-white text-slate-900 rounded-2xl">
          <CardContent className="p-6 md:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CurrentIcon className="h-5 w-5 text-teal-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  {portalConfig.title}
                </h2>
              </div>
              <span className={cn("text-[10px] font-bold px-2.5 py-0.5 rounded-full border", portalConfig.badgeStyle)}>
                {portalConfig.badge}
              </span>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {portalConfig.idLabel}
                </label>
                <div className="relative">
                  <IdCard className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={portalConfig.idPlaceholder}
                    className="pl-9 text-xs h-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(identifier.includes("@") ? identifier : "");
                      setResetSubmitted(false);
                      setForgotPasswordOpen(true);
                    }}
                    className="text-[11px] text-teal-600 hover:underline font-semibold"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="pl-9 pr-10 text-xs h-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-teal-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className={cn("w-full text-xs font-bold h-10 shadow-sm gap-2", portalConfig.btnClass)}
              >
                {loading ? "Authenticating..." : `Sign In to ${selectedPortal.charAt(0).toUpperCase() + selectedPortal.slice(1)} Portal`}
                <ArrowRight className="h-4 w-4" />
              </Button>

              <button
                type="button"
                onClick={() => login("", "", selectedPortal)}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                <span>Instant 1-Click Access as {selectedPortal.charAt(0).toUpperCase() + selectedPortal.slice(1)}</span>
              </button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-[11px] text-slate-400 font-medium">
          Protected Institutional Access • Campus Success & Academic Advisory System
        </p>
      </div>

      {/* Forgot Password Modal */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Reset Account Access</h3>
              <button
                type="button"
                onClick={() => setForgotPasswordOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {resetSubmitted ? (
              <div className="space-y-3 py-2 text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <p className="text-xs text-slate-600">
                  Password reset link has been dispatched to <strong>{forgotEmail || "your registered email"}</strong>.
                </p>
                <Button
                  size="sm"
                  onClick={() => setForgotPasswordOpen(false)}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs w-full"
                >
                  Return to Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                <p className="text-xs text-slate-500">
                  Enter your campus ID or registered email address to receive password recovery instructions.
                </p>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Institutional Email</label>
                  <Input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="e.g. alex.mercer@campus.edu"
                    className="text-xs h-9 bg-slate-50"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setForgotPasswordOpen(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold"
                  >
                    Send Recovery Link
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

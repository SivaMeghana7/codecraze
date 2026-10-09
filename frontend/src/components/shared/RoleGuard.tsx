"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types/common";
import { ShieldAlert, ArrowRight, Lock, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { user, role, isAuthenticated, quickLogin } = useAuth();

  if (isAuthenticated && allowedRoles.includes(role)) {
    return <>{children}</>;
  }

  const roleRedirectMap: Record<UserRole, string> = {
    student: "/student",
    faculty: "/faculty",
    admin: "/admin",
  };

  const allowedLabels = allowedRoles.map((r) => r.toUpperCase()).join(" / ");

  if (!isAuthenticated || !user) {
    return (
      <div className="py-16 flex flex-col items-center justify-center max-w-md mx-auto px-4">
        <Card className="border border-slate-200 bg-white shadow-xl dark:bg-slate-900 dark:border-slate-800 overflow-hidden w-full text-center">
          <div className="h-2 bg-gradient-to-r from-teal-500 to-sky-500" />
          <CardContent className="p-8 space-y-5">
            <div className="h-14 w-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mx-auto shadow-sm dark:bg-teal-950/40 dark:border-teal-800">
              <Lock className="h-7 w-7" />
            </div>

            <div className="space-y-1.5">
              <Badge variant="teal" className="text-xs uppercase font-bold tracking-wider">
                Authentication Required
              </Badge>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Sign In to Smart Campus
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                You must be authenticated to access this dashboard. Please sign in with your student, faculty, or administrator account.
              </p>
            </div>

            <div className="pt-2">
              <Link href="/login">
                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs gap-1.5 shadow-sm">
                  <span>Sign In to Campus Portal</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-12 flex flex-col items-center justify-center max-w-xl mx-auto px-4">
      <Card className="border border-rose-200 bg-white shadow-xl dark:bg-slate-900 dark:border-rose-900/60 overflow-hidden w-full text-center">
        <div className="h-2 bg-gradient-to-r from-rose-500 to-amber-500" />
        <CardContent className="p-8 space-y-5">
          <div className="h-14 w-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-sm dark:bg-rose-950/40 dark:border-rose-800">
            <Lock className="h-7 w-7" />
          </div>

          <div className="space-y-1.5">
            <Badge variant="rose" className="text-xs uppercase font-bold tracking-wider">
              Restricted Institutional Access
            </Badge>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Role Permission Required
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
              This workspace is restricted to <strong>{allowedLabels}</strong> accounts.
              You are currently signed in as <strong>{user?.name || "Student"}</strong> ({role.toUpperCase()}).
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/login">
              <Button
                variant="outline"
                className="border-slate-300 text-slate-700 text-xs font-semibold gap-1.5"
              >
                <Lock className="h-3.5 w-3.5 text-slate-500" />
                <span>Sign In with Different Account</span>
              </Button>
            </Link>

            <Link href={roleRedirectMap[role]}>
              <Button className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs gap-1.5 shadow-sm">
                <span>Go to My Permitted Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

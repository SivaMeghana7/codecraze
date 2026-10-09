"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Database, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RoleGuard } from "@/components/shared/RoleGuard";

export default function DataManagementPage() {
  const sources = [
    { name: "Student Information System (SIS)", type: "Relational DB", records: "1,420 students", coverage: "99.8%", status: "Healthy" },
    { name: "Biometric Attendance Terminals", type: "IoT Readers", records: "18,450 logs", coverage: "98.4%", status: "Healthy" },
    { name: "Canvas LMS Learning Analytics", type: "REST API", records: "4,210 assignments", coverage: "95.2%", status: "Healthy" },
    { name: "Campus Coding Portal Drills", type: "Webhook", records: "1,200 submissions", coverage: "91.0%", status: "Healthy" },
    { name: "Campus Grievance Forms", type: "Form Ingestion", records: "84 feedback logs", coverage: "100%", status: "Healthy" },
  ];

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-navy-900 to-teal-950 p-6 text-white">
          <h1 className="text-2xl font-bold">Data Management & Ingestion Audit</h1>
          <p className="text-xs text-slate-300 mt-1">
            Source coverage health, validation checks, and missing-data indicator completeness without zero-filling.
          </p>
        </div>

        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-4 w-4 text-teal-600" />
              <span>Ingestion Status of 5 Campus Data Streams</span>
            </CardTitle>
            <CardDescription>Continuous synchronization with Supabase PostgreSQL and FastAPI engine</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data Source</TableHead>
                  <TableHead>Integration Type</TableHead>
                  <TableHead>Records Synced</TableHead>
                  <TableHead>Coverage</TableHead>
                  <TableHead>Ingestion Health</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sources.map((s) => (
                  <TableRow key={s.name}>
                    <TableCell className="font-bold text-slate-900">{s.name}</TableCell>
                    <TableCell className="text-xs text-slate-500">{s.type}</TableCell>
                    <TableCell className="text-xs font-mono">{s.records}</TableCell>
                    <TableCell className="text-xs font-bold text-teal-700">{s.coverage}</TableCell>
                    <TableCell>
                      <Badge variant="emerald" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {s.status}
                      </Badge>
                    </TableCell>
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

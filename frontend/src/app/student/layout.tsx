"use client";

import React from "react";
import { RoleGuard } from "@/components/shared/RoleGuard";
import { AiRagChatbot } from "@/components/student/AiRagChatbot";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["student"]}>
      {children}
      <AiRagChatbot />
    </RoleGuard>
  );
}

"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";

interface ShellProps {
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // If on login page or root landing, render clean full-width experience without sidebar or header
  if (pathname === "/login" || pathname === "/") {
    return (
      <div className="min-h-screen bg-slate-50/70 text-slate-900 font-sans dark:bg-slate-950 dark:text-slate-100 antialiased selection:bg-teal-500 selection:text-white">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50/70 text-slate-900 font-sans dark:bg-slate-950 dark:text-slate-100 antialiased selection:bg-teal-500 selection:text-white">
      {/* Role-Aware Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <TopHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

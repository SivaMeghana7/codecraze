import type { Metadata } from "next";
import "./globals.css";
import { Shell } from "@/components/layout/Shell";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Smart Campus Intelligence | Student Success Platform",
  description:
    "Predict, optimize & improve student success through holistic multi-dimensional learning analytics and closed-loop insights.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen bg-slate-50 text-slate-900 selection:bg-teal-500 selection:text-white">
        <AuthProvider>
          <Shell>{children}</Shell>
        </AuthProvider>
      </body>
    </html>
  );
}

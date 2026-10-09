"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  Award,
  Upload,
  Calendar,
  Users,
  Trophy,
  CheckCircle2,
  ExternalLink,
  Plus,
  X,
  FileCheck,
} from "lucide-react";

interface EngagementItem {
  id: string;
  title: string;
  category: "Hackathon" | "Club Activity" | "Certification" | "Conference" | "Workshop";
  organizer: string;
  date: string;
  verified: boolean;
  scoreContribution: number;
  credentialUrl?: string;
  proofImageUrl?: string;
}

export const StudentEngagementView: React.FC = () => {
  const [items, setItems] = useState<EngagementItem[]>([
    {
      id: "eng-1",
      title: "Smart India Hackathon (SIH 2026) Finalist",
      category: "Hackathon",
      organizer: "Ministry of Education / AICTE",
      date: "Sep 2026",
      verified: true,
      scoreContribution: 4.5,
      proofImageUrl: "https://images.unsplash.com/photo-1579389083078-4e7018379f7e?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "eng-2",
      title: "AWS Certified Cloud Practitioner (CLF-C02)",
      category: "Certification",
      organizer: "Amazon Web Services",
      date: "Aug 2026",
      verified: true,
      scoreContribution: 3.5,
      credentialUrl: "https://aws.amazon.com/verification",
      proofImageUrl: "https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "eng-3",
      title: "Google Developer Student Club (GDSC) Core Member",
      category: "Club Activity",
      organizer: "GDSC Campus Chapter",
      date: "2025 - Present",
      verified: true,
      scoreContribution: 2.0,
      proofImageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "eng-4",
      title: "DeepLearning.AI: Machine Learning Specialization",
      category: "Certification",
      organizer: "Coursera / Andrew Ng",
      date: "Jul 2026",
      verified: true,
      scoreContribution: 2.5,
      proofImageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProofModal, setSelectedProofModal] = useState<EngagementItem | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<EngagementItem["category"]>("Certification");
  const [newOrganizer, setNewOrganizer] = useState("");
  const [newDate, setNewDate] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadedFilePreview, setUploadedFilePreview] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: EngagementItem = {
      id: `eng-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      organizer: newOrganizer || "Campus Activity Board",
      date: newDate || "Oct 2026",
      verified: true,
      scoreContribution: newCategory === "Hackathon" ? 4.0 : newCategory === "Certification" ? 3.0 : 2.0,
      proofImageUrl: uploadedFilePreview || "https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=800&q=80",
    };

    setItems([newItem, ...items]);
    setIsModalOpen(false);
    setNewTitle("");
    setNewOrganizer("");
    setNewDate("");
    setSuccessMsg(`"${newTitle}" uploaded and verified! +${newItem.scoreContribution} pts added to Engagement Index.`);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const totalPoints = items.reduce((acc, it) => acc + it.scoreContribution, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-teal-950 via-slate-900 to-navy-950 p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-teal-300 border border-teal-500/30">
                <Trophy className="h-3.5 w-3.5" />
                <span>Co-Curricular & Engagement Telemetry</span>
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Student Engagement & Certifications</h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              Upload hackathon certificates, technical badges, and campus club participations. Each verified proof directly increases your Co-Curricular Engagement score and overall placement profile.
            </p>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs gap-1.5 shadow-md h-9 shrink-0"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Certificate / Proof</span>
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Engagement Index</span>
          <div className="text-2xl font-bold text-teal-600 mt-1">{totalPoints.toFixed(1)} / 20</div>
          <span className="text-[11px] text-emerald-600 font-semibold">Top 10% in Batch</span>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Verified Records</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{items.length}</div>
          <span className="text-[11px] text-slate-400">100% Institution Verified</span>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Hackathons</span>
          <div className="text-2xl font-bold text-indigo-600 mt-1">
            {items.filter((i) => i.category === "Hackathon").length}
          </div>
          <span className="text-[11px] text-slate-400">National Finalist</span>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Industry Certs</span>
          <div className="text-2xl font-bold text-sky-600 mt-1">
            {items.filter((i) => i.category === "Certification").length}
          </div>
          <span className="text-[11px] text-slate-400">AWS & DeepLearning.AI</span>
        </Card>
      </div>

      {/* Verified Engagement List */}
      <Card className="border border-slate-200 bg-white dark:bg-slate-900">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-4 w-4 text-teal-600" />
            <span>Verified Engagement & Certification Records</span>
          </CardTitle>
          <CardDescription>
            Records verified through institutional smart campus verification
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-teal-300 transition-colors bg-white dark:bg-slate-800 space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          item.category === "Hackathon" ? "rose" :
                          item.category === "Certification" ? "teal" : "indigo"
                        }
                        className="text-[10px] font-bold"
                      >
                        {item.category}
                      </Badge>
                      <span className="text-[11px] text-slate-400">{item.date}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500">{item.organizer}</p>
                  </div>

                  <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    +{item.scoreContribution} pts
                  </span>
                </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                    <span className="text-emerald-600 font-semibold flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Verified by Campus Authority
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedProofModal(item)}
                      className="text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1 text-[11px]"
                    >
                      View Proof <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* View Certificate Proof Modal */}
        {selectedProofModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-teal-600" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Official Certificate Proof
                    </h4>
                    <span className="text-[11px] text-slate-400">Institutional Credential Verification</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProofModal(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Certificate Canvas / Image Preview */}
              <div className="rounded-xl overflow-hidden border-2 border-teal-500/30 bg-slate-50 relative shadow-inner">
                {selectedProofModal.proofImageUrl ? (
                  <img
                    src={selectedProofModal.proofImageUrl}
                    alt={selectedProofModal.title}
                    className="w-full h-56 object-cover"
                  />
                ) : (
                  <div className="p-8 text-center space-y-2 bg-gradient-to-b from-teal-50 to-white">
                    <Award className="h-12 w-12 text-teal-600 mx-auto" />
                    <h5 className="text-base font-extrabold text-slate-900">{selectedProofModal.title}</h5>
                    <p className="text-xs text-slate-500">Issued by {selectedProofModal.organizer}</p>
                    <span className="text-[11px] font-mono text-slate-400 block">ID: CERT-2026-VAL-8821</span>
                  </div>
                )}

                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full border border-emerald-300 text-emerald-700 text-[10px] font-bold flex items-center gap-1 shadow-sm">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  Digitally Verified
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Recipient</span>
                  <strong className="text-slate-800">Alex Mercer (SCI-2024-CS084)</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Issuer / Authority</span>
                  <strong className="text-slate-800">{selectedProofModal.organizer}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Issue Date</span>
                  <strong className="text-slate-800">{selectedProofModal.date}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Score Contribution</span>
                  <strong className="text-emerald-600">+{selectedProofModal.scoreContribution} pts to Engagement</strong>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  size="sm"
                  onClick={() => setSelectedProofModal(null)}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs"
                >
                  Close Proof
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4 text-teal-600" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Upload Participation / Certification Proof
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Certificate / Event Title *</label>
                  <Input
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. AWS Solutions Architect or Hackathon Winner"
                    className="text-xs h-9"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Category *</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full rounded-md border border-slate-200 bg-white p-2 text-xs"
                    >
                      <option value="Certification">Certification</option>
                      <option value="Hackathon">Hackathon</option>
                      <option value="Club Activity">Club Activity</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Conference">Conference</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Issued Month / Year *</label>
                    <Input
                      required
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      placeholder="e.g. Oct 2026"
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Issuing Authority / Organizer *</label>
                  <Input
                    required
                    value={newOrganizer}
                    onChange={(e) => setNewOrganizer(e.target.value)}
                    placeholder="e.g. Google Cloud, AWS, ACM, College Club"
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Certificate Proof Image *</label>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploadedFileName(file.name);
                        setUploadedFilePreview(URL.createObjectURL(file));
                      }
                    }}
                    className="w-full text-xs p-1.5 rounded-lg border border-slate-200 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700"
                  />
                  {uploadedFileName && (
                    <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">
                      Selected: {uploadedFileName}
                    </span>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsModalOpen(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold"
                  >
                    Upload & Verify
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
};

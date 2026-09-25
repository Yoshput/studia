"use client";

import React, { useState, useEffect } from "react";
import {
  Route,
  Sparkles,
  Presentation,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  BookOpen,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  UploadCloud,
  FileText,
  Copy,
  Check,
  Download,
  Loader2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Matkul } from "@/types";

interface ActionItem {
  text: string;
  is_done: boolean;
}

interface RoadmapStep {
  step_number: number;
  phase: string;
  title: string;
  description: string;
  action_items: ActionItem[];
  key_concept?: string;
  is_completed: boolean;
}

interface Roadmap {
  id: string;
  user_id: string;
  matkul_id: string | null;
  matkul?: {
    id: string;
    nama: string;
    kode: string | null;
    warna: string | null;
  } | null;
  judul: string;
  topik: string;
  target_selesai: string | null;
  steps: RoadmapStep[];
  progress_percent: number;
  createdAt: string;
}

interface Flashcard {
  pertanyaan: string;
  jawaban: string;
}

interface PptSummary {
  id: string;
  judul_materi: string;
  nama_file: string;
  total_slides: number;
  summary_markdown: string;
  key_points: string[];
  flashcards: Flashcard[];
  createdAt: string;
  matkul?: {
    nama: string;
  } | null;
}

export default function RoadmapPage() {
  const [activeTab, setActiveTab] = useState<"roadmap" | "ppt">("roadmap");
  const [matkulList, setMatkulList] = useState<Matkul[]>([]);
  const [loading, setLoading] = useState(true);

  // Roadmap State
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);
  const [roadmapMatkulId, setRoadmapMatkulId] = useState("");
  const [roadmapTopik, setRoadmapTopik] = useState("");
  const [roadmapWeeks, setRoadmapWeeks] = useState(3);
  const [roadmapFokus, setRoadmapFokus] = useState("Persiapan Ujian & Pemahaman Teori");

  // PPT Summarizer State
  const [pptSummaries, setPptSummaries] = useState<PptSummary[]>([]);
  const [selectedPpt, setSelectedPpt] = useState<PptSummary | null>(null);
  const [pptFile, setPptFile] = useState<File | null>(null);
  const [pptMatkulId, setPptMatkulId] = useState("");
  const [pptTitle, setPptTitle] = useState("");
  const [isProcessingPpt, setIsProcessingPpt] = useState(false);
  const [pptTab, setPptTab] = useState<"summary" | "flashcards">("summary");
  const [revealedFlashcards, setRevealedFlashcards] = useState<Record<number, boolean>>({});
  const [copiedPpt, setCopiedPpt] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [matkulRes, roadmapRes, pptRes] = await Promise.all([
        fetch("/api/matkul"),
        fetch("/api/roadmap"),
        fetch("/api/materi/summarize-ppt"),
      ]);

      const matkulData = await matkulRes.json();
      const roadmapData = await roadmapRes.json();
      const pptData = await pptRes.json();

      if (matkulData.matkul) setMatkulList(matkulData.matkul);

      if (roadmapData.roadmaps) {
        setRoadmaps(roadmapData.roadmaps);
        if (roadmapData.roadmaps.length > 0 && !selectedRoadmap) {
          setSelectedRoadmap(roadmapData.roadmaps[0]);
        }
      }

      if (pptData.summaries) {
        setPptSummaries(pptData.summaries);
        if (pptData.summaries.length > 0 && !selectedPpt) {
          setSelectedPpt(pptData.summaries[0]);
        }
      }
    } catch (e) {
      console.error("Gagal memuat data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Generate Roadmap
  const handleGenerateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roadmapTopik.trim()) return;

    try {
      setIsGeneratingRoadmap(true);
      const matkulObj = matkulList.find((m) => m.id === roadmapMatkulId);
      const res = await fetch("/api/roadmap/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matkul_id: roadmapMatkulId || null,
          matkul_nama: matkulObj?.nama || "Umum",
          topik: roadmapTopik.trim(),
          target_minggu: roadmapWeeks,
          fokus: roadmapFokus,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.roadmap) {
          setRoadmaps([data.roadmap, ...roadmaps]);
          setSelectedRoadmap(data.roadmap);
          setShowRoadmapModal(false);
          setRoadmapTopik("");
        }
      }
    } catch (err) {
      console.error("Gagal generate roadmap:", err);
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  // Toggle Roadmap Checklist Item
  const handleToggleAction = async (roadmapId: string, stepNumber: number, actionIndex: number) => {
    try {
      const res = await fetch("/api/roadmap", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: roadmapId,
          step_number: stepNumber,
          action_index: actionIndex,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.roadmap) {
          setRoadmaps((prev) =>
            prev.map((r) => (r.id === data.roadmap.id ? data.roadmap : r))
          );
          if (selectedRoadmap?.id === data.roadmap.id) {
            setSelectedRoadmap(data.roadmap);
          }
        }
      }
    } catch (err) {
      console.error("Gagal toggle action item:", err);
    }
  };

  // Delete Roadmap
  const handleDeleteRoadmap = async (id: string) => {
    if (!confirm("Hapus roadmap belajar ini?")) return;
    try {
      const res = await fetch(`/api/roadmap?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        const rem = roadmaps.filter((r) => r.id !== id);
        setRoadmaps(rem);
        if (selectedRoadmap?.id === id) {
          setSelectedRoadmap(rem[0] || null);
        }
      }
    } catch (err) {
      console.error("Gagal menghapus roadmap:", err);
    }
  };

  // Handle PPT Upload & Summarize
  const handleProcessPpt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pptFile) return;

    try {
      setIsProcessingPpt(true);
      const formData = new FormData();
      formData.append("file", pptFile);
      if (pptMatkulId) formData.append("matkul_id", pptMatkulId);
      if (pptTitle) formData.append("judul_materi", pptTitle);

      const res = await fetch("/api/materi/summarize-ppt", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.summary) {
        setPptSummaries([data.summary, ...pptSummaries]);
        setSelectedPpt(data.summary);
        setPptFile(null);
        setPptTitle("");
      } else {
        alert(data.error || "Gagal memproses PPTX");
      }
    } catch (err) {
      console.error("Error process PPT:", err);
      alert("Terjadi kesalahan saat memproses PPT");
    } finally {
      setIsProcessingPpt(false);
    }
  };

  const toggleFlashcard = (idx: number) => {
    setRevealedFlashcards((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const copyPptMarkdown = () => {
    if (!selectedPpt) return;
    navigator.clipboard.writeText(selectedPpt.summary_markdown);
    setCopiedPpt(true);
    setTimeout(() => setCopiedPpt(false), 2000);
  };

  const downloadPptMarkdown = () => {
    if (!selectedPpt) return;
    const blob = new Blob([selectedPpt.summary_markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedPpt.judul_materi.replace(/[^a-zA-Z0-9_-]/g, "_")}_ringkasan.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-ios-accent/10 text-ios-accent mb-1 border border-ios-accent/20">
            <Route className="w-3 h-3" />
            <span>Study Workflow &amp; AI Material Engine</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ios-textPrimary">
            Alur Belajar &amp; Rangkuman PPT
          </h1>
          <p className="text-[13px] text-ios-textSecondary">
            Bikin roadmap belajar bertahap untuk ujian/tubes dan rangkum slide presentasi PPTX tanpa beban penyimpanan.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-ios-surfaceSecondary rounded-2xl border border-ios-border text-[12px] font-semibold">
          <button
            onClick={() => setActiveTab("roadmap")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5",
              activeTab === "roadmap"
                ? "bg-ios-surface text-ios-accent shadow-xs"
                : "text-ios-textSecondary hover:text-ios-textPrimary"
            )}
          >
            <Route className="w-3.5 h-3.5" />
            <span>Roadmap Belajar</span>
          </button>
          <button
            onClick={() => setActiveTab("ppt")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5",
              activeTab === "ppt"
                ? "bg-ios-surface text-ios-accent shadow-xs"
                : "text-ios-textSecondary hover:text-ios-textPrimary"
            )}
          >
            <Presentation className="w-3.5 h-3.5" />
            <span>PPT Summarizer</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ROADMAP BELAJAR */}
      {/* ========================================================================= */}
      {activeTab === "roadmap" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Roadmap List & New Button (4 Cols) */}
          <div className="lg:col-span-4 space-y-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowRoadmapModal(true)}
              className="w-full gap-2 py-2.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Roadmap Baru</span>
            </Button>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-0.5">
              {loading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="w-5 h-5 animate-spin text-ios-accent" />
                </div>
              ) : roadmaps.length === 0 ? (
                <Card className="p-6 text-center border-dashed">
                  <Route className="w-8 h-8 text-ios-textSecondary/40 mx-auto mb-2" />
                  <p className="text-[13px] font-semibold text-ios-textPrimary">
                    Belum ada roadmap belajar
                  </p>
                  <p className="text-[11.5px] text-ios-textSecondary mt-0.5">
                    Buat alur belajar terstruktur untuk persiapan ujian, sertifikasi, atau tubes.
                  </p>
                </Card>
              ) : (
                roadmaps.map((r) => {
                  const isSelected = selectedRoadmap?.id === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setSelectedRoadmap(r)}
                      className={cn(
                        "w-full text-left p-3.5 rounded-2xl border transition-all select-none",
                        isSelected
                          ? "bg-ios-accent/10 border-ios-accent/40 shadow-xs"
                          : "bg-ios-surface hover:bg-ios-surfaceSecondary border-ios-border"
                      )}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-ios-surfaceSecondary border border-ios-border text-ios-textSecondary truncate max-w-[150px]">
                          {r.matkul?.nama || "Umum"}
                        </span>
                        <span className="text-[11px] font-bold text-ios-accent">
                          {r.progress_percent}% Selesai
                        </span>
                      </div>

                      <h4 className={cn("text-[13.5px] font-bold line-clamp-1", isSelected ? "text-ios-accent" : "text-ios-textPrimary")}>
                        {r.judul}
                      </h4>

                      {/* Progress bar */}
                      <div className="w-full h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden mt-2">
                        <div
                          className="h-full bg-ios-accent rounded-full transition-all duration-300"
                          style={{ width: `${r.progress_percent}%` }}
                        />
                      </div>

                      <div className="mt-2 flex items-center justify-between text-[10.5px] text-ios-textSecondary">
                        <span>{r.steps?.length || 0} Tahapan</span>
                        <span>{new Date(r.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Visual Interactive Stepper (8 Cols) */}
          <div className="lg:col-span-8">
            {selectedRoadmap ? (
              <Card className="p-5 border-ios-border shadow-sm space-y-5">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-ios-border">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-ios-surfaceSecondary border border-ios-border text-ios-textSecondary">
                        {selectedRoadmap.matkul?.nama || "Mata Kuliah"}
                      </span>
                      <span className="text-[11px] font-bold text-ios-accent">
                        {selectedRoadmap.progress_percent}% Tuntas
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-ios-textPrimary mt-1">
                      {selectedRoadmap.judul}
                    </h3>
                    <p className="text-[12.5px] text-ios-textSecondary mt-0.5">
                      Fokus: {selectedRoadmap.topik}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteRoadmap(selectedRoadmap.id)}
                    className="p-2 rounded-xl border border-ios-border bg-ios-surfaceSecondary hover:bg-red-500/10 text-ios-textSecondary hover:text-red-500 self-end sm:self-auto transition-colors"
                    title="Hapus Roadmap"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Stepper Timeline */}
                <div className="space-y-6 relative pl-3 sm:pl-4 before:absolute before:top-3 before:bottom-3 before:left-6 before:w-0.5 before:bg-ios-border/80">
                  {selectedRoadmap.steps?.map((step, sIdx) => {
                    const allStepDone = step.action_items?.every((a) => a.is_done);
                    return (
                      <div key={sIdx} className="relative flex items-start gap-4">
                        {/* Step Circle Indicator */}
                        <div
                          className={cn(
                            "relative z-10 w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] border-2 transition-all flex-shrink-0 mt-0.5",
                            allStepDone
                              ? "bg-emerald-500 border-emerald-500 text-white shadow-xs"
                              : "bg-ios-surface border-ios-accent text-ios-accent"
                          )}
                        >
                          {allStepDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.step_number}
                        </div>

                        {/* Step Card */}
                        <div className="flex-1 p-4 rounded-2xl bg-ios-surfaceSecondary/50 border border-ios-border shadow-2xs space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10.5px] font-bold uppercase tracking-wider text-ios-accent">
                              {step.phase}
                            </span>
                            {step.key_concept && (
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                Kunci: {step.key_concept}
                              </span>
                            )}
                          </div>

                          <div>
                            <h4 className="text-[14px] font-bold text-ios-textPrimary leading-snug">
                              {step.title}
                            </h4>
                            <p className="text-[12px] text-ios-textSecondary mt-1 leading-relaxed">
                              {step.description}
                            </p>
                          </div>

                          {/* Action Items Checklist */}
                          {step.action_items && step.action_items.length > 0 && (
                            <div className="pt-2 border-t border-ios-border/60 space-y-1.5">
                              {step.action_items.map((act, aIdx) => (
                                <button
                                  key={aIdx}
                                  type="button"
                                  onClick={() => handleToggleAction(selectedRoadmap.id, step.step_number, aIdx)}
                                  className="w-full text-left flex items-start gap-2.5 p-1.5 rounded-lg hover:bg-ios-surface transition-colors group"
                                >
                                  {act.is_done ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-ios-textSecondary/60 group-hover:text-ios-accent flex-shrink-0 mt-0.5" />
                                  )}
                                  <span
                                    className={cn(
                                      "text-[12px] leading-snug",
                                      act.is_done
                                        ? "line-through text-ios-textSecondary"
                                        : "text-ios-textPrimary font-medium"
                                    )}
                                  >
                                    {act.text}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ) : (
              <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed min-h-[400px]">
                <Route className="w-12 h-12 text-ios-textSecondary/30 mb-3" />
                <h3 className="text-base font-bold text-ios-textPrimary">
                  Pilih Roadmap atau Buat Alur Baru
                </h3>
                <p className="text-[12.5px] text-ios-textSecondary mt-1 max-w-sm">
                  AI akan membagi tujuan belajarmu menjadi tahapan mingguan dengan checklist aksi yang jelas.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowRoadmapModal(true)}
                  className="mt-4 gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Rancang Roadmap Sekarang</span>
                </Button>
              </Card>
            )}
          </div>

          {/* Modal Generate Roadmap */}
          {showRoadmapModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
              <div className="w-full max-w-md bg-ios-surface rounded-3xl p-6 border border-ios-border shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[16px] font-bold text-ios-textPrimary flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-ios-accent" />
                    <span>Rancang Roadmap Belajar AI</span>
                  </h3>
                  <button
                    onClick={() => setShowRoadmapModal(false)}
                    className="text-ios-textSecondary hover:text-ios-textPrimary p-1"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleGenerateRoadmap} className="space-y-3.5">
                  <div>
                    <label className="block text-[12px] font-semibold text-ios-textPrimary mb-1">
                      Mata Kuliah
                    </label>
                    <select
                      value={roadmapMatkulId}
                      onChange={(e) => setRoadmapMatkulId(e.target.value)}
                      className="w-full p-2.5 text-[12.5px] bg-ios-surfaceSecondary border border-ios-border rounded-xl focus:outline-none focus:ring-1 focus:ring-ios-accent"
                    >
                      <option value="">Umum / Tidak Terikat Matkul</option>
                      {matkulList.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.kode ? `[${m.kode}] ` : ""}{m.nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-ios-textPrimary mb-1">
                      Topik atau Tujuan Belajar
                    </label>
                    <input
                      type="text"
                      required
                      value={roadmapTopik}
                      onChange={(e) => setRoadmapTopik(e.target.value)}
                      placeholder="Contoh: Persiapan UTS Keamanan Siber (Kriptografi)"
                      className="w-full p-2.5 text-[12.5px] bg-ios-surfaceSecondary border border-ios-border rounded-xl focus:outline-none focus:ring-1 focus:ring-ios-accent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-semibold text-ios-textPrimary mb-1">
                        Durasi Target
                      </label>
                      <select
                        value={roadmapWeeks}
                        onChange={(e) => setRoadmapWeeks(Number(e.target.value))}
                        className="w-full p-2.5 text-[12.5px] bg-ios-surfaceSecondary border border-ios-border rounded-xl focus:outline-none"
                      >
                        <option value={2}>2 Minggu</option>
                        <option value={3}>3 Minggu</option>
                        <option value={4}>4 Minggu</option>
                        <option value={6}>6 Minggu</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[12px] font-semibold text-ios-textPrimary mb-1">
                        Fokus Utama
                      </label>
                      <select
                        value={roadmapFokus}
                        onChange={(e) => setRoadmapFokus(e.target.value)}
                        className="w-full p-2.5 text-[12.5px] bg-ios-surfaceSecondary border border-ios-border rounded-xl focus:outline-none"
                      >
                        <option value="Persiapan Ujian & Teori">Persiapan Ujian</option>
                        <option value="Pengerjaan Tugas Besar & Coding">Tubes / Projek</option>
                        <option value="Pemahaman Konsep dari Nol">Konsep Dasar</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowRoadmapModal(false)}
                      className="flex-1"
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isGeneratingRoadmap || !roadmapTopik.trim()}
                      className="flex-1 gap-1.5 shadow-sm"
                    >
                      {isGeneratingRoadmap ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      <span>Susun Roadmap</span>
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PPT SUMMARIZER (ZERO-RETENTION) */}
      {/* ========================================================================= */}
      {activeTab === "ppt" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Upload Form & History (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Zero-Retention Privacy Callout */}
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-start gap-2.5 text-[12px] leading-relaxed">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-500" />
              <div>
                <strong className="block font-semibold">Privasi Terjamin (Zero-Retention)</strong>
                <span>Berkas PPTX Anda hanya dibaca di memori RAM dan otomatis dibersihkan seketika setelah teks diekstraksi. Berkas fisik tidak disimpan di server.</span>
              </div>
            </div>

            {/* Upload Card */}
            <Card className="p-5 border-ios-border shadow-sm space-y-3.5">
              <h3 className="text-[15px] font-bold text-ios-textPrimary flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-ios-accent" />
                <span>Unggah Slide Presentasi (.pptx)</span>
              </h3>

              <form onSubmit={handleProcessPpt} className="space-y-3">
                {/* File Dropzone */}
                <label className="border-2 border-dashed border-ios-border hover:border-ios-accent/50 rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-ios-surfaceSecondary/40 group">
                  <input
                    type="file"
                    accept=".pptx"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setPptFile(e.target.files[0]);
                        if (!pptTitle) {
                          setPptTitle(e.target.files[0].name.replace(/\.pptx$/i, ""));
                        }
                      }
                    }}
                    className="hidden"
                  />
                  <Presentation className="w-8 h-8 text-ios-accent/70 group-hover:scale-110 transition-transform mb-2" />
                  {pptFile ? (
                    <div>
                      <p className="text-[13px] font-bold text-ios-accent truncate max-w-[220px]">
                        {pptFile.name}
                      </p>
                      <p className="text-[11px] text-ios-textSecondary mt-0.5">
                        {(pptFile.size / (1024 * 1024)).toFixed(2)} MB • Siap diproses
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[12.5px] font-semibold text-ios-textPrimary">
                        Klik atau seret berkas .pptx ke sini
                      </p>
                      <p className="text-[11px] text-ios-textSecondary mt-0.5">
                        Maksimum 25 MB per berkas
                      </p>
                    </div>
                  )}
                </label>

                <div>
                  <label className="block text-[11.5px] font-semibold text-ios-textPrimary mb-1">
                    Judul Ringkasan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={pptTitle}
                    onChange={(e) => setPptTitle(e.target.value)}
                    placeholder="Contoh: Bab 4 - Routing Protocols"
                    className="w-full p-2.5 text-[12px] bg-ios-surfaceSecondary border border-ios-border rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11.5px] font-semibold text-ios-textPrimary mb-1">
                    Kaitkan ke Mata Kuliah
                  </label>
                  <select
                    value={pptMatkulId}
                    onChange={(e) => setPptMatkulId(e.target.value)}
                    className="w-full p-2.5 text-[12px] bg-ios-surfaceSecondary border border-ios-border rounded-xl focus:outline-none"
                  >
                    <option value="">Umum / Tidak Terikat Matkul</option>
                    {matkulList.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.kode ? `[${m.kode}] ` : ""}{m.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isProcessingPpt || !pptFile}
                  className="w-full gap-2 py-2.5 shadow-sm"
                >
                  {isProcessingPpt ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>{isProcessingPpt ? "Mengekstrak & Merangkum..." : "Rangkum Materi via AI"}</span>
                </Button>
              </form>
            </Card>

            {/* History of PPT Summaries */}
            <div className="space-y-2">
              <h4 className="text-[13px] font-bold text-ios-textPrimary">
                Riwayat Rangkuman Slide ({pptSummaries.length})
              </h4>
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-0.5">
                {pptSummaries.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedPpt(s)}
                    className={cn(
                      "w-full text-left p-3 rounded-2xl border transition-all select-none",
                      selectedPpt?.id === s.id
                        ? "bg-ios-accent/10 border-ios-accent/40 shadow-xs"
                        : "bg-ios-surface hover:bg-ios-surfaceSecondary border-ios-border"
                    )}
                  >
                    <div className="flex items-center justify-between text-[10px] text-ios-textSecondary mb-1">
                      <span>{s.total_slides} Slide</span>
                      <span>{new Date(s.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</span>
                    </div>
                    <h5 className="text-[13px] font-bold text-ios-textPrimary line-clamp-1">
                      {s.judul_materi}
                    </h5>
                    <p className="text-[11px] text-ios-textSecondary truncate mt-0.5">
                      {s.nama_file}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Summary & Interactive Flashcards (7 Cols) */}
          <div className="lg:col-span-7">
            {selectedPpt ? (
              <Card className="p-5 border-ios-border shadow-sm space-y-4 min-h-[580px] flex flex-col">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-ios-border">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-ios-surfaceSecondary border border-ios-border text-ios-textSecondary">
                        {selectedPpt.total_slides} Slide
                      </span>
                      {selectedPpt.matkul && (
                        <span className="text-[11px] font-semibold text-ios-accent">
                          {selectedPpt.matkul.nama}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-ios-textPrimary mt-1">
                      {selectedPpt.judul_materi}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      onClick={copyPptMarkdown}
                      className="p-2 rounded-xl border border-ios-border bg-ios-surfaceSecondary hover:bg-ios-surface text-ios-textSecondary hover:text-ios-textPrimary transition-colors"
                      title="Salin Rangkuman"
                    >
                      {copiedPpt ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={downloadPptMarkdown}
                      className="p-2 rounded-xl border border-ios-border bg-ios-surfaceSecondary hover:bg-ios-surface text-ios-textSecondary hover:text-ios-textPrimary transition-colors"
                      title="Unduh .md"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sub Tab View: Rangkuman vs Flashcard */}
                <div className="flex items-center gap-2 border-b border-ios-border/60 pb-2">
                  <button
                    onClick={() => setPptTab("summary")}
                    className={cn(
                      "text-[12.5px] font-semibold pb-1 border-b-2 transition-all",
                      pptTab === "summary"
                        ? "border-ios-accent text-ios-accent"
                        : "border-transparent text-ios-textSecondary hover:text-ios-textPrimary"
                    )}
                  >
                    Rangkuman Materi
                  </button>
                  <button
                    onClick={() => setPptTab("flashcards")}
                    className={cn(
                      "text-[12.5px] font-semibold pb-1 border-b-2 transition-all flex items-center gap-1.5",
                      pptTab === "flashcards"
                        ? "border-ios-accent text-ios-accent"
                        : "border-transparent text-ios-textSecondary hover:text-ios-textPrimary"
                    )}
                  >
                    <span>Kartu Latihan (Flashcards)</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-ios-accent/15 text-ios-accent font-bold">
                      {selectedPpt.flashcards?.length || 0}
                    </span>
                  </button>
                </div>

                {/* Tab 1: Rangkuman Markdown */}
                {pptTab === "summary" && (
                  <div className="flex-1 overflow-y-auto max-h-[500px] pr-1 space-y-4">
                    {/* Key points badges */}
                    {selectedPpt.key_points && selectedPpt.key_points.length > 0 && (
                      <div className="p-3.5 rounded-2xl bg-ios-surfaceSecondary/60 border border-ios-border space-y-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-ios-accent">
                          Poin Inti yang Harus Dikuasai:
                        </span>
                        <ul className="list-disc list-inside space-y-1 text-[12px] text-ios-textPrimary leading-snug">
                          {selectedPpt.key_points.map((kp, idx) => (
                            <li key={idx}>{kp}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="text-[13px] leading-relaxed text-ios-textPrimary whitespace-pre-wrap font-sans p-3 bg-ios-surfaceSecondary/30 rounded-2xl border border-ios-border/60">
                      {selectedPpt.summary_markdown}
                    </div>
                  </div>
                )}

                {/* Tab 2: Interactive Flashcards */}
                {pptTab === "flashcards" && (
                  <div className="flex-1 overflow-y-auto max-h-[500px] pr-1 space-y-3">
                    {selectedPpt.flashcards && selectedPpt.flashcards.length > 0 ? (
                      selectedPpt.flashcards.map((fc, idx) => {
                        const isRevealed = revealedFlashcards[idx];
                        return (
                          <div
                            key={idx}
                            className="p-4 rounded-2xl bg-ios-surfaceSecondary/60 border border-ios-border transition-all space-y-2"
                          >
                            <div className="flex items-center justify-between text-[11px] text-ios-accent font-bold">
                              <span>Kartu #{idx + 1}</span>
                              <span className="text-[10px] font-normal text-ios-textSecondary">
                                Active Recall
                              </span>
                            </div>

                            <p className="text-[13.5px] font-bold text-ios-textPrimary">
                              {fc.pertanyaan}
                            </p>

                            <button
                              type="button"
                              onClick={() => toggleFlashcard(idx)}
                              className="text-[11.5px] font-semibold text-ios-accent hover:underline flex items-center gap-1 pt-1"
                            >
                              <span>{isRevealed ? "Sembunyikan Jawaban" : "Tampilkan Jawaban"}</span>
                              {isRevealed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>

                            {isRevealed && (
                              <div className="p-3 rounded-xl bg-ios-surface border border-ios-border/80 text-[12.5px] text-ios-textPrimary leading-relaxed animate-in fade-in duration-200">
                                {fc.jawaban}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-8 text-center text-ios-textSecondary text-[12.5px]">
                        Belum ada flashcard untuk ringkasan ini.
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ) : (
              <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed min-h-[400px]">
                <Presentation className="w-12 h-12 text-ios-textSecondary/30 mb-3" />
                <h3 className="text-base font-bold text-ios-textPrimary">
                  Unggah atau Pilih Rangkuman PPT
                </h3>
                <p className="text-[12.5px] text-ios-textSecondary mt-1 max-w-sm">
                  Unggah berkas presentasi dosen di formulir sebelah kiri untuk menghasilkan ringkasan poin dan kuis flashcard mandiri.
                </p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

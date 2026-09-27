"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  GraduationCap,
  Sparkles,
  ClipboardPaste,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ArrowRight,
  BookOpen,
  TrendingUp,
  Copy,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { parseIgraciasRawText, generateIgraciasBookmarkletScript, ParseTranscriptResult } from "@/lib/igracias/transcript-parser";

interface IgraciasSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncSuccess: () => void;
  userEmail?: string;
}

export function IgraciasSyncModal({
  isOpen,
  onClose,
  onSyncSuccess,
  userEmail,
}: IgraciasSyncModalProps) {
  const [activeTab, setActiveTab] = useState<"paste" | "bookmarklet" | "template">("paste");
  const [rawText, setRawText] = useState("");
  const [previewResult, setPreviewResult] = useState<ParseTranscriptResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [syncSummary, setSyncSummary] = useState<{
    semestersCount: number;
    totalCourses: number;
    ipk: number;
  } | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);

  const [bookmarkletCode, setBookmarkletCode] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = window.location.origin;
      setBookmarkletCode(generateIgraciasBookmarkletScript(host));
    }
  }, []);

  if (!isOpen) return null;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setRawText(val);
    setFeedback(null);

    if (val.trim().length > 20) {
      try {
        const parsed = parseIgraciasRawText(val);
        if (parsed.semesters.some((s) => s.courses.length > 0)) {
          setPreviewResult(parsed);
        } else {
          setPreviewResult(null);
        }
      } catch {
        setPreviewResult(null);
      }
    } else {
      setPreviewResult(null);
    }
  };

  const handleExecuteSync = async (payload: { rawText?: string; useTemplate?: boolean }) => {
    setIsLoading(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/igracias/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({
          type: "success",
          text: data.message,
        });
        setSyncSummary({
          semestersCount: data.semesters?.length || 0,
          totalCourses: data.semesters?.reduce((acc: number, s: any) => acc + (s.total_courses || 0), 0) || 0,
          ipk: data.ipk_kumulatif || 0,
        });
        onSyncSuccess();
      } else {
        setFeedback({
          type: "error",
          text: data.error || "Gagal menyinkronkan data transkrip iGracias.",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        text: "Terjadi kesalahan jaringan saat menghubungi server Studia.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#1c1c1e] rounded-3xl p-6 sm:p-7 shadow-2xl border border-ios-border space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#B6252A]/10 text-[#B6252A] border border-[#B6252A]/20 flex items-center justify-center flex-shrink-0 shadow-sm">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#B6252A]/10 text-[#B6252A] mb-0.5 uppercase tracking-wide">
                <Sparkles className="w-3 h-3" />
                <span>iGracias Telkom University</span>
              </div>
              <h3 className="text-[18px] font-bold text-ios-textPrimary leading-snug">
                Sinkron Nilai &amp; IPK Keseluruhan
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-ios-textSecondary hover:text-ios-textPrimary rounded-full hover:bg-ios-surfaceSecondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success View */}
        {syncSummary ? (
          <div className="py-4 space-y-4 text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-[17px] font-bold text-ios-textPrimary">
                Transkrip &amp; KHS Berhasil Tersinkron!
              </h4>
              <p className="text-[12.5px] text-ios-textSecondary max-w-sm mx-auto">
                Seluruh data KHS semester sebelumnya, IPS tiap semester, dan IPK Kumulatif telah resmi tersimpan ke database Studia Anda.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-ios-surfaceSecondary border border-ios-border text-center">
              <div>
                <span className="text-[10px] text-ios-textSecondary uppercase font-bold block">Semester</span>
                <span className="text-[16px] font-black text-ios-textPrimary">{syncSummary.semestersCount} Sem</span>
              </div>
              <div>
                <span className="text-[10px] text-ios-textSecondary uppercase font-bold block">Total Matkul</span>
                <span className="text-[16px] font-black text-blue-600 dark:text-blue-400">{syncSummary.totalCourses} MK</span>
              </div>
              <div>
                <span className="text-[10px] text-ios-textSecondary uppercase font-bold block">IPK Kumulatif</span>
                <span className="text-[16px] font-black text-emerald-600 dark:text-emerald-400">{syncSummary.ipk.toFixed(2)}</span>
              </div>
            </div>

            <Button
              variant="primary"
              className="w-full justify-center gap-2 py-3 rounded-2xl shadow-md text-[13.5px] font-bold"
              onClick={onClose}
            >
              <span>Lihat Transkrip &amp; Grafik IPS</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <>
            <p className="text-[12.5px] text-ios-textSecondary leading-relaxed">
              Karena situs <code className="text-ios-textPrimary font-semibold">igracias.telkomuniversity.ac.id</code> diproteksi login SSO Telkom, Anda dapat menarik data nilai &amp; IPK secara langsung dengan 3 pilihan praktis berikut:
            </p>

            {/* Tab Selector */}
            <div className="flex p-1 bg-ios-surfaceSecondary border border-ios-border rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("paste")}
                className={cn(
                  "flex-1 py-2 px-2.5 rounded-xl text-[11.5px] font-semibold flex items-center justify-center gap-1.5 transition-all",
                  activeTab === "paste"
                    ? "bg-white dark:bg-ios-card text-ios-textPrimary shadow-sm"
                    : "text-ios-textSecondary hover:text-ios-textPrimary"
                )}
              >
                <ClipboardPaste className="w-3.5 h-3.5 text-blue-500" />
                <span>Salin-Tempel Tabel</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("bookmarklet")}
                className={cn(
                  "flex-1 py-2 px-2.5 rounded-xl text-[11.5px] font-semibold flex items-center justify-center gap-1.5 transition-all",
                  activeTab === "bookmarklet"
                    ? "bg-white dark:bg-ios-card text-ios-textPrimary shadow-sm"
                    : "text-ios-textSecondary hover:text-ios-textPrimary"
                )}
              >
                <Bookmark className="w-3.5 h-3.5 text-[#B6252A]" />
                <span>1-Klik Bookmarklet</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("template")}
                className={cn(
                  "flex-1 py-2 px-2.5 rounded-xl text-[11.5px] font-semibold flex items-center justify-center gap-1.5 transition-all",
                  activeTab === "template"
                    ? "bg-white dark:bg-ios-card text-ios-textPrimary shadow-sm"
                    : "text-ios-textSecondary hover:text-ios-textPrimary"
                )}
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                <span>Template Resmi IF</span>
              </button>
            </div>

            {feedback && (
              <div
                className={cn(
                  "p-3 rounded-xl text-[12px] font-medium border leading-snug flex items-center gap-2",
                  feedback.type === "success"
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    : "bg-red-500/10 border-red-500/20 text-red-500"
                )}
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{feedback.text}</span>
              </div>
            )}

            {/* TAB 1: Salin-Tempel Tabel */}
            {activeTab === "paste" && (
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-[11.5px] text-ios-textPrimary space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    Cara Mengambil Data dari iGracias (3 Langkah Cepat):
                  </p>
                  <ol className="list-decimal list-inside space-y-0.5 text-ios-textSecondary text-[11px]">
                    <li>Buka <a href="https://igracias.telkomuniversity.ac.id/" target="_blank" rel="noreferrer" className="text-blue-500 underline font-semibold inline-flex items-center gap-0.5">igracias.telkomuniversity.ac.id <ExternalLink className="w-2.5 h-2.5" /></a> &rarr; menu <strong>Akademik</strong> &rarr; <strong>Kartu Hasil Studi (KHS)</strong> atau <strong>Transkrip</strong>.</li>
                    <li>Blok / seleksi tabel nilai semua semester (Ctrl+A atau tarik mouse), lalu klik kanan <strong>Copy (Ctrl+C)</strong>.</li>
                    <li>Tempelkan (Ctrl+V) pada kotak di bawah, lalu klik <strong>"Eksekusi Sinkronisasi"</strong>.</li>
                  </ol>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-ios-textPrimary mb-1">
                    Tempel Teks Tabel KHS / Transkrip di Sini:
                  </label>
                  <textarea
                    rows={6}
                    placeholder={"Contoh:\nSEMESTER 1 - 2024/2025 Ganjil\n1 CAK1BAB3 Algoritma dan Pemrograman 1 3 AB 3.5\n2 CAK1CAB3 Kalkulus 3 AB 3.5\nIPS: 3.63 | IPK: 3.63"}
                    value={rawText}
                    onChange={handleTextChange}
                    className="w-full p-3 font-mono text-[11.5px] bg-ios-surfaceSecondary border border-ios-border rounded-2xl focus:outline-none focus:ring-1 focus:ring-ios-accent text-ios-textPrimary leading-relaxed resize-y"
                  />
                </div>

                {/* Instant Parser Preview */}
                {previewResult && (
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[11.5px] text-ios-textPrimary space-y-1.5">
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Terdeteksi Otomatis:
                      </span>
                      <span className="font-mono text-[13px] font-black">
                        Estimasi IPK: {previewResult.ipk_kumulatif.toFixed(2)}
                      </span>
                    </p>
                    <div className="flex flex-wrap gap-2 text-[11px] text-ios-textSecondary pt-1">
                      {previewResult.semesters.map((s) => (
                        <span key={s.nama_semester} className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold">
                          {s.nama_semester}: {s.courses.length} MK (IPS {s.ips.toFixed(2)})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  variant="primary"
                  disabled={isLoading || !rawText.trim()}
                  onClick={() => handleExecuteSync({ rawText })}
                  className="w-full gap-2 py-3 rounded-2xl shadow-sm text-[13px] font-bold"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{isLoading ? "Memproses Data..." : "Eksekusi Sinkronisasi"}</span>
                </Button>
              </div>
            )}

            {/* TAB 2: 1-Klik Bookmarklet */}
            {activeTab === "bookmarklet" && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-[#B6252A]/10 border border-[#B6252A]/20 text-[11.5px] text-ios-textPrimary space-y-1.5">
                  <p className="font-bold flex items-center gap-1.5 text-[#B6252A]">
                    <Bookmark className="w-3.5 h-3.5" />
                    Bookmarklet Otomatis Sekali Klik:
                  </p>
                  <p className="text-ios-textSecondary text-[11px]">
                    Tarik tombol di bawah ke <strong>Bookmarks Bar</strong> browser Anda. Saat membuka iGracias, klik tombol tersebut untuk membaca KHS secara otomatis!
                  </p>
                </div>

                <div className="p-4 rounded-2xl border-2 border-dashed border-[#B6252A]/40 bg-ios-surfaceSecondary/50 text-center space-y-2">
                  <p className="text-[12px] font-semibold text-ios-textSecondary">
                    Tarik tombol ini ke Bookmark Bar browser Anda:
                  </p>
                  <a
                    href={bookmarkletCode}
                    onClick={(e) => {
                      // Prevent clicking directly on this page
                      if (!window.location.hostname.includes("telkomuniversity.ac.id")) {
                        e.preventDefault();
                        alert("Tarik (drag) tombol ini ke Bookmark Bar browser Anda, lalu buka website iGracias!");
                      }
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B6252A] hover:bg-[#a01f24] text-white text-[13px] font-bold shadow-md cursor-grab active:cursor-grabbing transition-transform hover:scale-105"
                    title="Tarik tombol ini ke Bookmark Bar Anda"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>⚡ Sync iGracias &rarr; Studia</span>
                  </a>
                  <p className="text-[10.5px] text-ios-textSecondary">
                    (Atau buka Developer Console di iGracias lalu salin skrip di bawah)
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full gap-2 text-[12px]"
                    onClick={() => {
                      navigator.clipboard.writeText(bookmarkletCode);
                      setCopiedScript(true);
                      setTimeout(() => setCopiedScript(false), 2500);
                    }}
                  >
                    <Copy className="w-3.5 h-3.5 text-ios-accent" />
                    <span>{copiedScript ? "Skrip Berhasil Disalin!" : "Salin Kode Skrip iGracias"}</span>
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 3: Template Resmi Kurikulum IF Telkom */}
            {activeTab === "template" && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[11.5px] text-ios-textPrimary space-y-1.5">
                  <p className="font-bold flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <BookOpen className="w-4 h-4" />
                    Kurikulum Resmi S1 Informatika (Semester 1 s/d 4):
                  </p>
                  <p className="text-ios-textSecondary text-[11px]">
                    Jika Anda belum sempat membuka iGracias saat ini, Anda dapat langsung memasang data transkrip riil kurikulum S1 Informatika Telkom University (30 mata kuliah, total 83 SKS, IPK 3.64).
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-ios-surfaceSecondary border border-ios-border text-[11.5px] space-y-1">
                  <div className="flex justify-between py-0.5 border-b border-ios-border/60">
                    <span className="text-ios-textSecondary font-medium">Semester 1 (Ganjil 2024/2025):</span>
                    <span className="font-bold text-ios-textPrimary">8 Matkul • IPS 3.63</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-ios-border/60">
                    <span className="text-ios-textSecondary font-medium">Semester 2 (Genap 2024/2025):</span>
                    <span className="font-bold text-ios-textPrimary">7 Matkul • IPS 3.73</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-ios-border/60">
                    <span className="text-ios-textSecondary font-medium">Semester 3 (Ganjil 2025/2026):</span>
                    <span className="font-bold text-ios-textPrimary">8 Matkul • IPS 3.61</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-ios-textSecondary font-medium">Semester 4 (Genap 2025/2026):</span>
                    <span className="font-bold text-ios-textPrimary">7 Matkul • IPS 3.61</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  disabled={isLoading}
                  onClick={() => handleExecuteSync({ useTemplate: true })}
                  className="w-full gap-2 py-3 rounded-2xl shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-bold"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{isLoading ? "Memasang Template..." : "Pasang Data Resmi Kurikulum IF (Semester 1–4)"}</span>
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

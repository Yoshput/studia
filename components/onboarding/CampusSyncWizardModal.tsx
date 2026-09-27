"use client";

import React, { useState, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  GraduationCap,
  UploadCloud,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  FileCheck,
  Sparkles,
  ArrowRight,
  BookOpen,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CampusSyncWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncSuccess: () => void;
  userName?: string;
}

export function CampusSyncWizardModal({
  isOpen,
  onClose,
  onSyncSuccess,
  userName,
}: CampusSyncWizardModalProps) {
  const [syncMode, setSyncMode] = useState<"url" | "file">("file");
  const [lmsUrl, setLmsUrl] = useState("");
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [syncResult, setSyncResult] = useState<{
    createdCount: number;
    updatedCount: number;
    totalEvents: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".ics") && !file.name.toLowerCase().endsWith(".txt")) {
      setFeedback({
        type: "error",
        text: "File harus berekstensi .ics (file kalender CeLOE Moodle).",
      });
      return;
    }
    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setFileContent(text);
      executeSync({ icsContent: text });
    };
    reader.readAsText(file);
  };

  const executeSync = async (payload: { icsContent?: string; icalUrl?: string }) => {
    setIsLoading(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/lms/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({
          type: "success",
          text: data.message || "Sinkronisasi akun CeLOE berhasil!",
        });
        setSyncResult({
          createdCount: data.createdCount || 0,
          updatedCount: data.updatedCount || 0,
          totalEvents: data.totalEvents || 0,
        });
        onSyncSuccess();
      } else {
        if (data.cloudflareBlocked) {
          setSyncMode("file");
        }
        setFeedback({
          type: "error",
          text: data.error || "Gagal menyinkronkan data kalender kampus.",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        text: "Terjadi kesalahan jaringan saat memproses sinkronisasi.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lmsUrl.trim()) {
      setFeedback({
        type: "error",
        text: "Silakan masukkan tautan URL kalender CeLOE Anda.",
      });
      return;
    }
    executeSync({ icalUrl: lmsUrl.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#1c1c1e] rounded-3xl p-6 sm:p-7 shadow-2xl border border-ios-border overflow-hidden animate-in zoom-in-95 duration-200 space-y-4">
        {/* Glow ambient decoration */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-ios-accent/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center flex-shrink-0 shadow-sm">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 mb-0.5 uppercase tracking-wide">
                <Sparkles className="w-3 h-3" />
                <span>Telkom University Auto-Sync</span>
              </div>
              <h3 className="text-[18px] font-bold text-ios-textPrimary leading-snug">
                Sinkron Otomatis Akun Kampus
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

        {/* Result view if sync success */}
        {syncResult ? (
          <div className="py-4 space-y-4 text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-[17px] font-bold text-ios-textPrimary">
                Akun Kampus Berhasil Terhubung!
              </h4>
              <p className="text-[12.5px] text-ios-textSecondary max-w-sm mx-auto">
                Seluruh mata kuliah, jadwal kelas, kuis, dan tugas semester ini telah otomatis dimasukkan ke akun Studia Anda.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-ios-surfaceSecondary border border-ios-border text-left">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-ios-textSecondary block">Mata Kuliah</span>
                  <span className="text-[13px] font-bold text-ios-textPrimary">Otomatis Terjadwal</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-ios-textSecondary block">Tugas & Kuis</span>
                  <span className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400">
                    {syncResult.createdCount + syncResult.updatedCount} Agenda
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              className="w-full justify-center gap-2 py-3 rounded-2xl shadow-md text-[13.5px] font-bold"
              onClick={onClose}
            >
              <span>Mulai Akses Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <>
            <p className="text-[12.5px] text-ios-textSecondary leading-relaxed">
              Hai <strong className="text-ios-textPrimary">{userName || "Mahasiswa"}</strong>! Anda tidak perlu mengetik mata kuliah, jam kelas, SKS, atau daftar tugas satu per satu. Cukup sinkronkan sekali, Studia akan mengisinya otomatis:
            </p>

            {/* Mode Switcher */}
            <div className="flex p-1 bg-ios-surfaceSecondary border border-ios-border rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => setSyncMode("file")}
                className={cn(
                  "flex-1 py-2 px-3 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all",
                  syncMode === "file"
                    ? "bg-white dark:bg-ios-card text-ios-textPrimary shadow-sm"
                    : "text-ios-textSecondary hover:text-ios-textPrimary"
                )}
              >
                <UploadCloud className="w-3.5 h-3.5 text-emerald-500" />
                <span>Unggah File .ics</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">100% Berhasil</span>
              </button>

              <button
                type="button"
                onClick={() => setSyncMode("url")}
                className={cn(
                  "flex-1 py-2 px-3 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all",
                  syncMode === "url"
                    ? "bg-white dark:bg-ios-card text-ios-textPrimary shadow-sm"
                    : "text-ios-textSecondary hover:text-ios-textPrimary"
                )}
              >
                <LinkIcon className="w-3.5 h-3.5 text-blue-500" />
                <span>Link URL CeLOE</span>
              </button>
            </div>

            {/* Guide Step */}
            {syncMode === "file" ? (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[11.5px] text-ios-textPrimary leading-relaxed space-y-1.5">
                <p className="font-bold flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <FileCheck className="w-4 h-4" />
                  Metode Paling Cepat & Aman (Bypass Keamanan Cloudflare CeLOE):
                </p>
                <ol className="list-decimal list-inside space-y-1 text-ios-textSecondary">
                  <li>Buka <strong className="text-ios-textPrimary">lms.telkomuniversity.ac.id</strong> &rarr; menu <strong>Calendar</strong>.</li>
                  <li>Gulir ke bagian bawah, klik <strong>Export calendar</strong>.</li>
                  <li>Pastikan opsi <em>"All events"</em> dan rentang waktu aktif dipilih.</li>
                  <li>Klik tombol merah <strong className="text-rose-500">"Export"</strong> (file <code className="bg-ios-surface px-1 py-0.5 rounded text-[11px]">icalexport.ics</code> otomatis terunduh).</li>
                  <li>Seret atau klik kotak di bawah untuk mengunggah file tersebut. Studia akan otomatis menyusun matkul, jadwal kelas resmi, dan tugas Anda!</li>
                </ol>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-[11.5px] text-ios-textPrimary leading-relaxed space-y-1.5">
                <p className="font-bold flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <Sparkles className="w-4 h-4" />
                  Sinkronisasi Lewat URL Kalender Live CeLOE
                </p>
                <p className="text-ios-textSecondary text-[11px]">
                  Catatan: Server CeLOE Telkom University memiliki sistem proteksi bot / Cloudflare yang dapat memblokir permintaan server cloud. Jika muncul kendala akses, gunakan tab <strong>"Unggah File .ics"</strong> di sebelah kiri.
                </p>
                <ol className="list-decimal list-inside space-y-1 text-ios-textSecondary pt-0.5">
                  <li>Buka <strong className="text-ios-textPrimary">lms.telkomuniversity.ac.id</strong> &rarr; <strong>Calendar</strong> &rarr; <strong>Export calendar</strong>.</li>
                  <li>Pilih <em>"All events"</em> dan <em>"Recent and next 60 days"</em>, lalu klik <strong>Get calendar URL</strong>.</li>
                  <li>Salin link URL dan tempelkan pada kolom di bawah.</li>
                </ol>
              </div>
            )}

            {feedback && (
              <div
                className={cn(
                  "p-3 rounded-xl text-[12px] font-medium border leading-snug",
                  feedback.type === "success"
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    : "bg-red-500/10 border-red-500/20 text-red-500"
                )}
              >
                {feedback.text}
              </div>
            )}

            {syncMode === "file" ? (
              <div className="space-y-3 pt-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".ics,.txt"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFile(file);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "cursor-pointer border-2 border-dashed rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center gap-2",
                    isDragging
                      ? "border-ios-accent bg-ios-accent/10 scale-[1.01]"
                      : "border-ios-border hover:border-ios-accent/50 bg-ios-surfaceSecondary/40"
                  )}
                >
                  <div className="p-3 rounded-2xl bg-white dark:bg-ios-card shadow-sm border border-ios-border text-ios-accent">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-ios-textPrimary">
                      {selectedFileName ? selectedFileName : "Pilih atau Seret File icalexport.ics ke Sini"}
                    </p>
                    <p className="text-[11.5px] text-ios-textSecondary mt-0.5">
                      Format file kalender CeLOE Telkom University (<code className="font-semibold text-ios-textPrimary">.ics</code>)
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Nanti Saja
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    disabled={isLoading}
                    onClick={() => {
                      if (fileContent) {
                        executeSync({ icsContent: fileContent });
                      } else {
                        fileInputRef.current?.click();
                      }
                    }}
                    className="flex-1 gap-1.5 shadow-sm"
                  >
                    {isLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>{isLoading ? "Memproses..." : "Tarik Matkul & Tugas"}</span>
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUrlSubmit} className="space-y-3 pt-1">
                <div>
                  <label className="block text-[12px] font-semibold text-ios-textPrimary mb-1">
                    URL Kalender iCal CeLOE (Live Token)
                  </label>
                  <input
                    type="url"
                    placeholder="https://lms.telkomuniversity.ac.id/calendar/export_execute.php?..."
                    value={lmsUrl}
                    onChange={(e) => setLmsUrl(e.target.value)}
                    className="w-full p-2.5 text-[12px] bg-ios-surfaceSecondary border border-ios-border rounded-xl focus:outline-none focus:ring-1 focus:ring-ios-accent text-ios-textPrimary"
                  />
                  <p className="text-[11px] text-ios-textSecondary mt-1.5 flex items-center gap-1">
                    <span>🔒</span>
                    <span>Cukup masukkan sekali. Studia akan otomatis menyinkronkan tugas baru secara berkala tanpa input manual lagi.</span>
                  </p>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Nanti Saja
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isLoading}
                    className="flex-1 gap-1.5 shadow-sm bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>{isLoading ? "Menyinkronkan..." : "Simpan & Auto-Sync"}</span>
                  </Button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

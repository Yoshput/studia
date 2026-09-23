"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  Circle,
  ExternalLink,
  ChevronRight,
  Maximize2,
  HelpCircle,
  AlertTriangle,
  Calendar,
  Sparkles,
} from "lucide-react";
import { TugasDeadline } from "@/types";
import { cn } from "@/lib/utils";

interface TaskDeadlineWidgetProps {
  tasks: TugasDeadline[];
  onTaskUpdated?: () => void;
  className?: string;
  isStandalone?: boolean;
}

export function TaskDeadlineWidget({
  tasks,
  onTaskUpdated,
  className,
  isStandalone = false,
}: TaskDeadlineWidgetProps) {
  const [filter, setFilter] = useState<"semua" | "mendesak">("semua");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Filter tasks based on status and urgency
  const activeTasks = tasks.filter((t) => t.status !== "selesai");
  const completedTasks = tasks.filter((t) => t.status === "selesai");
  const totalTasks = tasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 100;

  const displayedTasks = activeTasks.filter((t) => {
    if (filter === "mendesak") {
      const deadlineDate = new Date(t.deadline);
      const diffDays = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return diffDays <= 3 || t.prioritas === "tinggi";
    }
    return true;
  });

  const handleToggleComplete = async (t: TugasDeadline) => {
    setUpdatingId(t.id);
    const nextStatus = t.status === "selesai" ? "belum" : "selesai";

    try {
      const res = await fetch("/api/tugas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: t.id,
          matkul_id: t.matkul_id,
          judul: t.judul,
          status: nextStatus,
        }),
      });

      if (res.ok && onTaskUpdated) {
        onTaskUpdated();
      }
    } catch (e) {
      console.error("Gagal mengupdate status tugas:", e);
    } finally {
      setUpdatingId(null);
    }
  };

  const openMiniWindowWidget = () => {
    if (typeof window === "undefined") return;
    const w = 400;
    const h = 620;
    const left = window.screen.width - w - 24;
    const top = 60;
    window.open(
      "/widget",
      "SemestrTaskWidget",
      `width=${w},height=${h},top=${top},left=${left},resizable=yes,scrollbars=yes,status=no`
    );
  };

  const getRemainingDays = (deadlineStr: string | Date) => {
    const d = new Date(deadlineStr);
    const diff = d.getTime() - Date.now();
    const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (diff < 0) return { label: "Terlewat", isUrgent: true, color: "text-red-500 bg-red-500/10 border-red-500/20" };
    if (diffDays === 0) return { label: "Hari ini", isUrgent: true, color: "text-red-600 bg-red-600/10 border-red-600/20" };
    if (diffDays === 1) return { label: "Besok", isUrgent: true, color: "text-amber-600 bg-amber-500/10 border-amber-500/20" };
    if (diffDays <= 3) return { label: `${diffDays} hari lagi`, isUrgent: true, color: "text-amber-600 bg-amber-500/10 border-amber-500/20" };
    return { label: `${diffDays} hari`, isUrgent: false, color: "text-ios-textSecondary bg-ios-surfaceSecondary border-ios-border" };
  };

  return (
    <div
      className={cn(
        "rounded-3xl bg-ios-surface border border-ios-border shadow-sm p-4 sm:p-5 select-none transition-all",
        className
      )}
    >
      {/* 1. Header Widget bergaya Apple iOS */}
      <div className="flex items-center justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-ios-accent/10 border border-ios-accent/20 flex items-center justify-center text-ios-accent flex-shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-[14.5px] font-bold text-ios-textPrimary tracking-tight truncate">
                Tugas & Deadline
              </h3>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-ios-accent/10 text-ios-accent border border-ios-accent/20 flex-shrink-0">
                {activeTasks.length} Aktif
              </span>
            </div>
            <p className="text-[11px] text-ios-textSecondary truncate">
              {progressPercent}% tugas semester terselesaikan
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {!isStandalone && (
            <>
              <button
                type="button"
                onClick={openMiniWindowWidget}
                className="p-1.5 rounded-xl text-ios-textSecondary hover:text-ios-textPrimary hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                title="Buka sebagai Jendela Widget Mini di Layar Laptop"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setShowGuideModal(true)}
                className="p-1.5 rounded-xl text-ios-textSecondary hover:text-ios-textPrimary hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                title="Cara pasang widget ke Layar HP & Startup Laptop"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          <Link
            href="/tugas"
            className="p-1.5 rounded-xl text-ios-textSecondary hover:text-ios-accent transition-colors"
            title="Kelola semua tugas"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 2. Progress Bar */}
      <div className="w-full bg-ios-surfaceSecondary h-1.5 rounded-full overflow-hidden mb-3 border border-ios-border/60">
        <div
          className="bg-ios-accent h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 3. Filter Tabs (Semua vs Mendesak) */}
      <div className="flex items-center gap-1.5 mb-3 text-[11px]">
        <button
          type="button"
          onClick={() => setFilter("semua")}
          className={cn(
            "px-2.5 py-1 rounded-full font-semibold transition-all",
            filter === "semua"
              ? "bg-ios-accent text-white shadow-xs"
              : "bg-ios-surfaceSecondary text-ios-textSecondary hover:text-ios-textPrimary"
          )}
        >
          Semua ({activeTasks.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("mendesak")}
          className={cn(
            "px-2.5 py-1 rounded-full font-semibold transition-all",
            filter === "mendesak"
              ? "bg-ios-accent text-white shadow-xs"
              : "bg-ios-surfaceSecondary text-ios-textSecondary hover:text-ios-textPrimary"
          )}
        >
          Mendesak (≤3 Hari)
        </button>
      </div>

      {/* 4. Scrollable Task List (Empuk & Mulus) */}
      <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar pr-0.5">
        {displayedTasks.length === 0 ? (
          <div className="py-8 px-4 text-center bg-ios-surfaceSecondary/40 rounded-2xl border border-dashed border-ios-border">
            <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-1.5 opacity-80" />
            <p className="text-[12.5px] font-semibold text-ios-textPrimary">
              Tidak ada tugas yang tertunda
            </p>
            <p className="text-[11px] text-ios-textSecondary mt-0.5">
              Seluruh agenda deadline tugas telah diselesaikan dengan rapi.
            </p>
          </div>
        ) : (
          displayedTasks.map((t) => {
            const rem = getRemainingDays(t.deadline);
            const isUpdating = updatingId === t.id;

            return (
              <div
                key={t.id}
                className="group p-3 rounded-2xl bg-ios-surfaceSecondary/60 hover:bg-ios-surfaceSecondary border border-ios-border/80 transition-all flex items-start gap-3 shadow-xs"
              >
                {/* Fast Checklist Button */}
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleToggleComplete(t)}
                  className="mt-0.5 text-ios-textSecondary/60 hover:text-emerald-500 transition-colors flex-shrink-0"
                  title="Tandai selesai"
                >
                  {isUpdating ? (
                    <div className="w-4 h-4 rounded-full border-2 border-ios-accent border-t-transparent animate-spin" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </button>

                {/* Task Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5 mb-0.5">
                    <span className="text-[10px] font-semibold font-mono text-ios-textSecondary truncate">
                      {t.matkul?.nama || "Mata Kuliah"}
                    </span>
                    <span
                      className={cn(
                        "text-[9.5px] font-bold px-2 py-0.2 rounded-full border whitespace-nowrap",
                        rem.color
                      )}
                    >
                      {rem.label}
                    </span>
                  </div>

                  <h4 className="text-[12.5px] font-bold text-ios-textPrimary leading-snug line-clamp-2">
                    {t.judul}
                  </h4>

                  {t.deskripsi && (
                    <p className="text-[11px] text-ios-textSecondary line-clamp-1 mt-0.5">
                      {t.deskripsi}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. Guide Modal: Pasang di Layar HP & Startup Laptop */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-ios-surface rounded-3xl p-5 sm:p-6 border border-ios-border shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-ios-textPrimary">
                Pasang Widget ke Layar HP & Laptop
              </h3>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="text-ios-textSecondary hover:text-ios-textPrimary p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-[12px] text-ios-textSecondary leading-relaxed">
              <div className="p-3 rounded-2xl bg-ios-surfaceSecondary border border-ios-border">
                <p className="font-bold text-ios-textPrimary mb-1">
                  📱 Di Layar HP (Android & iOS):
                </p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Buka link <strong>studia-id.vercel.app/widget</strong> di browser HP (Chrome / Safari).</li>
                  <li>Klik tombol menu (titik tiga di Chrome atau ikon Bagikan di Safari).</li>
                  <li>Pilih <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong>.</li>
                  <li>Widget Tugas akan muncul sebagai ikon cepat mandiri di home screen HP kamu.</li>
                </ol>
              </div>

              <div className="p-3 rounded-2xl bg-ios-surfaceSecondary border border-ios-border">
                <p className="font-bold text-ios-textPrimary mb-1">
                  💻 Di Laptop (Otomatis Nyala saat Startup Windows):
                </p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Klik tombol <strong>Layar Mini (Icon Kotak)</strong> di pojok kanan atas widget ini.</li>
                  <li>Jendela widget mini akan terbuka di layar desktopmu.</li>
                  <li>Agar selalu otomatis menyala saat menghidupkan laptop: tekan tombol <code className="px-1 bg-black/5 rounded">Win + R</code>, ketik <code className="px-1 bg-black/5 rounded">shell:startup</code>, lalu buat Shortcut ke URL widget ini.</li>
                </ol>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 rounded-xl bg-ios-accent text-white text-[13px] font-bold transition-all active:scale-95"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

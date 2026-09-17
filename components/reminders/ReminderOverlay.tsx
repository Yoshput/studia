"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Calendar, AlertCircle, ArrowRight, X } from "lucide-react";
import { getDaysRemaining } from "@/lib/utils";

interface ReminderItem {
  id: string;
  type: "task" | "class";
  title: string;
  description: string;
  actionLabel: string;
  actionUrl: string;
  urgency: "high" | "medium";
}

const DAYS_ID = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export function ReminderOverlay() {
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const storageKey = `semestr-dismissed-reminders-${todayStr}`;

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setDismissedIds(new Set(JSON.parse(saved)));
      }
    } catch (e) {
      console.error("Failed to read dismissed reminders:", e);
    }

    const checkReminders = async () => {
      try {
        const [matkulRes, tugasRes] = await Promise.all([
          fetch("/api/matkul"),
          fetch("/api/tugas"),
        ]);

        const matkulData = await matkulRes.json();
        const tugasData = await tugasRes.json();

        const items: ReminderItem[] = [];
        const now = new Date();
        const todayDayName = DAYS_ID[now.getDay()];
        const nowMinutes = now.getHours() * 60 + now.getMinutes();

        // 1. Check Classes Starting in < 30 Minutes
        if (matkulData.matkul && Array.isArray(matkulData.matkul)) {
          const todayClasses = matkulData.matkul.filter(
            (m: any) => m.hari?.toLowerCase() === todayDayName.toLowerCase()
          );

          for (const m of todayClasses) {
            if (!m.jam_mulai) continue;
            const [h, min] = m.jam_mulai.split(":").map(Number);
            if (!isNaN(h) && !isNaN(min)) {
              const startMinutes = h * 60 + min;
              const diff = startMinutes - nowMinutes;

              if (diff > 0 && diff <= 30) {
                items.push({
                  id: `class-${m.id}`,
                  type: "class",
                  title: `Kuliah: ${m.nama}`,
                  description: `Ruang ${m.ruang || "-"} • Mulai ${diff} menit lagi (${m.jam_mulai} WIB)`,
                  actionLabel: "Buka Jadwal",
                  actionUrl: "/jadwal",
                  urgency: "high",
                });
              }
            }
          }
        }

        // 2. Check Tasks with Deadline < 24 Hours
        if (tugasData.tugas && Array.isArray(tugasData.tugas)) {
          const activeTasks = tugasData.tugas.filter((t: any) => t.status !== "selesai");

          for (const t of activeTasks) {
            const rem = getDaysRemaining(t.deadline);
            // If deadline is within 24 hours (including past due today or upcoming)
            if (rem.days === 0 && !rem.isOverdue) {
              const deadlineDate = new Date(t.deadline);
              const diffMs = deadlineDate.getTime() - now.getTime();
              const hoursLeft = Math.max(1, Math.round(diffMs / (1000 * 60 * 60)));
              items.push({
                id: `task-${t.id}`,
                type: "task",
                title: `Deadline: ${t.judul}`,
                description: `${t.matkul?.nama || "Akademik"} • Sisa ${hoursLeft} jam lagi hari ini`,
                actionLabel: "Lihat Tugas",
                actionUrl: "/tugas",
                urgency: hoursLeft <= 6 ? "high" : "medium",
              });
            } else if (rem.isOverdue && rem.days === 0) {
              items.push({
                id: `task-${t.id}`,
                type: "task",
                title: `Tenggat Terlewat: ${t.judul}`,
                description: `${t.matkul?.nama || "Akademik"} • Belum diserahkan`,
                actionLabel: "Serahkan Tugas",
                actionUrl: "/tugas",
                urgency: "high",
              });
            }
          }
        }

        setReminders(items);
      } catch (err) {
        console.error("ReminderOverlay fetch error:", err);
      }
    };

    checkReminders();
    // Re-check periodically every 2 minutes
    const interval = setInterval(checkReminders, 120000);
    return () => clearInterval(interval);
  }, []);

  const handleDismiss = (id: string) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const storageKey = `semestr-dismissed-reminders-${todayStr}`;

    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      try {
        localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
      } catch (e) {
        console.error("Failed to save dismissed reminder:", e);
      }
      return next;
    });
  };

  const activeReminders = reminders.filter((r) => !dismissedIds.has(r.id));

  if (activeReminders.length === 0) return null;

  return (
    <aside
      aria-label="Pengingat Akademik"
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 max-w-sm w-[calc(100%-2rem)] sm:w-80 pointer-events-none flex flex-col gap-2.5"
    >
      <AnimatePresence mode="popLayout">
        {activeReminders.slice(0, 3).map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="pointer-events-auto bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-xl border border-ios-border/80 rounded-2xl p-3.5 shadow-xl flex items-start gap-3"
          >
            <div
              className={`p-2 rounded-xl flex-shrink-0 ${
                item.urgency === "high"
                  ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              }`}
            >
              {item.type === "class" ? (
                <Calendar className="w-4 h-4 stroke-[2.2]" />
              ) : item.urgency === "high" ? (
                <AlertCircle className="w-4 h-4 stroke-[2.2]" />
              ) : (
                <Clock className="w-4 h-4 stroke-[2.2]" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    item.urgency === "high"
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {item.type === "class" ? "Jadwal Kuliah" : "Deadline Tugas"}
                </span>
                <button
                  type="button"
                  onClick={() => handleDismiss(item.id)}
                  className="p-1 -mr-1 -mt-1 text-ios-textSecondary hover:text-ios-textPrimary rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  aria-label="Tutup Pengingat"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <h4 className="text-[13px] font-bold text-ios-textPrimary truncate mt-0.5">
                {item.title}
              </h4>
              <p className="text-[11.5px] text-ios-textSecondary line-clamp-1 mt-0.5">
                {item.description}
              </p>

              <div className="mt-2.5 pt-2 border-t border-ios-border/60 flex items-center justify-end">
                <Link
                  href={item.actionUrl}
                  className="inline-flex items-center gap-1 text-[11.5px] font-bold text-ios-accent hover:underline"
                >
                  <span>{item.actionLabel}</span>
                  <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </aside>
  );
}

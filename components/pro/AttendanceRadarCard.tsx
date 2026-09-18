"use client";

import React from "react";
import { ShieldAlert, CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";

interface AttendanceCourse {
  id: string;
  nama: string;
  kode?: string | null;
  totalPertemuan?: number; // default 14
  hadirCount?: number;
  alpaCount?: number;
}

interface AttendanceRadarCardProps {
  courses?: AttendanceCourse[];
  onUpgradeClick?: () => void;
  isPro?: boolean;
}

export function AttendanceRadarCard({
  courses = [],
  onUpgradeClick,
  isPro = false,
}: AttendanceRadarCardProps) {
  // Mock kalkulasi jika courses belum terisi
  const calculatedCourses = courses.length > 0 ? courses : [
    { id: "1", nama: "Grafika Komputer", kode: "CSG2H3", totalPertemuan: 14, hadirCount: 11, alpaCount: 2 },
    { id: "2", nama: "Pemrograman Berorientasi Objek", kode: "CSG2J3", totalPertemuan: 14, hadirCount: 13, alpaCount: 0 },
    { id: "3", nama: "Kecerdasan Buatan", kode: "CSG3A3", totalPertemuan: 14, hadirCount: 12, alpaCount: 1 },
  ];

  return (
    <div className="p-4 rounded-2xl bg-ios-surface border border-ios-border shadow-sm space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-ios-accent/10 text-ios-accent">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-[13.5px] font-bold text-ios-textPrimary leading-none">
              Radar Risiko Kehadiran iGracias
            </h4>
            <p className="text-[11px] text-ios-textSecondary mt-0.5">
              Standar Telkom University (Wajib Hadir Minimal 75%)
            </p>
          </div>
        </div>

        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-ios-accent/15 text-ios-accent uppercase tracking-wider">
          PRO Radar
        </span>
      </div>

      {/* Course List Radar */}
      <div className="space-y-2.5 pt-1">
        {calculatedCourses.map((c) => {
          const total = c.totalPertemuan || 14;
          const alpa = c.alpaCount || 0;
          const maxAlpa = Math.floor(total * 0.25); // 3x alpa toleransi Telkom
          const sisaJatah = Math.max(0, maxAlpa - alpa);
          const percent = Math.round(((total - alpa) / total) * 100);

          const isDanger = sisaJatah <= 1;
          const isWarning = sisaJatah === 2;

          return (
            <div
              key={c.id}
              className="p-3 rounded-xl bg-ios-surfaceSecondary/70 border border-ios-border/80 flex items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-ios-textPrimary truncate">
                    {c.nama}
                  </span>
                  {c.kode && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-ios-surface border border-ios-border text-ios-textSecondary">
                      {c.kode}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-ios-textSecondary">
                  <span>Kehadiran: <strong className="text-ios-textPrimary">{percent}%</strong></span>
                  <span>•</span>
                  <span>Alpa: <strong className={alpa > 0 ? "text-ios-danger" : "text-ios-textPrimary"}>{alpa}x</strong></span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="text-right flex-shrink-0">
                {isDanger ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-ios-danger/15 text-ios-danger border border-ios-danger/30">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Sisa {sisaJatah}x Alpa!</span>
                  </span>
                ) : isWarning ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    <span>Sisa {sisaJatah}x</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-ios-success/15 text-ios-success border border-ios-success/30">
                    <CheckCircle className="w-3 h-3" />
                    <span>Aman (100%)</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-2.5 rounded-xl bg-ios-surfaceSecondary/40 border border-ios-border/60 text-[11px] text-ios-textSecondary flex items-center gap-2">
        <Info className="w-3.5 h-3.5 text-ios-accent flex-shrink-0" />
        <span>
          Jika alpa melebihi 3 kali pertemuan, status mahasiswa otomatis tidak diperkenankan mengikuti Ujian Akhir Semester (UAS).
        </span>
      </div>
    </div>
  );
}

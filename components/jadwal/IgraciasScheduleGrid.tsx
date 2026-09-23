"use client";

import React from "react";
import { Matkul } from "@/types";
import { cn } from "@/lib/utils";
import { MapPin, User, Clock, BookOpen } from "lucide-react";

interface IgraciasScheduleGridProps {
  matkulList: Matkul[];
  semesterName?: string;
  tahunAjaran?: string;
}

// 12 Shift Waktu Standar iGracias Telkom University
const SHIFTS = [
  { shift: "06:30:00 WIB", start: "06:30", end: "07:30" },
  { shift: "07:30:00 WIB", start: "07:30", end: "08:30" },
  { shift: "08:30:00 WIB", start: "08:30", end: "09:30" },
  { shift: "09:30:00 WIB", start: "09:30", end: "10:30" },
  { shift: "10:30:00 WIB", start: "10:30", end: "11:30" },
  { shift: "11:30:00 WIB", start: "11:30", end: "12:30" },
  { shift: "12:30:00 WIB", start: "12:30", end: "13:30" },
  { shift: "13:30:00 WIB", start: "13:30", end: "14:30" },
  { shift: "14:30:00 WIB", start: "14:30", end: "15:30" },
  { shift: "15:30:00 WIB", start: "15:30", end: "16:30" },
  { shift: "16:30:00 WIB", start: "16:30", end: "17:30" },
  { shift: "17:30:00 WIB", start: "17:30", end: "18:30" },
];

const DAYS = [
  { key: "Senin", label: "SENIN" },
  { key: "Selasa", label: "SELASA" },
  { key: "Rabu", label: "RABU" },
  { key: "Kamis", label: "KAMIS" },
  { key: "Jumat", label: "JUM'AT" },
  { key: "Sabtu", label: "SABTU" },
  { key: "Minggu", label: "MINGGU" },
];

// Terjemahan Bahasa Inggris resmi mata kuliah Tel-U untuk subjudul iGracias
const ENGLISH_TITLES: Record<string, string> = {
  "TATA TULIS ILMIAH": "SCIENTIFIC WRITING",
  "MANAJEMEN PROJEK TIK": "ICT PROJECT MANAGEMENT",
  "KEWARGANEGARAAN": "CIVICS",
  "BAHASA INDONESIA": "INDONESIAN LANGUAGE",
  "KOMPUTASI AWAN DAN TERDISTRIBUSI": "CLOUD AND DISTRIBUTED COMPUTING",
  "KEAMANAN SIBER": "CYBER SECURITY",
  "SOSIO-INFORMATIK DAN KEPROFESIAN": "SOSIO-INFORMATICS AND PROFESSIONALISM",
  "KECERDASAN ARTIFISIAL": "ARTIFICIAL INTELLIGENCE",
  "PEMROGRAMAN BERORIENTASI OBJEK": "OBJECT ORIENTED PROGRAMMING",
  "GRAFIKA KOMPUTER": "COMPUTER GRAPHICS",
  "JARINGAN KOMPUTER": "COMPUTER NETWORKS",
  "BASIS DATA": "DATABASE SYSTEMS",
  "STRUKTUR DATA": "DATA STRUCTURES",
  "ALGORITMA PEMROGRAMAN": "ALGORITHMS AND PROGRAMMING",
  "INTERAKSI MANUSIA DAN KOMPUTER": "HUMAN COMPUTER INTERACTION",
};

function parseTimeToMinutes(t: string): number {
  if (!t) return 0;
  const clean = t.replace("WIB", "").trim();
  const parts = clean.split(":");
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

export function IgraciasScheduleGrid({
  matkulList,
  semesterName = "Ganjil",
  tahunAjaran = "2026/2027",
}: IgraciasScheduleGridProps) {
  // Cek apakah matkul jatuh pada shift tertentu di hari tertentu
  const getCourseForSlot = (dayKey: string, shiftStart: string, shiftEnd: string) => {
    const slotStartMin = parseTimeToMinutes(shiftStart);
    const slotEndMin = parseTimeToMinutes(shiftEnd);

    return matkulList.find((m) => {
      // Normalisasi perbandingan hari (case-insensitive & support Jumat/Jum'at)
      const mHariNorm = m.hari.toLowerCase().replace(/['`]/g, "");
      const dKeyNorm = dayKey.toLowerCase().replace(/['`]/g, "");
      if (mHariNorm !== dKeyNorm) return false;

      const mStartMin = parseTimeToMinutes(m.jam_mulai);
      const mEndMin = parseTimeToMinutes(m.jam_selesai);

      // Slot shift berada di dalam rentang mata kuliah
      // Misal slot 07:30 - 08:30 dan matkul 07:30 - 10:30 -> OVERLAP!
      return mStartMin <= slotStartMin && mEndMin >= slotEndMin;
    });
  };

  return (
    <div className="space-y-3 select-none">
      {/* 1. Header Banner Gaya Pratinjau Jadwal iGracias Telkom University */}
      <div className="rounded-2xl overflow-hidden border border-ios-border bg-ios-surface shadow-sm">
        <div className="bg-[#B6252A] text-white px-4 py-2.5 flex items-center justify-between text-center">
          <span className="text-[13.5px] font-bold tracking-tight mx-auto">
            Pratinjau Jadwal
          </span>
        </div>

        <div className="py-2.5 px-4 text-center border-b border-ios-border/60 bg-ios-surfaceSecondary/40">
          <h2 className="text-[13px] md:text-[14px] font-bold text-ios-textPrimary tracking-tight">
            Jadwal Mata Kuliah Studi Semester |{semesterName}| {tahunAjaran}
          </h2>
          <p className="text-[11px] text-ios-textSecondary">
            Format Standar Resmi iGracias • Telkom University Purwokerto
          </p>
        </div>

        {/* 2. Grid Matriks Mingguan Scrollable */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full min-w-[980px] border-collapse text-left text-[11px]">
            <thead>
              <tr className="bg-ios-surfaceSecondary/80 text-ios-textSecondary font-bold border-b border-ios-border">
                <th className="py-2.5 px-3 w-28 text-center border-r border-ios-border/70 text-[10.5px] tracking-wider uppercase bg-ios-surfaceSecondary sticky left-0 z-10 shadow-xs">
                  SHIFT
                </th>
                {DAYS.map((d) => (
                  <th
                    key={d.key}
                    className="py-2.5 px-2 text-center border-r border-ios-border/70 last:border-r-0 text-[11px] tracking-wider font-extrabold uppercase text-ios-textPrimary"
                  >
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SHIFTS.map((shift, idx) => {
                return (
                  <tr
                    key={shift.shift}
                    className={cn(
                      "border-b border-ios-border/50 transition-colors",
                      idx % 2 === 0 ? "bg-ios-surface" : "bg-ios-surfaceSecondary/20"
                    )}
                  >
                    {/* Kolom Waktu Shift (Sticky Left) */}
                    <td className="py-2 px-2 text-center border-r border-ios-border/70 font-mono text-[10.5px] font-semibold text-ios-textSecondary bg-ios-surfaceSecondary/90 sticky left-0 z-10 whitespace-nowrap shadow-xs">
                      {shift.shift}
                    </td>

                    {/* Kolom 7 Hari Perkuliahan */}
                    {DAYS.map((d) => {
                      const course = getCourseForSlot(d.key, shift.start, shift.end);

                      if (!course) {
                        return (
                          <td
                            key={d.key}
                            className="py-1 px-1.5 border-r border-ios-border/40 last:border-r-0 h-16 align-middle"
                          >
                            {/* Kotak kosong */}
                          </td>
                        );
                      }

                      const courseUpper = course.nama.toUpperCase();
                      const engSubtitle =
                        ENGLISH_TITLES[courseUpper] ||
                        courseUpper.replace(/DAN/g, "AND");

                      return (
                        <td
                          key={d.key}
                          className="p-1 border-r border-ios-border/40 last:border-r-0 align-middle"
                        >
                          {/* Kotak Hijau Muda Khas iGracias */}
                          <div className="rounded-xl p-2 bg-[#c2ed9c] hover:bg-[#b5e78b] dark:bg-[#203a18] dark:hover:bg-[#27461e] border border-[#a6de78] dark:border-[#38652b] text-[#1c3812] dark:text-[#aee28f] shadow-xs transition-all hover:scale-[1.01] flex flex-col items-center justify-center text-center space-y-0.5">
                            {/* Kode Matkul */}
                            <span className="font-mono font-bold text-[10px] tracking-wide text-[#1c3812]/90 dark:text-[#aee28f]/90 leading-tight">
                              {course.kode || "CAK3KAB3"}
                            </span>

                            {/* Nama Matkul IDN */}
                            <h4 className="font-extrabold text-[11px] leading-tight line-clamp-2">
                              {course.nama.toUpperCase()}
                            </h4>

                            {/* Subtitle Bahasa Inggris Italic */}
                            <p className="text-[9px] italic opacity-85 leading-tight line-clamp-1">
                              {engSubtitle}
                            </p>

                            {/* Jam Shift Slot */}
                            <span className="text-[9.5px] font-semibold opacity-90 mt-0.5 font-mono">
                              {shift.start} - {shift.end} WIB
                            </span>

                            {/* Ruang Kelas (jika ada) */}
                            {course.ruang && (
                              <span className="text-[9px] font-medium opacity-80 flex items-center gap-0.5">
                                <MapPin className="w-2.5 h-2.5 inline" />
                                {course.ruang}
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

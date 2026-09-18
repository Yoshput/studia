"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sparkles, Clock } from "lucide-react";
import { TelkomLogo } from "./TelkomLogo";

interface DesktopHeaderProps {
  onOpenAssistant?: () => void;
  semesterName?: string;
}

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard Akademik", subtitle: "Ikhtisar jadwal, tugas, dan performa kuliah harian" },
  "/jadwal": { title: "Jadwal Perkuliahan", subtitle: "Tabel shift dan ruang kelas semester aktif" },
  "/tugas": { title: "Tugas & Deadline", subtitle: "Daftar to-do dan batas waktu pengerjaan tugas aktif" },
  "/absen": { title: "Presensi Scan Wajah", subtitle: "Verifikasi kehadiran biometrik berbasis kamera" },
  "/nilai": { title: "Nilai & Transkrip", subtitle: "KHS kumulatif resmi dan grafik performa akademik" },
  "/progress": { title: "Progress Belajar", subtitle: "Catatan pemahaman materi dan log belajar mandiri" },
  "/profil": { title: "Profil Mahasiswa", subtitle: "Identitas dan biodata mahasiswa Telkom University" },
};

export function DesktopHeader({
  onOpenAssistant,
  semesterName = "Semester 5",
}: DesktopHeaderProps) {
  const pathname = usePathname();
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " WIB"
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  if (pathname === "/" || pathname === "/login" || pathname === "/signup") {
    return null;
  }

  const currentMeta = PAGE_TITLES[pathname] || {
    title: "Semestr Academic OS",
    subtitle: "Platform personal mahasiswa Telkom University Purwokerto",
  };

  return (
    <header className="hidden md:flex h-16 px-6 lg:px-8 items-center justify-between border-b border-ios-border bg-ios-surface/85 backdrop-blur-md sticky top-0 z-20 transition-all duration-200">
      {/* Left: Page Title & Breadcrumb */}
      <div>
        <h1 className="text-[17px] font-bold text-ios-textPrimary tracking-tight">
          {currentMeta.title}
        </h1>
        <p className="text-[11.5px] text-ios-textSecondary">
          {currentMeta.subtitle}
        </p>
      </div>

      {/* Right: Live Clock, Official Telkom University Logo & Brand, & Aiko Trigger */}
      <div className="flex items-center gap-3.5">
        {/* Live Clock WIB */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ios-surfaceSecondary border border-ios-border text-[11.5px] font-medium text-ios-textSecondary">
          <Clock className="w-3.5 h-3.5 text-ios-accent" />
          <span>{timeStr}</span>
        </div>

        {/* Official Telkom University Badge with Logo in Top Right */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-ios-surfaceSecondary border border-ios-border/80 shadow-sm transition-all hover:border-ios-accent/30">
          <TelkomLogo size={22} withText={true} subtext="Purwokerto" />
        </div>

        {/* Aiko AI Assistant Quick Button */}
        {onOpenAssistant && (
          <button
            type="button"
            onClick={onOpenAssistant}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-btn bg-ios-accent text-white hover:opacity-90 text-[12px] font-semibold transition-all shadow-sm active:scale-95"
            title="Buka Chat Asisten AI Aiko"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Asisten Aiko</span>
          </button>
        )}
      </div>
    </header>
  );
}

import React from "react";
import Link from "next/link";
import { MascotIcon } from "@/components/assistant/MascotIcon";
import { TelkomLogo } from "@/components/TelkomLogo";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Home, Compass, BookOpen, CalendarDays } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-ios-bg text-ios-textPrimary transition-colors duration-200">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ios-surface border border-ios-border shadow-sm">
          <TelkomLogo size={20} withText={true} subtext="Purwokerto" />
        </div>

        <div className="relative inline-flex p-4 rounded-3xl bg-ios-surface border border-ios-border shadow-md">
          <MascotIcon size={72} />
          <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-ios-accent text-white font-black text-[12px] shadow">
            404
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-[28px] font-bold tracking-tight text-ios-textPrimary">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-[14px] text-ios-textSecondary max-w-sm mx-auto leading-relaxed">
            Halaman kuliah atau modul yang Anda cari mungkin telah dipindahkan, dihapus, atau tautan tidak valid.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 max-w-xs mx-auto text-left">
          <Link
            href="/dashboard"
            className="p-3 rounded-2xl bg-ios-surface border border-ios-border hover:border-ios-accent/50 hover:bg-ios-surfaceSecondary transition-all flex items-center gap-2.5 text-[13px] font-semibold text-ios-textPrimary shadow-sm"
          >
            <Home className="w-4 h-4 text-ios-accent" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/jadwal"
            className="p-3 rounded-2xl bg-ios-surface border border-ios-border hover:border-ios-accent/50 hover:bg-ios-surfaceSecondary transition-all flex items-center gap-2.5 text-[13px] font-semibold text-ios-textPrimary shadow-sm"
          >
            <CalendarDays className="w-4 h-4 text-blue-500" />
            <span>Jadwal Kuliah</span>
          </Link>
          <Link
            href="/tugas"
            className="p-3 rounded-2xl bg-ios-surface border border-ios-border hover:border-ios-accent/50 hover:bg-ios-surfaceSecondary transition-all flex items-center gap-2.5 text-[13px] font-semibold text-ios-textPrimary shadow-sm"
          >
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span>Tugas &amp; Tubes</span>
          </Link>
          <Link
            href="/nilai"
            className="p-3 rounded-2xl bg-ios-surface border border-ios-border hover:border-ios-accent/50 hover:bg-ios-surfaceSecondary transition-all flex items-center gap-2.5 text-[13px] font-semibold text-ios-textPrimary shadow-sm"
          >
            <Compass className="w-4 h-4 text-emerald-500" />
            <span>Transkrip Nilai</span>
          </Link>
        </div>

        <div>
          <Link href="/dashboard">
            <Button variant="primary" className="gap-2 px-6">
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Dashboard Utama</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

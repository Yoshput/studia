"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { Sparkles } from "lucide-react";

interface NavbarProps {
  onOpenAssistant?: () => void;
  semesterName?: string;
}

export function Navbar({ onOpenAssistant, semesterName = "Semester 4" }: NavbarProps) {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <header className="md:hidden sticky top-0 z-40 glass-nav border-b border-ios-border transition-colors duration-200">
      <div className="max-w-[640px] mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand & Active Semester */}
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <span className="text-[19px] font-bold text-ios-textPrimary tracking-tight">
            Semestr
          </span>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-ios-surfaceSecondary text-ios-textSecondary border border-ios-border">
            {semesterName}
          </span>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {onOpenAssistant && (
            <button
              type="button"
              onClick={onOpenAssistant}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-btn bg-ios-surfaceSecondary hover:bg-ios-surface border border-ios-border text-ios-accent text-[12px] font-semibold transition-all shadow-sm active:scale-95 min-h-[34px]"
              title="Tanya Asisten AI"
            >
              <Sparkles className="w-3.5 h-3.5 stroke-[2.2]" />
              <span className="hidden sm:inline">Asisten</span>
            </button>
          )}

          <ThemeToggle />

          <Link
            href="/profil"
            className="w-8 h-8 rounded-full overflow-hidden border border-ios-border flex items-center justify-center bg-ios-accent/10 flex-shrink-0 active:scale-95 transition-transform"
            title="Profil Mahasiswa"
          >
            <img
              src="/avatars/yossika.jpg"
              alt="Profil"
              className="w-full h-full object-cover"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}

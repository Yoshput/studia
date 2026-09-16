"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  Camera,
  GraduationCap,
  BookOpenCheck,
  User,
  Sparkles,
  PhoneCall,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { signOut } from "next-auth/react";

interface DesktopSidebarProps {
  semesterName?: string;
  onOpenLiveVoice?: () => void;
}

const navSections = [
  {
    title: "Menu Utama",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, badge: null },
      { href: "/jadwal", label: "Jadwal Perkuliahan", icon: CalendarDays, badge: "8 Matkul" },
      { href: "/tugas", label: "Tugas & Deadline", icon: CheckSquare, badge: "3 Aktif" },
      { href: "/absen", label: "Presensi Scan Wajah", icon: Camera, badge: "Biometrik" },
    ],
  },
  {
    title: "Akademik & Performa",
    items: [
      { href: "/nilai", label: "Nilai & Transkrip", icon: GraduationCap, badge: "IPK 3.64" },
      { href: "/progress", label: "Progress Belajar", icon: BookOpenCheck, badge: null },
    ],
  },
  {
    title: "Akun & Preferensi",
    items: [
      { href: "/profil", label: "Profil Mahasiswa", icon: User, badge: null },
    ],
  },
];

export function DesktopSidebar({
  semesterName = "Semester 5",
  onOpenLiveVoice,
}: DesktopSidebarProps) {
  const pathname = usePathname();
  const [avatarUrl, setAvatarUrl] = useState<string>("/avatars/yossika.jpg");
  const [studentName, setStudentName] = useState<string>("Yossika Putra E.");
  const [studentNim, setStudentNim] = useState<string>("103112430026");
  const [studentClass, setStudentClass] = useState<string>("S1IF-12-06");

  useEffect(() => {
    // Initial check from localStorage for instant display
    const cached = localStorage.getItem("semestr-user-avatar");
    if (cached) setAvatarUrl(cached);

    // Fetch latest profile from server
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          if (d.user.avatar_url) {
            setAvatarUrl(d.user.avatar_url);
            localStorage.setItem("semestr-user-avatar", d.user.avatar_url);
          }
          if (d.user.nama) setStudentName(d.user.nama);
          if (d.user.nim) setStudentNim(d.user.nim);
          if (d.user.kelas) setStudentClass(d.user.kelas);
        }
      })
      .catch(() => {});

    // Listen for instant avatar update event
    const handleAvatarUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<{ avatar_url: string }>;
      if (customEvent.detail?.avatar_url) {
        setAvatarUrl(customEvent.detail.avatar_url);
      } else {
        const saved = localStorage.getItem("semestr-user-avatar");
        if (saved) setAvatarUrl(saved);
      }
    };

    window.addEventListener("avatar-updated", handleAvatarUpdated);
    return () => window.removeEventListener("avatar-updated", handleAvatarUpdated);
  }, []);

  // Hide on landing, login, signup
  if (pathname === "/" || pathname === "/login" || pathname === "/signup") {
    return null;
  }

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 fixed left-0 top-0 bottom-0 z-30 bg-ios-surface border-r border-ios-border select-none transition-all duration-200">
      {/* 1. Brand Logo & System Status */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-ios-border/70">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-ios-accent to-purple-600 flex items-center justify-center text-white font-black text-[16px] shadow-sm group-hover:scale-105 transition-transform">
            S
          </div>
          <div>
            <span className="text-[17px] font-bold text-ios-textPrimary tracking-tight flex items-center gap-1.5">
              Semestr
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-ios-accent/15 text-ios-accent font-semibold tracking-wider uppercase">
                CMS
              </span>
            </span>
            <p className="text-[10.5px] text-ios-textSecondary font-medium leading-none">
              Academic OS • {semesterName}
            </p>
          </div>
        </Link>
      </div>

      {/* 2. Student Identity Mini Banner */}
      <div className="p-3.5 mx-3 mt-3 rounded-2xl bg-ios-surfaceSecondary/60 border border-ios-border/70">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-[14px] shadow-inner flex-shrink-0 overflow-hidden border border-ios-border">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={studentName}
                className="w-full h-full object-cover"
                onError={() => setAvatarUrl("/avatars/yossika.jpg")}
              />
            ) : (
              studentName.charAt(0) || "Y"
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-ios-textPrimary truncate leading-snug">
              {studentName}
            </p>
            <p className="text-[11px] text-ios-textSecondary truncate">
              {studentNim} • {studentClass}
            </p>
          </div>
        </div>
        <div className="mt-2.5 pt-2 border-t border-ios-border/40 flex items-center justify-between text-[11px]">
          <span className="text-ios-textSecondary">IPK Resmi:</span>
          <span className="font-bold text-ios-accent px-1.5 py-0.5 rounded bg-ios-accent/10">
            3.64 (84 SKS)
          </span>
        </div>
      </div>

      {/* 3. Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 no-scrollbar">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <p className="px-3 text-[10.5px] font-semibold uppercase tracking-wider text-ios-textSecondary/70">
              {section.title}
            </p>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-btn text-[13px] font-medium transition-all group min-h-[40px]",
                    isActive
                      ? "bg-ios-accent text-white font-semibold shadow-sm"
                      : "text-ios-textSecondary hover:text-ios-textPrimary hover:bg-ios-surfaceSecondary/80"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={cn(
                        "w-4 h-4 transition-transform group-hover:scale-110",
                        isActive ? "text-white" : "text-ios-textSecondary group-hover:text-ios-textPrimary"
                      )}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full font-semibold transition-colors",
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-ios-surfaceSecondary text-ios-textSecondary border border-ios-border/60"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}

        {/* 4. AI Gemini 2.5 Flash Quick Action Card */}
        <div className="p-3 rounded-2xl bg-gradient-to-br from-ios-accent/10 via-purple-500/10 to-transparent border border-ios-accent/20 mt-2 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-ios-accent">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Gemini 2.5 Flash Aktif</span>
          </div>
          <p className="text-[11px] text-ios-textSecondary leading-snug">
            Aiko 3D siap menjawab jadwal, tugas, atau ngobrol suara langsung.
          </p>
          {onOpenLiveVoice && (
            <button
              type="button"
              onClick={onOpenLiveVoice}
              className="w-full py-1.5 px-2.5 rounded-btn bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
            >
              <PhoneCall className="w-3 h-3 text-emerald-500 animate-pulse" />
              <span>Buka Live Voice 3D</span>
            </button>
          )}
        </div>
      </div>

      {/* 5. Footer: Theme Toggle & Logout */}
      <div className="p-3 border-t border-ios-border/70 flex items-center justify-between bg-ios-surfaceSecondary/30">
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <span className="text-[11px] text-ios-textSecondary font-medium">Tema</span>
        </div>

        <button
          type="button"
          onClick={async () => {
            try {
              await signOut({ redirect: false });
            } catch (e) {}
            window.location.href = "/?logged_out=1";
          }}
          className="flex items-center gap-1 text-[11.5px] font-medium text-ios-textSecondary hover:text-ios-danger px-2.5 py-1.5 rounded-btn hover:bg-ios-danger/10 transition-colors"
          title="Keluar dari akun"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}

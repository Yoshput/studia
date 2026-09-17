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
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { signOut } from "next-auth/react";
import { usePWAInstall } from "@/components/pwa/PWAInstallContext";

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

import { useSession } from "next-auth/react";

export function DesktopSidebar({
  semesterName = "Semester 5",
  onOpenLiveVoice,
}: DesktopSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isInstallable, promptInstall } = usePWAInstall();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string>(session?.user?.name || "Mahasiswa");
  const [studentNim, setStudentNim] = useState<string>("");
  const [studentClass, setStudentClass] = useState<string>("");

  const userIdentifier = session?.user?.email || (session?.user as { id?: string })?.id;

  useEffect(() => {
    // Immediately purge legacy global avatar cache
    try {
      localStorage.removeItem("semestr-user-avatar");
    } catch {}

    if (session?.user?.name) {
      setStudentName(session.user.name);
    }

    if (!userIdentifier) {
      setAvatarUrl(null);
      return;
    }

    const userCacheKey = `semestr-avatar-${userIdentifier}`;
    const cached = localStorage.getItem(userCacheKey);
    if (cached) {
      setAvatarUrl(cached);
    } else {
      setAvatarUrl(null);
    }

    // Fetch latest profile from server
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d?.user) {
          if (d.user.avatar_url) {
            setAvatarUrl(d.user.avatar_url);
            localStorage.setItem(userCacheKey, d.user.avatar_url);
          } else {
            setAvatarUrl(null);
            localStorage.removeItem(userCacheKey);
          }
          if (d.user.nama) setStudentName(d.user.nama);
          if (d.user.nim) setStudentNim(d.user.nim);
          if (d.user.kelas) setStudentClass(d.user.kelas);
        }
      })
      .catch(() => {});

    // Listen for instant avatar update event
    const handleAvatarUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<{ avatar_url?: string | null }>;
      const newUrl = customEvent.detail?.avatar_url || null;
      setAvatarUrl(newUrl);
      if (newUrl) {
        localStorage.setItem(userCacheKey, newUrl);
      } else {
        localStorage.removeItem(userCacheKey);
      }
    };

    window.addEventListener("avatar-updated", handleAvatarUpdated);
    return () => window.removeEventListener("avatar-updated", handleAvatarUpdated);
  }, [session, userIdentifier]);

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
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-ios-accent to-blue-600 flex items-center justify-center text-white font-bold text-[14px] shadow-inner flex-shrink-0 overflow-hidden border border-ios-border">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={studentName}
                className="w-full h-full object-cover"
                onError={() => setAvatarUrl(null)}
              />
            ) : (
              studentName.charAt(0) || "M"
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-ios-textPrimary truncate leading-snug">
              {studentName}
            </p>
            <p className="text-[11px] text-ios-textSecondary truncate">
              {studentNim ? `${studentNim} ${studentClass ? `• ${studentClass}` : ""}` : session?.user?.email || "Mahasiswa Aktif"}
            </p>
          </div>
        </div>
        <div className="mt-2.5 pt-2 border-t border-ios-border/40 flex items-center justify-between text-[11px]">
          <span className="text-ios-textSecondary">Akun:</span>
          <span className="font-semibold text-ios-success px-1.5 py-0.5 rounded bg-ios-success/10">
            Terverifikasi Aktif
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
        <div className="p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.1] mt-2 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-ios-textPrimary">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-300 dark:bg-white"></span>
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
              className="w-full py-1.5 px-2.5 rounded-btn bg-black/[0.05] hover:bg-black/[0.08] dark:bg-white/[0.1] dark:hover:bg-white/[0.15] border border-black/[0.08] dark:border-white/[0.15] text-ios-textPrimary text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
            >
              <PhoneCall className="w-3 h-3 text-zinc-500 dark:text-zinc-300 animate-pulse" />
              <span>Buka Live Voice 3D</span>
            </button>
          )}
        </div>

        {/* PWA Install Quick Action */}
        {isInstallable && (
          <button
            type="button"
            onClick={promptInstall}
            className="w-full py-2 px-3 rounded-2xl bg-ios-accent/10 hover:bg-ios-accent/20 border border-ios-accent/30 text-ios-accent text-[11.5px] font-bold flex items-center justify-between transition-all active:scale-[0.98] mt-2 group shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Download className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
              <span>Install Aplikasi</span>
            </div>
            <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-ios-accent text-white font-bold uppercase tracking-wider">
              PWA
            </span>
          </button>
        )}
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
              localStorage.removeItem("semestr-user-avatar");
              if (userIdentifier) localStorage.removeItem(`semestr-avatar-${userIdentifier}`);
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

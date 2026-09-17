"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";
import { Sparkles, Download } from "lucide-react";
import { usePWAInstall } from "@/components/pwa/PWAInstallContext";

interface NavbarProps {
  onOpenAssistant?: () => void;
  semesterName?: string;
}

export function Navbar({ onOpenAssistant, semesterName = "Semester 5" }: NavbarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isInstallable, promptInstall } = usePWAInstall();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [studentInitial, setStudentInitial] = useState<string>(
    session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "M"
  );

  const userIdentifier = session?.user?.email || (session?.user as { id?: string })?.id;

  useEffect(() => {
    // Immediately purge legacy global avatar cache that could retain previous user photos
    try {
      localStorage.removeItem("semestr-user-avatar");
    } catch {}

    if (session?.user?.name) {
      setStudentInitial(session.user.name.charAt(0).toUpperCase());
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

    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d?.user) {
          if (d.user.nama) {
            setStudentInitial(d.user.nama.charAt(0).toUpperCase());
          }
          if (d.user.avatar_url) {
            setAvatarUrl(d.user.avatar_url);
            localStorage.setItem(userCacheKey, d.user.avatar_url);
          } else {
            setAvatarUrl(null);
            localStorage.removeItem(userCacheKey);
          }
        }
      })
      .catch(() => {});

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
  }, [userIdentifier, session]);

  if (pathname === "/login") return null;

  const initial = studentInitial || "M";

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

          {isInstallable && (
            <button
              type="button"
              onClick={promptInstall}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-btn bg-ios-accent/15 hover:bg-ios-accent/25 border border-ios-accent/30 text-ios-accent text-[12px] font-bold transition-all shadow-sm active:scale-95 min-h-[34px]"
              title="Install Aplikasi"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Install</span>
            </button>
          )}

          <ThemeToggle />

          <Link
            href="/profil"
            className="w-8 h-8 rounded-full overflow-hidden border border-ios-border flex items-center justify-center bg-ios-accent/15 flex-shrink-0 active:scale-95 transition-transform"
            title="Profil Mahasiswa"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profil"
                className="w-full h-full object-cover"
                onError={() => setAvatarUrl(null)}
              />
            ) : (
              <span className="text-[12px] font-bold text-ios-accent">
                {initial}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

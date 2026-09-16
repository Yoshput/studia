"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  GraduationCap,
  BookOpenCheck,
  CheckSquare,
  Camera,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const navTabs = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jadwal", label: "Jadwal", icon: CalendarDays },
  { href: "/tugas", label: "Tugas", icon: CheckSquare },
  { href: "/absen", label: "Absen", icon: Camera },
  { href: "/nilai", label: "Nilai", icon: GraduationCap },
  { href: "/progress", label: "Progress", icon: BookOpenCheck },
  { href: "/profil", label: "Profil", icon: User },
];

export function BottomTabBar() {
  const pathname = usePathname();

  // Don't render on landing page, login, or signup
  if (pathname === "/" || pathname === "/login" || pathname === "/signup") return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-nav border-t border-ios-border pb-safe transition-all duration-200">
      <div className="max-w-[640px] mx-auto px-1 h-16 flex items-center justify-around">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-1 transition-colors select-none group min-h-[44px]",
                isActive
                  ? "text-ios-accent"
                  : "text-ios-textSecondary hover:text-ios-textPrimary"
              )}
            >
              <div
                className={cn(
                  "p-1 rounded-full transition-transform group-active:scale-90",
                  isActive && "scale-105"
                )}
              >
                <Icon className={cn("w-4.5 h-4.5", isActive ? "stroke-[2.25px]" : "stroke-[1.75px]")} />
              </div>
              <span
                className={cn(
                  "text-[9.5px] tracking-tight mt-0.5",
                  isActive ? "font-semibold" : "font-normal"
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

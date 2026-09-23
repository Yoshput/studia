"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
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
      <div className="max-w-[640px] mx-auto px-1.5 h-16 flex items-center justify-around relative">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href || (tab.href !== "/dashboard" && pathname.startsWith(tab.href));

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 py-1 select-none group min-h-[46px] rounded-xl transition-colors duration-150 active:scale-90",
                isActive
                  ? "text-ios-accent"
                  : "text-ios-textSecondary hover:text-ios-textPrimary"
              )}
            >
              {/* Smooth Sliding Pill Indicator */}
              {isActive && (
                <motion.div
                  layoutId="bottomNavActivePill"
                  className="absolute inset-0.5 bg-ios-accent/[0.08] dark:bg-ios-accent/[0.15] border border-ios-accent/20 rounded-xl -z-10"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}

              <div
                className={cn(
                  "p-1 rounded-full transition-all duration-200",
                  isActive && "scale-110"
                )}
              >
                <Icon className={cn("w-[19px] h-[19px]", isActive ? "stroke-[2.4px]" : "stroke-[1.75px]")} />
              </div>
              <span
                className={cn(
                  "text-[9.5px] tracking-tight transition-all duration-150",
                  isActive ? "font-bold scale-105" : "font-normal"
                )}
              >
                {tab.label}
              </span>

              {/* Active Indicator Dot */}
              {isActive && (
                <motion.span
                  layoutId="bottomNavDot"
                  className="w-1 h-1 rounded-full bg-ios-accent mt-0.5"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("semestr-theme") as "light" | "dark" | null;

    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Default initial preference detection
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initialTheme = systemDark ? "dark" : "light";
      setTheme(initialTheme);
      applyTheme(initialTheme);
    }
  }, []);

  const applyTheme = (targetTheme: "light" | "dark") => {
    const root = document.documentElement;
    root.removeAttribute("data-theme");
    if (targetTheme === "dark") {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("semestr-theme", targetTheme);

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("semestr-theme-change", { detail: targetTheme })
      );
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center p-2 rounded-btn bg-ios-surfaceSecondary border border-ios-border text-ios-textSecondary hover:text-ios-textPrimary transition-all duration-200 min-h-[36px] min-w-[36px] active:scale-[0.96] shadow-sm ${className}`}
      aria-label={`Ganti ke mode ${theme === "light" ? "gelap" : "terang"}`}
      title={
        theme === "light"
          ? "Mode Merah Putih (Klik untuk Mode Gelap)"
          : "Mode Gelap (Klik untuk Mode Merah Putih)"
      }
    >
      {mounted && theme === "dark" ? (
        <Sun className="w-4 h-4 text-amber-400 stroke-[2.2] transition-transform duration-200 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-ios-accent stroke-[2.2] transition-transform duration-200 rotate-0 hover:-rotate-12" />
      )}
    </button>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Check localStorage or OS preference
    const savedTheme = localStorage.getItem("semestr-theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("semestr-theme", nextTheme);

    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="p-2 rounded-btn bg-ios-surfaceSecondary border border-ios-border text-ios-textSecondary hover:text-ios-textPrimary transition-all duration-150 min-h-[36px] min-w-[36px] flex items-center justify-center active:scale-95"
      aria-label={`Ganti ke mode ${theme === "light" ? "gelap" : "terang"}`}
      title={`Mode ${theme === "light" ? "Gelap" : "Terang"}`}
    >
      {theme === "light" ? (
        <Moon className="w-4 h-4 stroke-[2]" />
      ) : (
        <Sun className="w-4 h-4 stroke-[2]" />
      )}
    </button>
  );
}

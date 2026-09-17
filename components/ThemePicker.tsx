"use client";

import React, { useEffect, useState } from "react";

type Theme = "pink" | "maroon" | "green" | "dark";

const THEMES: { id: Theme; label: string; color: string; ring: string }[] = [
  { id: "pink",   label: "Pink Pastel",  color: "#EC4899", ring: "ring-pink-400"    },
  { id: "maroon", label: "Maroon",       color: "#9F1239", ring: "ring-rose-800"    },
  { id: "green",  label: "Hijau Fresh",  color: "#22C55E", ring: "ring-emerald-500" },
  { id: "dark",   label: "Dark Mode",    color: "#0F172A", ring: "ring-slate-600"   },
];

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  // Remove all theme data attrs + dark class first
  root.removeAttribute("data-theme");
  root.classList.remove("dark");

  if (theme === "dark") {
    root.classList.add("dark");
    root.setAttribute("data-theme", "dark");
  } else if (theme === "maroon") {
    root.setAttribute("data-theme", "maroon");
  } else if (theme === "green") {
    root.setAttribute("data-theme", "green");
  }
  // pink = default, no attribute needed
  localStorage.setItem("semestr-theme", theme);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("semestr-theme-change", { detail: theme }));
  }
}

export function ThemePicker() {
  const [theme, setTheme] = useState<Theme>("pink");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = (localStorage.getItem("semestr-theme") as Theme) || "pink";
    setTheme(saved);
    applyTheme(saved);
  }, []);

  const handleSelect = (t: Theme) => {
    setTheme(t);
    applyTheme(t);
    setOpen(false);
  };

  const current = THEMES.find((t) => t.id === theme) || THEMES[0];

  return (
    <div className="relative">
      {/* Trigger pill */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Ganti tema warna"
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] border border-black/[0.07] dark:border-white/[0.10] hover:bg-black/[0.08] dark:hover:bg-white/[0.14] transition-all text-[12px] font-medium text-[var(--text-primary)]"
      >
        {/* Swatch */}
        <span
          className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm flex-shrink-0"
          style={{ background: current.color }}
        />
        <span className="hidden sm:inline leading-none font-medium">{current.label}</span>
        {/* Chevron */}
        <svg
          className={`w-3 h-3 text-[#7A5068] dark:text-[#B08099] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 12 12"
          fill="none"
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-44 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xl overflow-hidden">
            <div className="p-1.5 space-y-0.5">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelect(t.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-[13px] font-medium transition-all ${
                    theme === t.id
                      ? "bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold"
                      : "hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-[var(--text-primary)]"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex-shrink-0 border-2 ${theme === t.id ? "border-[var(--accent)]" : "border-transparent"} shadow-sm`}
                    style={{ background: t.color }}
                  />
                  {t.label}
                  {theme === t.id && (
                    <svg className="ml-auto w-3.5 h-3.5 text-[var(--accent)]" viewBox="0 0 14 14" fill="none">
                      <path d="M2.5 7l3.5 3.5 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

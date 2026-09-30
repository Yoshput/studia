'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MascotIcon } from '@/components/assistant/MascotIcon';
import { TelkomLogo } from '@/components/TelkomLogo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ProductByPill } from '@/components/landing/ProductByPill';
import { Menu, X, ArrowRight } from 'lucide-react';

interface LandingNavbarProps {
  scrolled: boolean;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({ scrolled }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-3 sm:top-4 left-0 right-0 z-50 px-3 sm:px-6 pointer-events-none">
      <div
        className={`max-w-6xl mx-auto rounded-full backdrop-blur-xl transition-all duration-300 pointer-events-auto border ${
          scrolled
            ? 'bg-white/95 dark:bg-[#0c0a0b]/95 border-red-200/60 dark:border-white/10 shadow-xl shadow-red-950/5 py-2 px-4 sm:px-5'
            : 'bg-white/90 dark:bg-[#0c0a0b]/90 border-slate-200/80 dark:border-white/10 shadow-lg shadow-red-950/5 py-2.5 px-4 sm:px-6'
        } flex items-center justify-between gap-2`}
      >
        {/* Left: Brand Identity */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-700 via-red-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-red-500/25 transition-transform group-hover:scale-105">
            <MascotIcon size={18} />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-[16px] tracking-tight text-slate-900 dark:text-white leading-none">
              Semestr
            </span>
            <span className="text-[8.5px] font-mono tracking-widest text-red-600 dark:text-red-400 uppercase font-bold">
              ACADEMIC OS
            </span>
          </div>
        </Link>

        {/* Center: Navigation Menu Pills */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 text-[12.5px] font-medium text-slate-600 dark:text-slate-300">
          <a
            href="#pratinjau"
            className="px-3 py-1.5 rounded-full hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-white/5 transition-all"
          >
            Pratinjau
          </a>
          <a
            href="#fitur"
            className="px-3 py-1.5 rounded-full hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-white/5 transition-all"
          >
            Fitur Unggulan
          </a>
          <a
            href="#cara-kerja"
            className="px-3 py-1.5 rounded-full hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-white/5 transition-all"
          >
            Cara Kerja
          </a>
          <a
            href="#ulasan"
            className="px-3 py-1.5 rounded-full hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-white/5 transition-all"
          >
            Mahasiswa
          </a>
          <a
            href="#faq"
            className="px-3 py-1.5 rounded-full hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-white/5 transition-all"
          >
            Bantuan
          </a>
        </nav>

        {/* Right Action Elements */}
        <div className="hidden sm:flex items-center gap-2 xl:gap-2.5">
          {/* Telkom University Badge Pill */}
          <div className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50/80 dark:bg-white/5 border border-red-100 dark:border-white/10 text-[11px] font-semibold text-red-700 dark:text-red-300">
            <TelkomLogo size={13} />
            <span className="truncate max-w-[140px]">Telkom University</span>
          </div>

          {/* Creator Pill Avatar */}
          <ProductByPill variant="navbar" className="hidden md:inline-flex" />

          {/* Theme Switcher */}
          <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center bg-slate-50 dark:bg-white/5">
            <ThemeToggle />
          </div>

          {/* Login Link */}
          <Link
            href="/login"
            className="text-[12.5px] font-semibold text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 px-2.5 py-1.5 transition-colors"
          >
            Masuk
          </Link>

          {/* Mulai Gratis CTA Capsule */}
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-white px-4 py-2 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 shadow-md shadow-red-500/25 hover:shadow-red-500/40 hover:scale-[1.03] active:scale-[0.98] transition-all"
          >
            <span>Mulai Gratis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 sm:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
            aria-label="Buka Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto sm:hidden mt-2 max-w-sm mx-auto bg-white/95 dark:bg-[#121013]/95 backdrop-blur-2xl rounded-3xl border border-red-200/60 dark:border-white/10 p-5 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
            <a
              href="#pratinjau"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-white/5"
            >
              Pratinjau
            </a>
            <a
              href="#fitur"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-white/5"
            >
              Fitur Unggulan
            </a>
            <a
              href="#cara-kerja"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-white/5"
            >
              Cara Kerja
            </a>
            <a
              href="#ulasan"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-white/5"
            >
              Mahasiswa
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-white/5"
            >
              Bantuan
            </a>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-white/10 space-y-3">
            <div className="flex justify-center">
              <ProductByPill variant="navbar" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/login"
                className="py-2.5 text-center text-xs font-bold rounded-full border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
              >
                Masuk
              </Link>
              <Link
                href="/signup"
                className="py-2.5 text-center text-xs font-bold rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-500/25"
              >
                Daftar Gratis
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

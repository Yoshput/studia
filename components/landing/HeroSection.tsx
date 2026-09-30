'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Play, ShieldCheck, CheckCircle2, ChevronRight } from 'lucide-react';
import { TelkomLogo } from '@/components/TelkomLogo';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-32 sm:pt-40 pb-16 px-4 sm:px-6 max-w-6xl mx-auto text-center">
      {/* Ambient Crimson Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-[600px] h-72 sm:h-[450px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-500/15 via-rose-500/5 to-transparent blur-3xl -z-10 pointer-events-none" />

      {/* 1. Top Announcement Pill */}
      <div className="inline-block mb-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
        <a
          href="https://yossikaputra.my.id"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 dark:bg-red-950/50 hover:bg-red-100/80 dark:hover:bg-red-900/60 border border-red-200/90 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs font-bold shadow-sm shadow-red-500/5 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
          </span>
          <span>Karya Orisinil Mahasiswa Telkom University • Yossika Putra Erlangga (103112430026)</span>
          <ChevronRight className="w-3.5 h-3.5 text-red-500 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>

      {/* 2. Headline Display (Apple Standard Typography) */}
      <div className="max-w-4xl mx-auto space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-600">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08] text-slate-900 dark:text-white">
          <span>Seluruh perkuliahan.</span>
          <br />
          <span className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 bg-clip-text text-transparent">
            Dalam satu kendali ceria & tenang.
          </span>
        </h1>

        {/* 3. Descriptive Sub-headline */}
        <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto pt-4 leading-relaxed font-normal">
          Solusi all-in-one mahasiswa modern: kamera presensi orientasi normal anti-terbalik, deteksi jadwal bentrok otomatis, asisten AI Aiko kontekstual, dan simulasi IPK 4.0.
        </p>
      </div>

      {/* 4. Dual Action Button Group */}
      <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-5 duration-700">
        {/* Primary CTA */}
        <Link
          href="/signup"
          className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-red-500/25 hover:shadow-red-500/40 hover:scale-[1.03] active:scale-[0.98] transition-all"
        >
          <span>Mulai Coba Gratis</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
        </Link>

        {/* Secondary CTA */}
        <a
          href="#pratinjau"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-800 dark:text-white font-bold text-sm sm:text-base border border-slate-200/90 dark:border-white/15 shadow-sm hover:shadow transition-all"
        >
          <Sparkles className="w-4 h-4 text-red-600" />
          <span>Uji Simulasi Fitur</span>
        </a>
      </div>

      {/* 5. Mini Social Proof Badges */}
      <div className="pt-10 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-red-600" />
          <span>100% Kampus Telkom Ready</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-red-600" />
          <span>Garansi 0 Jadwal Bentrok</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-red-600" />
          <span>Kamera Normal Anti-Mirror</span>
        </div>
      </div>
    </section>
  );
};

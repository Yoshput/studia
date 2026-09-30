'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export const ClosingCta: React.FC = () => {
  return (
    <section className="relative py-24 px-4 sm:px-6 text-center overflow-hidden">
      {/* Ambient Crimson Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-[650px] h-80 sm:h-[400px] bg-gradient-to-tr from-red-600/10 via-rose-500/15 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200/80 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-red-600" />
          <span>Siap Untuk IPK Terbaik?</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
          Mulai kelola perkuliahan Anda dengan tenang.
        </h2>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
          Pendaftaran instan tanpa biaya. Nikmati kebebasan mengatur jadwal, presensi normal, dan bimbingan AI setiap hari.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-red-500/30 hover:scale-[1.03] active:scale-[0.98] transition-all"
          >
            <span>Daftar Akun Mahasiswa Gratis</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto px-6 py-3.5 rounded-full text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white font-bold text-sm transition-colors"
          >
            Sudah punya akun? Masuk
          </Link>
        </div>
      </div>
    </section>
  );
};

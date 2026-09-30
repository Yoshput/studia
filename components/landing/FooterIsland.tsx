'use client';

import React from 'react';
import Link from 'next/link';
import { MascotIcon } from '@/components/assistant/MascotIcon';
import { TelkomLogo } from '@/components/TelkomLogo';
import { ProductByPill } from '@/components/landing/ProductByPill';
import { ShieldCheck, ArrowUpRight, Heart, Sparkles } from 'lucide-react';

export const FooterIsland: React.FC = () => {
  return (
    <footer className="pt-20 pb-28 sm:pb-36 px-4 sm:px-6 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/60 dark:bg-[#070607] transition-colors">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Top Tier: Centerpiece Product Attribution Island (Exact Match Screenshot 2) */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#0e0c0e] border border-slate-200/90 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-white/5 border border-red-200/60 dark:border-white/10 text-red-700 dark:text-red-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-red-600" />
              <span>Karya Orisinil Mahasiswa Telkom University</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Dibuat untuk Memajukan Ekosistem Digital Kampus.
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed">
              Dikembangkan oleh mahasiswa S1 Informatika Telkom University Purwokerto dengan dedikasi tinggi pada standar kualitas antarmuka Apple iOS & Spatial UI.
            </p>
          </div>

          {/* Screenshot 2 Styled Creator Badge */}
          <div className="flex-shrink-0 flex flex-col sm:flex-row items-center gap-4">
            <ProductByPill variant="footer" />
          </div>
        </div>

        {/* Middle Tier: Navigation Links & Brand */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-200/70 dark:border-white/5 text-xs text-slate-600 dark:text-slate-400">
          {/* Logo & Campus */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-red-700 to-rose-600 flex items-center justify-center text-white shadow-sm">
                <MascotIcon size={16} />
              </div>
              <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-sm">
                Semestr OS
              </span>
            </div>
            <span className="text-slate-300 dark:text-white/20">|</span>
            <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <TelkomLogo size={14} />
              <span>Telkom University Purwokerto</span>
            </div>
          </div>

          {/* Nav links */}
          <div className="flex flex-wrap items-center justify-center gap-6 font-semibold">
            <a href="#pratinjau" className="hover:text-red-600 dark:hover:text-white transition-colors">
              Pratinjau
            </a>
            <a href="#fitur" className="hover:text-red-600 dark:hover:text-white transition-colors">
              Fitur
            </a>
            <a href="#ulasan" className="hover:text-red-600 dark:hover:text-white transition-colors">
              Ulasan
            </a>
            <Link href="/privacy" className="hover:text-red-600 dark:hover:text-white transition-colors">
              Kebijakan Privasi
            </Link>
            <Link href="/terms" className="hover:text-red-600 dark:hover:text-white transition-colors">
              Syarat & Ketentuan
            </Link>
          </div>

          {/* SLA Server Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Server Presensi Aktif 99.9% SLA</span>
          </div>
        </div>

        {/* Bottom Tier: Copyright & Engineering Signature */}
        <div className="pt-6 border-t border-slate-200/60 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11.5px] text-slate-400 dark:text-slate-500">
          <p>
            © 2026 Semestr Academic OS. Diciptakan dengan Apple-grade Precision untuk Mahasiswa Indonesia.
          </p>
          <p className="font-mono">
            NIM: 103112430026 • Yossika Putra Erlangga
          </p>
        </div>
      </div>
    </footer>
  );
};

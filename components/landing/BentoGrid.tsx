'use client';

import React from 'react';
import {
  Calendar,
  Camera,
  Bot,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';
import Link from 'next/link';

export const BentoGrid: React.FC = () => {
  return (
    <section id="fitur" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200/80 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs font-bold tracking-tight">
          <Sparkles className="w-3.5 h-3.5 text-red-600 animate-spin" />
          <span>Arsitektur Fitur Generasi Baru</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Didesain untuk Mahasiswa Berprestasi.
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
          Empat pilar utama yang menyederhanakan birokrasi perkuliahan Telkom University ke dalam satu antarmuka elegan kelas Apple Cupertino.
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* CARD 1: Deteksi Jadwal Bentrok (Spans 2 columns on desktop) */}
        <div className="md:col-span-2 group relative p-7 sm:p-9 rounded-3xl bg-white dark:bg-[#0e0c0e] border border-slate-200/80 dark:border-white/10 hover:border-red-500/40 dark:hover:border-red-500/40 shadow-[0_4px_20px_-4px_rgba(220,38,38,0.06)] hover:shadow-[0_12px_32px_-8px_rgba(220,38,38,0.14)] transition-all duration-300 overflow-hidden flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600/15 to-rose-500/20 text-red-600 flex items-center justify-center border border-red-500/20 shadow-inner group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-red-600">
                Pilar Utama #01
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                Deteksi Jadwal Bentrok Otomatis (FRS Guard)
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed max-w-xl">
                Tidak ada lagi kejutan hadir di dua kelas pada jam yang sama. Algoritma kami memvalidasi seluruh irisan jam matkul, ruang, dan praktikum dalam hitungan milidetik.
              </p>
            </div>
          </div>

          {/* Interactive visualizer element */}
          <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>22 SKS Bebas Konflik Waktu</span>
              </span>
              <span className="text-slate-400 font-mono text-[11px]">Audit: 0.04s</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-red-600 via-rose-500 to-emerald-500 h-full w-full rounded-full" />
            </div>
          </div>
        </div>

        {/* CARD 2: Kamera Presensi Normal (Anti Mirror) */}
        <div className="group relative p-7 sm:p-9 rounded-3xl bg-white dark:bg-[#0e0c0e] border border-slate-200/80 dark:border-white/10 hover:border-red-500/40 dark:hover:border-red-500/40 shadow-[0_4px_20px_-4px_rgba(220,38,38,0.06)] hover:shadow-[0_12px_32px_-8px_rgba(220,38,38,0.14)] transition-all duration-300 overflow-hidden flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600/15 to-rose-500/20 text-red-600 flex items-center justify-center border border-red-500/20 shadow-inner group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-red-600">
                Pilar Utama #02
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                Kamera Presensi Orientasi Normal
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Kamera depan bawaan ponsel sering membalikkan foto (mirror). Semestr menormalkan orientasi sumbu X sehingga seragam, ID card, dan teks tetap terbaca alami.
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs font-bold text-red-600">
            <span>Solusi Anti Foto Terbalik</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* CARD 3: Aiko Contextual AI Assistant */}
        <div className="group relative p-7 sm:p-9 rounded-3xl bg-white dark:bg-[#0e0c0e] border border-slate-200/80 dark:border-white/10 hover:border-red-500/40 dark:hover:border-red-500/40 shadow-[0_4px_20px_-4px_rgba(220,38,38,0.06)] hover:shadow-[0_12px_32px_-8px_rgba(220,38,38,0.14)] transition-all duration-300 overflow-hidden flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600/15 to-rose-500/20 text-red-600 flex items-center justify-center border border-red-500/20 shadow-inner group-hover:scale-110 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-red-600">
                Pilar Utama #03
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                Aiko Academic Copilot 24/7
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Asisten kecerdasan buatan berbasis kurikulum Telkom University. Membantu merangkum silabus, menganalisis target nilai, dan menjawab pertanyaan perkuliahan.
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs font-bold text-red-600">
            <span>Responsif & Kontekstual</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* CARD 4: Smart GPA & SKS Planner (Spans 2 columns on desktop) */}
        <div className="md:col-span-2 group relative p-7 sm:p-9 rounded-3xl bg-white dark:bg-[#0e0c0e] border border-slate-200/80 dark:border-white/10 hover:border-red-500/40 dark:hover:border-red-500/40 shadow-[0_4px_20px_-4px_rgba(220,38,38,0.06)] hover:shadow-[0_12px_32px_-8px_rgba(220,38,38,0.14)] transition-all duration-300 overflow-hidden flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600/15 to-rose-500/20 text-red-600 flex items-center justify-center border border-red-500/20 shadow-inner group-hover:scale-110 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-red-600">
                Pilar Utama #04
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                Smart GPA & SKS Planner (Target Cumlaude)
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed max-w-xl">
                Kalkulasi target kelulusan tepat waktu dengan simulasi bobot 4.0 standar Telkom University. Rencanakan nilai tiap asesmen (tugas, kuis, UTS, UAS) secara presisi.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-red-50 dark:bg-white/5 text-red-700 dark:text-red-300 text-xs font-semibold border border-red-100 dark:border-white/10">
              🎯 Simulasi Target 3.85+
            </span>
            <span className="px-3 py-1 rounded-full bg-red-50 dark:bg-white/5 text-red-700 dark:text-red-300 text-xs font-semibold border border-red-100 dark:border-white/10">
              📊 Distribusi SKS Dinamis
            </span>
            <span className="px-3 py-1 rounded-full bg-red-50 dark:bg-white/5 text-red-700 dark:text-red-300 text-xs font-semibold border border-red-100 dark:border-white/10">
              ⏱️ Estimasi Lulus 3.5 Tahun
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

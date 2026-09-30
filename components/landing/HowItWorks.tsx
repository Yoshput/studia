'use client';

import React from 'react';
import { CalendarSync, Camera, Award, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Sinkronisasi Jadwal & Matkul',
      desc: 'Cukup masukkan jadwal atau impor file kalender (.ics) dari sistem kampus. Seluruh sesi tatap muka dan praktikum langsung tertata rapi.',
      icon: CalendarSync,
    },
    {
      num: '02',
      title: 'Presensi Kamera Normal Otomatis',
      desc: 'Scan wajah saat perkuliahan berlangsung. Sistem mengoreksi efek cermin (un-mirror) dan menyertakan koordinat GPS valid kampus.',
      icon: Camera,
    },
    {
      num: '03',
      title: 'Pantau Nilai & Raih Cumlaude',
      desc: 'Simulasikan target nilai UTS dan UAS secara terukur. Konsultasikan tugas dan materi kapan saja bersama AI Academic Copilot Aiko.',
      icon: Award,
    },
  ];

  return (
    <section id="cara-kerja" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
        <span className="text-xs font-mono font-bold tracking-wider text-red-600 uppercase">
          Alur Sederhana
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Tiga Langkah Menuju Perkuliahan Nyaman.
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Semua proses dirancang instan, tanpa konfigurasi teknis yang membingungkan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={idx}
              className="relative p-8 rounded-3xl bg-white dark:bg-[#0e0c0e] border border-slate-200/80 dark:border-white/10 hover:border-red-500/30 shadow-[0_4px_20px_-4px_rgba(220,38,38,0.04)] hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 text-white flex items-center justify-center shadow-md shadow-red-500/20">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black font-mono text-slate-300 dark:text-white/15">
                    {step.num}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

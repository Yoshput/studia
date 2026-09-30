'use client';

import React from 'react';
import { TelkomLogo } from '@/components/TelkomLogo';
import {
  Sparkles,
  Camera,
  Calendar,
  GraduationCap,
  Bot,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

const TICKER_ITEMS = [
  { icon: TelkomLogo, text: 'Telkom University', isTelkom: true },
  { icon: Sparkles, text: 'Fakultas Informatika' },
  { icon: Camera, text: 'Kamera Presensi Orientasi Normal' },
  { icon: Calendar, text: 'Garansi 0 Jadwal Bentrok' },
  { icon: GraduationCap, text: 'Simulasi IPK Akurat' },
  { icon: Bot, text: 'AI Chatbot Aiko 24/7' },
  { icon: ShieldCheck, text: 'Presensi Otomatis Anti-Ribet' },
  { icon: CheckCircle2, text: 'Apple-Grade Micro UX' },
];

export const MarqueeTicker: React.FC = () => {
  return (
    <section className="py-6 border-y border-slate-200/70 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] overflow-hidden select-none">
      <div className="relative w-full flex items-center">
        {/* Left & Right Gradient Fade Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-white dark:from-[#080708] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-white dark:from-[#080708] to-transparent z-10 pointer-events-none" />

        <div className="animate-marquee-infinite flex items-center gap-8 sm:gap-12 whitespace-nowrap">
          {/* Double array for seamless loop */}
          {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="group flex items-center gap-2.5 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors duration-200 cursor-default"
              >
                <div className="w-6 h-6 rounded-full bg-slate-200/60 dark:bg-white/10 group-hover:bg-red-500/10 flex items-center justify-center text-slate-500 group-hover:text-red-600 dark:group-hover:text-red-400 transition-all">
                  {item.isTelkom ? (
                    <TelkomLogo size={14} />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>
                <span className="text-[13px] sm:text-[14px] font-semibold tracking-tight">
                  {item.text}
                </span>
                <span className="text-slate-300 dark:text-white/15 text-xs font-mono ml-4">
                  /
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

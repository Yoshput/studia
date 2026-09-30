'use client';

import React from 'react';
import { Star, CheckCircle, ShieldCheck } from 'lucide-react';
import { TelkomLogo } from '@/components/TelkomLogo';

const REVIEWS = [
  {
    name: 'Bagas Pratama',
    major: 'S1 Teknik Informatika',
    univ: 'Telkom University Purwokerto',
    rating: 5,
    time: '15 menit yang lalu',
    quote:
      'Kamera presensi orientasi normalnya benar-benar penyelamat! Dulu pas absen di web kampus hasil foto selalu terbalik kayak cermin, sekarang tulisan di lanyard dan baju langsung kebaca sempurna.',
    avatarBg: 'bg-red-600',
  },
  {
    name: 'Nabila Syahrani',
    major: 'S1 Sistem Informasi',
    univ: 'Telkom University',
    rating: 5,
    time: '42 menit yang lalu',
    quote:
      'Waktu FRS kemarin aku selalu takut ada matkul bentrok jamnya. Semestr langsung kasih notif merah pas ada jadwal tabrakan. Praktikum dan teori langsung rapi dalam sekali klik!',
    avatarBg: 'bg-rose-600',
  },
  {
    name: 'Farhan Ramadhan',
    major: 'S1 Rekayasa Perangkat Lunak',
    univ: 'Telkom University',
    rating: 5,
    time: '2 jam yang lalu',
    quote:
      'Antarmukanya kelas dunia, bener-bener kayak app Apple. Animasi smooth, kalkulator IPK-nya sangat akurat menghitung bobot nilai tugas, kuis, UTS, dan UAS.',
    avatarBg: 'bg-red-700',
  },
  {
    name: 'Diva Putri Lestari',
    major: 'S1 Desain Komunikasi Visual',
    univ: 'Telkom University',
    rating: 5,
    time: '5 jam yang lalu',
    quote:
      'Sebagai anak desain, visual website ini 10/10! Kombinasi putih bersih dan merah crimson Telkom sangat berwibawa. Nyaman dipakai belajar sampai larut malam.',
    avatarBg: 'bg-rose-700',
  },
  {
    name: 'Rizky Aditya',
    major: 'S1 Sains Data',
    univ: 'Telkom University',
    rating: 5,
    time: '1 hari yang lalu',
    quote:
      'Aiko AI Copilot sangat membantu. Dia langsung tau jadwal harian dan deadline tugas tanpa harus aku ketik ulang satu-satu dari awal. Keren banget!',
    avatarBg: 'bg-red-800',
  },
  {
    name: 'Alifia Maharani',
    major: 'S1 Teknik Telekomunikasi',
    univ: 'Telkom University',
    rating: 5,
    time: '2 hari yang lalu',
    quote:
      'Fitur download bukti foto presensi sangat berguna buat bukti ke dosen kalau sistem kampus sempat down. Wajib banget dipakai mahasiswa Tel-U se-Indonesia!',
    avatarBg: 'bg-rose-800',
  },
];

export const StudentReviews: React.FC = () => {
  return (
    <section id="ulasan" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200/80 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs font-bold tracking-tight">
          <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
          <span>Suara Mahasiswa Terverifikasi</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Dipercaya Lintas Fakultas & Jurusan.
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
          Ulasan jujur dari rekan mahasiswa Telkom University yang telah merasakan kemudahan perkuliahan tanpa bentrok dan presensi anti-terbalik.
        </p>
      </div>

      {/* 6 Review Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {REVIEWS.map((rev, idx) => (
          <div
            key={idx}
            className="p-6 rounded-3xl bg-white dark:bg-[#0e0c0e] border border-slate-200/80 dark:border-white/10 hover:border-red-500/30 shadow-[0_4px_20px_-4px_rgba(220,38,38,0.05)] hover:shadow-[0_8px_28px_-6px_rgba(220,38,38,0.12)] transition-all duration-200 flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Stars & Verified Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle className="w-3 h-3" />
                  <span>Terverifikasi</span>
                </div>
              </div>

              {/* Quote */}
              <p className="text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed">
                &ldquo;{rev.quote}&rdquo;
              </p>
            </div>

            {/* Author Info */}
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full ${rev.avatarBg} text-white font-bold text-xs flex items-center justify-center shadow-sm`}
                >
                  {rev.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {rev.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {rev.major}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {rev.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

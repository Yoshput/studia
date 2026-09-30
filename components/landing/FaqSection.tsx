'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: 'Apakah Semestr OS aman digunakan dan gratis?',
    a: 'Ya, Semestr OS 100% aman dan gratis untuk seluruh mahasiswa Telkom University. Data disimpan dengan enkripsi modern dan tidak pernah dibagikan ke pihak ketiga.',
  },
  {
    q: 'Bagaimana cara kerja kamera presensi orientasi normal?',
    a: 'Sistem secara otomatis mengoreksi orientasi cermin pada kanvas kamera peramban, sehingga teks pada pakaian, buku catatan, atau latar belakang tetap terbaca normal.',
  },
  {
    q: 'Bagaimana cara mengatasi jadwal kuliah yang bentrok?',
    a: 'Semestr OS menganalisis setiap irisan waktu SKS Anda. Jika terdeteksi tabrakan waktu, sistem akan langsung memberikan sinyal visual merah dan menyarankan kelas alternatif.',
  },
  {
    q: 'Apakah data akun saya terisolasi dari mahasiswa lain?',
    a: 'Tentu. Setiap akun diverifikasi dengan sesi autentikasi independen pada database cloud. Anda hanya memiliki akses privat ke akun dan jadwal Anda sendiri.',
  },
  {
    q: 'Bagaimana cara memasang aplikasi ini di iPhone atau Android?',
    a: 'Di Safari (iOS), ketuk tombol Bagikan (Share) lalu pilih "Tambahkan ke Layar Utama". Di Chrome (Android), ketuk menu titik tiga lalu pilih "Install Aplikasi". Semestr mendukung penuh PWA offline!',
  },
];

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="text-center max-w-xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-white/5 border border-red-200/60 dark:border-white/10 text-red-700 dark:text-red-300 text-xs font-bold">
          <HelpCircle className="w-3.5 h-3.5 text-red-600" />
          <span>Pusat Informasi</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Pertanyaan Sering Diajukan
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Temukan jawaban seputar fitur, sinkronisasi, dan integrasi kampus.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl bg-white dark:bg-[#0e0c0e] border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-sm transition-all"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-bold text-sm sm:text-base text-slate-900 dark:text-white"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-red-600' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-4 pb-5 sm:px-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-white/5 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

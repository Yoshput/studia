'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Camera,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Clock,
  ArrowRight,
  Shield,
  Bot,
  User,
} from 'lucide-react';
import { MascotIcon } from '@/components/assistant/MascotIcon';

export const InteractiveShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'jadwal' | 'presensi' | 'nilai' | 'aiko'>('jadwal');

  // Jadwal State
  const [hasConflict, setHasConflict] = useState(false);

  // Presensi State
  const [presensiDone, setPresensiDone] = useState(false);
  const [presensiLoading, setPresensiLoading] = useState(false);

  // Nilai Simulator State
  const [nilaiTugas, setNilaiTugas] = useState(90);
  const [nilaiQuiz, setNilaiQuiz] = useState(85);
  const [nilaiUTS, setNilaiUTS] = useState(84);
  const [nilaiUAS, setNilaiUAS] = useState(92);

  // Aiko AI State
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [aiTyping, setAiTyping] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // IPK Real-time calculation
  const ipkResult = useMemo(() => {
    const total = nilaiTugas * 0.2 + nilaiQuiz * 0.15 + nilaiUTS * 0.3 + nilaiUAS * 0.35;
    const rounded = Math.round(total * 10) / 10;
    let index = 'A';
    let gpa = 4.0;
    if (rounded >= 80) {
      index = 'A';
      gpa = 4.0;
    } else if (rounded >= 75) {
      index = 'AB';
      gpa = 3.5;
    } else if (rounded >= 70) {
      index = 'B';
      gpa = 3.0;
    } else if (rounded >= 60) {
      index = 'BC';
      gpa = 2.5;
    } else {
      index = 'C';
      gpa = 2.0;
    }
    return { total: rounded, index, gpa };
  }, [nilaiTugas, nilaiQuiz, nilaiUTS, nilaiUAS]);

  const handleSimulatePresensi = () => {
    setPresensiLoading(true);
    setTimeout(() => {
      setPresensiLoading(false);
      setPresensiDone(true);
    }, 700);
  };

  const handleTriggerAiko = (prompt: string, answer: string) => {
    setActivePrompt(prompt);
    setAiTyping(true);
    setAiResponse(null);
    setTimeout(() => {
      setAiTyping(false);
      setAiResponse(answer);
    }, 550);
  };

  return (
    <div id="pratinjau" className="relative max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* Ambient Crimson Radial Glow Backdrop */}
      <div className="absolute -inset-4 sm:-inset-8 bg-gradient-to-r from-red-500/10 via-rose-500/15 to-red-600/10 rounded-3xl blur-3xl -z-10 pointer-events-none" />

      {/* Safari Window Frame */}
      <div className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-[#0e0c0e]/95 shadow-[0_20px_60px_-15px_rgba(220,38,38,0.12)] overflow-hidden backdrop-blur-2xl">
        {/* Safari Top Window Chrome Bar */}
        <div className="px-4 py-3 bg-slate-100/80 dark:bg-white/5 border-b border-slate-200/80 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
          {/* Traffic light macOS dots */}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-black/10 inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-black/10 inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-black/10 inline-block" />
            <span className="text-[11px] font-mono font-medium text-slate-400 dark:text-slate-500 ml-2 hidden sm:inline">
              Semestr OS Interactive Preview
            </span>
          </div>

          {/* Centered URL Capsule */}
          <div className="hidden md:flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white dark:bg-black/40 border border-slate-200/90 dark:border-white/10 text-slate-600 dark:text-slate-300 text-[11px] font-mono shadow-inner">
            <span className="text-red-500">https://</span>
            <span>semestr.telkomuniversity.ac.id/dashboard</span>
          </div>

          {/* Live Sync Status */}
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>0 Bentrok • Terverifikasi</span>
          </div>
        </div>

        {/* Showcase Tab Navigation Buttons */}
        <div className="p-2 sm:p-3 bg-slate-50 dark:bg-[#121013] border-b border-slate-200/60 dark:border-white/5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'jadwal', label: 'Jadwal & Anti-Bentrok', icon: Calendar },
            { id: 'presensi', label: 'Presensi Kamera Normal', icon: Camera },
            { id: 'nilai', label: 'Kalkulator IPK 4.0', icon: GraduationCap },
            { id: 'aiko', label: 'Aiko AI Copilot', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[12.5px] font-bold whitespace-nowrap transition-all duration-200 ${
                  isCurrent
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-500/25 scale-[1.02]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Display Area */}
        <div className="p-4 sm:p-8 min-h-[380px] flex flex-col justify-center">
          {/* TAB 1: JADWAL & DETEKSI BENTROK */}
          {activeTab === 'jadwal' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/5">
                <div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <span>Deteksi Bentrok Jadwal Real-Time</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 font-bold">
                      Algorithm v2.4
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Coba alihkan tombol simulasi bentrok untuk melihat peringatan cerdas Semestr OS.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setHasConflict(!hasConflict)}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    hasConflict
                      ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-300'
                      : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Simulasi Status: {hasConflict ? 'Bentrok Aktif' : 'Aman (0 Bentrok)'}</span>
                </button>
              </div>

              {hasConflict ? (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-800 dark:text-amber-200">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold">
                      Peringatan: Jadwal Bentrok Terdeteksi pada Hari Rabu!
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Mata kuliah <strong>Pemrograman Web (08:30 - 10:30)</strong> bertabrakan waktu dengan <strong>Kecerdasan Buatan (09:30 - 11:30)</strong>. Semestr merekomendasikan kelas paralel IF-46-08.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-800 dark:text-emerald-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <p className="text-sm font-bold">
                    Jadwal 100% Harmonis! Tidak ada tumpang tindih waktu untuk 22 SKS semester ini.
                  </p>
                </div>
              )}

              {/* Schedule Timeline Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 hover:border-red-300 dark:hover:border-red-500/30 transition-all">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-mono font-bold text-red-600">08:30 - 10:30 WIB</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-white/10 font-medium">3 SKS</span>
                  </div>
                  <h5 className="font-bold text-sm text-slate-900 dark:text-white">Rekayasa Perangkat Lunak</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ruang TULT-0712 • Dosen: Dr. Ir. Hendra S.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 hover:border-red-300 dark:hover:border-red-500/30 transition-all">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-mono font-bold text-red-600">13:30 - 16:30 WIB</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-white/10 font-medium">4 SKS</span>
                  </div>
                  <h5 className="font-bold text-sm text-slate-900 dark:text-white">Basis Data Lanjut</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Lab Komputer Informatika • Dosen: Maya P., M.Kom.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KAMERA PRESENSI ORIENTASI NORMAL */}
          {activeTab === 'presensi' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/5">
                <div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    Kamera Presensi Anti-Cermin (Normal Lens Canvas)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Tulisan di baju dan papan nama tidak akan terbalik saat verifikasi presensi kampus Telkom.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-300 text-xs font-bold border border-red-200/60">
                  Non-Inverted AI Lens
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Viewfinder Mockup */}
                <div className="relative aspect-[4/3] rounded-2xl bg-slate-900 overflow-hidden border-2 border-slate-800 flex items-center justify-center text-white shadow-inner group">
                  <div className="absolute inset-4 border-2 border-dashed border-red-500/40 rounded-xl pointer-events-none" />
                  
                  {presensiDone ? (
                    <div className="text-center space-y-2 p-4 animate-in zoom-in-95 duration-200">
                      <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-400/40 shadow-lg">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <p className="font-bold text-sm text-emerald-300">Wajah & Lokasi Terverifikasi!</p>
                      <p className="text-[11px] text-slate-300">Presensi Berhasil Dicatat: Hadir Tepat Waktu</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-3 p-4">
                      <div className="w-12 h-12 rounded-full bg-red-600/30 text-red-400 mx-auto flex items-center justify-center">
                        <Camera className="w-6 h-6 animate-pulse" />
                      </div>
                      <p className="text-xs text-slate-300 font-medium">
                        Arahkan pandangan ke kamera. Posisi orientasi teks otomatis terkoreksi.
                      </p>
                      <span className="inline-block text-[10px] font-mono bg-black/50 px-2 py-0.5 rounded text-slate-400">
                        LAT: -7.4243 | LNG: 109.2312 (Gedung I Telkom)
                      </span>
                    </div>
                  )}

                  {/* Corner guides */}
                  <div className="absolute top-2 left-2 text-[10px] font-mono text-red-400 font-bold bg-black/60 px-2 py-0.5 rounded">
                    FOV: NORMAL (1.0x)
                  </div>
                </div>

                {/* Controls & Explanation */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                      Fitur Unggulan Presensi Mahasiswa:
                    </h5>
                    <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <span>Koreksi otomatis sumbu horizontal (Canvas un-mirror).</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <span>Pemeriksaan geolokasi radius presensi Telkom University.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <span>Dapat diunduh langsung untuk arsip komplain jika terjadi galat sistem.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={presensiLoading}
                      onClick={handleSimulatePresensi}
                      className="w-full py-3 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-md shadow-red-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    >
                      {presensiLoading ? (
                        <span>Memindai Wajah & Geotag...</span>
                      ) : presensiDone ? (
                        <>
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Simulasi Ulang Presensi</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-3.5 h-3.5" />
                          <span>Uji Presensi Normal Sekarang</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KALKULATOR IPK REAL-TIME */}
          {activeTab === 'nilai' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/5">
                <div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    Simulasi Indeks Prestasi & Prediksi IPK 4.0
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Geser nilai tugas, quiz, UTS, dan UAS untuk melihat konversi indeks instan.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-red-600 dark:text-red-400">
                    {ipkResult.total}
                  </span>
                  <span className="text-xs font-bold text-slate-400 ml-1">/ 100</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Sliders Area */}
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Tugas & Asistensi (20%)</span>
                      <span className="font-mono text-red-600 font-bold">{nilaiTugas}</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="100"
                      value={nilaiTugas}
                      onChange={(e) => setNilaiTugas(Number(e.target.value))}
                      className="w-full accent-red-600 h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Kuis & Studi Kasus (15%)</span>
                      <span className="font-mono text-red-600 font-bold">{nilaiQuiz}</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="100"
                      value={nilaiQuiz}
                      onChange={(e) => setNilaiQuiz(Number(e.target.value))}
                      className="w-full accent-red-600 h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Ujian Tengah Semester - UTS (30%)</span>
                      <span className="font-mono text-red-600 font-bold">{nilaiUTS}</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="100"
                      value={nilaiUTS}
                      onChange={(e) => setNilaiUTS(Number(e.target.value))}
                      className="w-full accent-red-600 h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Ujian Akhir Semester - UAS (35%)</span>
                      <span className="font-mono text-red-600 font-bold">{nilaiUAS}</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="100"
                      value={nilaiUAS}
                      onChange={(e) => setNilaiUAS(Number(e.target.value))}
                      className="w-full accent-red-600 h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Score Circular Result Card */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-red-50 to-rose-50/50 dark:from-red-950/40 dark:to-transparent border border-red-200/80 dark:border-red-900/40 text-center space-y-2">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-red-500/30">
                    <span className="text-3xl font-black">{ipkResult.index}</span>
                  </div>
                  <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                    Bobot Indeks: {ipkResult.gpa.toFixed(1)} / 4.0
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Prediksi Sempurna untuk Target Cumlaude Semester Ini!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AIKO AI COPILOT */}
          {activeTab === 'aiko' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/5">
                <div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <span>Aiko AI Contextual Academic Copilot</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 font-bold">
                      GPT-4o Academic
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Asisten pribadi mahasiswa yang paham jadwal, kurikulum Telkom, dan deadline tugas Anda.
                  </p>
                </div>
              </div>

              {/* Sample Prompt Chips */}
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    q: 'Jadwal kuliah besok jam berapa?',
                    a: 'Besok Kamis Anda punya 2 mata kuliah: Basis Data Lanjut (08:30 - Lab TI) dan Sistem Operasi (13:30 - TULT 0712). Presensi dibuka 15 menit sebelum kelas!',
                  },
                  {
                    q: 'Berapa nilai UAS minimal biar dapet A?',
                    a: 'Dengan nilai tugas saat ini 90 dan UTS 84, Anda hanya butuh minimal 82 di UAS untuk mengamankan Indeks A (bobot 4.0)!',
                  },
                  {
                    q: 'Bagaimana prosedur komplain presensi?',
                    a: 'Buka menu Presensi di Semestr OS, unduh bukti foto scan bergeotag Anda, lalu teruskan ke BAA atau dosen pengampu via WhatsApp!',
                  },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleTriggerAiko(item.q, item.a)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-300 border border-slate-200/80 dark:border-white/10 transition-all text-slate-700 dark:text-slate-300 text-left"
                  >
                    💬 {item.q}
                  </button>
                ))}
              </div>

              {/* Chat Simulation Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 space-y-4">
                {activePrompt && (
                  <div className="flex items-start gap-2.5 justify-end">
                    <div className="p-3 rounded-2xl rounded-tr-sm bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-medium max-w-md shadow-sm">
                      {activePrompt}
                    </div>
                    <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-700 to-rose-600 flex items-center justify-center text-white flex-shrink-0 shadow-md">
                    <MascotIcon size={16} />
                  </div>
                  <div className="p-3.5 rounded-2xl rounded-tl-sm bg-white dark:bg-[#1a1719] border border-slate-200/80 dark:border-white/10 text-xs text-slate-700 dark:text-slate-200 leading-relaxed max-w-lg shadow-sm">
                    {aiTyping ? (
                      <div className="flex items-center gap-1.5 py-1">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        <span className="text-slate-400 font-mono text-[11px]">Aiko sedang menganalisis data akademik...</span>
                      </div>
                    ) : aiResponse ? (
                      aiResponse
                    ) : (
                      'Halo! Saya Aiko, asisten cerdas Semestr OS Anda. Klik salah satu pertanyaan di atas untuk melihat bagaimana saya membantu perkuliahan Anda setiap hari!'
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

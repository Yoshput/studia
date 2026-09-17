'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { MascotIcon } from '@/components/assistant/MascotIcon';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Camera,
  Calendar,
  Clock,
  Check,
  ChevronDown,
  ArrowRight,
  Menu,
  X,
  ExternalLink,
  Shield,
  Smartphone,
  Sliders,
  Sparkles,
  Award,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import gsap from 'gsap';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Active Simulator Tab
  const [activeTab, setActiveTab] = useState<'presensi' | 'jadwal' | 'nilai' | 'asisten'>('presensi');

  // Presensi State
  const [presensiMode, setPresensiMode] = useState<'online' | 'offline'>('online');
  const [presensiHadir, setPresensiHadir] = useState(false);
  const [presensiLoading, setPresensiLoading] = useState(false);

  // Jadwal Conflict State
  const [jadwalBentrok, setJadwalBentrok] = useState(true);

  // Nilai Simulator State (Apple Health-style slider)
  const [nilaiTugas, setNilaiTugas] = useState(90);
  const [nilaiQuiz, setNilaiQuiz] = useState(85);
  const [nilaiUTS, setNilaiUTS] = useState(82);
  const [nilaiUAS, setNilaiUAS] = useState(88);

  // Asisten Siri/Intelligence State
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [aiTyping, setAiTyping] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Refs for GSAP
  const heroRef = useRef<HTMLDivElement>(null);
  const simulatorCardRef = useRef<HTMLDivElement>(null);
  const tabContentRef = useRef<HTMLDivElement>(null);

  // Time ticker
  const [currentTime, setCurrentTime] = useState('08:30:12');
  useEffect(() => {
    const interval = setInterval(() => {
      const d = new Date();
      setCurrentTime(d.toTimeString().split(' ')[0]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sticky navbar listener
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // GSAP Initial Reveal
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.gsap-hero-item',
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.07, ease: 'power3.out' }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  // GSAP Tab Change Animation
  useEffect(() => {
    if (tabContentRef.current) {
      gsap.fromTo(
        tabContentRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
      );
    }
  }, [activeTab]);

  // IPS Real-time calculation
  const ipkCalc = useMemo(() => {
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

  // Presensi trigger
  const handleCapturePresensi = () => {
    setPresensiLoading(true);
    setTimeout(() => {
      setPresensiLoading(false);
      setPresensiHadir(true);
    }, 900);
  };

  // Asisten trigger
  const handleSelectPrompt = (prompt: string, answer: string) => {
    setSelectedPrompt(prompt);
    setAiTyping(true);
    setAiAnswer(null);

    setTimeout(() => {
      setAiTyping(false);
      setAiAnswer(answer);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#000000] text-[#1D1D1F] dark:text-[#F5F5F7] selection:bg-emerald-500/20 selection:text-emerald-600 transition-colors duration-300 font-sans antialiased">
      {/* 1. APPLE-STYLE MINIMALIST BLUR NAVBAR */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 dark:bg-[#161618]/80 backdrop-blur-xl border-b border-black/[0.06] dark:border-white/[0.08] shadow-[0_1px_3px_rgba(0,0,0,0.02)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-sm">
              <MascotIcon size={20} />
            </div>
            <span className="font-semibold text-[17px] tracking-tight text-[#1D1D1F] dark:text-white">
              Semestr
            </span>
          </Link>

          {/* Center Navigation */}
          <nav className="hidden md:flex items-center gap-7 text-[13px] font-medium text-[#6E6E73] dark:text-[#86868B]">
            <a href="#simulator" className="hover:text-black dark:hover:text-white transition-colors">
              Pratinjau
            </a>
            <a href="#fitur" className="hover:text-black dark:hover:text-white transition-colors">
              Fitur
            </a>
            <a href="#perbandingan" className="hover:text-black dark:hover:text-white transition-colors">
              Perbandingan
            </a>
            <a href="#faq" className="hover:text-black dark:hover:text-white transition-colors">
              Bantuan
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            <Link href="/login">
              <span className="text-[13px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7] hover:text-emerald-600 px-3 py-1.5 rounded-lg transition-colors">
                Masuk
              </span>
            </Link>

            <Link href="/signup">
              <Button
                variant="primary"
                size="sm"
                className="bg-[#0071E3] hover:bg-[#0077ED] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-medium text-[13px] px-3.5 h-8 rounded-full shadow-none"
              >
                Mulai
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-[#6E6E73]"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden px-5 py-4 bg-white dark:bg-[#161618] border-b border-black/[0.06] dark:border-white/[0.08] space-y-3">
            <nav className="flex flex-col space-y-2 text-[14px] font-medium text-[#6E6E73] dark:text-[#86868B]">
              <a href="#simulator" onClick={() => setMobileMenuOpen(false)} className="py-1">
                Pratinjau Interaktif
              </a>
              <a href="#fitur" onClick={() => setMobileMenuOpen(false)} className="py-1">
                Fitur Utama
              </a>
              <a href="#perbandingan" onClick={() => setMobileMenuOpen(false)} className="py-1">
                Perbandingan
              </a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="py-1">
                Pertanyaan Umum
              </a>
            </nav>
            <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.08] flex gap-2">
              <Link href="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="secondary" className="w-full text-[13px] h-9 rounded-full">
                  Masuk
                </Button>
              </Link>
              <Link href="/signup" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full text-[13px] h-9 rounded-full bg-[#0071E3] dark:bg-emerald-600 text-white">
                  Daftar
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION — CLEAN CUPERTINO TYPOGRAPHY */}
      <section ref={heroRef} className="pt-28 pb-16 sm:pt-36 sm:pb-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          {/* Subtle Dynamic Island Pill */}
          <div className="gsap-hero-item inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-[12px] font-medium text-[#6E6E73] dark:text-[#86868B]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Sistem Operasi Akademik Mahasiswa</span>
          </div>

          {/* Main Headline */}
          <h1 className="gsap-hero-item text-[38px] sm:text-[58px] lg:text-[66px] font-semibold tracking-[-0.03em] leading-[1.08] text-[#1D1D1F] dark:text-white">
            Seluruh perkuliahan. <br className="hidden sm:inline" />
            <span className="text-[#6E6E73] dark:text-[#86868B]">Dalam satu kendali tenang.</span>
          </h1>

          {/* Subtext */}
          <p className="gsap-hero-item text-[17px] sm:text-[20px] text-[#6E6E73] dark:text-[#86868B] max-w-2xl mx-auto font-normal leading-relaxed">
            Presensi tanpa foto terbalik, jadwal bebas bentrok, kalkulator indeks prestasi semester, dan pengingat resmi perangkat.
          </p>

          {/* CTA Buttons */}
          <div className="gsap-hero-item pt-2 flex items-center justify-center gap-3">
            <Link href="/signup">
              <Button
                variant="primary"
                size="lg"
                className="bg-[#0071E3] hover:bg-[#0077ED] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-medium text-[15px] px-6 h-11 rounded-full gap-1.5 transition-transform active:scale-[0.98]"
              >
                <span>Coba Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <a href="#simulator">
              <Button
                variant="secondary"
                size="lg"
                className="bg-black/[0.04] hover:bg-black/[0.07] dark:bg-white/[0.08] dark:hover:bg-white/[0.12] border-0 text-[#1D1D1F] dark:text-[#F5F5F7] font-medium text-[15px] px-5 h-11 rounded-full transition-transform active:scale-[0.98]"
              >
                Lihat Pratinjau
              </Button>
            </a>
          </div>

          <div className="gsap-hero-item pt-1 flex items-center justify-center gap-6 text-[12px] text-[#86868B]">
            <span>Gratis selamanya</span>
            <span>•</span>
            <span>Multi-akun privat</span>
            <span>•</span>
            <span>PWA mandiri</span>
          </div>
        </div>

        {/* 3. INTERACTIVE SIMULATOR (AUTHENTIC APPLE WIDGET FRAME) */}
        <div
          id="simulator"
          ref={simulatorCardRef}
          className="mt-14 max-w-3xl mx-auto rounded-3xl bg-white dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.1] shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)] overflow-hidden"
        >
          {/* iOS Segmented Control Header */}
          <div className="p-3 border-b border-black/[0.06] dark:border-white/[0.08] bg-[#F5F5F7]/70 dark:bg-[#2C2C2E]/60 flex items-center justify-center">
            <div className="inline-flex p-1 rounded-full bg-black/[0.06] dark:bg-black/40 text-[12.5px] font-medium text-[#6E6E73] dark:text-[#86868B] max-w-full overflow-x-auto">
              {[
                { id: 'presensi', label: 'Presensi Wajah' },
                { id: 'jadwal', label: 'Radar Jadwal' },
                { id: 'nilai', label: 'Simulasi IPS' },
                { id: 'asisten', label: 'Asisten Aiko' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-1 rounded-full transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-[#3A3A3C] text-[#1D1D1F] dark:text-white font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                      : 'hover:text-[#1D1D1F] dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content Container */}
          <div ref={tabContentRef} className="p-5 sm:p-7 min-h-[310px]">
            {/* TAB 1: PRESENSI */}
            {activeTab === 'presensi' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[16px] font-semibold text-[#1D1D1F] dark:text-white">
                      Presensi Orientasi Normal
                    </h3>
                    <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B]">
                      Kamera tidak terbalik. Huruf pada pakaian dan latar tetap terbaca benar.
                    </p>
                  </div>

                  {/* Mode Picker */}
                  <div className="inline-flex p-0.5 rounded-lg bg-black/[0.05] dark:bg-white/[0.08] text-[12px] font-medium">
                    <button
                      type="button"
                      onClick={() => {
                        setPresensiMode('online');
                        setPresensiHadir(false);
                      }}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        presensiMode === 'online'
                          ? 'bg-white dark:bg-[#2C2C2E] text-black dark:text-white shadow-sm'
                          : 'text-[#6E6E73]'
                      }`}
                    >
                      Daring
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPresensiMode('offline');
                        setPresensiHadir(false);
                      }}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        presensiMode === 'offline'
                          ? 'bg-white dark:bg-[#2C2C2E] text-black dark:text-white shadow-sm'
                          : 'text-[#6E6E73]'
                      }`}
                    >
                      Tatap Muka
                    </button>
                  </div>
                </div>

                {/* Camera Viewfinder */}
                <div className="relative w-full h-[180px] rounded-2xl bg-[#1D1D1F] overflow-hidden flex flex-col items-center justify-center text-white">
                  {/* Viewfinder Target Frame */}
                  <div className="relative w-32 h-32 rounded-xl border border-white/30 flex items-center justify-center">
                    <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-white" />
                    <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-white" />
                    <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-white" />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-white" />

                    {presensiLoading ? (
                      <span className="text-[11px] text-white/80 font-mono animate-pulse">
                        Verifikasi...
                      </span>
                    ) : presensiHadir ? (
                      <div className="text-center space-y-1">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
                          <Check className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <span className="text-[11px] font-medium text-emerald-400 block">
                          Tepat Waktu
                        </span>
                      </div>
                    ) : (
                      <Camera className="w-6 h-6 text-white/50" />
                    )}
                  </div>

                  {/* Clean Watermark */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-white/70">
                    <span>{presensiMode === 'online' ? 'KULIAH DARING' : 'LABORATORIUM 2'}</span>
                    <span>{currentTime}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[12px] text-[#86868B]">
                    {presensiHadir ? 'Foto kehadiran tersimpan di riwayat.' : 'Uji respons tombol snapshot.'}
                  </span>

                  <div className="flex gap-2">
                    {presensiHadir && (
                      <button
                        type="button"
                        onClick={() => setPresensiHadir(false)}
                        className="text-[12px] font-medium text-[#6E6E73] hover:text-black dark:hover:text-white px-2 py-1"
                      >
                        Reset
                      </button>
                    )}
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={presensiLoading || presensiHadir}
                      onClick={handleCapturePresensi}
                      className="bg-[#0071E3] hover:bg-[#0077ED] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-medium text-[12.5px] px-4 rounded-full h-8"
                    >
                      {presensiLoading ? 'Memproses...' : 'Ambil Foto'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: JADWAL BENTROK */}
            {activeTab === 'jadwal' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-[16px] font-semibold text-[#1D1D1F] dark:text-white">
                    Pendeteksi Tabrakan Jam
                  </h3>
                  <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B]">
                    Mencegah pemilihan dua mata kuliah yang bertabrakan pada hari dan jam yang sama.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Slot 1 */}
                  <div className="p-3.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.05] dark:border-white/[0.08] space-y-1">
                    <div className="flex justify-between items-center text-[11px] text-[#86868B]">
                      <span>Senin • 3 SKS</span>
                      <span className="font-mono">08:30 - 11:30</span>
                    </div>
                    <h4 className="font-semibold text-[14px]">Jaringan Komputer</h4>
                    <p className="text-[12px] text-[#6E6E73] dark:text-[#86868B]">Lab Komputer 2</p>
                  </div>

                  {/* Slot 2 (Conflict or Resolved) */}
                  <div
                    className={`p-3.5 rounded-xl border transition-all space-y-1 ${
                      jadwalBentrok
                        ? 'bg-rose-500/[0.08] border-rose-500/30'
                        : 'bg-emerald-500/[0.08] border-emerald-500/30'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[11px]">
                      <span className={jadwalBentrok ? 'text-rose-600 font-medium' : 'text-emerald-600 font-medium'}>
                        {jadwalBentrok ? 'Bertabrakan' : 'Slot Terbuka'}
                      </span>
                      <span className="font-mono text-[11px] text-[#86868B]">
                        {jadwalBentrok ? '09:00 - 12:00' : '13:30 - 16:30'}
                      </span>
                    </div>
                    <h4 className="font-semibold text-[14px]">Algoritma & Struktur Data</h4>
                    <p className="text-[12px] text-[#6E6E73] dark:text-[#86868B]">
                      {jadwalBentrok ? 'Lab Komputer 2 (Bentrok)' : 'Ruang R204 (Tersedia)'}
                    </p>
                  </div>
                </div>

                {/* Resolution Banner */}
                <div className="p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] flex items-center justify-between gap-3 text-[12.5px]">
                  <div className="flex items-center gap-2">
                    {jadwalBentrok ? (
                      <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    ) : (
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    )}
                    <span className="text-[#6E6E73] dark:text-[#86868B]">
                      {jadwalBentrok ? 'Dua kelas menempati slot waktu yang sama.' : 'Semua mata kuliah tersusun rapi tanpa bentrok.'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setJadwalBentrok(!jadwalBentrok)}
                    className="text-[12px] font-semibold text-[#0071E3] dark:text-emerald-400 hover:underline whitespace-nowrap"
                  >
                    {jadwalBentrok ? 'Pindahkan ke 13:30' : 'Ulangi Bentrok'}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: SIMULASI IPS */}
            {activeTab === 'nilai' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-[16px] font-semibold text-[#1D1D1F] dark:text-white">
                    Simulasi Indeks Prestasi
                  </h3>
                  <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B]">
                    Geser nilai untuk memprediksi indeks akhir berdasarkan bobot dosen.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  <div className="sm:col-span-2 space-y-3 bg-black/[0.02] dark:bg-white/[0.04] p-3.5 rounded-2xl">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[12px] text-[#6E6E73] dark:text-[#86868B]">
                        <span>Tugas (20%)</span>
                        <span className="font-mono font-medium text-black dark:text-white">{nilaiTugas}</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={nilaiTugas}
                        onChange={(e) => setNilaiTugas(Number(e.target.value))}
                        className="w-full h-1.5 bg-black/10 dark:bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#0071E3] dark:accent-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[12px] text-[#6E6E73] dark:text-[#86868B]">
                        <span>UTS (30%)</span>
                        <span className="font-mono font-medium text-black dark:text-white">{nilaiUTS}</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={nilaiUTS}
                        onChange={(e) => setNilaiUTS(Number(e.target.value))}
                        className="w-full h-1.5 bg-black/10 dark:bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#0071E3] dark:accent-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[12px] text-[#6E6E73] dark:text-[#86868B]">
                        <span>UAS (35%)</span>
                        <span className="font-mono font-medium text-black dark:text-white">{nilaiUAS}</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={nilaiUAS}
                        onChange={(e) => setNilaiUAS(Number(e.target.value))}
                        className="w-full h-1.5 bg-black/10 dark:bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#0071E3] dark:accent-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Clean Indicator */}
                  <div className="text-center p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] space-y-1">
                    <span className="text-[11px] text-[#86868B] uppercase tracking-wider block">Prediksi Nilai</span>
                    <span className="text-[36px] font-semibold text-[#1D1D1F] dark:text-white leading-none block">
                      {ipkCalc.index}
                    </span>
                    <span className="text-[12px] text-[#6E6E73] dark:text-[#86868B] font-mono block">
                      Skor {ipkCalc.total} • Bobot {ipkCalc.gpa.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: ASISTEN AIKO */}
            {activeTab === 'asisten' && (
              <div className="space-y-3.5">
                <div>
                  <h3 className="text-[16px] font-semibold text-[#1D1D1F] dark:text-white">
                    Tanya Aiko
                  </h3>
                  <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B]">
                    Asisten yang memahami nama mahasiswa, mata kuliah, dan tenggat waktu tugas.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] space-y-2.5 min-h-[120px]">
                  <div className="text-[13px] text-[#1D1D1F] dark:text-white leading-relaxed">
                    <span className="font-medium text-[#0071E3] dark:text-emerald-400 mr-1.5">Aiko:</span>
                    {aiTyping ? (
                      <span className="text-[#86868B] animate-pulse">Meninjau jadwal perkuliahan...</span>
                    ) : aiAnswer ? (
                      aiAnswer
                    ) : (
                      'Halo! Ada pertanyaan seputar jadwal kuliah atau tugas minggu ini?'
                    )}
                  </div>
                </div>

                {/* Prompts */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    {
                      q: 'Kapan deadline tugas terdekat?',
                      a: 'Tugas Jaringan Komputer bab Subnetting dikumpulkan besok pukul 23:59 WIB.',
                    },
                    {
                      q: 'Ada kuliah apa hari ini?',
                      a: 'Hari ini ada Jaringan Komputer (08:30 di Lab 2) dan Pemrograman Web (13:30 Daring).',
                    },
                    {
                      q: 'Target UAS untuk nilai A?',
                      a: 'Minimal skor 82 pada ujian akhir untuk mempertahankan predikat A.',
                    },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPrompt(p.q, p.a)}
                      className="px-3 py-1.5 rounded-full bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-[12px] font-medium text-[#6E6E73] dark:text-[#86868B] transition-colors"
                    >
                      {p.q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. ESSENTIAL CAPABILITIES — CLEAN APPLE CARDS (ANTI-SLOP) */}
      <section id="fitur" className="py-20 px-4 sm:px-6 max-w-5xl mx-auto border-t border-black/[0.06] dark:border-white/[0.08]">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-[28px] sm:text-[36px] font-semibold tracking-tight text-[#1D1D1F] dark:text-white">
            Dirancang untuk rutinitas nyata.
          </h2>
          <p className="text-[15px] text-[#6E6E73] dark:text-[#86868B]">
            Setiap fitur hadir untuk menyelesaikan masalah sehari-hari mahasiswa, tanpa hiasan berlebih.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] space-y-2">
            <Camera className="w-5 h-5 text-[#0071E3] dark:text-emerald-400" />
            <h3 className="font-semibold text-[17px]">Presensi Orientasi Normal</h3>
            <p className="text-[13.5px] text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
              Foto bukti kehadiran tidak terbalik. Watermark mencatat tanggal, jam detik, dan mode daring atau luring secara otomatis.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] space-y-2">
            <Calendar className="w-5 h-5 text-[#0071E3] dark:text-emerald-400" />
            <h3 className="font-semibold text-[17px]">Penyusun Jadwal Cerdas</h3>
            <p className="text-[13.5px] text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
              Validasi bentrok mencegah kesalahan ambil kelas. Pantau sisa waktu menuju kelas berikutnya dari beranda.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] space-y-2">
            <Award className="w-5 h-5 text-[#0071E3] dark:text-emerald-400" />
            <h3 className="font-semibold text-[17px]">Kalkulator Indeks Prestasi</h3>
            <p className="text-[13.5px] text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
              Hitung bobot komponen evaluasi dosen secara akurat. Simulasikan skor yang dibutuhkan sebelum ujian berlangsung.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] space-y-2">
            <Sparkles className="w-5 h-5 text-[#0071E3] dark:text-emerald-400" />
            <h3 className="font-semibold text-[17px]">Asisten Suara & Teks</h3>
            <p className="text-[13.5px] text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
              Didukung Web Speech API untuk membacakan sapaan dan tanggapan asisten langsung di perangkat Anda.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] space-y-2">
            <Smartphone className="w-5 h-5 text-[#0071E3] dark:text-emerald-400" />
            <h3 className="font-semibold text-[17px]">Notifikasi Web Push OS</h3>
            <p className="text-[13.5px] text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
              Pengingat resmi sistem operasi muncul 15 menit sebelum kuliah dan H-1 tenggat waktu tugas tanpa membuka peramban.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] space-y-2">
            <Shield className="w-5 h-5 text-[#0071E3] dark:text-emerald-400" />
            <h3 className="font-semibold text-[17px]">Isolasi Akun Privat</h3>
            <p className="text-[13.5px] text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
              Autentikasi sesi terenkripsi dengan penyimpanan cloud serverless. Data akademik tidak pernah tercampur antar pengguna.
            </p>
          </div>
        </div>
      </section>

      {/* 5. COMPARISON SECTION */}
      <section id="perbandingan" className="py-20 px-4 sm:px-6 max-w-4xl mx-auto border-t border-black/[0.06] dark:border-white/[0.08]">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-[28px] sm:text-[34px] font-semibold tracking-tight text-[#1D1D1F] dark:text-white">
            Perbandingan dengan metode umum.
          </h2>
        </div>

        <div className="rounded-3xl bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] overflow-hidden">
          <table className="w-full text-left text-[13.5px]">
            <thead>
              <tr className="border-b border-black/[0.06] dark:border-white/[0.08] text-[#86868B]">
                <th className="py-3.5 px-5 font-medium">Kemampuan</th>
                <th className="py-3.5 px-5 font-semibold text-[#0071E3] dark:text-emerald-400">Semestr</th>
                <th className="py-3.5 px-5 font-normal text-[#86868B]">Catatan Biasa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.05]">
              <tr>
                <td className="py-3 px-5 font-medium">Kamera Presensi Anti-Mirror</td>
                <td className="py-3 px-5 text-emerald-600 dark:text-emerald-400 font-medium">Otomatis</td>
                <td className="py-3 px-5 text-[#86868B]">Tidak Ada</td>
              </tr>
              <tr>
                <td className="py-3 px-5 font-medium">Pencegahan Bentrok Jam</td>
                <td className="py-3 px-5 text-emerald-600 dark:text-emerald-400 font-medium">Validasi Sistem</td>
                <td className="py-3 px-5 text-[#86868B]">Manual</td>
              </tr>
              <tr>
                <td className="py-3 px-5 font-medium">Kalkulasi Bobot Nilai & IPS</td>
                <td className="py-3 px-5 text-emerald-600 dark:text-emerald-400 font-medium">Seketika</td>
                <td className="py-3 px-5 text-[#86868B]">Rumus Manual</td>
              </tr>
              <tr>
                <td className="py-3 px-5 font-medium">Notifikasi Sistem Operasi</td>
                <td className="py-3 px-5 text-emerald-600 dark:text-emerald-400 font-medium">Web Push API</td>
                <td className="py-3 px-5 text-[#86868B]">Email / Kalender</td>
              </tr>
              <tr>
                <td className="py-3 px-5 font-medium">Instalasi PWA Standalone</td>
                <td className="py-3 px-5 text-emerald-600 dark:text-emerald-400 font-medium">iOS & Android</td>
                <td className="py-3 px-5 text-[#86868B]">Tab Browser</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. FAQ ACCORDION */}
      <section id="faq" className="py-20 px-4 sm:px-6 max-w-3xl mx-auto border-t border-black/[0.06] dark:border-white/[0.08]">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-[28px] sm:text-[34px] font-semibold tracking-tight text-[#1D1D1F] dark:text-white">
            Pertanyaan yang sering diajukan.
          </h2>
        </div>

        <div className="space-y-2">
          {[
            {
              q: 'Apakah Semestr gratis untuk seluruh mahasiswa?',
              a: 'Ya, Semestr dapat digunakan sepenuhnya secara gratis tanpa biaya langganan, masa percobaan, atau iklan.',
            },
            {
              q: 'Bagaimana foto presensi tidak terbalik?',
              a: 'Sistem memproses kanvas foto agar menghasilkan orientasi normal lurus, sehingga teks pada pakaian atau papan tulis terbaca alami.',
            },
            {
              q: 'Apakah data akun saya terisolasi dari mahasiswa lain?',
              a: 'Setiap akun diverifikasi dengan sesi autentikasi independen pada database cloud. Mahasiswa lain yang mendaftar hanya memiliki akses ke akun mereka sendiri.',
            },
            {
              q: 'Bagaimana cara memasang aplikasi ini di iPhone?',
              a: 'Buka tautan web di Safari, ketuk tombol Bagikan (Share), lalu pilih Tambahkan ke Layar Utama.',
            },
          ].map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-medium text-[15px] text-[#1D1D1F] dark:text-white"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#86868B] transition-transform duration-200 ${
                    openFaq === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-5 sm:px-5 text-[13.5px] text-[#6E6E73] dark:text-[#86868B] leading-relaxed border-t border-black/[0.04] dark:border-white/[0.05] pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 7. MINIMALIST CLOSING CTA */}
      <section className="py-20 px-4 sm:px-6 text-center">
        <div className="max-w-xl mx-auto space-y-4">
          <h2 className="text-[30px] sm:text-[40px] font-semibold tracking-tight text-[#1D1D1F] dark:text-white leading-tight">
            Mulai kelola perkuliahan Anda dengan tenang.
          </h2>
          <p className="text-[15px] text-[#6E6E73] dark:text-[#86868B]">
            Pendaftaran selesai dalam kurang dari satu menit.
          </p>
          <div className="pt-2">
            <Link href="/signup">
              <Button
                variant="primary"
                size="lg"
                className="bg-[#0071E3] hover:bg-[#0077ED] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-medium text-[15px] px-7 h-11 rounded-full"
              >
                Daftar Akun Gratis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. FOOTER — SUBTLE APPLE ATTRIBUTION */}
      <footer className="py-10 px-4 border-t border-black/[0.06] dark:border-white/[0.08] text-[12px] text-[#86868B]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <MascotIcon size={18} />
            <span>Semestr • Sistem Operasi Akademik Mahasiswa</span>
          </div>

          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-black dark:hover:text-white transition-colors">
              Privasi
            </Link>
            <Link href="/terms" className="hover:text-black dark:hover:text-white transition-colors">
              Ketentuan
            </Link>
            <a
              href="https://yossikaputra.my.id"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black dark:hover:text-white transition-colors flex items-center gap-1"
            >
              <span>Pengembang</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

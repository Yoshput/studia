'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { MascotIcon } from '@/components/assistant/MascotIcon';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ThemePicker } from '@/components/ThemePicker';
import { ThreeTitaniumOrb } from '@/components/landing/ThreeTitaniumOrb';
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
  CheckCircle2,
  Code2,
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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] selection:bg-pink-500/20 selection:text-pink-700 transition-colors duration-300 font-sans antialiased">
      {/* 1. APPLE-STYLE MINIMALIST BLUR NAVBAR */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/85 dark:bg-[#111726]/85 backdrop-blur-2xl border-b border-pink-500/10 dark:border-pink-500/20 shadow-[0_4px_20px_rgba(249,115,22,0.04)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-400 to-fuchsia-400 flex items-center justify-center text-white shadow-md shadow-pink-500/25 transition-transform group-hover:scale-105">
              <MascotIcon size={20} />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-[17px] tracking-tight text-[#1A0A12] dark:text-white leading-none">
                Semestr
              </span>
              <span className="text-[9.5px] font-mono tracking-widest text-pink-600 dark:text-pink-400 uppercase font-semibold">
                Academic OS
              </span>
            </div>
          </Link>

          {/* Center Navigation */}
          <nav className="hidden md:flex items-center gap-7 text-[13px] font-medium text-stone-600 dark:text-stone-300">
            <a href="#simulator" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
              Pratinjau
            </a>
            <a href="#fitur" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
              Fitur
            </a>
            <a href="#cara-kerja" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
              Cara Kerja
            </a>
            <a href="#harga" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
              Paket
            </a>
            <a href="#testimoni" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
              Mahasiswa
            </a>
            <a href="#faq" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
              Bantuan
            </a>
          </nav>

          {/* Right Action Buttons & Creator Attribution */}
          <div className="hidden md:flex items-center gap-3">
            {/* Direct Creator Badge */}
            <a
              href="https://yossikaputra.my.id"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/[0.08] hover:bg-pink-500/[0.14] dark:bg-pink-500/[0.15] dark:hover:bg-pink-500/[0.22] border border-pink-500/20 text-[11.5px] font-medium text-pink-800 dark:text-pink-200 transition-all"
              title="Portofolio Pengembang Resmi"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
              <span>Yossika Putra</span>
              <ExternalLink className="w-3 h-3 text-pink-500" />
            </a>

            <ThemePicker />

            <Link href="/login">
              <span className="text-[13px] font-semibold text-[#1A0A12] dark:text-[#FDF0F7] hover:text-pink-600 dark:hover:text-pink-400 px-3 py-1.5 rounded-lg transition-colors">
                Masuk
              </span>
            </Link>

            <Link href="/signup">
              <Button
                variant="primary"
                size="sm"
                className="bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white font-semibold text-[13px] px-4 h-8 rounded-full shadow-md shadow-pink-500/20"
              >
                Mulai
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemePicker />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden px-5 py-4 bg-white/95 dark:bg-[#111726]/95 backdrop-blur-2xl border-b border-pink-500/10 dark:border-pink-500/20 space-y-3">
            {/* Mobile Creator Badge */}
            <a
              href="https://yossikaputra.my.id"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-pink-500/[0.08] text-[12px] font-medium text-pink-800 dark:text-pink-200"
            >
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-pink-500" />
                <span>Dibuat oleh Yossika Putra Erlangga</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <nav className="flex flex-col space-y-2 text-[14px] font-medium text-stone-600 dark:text-stone-300">
              <a href="#simulator" onClick={() => setMobileMenuOpen(false)} className="py-1">
                Pratinjau Interaktif
              </a>
              <a href="#fitur" onClick={() => setMobileMenuOpen(false)} className="py-1">
                Fitur Utama
              </a>
              <a href="#cara-kerja" onClick={() => setMobileMenuOpen(false)} className="py-1">
                Cara Kerja
              </a>
              <a href="#harga" onClick={() => setMobileMenuOpen(false)} className="py-1">
                Paket Mahasiswa
              </a>
              <a href="#testimoni" onClick={() => setMobileMenuOpen(false)} className="py-1">
                Testimoni
              </a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="py-1">
                Pertanyaan Umum
              </a>
            </nav>

            <div className="pt-2 border-t border-pink-500/10 dark:border-pink-500/20 flex gap-2">
              <Link href="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="secondary" className="w-full text-[13px] h-9 rounded-full">
                  Masuk
                </Button>
              </Link>
              <Link href="/signup" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full text-[13px] h-9 rounded-full bg-gradient-to-r from-pink-600 to-rose-500 text-white">
                  Daftar Gratis
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION — ELECTRIC SUNRISE WITH 3D SPATIAL CORE */}
      <section ref={heroRef} className="pt-28 pb-14 sm:pt-36 sm:pb-20 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          {/* Floating Sunrise Creator Pill */}
          <div className="gsap-hero-item inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/[0.08] dark:bg-pink-500/[0.15] border border-pink-500/20 text-[12px] font-medium text-pink-800 dark:text-pink-200 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
            <span>Karya Orisinil Mahasiswa Telkom University</span>
            <span className="text-pink-300 dark:text-pink-600">•</span>
            <a
              href="https://yossikaputra.my.id"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:underline flex items-center gap-1 text-pink-950 dark:text-white"
            >
              <span>Yossika Putra Erlangga (103112430026)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Main Headline */}
          <h1 className="gsap-hero-item text-[40px] sm:text-[62px] lg:text-[72px] font-bold tracking-[-0.035em] leading-[1.05] text-[#1A0A12] dark:text-white">
            Seluruh perkuliahan. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-pink-600 via-rose-500 to-fuchsia-500 dark:from-pink-400 dark:via-rose-300 dark:to-fuchsia-400 bg-clip-text text-transparent">
              Dalam satu kendali ceria & tenang.
            </span>
          </h1>

          {/* Subtext */}
          <p className="gsap-hero-item text-[17px] sm:text-[20px] text-stone-600 dark:text-stone-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Ucapkan selamat tinggal pada jadwal bentrok, deadline terlewat, dan presensi ribet. Dilengkapi kamera orientasi normal, asisten Aiko kontekstual, serta kalkulator indeks prestasi semester.
          </p>

          {/* CTA Buttons */}
          <div className="gsap-hero-item pt-2 flex flex-wrap items-center justify-center gap-3.5">
            <Link href="/signup">
              <Button
                variant="primary"
                size="lg"
                className="bg-gradient-to-r from-pink-600 via-pink-500 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white font-semibold text-[15px] px-8 h-11 rounded-full gap-2 transition-transform active:scale-[0.98] shadow-lg shadow-pink-500/25"
              >
                <span>Mulai Coba Gratis</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <a href="#simulator">
              <Button
                variant="secondary"
                size="lg"
                className="bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.08] dark:hover:bg-white/[0.14] border border-black/[0.08] dark:border-white/[0.12] text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold text-[15px] px-6 h-11 rounded-full transition-transform active:scale-[0.98]"
              >
                Uji Simulasi Fitur
              </Button>
            </a>
          </div>

          {/* Interactive 3D Spatial Titanium Orb */}
          <div className="gsap-hero-item pt-4 max-w-sm sm:max-w-md mx-auto">
            <ThreeTitaniumOrb
              className="w-full h-[260px] sm:h-[310px] mx-auto"
              badgeLabel="3D Spatial Core • Interaktif Putar & Sentuh"
            />
          </div>

          {/* Value Badges */}
          <div className="gsap-hero-item pt-1 flex flex-wrap items-center justify-center gap-4 sm:gap-7 text-[12px] text-zinc-500 dark:text-zinc-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" /> Gratis selamanya
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" /> Multi-akun privat
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" /> PWA mandiri iOS & Android
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" /> Tanpa AI Slop
            </span>
          </div>
        </div>

        {/* 3. INTERACTIVE SIMULATOR (AUTHENTIC APPLE WIDGET FRAME) */}
        <div
          id="simulator"
          ref={simulatorCardRef}
          className="mt-14 max-w-3xl mx-auto rounded-3xl bg-white dark:bg-[#131A29] border border-pink-500/15 dark:border-pink-500/25 shadow-[0_16px_50px_rgba(234,88,12,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden"
        >
          {/* iOS Segmented Control Header */}
          <div className="p-3 border-b border-pink-500/10 dark:border-pink-500/20 bg-[#FBF9F5]/80 dark:bg-[#1A2338]/80 flex items-center justify-center">
            <div className="inline-flex p-1 rounded-full bg-black/[0.04] dark:bg-black/50 text-[12.5px] font-medium text-stone-600 dark:text-stone-400 max-w-full overflow-x-auto no-scrollbar">
              {[
                { id: 'presensi', label: 'Presensi Kamera' },
                { id: 'jadwal', label: 'Radar Bentrok' },
                { id: 'nilai', label: 'Simulasi IPS' },
                { id: 'asisten', label: 'Asisten Aiko' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-1.5 rounded-full transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white font-semibold shadow-md shadow-pink-500/25'
                      : 'hover:text-pink-600 dark:hover:text-pink-400'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content Container */}
          <div ref={tabContentRef} className="p-5 sm:p-7 min-h-[320px]">
            {/* TAB 1: PRESENSI */}
            {activeTab === 'presensi' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[16px] font-semibold text-[#1C1917] dark:text-white">
                      Presensi Orientasi Normal
                    </h3>
                    <p className="text-[13px] text-stone-500 dark:text-stone-400">
                      Kamera tidak terbalik (anti-mirror). Watermark resmi mencatat identitas & detik kehadiran.
                    </p>
                  </div>

                  {/* Mode Picker: Daring vs Tatap Muka */}
                  <div className="inline-flex p-0.5 rounded-lg bg-pink-500/[0.08] dark:bg-white/[0.08] text-[12px] font-medium border border-pink-500/15">
                    <button
                      type="button"
                      onClick={() => {
                        setPresensiMode('online');
                        setPresensiHadir(false);
                      }}
                      className={`px-3 py-1 rounded-md transition-all ${
                        presensiMode === 'online'
                          ? 'bg-pink-500 text-white shadow-sm font-semibold'
                          : 'text-stone-600 dark:text-stone-400 hover:text-pink-600'
                      }`}
                    >
                      Daring (Zoom)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPresensiMode('offline');
                        setPresensiHadir(false);
                      }}
                      className={`px-3 py-1 rounded-md transition-all ${
                        presensiMode === 'offline'
                          ? 'bg-pink-500 text-white shadow-sm font-semibold'
                          : 'text-stone-600 dark:text-stone-400 hover:text-pink-600'
                      }`}
                    >
                      Tatap Muka
                    </button>
                  </div>
                </div>

                {/* Camera Viewfinder */}
                <div className="relative w-full h-[190px] rounded-2xl bg-[#0F141C] border border-pink-500/20 overflow-hidden flex flex-col items-center justify-center text-white">
                  {/* Viewfinder Target Frame */}
                  <div className="relative w-36 h-36 rounded-xl border border-pink-400/30 flex items-center justify-center">
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-pink-400" />
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-pink-400" />
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-pink-400" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-pink-400" />

                    {presensiLoading ? (
                      <span className="text-[11px] text-pink-200 font-mono animate-pulse tracking-wide">
                        Memproses Pindaian...
                      </span>
                    ) : presensiHadir ? (
                      <div className="text-center space-y-1.5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-pink-500/40">
                          <Check className="w-5 h-5 stroke-[3]" />
                        </div>
                        <span className="text-[11.5px] font-semibold text-pink-200 tracking-wide block">
                          Presensi Terverifikasi
                        </span>
                      </div>
                    ) : (
                      <div className="text-center space-y-1">
                        <Camera className="w-6 h-6 text-pink-400/70 mx-auto" />
                        <span className="text-[10px] text-stone-400 font-mono">Orientasi Asli</span>
                      </div>
                    )}
                  </div>

                  {/* Clean Watermark */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[10.5px] font-mono text-white/85">
                    <div className="text-left">
                      <span className="block font-bold text-white tracking-tight">
                        Yossika Putra Erlangga • 103112430026
                      </span>
                      <span className="block text-[9.5px] text-pink-200/80">
                        {presensiMode === 'online' ? 'KULIAH DARING (ZOOM MEETING)' : 'LABORATORIUM 2 (OFFLINE)'}
                      </span>
                    </div>
                    <span className="font-bold text-pink-300 tracking-wider">{currentTime}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[12px] text-stone-500 dark:text-stone-400">
                    {presensiHadir ? 'Foto kehadiran tersimpan di riwayat Cloud.' : 'Uji respons tombol snapshot kamera normal.'}
                  </span>

                  <div className="flex gap-2">
                    {presensiHadir && (
                      <button
                        type="button"
                        onClick={() => setPresensiHadir(false)}
                        className="text-[12px] font-medium text-stone-500 hover:text-pink-600 dark:hover:text-pink-400 px-2 py-1"
                      >
                        Reset
                      </button>
                    )}
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={presensiLoading || presensiHadir}
                      onClick={handleCapturePresensi}
                      className="bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white font-semibold text-[12.5px] px-4 rounded-full h-8 shadow-md shadow-pink-500/20"
                    >
                      {presensiLoading ? 'Memverifikasi...' : 'Ambil Foto'}
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
                    Pendeteksi Tabrakan Jam Kuliah
                  </h3>
                  <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
                    Mencegah pemilihan dua kelas kuliah yang bertabrakan pada slot hari dan jam yang sama.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Slot 1 */}
                  <div className="p-3.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] space-y-1">
                    <div className="flex justify-between items-center text-[11px] text-zinc-500">
                      <span>Senin • 3 SKS</span>
                      <span className="font-mono">08:30 - 11:30</span>
                    </div>
                    <h4 className="font-semibold text-[14px]">Jaringan Komputer</h4>
                    <p className="text-[12px] text-zinc-500 dark:text-zinc-400">Lab Jaringan • Dr. Haryanto</p>
                  </div>

                  {/* Slot 2 (Conflict or Resolved) */}
                  <div
                    className={`p-3.5 rounded-xl border transition-all space-y-1 ${
                      jadwalBentrok
                        ? 'bg-rose-500/[0.08] border-rose-500/30'
                        : 'bg-black/[0.03] dark:bg-white/[0.05] border-zinc-400/40 dark:border-zinc-300/40'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[11px]">
                      <span className={jadwalBentrok ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-zinc-700 dark:text-zinc-200 font-semibold'}>
                        {jadwalBentrok ? 'Bertabrakan (Bentrok)' : 'Slot Terbuka (Aman)'}
                      </span>
                      <span className="font-mono text-[11px] text-zinc-500">
                        {jadwalBentrok ? '09:00 - 12:00' : '13:30 - 16:30'}
                      </span>
                    </div>
                    <h4 className="font-semibold text-[14px]">Algoritma & Struktur Data</h4>
                    <p className="text-[12px] text-zinc-500 dark:text-zinc-400">
                      {jadwalBentrok ? 'Lab Jaringan (Bentrok)' : 'Ruang R204 (Tersedia)'}
                    </p>
                  </div>
                </div>

                {/* Resolution Banner */}
                <div className="p-3.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] flex items-center justify-between gap-3 text-[12.5px]">
                  <div className="flex items-center gap-2">
                    {jadwalBentrok ? (
                      <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-pink-500 flex-shrink-0" />
                    )}
                    <span className="text-zinc-600 dark:text-zinc-300">
                      {jadwalBentrok ? 'Dua kelas menempati slot waktu yang tumpang tindih.' : 'Semua mata kuliah tersusun rapi tanpa bentrok waktu.'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setJadwalBentrok(!jadwalBentrok)}
                    className="text-[12px] font-semibold text-pink-600 dark:text-pink-400 underline whitespace-nowrap"
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
                    Simulasi Indeks Prestasi (IPS/IPK)
                  </h3>
                  <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
                    Geser nilai untuk memprediksi indeks akhir berdasarkan bobot resmi dosen.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  <div className="sm:col-span-2 space-y-3 bg-black/[0.02] dark:bg-white/[0.04] p-4 rounded-2xl">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[12px] text-zinc-500 dark:text-zinc-400 font-medium">
                        <span>Tugas (20%)</span>
                        <span className="font-mono font-semibold text-black dark:text-white">{nilaiTugas}</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={nilaiTugas}
                        onChange={(e) => setNilaiTugas(Number(e.target.value))}
                        className="w-full h-1.5 bg-black/10 dark:bg-white/20 rounded-lg appearance-none cursor-pointer accent-pink-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[12px] text-zinc-500 dark:text-zinc-400 font-medium">
                        <span>UTS (30%)</span>
                        <span className="font-mono font-semibold text-black dark:text-white">{nilaiUTS}</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={nilaiUTS}
                        onChange={(e) => setNilaiUTS(Number(e.target.value))}
                        className="w-full h-1.5 bg-black/10 dark:bg-white/20 rounded-lg appearance-none cursor-pointer accent-pink-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[12px] text-zinc-500 dark:text-zinc-400 font-medium">
                        <span>UAS (35%)</span>
                        <span className="font-mono font-semibold text-black dark:text-white">{nilaiUAS}</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={nilaiUAS}
                        onChange={(e) => setNilaiUAS(Number(e.target.value))}
                        className="w-full h-1.5 bg-black/10 dark:bg-white/20 rounded-lg appearance-none cursor-pointer accent-pink-500"
                      />
                    </div>
                  </div>

                  {/* Clean Titanium Grade Card */}
                  <div className="text-center p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] space-y-1">
                    <span className="text-[11px] text-zinc-400 uppercase tracking-widest font-mono block">Indeks Akhir</span>
                    <span className="text-[42px] font-bold text-[#1D1D1F] dark:text-white leading-none block">
                      {ipkCalc.index}
                    </span>
                    <span className="text-[12px] text-zinc-600 dark:text-zinc-300 font-mono block pt-1">
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
                    Asisten Kontekstual Aiko
                  </h3>
                  <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
                    Memahami jadwal kuliah, deadline tugas, dan target nilai mahasiswa secara real-time.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.08] space-y-2 min-h-[120px]">
                  <div className="text-[13.5px] text-[#1D1D1F] dark:text-zinc-100 leading-relaxed">
                    <span className="font-bold text-black dark:text-white mr-2 font-mono">Aiko:</span>
                    {aiTyping ? (
                      <span className="text-zinc-400 animate-pulse">Meninjau kalender perkuliahan...</span>
                    ) : aiAnswer ? (
                      aiAnswer
                    ) : (
                      'Halo Yossika! Ada pertanyaan mengenai jadwal kuliah, tugas, atau persiapan ujian minggu ini?'
                    )}
                  </div>
                </div>

                {/* Prompts */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    {
                      q: 'Kapan deadline tugas terdekat?',
                      a: 'Halo Yossika! Tugas Jaringan Komputer bab Subnetting dikumpulkan besok pukul 23:59 WIB.',
                    },
                    {
                      q: 'Ada kuliah apa hari ini?',
                      a: 'Hari ini ada Jaringan Komputer (08:30 di Lab Jaringan) dan Kalkulus Lanjut (13:30 Daring).',
                    },
                    {
                      q: 'Target UAS untuk nilai A?',
                      a: 'Berdasarkan bobot tugas dan UTS kamu, target minimal skor ujian akhirmu adalah 82.',
                    },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPrompt(p.q, p.a)}
                      className="px-3.5 py-1.5 rounded-full bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-[12px] font-medium text-zinc-700 dark:text-zinc-300 transition-colors border border-black/[0.04] dark:border-white/[0.06]"
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

      {/* 4. CARA KERJA — 3 LANGKAH SEDERHANA */}
      <section id="cara-kerja" className="py-20 px-4 sm:px-6 max-w-5xl mx-auto border-t border-black/[0.06] dark:border-white/[0.08]">
        <div className="text-center space-y-2 mb-14">
          <span className="text-[11.5px] font-mono tracking-widest text-zinc-500 uppercase block font-semibold">
            Alur Penggunaan
          </span>
          <h2 className="text-[28px] sm:text-[38px] font-bold tracking-tight text-[#1D1D1F] dark:text-white">
            Mulai dalam 3 langkah sederhana.
          </h2>
          <p className="text-[15px] text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
            Tanpa konfigurasi rumit. Terstruktur dan siap digunakan dalam waktu kurang dari satu menit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#121214] border border-black/[0.06] dark:border-white/[0.08] space-y-3">
            <div className="w-9 h-9 rounded-2xl bg-black/[0.05] dark:bg-white/[0.08] flex items-center justify-center font-bold text-[14px] font-mono">
              01
            </div>
            <h3 className="font-bold text-[17px]">Daftarkan Akun Mahasiswa</h3>
            <p className="text-[13.5px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Registrasi cepat dengan email kampus atau personal. Akun Anda sepenuhnya terisolasi dan dilindungi enkripsi cloud.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#121214] border border-black/[0.06] dark:border-white/[0.08] space-y-3">
            <div className="w-9 h-9 rounded-2xl bg-black/[0.05] dark:bg-white/[0.08] flex items-center justify-center font-bold text-[14px] font-mono">
              02
            </div>
            <h3 className="font-bold text-[17px]">Isi Jadwal & Beban Tugas</h3>
            <p className="text-[13.5px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Masukkan mata kuliah semester aktif Anda. Sistem otomatis memvalidasi jadwal agar tidak terjadi tabrakan jam maupun ruang.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#121214] border border-black/[0.06] dark:border-white/[0.08] space-y-3">
            <div className="w-9 h-9 rounded-2xl bg-black/[0.05] dark:bg-white/[0.08] flex items-center justify-center font-bold text-[14px] font-mono">
              03
            </div>
            <h3 className="font-bold text-[17px]">Pantau & Raih IPK Maksimal</h3>
            <p className="text-[13.5px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Presensi dengan kamera orientasi normal, konsultasikan tugas ke Aiko AI, dan pantau estimasi indeks prestasi hingga lulus.
            </p>
          </div>
        </div>
      </section>

      {/* 5. ESSENTIAL CAPABILITIES — CLEAN APPLE CARDS (ANTI-SLOP) */}
      <section id="fitur" className="py-20 px-4 sm:px-6 max-w-5xl mx-auto border-t border-black/[0.06] dark:border-white/[0.08]">
        <div className="text-center space-y-2 mb-12">
          <span className="text-[11.5px] font-mono tracking-widest text-zinc-500 uppercase block font-semibold">
            Modul Lengkap
          </span>
          <h2 className="text-[28px] sm:text-[38px] font-bold tracking-tight text-[#1D1D1F] dark:text-white">
            Dirancang untuk rutinitas nyata perkuliahan.
          </h2>
          <p className="text-[15px] text-zinc-500 dark:text-zinc-400">
            Menyelesaikan masalah mahasiswa tanpa hiasan berlebih atau komponen yang tidak perlu.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#121214] border border-black/[0.06] dark:border-white/[0.08] space-y-2.5 transition-all hover:border-black/20 dark:hover:border-white/20">
            <Camera className="w-5 h-5 text-zinc-800 dark:text-zinc-200" />
            <h3 className="font-semibold text-[17px]">Presensi Kamera Normal</h3>
            <p className="text-[13.5px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Kamera tidak terbalik. Watermark otomatis menyematkan tanggal, jam detik, dan mode daring atau tatap muka.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#121214] border border-black/[0.06] dark:border-white/[0.08] space-y-2.5 transition-all hover:border-black/20 dark:hover:border-white/20">
            <Calendar className="w-5 h-5 text-zinc-800 dark:text-zinc-200" />
            <h3 className="font-semibold text-[17px]">Penyusun Jadwal Anti-Bentrok</h3>
            <p className="text-[13.5px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Validasi bentrok mencegah kesalahan ambil kelas saat KRS. Pantau countdown menuju perkuliahan berikutnya secara presisi.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#121214] border border-black/[0.06] dark:border-white/[0.08] space-y-2.5 transition-all hover:border-black/20 dark:hover:border-white/20">
            <Award className="w-5 h-5 text-zinc-800 dark:text-zinc-200" />
            <h3 className="font-semibold text-[17px]">Kalkulator KHS & Nilai Akhir</h3>
            <p className="text-[13.5px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Kalkulasi bobot evaluasi dosen secara akurat. Simulasikan skor UTS dan UAS yang dibutuhkan sebelum ujian berlangsung.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#121214] border border-black/[0.06] dark:border-white/[0.08] space-y-2.5 transition-all hover:border-black/20 dark:hover:border-white/20">
            <Sparkles className="w-5 h-5 text-zinc-800 dark:text-zinc-200" />
            <h3 className="font-semibold text-[17px]">Asisten AI Gemini Flash</h3>
            <p className="text-[13.5px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Didukung model Gemini Flash untuk konsultasi materi kuliah, rangkuman tugas, dan panduan belajar 24/7.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#121214] border border-black/[0.06] dark:border-white/[0.08] space-y-2.5 transition-all hover:border-black/20 dark:hover:border-white/20">
            <Smartphone className="w-5 h-5 text-zinc-800 dark:text-zinc-200" />
            <h3 className="font-semibold text-[17px]">Notifikasi Web Push OS</h3>
            <p className="text-[13.5px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Pengingat resmi sistem operasi muncul 15 menit sebelum kuliah dan H-1 tenggat waktu tugas tanpa harus membuka tab browser.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#121214] border border-black/[0.06] dark:border-white/[0.08] space-y-2.5 transition-all hover:border-black/20 dark:hover:border-white/20">
            <Shield className="w-5 h-5 text-zinc-800 dark:text-zinc-200" />
            <h3 className="font-semibold text-[17px]">Isolasi Akun Privat</h3>
            <p className="text-[13.5px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Autentikasi sesi terenkripsi dengan database serverless cloud. Data akademik mahasiswa lain terisolasi penuh secara aman.
            </p>
          </div>
        </div>
      </section>

      {/* 6. TRANSPARENT PRICING / PLANS */}
      <section id="harga" className="py-20 px-4 sm:px-6 max-w-4xl mx-auto border-t border-black/[0.06] dark:border-white/[0.08]">
        <div className="text-center space-y-2 mb-12">
          <span className="text-[11.5px] font-mono tracking-widest text-zinc-500 uppercase block font-semibold">
            Akses Platform
          </span>
          <h2 className="text-[28px] sm:text-[36px] font-bold tracking-tight text-[#1D1D1F] dark:text-white">
            Harga transparan untuk mahasiswa.
          </h2>
          <p className="text-[15px] text-zinc-500 dark:text-zinc-400">
            Semua fitur esensial tersedia gratis tanpa biaya tersembunyi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free Tier */}
          <div className="p-7 rounded-3xl bg-white dark:bg-[#121214] border-2 border-black/15 dark:border-white/20 space-y-5 relative">
            <div className="space-y-1">
              <div className="inline-flex px-2.5 py-0.5 rounded-full bg-black/[0.05] dark:bg-white/[0.1] text-[11px] font-bold tracking-wide uppercase font-mono">
                Mahasiswa Aktif
              </div>
              <h3 className="text-[28px] font-bold text-black dark:text-white">Rp 0 <span className="text-[14px] font-normal text-zinc-500">/ selamanya</span></h3>
              <p className="text-[13.5px] text-zinc-500 dark:text-zinc-400">
                Akses lengkap seluruh kebutuhan kuliah harian Anda tanpa batasan waktu.
              </p>
            </div>

            <ul className="space-y-2.5 text-[13px] text-zinc-700 dark:text-zinc-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-zinc-900 dark:text-white flex-shrink-0" />
                <span>Presensi kamera orientasi normal</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-zinc-900 dark:text-white flex-shrink-0" />
                <span>Pendeteksi jadwal bentrok otomatis</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-zinc-900 dark:text-white flex-shrink-0" />
                <span>Kalkulator IPS & prediksi indeks nilai</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-zinc-900 dark:text-white flex-shrink-0" />
                <span>Dukungan Web Push Notification OS</span>
              </li>
            </ul>

            <div className="pt-3">
              <Link href="/signup">
                <Button variant="primary" className="w-full h-10 rounded-full font-semibold text-[13.5px] bg-zinc-950 dark:bg-white text-white dark:text-zinc-950">
                  Daftar Akun Gratis
                </Button>
              </Link>
            </div>
          </div>

          {/* Pro / Campus Tier */}
          <div className="p-7 rounded-3xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] space-y-5 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="space-y-1">
                <div className="inline-flex px-2.5 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-[11px] font-medium tracking-wide uppercase font-mono text-zinc-500">
                  Pro Campus
                </div>
                <h3 className="text-[28px] font-bold text-zinc-400">Waitlist</h3>
                <p className="text-[13.5px] text-zinc-500 dark:text-zinc-400">
                  Integrasi otomatis API akademik kampus (SSO) dan asisten suara Live Voice Duplex.
                </p>
              </div>

              <ul className="space-y-2.5 text-[13px] text-zinc-500 dark:text-zinc-400">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                  <span>Sinkronisasi otomatis jadwal i-Gracias / SIAKAD</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                  <span>Live Voice Duplex dengan avatar 3D interaktif</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                  <span>Ekspor PDF transkrip berstandar resmi</span>
                </li>
              </ul>
            </div>

            <div className="pt-3">
              <Link href="/signup">
                <Button variant="secondary" className="w-full h-10 rounded-full font-semibold text-[13.5px]">
                  Gabung Waitlist Pro
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS / DI PERCAYA MAHASISWA */}
      <section id="testimoni" className="py-20 px-4 sm:px-6 max-w-5xl mx-auto border-t border-black/[0.06] dark:border-white/[0.08]">
        <div className="text-center space-y-2 mb-12">
          <span className="text-[11.5px] font-mono tracking-widest text-zinc-500 uppercase block font-semibold">
            Ulasan Pengguna
          </span>
          <h2 className="text-[28px] sm:text-[36px] font-bold tracking-tight text-[#1D1D1F] dark:text-white">
            Dipercaya mahasiswa aktif.
          </h2>
          <p className="text-[15px] text-zinc-500 dark:text-zinc-400">
            Dukungan penuh untuk berbagai program studi di perguruan tinggi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#121214] border border-black/[0.06] dark:border-white/[0.08] space-y-3">
            <p className="text-[13.5px] text-zinc-600 dark:text-zinc-300 leading-relaxed italic">
              &ldquo;Fitur anti-bentroknya sangat membantu saat KRS-an. Saya tidak perlu lagi cek Excel manual untuk memastikan jam praktikum dan teori tidak tabrakan.&rdquo;
            </p>
            <div className="pt-2 border-t border-black/[0.05] dark:border-white/[0.05]">
              <h4 className="font-semibold text-[14px]">Rian Ardiansyah</h4>
              <p className="text-[12px] text-zinc-500">Informatika • Semester 5</p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#121214] border border-black/[0.06] dark:border-white/[0.08] space-y-3">
            <p className="text-[13.5px] text-zinc-600 dark:text-zinc-300 leading-relaxed italic">
              &ldquo;Presensi foto orientasi normal bikin bukti kehadiran kuliah jadi rapi. Tampilannya di iPhone dan laptop sangat bersih seperti aplikasi bawaan Apple.&rdquo;
            </p>
            <div className="pt-2 border-t border-black/[0.05] dark:border-white/[0.05]">
              <h4 className="font-semibold text-[14px]">Siti Nurhaliza</h4>
              <p className="text-[12px] text-zinc-500">Sistem Informasi • Semester 3</p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#121214] border border-black/[0.06] dark:border-white/[0.08] space-y-3">
            <p className="text-[13.5px] text-zinc-600 dark:text-zinc-300 leading-relaxed italic">
              &ldquo;Forecasting nilainya akurat banget! Saya jadi tahu persis minimal nilai UTS yang harus didapat biar mata kuliah proyek akhir tetap dapat nilai A.&rdquo;
            </p>
            <div className="pt-2 border-t border-black/[0.05] dark:border-white/[0.05]">
              <h4 className="font-semibold text-[14px]">Daffa Fauzan</h4>
              <p className="text-[12px] text-zinc-500">Teknik Telekomunikasi • Semester 7</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. COMPARISON TABLE */}
      <section id="perbandingan" className="py-20 px-4 sm:px-6 max-w-4xl mx-auto border-t border-black/[0.06] dark:border-white/[0.08]">
        <div className="text-center space-y-2 mb-10">
          <span className="text-[11.5px] font-mono tracking-widest text-zinc-500 uppercase block font-semibold">
            Komparasi Sistem
          </span>
          <h2 className="text-[28px] sm:text-[34px] font-bold tracking-tight text-[#1D1D1F] dark:text-white">
            Perbandingan dengan metode umum.
          </h2>
        </div>

        <div className="rounded-3xl bg-white dark:bg-[#121214] border border-black/[0.06] dark:border-white/[0.08] overflow-hidden">
          <table className="w-full text-left text-[13.5px]">
            <thead>
              <tr className="border-b border-black/[0.06] dark:border-white/[0.08] text-zinc-500 bg-zinc-50/50 dark:bg-white/[0.02]">
                <th className="py-3.5 px-5 font-medium">Kemampuan Sistem</th>
                <th className="py-3.5 px-5 font-bold text-black dark:text-white">Semestr OS</th>
                <th className="py-3.5 px-5 font-normal text-zinc-400">Catatan Biasa / Spreadsheet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.05]">
              <tr>
                <td className="py-3 px-5 font-medium">Kamera Presensi Anti-Mirror</td>
                <td className="py-3 px-5 text-black dark:text-white font-semibold">Otomatis Normal</td>
                <td className="py-3 px-5 text-zinc-400">Tidak Ada</td>
              </tr>
              <tr>
                <td className="py-3 px-5 font-medium">Pencegahan Bentrok Jam KRS</td>
                <td className="py-3 px-5 text-black dark:text-white font-semibold">Validasi Real-time</td>
                <td className="py-3 px-5 text-zinc-400">Manual & Rawan Salah</td>
              </tr>
              <tr>
                <td className="py-3 px-5 font-medium">Kalkulasi Bobot Nilai & IPS</td>
                <td className="py-3 px-5 text-black dark:text-white font-semibold">Interaktif Seketika</td>
                <td className="py-3 px-5 text-zinc-400">Rumus Excel Manual</td>
              </tr>
              <tr>
                <td className="py-3 px-5 font-medium">Notifikasi Sistem Operasi</td>
                <td className="py-3 px-5 text-black dark:text-white font-semibold">Web Push API</td>
                <td className="py-3 px-5 text-zinc-400">Alarm Manual</td>
              </tr>
              <tr>
                <td className="py-3 px-5 font-medium">Instalasi PWA Standalone</td>
                <td className="py-3 px-5 text-black dark:text-white font-semibold">iOS, iPad, Android & Mac</td>
                <td className="py-3 px-5 text-zinc-400">Tab Browser Terpisah</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 9. FAQ ACCORDION */}
      <section id="faq" className="py-20 px-4 sm:px-6 max-w-3xl mx-auto border-t border-black/[0.06] dark:border-white/[0.08]">
        <div className="text-center space-y-2 mb-10">
          <span className="text-[11.5px] font-mono tracking-widest text-zinc-500 uppercase block font-semibold">
            FAQ
          </span>
          <h2 className="text-[28px] sm:text-[34px] font-bold tracking-tight text-[#1D1D1F] dark:text-white">
            Pertanyaan yang kerap diajukan.
          </h2>
        </div>

        <div className="space-y-2">
          {[
            {
              q: 'Apakah Semestr gratis untuk seluruh mahasiswa?',
              a: 'Ya, Semestr dapat digunakan sepenuhnya secara gratis tanpa biaya langganan, masa percobaan berbayar, ataupun iklan yang mengganggu.',
            },
            {
              q: 'Bagaimana cara kerja kamera presensi orientasi normal?',
              a: 'Sistem secara otomatis mengoreksi orientasi cermin pada kanvas kamera peramban, sehingga teks pada pakaian, buku catatan, atau latar belakang tetap terbaca normal.',
            },
            {
              q: 'Apakah data akun saya terisolasi dari mahasiswa lain?',
              a: 'Ya, setiap akun diverifikasi dengan sesi autentikasi independen pada database cloud. Mahasiswa lain yang mendaftar hanya memiliki akses ke akun mereka sendiri.',
            },
            {
              q: 'Bagaimana cara memasang aplikasi ini di iPhone atau Android?',
              a: 'Di Safari (iOS), ketuk tombol Bagikan (Share) lalu pilih "Tambahkan ke Layar Utama". Di Chrome (Android), ketuk tombol Install Aplikasi pada banner.',
            },
          ].map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white dark:bg-[#121214] border border-black/[0.06] dark:border-white/[0.08] overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-semibold text-[15px] text-[#1D1D1F] dark:text-white"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                    openFaq === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-5 sm:px-5 text-[13.5px] text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-black/[0.04] dark:border-white/[0.05] pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 10. CREATOR SPOTLIGHT & WATERMARK SECTION */}
      <section className="py-16 px-4 sm:px-6 max-w-3xl mx-auto border-t border-black/[0.06] dark:border-white/[0.08]">
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#121214] border border-black/[0.08] dark:border-white/[0.12] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/[0.05] dark:bg-white/[0.08] text-[11px] font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-300 font-semibold">
              Arsitek & Pengembang
            </div>
            <h3 className="text-[20px] sm:text-[22px] font-bold text-black dark:text-white">
              Yossika Putra Erlangga
            </h3>
            <p className="text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              NIM 103112430026 • Telkom University. Didesain secara presisi dengan standar antarmuka Apple iOS & VisionOS Spatial UI.
            </p>
          </div>

          <div className="flex-shrink-0">
            <a
              href="https://yossikaputra.my.id"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-semibold text-[13px] shadow-sm transition-transform active:scale-95"
            >
              <span>Lihat Portofolio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* 11. MINIMALIST CLOSING CTA */}
      <section className="py-20 px-4 sm:px-6 text-center">
        <div className="max-w-xl mx-auto space-y-4">
          <h2 className="text-[32px] sm:text-[44px] font-bold tracking-tight text-[#1D1D1F] dark:text-white leading-tight">
            Mulai kelola perkuliahan Anda dengan tenang.
          </h2>
          <p className="text-[15px] text-zinc-500 dark:text-zinc-400">
            Pendaftaran selesai dalam waktu kurang dari satu menit.
          </p>
          <div className="pt-3">
            <Link href="/signup">
              <Button
                variant="primary"
                size="lg"
                className="bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-semibold text-[15px] px-8 h-11 rounded-full shadow-md"
              >
                Daftar Akun Mahasiswa Gratis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 12. FOOTER — SUBTLE APPLE MONOCHROME ATTRIBUTION */}
      <footer className="py-12 px-4 border-t border-black/[0.06] dark:border-white/[0.08] text-[12px] text-zinc-500 dark:text-zinc-400">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-zinc-950 dark:bg-white flex items-center justify-center text-white dark:text-zinc-950">
              <MascotIcon size={14} />
            </div>
            <span className="font-medium">Semestr • Academic OS Mahasiswa Modern</span>
          </div>

          <div className="flex items-center gap-6 font-medium">
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
              className="hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 font-semibold text-black dark:text-white"
            >
              <span>yossikaputra.my.id</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="max-w-5xl mx-auto pt-6 mt-6 border-t border-black/[0.04] dark:border-white/[0.04] text-center sm:text-left text-[11px] text-zinc-400 dark:text-zinc-500">
          © 2026 Semestr. Seluruh hak cipta dilindungi. Dibuat dengan presisi oleh Yossika Putra Erlangga (103112430026) — Software Engineer.
        </div>
      </footer>
    </div>
  );
}

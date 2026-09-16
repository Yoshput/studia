'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MascotIcon } from '@/components/assistant/MascotIcon';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Camera,
  Sparkles,
  CalendarDays,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  ChevronDown,
  Play,
  AlertTriangle,
  Menu,
  X,
  ExternalLink,
  Check,
  UserCheck,
  BrainCircuit,
  LogOut,
} from 'lucide-react';
import gsap from 'gsap';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Interactive Demo State
  const [activeDemoTab, setActiveDemoTab] = useState<'scan' | 'jadwal' | 'ai'>('scan');
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success'>('idle');
  const [clashResult, setClashResult] = useState<'idle' | 'clash' | 'safe'>('idle');
  const [aiChatResponse, setAiChatResponse] = useState<string | null>(null);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Check for logout redirect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('logged_out') === '1') {
        setShowLogoutModal(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // Scroll listener for sticky blur navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // GSAP hero animation
  useEffect(() => {
    gsap.fromTo(
      '.hero-fade',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.7, ease: 'power2.out' }
    );
  }, []);

  // Demo Scan Trigger
  const handleTriggerDemoScan = () => {
    setScanStatus('scanning');
    setTimeout(() => {
      setScanStatus('success');
    }, 1600);
  };

  // Demo Clash Test Trigger
  const handleTestClash = (isClashing: boolean) => {
    setClashResult(isClashing ? 'clash' : 'safe');
  };

  // Demo AI Chat Trigger
  const handleAskDemoAi = (prompt: string) => {
    setAiChatResponse('Sedang menganalisis jadwal...');
    setTimeout(() => {
      if (prompt.includes('tugas')) {
        setAiChatResponse(
          'Kamu memiliki 2 tugas aktif: Tugas Jaringan Komputer (deadline 2 hari lagi, prioritas tinggi) dan Proyek Kalkulus (deadline 5 hari lagi). Disarankan selesaikan Jaringan Komputer malam ini!'
        );
      } else if (prompt.includes('jadwal')) {
        setAiChatResponse(
          'Hari ini ada 2 sesi kuliah: Jaringan Komputer (08:30 - 11:30 di Lab 2) dan Algoritma (13:30 - 15:30 di R204). Jangan lupa presensi berbusana rapi!'
        );
      } else {
        setAiChatResponse(
          'IPK prediksimu saat ini 3.82. Untuk mempertahankan target Cumlaude, pastikan skor UTS mata kuliah berbobot 3 SKS tetap di atas 80 poin.'
        );
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-ios-bg text-ios-textPrimary selection:bg-ios-accent/20 transition-colors duration-200 overflow-x-hidden">
      {/* 1. STICKY BLUR NAVBAR */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-ios-surface/85 backdrop-blur-md border-b border-ios-border/80 shadow-sm'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-1.5 rounded-2xl bg-ios-surface border border-ios-border shadow-sm group-hover:scale-105 transition-transform">
              <MascotIcon size={26} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[19px] font-black tracking-tight text-ios-textPrimary">
                Semestr
              </span>
              <span className="text-[11px] font-bold text-ios-accent px-2 py-0.5 rounded-full bg-ios-accent/10 border border-ios-accent/20">
                Academic OS
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-[13.5px] font-medium text-ios-textSecondary">
            <a href="#fitur" className="hover:text-ios-textPrimary transition-colors">
              Fitur
            </a>
            <a href="#cara-kerja" className="hover:text-ios-textPrimary transition-colors">
              Cara Kerja
            </a>
            <a href="#demo" className="hover:text-ios-textPrimary transition-colors">
              Simulasi
            </a>
            <a href="#harga" className="hover:text-ios-textPrimary transition-colors">
              Harga
            </a>
            <a href="#faq" className="hover:text-ios-textPrimary transition-colors">
              FAQ
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-semibold text-[13px]">
                Masuk
              </Button>
            </Link>

            <Link href="/signup">
              <Button
                variant="primary"
                size="sm"
                className="font-bold text-[13px] px-4 shadow-sm shadow-blue-500/20 hover:shadow-blue-500/35 transition-all"
              >
                <span>Daftar Gratis</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-ios-surfaceSecondary border border-ios-border text-ios-textPrimary"
              aria-label="Buka Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-3 pb-6 bg-ios-surface border-b border-ios-border shadow-xl space-y-4 animate-in slide-in-from-top-4 duration-200">
            <nav className="flex flex-col space-y-3 text-[14px] font-semibold text-ios-textSecondary">
              <a
                href="#fitur"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-ios-surfaceSecondary"
              >
                Fitur Utama
              </a>
              <a
                href="#cara-kerja"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-ios-surfaceSecondary"
              >
                Cara Kerja
              </a>
              <a
                href="#demo"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-ios-surfaceSecondary"
              >
                Simulasi Interaktif
              </a>
              <a
                href="#harga"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-ios-surfaceSecondary"
              >
                Paket Harga
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-ios-surfaceSecondary"
              >
                Tanya Jawab (FAQ)
              </a>
            </nav>

            <div className="pt-3 border-t border-ios-border flex flex-col gap-2.5">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="secondary" className="w-full font-semibold">
                  Masuk ke Akun
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full font-bold shadow-md">
                  Daftar Akun Baru (Gratis)
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-10 pb-20 sm:pt-16 sm:pb-28 px-4 overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-blue-500/10 via-indigo-500/10 to-transparent blur-[120px] pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto text-center space-y-6">
          {/* Badge Pill */}
          <div className="hero-fade inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-ios-surface border border-ios-border shadow-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
            </span>
            <span className="text-[12.5px] font-semibold text-ios-textSecondary">
              Academic OS All-in-One untuk Mahasiswa
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="hero-fade text-[36px] sm:text-[56px] lg:text-[62px] font-black tracking-tight leading-[1.08] text-ios-textPrimary max-w-4xl mx-auto">
            Kendali Penuh Kuliah Anda.{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
              Jadwal Rapi, Tugas Terkendali, IPK Terjaga.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="hero-fade text-[16px] sm:text-[19px] text-ios-textSecondary max-w-2xl mx-auto leading-relaxed font-normal">
            Ucapkan selamat tinggal pada jadwal bentrok, deadline terlewat, dan presensi ribet.
            Dilengkapi presensi biometrik wajah, asisten AI 24/7, serta forecasting nilai otomatis.
          </p>

          {/* CTA Buttons */}
          <div className="hero-fade pt-2 flex flex-wrap items-center justify-center gap-3.5">
            <Link href="/signup">
              <Button
                variant="primary"
                size="lg"
                className="font-bold px-8 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 text-[15px] gap-2 rounded-2xl h-12"
              >
                <span>Mulai Coba Gratis</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <a href="#demo">
              <Button
                variant="secondary"
                size="lg"
                className="font-semibold px-6 text-[15px] gap-2 rounded-2xl h-12 border-ios-border bg-ios-surface hover:bg-ios-surfaceSecondary"
              >
                <Play className="w-4 h-4 text-ios-accent fill-ios-accent/20" />
                <span>Uji Simulasi Fitur</span>
              </Button>
            </a>
          </div>

          {/* Trust Guarantee Indicator */}
          <div className="hero-fade flex items-center justify-center gap-6 pt-3 text-[12px] text-ios-textSecondary font-medium">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-ios-success" /> Gratis Selamanya
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-ios-success" /> Tanpa Kartu Kredit
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-ios-success" /> Cloud Sync Multi-Device
            </span>
          </div>

          {/* 3D PRODUCT MOCKUP FRAME (GENERIC SAAS WORKSPACE) */}
          <div className="hero-fade pt-8 max-w-4xl mx-auto">
            <div className="rounded-3xl p-3 sm:p-5 bg-ios-surface border border-ios-border shadow-2xl relative overflow-hidden text-left">
              {/* Browser Window Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-ios-border">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                  <span className="text-[11px] font-mono text-ios-textSecondary ml-2 hidden sm:inline">
                    semestr.app/workspace
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-ios-textSecondary">
                  <span className="w-2 h-2 rounded-full bg-ios-success" />
                  <span>Sistem Siap Digunakan</span>
                </div>
              </div>

              {/* Generic Mockup Content */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                {/* User Snapshot Card (Generic Dummy) */}
                <div className="md:col-span-4 p-4 rounded-2xl bg-ios-surfaceSecondary border border-ios-border space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-[16px] shadow-sm">
                      M
                    </div>
                    <div>
                      <h4 className="text-[14px] font-bold text-ios-textPrimary leading-tight">
                        Mahasiswa Aktif
                      </h4>
                      <p className="text-[11px] text-ios-textSecondary">
                        // TODO: Profil Anda setelah login
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-ios-surface border border-ios-border flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-ios-textSecondary block">
                        Target IPK (Contoh)
                      </span>
                      <span className="text-[20px] font-black text-ios-accent leading-none">
                        3.82
                      </span>
                    </div>
                    <span className="text-[10.5px] px-2 py-0.5 rounded-full font-bold bg-ios-success/15 text-ios-success">
                      Sangat Memuaskan
                    </span>
                  </div>

                  <div className="text-[11px] text-ios-textSecondary space-y-1 pt-1">
                    <div className="flex justify-between">
                      <span>Beban Kuliah:</span>
                      <span className="font-bold text-ios-textPrimary">20 SKS Terdaftar</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Presensi Minggu Ini:</span>
                      <span className="font-bold text-ios-success">100% Hadir</span>
                    </div>
                  </div>
                </div>

                {/* Today's Timetable Preview (Generic) */}
                <div className="md:col-span-8 p-4 rounded-2xl bg-ios-surfaceSecondary border border-ios-border space-y-3">
                  <div className="flex items-center justify-between text-[12px]">
                    <div className="flex items-center gap-1.5 font-bold text-ios-textPrimary">
                      <CalendarDays className="w-4 h-4 text-ios-accent" />
                      <span>Jadwal Kuliah Hari Ini (Ilustrasi)</span>
                    </div>
                    <span className="text-ios-accent font-semibold text-[11px]">Anti-Bentrok Aktif</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl bg-ios-surface border border-ios-border space-y-1">
                      <div className="flex justify-between items-center text-[10.5px]">
                        <span className="font-semibold text-ios-accent">08:30 - 11:30</span>
                        <span className="text-ios-textSecondary">3 SKS</span>
                      </div>
                      <h5 className="text-[13px] font-bold text-ios-textPrimary">
                        Jaringan Komputer
                      </h5>
                      <p className="text-[11px] text-ios-textSecondary">Lab Jaringan • Dr. Ir. Haryanto</p>
                    </div>

                    <div className="p-3 rounded-xl bg-ios-surface border border-ios-border space-y-1">
                      <div className="flex justify-between items-center text-[10.5px]">
                        <span className="font-semibold text-ios-accent">13:30 - 15:30</span>
                        <span className="text-ios-textSecondary">2 SKS</span>
                      </div>
                      <h5 className="text-[13px] font-bold text-ios-textPrimary">
                        Kalkulus Lanjut
                      </h5>
                      <p className="text-[11px] text-ios-textSecondary">Gedung A R204 • Dosen Pengampu</p>
                    </div>
                  </div>

                  {/* AI Assistant Context Banner inside Mockup */}
                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 flex items-center justify-between text-[12px]">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
                      <span className="font-semibold text-ios-textPrimary">
                        Aiko AI: Kuis Kalkulus 3 hari lagi, modul latihan sudah dirangkum!
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-blue-500 hidden sm:inline">
                      Aktif 24/7
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SOCIAL PROOF & STATS STRIP */}
      <section className="py-10 border-y border-ios-border bg-ios-surfaceSecondary/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {/* // TODO: replace with real analytics when tracking is enabled */}
            <div className="space-y-1">
              <span className="text-[28px] sm:text-[34px] font-black text-ios-textPrimary tracking-tight block">
                1.200+
              </span>
              <span className="text-[12px] font-semibold text-ios-textSecondary uppercase tracking-wider">
                Mahasiswa Terdaftar
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[28px] sm:text-[34px] font-black text-ios-accent tracking-tight block">
                99.4%
              </span>
              <span className="text-[12px] font-semibold text-ios-textSecondary uppercase tracking-wider">
                Presisi Biometrik
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[28px] sm:text-[34px] font-black text-ios-textPrimary tracking-tight block">
                48+
              </span>
              <span className="text-[12px] font-semibold text-ios-textSecondary uppercase tracking-wider">
                Program Studi & Kampus
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[28px] sm:text-[34px] font-black text-emerald-500 tracking-tight block">
                0%
              </span>
              <span className="text-[12px] font-semibold text-ios-textSecondary uppercase tracking-wider">
                Jadwal Bentrok
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURE SHOWCASE (APPLE iOS 18 BENTO GRID) */}
      <section id="fitur" className="py-20 px-4 max-w-6xl mx-auto space-y-14">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-[12px] font-bold text-ios-accent uppercase tracking-widest">
            Fitur Unggulan
          </span>
          <h2 className="text-[32px] sm:text-[42px] font-black tracking-tight text-ios-textPrimary">
            Ekosistem Lengkap Penunjang Kuliah
          </h2>
          <p className="text-[15px] text-ios-textSecondary">
            Didesain khusus untuk mengatasi masalah nyata mahasiswa: dari kepastian presensi hingga perhitungan IPK semester.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Biometrik */}
          <div className="p-7 rounded-3xl bg-ios-surface border border-ios-border shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-[19px] font-bold text-ios-textPrimary">
              Presensi Biometrik Wajah & Busana
            </h3>
            <p className="text-[13.5px] text-ios-textSecondary leading-relaxed">
              Catat bukti kehadiran langsung dari perangkat. Sistem secara cerdas memvalidasi wajah asli dan memastikan Anda mengenakan pakaian berkerah rapi atau almamater.
            </p>
            <div className="pt-2 text-[12px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <span>Enkripsi TLS & Consent Screen</span>
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: AI Assistant */}
          <div className="p-7 rounded-3xl bg-ios-surface border border-ios-border shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-[19px] font-bold text-ios-textPrimary">
              Asisten AI Gemini 2.5 Flash
            </h3>
            <p className="text-[13.5px] text-ios-textSecondary leading-relaxed">
              Asisten kontekstual Aiko yang memahami jadwal harian Anda. Bisa diajak ngobrol via teks atau suara (Live Voice Duplex) untuk merangkum tugas dan tips ujian.
            </p>
            <div className="pt-2 text-[12px] font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
              <span>Avatar 3D & Suara Asli</span>
              <BrainCircuit className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3: Anti-Bentrok */}
          <div className="p-7 rounded-3xl bg-ios-surface border border-ios-border shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CalendarDays className="w-6 h-6" />
            </div>
            <h3 className="text-[19px] font-bold text-ios-textPrimary">
              Jadwal Kuliah Anti-Bentrok
            </h3>
            <p className="text-[13.5px] text-ios-textSecondary leading-relaxed">
              Algoritma otomatis memvalidasi jadwal sebelum disimpan. Jika ada dua mata kuliah yang bertabrakan jamnya di hari yang sama, sistem langsung memberikan peringatan dini.
            </p>
            <div className="pt-2 text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span>Validasi Real-time</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 4: KHS & Forecasting (Span 2 col) */}
          <div className="md:col-span-2 p-7 rounded-3xl bg-ios-surface border border-ios-border shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-[19px] font-bold text-ios-textPrimary">
              Transkrip KHS & Simulasi Estimasi Nilai Akhir
            </h3>
            <p className="text-[13.5px] text-ios-textSecondary leading-relaxed">
              Pantau seluruh riwayat nilai per semester (SKS & Indeks Prestasi). Gunakan fitur kalkulator forecasting untuk menghitung berapa nilai UTS dan UAS yang Anda perlukan demi mendapatkan indeks huruf A atau AB.
            </p>
            <div className="pt-1 flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-full bg-ios-surfaceSecondary border border-ios-border text-[11px] font-semibold text-ios-textSecondary">
                Kalkulasi Bobot Otomatis
              </span>
              <span className="px-2.5 py-1 rounded-full bg-ios-surfaceSecondary border border-ios-border text-[11px] font-semibold text-ios-textSecondary">
                Simulasi IPK Kumulatif
              </span>
            </div>
          </div>

          {/* Card 5: Deadline Tracker */}
          <div className="p-7 rounded-3xl bg-ios-surface border border-ios-border shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-[19px] font-bold text-ios-textPrimary">
              Deadline & Prioritas Tugas
            </h3>
            <p className="text-[13.5px] text-ios-textSecondary leading-relaxed">
              Manajemen to-do kuliah dengan hitung mundur hari dan label prioritas dinamis. Dapatkan peringatan otomatis ketika batas pengumpulan tugas kurang dari 3 hari.
            </p>
            <div className="pt-2 text-[12px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
              <span>Peringatan Dini Batas Waktu</span>
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* 5. CARA KERJA (3 LANGKAH CEPAT) */}
      <section id="cara-kerja" className="py-20 px-4 bg-ios-surfaceSecondary/50 border-y border-ios-border">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-lg mx-auto space-y-2">
            <span className="text-[12px] font-bold text-ios-accent uppercase tracking-widest">
              Alur Penggunaan
            </span>
            <h2 className="text-[32px] sm:text-[38px] font-black tracking-tight text-ios-textPrimary">
              Mulai dalam 3 Langkah Sederhana
            </h2>
            <p className="text-[14.5px] text-ios-textSecondary">
              Tanpa setup berbelit-belit. Daftar dan rasakan kemudahan kuliah terorganisir hari ini.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-ios-surface border border-ios-border shadow-sm space-y-3 relative">
              <div className="w-9 h-9 rounded-full bg-ios-accent text-white font-black text-[14px] flex items-center justify-center shadow-md">
                1
              </div>
              <h4 className="text-[17px] font-bold text-ios-textPrimary">
                Daftarkan Akun Mahasiswa
              </h4>
              <p className="text-[13px] text-ios-textSecondary leading-relaxed">
                Registrasi cepat menggunakan email kampus atau personal Anda. Akun Anda sepenuhnya terisolasi dan dilindungi enkripsi.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-ios-surface border border-ios-border shadow-sm space-y-3 relative">
              <div className="w-9 h-9 rounded-full bg-ios-accent text-white font-black text-[14px] flex items-center justify-center shadow-md">
                2
              </div>
              <h4 className="text-[17px] font-bold text-ios-textPrimary">
                Isi Jadwal & Tugas Kuliah
              </h4>
              <p className="text-[13px] text-ios-textSecondary leading-relaxed">
                Masukkan mata kuliah semester aktif Anda. Sistem otomatis memvalidasi jadwal agar tidak terjadi bentrok ruang maupun waktu.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-ios-surface border border-ios-border shadow-sm space-y-3 relative">
              <div className="w-9 h-9 rounded-full bg-ios-accent text-white font-black text-[14px] flex items-center justify-center shadow-md">
                3
              </div>
              <h4 className="text-[17px] font-bold text-ios-textPrimary">
                Pantau & Raih IPK Maksimal
              </h4>
              <p className="text-[13px] text-ios-textSecondary leading-relaxed">
                Presensi dengan kamera, tanyakan tips belajar ke asisten AI, dan pantau estimasi nilai akhir hingga lulus dengan memuaskan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE DEMO PLAYGROUND (WITHOUT LOGIN) */}
      <section id="demo" className="py-20 px-4 max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[12px] font-bold text-ios-accent uppercase tracking-widest">
            Simulasi Interaktif
          </span>
          <h2 className="text-[32px] sm:text-[38px] font-black tracking-tight text-ios-textPrimary">
            Coba Fiturnya Langsung di Sini
          </h2>
          <p className="text-[14.5px] text-ios-textSecondary max-w-lg mx-auto">
            Uji coba simulasi fitur utama tanpa perlu melakukan registrasi terlebih dahulu.
          </p>
        </div>

        {/* Demo Box */}
        <div className="p-6 sm:p-8 rounded-3xl bg-ios-surface border border-ios-border shadow-xl space-y-6">
          {/* Tab Switcher */}
          <div className="flex rounded-2xl bg-ios-surfaceSecondary p-1.5 border border-ios-border max-w-md mx-auto">
            <button
              type="button"
              onClick={() => setActiveDemoTab('scan')}
              className={`flex-1 py-2 text-[13px] font-bold rounded-xl transition-all ${
                activeDemoTab === 'scan'
                  ? 'bg-ios-surface text-ios-textPrimary shadow-sm'
                  : 'text-ios-textSecondary hover:text-ios-textPrimary'
              }`}
            >
              Simulasi Presensi
            </button>
            <button
              type="button"
              onClick={() => setActiveDemoTab('jadwal')}
              className={`flex-1 py-2 text-[13px] font-bold rounded-xl transition-all ${
                activeDemoTab === 'jadwal'
                  ? 'bg-ios-surface text-ios-textPrimary shadow-sm'
                  : 'text-ios-textSecondary hover:text-ios-textPrimary'
              }`}
            >
              Cek Anti-Bentrok
            </button>
            <button
              type="button"
              onClick={() => setActiveDemoTab('ai')}
              className={`flex-1 py-2 text-[13px] font-bold rounded-xl transition-all ${
                activeDemoTab === 'ai'
                  ? 'bg-ios-surface text-ios-textPrimary shadow-sm'
                  : 'text-ios-textSecondary hover:text-ios-textPrimary'
              }`}
            >
              Asisten AI Aiko
            </button>
          </div>

          {/* TAB 1: SCAN DEMO */}
          {activeDemoTab === 'scan' && (
            <div className="space-y-4 text-center max-w-md mx-auto py-2">
              <div className="w-24 h-24 rounded-3xl bg-ios-surfaceSecondary border-2 border-dashed border-ios-border flex items-center justify-center mx-auto relative overflow-hidden">
                {scanStatus === 'scanning' ? (
                  <div className="w-full h-1 bg-ios-accent animate-pulse shadow-glow absolute top-1/2 -translate-y-1/2" />
                ) : scanStatus === 'success' ? (
                  <CheckCircle2 className="w-10 h-10 text-ios-success animate-in zoom-in" />
                ) : (
                  <Camera className="w-8 h-8 text-ios-textSecondary" />
                )}
              </div>

              <div>
                <h4 className="text-[16px] font-bold text-ios-textPrimary">
                  {scanStatus === 'scanning'
                    ? 'Memindai Biometrik Wajah...'
                    : scanStatus === 'success'
                    ? 'Presensi Berhasil Terverifikasi!'
                    : 'Uji Pindaian Kamera'}
                </h4>
                <p className="text-[12.5px] text-ios-textSecondary mt-1">
                  {scanStatus === 'success'
                    ? 'Kondisi: Wajah Dikenali (99.4%) • Busana Berkerah Valid • Lokasi: R201'
                    : 'Simulasi deteksi kesiapan pakaian rapi dan identitas mahasiswa saat masuk kuliah.'}
                </p>
              </div>

              <Button
                variant={scanStatus === 'success' ? 'secondary' : 'primary'}
                size="sm"
                onClick={handleTriggerDemoScan}
                isLoading={scanStatus === 'scanning'}
                className="font-bold"
              >
                <UserCheck className="w-4 h-4 mr-1.5" />
                <span>{scanStatus === 'success' ? 'Uji Scan Ulang' : 'Mulai Simulasi Scan'}</span>
              </Button>
            </div>
          )}

          {/* TAB 2: CLASH DEMO */}
          {activeDemoTab === 'jadwal' && (
            <div className="space-y-4 max-w-md mx-auto py-2 text-center">
              <p className="text-[13px] text-ios-textSecondary">
                Pilih skenario jadwal untuk melihat respons sistem deteksi anti-bentrok:
              </p>

              <div className="flex justify-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleTestClash(false)}
                  className="text-[12.5px] font-bold"
                >
                  Uji Jadwal Terpisah (Aman)
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleTestClash(true)}
                  className="text-[12.5px] font-bold text-rose-500 hover:text-rose-600"
                >
                  Uji Jam Bertabrakan (Bentrok)
                </Button>
              </div>

              {clashResult === 'safe' && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[13px] text-left animate-in fade-in space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Jadwal Tersedia & Aman</span>
                  </div>
                  <p className="text-[12px] opacity-90">
                    Mata kuliah A (08:30 - 10:30) dan B (10:45 - 12:45) tidak saling bertumpukan. Disimpan ke jadwal!
                  </p>
                </div>
              )}

              {clashResult === 'clash' && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-[13px] text-left animate-in fade-in space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Peringatan: Jadwal Bentrok Terdeteksi!</span>
                  </div>
                  <p className="text-[12px] opacity-90">
                    Jadwal bertabrakan dengan kelas lain pada pukul 09:00 - 11:00. Sistem mencegah pendaftaran tumpang-tindih.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AI CHAT DEMO */}
          {activeDemoTab === 'ai' && (
            <div className="space-y-4 max-w-md mx-auto py-2">
              <p className="text-[12.5px] text-ios-textSecondary text-center">
                Pilih pertanyaan contoh untuk melihat respons asisten Aiko:
              </p>

              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => handleAskDemoAi('Apa deadline tugas terdekat saya?')}
                  className="px-3 py-1.5 rounded-xl bg-ios-surfaceSecondary border border-ios-border text-[12px] font-semibold text-ios-textPrimary hover:border-ios-accent transition-colors"
                >
                  Deadline tugas terdekat?
                </button>
                <button
                  type="button"
                  onClick={() => handleAskDemoAi('Berapa sesi kuliah hari ini?')}
                  className="px-3 py-1.5 rounded-xl bg-ios-surfaceSecondary border border-ios-border text-[12px] font-semibold text-ios-textPrimary hover:border-ios-accent transition-colors"
                >
                  Jadwal kuliah hari ini?
                </button>
                <button
                  type="button"
                  onClick={() => handleAskDemoAi('Bagaimana tips pertahankan target IPK?')}
                  className="px-3 py-1.5 rounded-xl bg-ios-surfaceSecondary border border-ios-border text-[12px] font-semibold text-ios-textPrimary hover:border-ios-accent transition-colors"
                >
                  Tips target IPK?
                </button>
              </div>

              {aiChatResponse && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-transparent border border-blue-500/25 space-y-2 text-left animate-in fade-in">
                  <div className="flex items-center gap-1.5 text-[12px] font-bold text-blue-500">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Aiko Asisten AI (Demo Gemini 2.5)</span>
                  </div>
                  <p className="text-[13px] text-ios-textPrimary leading-relaxed">
                    {aiChatResponse}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 7. PRICING SECTION */}
      <section id="harga" className="py-20 px-4 bg-ios-surfaceSecondary/40 border-y border-ios-border">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-lg mx-auto space-y-2">
            <span className="text-[12px] font-bold text-ios-accent uppercase tracking-widest">
              Pilihan Paket
            </span>
            <h2 className="text-[32px] sm:text-[38px] font-black tracking-tight text-ios-textPrimary">
              Harga Transparan untuk Mahasiswa
            </h2>
            <p className="text-[14.5px] text-ios-textSecondary">
              Mulai gratis sekarang. Semua fitur inti tersedia tanpa biaya tersembunyi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free Tier */}
            <div className="p-8 rounded-3xl bg-ios-surface border border-ios-border shadow-sm space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <span className="text-[12px] font-bold text-ios-accent uppercase tracking-wider block">
                    Paket Utama
                  </span>
                  <h3 className="text-[22px] font-black text-ios-textPrimary mt-1">
                    Mahasiswa Aktif
                  </h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-[36px] font-black text-ios-textPrimary">Rp 0</span>
                    <span className="text-[13px] text-ios-textSecondary font-medium">/ selamanya</span>
                  </div>
                  <p className="text-[13px] text-ios-textSecondary mt-2">
                    Akses lengkap seluruh kebutuhan kuliah harian Anda tanpa batasan waktu.
                  </p>
                </div>

                <div className="space-y-2.5 pt-3 border-t border-ios-border text-[13px] text-ios-textPrimary">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-ios-success flex-shrink-0" />
                    <span>Jadwal Kuliah Anti-Bentrok</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-ios-success flex-shrink-0" />
                    <span>Presensi Biometrik Wajah Harian</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-ios-success flex-shrink-0" />
                    <span>Pelacak Tugas & Hitung Mundur Deadline</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-ios-success flex-shrink-0" />
                    <span>Asisten AI Aiko (Teks & Jadwal)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-ios-success flex-shrink-0" />
                    <span>PWA Mobile App (Android & iOS)</span>
                  </div>
                </div>
              </div>

              <Link href="/signup">
                <Button variant="primary" className="w-full font-bold shadow-sm mt-6">
                  Daftar Akun Gratis Sekarang
                </Button>
              </Link>
            </div>

            {/* Pro Campus Tier */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-ios-surface to-ios-surfaceSecondary border-2 border-ios-accent/50 shadow-lg space-y-6 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-3 right-3">
                <span className="text-[10.5px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-ios-accent text-white shadow-sm">
                  Fitur Sultan
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[12px] font-bold text-ios-accent uppercase tracking-wider block">
                    Paket Prioritas
                  </span>
                  <h3 className="text-[22px] font-black text-ios-textPrimary mt-1">
                    Pro Campus
                  </h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-[36px] font-black text-ios-textPrimary">Rp 19.000</span>
                    <span className="text-[13px] text-ios-textSecondary font-medium">/ semester</span>
                  </div>
                  <p className="text-[13px] text-ios-textSecondary mt-2">
                    Tingkat produktivitas maksimal dengan AI tanpa batas dan live voice 3D.
                  </p>
                </div>

                <div className="space-y-2.5 pt-3 border-t border-ios-border text-[13px] text-ios-textPrimary">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-ios-accent flex-shrink-0" />
                    <span>Semua fitur paket Mahasiswa Aktif</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-ios-accent flex-shrink-0" />
                    <span>Unlimited AI Gemini 2.5 Flash</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-ios-accent flex-shrink-0" />
                    <span>Live Voice Duplex & Avatar 3D</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-ios-accent flex-shrink-0" />
                    <span>Export Transkrip KHS Resmi ke PDF</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-ios-accent flex-shrink-0" />
                    <span>Dukungan Prioritas Komunitas</span>
                  </div>
                </div>
              </div>

              <Link href="/signup">
                <Button variant="secondary" className="w-full font-bold border-ios-accent/30 mt-6">
                  Gabung Waitlist Pro
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS (SOCIAL PROOF) */}
      <section className="py-20 px-4 max-w-6xl mx-auto space-y-12">
        <div className="text-center max-w-md mx-auto space-y-2">
          <span className="text-[12px] font-bold text-ios-accent uppercase tracking-widest">
            Cerita Pengguna
          </span>
          <h2 className="text-[32px] sm:text-[38px] font-black tracking-tight text-ios-textPrimary">
            Dipercaya Mahasiswa
          </h2>
          <p className="text-[14.5px] text-ios-textSecondary">
            // TODO: Menggunakan data representatif, akan diperbarui dengan testimoni pengguna langsung.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-3xl bg-ios-surface border border-ios-border shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-600 font-bold flex items-center justify-center text-[14px]">
                RA
              </div>
              <div>
                <h5 className="text-[14px] font-bold text-ios-textPrimary">Rian Ardiansyah</h5>
                <p className="text-[11px] text-ios-textSecondary">Teknik Informatika • Semester 5</p>
              </div>
            </div>
            <p className="text-[13px] text-ios-textSecondary leading-relaxed">
              &quot;Fitur anti-bentroknya sangat membantu saat KRS-an. Saya tidak perlu lagi cek excel manual untuk memastikan jam praktikum dan teori tidak tabrakan.&quot;
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-ios-surface border border-ios-border shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-600 font-bold flex items-center justify-center text-[14px]">
                SN
              </div>
              <div>
                <h5 className="text-[14px] font-bold text-ios-textPrimary">Siti Nurhaliza</h5>
                <p className="text-[11px] text-ios-textSecondary">Sistem Informasi • Semester 3</p>
              </div>
            </div>
            <p className="text-[13px] text-ios-textSecondary leading-relaxed">
              &quot;Presensi foto dengan deteksi busana rapi bikin bukti kehadiran kuliah jadi teratur. Tampilannya di iPhone dan laptop juga sangat rapi seperti aplikasi bawaan Apple.&quot;
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-ios-surface border border-ios-border shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-600 font-bold flex items-center justify-center text-[14px]">
                DF
              </div>
              <div>
                <h5 className="text-[14px] font-bold text-ios-textPrimary">Daffa Fauzan</h5>
                <p className="text-[11px] text-ios-textSecondary">Teknik Telekomunikasi • Semester 7</p>
              </div>
            </div>
            <p className="text-[13px] text-ios-textSecondary leading-relaxed">
              &quot;Forecasting nilainya akurat banget! Saya jadi tahu persis minimal nilai UTS yang harus didapat biar mata kuliah proyek akhir tetap dapat nilai A.&quot;
            </p>
          </div>
        </div>
      </section>

      {/* 9. FAQ ACCORDION */}
      <section id="faq" className="py-20 px-4 bg-ios-surfaceSecondary/40 border-y border-ios-border">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[12px] font-bold text-ios-accent uppercase tracking-widest">
              Pertanyaan Umum
            </span>
            <h2 className="text-[32px] sm:text-[38px] font-black tracking-tight text-ios-textPrimary">
              Kerap Ditanyakan (FAQ)
            </h2>
            <p className="text-[14.5px] text-ios-textSecondary">
              Jawaban seputar keamanan, fitur, dan akses perangkat Anda.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'Apakah Semestr benar-benar gratis untuk mahasiswa?',
                a: 'Ya, seluruh fungsi inti (jadwal anti-bentrok, presensi biometrik, pelacak tugas, dan akses asisten AI) dapat digunakan secara gratis tanpa biaya berlangganan.',
              },
              {
                q: 'Bagaimana keamanan data foto wajah saya?',
                a: 'Data presensi Anda dilindungi dengan enkripsi transit TLS/SSL dan disimpan pada database cloud terisolasi. Foto presensi hanya digunakan untuk catatan kehadiran pribadi Anda dan tidak pernah dibagikan ke pihak ketiga.',
              },
              {
                q: 'Apakah bisa diakses lewat HP Android dan iPhone?',
                a: 'Bisa! Semestr dirancang dengan arsitektur responsif dual-mode. Saat dibuka di laptop/MacBook tampil sebagai SaaS CMS lengkap, dan saat dibuka di HP berubah otomatis menjadi web app dengan navigasi ramah jempol. Anda juga bisa menambahkannya ke Home Screen via PWA.',
              },
              {
                q: 'Apakah bisa dipakai untuk mahasiswa dari universitas mana saja?',
                a: 'Tentu saja! Semestr mendukung sistem perkuliahan multi-kampus di Indonesia dengan fleksibilitas pengaturan jadwal, SKS, dan indeks nilai (A, AB, B, BC, C, D, E).',
              },
              {
                q: 'Apakah asisten AI bisa diajak ngobrol lewat suara?',
                a: 'Ya, tersedia mode Live Voice Duplex (Speech-to-Text & Text-to-Speech) dengan avatar 3D yang memungkinkan Anda berdiskusi jadwal dan tugas secara langsung melalui mikrofon perangkat.',
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-ios-surface border border-ios-border overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-[15px] text-ios-textPrimary"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-ios-textSecondary flex-shrink-0 transition-transform duration-200 ${
                      openFaq === idx ? 'rotate-180 text-ios-accent' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-[13.5px] text-ios-textSecondary leading-relaxed border-t border-ios-border/40 pt-3 animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. FINAL HIGH-IMPACT CTA */}
      <section className="py-20 px-4 max-w-5xl mx-auto">
        <div className="rounded-3xl p-8 sm:p-14 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white shadow-2xl relative overflow-hidden text-center space-y-6">
          <div className="space-y-3 relative z-10">
            <span className="text-[12px] font-extrabold tracking-widest uppercase text-blue-200">
              Bergabung Sekarang
            </span>
            <h2 className="text-[34px] sm:text-[46px] font-black tracking-tight leading-tight max-w-2xl mx-auto">
              Siap Memulai Semester yang Lebih Rapi & Terencana?
            </h2>
            <p className="text-[15px] sm:text-[17px] text-blue-100/90 max-w-xl mx-auto font-normal">
              Daftar gratis dalam 30 detik. Kelola seluruh perkuliahan Anda dalam satu ekosistem cerdas.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap justify-center gap-3.5 relative z-10">
            <Link href="/signup">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-blue-700 hover:bg-white/90 font-black px-8 text-[15px] rounded-2xl h-12 shadow-md"
              >
                <span>Daftar Akun Gratis Sekarang</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 11. FOOTER (CLEAN, COMMERCIAL & SUBTLE CREATOR ATTRIBUTION) */}
      <footer className="py-12 px-4 border-t border-ios-border bg-ios-surface text-[13px] text-ios-textSecondary">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-xl bg-ios-surfaceSecondary border border-ios-border">
                <MascotIcon size={22} />
              </div>
              <span className="font-black text-[17px] text-ios-textPrimary tracking-tight">
                Semestr
              </span>
            </div>
            <p className="text-[13px] text-ios-textSecondary max-w-sm leading-relaxed">
              Academic OS & Daily Companion berstandar komersial untuk mahasiswa modern. Dirancang dengan presisi sekelas antarmuka Apple iOS.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-ios-textPrimary text-[13px]">Produk</h5>
            <ul className="space-y-1.5 text-[12.5px]">
              <li>
                <a href="#fitur" className="hover:text-ios-textPrimary transition-colors">
                  Fitur Unggulan
                </a>
              </li>
              <li>
                <a href="#demo" className="hover:text-ios-textPrimary transition-colors">
                  Simulasi Demo
                </a>
              </li>
              <li>
                <a href="#harga" className="hover:text-ios-textPrimary transition-colors">
                  Paket & Harga
                </a>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-ios-textPrimary transition-colors">
                  Portal Mahasiswa
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-ios-textPrimary text-[13px]">Legal & Privasi</h5>
            <ul className="space-y-1.5 text-[12.5px]">
              <li>
                <Link href="/privacy" className="hover:text-ios-textPrimary transition-colors">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-ios-textPrimary transition-colors">
                  Syarat & Ketentuan
                </Link>
              </li>
              <li>
                <a
                  href="https://yossikaputra.my.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-ios-textPrimary transition-colors inline-flex items-center gap-1"
                >
                  <span>Kontak Pengembang</span>
                  <ExternalLink className="w-3 h-3 text-ios-accent" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-6 border-t border-ios-border flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px]">
          <p>&copy; 2026 Semestr. Seluruh hak cipta dilindungi.</p>

          {/* Discreet, elegant creator badge as requested */}
          <p className="text-ios-textSecondary/80 text-[11.5px]">
            Dibuat dengan dedikasi oleh{' '}
            <a
              href="https://yossikaputra.my.id"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-ios-textPrimary hover:text-ios-accent transition-colors underline decoration-dotted"
            >
              Yossika Putra
            </a>{' '}
            — Software Engineer
          </p>
        </div>
      </footer>

      {/* Interactive Logout Success Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-ios-surface border border-ios-border p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-blue-500/15 text-ios-accent flex items-center justify-center mx-auto shadow-inner">
              <LogOut className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-[20px] font-bold text-ios-textPrimary">
                Anda Telah Berhasil Keluar
              </h3>
              <p className="text-[13.5px] text-ios-textSecondary leading-relaxed">
                Sesi autentikasi Anda telah berakhir dengan aman. Untuk mengakses dashboard portal mahasiswa kembali, silakan masuk dengan email dan kata sandi Anda.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <Button
                variant="secondary"
                className="flex-1 font-semibold text-[13px]"
                onClick={() => setShowLogoutModal(false)}
              >
                Tutup
              </Button>
              <Link href="/login" className="flex-1">
                <Button
                  variant="primary"
                  className="w-full font-bold text-[13px] shadow-sm shadow-blue-500/25"
                >
                  <span>Masuk Kembali</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

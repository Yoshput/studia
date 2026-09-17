'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  RefreshCw,
  Zap,
  Bell,
  Download,
  Smartphone,
  Laptop,
  Target,
  BarChart3,
  HelpCircle,
  Flame,
  Globe,
  Sliders,
  Award,
  BookOpen,
} from 'lucide-react';
import gsap from 'gsap';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // 1. HERO WORKSPACE INTERACTIVE TABS
  const [activeTab, setActiveTab] = useState<'presensi' | 'bentrok' | 'nilai' | 'aiko'>('presensi');

  // Interactive Presensi State
  const [presensiMode, setPresensiMode] = useState<'online' | 'offline'>('online');
  const [presensiCaptured, setPresensiCaptured] = useState(false);
  const [presensiScanning, setPresensiScanning] = useState(false);

  // Interactive Bentrok State
  const [clashResolved, setClashResolved] = useState(false);

  // Interactive Nilai / IPS Simulator State
  const [quizScore, setQuizScore] = useState(85);
  const [tugasScore, setTugasScore] = useState(92);
  const [utsScore, setUtsScore] = useState(84);
  const [uasScore, setUasScore] = useState(90);

  // Interactive AI Assistant State
  const [aiChatPrompt, setAiChatPrompt] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiTyping, setIsAiTyping] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Real-time clock for simulator
  const [simTime, setSimTime] = useState('08:29:45');
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setSimTime(now.toTimeString().split(' ')[0]);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check for logout redirect parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('logged_out') === '1') {
        setShowLogoutModal(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // Sticky blur navbar scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // GSAP subtle entrance animations
  useEffect(() => {
    gsap.fromTo(
      '.hero-fade',
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.08, duration: 0.75, ease: 'power3.out' }
    );
  }, []);

  // Calculated GPA score in real time
  const calculatedGrade = useMemo(() => {
    const total = quizScore * 0.15 + tugasScore * 0.2 + utsScore * 0.3 + uasScore * 0.35;
    let huruf = 'A';
    let bobot = 4.0;
    let color = 'text-emerald-500';
    let label = 'Sangat Memuaskan (Cumlaude Track)';

    if (total >= 80) {
      huruf = 'A';
      bobot = 4.0;
      color = 'text-emerald-500';
      label = 'Sangat Memuaskan';
    } else if (total >= 75) {
      huruf = 'AB';
      bobot = 3.5;
      color = 'text-teal-400';
      label = 'Pujian Tinggi';
    } else if (total >= 70) {
      huruf = 'B';
      bobot = 3.0;
      color = 'text-sky-400';
      label = 'Memuaskan';
    } else if (total >= 60) {
      huruf = 'BC';
      bobot = 2.5;
      color = 'text-amber-400';
      label = 'Cukup Baik';
    } else {
      huruf = 'C';
      bobot = 2.0;
      color = 'text-rose-400';
      label = 'Perlu Perbaikan';
    }

    return { total: Math.round(total * 10) / 10, huruf, bobot, color, label };
  }, [quizScore, tugasScore, utsScore, uasScore]);

  // Handle Presensi simulation capture
  const handleTriggerPresensi = () => {
    setPresensiScanning(true);
    setTimeout(() => {
      setPresensiScanning(false);
      setPresensiCaptured(true);
    }, 1400);
  };

  // Handle Ask Aiko interactive prompt
  const handleAskAiko = (prompt: string) => {
    setAiChatPrompt(prompt);
    setIsAiTyping(true);
    setAiResponse(null);

    setTimeout(() => {
      setIsAiTyping(false);
      if (prompt.includes('deadline')) {
        setAiResponse(
          '🚨 Ada 1 tugas mendesak: Proyek Jaringan Komputer (Deadline besok 23:59 WIB, Prioritas Tinggi). Materi bab subnetting sudah tersimpan di ruang belajarmu!'
        );
      } else if (prompt.includes('jadwal')) {
        setAiResponse(
          '📅 Hari ini ada 2 sesi kuliah: Jaringan Komputer (08:30 di Lab 2) dan Pemrograman Web (13:30 Daring via Zoom). Presensi siap diverifikasi!'
        );
      } else {
        setAiResponse(
          '🎯 Untuk mengamankan nilai A di mata kuliah ini, target minimal UAS adalah 82. Pertahankan kebiasaan hadir tepat waktu ya!'
        );
      }
    }, 850);
  };

  return (
    <div className="min-h-screen bg-ios-bg text-ios-textPrimary selection:bg-emerald-500/20 selection:text-emerald-500 transition-colors duration-200 overflow-x-hidden font-sans">
      {/* LOGOUT FEEDBACK MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-ios-surface border border-ios-border p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
              <LogOut className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-ios-textPrimary">Berhasil Keluar</h3>
              <p className="text-[13px] text-ios-textSecondary mt-1">
                Sesi akun Anda telah ditutup dengan aman. Seluruh data perkuliahan tetap tersinkronisasi di cloud.
              </p>
            </div>
            <Button
              variant="primary"
              className="w-full font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl h-11"
              onClick={() => setShowLogoutModal(false)}
            >
              Tutup
            </Button>
          </div>
        </div>
      )}

      {/* 1. ULTRA-SLEEK GLASS NAVBAR */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'glass-nav border-b border-ios-border/80 shadow-sm py-3'
            : 'bg-transparent py-4 sm:py-5'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Brand Logo & Version Pill */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-1.5 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 group-hover:scale-105 transition-transform shadow-sm">
              <MascotIcon size={24} />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[19px] tracking-tight text-ios-textPrimary group-hover:text-emerald-500 transition-colors">
                Semestr
              </span>
              <span className="hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 tracking-wider uppercase">
                v2.0 OS
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-[13.5px] font-medium text-ios-textSecondary">
            <a href="#simulator" className="hover:text-emerald-500 transition-colors">
              Simulasi Langsung
            </a>
            <a href="#keunggulan" className="hover:text-emerald-500 transition-colors">
              Keunggulan
            </a>
            <a href="#perbandingan" className="hover:text-emerald-500 transition-colors">
              Mengapa Semestr?
            </a>
            <a href="#faq" className="hover:text-emerald-500 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-semibold text-[13px] hover:text-emerald-500">
                Masuk
              </Button>
            </Link>

            <Link href="/signup">
              <Button
                variant="primary"
                size="sm"
                className="font-bold text-[13px] px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-500/20 border border-emerald-400/30 gap-1.5"
              >
                <span>Daftar Gratis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-ios-surface border border-ios-border text-ios-textPrimary"
              aria-label="Buka Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-3 pb-6 bg-ios-surface/95 backdrop-blur-xl border-b border-ios-border shadow-2xl space-y-4 animate-in slide-in-from-top-4 duration-200">
            <nav className="flex flex-col space-y-2.5 text-[14px] font-semibold text-ios-textSecondary">
              <a
                href="#simulator"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-500"
              >
                Simulasi Interaktif
              </a>
              <a
                href="#keunggulan"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-500"
              >
                Fitur Unggulan
              </a>
              <a
                href="#perbandingan"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-500"
              >
                Perbandingan Sistem
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-500"
              >
                Tanya Jawab (FAQ)
              </a>
            </nav>

            <div className="pt-3 border-t border-ios-border flex flex-col gap-2.5">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="secondary" className="w-full font-semibold rounded-xl">
                  Masuk ke Akun
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="primary"
                  className="w-full font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md"
                >
                  Daftar Akun Baru (Gratis)
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION (KINETIC, VIBRANT EMERALD & CYAN) */}
      <section className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 px-4 overflow-hidden">
        {/* Glow ambient background mesh */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[400px] bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-cyan-500/15 blur-[140px] pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto text-center space-y-6">
          {/* Badge Pill */}
          <div className="hero-fade inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-ios-surface border border-emerald-500/30 shadow-sm shadow-emerald-500/10">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[12.5px] font-bold text-emerald-600 dark:text-emerald-400">
              Semestr 2.0 • The Next-Gen Academic Operating System
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="hero-fade text-[38px] sm:text-[60px] lg:text-[68px] font-black tracking-tight leading-[1.08] text-ios-textPrimary max-w-4xl mx-auto">
            Bukan Sekadar Catatan.{' '}
            <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 bg-clip-text text-transparent">
              Ini OS Akademik Cerdas Kuliah Anda.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="hero-fade text-[16px] sm:text-[19px] text-ios-textSecondary max-w-2xl mx-auto leading-relaxed font-normal">
            Bebas dari jadwal bentrok, deadline dadakan, dan presensi rumit.
            Dilengkapi pemindai wajah cerdas anti-mirror, kalkulator nilai IPS real-time, serta asisten AI 24/7.
          </p>

          {/* CTA Buttons */}
          <div className="hero-fade pt-2 flex flex-wrap items-center justify-center gap-3.5">
            <Link href="/signup">
              <Button
                variant="primary"
                size="lg"
                className="font-bold px-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 text-[15px] gap-2 rounded-2xl h-12 border border-emerald-400/30 transition-all active:scale-95"
              >
                <span>Mulai Coba Gratis Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <a href="#simulator">
              <Button
                variant="secondary"
                size="lg"
                className="font-semibold px-6 text-[15px] gap-2 rounded-2xl h-12 border-ios-border bg-ios-surface hover:bg-ios-surfaceSecondary hover:border-emerald-500/40 transition-all"
              >
                <Play className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
                <span>Uji Simulasi Langsung</span>
              </Button>
            </a>
          </div>

          {/* Trust Guarantees */}
          <div className="hero-fade flex flex-wrap items-center justify-center gap-6 pt-3 text-[12px] text-ios-textSecondary font-medium">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" /> 100% Gratis & Bebas Iklan
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" /> Multi-Tenant Isolasi Akun Murni
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" /> Installable PWA di iPhone & Android
            </span>
          </div>

          {/* 3. INTERACTIVE LIVE WORKSPACE SHOWCASE (THE SHOWSTOPPER) */}
          <div id="simulator" className="hero-fade pt-8 max-w-4xl mx-auto scroll-mt-24">
            <div className="rounded-3xl p-3 sm:p-5 bg-ios-surface border border-emerald-500/25 shadow-2xl relative overflow-hidden text-left glow-emerald">
              {/* Top Chrome Window Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-ios-border gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                  <span className="ml-2 text-[12px] font-mono font-semibold text-ios-textSecondary">
                    semestr.app/live-preview
                  </span>
                </div>

                {/* Real-time interactive tab switcher */}
                <div className="flex items-center p-1 rounded-2xl bg-ios-surfaceSecondary border border-ios-border text-[12px] font-semibold overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab('presensi')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                      activeTab === 'presensi'
                        ? 'bg-emerald-600 text-white shadow-sm font-bold'
                        : 'text-ios-textSecondary hover:text-ios-textPrimary'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Presensi Wajah</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('bentrok')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                      activeTab === 'bentrok'
                        ? 'bg-emerald-600 text-white shadow-sm font-bold'
                        : 'text-ios-textSecondary hover:text-ios-textPrimary'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Anti-Bentrok</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('nilai')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                      activeTab === 'nilai'
                        ? 'bg-emerald-600 text-white shadow-sm font-bold'
                        : 'text-ios-textSecondary hover:text-ios-textPrimary'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Kalkulator IPS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('aiko')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                      activeTab === 'aiko'
                        ? 'bg-emerald-600 text-white shadow-sm font-bold'
                        : 'text-ios-textSecondary hover:text-ios-textPrimary'
                    }`}
                  >
                    <BrainCircuit className="w-3.5 h-3.5" />
                    <span>Aiko AI 24/7</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: PRESENSI BIOMETRIK INTERACTIVE SIMULATOR */}
              {activeTab === 'presensi' && (
                <div className="space-y-4 p-2 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-[16px] font-bold text-ios-textPrimary flex items-center gap-2">
                        <span>Pemindai Presensi Wajah Cerdas (Anti-Mirror)</span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          LIVE SIMULATION
                        </span>
                      </h4>
                      <p className="text-[12.5px] text-ios-textSecondary">
                        Teks di pakaian terbaca normal lurus. Foto langsung diverifikasi bersama timestamp resmi.
                      </p>
                    </div>

                    {/* Mode Online/Offline Pill Switcher */}
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-ios-surfaceSecondary border border-ios-border text-[12px] font-semibold">
                      <button
                        type="button"
                        onClick={() => {
                          setPresensiMode('online');
                          setPresensiCaptured(false);
                        }}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          presensiMode === 'online'
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30'
                            : 'text-ios-textSecondary'
                        }`}
                      >
                        🌐 Daring (Zoom)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPresensiMode('offline');
                          setPresensiCaptured(false);
                        }}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          presensiMode === 'offline'
                            ? 'bg-teal-500/20 text-teal-600 dark:text-teal-400 font-bold border border-teal-500/30'
                            : 'text-ios-textSecondary'
                        }`}
                      >
                        🏫 Tatap Muka (Lab)
                      </button>
                    </div>
                  </div>

                  {/* Camera Scanner Mock Frame */}
                  <div className="relative w-full h-[270px] sm:h-[300px] rounded-2xl bg-slate-900 border border-emerald-500/30 overflow-hidden flex flex-col items-center justify-center text-white">
                    {/* Background Grid Pattern */}
                    <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />

                    {/* Moving Laser Scan Line */}
                    {!presensiCaptured && (
                      <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-laser z-20" />
                    )}

                    {/* Face Target Frame with HUD Brackets */}
                    <div className="relative w-40 h-44 rounded-2xl border-2 border-dashed border-emerald-400/70 flex flex-col items-center justify-center p-3 z-10 transition-all">
                      {/* Corner Brackets */}
                      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />

                      {presensiScanning ? (
                        <div className="text-center space-y-2 animate-pulse">
                          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
                          <span className="text-[11px] font-bold text-emerald-300">
                            Memverifikasi Wajah...
                          </span>
                        </div>
                      ) : presensiCaptured ? (
                        <div className="text-center space-y-1.5 animate-in zoom-in-95">
                          <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/50">
                            <Check className="w-6 h-6 stroke-[3]" />
                          </div>
                          <span className="text-[12px] font-extrabold text-emerald-400 block">
                            Hadir Terverifikasi
                          </span>
                          <span className="text-[10px] text-slate-300 block">
                            Busana Rapi & Tepat Waktu
                          </span>
                        </div>
                      ) : (
                        <div className="text-center space-y-1">
                          <UserCheck className="w-8 h-8 text-emerald-400/80 mx-auto" />
                          <span className="text-[11px] font-semibold text-slate-300 block">
                            Arahkan Wajah ke Bingkai
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Live Dynamic Watermark Banner */}
                    <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 flex items-center justify-between text-[11px] font-mono z-20">
                      <div>
                        <span className="text-emerald-400 font-bold block">
                          [PRESENSI SEMESTR] • {presensiMode === 'online' ? 'KULIAH ONLINE (DARING)' : 'KULIAH TATAP MUKA (LAB 2)'}
                        </span>
                        <span className="text-slate-300 text-[10px]">
                          Mahasiswa: Arthur Zevallent • NIM: 102092430009
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-white font-bold block">{simTime} WIB</span>
                        <span className="text-emerald-400 text-[10px] font-semibold">● GPS Kampus Valid</span>
                      </div>
                    </div>
                  </div>

                  {/* Simulator Control Action */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[12px] text-ios-textSecondary">
                      {presensiCaptured
                        ? '✅ Presensi tersimpan di riwayat dengan foto berorientasi normal lurus.'
                        : 'Klik tombol untuk menguji respon kecerdasan pemindai wajah.'}
                    </span>

                    <div className="flex items-center gap-2">
                      {presensiCaptured && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => setPresensiCaptured(false)}
                          className="text-[12px] h-9"
                        >
                          Ulangi
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        disabled={presensiScanning || presensiCaptured}
                        onClick={handleTriggerPresensi}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[12.5px] h-9 px-4 rounded-xl gap-1.5 shadow-md shadow-emerald-500/20"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>{presensiScanning ? 'Memindai...' : 'Ambil Snapshot Presensi'}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: DETEKSI JADWAL BENTROK INTERACTIVE SIMULATOR */}
              {activeTab === 'bentrok' && (
                <div className="space-y-4 p-2 animate-in fade-in zoom-in-95 duration-200">
                  <div>
                    <h4 className="text-[16px] font-bold text-ios-textPrimary flex items-center gap-2">
                      <span>Radar Deteksi Tabrakan Jadwal Otomatis</span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        SMART CONFLICT ENGINE
                      </span>
                    </h4>
                    <p className="text-[12.5px] text-ios-textSecondary">
                      Mencegah Anda mengambil dua kelas di jam atau ruangan yang sama sebelum semester dimulai.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Course Card 1 */}
                    <div className="p-4 rounded-2xl bg-ios-surfaceSecondary border border-ios-border space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                          IF2024 • 3 SKS
                        </span>
                        <span className="text-[11px] font-mono text-ios-textSecondary font-semibold">Senin</span>
                      </div>
                      <h5 className="font-bold text-[15px] text-ios-textPrimary">Jaringan Komputer</h5>
                      <div className="text-[12px] text-ios-textSecondary space-y-1">
                        <p className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-500" /> 08:30 - 11:30 WIB
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-emerald-500" /> Lab Komputer 2 (Offline)
                        </p>
                      </div>
                    </div>

                    {/* Course Card 2 (Colliding or Resolved) */}
                    <div
                      className={`p-4 rounded-2xl border transition-all duration-300 space-y-2 ${
                        clashResolved
                          ? 'bg-emerald-500/5 border-emerald-500/40'
                          : 'bg-rose-500/10 border-rose-500/40 animate-pulse'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                            clashResolved
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                              : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30'
                          }`}
                        >
                          IF2025 • 3 SKS
                        </span>
                        <span className="text-[11px] font-mono text-ios-textSecondary font-semibold">Senin</span>
                      </div>
                      <h5 className="font-bold text-[15px] text-ios-textPrimary">Algoritma & Struktur Data</h5>
                      <div className="text-[12px] text-ios-textSecondary space-y-1">
                        <p
                          className={`flex items-center gap-1.5 font-bold ${
                            clashResolved ? 'text-emerald-500' : 'text-rose-500'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          {clashResolved ? '13:30 - 16:30 WIB (Slot Aman)' : '09:00 - 12:00 WIB (BENTROK!)'}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-ios-textSecondary" />
                          {clashResolved ? 'Ruang R204 (Slot Kosong)' : 'Lab Komputer 2 (Ruang Terisi)'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Conflict resolution action banner */}
                  <div
                    className={`p-3 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-[12.5px] transition-colors ${
                      clashResolved
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-medium">
                      {clashResolved ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                          <span>Jadwal kuliah bebas tabrakan waktu. Anda dapat menghadiri kedua kelas tanpa kendala.</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                          <span>
                            Peringatan: Jadwal bentrok 2.5 jam di Lab Komputer 2. Sistem memblokir penyimpanan ganda.
                          </span>
                        </>
                      )}
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setClashResolved(!clashResolved)}
                      className={`font-bold whitespace-nowrap rounded-xl text-[12px] h-9 ${
                        clashResolved
                          ? 'bg-ios-surfaceSecondary text-ios-textPrimary border border-ios-border'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                      }`}
                    >
                      {clashResolved ? 'Simulasikan Bentrok Kembali' : '✨ Auto-Geser ke Slot Kosong'}
                    </Button>
                  </div>
                </div>
              )}

              {/* TAB 3: REAL-TIME KALKULATOR NILAI & FORECASTING IPS */}
              {activeTab === 'nilai' && (
                <div className="space-y-4 p-2 animate-in fade-in zoom-in-95 duration-200">
                  <div>
                    <h4 className="text-[16px] font-bold text-ios-textPrimary flex items-center gap-2">
                      <span>Simulator Nilai & Target Indeks Prestasi Semester (IPS)</span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        REAL-TIME MATH ENGINE
                      </span>
                    </h4>
                    <p className="text-[12.5px] text-ios-textSecondary">
                      Geser nilai komponen tugas, quiz, UTS, dan UAS untuk melihat estimasi nilai huruf dan IPS secara seketika.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Left: Interactive Sliders */}
                    <div className="sm:col-span-2 space-y-3.5 bg-ios-surfaceSecondary p-4 rounded-2xl border border-ios-border">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[12.5px] font-semibold">
                          <span>Tugas & Praktikum (Bobot 20%)</span>
                          <span className="font-mono text-emerald-500 font-bold">{tugasScore}</span>
                        </div>
                        <input
                          type="range"
                          min="40"
                          max="100"
                          value={tugasScore}
                          onChange={(e) => setTugasScore(Number(e.target.value))}
                          className="w-full accent-emerald-500 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[12.5px] font-semibold">
                          <span>Quiz Mingguan (Bobot 15%)</span>
                          <span className="font-mono text-emerald-500 font-bold">{quizScore}</span>
                        </div>
                        <input
                          type="range"
                          min="40"
                          max="100"
                          value={quizScore}
                          onChange={(e) => setQuizScore(Number(e.target.value))}
                          className="w-full accent-emerald-500 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[12.5px] font-semibold">
                          <span>Ujian Tengah Semester / UTS (Bobot 30%)</span>
                          <span className="font-mono text-emerald-500 font-bold">{utsScore}</span>
                        </div>
                        <input
                          type="range"
                          min="40"
                          max="100"
                          value={utsScore}
                          onChange={(e) => setUtsScore(Number(e.target.value))}
                          className="w-full accent-emerald-500 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[12.5px] font-semibold">
                          <span>Ujian Akhir Semester / UAS (Bobot 35%)</span>
                          <span className="font-mono text-emerald-500 font-bold">{uasScore}</span>
                        </div>
                        <input
                          type="range"
                          min="40"
                          max="100"
                          value={uasScore}
                          onChange={(e) => setUasScore(Number(e.target.value))}
                          className="w-full accent-emerald-500 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Right: Dynamic Calculation Result Gauge */}
                    <div className="p-4 rounded-2xl bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 flex flex-col items-center justify-center text-center space-y-2">
                      <span className="text-[10.5px] uppercase font-extrabold tracking-wider text-emerald-600 dark:text-emerald-400">
                        Prediksi Nilai Akhir
                      </span>

                      <div className="w-20 h-20 rounded-full border-4 border-emerald-500 flex flex-col items-center justify-center shadow-lg shadow-emerald-500/20 bg-ios-surface">
                        <span className="text-[28px] font-black text-emerald-500 leading-none">
                          {calculatedGrade.huruf}
                        </span>
                        <span className="text-[10px] font-mono text-ios-textSecondary mt-0.5">
                          {calculatedGrade.total} / 100
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[11px] font-bold text-ios-textPrimary block">
                          Bobot SKS: {calculatedGrade.bobot.toFixed(2)}
                        </span>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                          {calculatedGrade.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: AIKO 24/7 AI COMPANION INTERACTIVE SIMULATOR */}
              {activeTab === 'aiko' && (
                <div className="space-y-4 p-2 animate-in fade-in zoom-in-95 duration-200">
                  <div>
                    <h4 className="text-[16px] font-bold text-ios-textPrimary flex items-center gap-2">
                      <span>Asisten Akademik AI "Aiko" (Suara & Teks Kontekstual)</span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        SMART TUTOR
                      </span>
                    </h4>
                    <p className="text-[12.5px] text-ios-textSecondary">
                      Memahami nama, NIM, mata kuliah aktif, serta deadline tugas Anda secara otomatis.
                    </p>
                  </div>

                  {/* Chat Container */}
                  <div className="p-4 rounded-2xl bg-ios-surfaceSecondary border border-ios-border space-y-3 min-h-[160px]">
                    {/* Aiko Welcome Message */}
                    <div className="flex items-start gap-2.5">
                      <div className="p-1 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex-shrink-0">
                        <MascotIcon size={24} />
                      </div>
                      <div className="p-3 rounded-2xl rounded-tl-sm bg-ios-surface border border-ios-border text-[13px] leading-relaxed max-w-lg shadow-sm">
                        <p className="font-semibold text-emerald-500 text-[11px] mb-0.5">Aiko Assistant</p>
                        Halo Arthur! 👋 Ada yang ingin kamu tanyakan seputar jadwal kuliah, tugas aktif, atau target nilai semester ini?
                      </div>
                    </div>

                    {/* User Prompt Message (if selected) */}
                    {aiChatPrompt && (
                      <div className="flex items-end justify-end gap-2.5">
                        <div className="p-3 rounded-2xl rounded-br-sm bg-emerald-600 text-white text-[13px] leading-relaxed max-w-sm shadow-sm font-medium">
                          {aiChatPrompt}
                        </div>
                      </div>
                    )}

                    {/* Aiko Response Message */}
                    {isAiTyping ? (
                      <div className="flex items-start gap-2.5">
                        <div className="p-1 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex-shrink-0">
                          <MascotIcon size={24} />
                        </div>
                        <div className="p-3 rounded-2xl bg-ios-surface border border-ios-border text-[12.5px] text-ios-textSecondary flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
                          <span>Aiko sedang membaca jadwal & silabus...</span>
                        </div>
                      </div>
                    ) : (
                      aiResponse && (
                        <div className="flex items-start gap-2.5 animate-in fade-in">
                          <div className="p-1 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex-shrink-0">
                            <MascotIcon size={24} />
                          </div>
                          <div className="p-3 rounded-2xl rounded-tl-sm bg-ios-surface border border-emerald-500/30 text-[13px] leading-relaxed max-w-lg shadow-sm">
                            <p className="font-semibold text-emerald-500 text-[11px] mb-0.5">Aiko Assistant</p>
                            {aiResponse}
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  {/* Interactive Quick Prompts */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11.5px] text-ios-textSecondary font-semibold">Coba Pertanyaan Cepat:</span>
                    <button
                      type="button"
                      onClick={() => handleAskAiko('Tugas apa yang paling mendesak minggu ini?')}
                      className="px-3 py-1.5 rounded-xl bg-ios-surface hover:bg-emerald-500/10 border border-ios-border hover:border-emerald-500/40 text-[12px] text-ios-textPrimary transition-colors font-medium shadow-sm"
                    >
                      ⏰ Deadline Terdekat?
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAskAiko('Ada jadwal kuliah apa saja hari ini?')}
                      className="px-3 py-1.5 rounded-xl bg-ios-surface hover:bg-emerald-500/10 border border-ios-border hover:border-emerald-500/40 text-[12px] text-ios-textPrimary transition-colors font-medium shadow-sm"
                    >
                      📅 Jadwal Kuliah Hari Ini?
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAskAiko('Berapa nilai UAS yang saya butuhkan agar dapat nilai A?')}
                      className="px-3 py-1.5 rounded-xl bg-ios-surface hover:bg-emerald-500/10 border border-ios-border hover:border-emerald-500/40 text-[12px] text-ios-textPrimary transition-colors font-medium shadow-sm"
                    >
                      🎯 Target UAS Biar Dapet A?
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. BENTO GRID OF SUPERPOWERS (KEUNGGULAN YANG BIKIN BEDA JAUH) */}
      <section id="keunggulan" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto space-y-12 scroll-mt-20">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Kecerdasan Akademik Terintegrasi
          </span>
          <h2 className="text-[30px] sm:text-[42px] font-black tracking-tight text-ios-textPrimary leading-tight">
            Instrumen Kuliah Modern yang Tidak Dimiliki Template Biasa.
          </h2>
          <p className="text-[15px] text-ios-textSecondary font-normal">
            Dibangun dari riset kebiasaan mahasiswa asli: presensi anti-terbalik, peringatan bentrok otomatis, dan simulasi target IPK.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Presensi Un-Mirrored & Online/Offline (Span 2 cols on Desktop) */}
          <div className="md:col-span-2 p-6 rounded-3xl bg-ios-surface border border-ios-border hover:border-emerald-500/40 shadow-sm hover:shadow-xl transition-all duration-300 space-y-4 group">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 uppercase">
                Fitur Eksklusif
              </span>
            </div>
            <div>
              <h3 className="text-[20px] font-bold text-ios-textPrimary group-hover:text-emerald-500 transition-colors">
                Presensi Scan Wajah Anti-Mirror & Pilihan Mode Kuliah
              </h3>
              <p className="text-[13.5px] text-ios-textSecondary mt-1 leading-relaxed">
                Tangkapan kamera tidak cermin — teks tulisan pada pakaian dan logo kampus tetap terbaca lurus alami.
                Dilengkapi pemilih mode instan: <strong>Kuliah Online (Zoom/Meet)</strong> atau <strong>Tatap Muka (Ruang Kelas)</strong> lengkap dengan watermark timestamp digital.
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-ios-surfaceSecondary border border-ios-border flex items-center gap-3 text-[12.5px] font-semibold text-ios-textPrimary">
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Dapat membalik foto (Flip Horizontal) kapan saja dari galeri riwayat kehadiran.</span>
            </div>
          </div>

          {/* Card 2: Radar Bentrok Jadwal */}
          <div className="p-6 rounded-3xl bg-ios-surface border border-ios-border hover:border-emerald-500/40 shadow-sm hover:shadow-xl transition-all duration-300 space-y-4 group">
            <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-500 border border-teal-500/20 w-fit group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-[19px] font-bold text-ios-textPrimary group-hover:text-teal-500 transition-colors">
                Radar Tabrakan Jadwal
              </h3>
              <p className="text-[13px] text-ios-textSecondary mt-1 leading-relaxed">
                Algoritma pemeriksa tumpang-tindih jam & ruangan secara instan. Tidak ada lagi drama salah jam kuliah atau tertukar ruang ujian.
              </p>
            </div>
            <div className="pt-2">
              <span className="text-[11.5px] font-mono text-emerald-500 font-bold block">
                ✓ Validasi Jam Mulai & Selesai
              </span>
            </div>
          </div>

          {/* Card 3: Real-Time Grade Forecasting & IPS */}
          <div className="p-6 rounded-3xl bg-ios-surface border border-ios-border hover:border-emerald-500/40 shadow-sm hover:shadow-xl transition-all duration-300 space-y-4 group">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 w-fit group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-[19px] font-bold text-ios-textPrimary group-hover:text-cyan-500 transition-colors">
                Forecasting Nilai & KHS Resmi
              </h3>
              <p className="text-[13px] text-ios-textSecondary mt-1 leading-relaxed">
                Hitung otomatis akumulasi nilai Quiz, Tugas, UTS, dan UAS sesuai proporsi bobot dosen. Ketahui nilai pasti sebelum KHS resmi diumumkan.
              </p>
            </div>
            <div className="pt-2">
              <span className="text-[11.5px] font-mono text-cyan-500 font-bold block">
                ✓ Transkrip Riwayat Tiap Semester
              </span>
            </div>
          </div>

          {/* Card 4: Push Notification Asli OS (H-1 Deadline & H-15 Menit Kuliah) */}
          <div className="p-6 rounded-3xl bg-ios-surface border border-ios-border hover:border-emerald-500/40 shadow-sm hover:shadow-xl transition-all duration-300 space-y-4 group">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 w-fit group-hover:scale-110 transition-transform">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-[19px] font-bold text-ios-textPrimary group-hover:text-amber-500 transition-colors">
                Notifikasi Push Asli OS
              </h3>
              <p className="text-[13px] text-ios-textSecondary mt-1 leading-relaxed">
                Pengingat resmi Web Push API yang berdering di layar HP & laptop Anda tanpa harus membuka browser. Notifikasi otomatis H-1 tugas dan 15 menit sebelum kelas.
              </p>
            </div>
            <div className="pt-2">
              <span className="text-[11.5px] font-mono text-amber-500 font-bold block">
                ✓ Terhubung ke Action Center OS
              </span>
            </div>
          </div>

          {/* Card 5: Standalone PWA Instan di iPhone & Android */}
          <div className="p-6 rounded-3xl bg-ios-surface border border-ios-border hover:border-emerald-500/40 shadow-sm hover:shadow-xl transition-all duration-300 space-y-4 group">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20 w-fit group-hover:scale-110 transition-transform">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-[19px] font-bold text-ios-textPrimary group-hover:text-purple-500 transition-colors">
                Install PWA Tanpa App Store
              </h3>
              <p className="text-[13px] text-ios-textSecondary mt-1 leading-relaxed">
                Pasang langsung ke Layar Utama iPhone (Safari) atau Android (Chrome). Berjalan seperti aplikasi native tanpa bilah URL browser.
              </p>
            </div>
            <div className="pt-2">
              <span className="text-[11.5px] font-mono text-purple-500 font-bold block">
                ✓ Hemat Memori & Kuota
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PERBANDINGAN: MENGAPA SEMESTR 10X LEBIH GACOR */}
      <section id="perbandingan" className="py-16 px-4 sm:px-6 max-w-5xl mx-auto scroll-mt-20">
        <div className="p-8 rounded-3xl bg-ios-surface border border-ios-border shadow-xl space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Perbandingan Nyata
            </span>
            <h3 className="text-[26px] sm:text-[34px] font-black text-ios-textPrimary">
              Mengapa Mahasiswa Beralih ke Semestr?
            </h3>
            <p className="text-[13.5px] text-ios-textSecondary">
              Lihat bagaimana Semestr mengungguli cara konvensional dan template web generik.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13.5px]">
              <thead>
                <tr className="border-b border-ios-border text-ios-textSecondary font-bold text-[11.5px] uppercase tracking-wider">
                  <th className="py-3 px-4">Fitur Kemampuan</th>
                  <th className="py-3 px-4 text-emerald-500 font-black">Semestr 2.0</th>
                  <th className="py-3 px-4 text-slate-400">Catatan Manual / Template Biasa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ios-border/60">
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-ios-textPrimary">Presensi Biometrik Wajah Anti-Mirror</td>
                  <td className="py-3.5 px-4 text-emerald-500 font-bold flex items-center gap-1.5">
                    <Check className="w-4 h-4 stroke-[3]" /> Tersedia (Normal & Mode Daring)
                  </td>
                  <td className="py-3.5 px-4 text-ios-textSecondary">❌ Tidak Ada</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-ios-textPrimary">Deteksi Tabrakan Jadwal Otomatis</td>
                  <td className="py-3.5 px-4 text-emerald-500 font-bold flex items-center gap-1.5">
                    <Check className="w-4 h-4 stroke-[3]" /> Ada (Cegah Bentrok Otomatis)
                  </td>
                  <td className="py-3.5 px-4 text-ios-textSecondary">❌ Manual Cek Sendiri</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-ios-textPrimary">Forecasting Target Nilai & IPS Real-Time</td>
                  <td className="py-3.5 px-4 text-emerald-500 font-bold flex items-center gap-1.5">
                    <Check className="w-4 h-4 stroke-[3]" /> Algoritma Matematika Dinamis
                  </td>
                  <td className="py-3.5 px-4 text-ios-textSecondary">⚠️ Rumus Excel Rumit</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-ios-textPrimary">Asisten AI Bersuara 24/7 (Aiko)</td>
                  <td className="py-3.5 px-4 text-emerald-500 font-bold flex items-center gap-1.5">
                    <Check className="w-4 h-4 stroke-[3]" /> Terintegrasi Jadwal & Silabus
                  </td>
                  <td className="py-3.5 px-4 text-ios-textSecondary">❌ Tidak Ada</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-ios-textPrimary">Notifikasi Push Asli OS (HP & Laptop)</td>
                  <td className="py-3.5 px-4 text-emerald-500 font-bold flex items-center gap-1.5">
                    <Check className="w-4 h-4 stroke-[3]" /> Web Push Tanpa Buka Web
                  </td>
                  <td className="py-3.5 px-4 text-ios-textSecondary">❌ Hanya Email / Harus Buka Web</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-ios-textPrimary">Isolasi Akun Multi-Tenant Murni</td>
                  <td className="py-3.5 px-4 text-emerald-500 font-bold flex items-center gap-1.5">
                    <Check className="w-4 h-4 stroke-[3]" /> 100% Privat TiDB Cloud
                  </td>
                  <td className="py-3.5 px-4 text-ios-textSecondary">⚠️ Data Sering Tercampur</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 6. FAQ ACCORDION SECTION */}
      <section id="faq" className="py-16 px-4 sm:px-6 max-w-4xl mx-auto space-y-8 scroll-mt-20">
        <div className="text-center space-y-2 max-w-lg mx-auto">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Pusat Informasi
          </span>
          <h3 className="text-[28px] sm:text-[36px] font-black text-ios-textPrimary">
            Pertanyaan yang Sering Diajukan
          </h3>
          <p className="text-[13.5px] text-ios-textSecondary">
            Segala hal yang perlu Anda ketahui sebelum menggunakan Semestr.
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'Apakah Semestr benar-benar 100% gratis digunakan?',
              a: 'Ya, Semestr dapat digunakan sepenuhnya secara gratis tanpa kartu kredit, tanpa masa uji coba trial berbayar, dan tanpa iklan yang mengganggu fokus belajar Anda.',
            },
            {
              q: 'Bagaimana cara kerja presensi wajah agar tidak terbalik (mirror)?',
              a: 'Secara default, kamera Semestr telah disesuaikan agar tangkapan foto menghasilkan gambar normal tegak lurus. Jika pakaian atau atribut Anda memiliki tulisan, hasilnya terbaca jelas dari kiri ke kanan. Anda juga dapat membalik foto (flip) kapan saja dari menu Galeri Presensi.',
            },
            {
              q: 'Apakah data perkuliahan saya aman dan terpisah dari mahasiswa lain?',
              a: 'Tentu. Sistem kami menggunakan autentikasi sesi terenkripsi dengan database cloud serverless. Setiap akun memiliki ruang isolasi privat — teman yang mendaftar hanya akan melihat nama, NIM, dan jadwal mereka sendiri.',
            },
            {
              q: 'Bagaimana cara memasang aplikasi ini di iPhone atau Android?',
              a: 'Buka https://studia-id.vercel.app/ di Safari (iPhone) lalu ketuk tombol Share → Tambahkan ke Layar Utama. Di Android, gunakan Chrome dan klik tombol "Install Aplikasi" yang tersedia di navigasi atas.',
            },
            {
              q: 'Apakah ada batasan jumlah mata kuliah yang bisa dimasukkan?',
              a: 'Tidak ada batasan. Anda dapat menginput seluruh mata kuliah di semester aktif maupun semester terdahulu untuk melacak riwayat Indeks Prestasi Kumulatif (IPK).',
            },
          ].map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-ios-surface border border-ios-border overflow-hidden transition-all shadow-sm"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-bold text-[14.5px] text-ios-textPrimary hover:text-emerald-500 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-ios-textSecondary transition-transform duration-200 ${
                    openFaq === idx ? 'rotate-180 text-emerald-500' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-5 sm:px-5 text-[13.5px] text-ios-textSecondary leading-relaxed border-t border-ios-border/40 pt-3 animate-in fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 7. HIGH-CONVERSION CTA BANNER */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <div className="rounded-3xl p-8 sm:p-14 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-3">
            <span className="text-[12px] font-extrabold tracking-widest uppercase text-emerald-200">
              Bergabung Bersama Mahasiswa Berprestasi
            </span>
            <h2 className="text-[32px] sm:text-[46px] font-black tracking-tight leading-tight max-w-2xl mx-auto">
              Siap Menjadikan Semester Ini yang Terbaik?
            </h2>
            <p className="text-[15px] sm:text-[17px] text-emerald-100/90 max-w-xl mx-auto font-normal">
              Daftar akun gratis dalam 30 detik. Jadwal rapi, presensi teratur, dan nilai IPK terkontrol penuh.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap justify-center gap-3.5 relative z-10">
            <Link href="/signup">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-emerald-700 hover:bg-white/90 font-black px-8 text-[15px] rounded-2xl h-12 shadow-lg"
              >
                <span>Daftar Akun Gratis Sekarang</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="py-12 px-4 border-t border-ios-border bg-ios-surface text-[13px] text-ios-textSecondary">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                <MascotIcon size={22} />
              </div>
              <span className="font-black text-[17px] text-ios-textPrimary tracking-tight">
                Semestr
              </span>
            </div>
            <p className="text-[13px] text-ios-textSecondary max-w-sm leading-relaxed">
              Academic Operating System berstandar komersial untuk mahasiswa modern. Dirancang dengan presisi Apple iOS dan teknologi mutakhir.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-ios-textPrimary text-[13px]">Navigasi</h5>
            <ul className="space-y-1.5 text-[12.5px]">
              <li>
                <a href="#simulator" className="hover:text-emerald-500 transition-colors">
                  Simulasi Interaktif
                </a>
              </li>
              <li>
                <a href="#keunggulan" className="hover:text-emerald-500 transition-colors">
                  Fitur Unggulan
                </a>
              </li>
              <li>
                <a href="#perbandingan" className="hover:text-emerald-500 transition-colors">
                  Perbandingan Fitur
                </a>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-emerald-500 transition-colors">
                  Portal Mahasiswa
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-ios-textPrimary text-[13px]">Legal & Pengembang</h5>
            <ul className="space-y-1.5 text-[12.5px]">
              <li>
                <Link href="/privacy" className="hover:text-emerald-500 transition-colors">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-emerald-500 transition-colors">
                  Syarat & Ketentuan
                </Link>
              </li>
              <li>
                <a
                  href="https://yossikaputra.my.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-500 transition-colors flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold"
                >
                  <span>Portofolio Pengembang</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-6 border-t border-ios-border flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px]">
          <p>© {new Date().getFullYear()} Semestr OS. Seluruh hak cipta dilindungi.</p>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Semua Layanan Normal</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

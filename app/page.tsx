"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MascotIcon } from "@/components/assistant/MascotIcon";
import { Button } from "@/components/ui/Button";
import { BadgeStatus } from "@/components/ui/BadgeStatus";
import {
  Camera,
  Sparkles,
  CalendarDays,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Code2,
  Clock,
  Layers,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import gsap from "gsap";

export default function LandingPage() {
  const heroCardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [scanActive, setScanActive] = useState(false);
  const [scanDone, setScanDone] = useState(false);

  // 3D Perspective Tilt on Mouse Move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroCardRef.current) return;
    const rect = heroCardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(heroCardRef.current, {
      rotationY: x / 20,
      rotationX: -y / 20,
      transformPerspective: 1000,
      ease: "power2.out",
      duration: 0.5,
    });

    if (glowRef.current) {
      gsap.to(glowRef.current, {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        duration: 0.3,
      });
    }
  };

  const handleMouseLeave = () => {
    if (!heroCardRef.current) return;
    gsap.to(heroCardRef.current, {
      rotationY: 0,
      rotationX: 0,
      ease: "power2.out",
      duration: 0.8,
    });
  };

  // Demo Scan Simulation
  const handleDemoScan = () => {
    setScanActive(true);
    setScanDone(false);
    setTimeout(() => {
      setScanActive(false);
      setScanDone(true);
    }, 1800);
  };

  useEffect(() => {
    // GSAP Entrance Animations
    gsap.from(".hero-anim", {
      y: 24,
      opacity: 0,
      stagger: 0.12,
      duration: 0.8,
      ease: "power3.out",
    });
  }, []);

  return (
    <div className="min-h-screen bg-ios-bg text-ios-textPrimary selection:bg-ios-accent/20">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 glass-nav border-b border-ios-border transition-colors">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-1.5 rounded-xl bg-ios-surface border border-ios-border shadow-sm group-hover:scale-105 transition-transform">
              <MascotIcon size={26} />
            </div>
            <div>
              <span className="text-[19px] font-bold text-ios-textPrimary tracking-tight">
                Semestr
              </span>
              <span className="text-[11px] font-semibold text-ios-accent ml-2 px-2 py-0.5 rounded-full bg-ios-accent/10 border border-ios-accent/20">
                v2.0
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="https://yossikaputra.my.id"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-[13px] font-medium text-ios-textSecondary hover:text-ios-textPrimary transition-colors"
            >
              <span>Portofolio Yossika</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <Link href="/login">
              <Button variant="secondary" size="sm" className="font-semibold">
                Masuk
              </Button>
            </Link>

            <Link href="/signup">
              <Button variant="primary" size="sm" className="font-semibold gap-1">
                <span>Daftar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-5">
          {/* Badge */}
          <div className="hero-anim inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-ios-surface border border-ios-border shadow-sm">
            <span className="w-2 h-2 rounded-full bg-ios-success animate-pulse" />
            <span className="text-[12px] font-semibold text-ios-textSecondary">
              Ekosistem Akademik S1 Teknik Informatika Telkom University
            </span>
          </div>

          {/* Heading */}
          <h1 className="hero-anim text-[38px] sm:text-[54px] font-black tracking-tight text-ios-textPrimary leading-[1.12]">
            Kelola Rutinitas Kuliah,{" "}
            <span className="text-ios-accent">Scan Wajah Presensi</span> &amp; Asisten AI Pintar
          </h1>

          {/* Description */}
          <p className="hero-anim text-[16px] sm:text-[18px] text-ios-textSecondary max-w-2xl mx-auto leading-relaxed">
            Platform komprehensif mahasiswa untuk jadwal anti-bentrok, deadline tugas,
            riwayat KHS resmi, estimasi nilai akhir otomatis, dan presensi biometrik harian.
          </p>

          {/* Dual Action Buttons */}
          <div className="hero-anim pt-2 flex flex-wrap justify-center gap-3">
            <Link href="/dashboard">
              <Button variant="primary" size="lg" className="px-8 shadow-md gap-2 font-bold">
                <span>Buka Dashboard Mahasiswa</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link href="/signup">
              <Button variant="secondary" size="lg" className="px-6 font-semibold">
                Daftar Akun Baru
              </Button>
            </Link>
          </div>

          {/* 3D Interactive Mockup Card */}
          <div
            className="hero-anim pt-8 perspective-[1200px]"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div
              ref={heroCardRef}
              className="relative max-w-2xl mx-auto rounded-3xl p-6 sm:p-8 bg-ios-surface border border-ios-border shadow-2xl transition-shadow duration-300 text-left overflow-hidden"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Subtle dynamic glow */}
              <div
                ref={glowRef}
                className="absolute w-72 h-72 bg-ios-accent/15 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2"
              />

              {/* Student Header */}
              <div className="flex items-start justify-between border-b border-ios-border pb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-ios-accent/10 border border-ios-accent/20 flex items-center justify-center">
                    <MascotIcon size={28} />
                  </div>
                  <div>
                    <h3 className="text-[17px] font-bold text-ios-textPrimary">
                      YOSSIKA PUTRA ERLANGGA
                    </h3>
                    <p className="text-[12px] text-ios-textSecondary font-mono">
                      NIM 103112430026 • S1IF-12-06 • S1 Teknik Informatika
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-semibold text-ios-textSecondary uppercase tracking-wider block">
                    IPK Kumulatif
                  </span>
                  <span className="text-[24px] font-black text-ios-textPrimary leading-none">
                    3.64
                  </span>
                </div>
              </div>

              {/* Interactive Face Biometrics Demo inside Card */}
              <div className="mt-5 p-4 rounded-2xl bg-ios-surfaceSecondary border border-ios-border space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[13px] font-bold text-ios-textPrimary">
                    <Camera className="w-4 h-4 text-ios-accent" />
                    <span>Presensi Biometrik Wajah &amp; Busana</span>
                  </div>

                  <BadgeStatus
                    size="sm"
                    variant={scanDone ? "selesai" : scanActive ? "proses" : "neutral"}
                  >
                    {scanDone ? "Terverifikasi" : scanActive ? "Memindai..." : "Siap Scan"}
                  </BadgeStatus>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px]">
                  <p className="text-[12px] text-ios-textSecondary">
                    {scanDone
                      ? "Wajah dikenali 99.4% • Pakaian berkerah rapi terkonfirmasi • Kehadiran tercatat"
                      : "Tekan tombol untuk menguji simulasi verifikasi wajah dan kelayakan busana."}
                  </p>

                  <Button
                    variant={scanDone ? "secondary" : "primary"}
                    size="sm"
                    onClick={handleDemoScan}
                    isLoading={scanActive}
                    className="flex-shrink-0"
                  >
                    <UserCheck className="w-3.5 h-3.5 mr-1.5" />
                    <span>{scanDone ? "Uji Coba Lagi" : "Uji Scan Wajah"}</span>
                  </Button>
                </div>
              </div>

              {/* Course & Task Preview Snippet */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
                <div className="p-3.5 rounded-xl bg-ios-surfaceSecondary border border-ios-border">
                  <div className="flex items-center justify-between text-[11px] text-ios-textSecondary font-semibold mb-1">
                    <span>Mata Kuliah Pilihan</span>
                    <span className="text-ios-accent">08:30 - 11:30</span>
                  </div>
                  <h4 className="text-[14px] font-bold text-ios-textPrimary">
                    Sistem Keamanan Cerdas (CAK4RBB3)
                  </h4>
                  <p className="text-[12px] text-ios-textSecondary mt-0.5">
                    Lab Jarkom • M. Agung Nugroho
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-ios-surfaceSecondary border border-ios-border">
                  <div className="flex items-center justify-between text-[11px] text-ios-textSecondary font-semibold mb-1">
                    <span>Tugas Berjalan</span>
                    <span className="text-ios-warning font-bold">5 Hari Lagi</span>
                  </div>
                  <h4 className="text-[14px] font-bold text-ios-textPrimary truncate">
                    Setup Kali Linux di VMware &amp; Kelompok
                  </h4>
                  <p className="text-[12px] text-ios-textSecondary mt-0.5">
                    Prioritas Tinggi • Sistem Keamanan Cerdas
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section className="py-16 px-4 bg-ios-surfaceSecondary/50 border-y border-ios-border">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-[12px] font-bold text-ios-accent uppercase tracking-widest">
              Fitur Andalan
            </span>
            <h2 className="text-[32px] font-bold tracking-tight text-ios-textPrimary">
              Dirancang Spesifik untuk Mahasiswa Aktif
            </h2>
            <p className="text-[14px] text-ios-textSecondary">
              Setiap detail fungsional diciptakan tanpa template generik, mengutamakan kecepatan akses dan presisi data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-ios-surface border border-ios-border shadow-ios space-y-3">
              <div className="w-10 h-10 rounded-xl bg-ios-accent/10 text-ios-accent flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="text-[17px] font-bold text-ios-textPrimary">
                Presensi Scan Wajah Biometrik
              </h3>
              <p className="text-[13px] text-ios-textSecondary leading-relaxed">
                Ambil bukti kehadiran dengan kamera secara langsung. Sistem mencatat foto wajah asli, kondisi busana berkerah/almamater, jam presisi, dan ruangan.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-ios-surface border border-ios-border shadow-ios space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#34C759]/15 text-[#34C759] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-[17px] font-bold text-ios-textPrimary">
                Asisten AI Akademik Kontekstual
              </h3>
              <p className="text-[13px] text-ios-textSecondary leading-relaxed">
                Asisten cerdas dengan maskot animasi GSAP yang memahami jadwal hari ini, batas waktu tugas mendekat, serta saran fokus belajar berbasis data nyata.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-ios-surface border border-ios-border shadow-ios space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#5856D6]/15 text-[#5856D6] flex items-center justify-center">
                <CalendarDays className="w-5 h-5" />
              </div>
              <h3 className="text-[17px] font-bold text-ios-textPrimary">
                Manajemen Jadwal Anti-Bentrok
              </h3>
              <p className="text-[13px] text-ios-textSecondary leading-relaxed">
                Deteksi otomatis tumpang-tindih jam kuliah pada hari yang sama. Memastikan 8 mata kuliah Anda tersusun rapi dengan ruang dan dosen yang akurat.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-ios-surface border border-ios-border shadow-ios space-y-3 md:col-span-2">
              <div className="w-10 h-10 rounded-xl bg-[#FF9500]/15 text-[#FF9500] flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-[17px] font-bold text-ios-textPrimary">
                Transkrip KHS Resmi &amp; Forecasting Nilai Akhir
              </h3>
              <p className="text-[13px] text-ios-textSecondary leading-relaxed">
                Akses riwayat transkrip lengkap Semester 1–4 (Algoritma, Struktur Data, Sistem Operasi, Jaringan Komputer, dsb) dan simulasikan estimasi nilai huruf (A/AB/B/BC/C) semester berjalan secara terukur.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-ios-surface border border-ios-border shadow-ios space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF3B30]/15 text-[#FF3B30] flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-[17px] font-bold text-ios-textPrimary">
                Deadline &amp; Prioritas Tugas
              </h3>
              <p className="text-[13px] text-ios-textSecondary leading-relaxed">
                Daftar to-do terintegrasi kalender dengan indikator peringatan otomatis untuk tugas yang memiliki batas waktu di bawah 3 hari.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Creator Engineering Profile (from yossikaputra.my.id) */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto rounded-3xl p-8 bg-ios-surface border border-ios-border shadow-sm flex flex-col md:flex-row items-center gap-8">
          <div className="w-28 h-28 rounded-3xl bg-ios-accent/10 border-2 border-ios-accent/30 flex items-center justify-center flex-shrink-0 shadow-inner">
            <MascotIcon size={64} />
          </div>

          <div className="space-y-3 flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-[12px] font-bold text-ios-accent uppercase tracking-wider">
              <Code2 className="w-4 h-4" />
              <span>Diciptakan oleh Software Engineer</span>
            </div>

            <h3 className="text-[24px] font-bold text-ios-textPrimary">
              Yossika Putra Erlangga
            </h3>

            <p className="text-[14px] text-ios-textSecondary leading-relaxed">
              Mahasiswa S1 Teknik Informatika Telkom University Purwokerto. Menggabungkan keahlian
              infrastruktur jaringan (SMK Telkom &amp; PT Telkom Akses) dengan pengembangan web fullstack modern dan integrasi AI.
              Kreator berbagai platform seperti <em>Optik I See You (AR Try-On)</em>, <em>GestureFlow AI</em>, dan <em>Semestr</em>.
            </p>

            <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-3">
              <a
                href="https://yossikaputra.my.id"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-btn bg-ios-surfaceSecondary border border-ios-border text-[13px] font-semibold text-ios-textPrimary hover:bg-ios-surface transition-all"
              >
                <span>Kunjungi yossikaputra.my.id</span>
                <ExternalLink className="w-3.5 h-3.5 text-ios-accent" />
              </a>

              <a
                href="https://github.com/yoshput"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-btn bg-ios-surfaceSecondary border border-ios-border text-[13px] font-semibold text-ios-textPrimary hover:bg-ios-surface transition-all"
              >
                <span>GitHub @yoshput</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-ios-border text-center text-[12px] text-ios-textSecondary">
        <p>
          &copy; 2026 Semestr • Daily Academic Companion • Telkom University Purwokerto
        </p>
        <p className="mt-1">
          Dibangun dengan Next.js 15, Prisma ORM, MySQL, Framer Motion, dan GSAP.
        </p>
      </footer>
    </div>
  );
}

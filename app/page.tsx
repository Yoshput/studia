'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// Landing Page Components
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { InteractiveShowcase } from '@/components/landing/InteractiveShowcase';
import { MarqueeTicker } from '@/components/landing/MarqueeTicker';
import { BentoGrid } from '@/components/landing/BentoGrid';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { StudentReviews } from '@/components/landing/StudentReviews';
import { FaqSection } from '@/components/landing/FaqSection';
import { ClosingCta } from '@/components/landing/ClosingCta';
import { FooterIsland } from '@/components/landing/FooterIsland';

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  // Auto-Redirect ke Dashboard jika user sudah login sebelumnya
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isLoggedOut = window.location.search.includes('logged_out=1');

    if (status === 'authenticated' && !isLoggedOut) {
      router.replace('/dashboard');
    }
  }, [status, router]);

  // Scroll listener for floating navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Splash Screen if already logged in and redirecting
  if (status === 'authenticated') {
    return (
      <div className="min-h-screen bg-white dark:bg-[#080708] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 animate-in fade-in duration-300">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-700 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-red-500/25 animate-pulse">
            S
          </div>
          <p className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight">
            Membuka Dashboard Mahasiswa...
          </p>
          <span className="text-[12px] text-slate-500 dark:text-slate-400">
            Sesi akun aktif terdeteksi • Mengalihkan secara aman
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#080708] text-slate-900 dark:text-slate-100 selection:bg-red-500/20 selection:text-red-600 font-sans antialiased transition-colors duration-300">
      {/* 1. Floating Pill Navbar (Apple / Pulse AI Style) */}
      <LandingNavbar scrolled={scrolled} />

      <main>
        {/* 2. Hero Section (Apple Standard Display Typography & Crimson Gradient) */}
        <HeroSection />

        {/* 3. Interactive 3D macOS Dashboard Mockup Showcase (Centerpiece) */}
        <InteractiveShowcase />

        {/* 4. Infinite Running Marquee (Social Proof & Kampus Ticker) */}
        <MarqueeTicker />

        {/* 5. Apple Bento Grid Feature Showcase (4 Pillars) */}
        <BentoGrid />

        {/* 6. Simple Workflow / Cara Kerja */}
        <HowItWorks />

        {/* 7. Verified Customer & Mahasiswa Review Section (6 Cards) */}
        <StudentReviews />

        {/* 8. Frequently Asked Questions (Accordion) */}
        <FaqSection />

        {/* 9. Minimalist Apple Closing CTA */}
        <ClosingCta />
      </main>

      {/* 10. Spacious Bottom Footer Island with Centerpiece Screenshot 2 Product By Pill */}
      <FooterIsland />
    </div>
  );
}

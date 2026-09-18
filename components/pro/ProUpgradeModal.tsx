"use client";

import React, { useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { TelkomLogo } from "@/components/TelkomLogo";
import {
  Sparkles,
  Check,
  Zap,
  GraduationCap,
  ShieldAlert,
  FileDown,
  Clock,
  Crown,
  Tag,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: string;
  onSuccess?: () => void;
}

export function ProUpgradeModal({
  isOpen,
  onClose,
  currentPlan = "free",
  onSuccess,
}: ProUpgradeModalProps) {
  const [selectedTier, setSelectedTier] = useState<"semester" | "lifetime">("lifetime");
  const [promoCode, setPromoCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    setIsSubmitting(true);
    setPromoError("");
    setPromoSuccess("");

    try {
      const res = await fetch("/api/user/pro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "redeem_code",
          promo_code: promoCode.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setPromoSuccess(data.message || "Voucher berhasil diaktifkan!");
        if (onSuccess) onSuccess();
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setPromoError(data.error || "Kode voucher tidak valid.");
      }
    } catch {
      setPromoError("Terjadi kendala jaringan saat klaim voucher.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectUpgrade = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/user/pro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upgrade",
          plan: selectedTier,
        }),
      });

      if (res.ok) {
        setPromoSuccess("Selamat! Akses Semestr PRO Anda telah aktif.");
        if (onSuccess) onSuccess();
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch {
      setPromoError("Kendala koneksi, silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const proFeatures = [
    {
      icon: GraduationCap,
      title: "Simulator Target IPK Cum Laude",
      desc: "Hitung otomatis nilai minimal tugas, kuis, UTS & UAS untuk capai IPK impian.",
    },
    {
      icon: ShieldAlert,
      title: "Radar Risiko Kehadiran iGracias",
      desc: "Pantau sisa jatah alpa (batas 25%) dan alarm bahaya sebelum dicekal ikut ujian.",
    },
    {
      icon: Sparkles,
      title: "Aiko AI Assistant Pro Unlimited",
      desc: "Tanya jadwal, bedah materi kuliah, dan prediksi soal ujian tanpa batas kuota.",
    },
    {
      icon: FileDown,
      title: "Export KHS & Jadwal Resmi (PDF/CSV)",
      desc: "Format rapi berstandar Telkom University untuk bimbingan dosen wali atau beasiswa.",
    },
    {
      icon: Clock,
      title: "Notifikasi Pengingat Prioritas",
      desc: "Push alert 30 menit sebelum kelas dimulai dan deadline tugas berprioritas tinggi.",
    },
  ];

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Tingkatkan ke Semestr PRO">
      <div className="space-y-5 pb-6">
        {/* Banner Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ios-accent to-ios-accentSecondary p-5 text-white shadow-lg">
          <div className="relative z-10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold tracking-wide uppercase">
                <Crown className="w-3.5 h-3.5 text-amber-300" />
                <span>Eksklusif Mahasiswa Telkom</span>
              </div>
              <TelkomLogo size={24} />
            </div>
            <h3 className="text-[21px] font-extrabold tracking-tight">
              Kuasai Akademik &amp; Lulus Cum Laude
            </h3>
            <p className="text-[12.5px] text-white/90 leading-snug">
              Buka seluruh fitur pintar berstandar industri untuk mengelola jadwal, tugas, nilai, dan kehadiran tanpa rasa cemas.
            </p>
          </div>
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
        </div>

        {/* Feature Highlights */}
        <div className="space-y-3">
          <h4 className="text-[13px] font-bold text-ios-textPrimary uppercase tracking-wider px-1">
            Fitur Yang Anda Dapatkan
          </h4>
          <div className="grid gap-2.5">
            {proFeatures.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-2xl bg-ios-surfaceSecondary/60 border border-ios-border/70"
                >
                  <div className="p-2 rounded-xl bg-ios-accent/10 text-ios-accent flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-ios-textPrimary leading-snug">
                      {f.title}
                    </p>
                    <p className="text-[11.5px] text-ios-textSecondary leading-normal">
                      {f.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pricing Options */}
        <div className="space-y-2.5">
          <h4 className="text-[13px] font-bold text-ios-textPrimary uppercase tracking-wider px-1">
            Pilih Paket Mahasiswa
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {/* Option 1: PRO Semester */}
            <button
              type="button"
              onClick={() => setSelectedTier("semester")}
              className={`p-3.5 rounded-2xl text-left border transition-all active:scale-[0.98] relative ${
                selectedTier === "semester"
                  ? "border-ios-accent bg-ios-accent/5 ring-2 ring-ios-accent/20"
                  : "border-ios-border bg-ios-surface hover:bg-ios-surfaceSecondary"
              }`}
            >
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-ios-textSecondary block">
                  1 Semester
                </span>
                <p className="text-[18px] font-extrabold text-ios-textPrimary leading-none">
                  Rp 19.000
                </p>
                <p className="text-[10px] text-ios-textSecondary pt-1 leading-tight">
                  Harga 1 gelas kopi kampus untuk 6 bulan penuh.
                </p>
              </div>
            </button>

            {/* Option 2: PRO Lifetime (Best Value) */}
            <button
              type="button"
              onClick={() => setSelectedTier("lifetime")}
              className={`p-3.5 rounded-2xl text-left border transition-all active:scale-[0.98] relative overflow-hidden ${
                selectedTier === "lifetime"
                  ? "border-ios-accent bg-ios-accent/5 ring-2 ring-ios-accent/20"
                  : "border-ios-border bg-ios-surface hover:bg-ios-surfaceSecondary"
              }`}
            >
              <div className="absolute -top-1 -right-1">
                <span className="px-2 py-0.5 rounded-bl-lg bg-ios-accent text-white text-[9px] font-black uppercase tracking-wider">
                  Hemat 75%
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-ios-accent block">
                  Selamanya (Lifetime)
                </span>
                <p className="text-[18px] font-extrabold text-ios-textPrimary leading-none">
                  Rp 39.000
                </p>
                <p className="text-[10px] text-ios-textSecondary pt-1 leading-tight">
                  Sekali bayar, aktif hingga wisuda sarjana.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-2 pt-1">
          <Button
            type="button"
            variant="primary"
            className="w-full py-3 text-[14px] font-bold shadow-md gap-2"
            isLoading={isSubmitting}
            onClick={handleDirectUpgrade}
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>
              Aktifkan Sekarang (Rp {selectedTier === "lifetime" ? "39.000" : "19.000"})
            </span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <a
            href={`https://wa.me/6281234567890?text=${encodeURIComponent(
              `Halo Admin Semestr, saya mahasiswa Telkom University ingin konfirmasi upgrade ke Semestr ${
                selectedTier === "lifetime" ? "PRO Lifetime" : "PRO Semester"
              }.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-1.5 py-2 text-[12px] font-semibold text-ios-textSecondary hover:text-ios-accent transition-colors"
          >
            <span>Tanya Admin / Bantuan Pembayaran via WhatsApp</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Voucher Redemption Form */}
        <div className="pt-3 border-t border-ios-border">
          <form onSubmit={handleRedeem} className="space-y-2">
            <div className="flex items-center gap-1.5 text-[12px] font-bold text-ios-textSecondary">
              <Tag className="w-3.5 h-3.5" />
              <span>Punya Kode Voucher / Promo Telkom?</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Misal: TELKOMJUARA atau SEMESTRPRO"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2 rounded-btn bg-ios-surfaceSecondary border border-ios-border text-[13px] font-mono text-ios-textPrimary focus:outline-none focus:ring-2 focus:ring-ios-accent/20"
              />
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                isLoading={isSubmitting}
                disabled={!promoCode.trim()}
              >
                Gunakan
              </Button>
            </div>

            {promoSuccess && (
              <p className="text-[12px] font-medium text-ios-success animate-in fade-in">
                {promoSuccess}
              </p>
            )}
            {promoError && (
              <p className="text-[12px] font-medium text-ios-danger animate-in fade-in">
                {promoError}
              </p>
            )}
          </form>
        </div>
      </div>
    </Sheet>
  );
}

"use client";

import React, { useState, useMemo } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { GraduationCap, Award, Sliders, CheckCircle2, TrendingUp, Sparkles, AlertCircle } from "lucide-react";

interface MatkulItem {
  id: string;
  nama: string;
  sks: number;
  bobot_nilai?: { kategori: string; bobot_persen: number }[];
  nilai?: { kategori: string; nilai: number }[];
}

interface GpaOptimizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  matkulList: MatkulItem[];
  currentIpk?: number;
}

export function GpaOptimizerModal({
  isOpen,
  onClose,
  matkulList,
  currentIpk = 0.0,
}: GpaOptimizerModalProps) {
  const [targetGpa, setTargetGpa] = useState<number>(3.80);
  const totalSks = useMemo(
    () => matkulList.reduce((acc, m) => acc + m.sks, 0) || 20,
    [matkulList]
  );

  // Kalkulasi estimasi performa yang dibutuhkan
  const analysis = useMemo(() => {
    const diff = targetGpa - currentIpk;
    const requiredGradeDistribution = [
      { grade: "A (4.0)", percent: targetGpa >= 3.8 ? "80%" : "60%", count: Math.ceil(matkulList.length * 0.7) },
      { grade: "AB (3.5)", percent: targetGpa >= 3.8 ? "20%" : "30%", count: Math.floor(matkulList.length * 0.3) },
      { grade: "B (3.0)", percent: "0%", count: 0 },
    ];

    const minScoreUtsUas = targetGpa >= 3.85 ? 88 : targetGpa >= 3.75 ? 82 : 78;

    return {
      diff,
      minScoreUtsUas,
      requiredGradeDistribution,
      status: targetGpa >= 3.75 ? "Cum Laude Target" : "Sangat Memuaskan",
    };
  }, [targetGpa, currentIpk, matkulList]);

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Simulator Target IPK Cum Laude">
      <div className="space-y-5 pb-6">
        {/* Header Metric */}
        <div className="p-4 rounded-2xl bg-ios-surfaceSecondary border border-ios-border flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-ios-textSecondary uppercase tracking-wider block">
              IPK Kumulatif Saat Ini
            </span>
            <span className="text-[26px] font-black text-ios-textPrimary tracking-tight">
              {currentIpk.toFixed(2)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-semibold text-ios-accent uppercase tracking-wider block">
              Target IPK Impian
            </span>
            <span className="text-[26px] font-black text-ios-accent tracking-tight">
              {targetGpa.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Interactive GPA Slider */}
        <div className="space-y-2 p-4 rounded-2xl bg-ios-surface border border-ios-border shadow-sm">
          <div className="flex items-center justify-between">
            <label className="text-[13px] font-bold text-ios-textPrimary flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-ios-accent" />
              <span>Geser Target IPK Semester Ini</span>
            </label>
            <span className="text-[12px] font-extrabold px-2 py-0.5 rounded-full bg-ios-accent/15 text-ios-accent">
              {analysis.status}
            </span>
          </div>

          <input
            type="range"
            min="3.00"
            max="4.00"
            step="0.05"
            value={targetGpa}
            onChange={(e) => setTargetGpa(parseFloat(e.target.value))}
            className="w-full h-2 bg-ios-surfaceSecondary rounded-lg appearance-none cursor-pointer accent-ios-accent"
          />

          <div className="flex justify-between text-[10px] text-ios-textSecondary font-mono pt-1">
            <span>3.00 (Baik)</span>
            <span>3.50 (Memuaskan)</span>
            <span>3.75 (Cum Laude)</span>
            <span>4.00 (Sempurna)</span>
          </div>
        </div>

        {/* Recommendation Cards */}
        <div className="space-y-2.5">
          <h4 className="text-[13px] font-bold text-ios-textPrimary uppercase tracking-wider px-1">
            Rekomendasi Skor Minimal Ujian
          </h4>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-ios-surfaceSecondary/80 border border-ios-border">
              <span className="text-[11px] text-ios-textSecondary font-medium block">
                Target Nilai UTS &amp; UAS
              </span>
              <p className="text-[20px] font-black text-ios-textPrimary mt-0.5">
                ≥ {analysis.minScoreUtsUas} <span className="text-[12px] font-medium text-ios-textSecondary">/ 100</span>
              </p>
              <p className="text-[10.5px] text-ios-textSecondary mt-1 leading-snug">
                Skor aman di {totalSks} SKS semester ini.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-ios-surfaceSecondary/80 border border-ios-border">
              <span className="text-[11px] text-ios-textSecondary font-medium block">
                Komposisi Indeks Huruf
              </span>
              <p className="text-[20px] font-black text-ios-accent mt-0.5">
                {analysis.requiredGradeDistribution[0].count} Matkul A
              </p>
              <p className="text-[10.5px] text-ios-textSecondary mt-1 leading-snug">
                Sisa matkul minimal bernilai AB.
              </p>
            </div>
          </div>
        </div>

        {/* Strategy Roadmap */}
        <div className="p-4 rounded-2xl bg-ios-surfaceSecondary/60 border border-ios-border space-y-2.5">
          <div className="flex items-center gap-2 text-[12.5px] font-bold text-ios-textPrimary">
            <Sparkles className="w-4 h-4 text-ios-accent" />
            <span>Strategi Prioritas Belajar</span>
          </div>
          <ul className="space-y-2 text-[12px] text-ios-textSecondary">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-ios-success flex-shrink-0 mt-0.5" />
              <span>
                Fokuskan energi pengerjaan Tubes/Proyek pada matkul berbobot 3-4 SKS karena dampaknya paling dominan pada IPK kumulatif.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-ios-success flex-shrink-0 mt-0.5" />
              <span>
                Maksimalkan komponen nilai Tugas &amp; Kuis ke angka 90+ agar memiliki batas toleransi aman saat UTS &amp; UAS.
              </span>
            </li>
          </ul>
        </div>

        <Button
          type="button"
          variant="primary"
          className="w-full py-2.5 text-[13.5px] font-bold"
          onClick={onClose}
        >
          Terapkan Target ke Dashboard Nilai
        </Button>
      </div>
    </Sheet>
  );
}

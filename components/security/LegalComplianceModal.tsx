"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  FileText,
  Lock,
  CheckCircle2,
  X,
  AlertTriangle,
  Award,
  ScrollText,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface LegalComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAgreed: boolean;
  onToggleAgree: (agreed: boolean) => void;
  agreedTimestamp?: string | null;
}

export function LegalComplianceModal({
  isOpen,
  onClose,
  isAgreed,
  onToggleAgree,
  agreedTimestamp,
}: LegalComplianceModalProps) {
  const [activeTab, setActiveTab] = useState<"terms" | "privacy" | "security">("terms");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-ios-surface rounded-3xl p-5 sm:p-7 shadow-2xl border border-ios-border flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-ios-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-ios-accent/10 border border-ios-accent/20 text-ios-accent flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-0.5">
                <Award className="w-3 h-3" />
                <span>Standar Kepatuhan Resmi v2.4</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-ios-textPrimary leading-snug">
                Dokumen Standar &amp; Keamanan Studia
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-ios-textSecondary hover:text-ios-textPrimary rounded-full hover:bg-ios-surfaceSecondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1.5 py-3 border-b border-ios-border text-[12px] font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab("terms")}
            className={cn(
              "px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5",
              activeTab === "terms"
                ? "bg-ios-accent text-white shadow-xs"
                : "text-ios-textSecondary hover:text-ios-textPrimary hover:bg-ios-surfaceSecondary"
            )}
          >
            <ScrollText className="w-3.5 h-3.5" />
            <span>Syarat &amp; Ketentuan</span>
          </button>
          <button
            onClick={() => setActiveTab("privacy")}
            className={cn(
              "px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5",
              activeTab === "privacy"
                ? "bg-ios-accent text-white shadow-xs"
                : "text-ios-textSecondary hover:text-ios-textPrimary hover:bg-ios-surfaceSecondary"
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Kebijakan Privasi (UU PDP)</span>
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={cn(
              "px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5",
              activeTab === "security"
                ? "bg-ios-accent text-white shadow-xs"
                : "text-ios-textSecondary hover:text-ios-textPrimary hover:bg-ios-surfaceSecondary"
            )}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Standar Keamanan Siber</span>
          </button>
        </div>

        {/* Scrollable Document Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 my-2 rounded-2xl bg-ios-surfaceSecondary/40 border border-ios-border text-[12.5px] leading-relaxed text-ios-textPrimary space-y-4">
          {activeTab === "terms" && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-ios-textPrimary">
                1. Syarat &amp; Ketentuan Penggunaan Layanan (Terms of Service)
              </h3>
              <p>
                Selamat datang di <strong>Studia Academic OS</strong>. Dengan mengakses dan menggunakan platform ini, pengguna menyatakan tunduk dan menyetujui seluruh ketentuan berikut:
              </p>
              <ul className="list-disc list-inside space-y-2 text-ios-textSecondary">
                <li>
                  <strong className="text-ios-textPrimary">Integritas Akademik:</strong> Studia dirancang sebagai pendamping belajar, pengelola jadwal, dan sarana produktivitas. Asisten AI (Aiko) ditujukan untuk membantu pemahaman konsep, bukan untuk melakukan plagiarisme atau kecurangan akademik dalam bentuk apa pun.
                </li>
                <li>
                  <strong className="text-ios-textPrimary">Akses &amp; Otentikasi:</strong> Mahasiswa bertanggung jawab penuh atas kerahasiaan kata sandi, verifikasi biometrik, dan sesi akun mereka. Dilarang meminjamkan akun kepada pihak lain.
                </li>
                <li>
                  <strong className="text-ios-textPrimary">Konektor LMS Kampus:</strong> Fitur sinkronisasi kalender iCal hanya membaca feed jadwal publik pribadi mahasiswa tanpa menyimpan kata sandi SSO kampus pada server Studia.
                </li>
                <li>
                  <strong className="text-ios-textPrimary">Ketersediaan Layanan (SLA):</strong> Platform berkomitmen menjaga stabilitas sistem hingga 99.9% uptime dengan pencadangan cloud multi-wilayah.
                </li>
              </ul>
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-ios-textPrimary">
                2. Kebijakan Privasi &amp; Kepatuhan UU PDP (No. 27 Tahun 2022)
              </h3>
              <p>
                Kami menjunjung tinggi hak privasi pengguna dan sepenuhnya mematuhi <strong>Undang-Undang Republik Indonesia Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)</strong>:
              </p>
              <ul className="list-disc list-inside space-y-2 text-ios-textSecondary">
                <li>
                  <strong className="text-ios-textPrimary">Prinsip Minimisasi Data:</strong> Kami hanya mengumpulkan data yang benar-benar esensial untuk fungsi perkuliahan: nama, email kampus, NIM, jadwal kuliah, catatan nilai, dan progres belajar.
                </li>
                <li>
                  <strong className="text-ios-textPrimary">Kebijakan Zero-Storage Retention Berkas Presentasi (PPTX):</strong> Berkas materi slide presentasi yang diunggah diproses langsung secara sementara dalam memori RAM server. Berkas fisik tidak pernah disimpan permanen di penyimpanan hard disk dan otomatis dibersihkan seketika setelah ringkasan selesai dihasilkan.
                </li>
                <li>
                  <strong className="text-ios-textPrimary">Data Biometrik Wajah:</strong> Foto presensi dan pemindaian wajah diproses secara terenkripsi hanya untuk verifikasi kehadiran dan pembukaan kunci biometrik pengguna sah, tidak diperjualbelikan atau dibagikan ke pihak ketiga mana pun.
                </li>
                <li>
                  <strong className="text-ios-textPrimary">Hak Pemilik Data:</strong> Anda memiliki hak penuh untuk meminta penghapusan total riwayat akun dan seluruh data akademik Anda kapan saja.
                </li>
              </ul>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-ios-textPrimary">
                3. Standar Keamanan Siber &amp; Enkripsi Berlapis (ISO/IEC 27001 &amp; NIST)
              </h3>
              <p>
                Arsitektur keamanan Studia menerapkan standar perlindungan industri berlapis tingkat tinggi:
              </p>
              <ul className="list-disc list-inside space-y-2 text-ios-textSecondary">
                <li>
                  <strong className="text-ios-textPrimary">Enkripsi Data At-Rest &amp; In-Transit:</strong> Seluruh jalur komunikasi dienkripsi menggunakan <em>TLS 1.3 Strict HTTPS</em>, dan data pada basis data disimpan dengan algoritma <em>AES-256 bit encryption</em>.
                </li>
                <li>
                  <strong className="text-ios-textPrimary">Otentikasi Multi-Faktor &amp; Biometrik:</strong> Mendukung verifikasi sidik jari/Face ID perangkat native (WebAuthn / Passkeys) pada smartphone serta deteksi biometrik wajah AI pada laptop/desktop untuk mencegah akses tidak sah.
                </li>
                <li>
                  <strong className="text-ios-textPrimary">Proteksi Terhadap Brute-Force &amp; Injeksi:</strong> Dilengkapi proteksi rate-limiting, CORS terisolasi, parameterized query via Prisma ORM, dan proteksi cross-site scripting (XSS).
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer Agreement & Actions */}
        <div className="pt-3 border-t border-ios-border space-y-3">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isAgreed}
              onChange={(e) => onToggleAgree(e.target.checked)}
              className="mt-0.5 rounded border-ios-border text-ios-accent focus:ring-ios-accent"
            />
            <span className="text-[12px] text-ios-textPrimary leading-snug">
              Saya telah membaca, memahami, dan menyetujui seluruh <strong>Syarat &amp; Ketentuan</strong>, <strong>Kebijakan Privasi UU PDP</strong>, serta <strong>Standar Keamanan</strong> Studia.
            </span>
          </label>

          {agreedTimestamp && (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold px-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Status Dokumen: Disetujui pada {agreedTimestamp}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Tutup
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!isAgreed}
              onClick={onClose}
              className="shadow-sm"
            >
              Konfirmasi &amp; Simpan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

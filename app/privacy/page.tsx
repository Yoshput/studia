import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, EyeOff, Database, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Kebijakan Privasi — Semestr Academic OS',
  description: 'Kebijakan privasi dan standar perlindungan data biometrik mahasiswa di Semestr.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-ios-bg text-ios-textPrimary selection:bg-ios-accent/20 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[13px] font-medium text-ios-textSecondary hover:text-ios-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda Semestr</span>
        </Link>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ios-accent/10 border border-ios-accent/20 text-ios-accent text-[12px] font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Standar Keamanan Data Mahasiswa</span>
          </div>
          <h1 className="text-[32px] sm:text-[40px] font-black tracking-tight">
            Kebijakan Privasi &amp; Perlindungan Data
          </h1>
          <p className="text-[14px] text-ios-textSecondary">
            Terakhir diperbarui: 16 September 2026 • Berlaku untuk seluruh pengguna aplikasi Semestr
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-ios-surface border border-ios-border shadow-sm space-y-6 text-[14px] text-ios-textSecondary leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-[18px] font-bold text-ios-textPrimary flex items-center gap-2">
              <Lock className="w-4 h-4 text-ios-accent" />
              1. Komitmen Privasi
            </h2>
            <p>
              Semestr (Academic OS) menghargai privasi dan otonomi data akademik Anda. Kami tidak menjual, membagikan, atau memonetisasi data pribadi mahasiswa kepada pihak ketiga mana pun. Seluruh informasi yang Anda masukkan disimpan untuk keperluan personalisasi studi Anda sendiri.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-[18px] font-bold text-ios-textPrimary flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-ios-accent" />
              2. Data Biometrik Presensi &amp; Kamera
            </h2>
            <p>
              Fitur presensi menggunakan pindaian wajah dan analisis busana rapi. Ketentuan penanganan biometrik adalah sebagai berikut:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Akses kamera hanya aktif saat Anda membuka modul presensi secara sadar dengan izin eksplisit (Consent Screen).</li>
              <li>Hasil tangkapan digunakan secara eksklusif untuk bukti kehadiran akademik pribadi Anda.</li>
              <li>Data foto disimpan dengan enkripsi transport TLS/SSL langsung ke penyimpanan database serverless yang terisolasi.</li>
              <li>Anda memiliki hak penuh untuk menghapus riwayat presensi foto Anda kapan saja melalui dashboard.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-[18px] font-bold text-ios-textPrimary flex items-center gap-2">
              <Database className="w-4 h-4 text-ios-accent" />
              3. Infrastruktur &amp; Enkripsi
            </h2>
            <p>
              Data tersimpan pada infrastruktur basis data <strong>TiDB Cloud Serverless</strong> dengan enkripsi transit standar industri (TLS 1.3/SSL Strict). Kata sandi akun dienkripsi menggunakan algoritma cryptographic hashing <strong>bcrypt</strong> satu arah dan tidak pernah disimpan dalam bentuk teks terbuka.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-[18px] font-bold text-ios-textPrimary flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-ios-accent" />
              4. Asisten AI &amp; LLM
            </h2>
            <p>
              Integrasi asisten cerdas (Google Gemini 2.5 Flash) dirancang agar hanya menerima konteks jadwal dan to-do kuliah saat Anda berinteraksi. Percakapan tidak dijadikan bahan pelatihan model publik tanpa izin.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-[18px] font-bold text-ios-textPrimary">
              5. Hubungi Tim
            </h2>
            <p>
              Jika Anda memiliki pertanyaan mengenai tata kelola data atau ingin meminta penghapusan akun beserta seluruh riwayat studi, hubungi kami melalui portofolio pembuat di <a href="https://yossikaputra.my.id" target="_blank" rel="noopener noreferrer" className="text-ios-accent font-semibold underline">yossikaputra.my.id</a>.
            </p>
          </section>
        </div>

        <div className="text-center text-[12px] text-ios-textSecondary pt-4">
          &copy; 2026 Semestr • Melindungi integritas akademik dan privasi mahasiswa Indonesia.
        </div>
      </div>
    </div>
  );
}

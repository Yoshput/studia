import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export const metadata = {
  title: 'Syarat & Ketentuan Layanan — Semestr Academic OS',
  description: 'Syarat dan ketentuan penggunaan platform akademik Semestr.',
};

export default function TermsPage() {
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
            <FileText className="w-4 h-4" />
            <span>Ketentuan Penggunaan Platform</span>
          </div>
          <h1 className="text-[32px] sm:text-[40px] font-black tracking-tight">
            Syarat &amp; Ketentuan Layanan (Terms of Service)
          </h1>
          <p className="text-[14px] text-ios-textSecondary">
            Terakhir diperbarui: 16 September 2026
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-ios-surface border border-ios-border shadow-sm space-y-6 text-[14px] text-ios-textSecondary leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-[18px] font-bold text-ios-textPrimary">
              1. Penerimaan Ketentuan
            </h2>
            <p>
              Dengan mendaftar atau menggunakan platform Semestr, Anda setuju untuk terikat oleh syarat dan ketentuan ini. Jika Anda tidak menyetujui salah satu klausul, Anda dapat berhenti menggunakan layanan ini sewaktu-waktu.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-[18px] font-bold text-ios-textPrimary">
              2. Penggunaan yang Bertanggung Jawab
            </h2>
            <p>
              Semestr dirancang sebagai asisten penunjang efektivitas studi Anda. Anda bertanggung jawab penuh atas keakuratan jadwal kuliah, tugas, dan data akademik yang Anda masukkan secara mandiri.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-[18px] font-bold text-ios-textPrimary">
              3. Layanan Gratis &amp; Ketersediaan
            </h2>
            <p>
              Akun Mahasiswa disediakan secara gratis dengan fitur esensial lengkap. Tim pengembang berhak melakukan pemeliharaan server berkala demi menjaga kestabilan dan keandalan sistem cloud.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-[18px] font-bold text-ios-textPrimary">
              4. Kepemilikan Data
            </h2>
            <p>
              Seluruh catatan, ringkasan materi, to-do list, dan berkas yang Anda unggah adalah hak milik intelektual Anda sepenuhnya. Anda dapat meminta ekspor atau penghapusan data secara menyeluruh.
            </p>
          </section>
        </div>

        <div className="text-center text-[12px] text-ios-textSecondary pt-4">
          &copy; 2026 Semestr • Menjunjung tinggi integritas akademik mahasiswa Indonesia.
        </div>
      </div>
    </div>
  );
}

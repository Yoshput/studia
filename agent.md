# Agent Instructions — Membangun Semestr

Dokumen ini adalah instruksi kerja untuk AI coding agent (Antigravity, atau Claude Code) yang membangun aplikasi ini. Baca bersama `prd.md` (fitur & data model) dan `design.md` (sistem desain) sebelum mulai coding. Patuhi `ai-anti-slop.md` di setiap output — visual maupun kode.

---

## 1. Konteks Proyek

Aplikasi web personal single-user untuk mahasiswa Teknik Informatika mengelola jadwal matkul, progress belajar harian, nilai, dan deadline, dengan asisten AI kontekstual. Dijalankan di localhost dengan MySQL lokal (XAMPP).

## 2. Tech Stack (final)

| Layer | Pilihan |
|---|---|
| Framework | Next.js 15 (App Router), TypeScript |
| Database | MySQL (via XAMPP) |
| ORM | Prisma |
| Styling | Tailwind CSS |
| Animasi | Framer Motion (micro-interaction) + GSAP (transisi halaman, elemen kompleks) |
| Auth | NextAuth (credentials provider, single user) |
| Chart | Recharts |
| AI | Anthropic API (Claude) via Next.js API route |
| Icon | lucide-react |

Jangan mengganti pilihan ini tanpa alasan teknis yang kuat — stack ini dipilih agar satu bahasa (TS) dari depan sampai belakang dan mudah di-maintain sendiri.

## 3. Struktur Proyek

```
/app
  /(auth)/login
  /(main)/dashboard
  /(main)/jadwal
  /(main)/nilai
  /(main)/progress
  /(main)/tugas
  /(main)/profil
  /api/matkul
  /api/progress
  /api/nilai
  /api/tugas
  /api/semester
  /api/assistant        ← proxy ke Anthropic API, jangan expose API key ke client
/components
  /ui                    ← komponen dasar (Card, Button, Sheet, Segmented, Toggle, Badge)
  /features               ← komponen per fitur (JadwalGrid, NilaiChart, ProgressTimeline, dst)
  /assistant               ← mascot, chat panel
/lib
  db.ts                    ← Prisma client singleton
  auth.ts
  utils.ts
/prisma
  schema.prisma
  seed.ts
```

## 4. Urutan Pembangunan (Fase)

Bangun bertahap, jangan sekaligus semua fitur. Setiap fase harus berjalan dan bisa dicoba sebelum lanjut ke fase berikutnya.

**Fase 0 — Setup**
- Init Next.js + TypeScript + Tailwind
- Setup Prisma schema sesuai data model di `prd.md`, migrate ke MySQL lokal
- Seed data: 1 semester aktif + 8 matkul contoh dari `prd.md`
- Setup NextAuth single-user

**Fase 1 — Core CRUD**
- CRUD matkul & jadwal, tampilan jadwal mingguan
- CRUD progress harian + timeline per matkul
- Dashboard dasar (jadwal hari ini, statis dulu tanpa AI)

**Fase 2 — Nilai & Tugas**
- Pencatatan nilai per kategori + bobot + estimasi nilai akhir
- Grafik nilai (Recharts)
- Tugas & deadline tracker (list + kalender + status/prioritas)

**Fase 3 — Statistik & AI Assistant**
- Statistik IPK & skor "perlu perhatian" per matkul
- AI assistant: mascot + idle animation, greeting dinamis, chat dengan konteks data pengguna, reminder proaktif berbasis data

**Fase 4 — Polish**
- Terapkan seluruh motion guideline dari `design.md` (page transition GSAP, micro-interaction Framer Motion)
- Dark mode
- Voice greeting (Web Speech API) — opsional, harus bisa dimatikan

Setelah setiap fase, laporkan apa yang sudah bisa dicoba dan apa yang belum, jangan lompat ke fase berikutnya sebelum fase sebelumnya berjalan.

## 5. Konvensi Kode

- TypeScript strict mode, tidak ada `any` tanpa alasan eksplisit dikomentari
- Nama file komponen: PascalCase (`ProgressTimeline.tsx`), nama route folder: kebab-case sesuai konvensi Next.js
- Query database hanya lewat Prisma, tidak ada raw SQL kecuali benar-benar perlu
- Validasi input di API route (gunakan Zod), jangan percaya input dari client mentah-mentah
- Satu komponen satu tanggung jawab — jangan bikin komponen 500 baris yang mengurus fetching, state, dan rendering sekaligus; pisahkan hook/data-fetching dari presentasi
- Gunakan komponen dasar dari `/components/ui` secara konsisten, jangan styling ulang dari nol di tiap halaman

## 6. Environment & Setup

- `.env.local` menyimpan: `DATABASE_URL` (MySQL lokal via XAMPP), `NEXTAUTH_SECRET`, `ANTHROPIC_API_KEY`
- `ANTHROPIC_API_KEY` **hanya** dipakai di server (`/api/assistant`), tidak pernah dikirim ke client
- Jalankan `npx prisma migrate dev` setelah setiap perubahan schema
- Sertakan `README.md` singkat berisi langkah setup dari nol (clone, install, migrate, seed, run)

## 7. Batasan (Do's and Don'ts)

**Lakukan:**
- Ikuti data model di `prd.md` sebagai sumber kebenaran struktur database
- Ikuti token warna, tipografi, dan komponen di `design.md` — jangan improvisasi palet baru
- Gunakan lucide-react untuk semua ikon
- Uji setiap fitur CRUD dengan data nyata (8 matkul contoh) sebelum lanjut fase berikutnya

**Jangan:**
- Jangan tambahkan fitur di luar `prd.md` tanpa ditanyakan dulu (mis. multi-user, integrasi LMS otomatis)
- Jangan gunakan emoji di UI produksi
- Jangan gunakan gradient dekoratif besar atau glassmorphism berlebihan di luar yang disebutkan di `design.md` (blur tipis di nav bar/sheet saja)
- Jangan hardcode jumlah matkul jadi 8 di logika aplikasi — jumlah matkul per semester harus dinamis dari database
- Jangan simpan API key di kode atau di client

## 8. QA Sebelum Dianggap Selesai

- Semua form punya validasi dan pesan error yang jelas (bukan generic "Error occurred")
- Responsif diuji di lebar mobile (375px) dan desktop
- Dark mode diuji, bukan hanya light mode
- Tidak ada console error di browser saat navigasi antar halaman
- Cocokkan hasil visual terhadap `design.md` dan periksa terhadap `ai-anti-slop.md` sebelum dianggap final

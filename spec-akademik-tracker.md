# 📚 Spec Project: Daily Academic Companion (Telkom University Purwokerto)

## 1. Rekomendasi Nama Project

Beberapa opsi, pilih yang paling "kamu":

| Nama | Vibe |
|---|---|
| **Kampus.io** | Simple, modern, kesan produk SaaS beneran |
| **Nilaiku** | Fokus ke pencatatan nilai, bahasa Indonesia, gampang diingat |
| **StudyOS** | Kesan "operating system" buat kuliah kamu — cocok kalau mau branding techy |
| **Semestr** | Playful, singkat, cocok buat iOS-style app |
| **Progresio** | Fokus ke "progress harian" yang jadi inti fitur kamu |

Rekomendasi saya: **"Semestr"** atau **"StudyOS"** — pendek, gampang jadi nama domain/app, dan cocok sama vibe clean/minimalist yang kamu mau.

---

## 2. Tech Stack Rekomendasi

Karena kamu bakal serahin ke Antigravity untuk build full, stack ini paling ideal: gampang di-generate AI, jalan mulus di localhost, dan gampang di-maintain sendiri ke depannya.

- **Framework**: Next.js 15 (App Router) — frontend + backend (API routes) jadi satu, gak perlu server terpisah
- **Database**: MySQL (jalanin service-nya lewat XAMPP, tapi Next.js connect langsung ke MySQL, bukan lewat PHP)
- **ORM**: Prisma — bikin schema, migration, dan query jadi jauh lebih rapi & type-safe, AI juga lebih gampang generate kode dengan Prisma
- **Styling**: Tailwind CSS + Framer Motion (untuk micro-interactions) + **GSAP** (untuk animasi page transition & elemen kompleks)
- **Auth**: Simple single-user login (NextAuth credentials) — karena ini personal use, gak perlu multi-user ribet
- **Chart/statistik**: Recharts (buat grafik IPK, progress, dsb)
- **Chatbot AI**: Anthropic API (Claude) via API route Next.js sendiri, biar bisa jadi asisten yang "ngerti" data akademik kamu (deadline, nilai, dsb) — bisa juga pakai OpenAI kalau lebih familiar

> Kenapa bukan PHP native? Next.js + Prisma jauh lebih gampang untuk AI agent (Antigravity) generate secara konsisten, dan lebih gampang kamu develop lanjut sendiri karena satu bahasa (JS/TS) dari depan sampai belakang.

---

## 3. Fitur Utama

### A. Dashboard Utama
- Ringkasan hari ini: jadwal matkul hari ini, progress belajar, deadline mendekat
- Kartu ringkasan IPK/nilai per semester
- Sapaan dari AI Assistant (dinamis sesuai waktu & data)

### B. Manajemen 8 Matkul & Jadwal
- CRUD matkul (nama, dosen, sks, hari, jam, ruang)
- Tampilan jadwal mingguan ala kalender iOS

### C. Progress Harian & Notes
- Input harian: apa yang dipelajari, catatan, mood/tingkat pemahaman
- Riwayat progress per matkul (timeline view)
- Bisa attach file/gambar catatan

### D. Pencatatan Nilai
- Kategori: Quiz, Tugas, UTS, UAS, Project, Tubes
- Per matkul, bisa hitung otomatis nilai akhir estimasi
- Grafik perkembangan nilai per semester

### E. Tugas & Deadline Tracker
- To-do list dengan due date, prioritas, status (belum/proses/selesai)
- Reminder otomatis (dimunculin AI assistant)

### F. Statistik & Insight
- IPK per semester & tren keseluruhan
- Matkul yang perlu perhatian lebih (berdasarkan nilai/progress)

### G. AI Assistant (Chatbot Animasi)
- Karakter/mascot kecil yang muncul di pojok, animasi idle (GSAP)
- Menyapa saat pertama buka app ("Pagi! Hari ini ada 3 matkul & 1 deadline tugas lho")
- Bisa diajak chat: tanya progress, minta rekomendasi belajar, tanya deadline
- Voice greeting pakai Web Speech API (text-to-speech browser, gratis, gak perlu API tambahan)
- Reminder proaktif berbasis data deadline & jadwal yang tersimpan di database

---

## 4. Design System — iOS / Apple Style

- **Warna**: base putih/abu sangat terang untuk light mode, dengan accent biru khas iOS (#007AFF) atau bisa custom accent (mis. indigo/teal)
- **Font**: Inter atau "SF Pro"-like (pakai font `Inter` atau `Plus Jakarta Sans` sebagai pengganti SF Pro yang lisensinya terbatas)
- **Card style**: rounded-2xl/3xl, soft shadow, sedikit glassmorphism (backdrop-blur) di elemen navigasi
- **Navigasi**: bottom tab bar ala iOS (Dashboard, Jadwal, Nilai, Progress, Profil)
- **Komponen**: modal sheet yang slide-up dari bawah (ala iOS sheet), toggle switch iOS-style, segmented control untuk filter
- **Spacing**: generous whitespace, grid rapi, hierarchy tipografi jelas (besar-tegas untuk judul, ringan untuk body)

## 5. GSAP Animation Ideas

- Page transition halus antar halaman (fade + slide)
- Number counter animasi saat nilai/IPK muncul di dashboard
- Progress bar mengisi dengan easing saat halaman load
- Deadline card: subtle pulse/glow kalau deadline < 3 hari
- Mascot AI: idle bounce animation + animasi "bicara" saat greeting muncul
- Scroll-triggered reveal untuk timeline progress harian

---

## 6. Struktur Database (garis besar)

```
users            (id, nama, email, password_hash)
matkul           (id, nama, dosen, sks, hari, jam_mulai, jam_selesai, ruang, semester)
progress_harian  (id, matkul_id, tanggal, catatan, materi_dipelajari, mood)
nilai            (id, matkul_id, kategori[quiz/tugas/uts/uas/project/tubes], nama_item, nilai, tanggal)
tugas_deadline   (id, matkul_id, judul, deskripsi, deadline, status, prioritas)
semester         (id, nama_semester, tahun_ajaran, ipk)
```

---

## 7. Rekomendasi AI Tools Pendukung

- **Antigravity (Google)** — untuk build full aplikasi dari spec ini
- **Claude Code / Claude di chat ini** — untuk debugging, nambah fitur, atau nanya-nanya progress development
- **v0.dev (Vercel)** — kalau butuh generate komponen UI cepat sebelum diintegrasikan ke Antigravity
- **Prisma Studio** — GUI bawaan Prisma buat lihat/edit data MySQL langsung tanpa phpMyAdmin

---

## 8. Prompt Siap Pakai untuk Antigravity

Copy-paste ini ke Antigravity sebagai starting prompt:

> Buatkan aplikasi web "Semestr" — daily academic tracker untuk mahasiswa (8 matkul per semester), menggunakan Next.js 15 (App Router) + TypeScript + Prisma ORM + MySQL (local via XAMPP) + Tailwind CSS + GSAP untuk animasi.
>
> Fitur: (1) Dashboard ringkasan harian, (2) CRUD jadwal 8 matkul, (3) Progress harian per matkul (catatan & materi dipelajari), (4) Pencatatan nilai per kategori (quiz, tugas, UTS, UAS, project, tubes) dengan grafik, (5) Tugas & deadline tracker dengan status & prioritas, (6) Statistik IPK per semester, (7) AI assistant chatbot animasi (mascot kecil, idle animation, greeting otomatis, reminder deadline, bisa diajak chat via Anthropic API).
>
> Design: iOS/Apple style — clean, minimalist, rounded card, bottom tab navigation, glassmorphism ringan, font Inter, animasi GSAP di transisi halaman dan elemen interaktif. Fully responsive.
>
> Setup harus jalan di localhost dengan MySQL sebagai database (via XAMPP), Prisma untuk schema & migration. Sertakan seed data contoh 8 matkul untuk testing.

---

Kalau mau, saya bisa langsung buatkan **wireframe/mockup visual dashboard-nya** (biar kebayang tampilan iOS-style-nya sebelum dikasih ke Antigravity) — mau saya buatkan?

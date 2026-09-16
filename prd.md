# Product Requirements Document — Semestr

**Versi:** 1.0
**Pemilik Produk:** Yossika — Teknik Informatika, Telkom University Purwokerto
**Status:** Draft untuk development (Antigravity)

---

## 1. Ringkasan Produk

Semestr adalah aplikasi web personal untuk mengelola aktivitas akademik harian mahasiswa: jadwal matkul, progress belajar harian, pencatatan nilai per kategori, dan deadline tugas — dilengkapi asisten AI yang memahami konteks data akademik penggunanya. Aplikasi ini untuk penggunaan satu orang (single-user), dijalankan di localhost, dan dirancang agar mudah di-generate oleh AI coding agent (Antigravity) maupun dikembangkan lanjut secara mandiri.

## 2. Latar Belakang & Masalah

Saat ini pencatatan progress belajar, nilai, dan deadline tersebar di beberapa tempat (LMS kampus, catatan manual, memori). Tidak ada satu tempat yang merangkum: apa yang sudah dipelajari hari ini, bagaimana tren nilai per matkul, dan deadline apa yang mendekat — semuanya dalam satu tampilan yang cepat dicek setiap hari.

## 3. Target Pengguna

Pengguna tunggal: mahasiswa S1 Teknik Informatika, semester berjalan dengan 8 matkul aktif per semester. Aplikasi dipakai setiap hari sebagai rutinitas — cek pagi (jadwal & deadline), input progress setelah belajar/kuliah, update nilai setelah hasil keluar.

## 4. Tujuan Produk

1. Satu dashboard harian yang langsung menjawab: "hari ini ngapain, deadline apa, nilai gimana."
2. Riwayat progress belajar per matkul yang bisa ditelusuri ke belakang (timeline).
3. Estimasi nilai akhir per matkul berjalan otomatis dari input kategori nilai.
4. Insight matkul mana yang butuh perhatian lebih, berbasis data — bukan tebakan.

## 5. Lingkup

### In Scope (v1)
- Autentikasi single-user (login credentials sederhana)
- CRUD matkul & jadwal mingguan
- Input & riwayat progress harian per matkul
- Pencatatan nilai per kategori dengan estimasi nilai akhir
- Tugas & deadline tracker dengan status dan prioritas
- Statistik IPK per semester dan tren nilai
- AI assistant (chat + greeting + reminder proaktif)

### Out of Scope (v1)
- Multi-user / kolaborasi
- Sinkronisasi otomatis dengan LMS kampus (tidak ada API resmi)
- Aplikasi mobile native (web responsive cukup untuk v1)
- Notifikasi push di luar browser (email/WhatsApp reminder — kandidat v2)

## 6. Fitur & User Stories

### 6.1 Dashboard Utama
**User story:** Sebagai mahasiswa, saya ingin membuka satu halaman dan langsung tahu jadwal hari ini, progress belum diisi, dan deadline mendekat.

Acceptance criteria:
- Menampilkan jadwal matkul hari ini terurut berdasarkan jam
- Menampilkan hingga 3 deadline terdekat (≤ 7 hari), dengan penanda visual jika < 3 hari
- Kartu ringkasan IPK semester berjalan
- Sapaan AI Assistant yang berubah sesuai waktu (pagi/siang/malam) dan data hari itu

### 6.2 Manajemen Matkul & Jadwal
**User story:** Sebagai mahasiswa, saya ingin mendaftarkan matkul semester ini beserta jadwalnya agar sistem tahu rutinitas mingguan saya.

Acceptance criteria:
- CRUD matkul: nama, dosen, SKS, hari, jam mulai/selesai, ruang, semester
- Matkul terikat ke satu semester (bukan hardcode 8 — jumlah matkul per semester bisa berbeda tiap semester)
- Tampilan jadwal mingguan (grid hari × jam)
- Validasi bentrok jadwal saat menambah matkul baru

### 6.3 Progress Harian & Notes
**User story:** Sebagai mahasiswa, saya ingin mencatat apa yang saya pelajari dan bagaimana pemahaman saya setiap hari, per matkul.

Acceptance criteria:
- Input harian: matkul, tanggal, materi dipelajari, catatan bebas, tingkat pemahaman (skala)
- Lampiran file/gambar opsional per entri
- Riwayat progress ditampilkan sebagai timeline per matkul, bisa difilter per rentang tanggal
- Entri progress bisa diedit/dihapus

### 6.4 Pencatatan Nilai
**User story:** Sebagai mahasiswa, saya ingin mencatat nilai per kategori dan melihat estimasi nilai akhir tiap matkul.

Acceptance criteria:
- Kategori: Quiz, Tugas, UTS, UAS, Project, Tubes
- Setiap matkul punya bobot per kategori yang bisa diatur (default sama rata, bisa disesuaikan)
- Estimasi nilai akhir dihitung otomatis dari nilai × bobot
- Grafik tren nilai per matkul dan perbandingan antar matkul (Recharts)

### 6.5 Tugas & Deadline Tracker
**User story:** Sebagai mahasiswa, saya ingin melihat semua tugas dengan status dan prioritas agar tidak ada yang terlewat.

Acceptance criteria:
- To-do dengan judul, deskripsi, matkul terkait, due date, prioritas (rendah/sedang/tinggi), status (belum/proses/selesai)
- Tampilan list dan tampilan kalender
- Reminder proaktif muncul di dashboard/AI assistant untuk deadline < 3 hari yang belum selesai

### 6.6 Statistik & Insight
**User story:** Sebagai mahasiswa, saya ingin tahu matkul mana yang butuh perhatian lebih berdasarkan data, bukan perasaan.

Acceptance criteria:
- IPK per semester dan tren keseluruhan (line chart)
- Skor "perlu perhatian" per matkul berdasarkan kombinasi: nilai berjalan rendah, frekuensi progress harian rendah, tugas tertunda
- Ranking matkul dari yang paling butuh perhatian ke yang paling aman

### 6.7 AI Assistant
**User story:** Sebagai mahasiswa, saya ingin asisten yang tahu jadwal, nilai, dan deadline saya, dan bisa saya ajak diskusi soal itu.

Acceptance criteria:
- Karakter kecil di pojok layar dengan idle animation (GSAP)
- Greeting otomatis saat pertama membuka app, dinamis berdasarkan jadwal/deadline hari itu
- Chat: bisa menjawab pertanyaan tentang progress, nilai, deadline berdasarkan data di database pengguna (bukan data umum)
- Voice greeting via Web Speech API (opsional, bisa dimatikan)
- Reminder proaktif berbasis data, bukan jadwal cron acak

### 6.8 Autentikasi
Acceptance criteria:
- Login single-user dengan credentials (NextAuth)
- Session persist, logout manual

## 7. Data Model

```
users            id, nama, email, password_hash

semester         id, nama_semester, tahun_ajaran, ipk, is_active

matkul           id, semester_id, nama, dosen, sks, hari, jam_mulai, jam_selesai, ruang

progress_harian  id, matkul_id, tanggal, materi_dipelajari, catatan, tingkat_pemahaman, lampiran_url

nilai_bobot      id, matkul_id, kategori, bobot_persen

nilai            id, matkul_id, kategori, nama_item, nilai, tanggal

tugas_deadline   id, matkul_id, judul, deskripsi, deadline, status, prioritas
```

Catatan desain: `matkul` terikat ke `semester_id`, bukan jumlah tetap 8 — mendukung semester berjalan yang berbeda jumlah matkulnya di masa depan.

## 8. Non-Functional Requirements

- Responsif penuh (mobile-first, dipakai juga dari HP)
- Waktu muat dashboard < 1 detik di localhost
- Semua data tersimpan lokal (MySQL via XAMPP) — tidak ada dependency cloud wajib selain API AI assistant
- Password di-hash, tidak ada credential API AI yang ter-expose ke client

## 9. Success Metrics

- Dashboard dibuka dan progress harian diisi minimal 5x/minggu (indikator adopsi rutin)
- Estimasi nilai akhir tersedia untuk seluruh matkul aktif sebelum UAS
- Tidak ada deadline yang terlewat tanpa peringatan (reminder < 3 hari selalu muncul)

## 10. Roadmap

**MVP (Fase 1):** Auth, CRUD matkul & jadwal, progress harian, dashboard dasar
**Fase 2:** Pencatatan nilai + estimasi + grafik, tugas & deadline tracker
**Fase 3:** Statistik & insight, AI assistant (chat + greeting + reminder)
**Fase 4 (opsional):** Voice greeting, export data, multi-semester archive view

## 11. Open Questions

- Bobot nilai per kategori: default sama rata atau diinput manual per matkul dari awal?
- Reminder proaktif: cukup tampil di dashboard, atau perlu notifikasi browser (Web Notifications API)?

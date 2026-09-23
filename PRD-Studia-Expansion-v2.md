# PRD v2.0 — Studia (Academic OS untuk Mahasiswa Indonesia)
**Status:** Draft strategi untuk eksekusi via Antigravity
**Pemilik Produk:** Yossika Putra Erlangga — Teknik Informatika, Telkom University Purwokerto
**Basis:** Dokumen ini memperluas `prd.md` v1.0 (single-user, MVP) menjadi produk multi-tenant dengan monetisasi

---

## 0. Ringkasan Eksekutif

Studia (nama produk di-lock — lihat §1) adalah Academic OS untuk mahasiswa Indonesia: pencatatan jadwal, nilai, progress belajar, deadline, dan asisten AI kontekstual — dengan tier **Free** (selamanya gratis, fitur inti) dan **Pro** (berlangganan, fitur AI premium + integrasi kampus). Produk ini lahir dari kebutuhan personal (Semestr v1, single-user), sekarang direncanakan naik kelas jadi produk publik untuk mahasiswa Telkom University dan mahasiswa umum lainnya.

**Perubahan fundamental dari v1 ke v2:**
| Aspek | v1 (PRD lama) | v2 (dokumen ini) |
|---|---|---|
| User model | Single-user, localhost | Multi-tenant, cloud (Vercel + hosted MySQL/Postgres) |
| Auth | Credentials sederhana | NextAuth multi-user + isolasi data ketat per `user_id` |
| Monetisasi | Tidak ada | Free selamanya + Pro berlangganan |
| AI | 1 asisten chat kontekstual | Asisten chat + AI Translator + Auto-Input Vision + Auto-Report |
| Target | 1 orang (pemilik) | Mahasiswa Telkom University → mahasiswa Indonesia umum |

---

## 1. Branding — Keputusan yang Harus Dikunci Duluan

Saat ini nama produk pecah 3 arah: title tag "Semestr", domain kerja "studia-id", repo GitHub "studia". **Sebelum fitur baru dikerjakan, kunci satu nama** (rekomendasi: **Studia**, karena lebih universal untuk ekspansi di luar Telkom University, sementara "Semestr" terasa lebih niche/personal). Setelah dikunci:
- Ganti semua title tag, meta description, OG tags, README, dan copy di landing page ke nama final.
- Daftarkan domain custom sesuai nama final sebelum submit ke Google Search Console (lihat rekomendasi terpisah di percakapan).

---

## 2. Model Membership

### 2.1 Free (selamanya, tanpa kartu kredit)
- Semua fitur inti v1: jadwal, anti-bentrok, presensi kamera, pencatatan nilai + estimasi, tugas/deadline tracker, statistik dasar.
- Asisten AI chat dengan **kuota harian terbatas** (misal 15 pesan/hari) — ini penting untuk kontrol biaya API, lihat §5.
- 1 semester aktif tersimpan penuh; semester lama diarsipkan ringkas (read-only).

### 2.2 Pro (berlangganan bulanan/semester)
- Kuota AI chat lebih besar / unlimited dengan fair-use limit.
- **AI Translator** (§4.1)
- **Auto-Input via Screenshot/Vision** (§4.2)
- **AI Auto-Report** (§4.3)
- Sinkronisasi otomatis jadwal dari i-Gracias/SIAKAD (kalau memungkinkan secara teknis/legal — lihat catatan risiko §7)
- Live Voice Duplex assistant dengan avatar
- Export PDF transkrip & laporan progress semester
- Riwayat semester penuh tanpa batas (multi-tahun)

### 2.3 Harga (usulan awal, perlu divalidasi ke target user)
Untuk target mahasiswa, harga harus terasa "harga jajan", bukan harga SaaS korporat. Usulan: **Rp 15.000–25.000/bulan** atau **Rp 60.000–90.000/semester** (diskon signifikan untuk komitmen semester, karena siklus pemakaian mahasiswa memang per-semester). Pertimbangkan diskon early-adopter untuk mahasiswa Telkom University Purwokerto sebagai basis pertama.

---

## 3. Koreksi Strategis: "ML Besar" vs Kenyataan Teknis

Permintaan awal menyebut butuh *machine learning besar* untuk fitur auto-input dari screenshot dan AI translator. **Ini kemungkinan besar tidak perlu**, dan penting untuk diluruskan sebelum budgeting waktu/biaya:

- **Auto-input dari screenshot** (misal screenshot jadwal dari SIAKAD, atau soal tugas dari LMS) tidak butuh training model ML sendiri. Model vision multimodal yang sudah ada (Claude API dengan image input, atau Gemini Flash yang sudah dipakai) **sudah bisa** membaca screenshot, mengekstrak teks/tabel, dan mengembalikan data terstruktur (JSON) yang langsung dimasukkan ke form. Ini murni *prompt engineering + structured output*, bukan ML custom.
- **AI Translator** juga tidak perlu model terjemahan sendiri — cukup panggil model yang sudah dipakai (Claude/Gemini) dengan prompt "terjemahkan dan jelaskan istilah teknis X ke Bahasa Indonesia/Inggris dengan konteks akademik". Kualitasnya sudah sangat baik untuk kebutuhan mahasiswa.
- **Implikasi:** biaya riil bukan di "membangun ML", tapi di **biaya panggilan API per user** (karena fitur vision/translate memanggil model tiap request) dan **rekayasa prompt + validasi output** supaya hasil ekstraksi akurat dan konsisten. Fokus tim dev harus di situ, bukan di infrastruktur ML training/inference sendiri — itu akan menghabiskan waktu berbulan-bulan untuk hasil yang kalah dari sekadar memanggil API yang sudah ada.

---

## 4. Fitur Pro Baru (Detail)

### 4.1 AI Translator Akademik
**User story:** Sebagai mahasiswa, saya ingin menempel/upload materi kuliah berbahasa Inggris (jurnal, slide, soal) dan mendapat terjemahan + penjelasan istilah teknis, bukan cuma terjemahan mentah.
- Input: teks tempel, upload PDF/gambar slide, atau screenshot.
- Output: terjemahan + istilah kunci dijelaskan singkat + opsi "jelaskan lebih detail" per paragraf.
- Batasan Pro: kuota halaman/kata per bulan (kontrol biaya).

### 4.2 Auto-Input via Screenshot (Vision)
**User story:** Sebagai mahasiswa, saya ingin screenshot jadwal dari SIAKAD atau soal tugas dari grup WhatsApp, lalu sistem otomatis mengisi form jadwal/tugas tanpa saya ketik ulang.
- Alur: user upload gambar → model vision mengekstrak field relevan (nama matkul, jam, hari, deadline, dsb) dalam format terstruktur → ditampilkan sebagai **preview form yang bisa dikoreksi user sebelum disimpan** (jangan auto-save langsung, karena OCR/vision tetap bisa salah baca).
- Validasi: cross-check dengan data matkul yang sudah ada (deteksi bentrok otomatis tetap jalan di sini).

### 4.3 AI Auto-Report / Rekap Otomatis
**User story:** Sebagai mahasiswa, saya ingin AI merangkum progress belajar mingguan/bulanan saya jadi laporan singkat yang bisa saya baca cepat atau lampirkan ke logbook (misal untuk laporan PKL/magang atau evaluasi pribadi).
- Rekap otomatis dari data progress harian + nilai + tugas selesai dalam rentang waktu tertentu.
- Output: ringkasan naratif + poin highlight ("matkul X butuh perhatian karena Y") — bisa diekspor PDF.
- Ini yang paling bernilai untuk retensi Pro: laporan berkala yang terasa personal dan "dikerjakan otomatis oleh AI" adalah value proposition kuat untuk harga berlangganan.

### 4.4 Live Voice Duplex + Avatar 3D
- Fitur showcase/diferensiasi Pro tier, tapi **prioritas paling rendah** secara ROI dibanding 4.1–4.3. Sarankan dikerjakan setelah 3 fitur di atas stabil dan ada traksi user Pro nyata.

---

## 5. Kontrol Biaya AI (Non-Negotiable Sebelum Launch Publik)

- Rate limit per user per hari, berbeda untuk Free vs Pro.
- Cache hasil translate/ekstraksi kalau ada permintaan identik/mirip.
- Logging biaya token per user supaya bisa dianalisis unit economics sebelum menetapkan harga final di §2.3.
- Fallback ke model lebih murah/cepat (misal Gemini Flash) untuk fitur volume tinggi (chat harian), dan model lebih presisi untuk fitur sensitif akurasi (vision extraction, translator) sesuai kebutuhan.

---

## 6. Perubahan Arsitektur & Data Model

- Migrasi dari asumsi single-user ke **strict multi-tenancy**: setiap tabel (`matkul`, `nilai`, `tugas_deadline`, `progress_harian`) sudah punya relasi ke user — pastikan **setiap query di layer Prisma di-scope `where: { userId }`** tanpa terkecuali, dan idealnya ada middleware/helper terpusat supaya tidak ada endpoint yang lupa filter ini (ini titik kebocoran data paling umum di aplikasi multi-tenant pemula).
- Tabel baru yang dibutuhkan: `subscription` (userId, plan, status, periode aktif, payment provider ref), `ai_usage_log` (userId, fitur, token terpakai, timestamp — untuk kontrol biaya §5).
- Pertimbangkan migrasi dari MySQL lokal (XAMPP) ke database cloud terkelola (PlanetScale/Neon/Supabase Postgres) karena aplikasi sekarang live di Vercel dan butuh koneksi database yang juga cloud-native, bukan localhost.
- Payment gateway lokal: Midtrans atau Xendit (mendukung QRIS, e-wallet, yang paling relevan untuk mahasiswa Indonesia).

---

## 7. Risiko & Catatan Legal

- **UU PDP**: aplikasi menyimpan data akademik pribadi mahasiswa. Privacy Policy harus eksplisit soal data apa yang disimpan, retensi, dan hak hapus akun.
- **Sinkronisasi otomatis i-Gracias/SIAKAD**: kemungkinan besar tidak ada API resmi publik dari Telkom University. Fitur ini beresiko butuh scraping/otomasi login mahasiswa ke sistem kampus — ini area abu-abu (ToS kampus, keamanan credential mahasiswa). Rekomendasi: validasi dulu apakah kampus punya kanal resmi (API/SSO) sebelum janji fitur ini ke publik; kalau tidak ada, ganti pendekatan jadi "import manual via screenshot" (memakai fitur 4.2, lebih aman secara legal).
- **Kredensial default di repo publik** (lihat audit) — selesaikan sebelum ekspansi user.

---

## 8. Roadmap Bertahap

**Fase A — Fondasi (sebelum fitur baru apapun):**
Kunci nama brand, domain custom, rotate secrets, audit isolasi data multi-user, rate limit AI dasar.

**Fase B — Monetisasi Dasar:**
Tabel subscription, integrasi payment gateway, gating fitur Free vs Pro di kode (bukan cuma di UI).

**Fase C — Fitur AI Premium:**
4.2 Auto-Input Vision → 4.1 AI Translator → 4.3 AI Auto-Report (urutan berdasarkan effort vs value).

**Fase D — Showcase & Growth:**
Live Voice Duplex, integrasi kampus (kalau legal/teknis memungkinkan), ekspansi ke mahasiswa non-Telkom.

---

## 9. Metrik Sukses

- % user Free yang upgrade ke Pro dalam 1 semester pertama.
- Retensi mingguan (dashboard dibuka + progress diisi) — indikator utama produk benar-benar dipakai harian.
- Biaya API AI per user aktif per bulan (harus tetap di bawah margin harga Pro).
- Akurasi ekstraksi fitur Auto-Input Vision (perlu spot-check manual berkala).

---

## 10. Pertanyaan Terbuka untuk Diputuskan

1. Nama final produk: **Semestr** atau **Studia**?
2. Harga Pro final — perlu validasi langsung ke calon user (survei singkat ke teman satu angkatan)?
3. Integrasi SIAKAD: dikerjakan riil atau diganti pendekatan "import manual"?
4. Payment gateway: Midtrans atau Xendit — mana yang biaya setup/fee-nya lebih ringan untuk skala awal (puluhan-ratusan user)?

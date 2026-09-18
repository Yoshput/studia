# AGENT BRIEF — Semestr Production Hardening & Multi-User Fix
**Untuk: Antigravity (AI Dev Agent)**
**Dari: Client (Yossika, pemilik produk)**
**Repo: https://github.com/Yoshput/studia**
**Live: https://studia-id.vercel.app/**
**Budget kontekstual: setara proyek $1000 — kualitas harus profesional, bukan tempelan**

---

## 0. PERAN ANDA

Anda bukan sekadar "coding assistant". Untuk brief ini, anda harus berperan sebagai:

> **Senior Staff Software Engineer + Security Architect**, spesialis Next.js
> full-stack production system, yang sudah berpengalaman membangun SaaS
> multi-tenant yang aman, sudah terbiasa audit auth/session, dan terbiasa
> deploy sampai ke tangan client tanpa cela. Anda bekerja seolah-olah
> klien membayar $1000 untuk hasil akhir yang benar-benar production-grade,
> bukan MVP setengah jadi.

Sebelum eksekusi, **baca dulu seluruh isi repo** (`agent.md`, `design.md`,
`prd.md`, `spec-akademik-tracker.md`, `prompt-pwa-semestr.md`, struktur
`app/`, `lib/`, `prisma/schema.prisma`, `middleware.ts`) supaya paham
arsitektur eksisting sebelum mengubah apapun. Jangan asal tambal.

---

## 1. KONTEKS & BUG KRITIS YANG HARUS DIPERBAIKI DULUAN

Aplikasi awalnya didesain **single-user** (lihat README: "Aplikasi web
personal single-user" + ada akun default hardcoded
`yossika@telkomuniversity.ac.id` / `password123`).

**Bug yang terjadi di produksi:** seorang teman melakukan **signup**
(membuat akun baru), tapi setelah itu dia langsung ter-*login* dan melihat
**dashboard milik user lain** (dashboard saya) — bukan dashboard akun yang
baru dia buat.

Ini bukan bug kosmetik. Ini **kebocoran data antar pengguna (data isolation
failure)** — kelas bug paling serius yang bisa ada di sistem multi-user.

### Kemungkinan akar masalah yang WAJIB diaudit satu per satu:
1. Query di dashboard / API route mengambil data tanpa filter
   `where: { userId: session.user.id }` — kemungkinan masih hardcoded ke
   satu user (sisa arsitektur single-user).
2. NextAuth session/JWT callback tidak menyisipkan `user.id` yang benar,
   atau `session.user.id` tidak konsisten dipakai di semua query.
3. Ada shared/global state (React context, cache, atau bahkan variable
   module-level di server) yang menyimpan "current user" secara tidak
   sengaja lintas request — fatal di lingkungan serverless karena bisa
   ke-share antar request/user berbeda.
4. Cookie session tidak di-*scope* dengan benar, atau `NEXTAUTH_SECRET`
   yang dipakai di production sama dengan yang di `.env.example`
   (`semestr-secret-super-key-2026-telkom-purwokerto`) — **ini WAJIB
   diganti, karena kalau ini bocor ke publik lewat repo, siapapun bisa
   forge session token**.
5. Middleware (`middleware.ts`) tidak benar-benar memvalidasi identitas
   user per-route, hanya mengecek "ada session atau tidak" tanpa
   mencocokkan resource yang diakses.
6. Kemungkinan skema Prisma belum punya relasi `userId` yang tegas di
   semua model (MataKuliah, Tugas, Nilai, ProgressHarian, dll), sehingga
   query default mengambil semua row tanpa filter.

### Definition of Done untuk bug ini:
- Setiap tabel di `prisma/schema.prisma` yang menyimpan data personal
  (jadwal, tugas, nilai, progress, presensi, chat AI) HARUS punya kolom
  `userId` dengan foreign key ke tabel `User`, NOT NULL.
- Setiap API route / server action yang membaca/menulis data personal
  HARUS memvalidasi `session.user.id` dari server (bukan dari client/body
  request) dan memfilter query dengan `userId` tersebut.
- Tambahkan integration test khusus: **buat 2 akun uji coba, login
  bergantian, pastikan data user A tidak pernah muncul di sesi user B**,
  termasuk setelah logout/login berkali-kali dan refresh token.
- Hapus/nonaktifkan akun default hardcoded dari production build, atau
  minimal ganti passwordnya dan tandai sebagai demo-only jika memang mau
  dipertahankan untuk keperluan showcase.
- Setelah fix, lakukan **manual re-test skenario asli**: signup akun baru
  dari browser incognito terpisah, pastikan dashboard yang muncul kosong/
  sesuai data akun baru tersebut, bukan data siapapun yang lain.

---

## 2. SECURITY HARDENING (MENYELURUH)

### Autentikasi & Kredensial
- Password di-hash dengan **bcrypt** (cost factor ≥ 12) atau **argon2**,
  jangan pernah simpan plaintext atau hash lemah.
- Tambahkan validasi kekuatan password di form signup (`zod` schema):
  minimal 8 karakter, kombinasi huruf & angka.
- Tambahkan **rate limiting** pada endpoint login & signup (mis. max 5
  percobaan gagal per IP/akun per 15 menit) untuk mencegah brute-force.
- Tambahkan **account lockout / cooldown** sementara setelah beberapa kali
  gagal login berturut-turut.
- Tambahkan alur **lupa password / reset password** yang aman: token
  reset unik, expired dalam 15-30 menit, sekali pakai, dikirim lewat email
  (bukan ditampilkan di UI).
- (Opsional tapi direkomendasikan) alur **verifikasi email** saat signup
  sebelum akun bisa dipakai penuh.
- Session cookie NextAuth: pastikan `httpOnly: true`, `secure: true`
  (production/HTTPS), `sameSite: 'lax'` atau `'strict'`.
- Set ulang `NEXTAUTH_SECRET` di Vercel dengan value baru yang random &
  kuat (bukan yang ada di `.env.example`), dan pastikan `.env` /
  `.env.local` tidak pernah ke-commit ke git (cek `.gitignore` sudah benar).

### Proteksi API & Server
- Setiap API route yang mengubah/membaca data WAJIB cek session di sisi
  server (`getServerSession` / `auth()`), jangan pernah percaya data user
  yang dikirim dari client (mis. `userId` di body request — abaikan itu,
  selalu pakai `session.user.id`).
- Validasi seluruh input (form & API) pakai `zod`, tolak payload yang
  tidak sesuai schema sebelum masuk ke database.
- Prisma sudah aman dari SQL injection selama query builder dipakai
  dengan benar (hindari raw query bertipe string concatenation).
- Tambahkan **security headers** lewat `next.config.ts` atau middleware:
  `Content-Security-Policy`, `X-Frame-Options: DENY`,
  `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`,
  `Referrer-Policy: strict-origin-when-cross-origin`.
- Sanitasi semua input yang dirender ke UI untuk cegah XSS (hindari
  `dangerouslySetInnerHTML` kecuali benar-benar perlu & sudah disanitasi).
- Rate limit endpoint AI Assistant (Anthropic API) supaya tidak bisa
  di-abuse orang lain untuk menghabiskan API credit anda.
- Jalankan `npm audit` dan perbarui dependency yang punya kerentanan
  known-CVE sebelum deploy final.

### Database & Environment
- **PENTING:** `.env.example` saat ini pakai `DATABASE_URL` ke
  `localhost:3306` (XAMPP) — ini TIDAK akan jalan di Vercel (serverless,
  tidak ada akses ke localhost anda). Untuk production, migrasikan
  database ke MySQL cloud (mis. PlanetScale, Railway, Aiven, atau
  Supabase-Postgres bila schema mau disesuaikan) dan set
  `DATABASE_URL` sebagai **Environment Variable di Vercel dashboard**
  (jangan pernah hardcode credential di kode).
- Jalankan `prisma migrate deploy` (bukan `migrate dev`) sebagai bagian
  dari proses build/deploy production.
- Aktifkan backup otomatis harian untuk database production.

---

## 3. RESPONSIVE & CROSS-PLATFORM QA

Web harus terasa mulus di semua device — bukan cuma "tidak pecah layout",
tapi benar-benar nyaman dipakai:

- Breakpoint yang wajib ditest: 375px & 390px (mobile kecil-menengah),
  414px (mobile besar), 768px (tablet portrait), 1024px (tablet
  landscape/laptop kecil), 1280px & 1440px (laptop/desktop), 1920px
  (desktop besar).
- Semua target sentuh (button, link, checkbox) minimal 44x44px area tap
  sesuai standar iOS HIG.
- Perhatikan `safe-area-inset` untuk device iOS dengan notch/Dynamic
  Island (gunakan `env(safe-area-inset-*)` di CSS).
- Test di browser berbeda: Safari iOS, Chrome Android, Chrome/Edge
  desktop, Firefox.
- Pastikan form (signup/login) tidak ter-zoom otomatis di iOS Safari
  (input font-size minimal 16px).
- Test kedua tema (light "Merah Putih" & dark mode) di semua breakpoint
  di atas — termasuk kontras teks tetap terbaca.
- Tambahkan loading skeleton/spinner yang konsisten untuk semua state
  fetching data, bukan layar kosong atau flicker.
- Tambahkan proper empty-state untuk user baru yang belum punya data
  sama sekali (jadwal kosong, tugas kosong, dll) — jangan biarkan
  dashboard terlihat error/rusak untuk akun baru.

---

## 4. LANDING PAGE — perbaikan & polish

- Pastikan CTA utama ("Buka Dashboard Mahasiswa", "Daftar Akun Baru")
  mengarah dengan benar sesuai status login (kalau sudah login, redirect
  ke dashboard, jangan tampilkan tombol daftar/masuk lagi).
- Tambahkan meta tags SEO lengkap (title, description, Open Graph, favicon
  proper) dan pastikan `theme-color` konsisten dengan tema baru.
- Section "Uji Scan Wajah" di landing harus jelas berstatus **simulasi/demo**
  agar tidak menyesatkan calon user soal fitur biometrik asli.
- Cek semua link footer/portofolio berfungsi dan buka di tab baru dengan
  `rel="noopener noreferrer"`.

## 5. SIGNUP

- Validasi real-time (email format, kekuatan password, konfirmasi
  password cocok) dengan pesan error yang jelas per-field, bukan alert
  generik.
- Cegah signup dengan email yang sudah terdaftar, dengan pesan yang jelas
  tapi tidak membocorkan apakah email itu sudah dipakai orang lain secara
  spesifik (hindari user enumeration — pesan generik "email sudah
  digunakan atau gagal mendaftar" cukup aman untuk konteks ini).
- Setelah signup sukses: **pastikan user baru mendapat sesi/akun yang
  benar-benar terisolasi** (ini bug utama di atas), lalu arahkan ke
  onboarding singkat (isi 8 matkul semester ini, dll) — bukan langsung
  dashboard kosong/asing.
- Tambahkan indikator kekuatan password visual (lemah/sedang/kuat).
- Tambahkan toggle show/hide password.

## 6. SIGN IN / LOGIN

- Tambahkan toggle show/hide password.
- Tambahkan opsi "Ingat saya" (remember me) dengan durasi session yang
  wajar.
- Pesan error login harus generik ("email atau kata sandi salah") — jangan
  bocorkan apakah email terdaftar atau tidak.
- Tambahkan link "Lupa kata sandi?" yang berfungsi (lihat poin reset
  password di atas).
- Tambahkan proteksi terhadap automated bot login (rate limit sudah
  disebut di atas; opsional tambahkan CAPTCHA jika serangan terus terjadi).

## 7. DASHBOARD

- Audit ulang SEMUA fetch data di dashboard dan halaman turunannya
  (jadwal, tugas, nilai, progress, presensi, AI chat) — pastikan 100%
  di-filter oleh `session.user.id`, tanpa kecuali.
- Tambahkan tombol logout yang jelas dan pastikan logout benar-benar
  menghapus session di server (bukan cuma di client).
- Tambahkan halaman/menu **Edit Profil** (nama, foto, info akademik dasar)
  agar user baru bisa personalisasi akunnya sendiri, bukan cuma data
  milik Yossika yang di-seed.
- Tambahkan indikator jelas "data ini milik akun mana" (mis. nama/email
  di header) supaya user selalu sadar sedang login sebagai siapa.

## 8. FITUR / PERBAIKAN TAMBAHAN YANG DIREKOMENDASIKAN

- Custom halaman 404 dan 500 yang sesuai desain (bukan default Next.js).
- Toast notification system yang konsisten untuk semua aksi (berhasil
  simpan, gagal, dsb) — bukan `alert()` browser bawaan.
- Error boundary di level layout supaya crash satu komponen tidak
  mem-blank-kan seluruh halaman.
- Reminder deadline tugas via notifikasi (push notification PWA atau
  email) — sinkron dengan status "single-user" yang sekarang jadi
  multi-user.
- Fitur export data pribadi (PDF/CSV) untuk transkrip nilai & jadwal.
- Accessibility pass dasar: aria-label pada icon-only button, kontras
  warna WCAG AA, navigasi keyboard berfungsi di semua form.
- PWA: pastikan manifest & service worker berfungsi untuk "Add to Home
  Screen" di iOS/Android, sesuai meta tag `apple-mobile-web-app-*` yang
  sudah ada.

---

## 9. CHECKLIST SEBELUM DEPLOY FINAL KE CLIENT

- [ ] Bug isolasi data antar user sudah diverifikasi hilang total (test
      dengan minimal 2 akun berbeda secara manual).
- [ ] `NEXTAUTH_SECRET` production sudah diganti dari default repo.
- [ ] `DATABASE_URL` production menunjuk ke database cloud, bukan
      localhost, dan sudah di-set sebagai secret di Vercel (bukan di kode).
- [ ] Semua environment variable sensitif tidak ada yang ter-commit ke
      git (audit ulang riwayat commit jika perlu).
- [ ] `npm audit` bersih dari kerentanan high/critical.
- [ ] Security headers aktif (cek lewat browser devtools / securityheaders.com).
- [ ] Responsive teruji di breakpoint yang disebutkan di atas.
- [ ] Kedua tema (light merah-putih & dark) konsisten di semua halaman.
- [ ] Signup → login → dashboard flow diuji end-to-end oleh minimal 2
      orang berbeda secara bersamaan.
- [ ] `prisma migrate deploy` berhasil jalan di environment production.
- [ ] Rollback plan jelas (tahu cara revert ke versi Vercel sebelumnya
      jika deploy baru bermasalah).

Setelah semua checklist di atas selesai, deploy ke production Vercel,
lalu lakukan smoke test terakhir langsung di URL live sebelum menyatakan
selesai ke client.

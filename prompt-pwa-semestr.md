# Prompt untuk Antigravity — Jadikan Semestr sebagai PWA + Notifikasi Pengingat

Konteks: aplikasi bernama **Semestr** (studia-id.vercel.app), stack Next.js 15 (App Router) + Prisma + MySQL + Tailwind. Tujuan: jadikan PWA agar bisa di-install ke desktop (Windows/Mac) dan home screen HP (Android/iOS), plus sistem notifikasi pengingat deadline yang muncul sebagai overlay di dalam app maupun sebagai push notification asli dari OS.

---

## TUGAS

Ubah project Next.js "Semestr" ini menjadi Progressive Web App (PWA) yang full installable, dengan sistem reminder/notifikasi untuk deadline tugas dan jadwal kuliah.

### 1. Setup PWA dasar (installability)

- Install dan konfigurasi `next-pwa` (atau `@ducanh2912/next-pwa` — versi yang lebih stabil untuk App Router Next.js 15) sebagai wrapper `next.config.js`.
- Buat `public/manifest.json` dengan:
  - `name`: "Semestr — Academic OS"
  - `short_name`: "Semestr"
  - `start_url`: "/dashboard"
  - `display`: "standalone"
  - `background_color` dan `theme_color` mengikuti warna brand (biru/putih sesuai dashboard yang ada)
  - `icons`: minimal 192x192 dan 512x512 (termasuk versi `maskable` untuk Android adaptive icon)
- Tambahkan `<link rel="manifest" href="/manifest.json">` dan meta tag `theme-color` di `app/layout.tsx`.
- Untuk iOS: tambahkan meta tag `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, dan `apple-touch-icon` (iOS tidak baca manifest.json sepenuhnya, jadi harus manual).
- Generate service worker otomatis via next-pwa untuk caching asset (biar bisa dibuka walau offline/koneksi lambat), dengan strategi `NetworkFirst` untuk data API dan `CacheFirst` untuk asset statis.
- Tambahkan komponen `InstallPrompt` custom (bukan cuma andalkan prompt native browser):
  - Deteksi event `beforeinstallprompt`, simpan, dan tampilkan tombol "Install App" custom di UI (misal di sidebar atau navbar) yang begitu diklik memanggil `prompt()`.
  - Untuk iOS Safari (yang tidak support `beforeinstallprompt`), tampilkan instruksi manual berupa modal kecil: "Tap Share → Add to Home Screen" lengkap dengan ikon share iOS.
- Pastikan setelah di-install, app kebuka dalam mode standalone (tanpa address bar browser), baik saat dibuka dari desktop taskbar/dock maupun icon home screen HP.

### 2. Sistem Notifikasi Pengingat (Push Notification asli OS)

- Implementasikan Web Push API menggunakan `web-push` (Node) di backend + Service Worker `push` event listener di frontend.
- Generate VAPID keys, simpan di `.env` (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`).
- Buat flow:
  1. User klik toggle "Aktifkan Notifikasi" di halaman Profil/Preferensi → minta permission `Notification.requestPermission()`.
  2. Kalau granted, subscribe via `pushManager.subscribe()`, kirim subscription object ke backend, simpan di tabel baru `PushSubscription` (Prisma) terhubung ke user.
  3. Buat scheduled job (pakai `node-cron` atau Vercel Cron Job kalau di-deploy ke Vercel) yang jalan tiap beberapa menit, cek tabel `Tugas`/`Deadline` dan `Jadwal`, lalu kirim push notification kalau:
     - Deadline tugas H-1 dan H-3 jam sebelum deadline
     - 15 menit sebelum jadwal kuliah dimulai
  4. Service worker terima event `push`, tampilkan `self.registration.showNotification()` dengan judul, body (nama tugas/matkul), icon, dan `data.url` supaya waktu diklik langsung buka halaman terkait (pakai `notificationclick` event + `clients.openWindow`).

### 3. Overlay Notifikasi In-App (mirip toast "Aiko" yang sudah ada di dashboard)

- Buat komponen global `<ReminderOverlay />` yang:
  - Muncul sebagai floating card di pojok kanan bawah (seperti bubble asisten yang sudah ada di desain), bisa menumpuk kalau ada beberapa reminder.
  - Auto-muncul saat: user buka dashboard dan ada tugas deadline < 24 jam, atau ada kelas yang akan mulai < 30 menit lagi.
  - Bisa di-dismiss (dengan tombol X) dan ada tombol aksi langsung ("Lihat Tugas" / "Buka Jadwal").
  - Gunakan Framer Motion untuk animasi slide-in/fade sesuai stack yang sudah dipakai project ini.
  - State reminder yang sudah di-dismiss disimpan di localStorage per hari (supaya tidak muncul berulang-ulang untuk item yang sama).

### 4. Testing & Checklist Validasi

Setelah build, tolong verifikasi dan laporkan hasil untuk:
- [ ] Lighthouse PWA audit score (target: installable = pass, semua PWA checklist hijau)
- [ ] Bisa di-install dari Chrome desktop (ikon install muncul di address bar)
- [ ] Bisa di-"Add to Home Screen" dari Chrome Android dan Safari iOS
- [ ] Setelah install, app buka standalone tanpa browser chrome
- [ ] Push notification benar-benar sampai ke device saat browser/app ditutup (bukan cuma saat tab aktif)
- [ ] Overlay in-app reminder muncul dan bisa di-dismiss dengan benar
- [ ] App tetap bisa diakses (minimal shell/cache) saat offline

### Catatan tambahan
- Jangan ubah struktur dashboard, komponen, atau desain yang sudah ada — ini murni tambahan layer PWA + notifikasi di atas app yang sudah jalan.
- Ikuti design system existing (iOS-style, minimalis, pakai Lucide icons, tanpa emoji) untuk semua komponen UI baru (install prompt, notif overlay, toggle di halaman preferensi).

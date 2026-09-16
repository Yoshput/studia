# Semestr — Daily Academic Companion 🎓

Aplikasi web personal single-user untuk mahasiswa Teknik Informatika Telkom University Purwokerto. Dirancang untuk mengelola rutinitas akademik harian: jadwal mata kuliah, progress belajar harian, pencatatan nilai per kategori, dan deadline tugas — dilengkapi asisten AI kontekstual.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Database**: MySQL (Local via XAMPP)
- **ORM**: Prisma ORM
- **Styling**: Tailwind CSS (Apple HIG / iOS Design Tokens)
- **Motion & Micro-interactions**: Framer Motion & GSAP
- **Autentikasi**: NextAuth (Credentials Provider, Single-User)
- **Visualisasi / Chart**: Recharts
- **Ikonografi**: Lucide React
- **Asisten AI**: Anthropic Claude API (dengan local fallback engine kontekstual)

---

## Panduan Setup dari Nol (Localhost)

### 1. Prasyarat
- **Node.js**: v18+ (direkomendasikan v20+)
- **XAMPP**: Modul **MySQL** aktif di port 3306

### 2. Nyalakan MySQL di XAMPP
Buka **XAMPP Control Panel** dan klik **Start** pada service **MySQL**. Pastikan port 3306 berstatus hijau/aktif.

### 3. Buat Database
Buka terminal / command prompt atau phpMyAdmin, jalankan:
```sql
CREATE DATABASE IF NOT EXISTS semestr_db;
```

### 4. Konfigurasi Environment (`.env.local`)
Buat atau periksa file `.env.local` di root direktori proyek:
```env
DATABASE_URL="mysql://root:@localhost:3306/semestr_db"
NEXTAUTH_SECRET="semestr-secret-super-key-2026-telkom-purwokerto"
NEXTAUTH_URL="http://localhost:3000"
ANTHROPIC_API_KEY="" # Opsional: Isi dengan API key Anthropic Claude jika ada
```

### 5. Install Dependencies
```bash
npm install
```

### 6. Migrasi & Seeding Database
Jalankan migrasi schema Prisma dan seed data awal (8 matkul Teknik Informatika, contoh nilai, tugas, dan progress):
```bash
npx prisma migrate dev
npx prisma db seed
```

### 7. Jalankan Aplikasi
```bash
npm run dev
```
Buka browser di [http://localhost:3000](http://localhost:3000).

---

## Akun Default Login

- **Email**: `yossika@telkomuniversity.ac.id`
- **Kata Sandi**: `password123`

---

## Fitur Utama

1. **Dashboard Ringkasan Harian**:
   - Jadwal kuliah hari ini terurut jam kuliah.
   - Ringkasan IPK semester berjalan dan total SKS aktif.
   - 3 deadline terdekat dengan penanda waspada jika ≤ 3 hari.
   - Kartu insight fokus perhatian akademik berbasis data nyata.

2. **Jadwal & Manajemen Matkul**:
   - Filter per hari (Senin - Jumat / Semua).
   - CRUD mata kuliah lengkap dengan deteksi bentrok jadwal otomatis.

3. **Tugas & Deadline Tracker**:
   - Tampilan switchable: Daftar (List) & Kalender (Calendar).
   - Filter status: Aktif, Selesai, Semua.
   - Prioritas tugas: Rendah, Sedang, Tinggi.
   - Checkbox toggle selesai langsung dari kartu.

4. **Pencatatan Nilai & Estimasi Akhir**:
   - Kategori nilai: Quiz, Tugas, UTS, UAS, Project, Tubes.
   - Pengaturan bobot per mata kuliah (dinamis, total 100%).
   - Estimasi nilai akhir & grade huruf otomatis (A, AB, B, BC, C, D, E).
   - Grafik Recharts perbandingan nilai berjalan antar mata kuliah.

5. **Progress Belajar Harian (Timeline)**:
   - Pencatatan materi, catatan refleksi, dan skala pemahaman (1–5).
   - Timeline interaktif per mata kuliah dengan filter cepat.

6. **AI Assistant Akademik**:
   - Karakter maskot vector dengan animasi idle floating GSAP.
   - Sapaan proaktif bubble di pojok layar jika ada deadline mendesak.
   - Chat sheet interaktif yang memahami data jadwal, nilai, dan tugas pengguna.
   - Voice greeting via Web Speech API (opsional, dapat dimatikan).

7. **Desain & Aksesibilitas**:
   - Mengikuti prinsip Apple Human Interface Guidelines (Apple HIG).
   - Bebas visual slop (tanpa gradient berlebih, tanpa glassmorphism berlebihan).
   - Bebas emoji di UI produksi (seluruh ikon menggunakan Lucide React).
   - Dukungan penuh Dark Mode & Light Mode dengan kontras teruji.

# Design System — Semestr

**Referensi gaya:** iOS / Apple Human Interface Guidelines, diadaptasi untuk web
**Prinsip:** tenang, fungsional, hierarki jelas — bukan tampilan "khas AI generate" yang ramai tanpa tujuan

---

## 1. Filosofi Desain

Aplikasi ini dipakai setiap hari dalam waktu singkat (cek jadwal, isi progress, cek deadline). Desain harus mengutamakan kecepatan baca informasi, bukan dekorasi. Setiap elemen visual harus punya alasan fungsional — bukan sekadar gradient atau shadow karena "terlihat modern."

## 2. Warna

### Light Mode
| Token | Nilai | Penggunaan |
|---|---|---|
| `--bg` | `#F2F2F7` | Latar utama |
| `--surface` | `#FFFFFF` | Kartu, sheet |
| `--surface-secondary` | `#F9F9FB` | Kartu bertingkat/nested |
| `--border` | `#E5E5EA` | Garis pemisah tipis |
| `--text-primary` | `#1C1C1E` | Judul, teks utama |
| `--text-secondary` | `#6E6E73` | Label, teks pendukung |
| `--accent` | `#007AFF` | Aksi utama, link, elemen aktif |
| `--success` | `#34C759` | Status selesai, nilai baik |
| `--warning` | `#FF9F0A` | Deadline mendekat |
| `--danger` | `#FF3B30` | Deadline lewat, nilai rendah |

### Dark Mode
| Token | Nilai |
|---|---|
| `--bg` | `#000000` |
| `--surface` | `#1C1C1E` |
| `--surface-secondary` | `#2C2C2E` |
| `--border` | `#38383A` |
| `--text-primary` | `#FFFFFF` |
| `--text-secondary` | `#8E8E93` |
| `--accent` | `#0A84FF` |

Aturan: accent hanya satu warna dominan (biru). Jangan tambah gradient dekoratif di background besar — gunakan warna solid dan whitespace untuk memisahkan bagian.

## 3. Tipografi

- **Font:** `Inter` sebagai default, fallback `Plus Jakarta Sans`, lalu system font (`-apple-system`, `BlinkMacSystemFont`)
- **Skala:**
  - Display (angka besar, mis. IPK): 34px / bold
  - Heading 1 (judul halaman): 28px / semibold
  - Heading 2 (judul section): 20px / semibold
  - Body: 15px / regular
  - Caption/label: 13px / medium, `--text-secondary`
- Jangan gunakan lebih dari 3 tingkat ketebalan font dalam satu layar.

## 4. Spacing & Grid

- Basis spacing 4px: gunakan kelipatan 4/8/12/16/24/32
- Padding kartu: 16–20px
- Jarak antar kartu: 12–16px
- Radius kartu: `16px` (rounded-2xl), radius tombol: `12px`
- Konten utama max-width 640px di desktop, centered — aplikasi ini bukan dashboard admin lebar, tetap terasa personal

## 5. Komponen

**Kartu (Card)**
- Background `--surface`, radius 16px, shadow tipis (`0 1px 2px rgba(0,0,0,0.04)`), border 1px `--border` di light mode
- Hindari shadow tebal/menyebar — shadow iOS itu halus, bukan dramatis

**Bottom Tab Bar**
- 5 tab: Dashboard, Jadwal, Nilai, Progress, Profil
- Ikon + label kecil, tab aktif diberi warna accent, tab nonaktif abu-abu
- Background blur ringan (`backdrop-filter: blur(20px)`) dengan opacity surface ~90%

**Sheet Modal**
- Slide-up dari bawah, radius atas 20px, drag handle kecil di tengah atas
- Digunakan untuk form tambah/edit (matkul, nilai, progress, tugas)

**Segmented Control**
- Untuk filter (mis. kategori nilai, rentang waktu progress)
- Pill background abu-abu muda, pilihan aktif berlatar putih dengan shadow tipis

**Toggle**
- Toggle iOS-style standar (hijau saat aktif)

**Chip/Badge Status**
- Bentuk pill, warna sesuai status: hijau (selesai), oranye (proses/mendekat), merah (lewat/rendah), abu (belum mulai)

**Chart (Recharts)**
- Garis tipis, satu warna accent per seri, tanpa gridline tebal, tooltip minimal
- Jangan pakai warna chart yang tidak ada di palet token di atas

## 6. Ikonografi

- Gunakan **Lucide Icons** (`lucide-react`) secara konsisten — stroke width 1.5–2px, ukuran 20px (inline) atau 24px (tab bar/header)
- **Tidak ada emoji** di UI produksi (label, tombol, notifikasi). Emoji hanya boleh muncul jika eksplisit sebagai bagian gaya chat AI assistant, itupun dibatasi maksimal
- Satu ikon = satu makna yang konsisten di seluruh aplikasi (mis. ikon kalender selalu untuk jadwal, jangan diganti-ganti)

## 7. Motion

**Framer Motion** — micro-interaction:
- Tap feedback tombol: scale 0.97, durasi 100ms
- Munculnya kartu/list item: fade + translateY 8px, durasi 200ms, stagger 30ms antar item
- Toggle/switch: spring transition bawaan

**GSAP** — transisi halaman & elemen kompleks:
- Page transition: fade + slide horizontal 16px, durasi 300ms, easing `power2.out`
- Number counter (IPK, nilai): count-up saat elemen masuk viewport, durasi 600–800ms
- Progress bar: fill dengan easing saat halaman load, bukan langsung penuh
- Deadline card mendesak (< 3 hari): subtle pulse pada border/badge, bukan seluruh kartu berkedip
- Mascot AI: idle bounce halus (loop, amplitudo kecil), animasi "bicara" singkat saat greeting muncul, berhenti setelah teks selesai

Aturan umum motion: durasi 150–400ms, easing `ease-out` untuk masuk, `ease-in` untuk keluar. Tidak ada animasi berulang yang mengganggu fokus (misalnya elemen yang terus bergoyang tanpa henti di luar mascot idle).

## 8. Dark Mode

Wajib didukung dari awal (bukan tambahan belakangan) — mahasiswa sering pakai malam hari. Gunakan token di atas, uji kontras teks-background minimal rasio 4.5:1.

## 9. Aksesibilitas

- Kontras teks memenuhi WCAG AA
- Semua elemen interaktif punya target sentuh minimal 44×44px
- Form punya label yang jelas, bukan hanya placeholder

## 10. Yang Harus Dihindari

Lihat `ai-anti-slop.md` untuk daftar lengkap pola visual yang harus dihindari agar hasil tidak terlihat seperti template AI generik.

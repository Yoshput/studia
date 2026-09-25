# PRD — Studia (studia-id.vercel.app)
**Product Requirements Document**
Versi: 0.1 (Draft) · Tanggal: 25 September 2026 · Owner: [nama kamu]

---

## 1. Latar Belakang & Masalah

Mahasiswa Telkom University menggunakan LMS (Moodle-based) untuk semua kegiatan akademik: materi, tugas, kuis, deadline. Masalah yang sering muncul:

- Info tugas/kuis baru gampang kelewat karena tersebar di banyak course, harus buka satu-satu.
- Tidak ada ringkasan otomatis dari materi (slide PPT, dokumen) yang bertebaran di tiap course.
- Tidak ada satu tempat untuk mencatat, membuat roadmap belajar, dan melacak progres lintas mata kuliah.
- Tampilan LMS bawaan (Moodle) fungsional tapi tidak dirancang untuk kenyamanan baca harian.

**Studia** hadir sebagai *companion app* mahasiswa: agregator tugas/deadline dari LMS + tempat mencatat, meringkas materi, dan menyusun alur belajar — dengan UI bersih ala iOS/Apple.

---

## 2. Visi Produk

> "Satu tempat rapi buat mahasiswa tahu apa yang harus dikerjakan hari ini, dan belajar lebih cepat dari materi yang mereka punya."

Fokus awal: mahasiswa Telkom University (LMS CeLOE Moodle). Setelah stabil, arsitektur dibuat cukup generik agar bisa dipakai kampus lain (multi-tenant LMS connector).

---

## 3. Target Pengguna

- Mahasiswa aktif Telkom University, pengguna LMS `lms.telkomuniversity.ac.id`.
- Persona utama: mahasiswa yang punya banyak course per semester (5–8), sering kelewat deadline, butuh ringkasan cepat sebelum kelas/ujian.

---

## 4. Masalah Terbesar Dulu: Sinkronisasi ke LMS Telkom — Realistis atau Tidak?

Ini bagian paling krusial, jadi dibahas jujur dari sisi teknis dan legal sebelum masuk fitur lain.

### 4.1 Apa yang secara teknis mungkin

LMS Telkom terlihat berbasis **Moodle**. Beberapa opsi integrasi, dari yang paling "bersih" ke yang paling berisiko:

| Opsi | Cara kerja | Kelayakan |
|---|---|---|
| **A. Moodle Web Services API resmi** | Moodle punya REST API bawaan (`webservice/rest/server.php`) yang bisa diaktifkan admin, menghasilkan token per user, lalu app bisa `fetch` assignment, calendar, grades resmi. | Paling ideal, **tapi butuh izin/aktivasi dari pihak CeLOE/IT Telkom**. Tanpa itu, endpoint biasanya tertutup untuk akun biasa. |
| **B. Kalender iCal/RSS export bawaan Moodle** | Moodle biasanya punya fitur "Export calendar" jadi link `.ics` yang auto-update (via *Preferences > Calendar*). Ini API resmi tanpa perlu approval khusus. | **Paling realistis untuk MVP.** Cukup andal untuk due-date tugas & kuis. Perlu dicek apakah fitur ini diaktifkan di instance Telkom. |
| **C. Notifikasi email Moodle** | Moodle biasanya kirim email saat ada tugas/kuis baru. Studia bisa punya alamat forwarding/parsing (mis. via layanan seperti Mailgun inbound) yang membaca email ini dan mengubahnya jadi entri tugas. | Realistis, tidak butuh akses LMS langsung, tapi tergantung pengaturan notifikasi tiap mahasiswa. |
| **D. Automasi browser dengan kredensial user sendiri** (login otomatis lalu scrape dashboard) | Studia "login" atas nama user (disimpan terenkripsi atau pakai session token user), lalu membaca halaman dashboard secara terjadwal. | Teknis paling fleksibel, **tapi paling berisiko**: berpotensi melanggar Ketentuan Layanan/Acceptable Use Policy kampus, rawan kena rate-limit/block, dan menyimpan kredensial pihak ketiga adalah tanggung jawab keamanan besar. Perlu dicek dulu ke IT/CeLOE apakah ini diizinkan. |
| **E. Ekstensi browser / "bookmarklet"** | User pasang extension ringan yang berjalan **di browser mereka sendiri** saat mereka membuka LMS, lalu mengirim data (tugas terbaru) ke akun Studia mereka. | Secara etis lebih aman dari opsi D karena tidak menyimpan password di server — hanya membaca apa yang sudah user lihat sendiri di browsernya. Cocok jadi *fallback* resmi. |

**Rekomendasi urutan implementasi:**
1. Mulai dari **Opsi B (iCal/RSS)** — cek dulu apakah `lms.telkomuniversity.ac.id` mengaktifkan export kalender per user. Ini paling cepat dan resmi.
2. Kalau butuh lebih detail (deskripsi tugas, lampiran), ajukan **Opsi A** — hubungi CeLOE/IT untuk minta akses Moodle Web Service token untuk keperluan project mahasiswa. Banyak kampus mengizinkan ini kalau diajukan resmi.
3. Sediakan **Opsi E (extension)** sebagai jalur cadangan yang aman secara privasi.
4. **Hindari Opsi D** sebagai default produk publik — hanya masuk akal sebagai eksperimen pribadi kamu sendiri (bukan untuk banyak user), dan tetap cek ToS kampus dulu.

> ⚠️ Sebelum bangun fitur ini untuk banyak pengguna, cek **Ketentuan Layanan / Kebijakan Penggunaan Data** LMS Telkom. Ini penting supaya Studia tidak dianggap melanggar aturan kampus atau UU ITE terkait akses sistem elektronik pihak lain.

### 4.2 Kesimpulan kelayakan
Proyek ini **tidak mustahil** — realistis kalau dimulai dari sumber data resmi (kalender/RSS/email) dan diperluas ke API resmi via izin CeLOE. Yang mustahil (atau berisiko besar) adalah scraping paksa tanpa izin untuk skala publik.

---

## 5. Fitur Inti (MVP)

### 5.1 Task & Deadline Sync
- Tarik semua deadline tugas/kuis dari sumber (Opsi B/A) → tampil sebagai satu timeline gabungan lintas course.
- Notifikasi push/email H-3, H-1, H-0.
- Filter per course, per tipe (tugas/kuis/forum).

### 5.2 Smart Notes (auto-generate .md)
- User bisa menulis catatan bebas per course/topik.
- Tombol "Rapikan jadi Markdown" → AI merapikan catatan jadi heading, bullet, dan ringkasan singkat di atas.
- Bisa export/download sebagai `.md`.

### 5.3 Study Workflow / Roadmap Generator
- User pilih course + topik ujian/tugas → AI membuat **alur belajar bertahap** (garis waktu/checklist): "Minggu 1: pahami konsep X → Minggu 2: latihan soal → Minggu 3: review".
- Ditampilkan sebagai visual step/roadmap (bukan cuma teks).

### 5.4 PPT Summarizer (auto-delete)
- User upload `.pptx`.
- Sistem ekstrak teks per slide → AI membuat ringkasan poin-poin belajar (dengan struktur: topik utama, sub-poin, istilah penting).
- **File asli otomatis dihapus dari storage** setelah proses ekstraksi selesai (hanya ringkasan yang disimpan) — penting untuk privasi & hemat storage.
- Bonus: dari ringkasan ini bisa auto-generate flashcard/kuis latihan.

### 5.5 UI/UX
- Gaya iOS/Apple: whitespace lega, tipografi jelas, rounded corner konsisten, animasi halus, dark mode otomatis.
- Navigasi sederhana: Home (deadline hari ini) → Courses → Notes → Study Plan.

---

## 6. Fitur Tambahan yang Disarankan (Nice-to-have, roadmap v2+)

- **GPA / IPK calculator** otomatis dari nilai yang tersinkron.
- **Kalender terpadu**: gabung jadwal kelas + deadline + event kampus, bisa export ke Google Calendar.
- **Kuis latihan otomatis** dari ringkasan PPT/catatan (spaced repetition ala Anki).
- **Study group board**: mahasiswa satu course bisa share catatan/ringkasan (opsional, per course).
- **Weekly digest email**: "Minggu ini kamu ada 3 tugas & 1 kuis, progres belajar X%".
- **Focus timer** (Pomodoro) terintegrasi dengan roadmap belajar.
- **PWA / offline mode** supaya bisa dibuka tanpa koneksi stabil di kampus.
- **Search lintas semua notes & ringkasan** (mirip Notion search).

---

## 7. Arsitektur Teknis (Usulan)

- **Frontend**: Next.js (cocok dengan Vercel), Tailwind CSS untuk gaya iOS-like, komponen custom (bukan default template).
- **Backend/DB**: Supabase (Postgres + Auth + Storage) — cocok untuk auth mahasiswa via email kampus, dan storage sementara file PPT sebelum dihapus.
- **AI processing**: Claude API — untuk ringkasan catatan, ekstraksi PPT, generate roadmap belajar.
- **Sync worker**: cron job (Vercel Cron / Supabase Edge Function) yang polling iCal feed / email inbox secara berkala (mis. tiap 30 menit).
- **Auth**: login mahasiswa pakai email kampus (`@student.telkomuniversity.ac.id`) → verifikasi domain untuk batasi ke mahasiswa Telkom di fase awal.

---

## 8. Privasi & Keamanan (Non-negotiable)

- Jangan simpan password LMS mahasiswa di server jika memungkinkan pakai jalur iCal/RSS/email (yang tidak butuh password).
- File PPT dihapus otomatis setelah diproses (sesuai fitur 5.4) — beri user notifikasi jelas soal ini.
- Semua data akademik pribadi (nilai, tugas) dienkripsi at-rest.
- Halaman privacy policy yang jelas sejak awal, terutama karena berhubungan dengan data akademik.

---

## 9. Skala MVP (apa yang dikerjakan dulu)

**Fase 1 (2–3 minggu):**
1. Auth + halaman dashboard kosong.
2. Import manual: user paste link iCal Moodle (kalau tersedia) → tugas otomatis muncul di timeline.
3. Notes dasar (tulis + rapikan jadi markdown).

**Fase 2:**
4. PPT upload → ringkasan otomatis → auto-delete file.
5. Study roadmap generator.

**Fase 3:**
6. Ajukan akses Moodle Web Service resmi ke CeLOE untuk sync lebih detail & real-time.
7. Notifikasi push/email.

---

## 10. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| LMS Telkom tidak menyediakan iCal/RSS export | Mulai dari input manual tugas + email parsing sebagai fallback |
| Akses API resmi ditolak/lambat direspon CeLOE | Tetap jalan dengan sumber data semi-manual, revisit permintaan API berkala |
| Biaya AI API membengkak seiring user bertambah | Batasi ukuran file PPT, cache hasil ringkasan, rate limit per user |
| Isu privasi data akademik | Kebijakan hapus otomatis, enkripsi, transparansi ke user |

---

## 11. Langkah Selanjutnya

1. Cek langsung di akun LMS kamu: apakah ada opsi "Export Calendar" (biasanya di halaman Calendar → Preferences → Export). Ini menentukan apakah Fase 1 langsung bisa jalan.
2. Tentukan nama fitur & branding final untuk Studia.
3. Mulai desain wireframe (Home, Course list, Notes, Study Plan) — gaya iOS.
4. Bangun MVP Fase 1 di atas Next.js + Supabase.


# AI Anti-Slop Guidelines — Semestr

**Tujuan:** memastikan hasil desain dan kode tidak terlihat seperti "template AI generik" — baik dari sisi visual maupun kualitas kode. Dokumen ini jadi checklist wajib sebelum sebuah fitur dianggap selesai.

---

## 1. Kenapa Ini Penting

AI coding agent cenderung jatuh ke pola default yang sama di mana-mana: gradient ungu-biru di hero, glassmorphism di semua tempat, emoji di setiap heading, copy yang terlalu antusias, dan kode yang di-generate tanpa mempertimbangkan konteks aplikasi ini secara spesifik. Dokumen ini mendaftar pola-pola itu secara eksplisit supaya bisa dihindari, bukan diperbaiki belakangan.

## 2. Slop Visual/Desain — Hindari

- Gradient dekoratif besar di background (hero section berwarna ungu-ke-biru, dsb) — pakai warna solid dari token `design.md`
- Glassmorphism di semua kartu — blur hanya untuk nav bar/sheet, bukan default semua elemen
- Shadow tebal dan menyebar di setiap kartu ("floating card" berlebihan) — pakai shadow tipis sesuai `design.md`
- Emoji sebagai pengganti ikon di UI (📚 untuk matkul, ✅ untuk selesai, dsb) — gunakan Lucide icon
- Kartu dashboard yang semuanya berbentuk sama persis dengan angka besar di tengah tanpa hierarki (pola "admin dashboard generik")
- Border-radius berlebihan/tidak konsisten (satu tempat 8px, tempat lain 24px) — ikuti skala radius di `design.md`
- Warna aksen lebih dari satu di layar yang sama tanpa alasan semantik jelas
- Ilustrasi/mascot generik bergaya "3D blob" atau stok clipart AI — mascot AI assistant cukup sederhana, konsisten dengan gaya ikon aplikasi

## 3. Slop Copy/Teks — Hindari

- Kalimat pembuka berlebihan ("Selamat datang di aplikasi luar biasa ini!", "Mari mulai perjalanan akademik Anda!")
- Tanda seru berulang di UI produksi
- Placeholder "Lorem Ipsum" yang dibiarkan — gunakan data contoh nyata (nama matkul asli dari seed data)
- Pesan error generik ("Terjadi kesalahan", "Something went wrong") tanpa konteks apa yang salah
- Nada AI yang terlalu antusias di greeting assistant — greeting harus informatif dan ringkas, bukan seperti iklan ("Halo! Kamu luar biasa hari ini! ✨")
- Label tombol ambigu ("Klik di sini", "Submit") — gunakan aksi yang jelas ("Simpan Progress", "Tambah Matkul")

## 4. Slop Kode — Hindari

- Komentar yang menjelaskan hal yang sudah jelas dari kode itu sendiri (`// increment i by 1`)
- Abstraksi berlapis untuk kasus yang sebenarnya sederhana (factory pattern untuk satu jenis form, misalnya) — aplikasi ini single-user, jangan over-engineer seolah untuk skala enterprise
- Dependency tambahan yang tidak perlu di luar stack yang sudah ditentukan di `agent.md`
- Kode yang di-generate ulang dari nol tiap kali diminta perubahan kecil, alih-alih diedit langsung
- Penanganan error generik `try { } catch (e) { console.log(e) }` tanpa pesan yang berguna ke pengguna
- Nama variabel/fungsi generik (`data`, `handleClick`, `temp`) di tempat yang seharusnya deskriptif (`progressEntries`, `handleSubmitNilai`)
- Kode mati (fitur yang dikomentari, import tidak terpakai) dibiarkan menumpuk

## 5. Checklist Sebelum Fitur Dianggap Selesai

- [ ] Tidak ada emoji di UI produksi
- [ ] Semua warna berasal dari token di `design.md`, tidak ada warna baru yang diimprovisasi
- [ ] Semua ikon dari lucide-react, konsisten penggunaannya
- [ ] Copy dalam Bahasa Indonesia yang natural, tidak berlebihan, tidak generic
- [ ] Tidak ada placeholder/dummy content yang lolos ke build
- [ ] Kode sudah dibaca ulang untuk komentar/abstraksi yang tidak perlu
- [ ] Pesan error spesifik terhadap apa yang gagal, bukan generic
- [ ] Motion mengikuti durasi/easing di `design.md`, tidak ada animasi berlebihan yang mengganggu

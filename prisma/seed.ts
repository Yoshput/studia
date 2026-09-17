import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const GRADE_INDEX: Record<string, number> = {
  A: 4.0,
  AB: 3.5,
  B: 3.0,
  BC: 2.5,
  C: 2.0,
  D: 1.0,
  E: 0.0,
};

async function main() {
  console.log("Seeding verified Semestr database with exact iGracias schedule & 3.64 IPK...");

  // 1. Clean existing records
  await prisma.presensi.deleteMany();
  await prisma.tugasDeadline.deleteMany();
  await prisma.nilai.deleteMany();
  await prisma.nilaiBobot.deleteMany();
  await prisma.progressHarian.deleteMany();
  await prisma.khsMatkul.deleteMany();
  await prisma.matkul.deleteMany();
  await prisma.semester.deleteMany();
  await prisma.user.deleteMany();

  // 2. User: YOSSIKA PUTRA ERLANGGA
  const passwordHash = await bcrypt.hash("password123", 10);
  const user = await prisma.user.create({
    data: {
      nama: "Yossika Putra Erlangga",
      email: "yossika@telkomuniversity.ac.id",
      password_hash: passwordHash,
      nim: "103112430026",
      kelas: "S1IF-12-06",
      prodi: "S1 Teknik Informatika - Kampus Purwokerto",
      avatar_url: null,
    },
  });
  console.log(`User created: ${user.nama} (${user.nim})`);

  // 3. Historical Semesters from official Tel-U KHS PDF
  const historicalSemesters = [
    {
      nama: "Semester 1",
      tahun: "2024/2025 - Ganjil",
      ipk: 3.63,
      items: [
        { kode: "CAK1BAB3", nama: "Algoritma dan Pemrograman 1", sks: 3, nilai: "AB" },
        { kode: "CAK1CAB3", nama: "Kalkulus", sks: 3, nilai: "AB" },
        { kode: "CAK1DAB3", nama: "Logika Matematika", sks: 3, nilai: "AB" },
        { kode: "CAK1EAB3", nama: "Matematika Diskrit", sks: 3, nilai: "A" },
        { kode: "CAK1GDB2", nama: "Pendidikan Karakter", sks: 2, nilai: "AB" },
        { kode: "CAK1HDB2", nama: "Statistika", sks: 2, nilai: "AB" },
        { kode: "UAKXACB2", nama: "Agama Islam", sks: 2, nilai: "AB" },
        { kode: "UBKXBCB2", nama: "Pancasila", sks: 2, nilai: "A" },
      ],
    },
    {
      nama: "Semester 2",
      tahun: "2024/2025 - Genap",
      ipk: 3.73,
      items: [
        { kode: "CAK1IAB4", nama: "Algoritma dan Pemrograman 2", sks: 4, nilai: "A" },
        { kode: "CAK1KAB2", nama: "Etika dalam AI", sks: 2, nilai: "A" },
        { kode: "CAK1LAB3", nama: "Kalkulus Lanjut", sks: 3, nilai: "B" },
        { kode: "CAK1MAB3", nama: "Matriks dan Ruang Vektor", sks: 3, nilai: "A" },
        { kode: "CAK1NAB3", nama: "Organisasi dan Arsitektur Komputer", sks: 3, nilai: "A" },
        { kode: "CAK1OAB3", nama: "Pemodelan Basis Data", sks: 3, nilai: "AB" },
        { kode: "UCKXADB2", nama: "Bahasa Inggris", sks: 2, nilai: "AB" },
      ],
    },
    {
      nama: "Semester 3",
      tahun: "2025/2026 - Ganjil",
      ipk: 3.61,
      items: [
        { kode: "CAK2AAB3", nama: "Analisis dan Perancangan Perangkat Lunak", sks: 3, nilai: "AB" },
        { kode: "CAK2BAB2", nama: "Analisis Kompleksitas Algoritma", sks: 2, nilai: "BC" },
        { kode: "CAK2CAB3", nama: "Sistem Basis Data", sks: 3, nilai: "A" },
        { kode: "CAK2DAB3", nama: "Sistem Operasi", sks: 3, nilai: "A" },
        { kode: "CAK2EAB4", nama: "Struktur Data", sks: 4, nilai: "A" },
        { kode: "CAK2FAB2", nama: "Teori Bahasa dan Automata", sks: 2, nilai: "AB" },
        { kode: "CAK2GAB3", nama: "Teori Peluang", sks: 3, nilai: "B" },
        { kode: "UBKXCCB2", nama: "Bahasa Indonesia", sks: 2, nilai: "A" },
      ],
    },
    {
      nama: "Semester 4",
      tahun: "2025/2026 - Genap",
      ipk: 3.61,
      items: [
        { kode: "CAK2HAB3", nama: "Dasar Kecerdasan Artifisial", sks: 3, nilai: "B" },
        { kode: "CAK2IAB3", nama: "Interaksi Manusia Komputer", sks: 3, nilai: "AB" },
        { kode: "CAK2JAB4", nama: "Jaringan Komputer", sks: 4, nilai: "A" },
        { kode: "CAK2KAB4", nama: "Pemrograman Berorientasi Objek", sks: 4, nilai: "A" },
        { kode: "CAK2LAB3", nama: "Strategi Algoritma", sks: 3, nilai: "AB" },
        { kode: "CAK2MDB2", nama: "Wawasan Global TIK", sks: 2, nilai: "AB" },
        { kode: "CAK3BAB3", nama: "Implementasi dan Pengujian Perangkat Lunak", sks: 3, nilai: "AB" },
      ],
    },
  ];

  for (const sem of historicalSemesters) {
    const s = await prisma.semester.create({
      data: {
        nama_semester: sem.nama,
        tahun_ajaran: sem.tahun,
        ipk: sem.ipk,
        is_active: false,
      },
    });

    await prisma.khsMatkul.createMany({
      data: sem.items.map((it) => ({
        semester_id: s.id,
        kode_matkul: it.kode,
        nama_matkul: it.nama,
        sks: it.sks,
        nilai_huruf: it.nilai,
        nilai_indeks: GRADE_INDEX[it.nilai] || 3.0,
      })),
    });
  }

  // 4. Active Semester: 2026/2027 - Ganjil (Official IPK 3.64, 84 SKS Selesai)
  const activeSemester = await prisma.semester.create({
    data: {
      nama_semester: "Semester 5",
      tahun_ajaran: "2026/2027 - Ganjil",
      ipk: 3.64, // Exact official IPK from iGracias
      is_active: true,
    },
  });

  // 5. Exact Schedule & Shift from User's iGracias Table:
  const activeMatkul = [
    {
      // SENIN: 07:30 - 10:30
      nama: "Tata Tulis Ilmiah",
      kode: "CAK3KAB3",
      dosen: "Trihastuti Yuniati, S.T., M.T. [THX]",
      sks: 2,
      hari: "Senin",
      jam_mulai: "07:30",
      jam_selesai: "10:30",
      ruang: "DC-104",
      warna: "#FF3B30",
    },
    {
      // SELASA: 15:30 - 18:30
      nama: "Keamanan Siber",
      kode: "CAK3CAB3",
      dosen: "Eko Fajar Cahyadi, M.Kom. [NGH]",
      sks: 3,
      hari: "Selasa",
      jam_mulai: "15:30",
      jam_selesai: "18:30",
      ruang: "Lab Cyber / DC-101",
      warna: "#007AFF",
    },
    {
      // RABU: 12:30 - 15:30
      nama: "Manajemen Projek TIK",
      kode: "CAK3FAB3",
      dosen: "Resad Setyadi, S.T., M.Kom. [NEW]",
      sks: 3,
      hari: "Rabu",
      jam_mulai: "12:30",
      jam_selesai: "15:30",
      ruang: "DC-203",
      warna: "#AF52DE",
    },
    {
      // KAMIS (Pagi): 06:30 - 08:30
      nama: "Kewarganegaraan",
      kode: "UBKXACB2",
      dosen: "Aulia Sholichah Iman Nurchotimah, S.Pd., M.Pd. [AUS]",
      sks: 2,
      hari: "Kamis",
      jam_mulai: "06:30",
      jam_selesai: "08:30",
      ruang: "DC-201",
      warna: "#34C759",
    },
    {
      // KAMIS (Sore): 15:30 - 18:30
      nama: "Komputasi Awan dan Terdistribusi",
      kode: "CAK3EAB3",
      dosen: "Ipam Fuaddina Adam, S.Kom., M.Kom. [IPA]",
      sks: 3,
      hari: "Kamis",
      jam_mulai: "15:30",
      jam_selesai: "18:30",
      ruang: "Lab Cloud / RPL 1",
      warna: "#FF9500",
    },
    {
      // JUM'AT (Pagi): 08:30 - 11:30
      nama: "Sistem Keamanan Cerdas",
      kode: "CAK4RBB3",
      dosen: "M. Agung Nugroho, S.Kom., M.Kom. [NGH]",
      sks: 3,
      hari: "Jumat",
      jam_mulai: "08:30",
      jam_selesai: "11:30",
      ruang: "Lab Jarkom",
      warna: "#FF2D55",
    },
    {
      // JUM'AT (Siang): 13:30 - 15:30
      nama: "Sosio-Informatik dan Keprofesian",
      kode: "CAK3GAB2",
      dosen: "Annisaa Utami, S.Kom., M.Kom. [ANT]",
      sks: 2,
      hari: "Jumat",
      jam_mulai: "13:30",
      jam_selesai: "15:30",
      ruang: "DC-103",
      warna: "#32ADE6",
    },
    {
      // JUM'AT (Sore): 15:30 - 18:30
      nama: "Kecerdasan Artifisial",
      kode: "CAK3DAB3",
      dosen: "Faisal Dharma Adhinata, S.Kom., M.Cs. [FDH]",
      sks: 3,
      hari: "Jumat",
      jam_mulai: "15:30",
      jam_selesai: "18:30",
      ruang: "DC-102",
      warna: "#5856D6",
    },
  ];

  const defaultBobot = [
    { kategori: "Quiz", bobot_persen: 15 },
    { kategori: "Tugas", bobot_persen: 20 },
    { kategori: "UTS", bobot_persen: 25 },
    { kategori: "UAS", bobot_persen: 25 },
    { kategori: "Tubes", bobot_persen: 15 },
  ];

  const createdMatkulMap: Record<string, string> = {};

  for (const m of activeMatkul) {
    const created = await prisma.matkul.create({
      data: {
        semester_id: activeSemester.id,
        nama: m.nama,
        kode: m.kode,
        dosen: m.dosen,
        sks: m.sks,
        hari: m.hari,
        jam_mulai: m.jam_mulai,
        jam_selesai: m.jam_selesai,
        ruang: m.ruang,
        warna: m.warna,
        bobot_nilai: {
          create: defaultBobot,
        },
      },
    });
    createdMatkulMap[m.nama] = created.id;
  }
  console.log("8 Matkul seeded with exact iGracias days and shifts.");

  // 6. Tugas: Empty except the ONE real task user requested!
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 5);
  nextWeek.setHours(23, 59, 0, 0);

  await prisma.tugasDeadline.create({
    data: {
      matkul_id: createdMatkulMap["Sistem Keamanan Cerdas"],
      judul: "Setup Kali Linux di VMware & Pembentukan Kelompok",
      deskripsi: "Download ISO Kali Linux, instalasi dan jalankan di virtual machine VMware Workstation, serta membentuk kelompok untuk tugas & projek praktikum Sistem Keamanan Cerdas.",
      deadline: nextWeek,
      status: "proses",
      prioritas: "tinggi",
    },
  });

  const deadlineKeamanan1 = new Date(today);
  deadlineKeamanan1.setDate(today.getDate() + 14);
  deadlineKeamanan1.setHours(23, 59, 0, 0);

  const deadlineKeamanan2 = new Date(today);
  deadlineKeamanan2.setDate(today.getDate() + 28);
  deadlineKeamanan2.setHours(23, 59, 0, 0);

  await prisma.tugasDeadline.createMany({
    data: [
      {
        matkul_id: createdMatkulMap["Keamanan Siber"],
        judul: "Tugas 1 - Secure Coding",
        deskripsi: "Mahasiswa mengevaluasi keamanan suatu program dan melakukan perbaikan. Dikerjakan secara berkelompok (3-4 mahasiswa). Usahakan dalam satu tim perangkatnya menggunakan OS yang beragam.",
        deadline: deadlineKeamanan1,
        status: "belum_mulai",
        prioritas: "tinggi",
      },
      {
        matkul_id: createdMatkulMap["Keamanan Siber"],
        judul: "Tugas 2 - Security Assessment & Governance",
        deskripsi: "Mahasiswa melakukan asesmen dan mengusulkan rekomendasi peningkatan keamanan sistem. Dikerjakan secara berkelompok (3-4 mahasiswa). Usahakan dalam satu tim perangkatnya menggunakan OS yang beragam.",
        deadline: deadlineKeamanan2,
        status: "belum_mulai",
        prioritas: "sedang",
      },
    ],
  });
  console.log("Real tasks for Sistem Keamanan Cerdas and Keamanan Siber seeded successfully.");

  // 7. Presensi initial sample
  const sampleFaceDataUrl =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="320" height="240" viewBox="0 0 320 240">
        <rect width="320" height="240" fill="#1C1C1E"/>
        <circle cx="160" cy="95" r="45" fill="#3A3A3C" stroke="#007AFF" stroke-width="2"/>
        <path d="M100 210 Q160 150 220 210" fill="#2C2C2E" stroke="#007AFF" stroke-width="2"/>
        <rect x="140" y="175" width="40" height="35" rx="4" fill="#007AFF"/>
        <text x="160" y="98" font-family="Arial" font-size="12" fill="#FFFFFF" text-anchor="middle">WAJAH TERDETEKSI</text>
        <text x="160" y="228" font-family="Arial" font-size="10" fill="#34C759" text-anchor="middle">BUSANA RAPI • TERVERIFIKASI</text>
      </svg>
    `);

  await prisma.presensi.create({
    data: {
      user_id: user.id,
      matkul_id: createdMatkulMap["Tata Tulis Ilmiah"],
      tanggal: today,
      hari: "Senin",
      jam: "07:25 WIB",
      status: "Hadir Tepat Waktu",
      foto_base64: sampleFaceDataUrl,
      deteksi_info: "Wajah terverifikasi 99.4% • Pakaian berkerah rapi • Pencahayaan optimal",
      catatan: "Sesi Kuliah Perdana di DC-104",
    },
  });

  console.log("Database seed completed with official data.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

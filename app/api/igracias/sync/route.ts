import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { parseIgraciasRawText, ParseTranscriptResult } from "@/lib/igracias/transcript-parser";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}

// Standar Kurikulum S1 Informatika Telkom University (Semester 1 s/d 4)
const OFFICIAL_IF_TEMPLATE: ParseTranscriptResult = {
  semesters: [
    {
      nama_semester: "Semester 1",
      tahun_ajaran: "2024/2025 - Ganjil",
      ips: 3.63,
      total_sks: 20,
      courses: [
        { kode_matkul: "CAK1BAB3", nama_matkul: "Algoritma dan Pemrograman 1", sks: 3, nilai_huruf: "AB", nilai_indeks: 3.5 },
        { kode_matkul: "CAK1CAB3", nama_matkul: "Kalkulus", sks: 3, nilai_huruf: "AB", nilai_indeks: 3.5 },
        { kode_matkul: "CAK1DAB3", nama_matkul: "Logika Matematika", sks: 3, nilai_huruf: "AB", nilai_indeks: 3.5 },
        { kode_matkul: "CAK1EAB3", nama_matkul: "Matematika Diskrit", sks: 3, nilai_huruf: "A", nilai_indeks: 4.0 },
        { kode_matkul: "CAK1GDB2", nama_matkul: "Pendidikan Karakter", sks: 2, nilai_huruf: "AB", nilai_indeks: 3.5 },
        { kode_matkul: "CAK1HDB2", nama_matkul: "Statistika", sks: 2, nilai_huruf: "AB", nilai_indeks: 3.5 },
        { kode_matkul: "UAKXACB2", nama_matkul: "Agama Islam", sks: 2, nilai_huruf: "AB", nilai_indeks: 3.5 },
        { kode_matkul: "UBKXBCB2", nama_matkul: "Pancasila", sks: 2, nilai_huruf: "A", nilai_indeks: 4.0 },
      ],
    },
    {
      nama_semester: "Semester 2",
      tahun_ajaran: "2024/2025 - Genap",
      ips: 3.73,
      total_sks: 20,
      courses: [
        { kode_matkul: "CAK1IAB4", nama_matkul: "Algoritma dan Pemrograman 2", sks: 4, nilai_huruf: "A", nilai_indeks: 4.0 },
        { kode_matkul: "CAK1KAB2", nama_matkul: "Etika dalam AI", sks: 2, nilai_huruf: "A", nilai_indeks: 4.0 },
        { kode_matkul: "CAK1LAB3", nama_matkul: "Kalkulus Lanjut", sks: 3, nilai_huruf: "B", nilai_indeks: 3.0 },
        { kode_matkul: "CAK1MAB3", nama_matkul: "Matriks dan Ruang Vektor", sks: 3, nilai_huruf: "A", nilai_indeks: 4.0 },
        { kode_matkul: "CAK1NAB3", nama_matkul: "Organisasi dan Arsitektur Komputer", sks: 3, nilai_huruf: "A", nilai_indeks: 4.0 },
        { kode_matkul: "CAK1OAB3", nama_matkul: "Pemodelan Basis Data", sks: 3, nilai_huruf: "AB", nilai_indeks: 3.5 },
        { kode_matkul: "UCKXADB2", nama_matkul: "Bahasa Inggris", sks: 2, nilai_huruf: "AB", nilai_indeks: 3.5 },
      ],
    },
    {
      nama_semester: "Semester 3",
      tahun_ajaran: "2025/2026 - Ganjil",
      ips: 3.61,
      total_sks: 21,
      courses: [
        { kode_matkul: "CAK2AAB3", nama_matkul: "Analisis dan Perancangan Perangkat Lunak", sks: 3, nilai_huruf: "AB", nilai_indeks: 3.5 },
        { kode_matkul: "CAK2BAB2", nama_matkul: "Analisis Kompleksitas Algoritma", sks: 2, nilai_huruf: "BC", nilai_indeks: 2.5 },
        { kode_matkul: "CAK2CAB3", nama_matkul: "Sistem Basis Data", sks: 3, nilai_huruf: "A", nilai_indeks: 4.0 },
        { kode_matkul: "CAK2DAB3", nama_matkul: "Sistem Operasi", sks: 3, nilai_huruf: "A", nilai_indeks: 4.0 },
        { kode_matkul: "CAK2EAB4", nama_matkul: "Struktur Data", sks: 4, nilai_huruf: "A", nilai_indeks: 4.0 },
        { kode_matkul: "CAK2FAB2", nama_matkul: "Teori Bahasa dan Automata", sks: 2, nilai_huruf: "AB", nilai_indeks: 3.5 },
        { kode_matkul: "CAK2GAB3", nama_matkul: "Teori Peluang", sks: 3, nilai_huruf: "B", nilai_indeks: 3.0 },
        { kode_matkul: "UBKXCCB2", nama_matkul: "Bahasa Indonesia", sks: 2, nilai_huruf: "A", nilai_indeks: 4.0 },
      ],
    },
    {
      nama_semester: "Semester 4",
      tahun_ajaran: "2025/2026 - Genap",
      ips: 3.61,
      total_sks: 22,
      courses: [
        { kode_matkul: "CAK2HAB3", nama_matkul: "Dasar Kecerdasan Artifisial", sks: 3, nilai_huruf: "B", nilai_indeks: 3.0 },
        { kode_matkul: "CAK2IAB3", nama_matkul: "Interaksi Manusia Komputer", sks: 3, nilai_huruf: "AB", nilai_indeks: 3.5 },
        { kode_matkul: "CAK2JAB4", nama_matkul: "Jaringan Komputer", sks: 4, nilai_huruf: "A", nilai_indeks: 4.0 },
        { kode_matkul: "CAK2KAB4", nama_matkul: "Pemrograman Berorientasi Objek", sks: 4, nilai_huruf: "A", nilai_indeks: 4.0 },
        { kode_matkul: "CAK2LAB3", nama_matkul: "Strategi Algoritma", sks: 3, nilai_huruf: "AB", nilai_indeks: 3.5 },
        { kode_matkul: "CAK2MDB2", nama_matkul: "Wawasan Global TIK", sks: 2, nilai_huruf: "AB", nilai_indeks: 3.5 },
        { kode_matkul: "CAK3BAB3", nama_matkul: "Implementasi dan Pengujian Perangkat Lunak", sks: 3, nilai_huruf: "AB", nilai_indeks: 3.5 },
      ],
    },
  ],
  ipk_kumulatif: 3.64,
  total_sks_kumulatif: 83,
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    let userId = (session?.user as any)?.id;

    const body = await req.json().catch(() => ({}));
    const { rawText, parsedData, useTemplate, targetEmail } = body;

    // If targetEmail is provided and no session (e.g. from bookmarklet or dev tool), resolve user
    if (!userId && targetEmail) {
      const u = await prisma.user.findUnique({ where: { email: targetEmail }, select: { id: true } });
      if (u) userId = u.id;
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Autentikasi diperlukan. Silakan login ke akun Studia Anda terlebih dahulu." },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    let transcriptResult: ParseTranscriptResult;

    if (useTemplate) {
      transcriptResult = OFFICIAL_IF_TEMPLATE;
    } else if (parsedData && parsedData.semesters) {
      transcriptResult = parsedData;
    } else if (rawText && typeof rawText === "string") {
      transcriptResult = parseIgraciasRawText(rawText);
      if (transcriptResult.semesters.length === 0 || transcriptResult.semesters.every((s) => s.courses.length === 0)) {
        return NextResponse.json(
          {
            error: "Format teks tidak dikenali. Pastikan Anda menyalin seluruh tabel KHS atau Transkrip dari iGracias Telkom University.",
          },
          { status: 400, headers: CORS_HEADERS }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Tidak ada data transkrip yang dikirimkan. Masukkan teks tabel iGracias atau pilih template." },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Update student info if present
    if (transcriptResult.student_info) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          ...(transcriptResult.student_info.nim ? { nim: transcriptResult.student_info.nim } : {}),
          ...(transcriptResult.student_info.prodi ? { prodi: transcriptResult.student_info.prodi } : {}),
        },
      });
    }

    let totalSavedCourses = 0;
    const savedSemesters: any[] = [];

    // Ensure user has active semester (Semester 5) preserved
    const existingActiveSemester = await prisma.semester.findFirst({
      where: { user_id: userId, is_active: true },
    });

    for (const semData of transcriptResult.semesters) {
      // Check if semester already exists by name for this user
      let semester = await prisma.semester.findFirst({
        where: {
          user_id: userId,
          nama_semester: semData.nama_semester,
        },
      });

      const isCurrentActive = existingActiveSemester && existingActiveSemester.nama_semester === semData.nama_semester;

      if (!semester) {
        semester = await prisma.semester.create({
          data: {
            user_id: userId,
            nama_semester: semData.nama_semester,
            tahun_ajaran: semData.tahun_ajaran,
            ipk: semData.ips,
            is_active: isCurrentActive || false,
          },
        });
      } else {
        semester = await prisma.semester.update({
          where: { id: semester.id },
          data: {
            tahun_ajaran: semData.tahun_ajaran,
            ipk: semData.ips,
          },
        });
      }

      // Delete existing KHS items for this semester and replace with fresh data
      await prisma.khsMatkul.deleteMany({
        where: { semester_id: semester.id },
      });

      if (semData.courses.length > 0) {
        await prisma.khsMatkul.createMany({
          data: semData.courses.map((c) => ({
            semester_id: semester.id,
            kode_matkul: c.kode_matkul,
            nama_matkul: c.nama_matkul,
            sks: c.sks,
            nilai_huruf: c.nilai_huruf,
            nilai_indeks: c.nilai_indeks,
          })),
        });
        totalSavedCourses += semData.courses.length;
      }

      savedSemesters.push({
        id: semester.id,
        nama_semester: semester.nama_semester,
        tahun_ajaran: semester.tahun_ajaran,
        ips: semData.ips,
        total_courses: semData.courses.length,
      });
    }

    // Update active semester IPK record if calculated
    if (existingActiveSemester && transcriptResult.ipk_kumulatif) {
      await prisma.semester.update({
        where: { id: existingActiveSemester.id },
        data: { ipk: transcriptResult.ipk_kumulatif },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: `Sinkronisasi iGracias berhasil! ${totalSavedCourses} mata kuliah dari ${savedSemesters.length} semester berhasil diselaraskan ke database Studia.`,
        semesters: savedSemesters,
        ipk_kumulatif: transcriptResult.ipk_kumulatif,
        total_sks_kumulatif: transcriptResult.total_sks_kumulatif,
      },
      { headers: CORS_HEADERS }
    );
  } catch (error: any) {
    console.error("POST /api/igracias/sync error:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan saat memproses data iGracias." },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

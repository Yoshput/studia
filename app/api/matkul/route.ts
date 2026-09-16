import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const matkulSchema = z.object({
  nama: z.string().min(2, "Nama mata kuliah minimal 2 karakter"),
  kode: z.string().optional().nullable(),
  dosen: z.string().min(2, "Nama dosen minimal 2 karakter"),
  sks: z.coerce.number().int().min(1).max(6),
  hari: z.enum(["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]),
  jam_mulai: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format jam mulai harus HH:mm"),
  jam_selesai: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format jam selesai harus HH:mm"),
  ruang: z.string().min(1, "Ruangan wajib diisi"),
  warna: z.string().optional().default("#007AFF"),
  semester_id: z.string().optional(),
});

// Helper to check time overlap
function isTimeOverlapping(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  return startA < endB && startB < endA;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const semesterId = searchParams.get("semester_id");

    let activeSemesterId: string | null = semesterId;
    if (!activeSemesterId) {
      const activeSem = await db.semester.findFirst({
        where: { is_active: true },
      });
      activeSemesterId = activeSem?.id ?? null;
    }

    if (!activeSemesterId) {
      return NextResponse.json({ matkul: [] });
    }

    const matkulList = await db.matkul.findMany({
      where: { semester_id: activeSemesterId },
      include: {
        bobot_nilai: true,
        nilai: true,
        progress: {
          orderBy: { tanggal: "desc" },
          take: 5,
        },
        tugas: {
          orderBy: { deadline: "asc" },
        },
      },
      orderBy: [{ hari: "asc" }, { jam_mulai: "asc" }],
    });

    return NextResponse.json({ matkul: matkulList });
  } catch (error) {
    console.error("Error fetching matkul:", error);
    return NextResponse.json(
      { error: "Gagal mengambil daftar mata kuliah" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = matkulSchema.parse(body);

    // Ensure semester_id
    let semesterId = validated.semester_id;
    if (!semesterId) {
      const activeSem = await db.semester.findFirst({
        where: { is_active: true },
      });
      if (!activeSem) {
        return NextResponse.json(
          { error: "Belum ada semester aktif yang terdaftar" },
          { status: 400 }
        );
      }
      semesterId = activeSem.id;
    }

    if (validated.jam_mulai >= validated.jam_selesai) {
      return NextResponse.json(
        { error: "Jam selesai harus lebih akhir dari jam mulai" },
        { status: 400 }
      );
    }

    // Check schedule clashes on the same day in the same semester
    const existingSameDay = await db.matkul.findMany({
      where: {
        semester_id: semesterId,
        hari: validated.hari,
      },
    });

    for (const item of existingSameDay) {
      if (
        isTimeOverlapping(
          validated.jam_mulai,
          validated.jam_selesai,
          item.jam_mulai,
          item.jam_selesai
        )
      ) {
        return NextResponse.json(
          {
            error: `Jadwal bentrok dengan mata kuliah "${item.nama}" (${item.jam_mulai} - ${item.jam_selesai}) di ruang ${item.ruang}`,
          },
          { status: 409 }
        );
      }
    }

    // Default weight setup
    const defaultBobot = [
      { kategori: "Quiz", bobot_persen: 15 },
      { kategori: "Tugas", bobot_persen: 20 },
      { kategori: "UTS", bobot_persen: 25 },
      { kategori: "UAS", bobot_persen: 25 },
      { kategori: "Tubes", bobot_persen: 15 },
    ];

    const newMatkul = await db.matkul.create({
      data: {
        semester_id: semesterId,
        nama: validated.nama,
        kode: validated.kode || null,
        dosen: validated.dosen,
        sks: validated.sks,
        hari: validated.hari,
        jam_mulai: validated.jam_mulai,
        jam_selesai: validated.jam_selesai,
        ruang: validated.ruang,
        warna: validated.warna || "#007AFF",
        bobot_nilai: {
          create: defaultBobot,
        },
      },
      include: {
        bobot_nilai: true,
      },
    });

    return NextResponse.json({ matkul: newMatkul }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }
    console.error("Error creating matkul:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan mata kuliah baru" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID mata kuliah wajib disertakan" },
        { status: 400 }
      );
    }

    const validated = matkulSchema.parse(data);

    if (validated.jam_mulai >= validated.jam_selesai) {
      return NextResponse.json(
        { error: "Jam selesai harus lebih akhir dari jam mulai" },
        { status: 400 }
      );
    }

    const currentMatkul = await db.matkul.findUnique({
      where: { id },
    });

    if (!currentMatkul) {
      return NextResponse.json(
        { error: "Mata kuliah tidak ditemukan" },
        { status: 404 }
      );
    }

    // Clash detection excluding self
    const existingSameDay = await db.matkul.findMany({
      where: {
        semester_id: currentMatkul.semester_id,
        hari: validated.hari,
        id: { not: id },
      },
    });

    for (const item of existingSameDay) {
      if (
        isTimeOverlapping(
          validated.jam_mulai,
          validated.jam_selesai,
          item.jam_mulai,
          item.jam_selesai
        )
      ) {
        return NextResponse.json(
          {
            error: `Jadwal bentrok dengan mata kuliah "${item.nama}" (${item.jam_mulai} - ${item.jam_selesai}) di ruang ${item.ruang}`,
          },
          { status: 409 }
        );
      }
    }

    const updated = await db.matkul.update({
      where: { id },
      data: {
        nama: validated.nama,
        kode: validated.kode || null,
        dosen: validated.dosen,
        sks: validated.sks,
        hari: validated.hari,
        jam_mulai: validated.jam_mulai,
        jam_selesai: validated.jam_selesai,
        ruang: validated.ruang,
        warna: validated.warna || currentMatkul.warna,
      },
    });

    return NextResponse.json({ matkul: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }
    console.error("Error updating matkul:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui mata kuliah" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID mata kuliah wajib disertakan" },
        { status: 400 }
      );
    }

    await db.matkul.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting matkul:", error);
    return NextResponse.json(
      { error: "Gagal menghapus mata kuliah" },
      { status: 500 }
    );
  }
}

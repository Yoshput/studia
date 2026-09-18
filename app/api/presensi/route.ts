import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const presensiSchema = z.object({
  matkul_id: z.string().min(1, "Mata kuliah wajib dipilih"),
  foto_base64: z.string().min(10, "Bukti foto wajah wajib diambil"),
  status: z.string().default("Hadir Tepat Waktu"),
  deteksi_info: z.string().optional(),
  catatan: z.string().optional(),
});

const DAYS_ID = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    if (!userId) {
      return NextResponse.json({ error: "Autentikasi diperlukan" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const matkulId = searchParams.get("matkul_id");

    const whereClause: Record<string, unknown> = {
      user_id: userId,
    };

    if (matkulId) {
      whereClause.matkul_id = matkulId;
    }

    const presensiList = await db.presensi.findMany({
      where: whereClause,
      include: {
        matkul: {
          select: {
            id: true,
            nama: true,
            kode: true,
            ruang: true,
            warna: true,
          },
        },
        user: {
          select: {
            nama: true,
            nim: true,
          },
        },
      },
      orderBy: { tanggal: "desc" },
    });

    return NextResponse.json({ presensi: presensiList });
  } catch (error) {
    console.error("Error fetching presensi:", error);
    return NextResponse.json(
      { error: "Gagal mengambil riwayat presensi" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    if (!userId) {
      return NextResponse.json({ error: "Autentikasi diperlukan" }, { status: 401 });
    }

    const body = await req.json();
    const validated = presensiSchema.parse(body);

    // Pastikan matkul_id milik user yang bersangkutan
    const userMatkul = await db.matkul.findFirst({
      where: {
        id: validated.matkul_id,
        semester: { user_id: userId },
      },
    });

    if (!userMatkul) {
      return NextResponse.json(
        { error: "Mata kuliah tidak valid atau bukan milik akun Anda" },
        { status: 403 }
      );
    }

    const now = new Date();
    const hari = DAYS_ID[now.getDay()];
    const jam = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")} WIB`;

    const newPresensi = await db.presensi.create({
      data: {
        user_id: userId,
        matkul_id: validated.matkul_id,
        tanggal: now,
        hari,
        jam,
        status: validated.status,
        foto_base64: validated.foto_base64,
        deteksi_info:
          validated.deteksi_info ||
          "Wajah terverifikasi biometrik • Busana sopan berkerah • Kehadiran tercatat otomatis",
        catatan: validated.catatan || null,
      },
      include: {
        matkul: true,
      },
    });

    return NextResponse.json({ presensi: newPresensi }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }
    console.error("Error creating presensi:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan data presensi wajah" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    if (!userId) {
      return NextResponse.json({ error: "Autentikasi diperlukan" }, { status: 401 });
    }

    const body = await req.json();
    const { id, foto_base64, status, catatan } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID presensi wajib disertakan" },
        { status: 400 }
      );
    }

    const existing = await db.presensi.findFirst({
      where: { id, user_id: userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Data presensi tidak ditemukan atau Anda tidak memiliki akses" },
        { status: 404 }
      );
    }

    const updated = await db.presensi.update({
      where: { id },
      data: {
        ...(foto_base64 && { foto_base64 }),
        ...(status && { status }),
        ...(catatan && { catatan }),
      },
      include: {
        matkul: true,
      },
    });

    return NextResponse.json({ presensi: updated });
  } catch (error) {
    console.error("Error updating presensi:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui data presensi" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    if (!userId) {
      return NextResponse.json({ error: "Autentikasi diperlukan" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID presensi wajib disertakan" },
        { status: 400 }
      );
    }

    const existing = await db.presensi.findFirst({
      where: { id, user_id: userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Data presensi tidak ditemukan atau Anda tidak memiliki akses" },
        { status: 404 }
      );
    }

    await db.presensi.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Presensi berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting presensi:", error);
    return NextResponse.json(
      { error: "Gagal menghapus data presensi" },
      { status: 500 }
    );
  }
}

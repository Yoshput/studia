import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const progressSchema = z.object({
  matkul_id: z.string().min(1, "Mata kuliah wajib dipilih"),
  tanggal: z.string().or(z.date()),
  materi_dipelajari: z.string().min(2, "Materi yang dipelajari wajib diisi"),
  catatan: z.string().optional().nullable(),
  tingkat_pemahaman: z.coerce.number().int().min(1).max(5).default(3),
  lampiran_url: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Autentikasi diperlukan" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const matkulId = searchParams.get("matkul_id");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    const whereClause: Record<string, unknown> = {
      matkul: {
        semester: {
          user_id: userId,
        },
      },
    };

    if (matkulId) {
      whereClause.matkul_id = matkulId;
    }

    if (startDate || endDate) {
      whereClause.tanggal = {
        ...(startDate ? { gte: new Date(startDate) } : {}),
        ...(endDate ? { lte: new Date(endDate) } : {}),
      };
    }

    const entries = await db.progressHarian.findMany({
      where: whereClause,
      include: {
        matkul: {
          select: {
            id: true,
            nama: true,
            kode: true,
            warna: true,
          },
        },
      },
      orderBy: { tanggal: "desc" },
    });

    return NextResponse.json({ progress: entries });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data progress harian" },
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
    const validated = progressSchema.parse(body);

    // Validasi bahwa matkul_id milik user yang bersangkutan
    const userMatkul = await db.matkul.findFirst({
      where: {
        id: validated.matkul_id,
        semester: { user_id: userId },
      },
    });

    if (!userMatkul) {
      return NextResponse.json(
        { error: "Mata kuliah tidak ditemukan atau bukan milik akun Anda" },
        { status: 403 }
      );
    }

    const entry = await db.progressHarian.create({
      data: {
        matkul_id: validated.matkul_id,
        tanggal: new Date(validated.tanggal),
        materi_dipelajari: validated.materi_dipelajari,
        catatan: validated.catatan || null,
        tingkat_pemahaman: validated.tingkat_pemahaman,
        lampiran_url: validated.lampiran_url || null,
      },
      include: {
        matkul: true,
      },
    });

    return NextResponse.json({ progress: entry }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }
    console.error("Error creating progress:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan catatan progress" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Autentikasi diperlukan" }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID progress wajib disertakan" },
        { status: 400 }
      );
    }

    const currentProgress = await db.progressHarian.findFirst({
      where: {
        id,
        matkul: { semester: { user_id: userId } },
      },
    });

    if (!currentProgress) {
      return NextResponse.json(
        { error: "Catatan progress tidak ditemukan atau Anda tidak memiliki akses" },
        { status: 404 }
      );
    }

    const validated = progressSchema.parse(data);

    const updated = await db.progressHarian.update({
      where: { id },
      data: {
        matkul_id: validated.matkul_id,
        tanggal: new Date(validated.tanggal),
        materi_dipelajari: validated.materi_dipelajari,
        catatan: validated.catatan || null,
        tingkat_pemahaman: validated.tingkat_pemahaman,
        lampiran_url: validated.lampiran_url || null,
      },
      include: {
        matkul: true,
      },
    });

    return NextResponse.json({ progress: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }
    console.error("Error updating progress:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui catatan progress" },
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
        { error: "ID progress wajib disertakan" },
        { status: 400 }
      );
    }

    const currentProgress = await db.progressHarian.findFirst({
      where: {
        id,
        matkul: { semester: { user_id: userId } },
      },
    });

    if (!currentProgress) {
      return NextResponse.json(
        { error: "Catatan progress tidak ditemukan atau Anda tidak memiliki akses" },
        { status: 404 }
      );
    }

    await db.progressHarian.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting progress:", error);
    return NextResponse.json(
      { error: "Gagal menghapus catatan progress" },
      { status: 500 }
    );
  }
}

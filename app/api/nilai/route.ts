import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const nilaiSchema = z.object({
  matkul_id: z.string().min(1, "Mata kuliah wajib dipilih"),
  kategori: z.enum(["Quiz", "Tugas", "UTS", "UAS", "Project", "Tubes"]),
  nama_item: z.string().min(2, "Nama asesmen/tugas minimal 2 karakter"),
  nilai: z.coerce.number().min(0).max(100),
  tanggal: z.string().or(z.date()),
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

    const nilaiList = await db.nilai.findMany({
      where: whereClause,
      include: {
        matkul: {
          select: {
            id: true,
            nama: true,
            kode: true,
            warna: true,
            bobot_nilai: true,
          },
        },
      },
      orderBy: { tanggal: "desc" },
    });

    return NextResponse.json({ nilai: nilaiList });
  } catch (error) {
    console.error("Error fetching nilai:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data nilai" },
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
    const validated = nilaiSchema.parse(body);

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

    const newNilai = await db.nilai.create({
      data: {
        matkul_id: validated.matkul_id,
        kategori: validated.kategori,
        nama_item: validated.nama_item,
        nilai: validated.nilai,
        tanggal: new Date(validated.tanggal),
      },
      include: {
        matkul: true,
      },
    });

    return NextResponse.json({ nilai: newNilai }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }
    console.error("Error creating nilai:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan entri nilai" },
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
        { error: "ID nilai wajib disertakan" },
        { status: 400 }
      );
    }

    const currentNilai = await db.nilai.findFirst({
      where: {
        id,
        matkul: { semester: { user_id: userId } },
      },
    });

    if (!currentNilai) {
      return NextResponse.json(
        { error: "Entri nilai tidak ditemukan atau Anda tidak memiliki akses" },
        { status: 404 }
      );
    }

    const validated = nilaiSchema.parse(data);

    const updated = await db.nilai.update({
      where: { id },
      data: {
        matkul_id: validated.matkul_id,
        kategori: validated.kategori,
        nama_item: validated.nama_item,
        nilai: validated.nilai,
        tanggal: new Date(validated.tanggal),
      },
      include: {
        matkul: true,
      },
    });

    return NextResponse.json({ nilai: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }
    console.error("Error updating nilai:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui nilai" },
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
        { error: "ID nilai wajib disertakan" },
        { status: 400 }
      );
    }

    const currentNilai = await db.nilai.findFirst({
      where: {
        id,
        matkul: { semester: { user_id: userId } },
      },
    });

    if (!currentNilai) {
      return NextResponse.json(
        { error: "Entri nilai tidak ditemukan atau Anda tidak memiliki akses" },
        { status: 404 }
      );
    }

    await db.nilai.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting nilai:", error);
    return NextResponse.json(
      { error: "Gagal menghapus nilai" },
      { status: 500 }
    );
  }
}

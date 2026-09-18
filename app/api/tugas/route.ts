import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const tugasSchema = z.object({
  matkul_id: z.string().min(1, "Mata kuliah wajib dipilih"),
  judul: z.string().min(2, "Judul tugas minimal 2 karakter"),
  deskripsi: z.string().optional().nullable(),
  deadline: z.string().or(z.date()),
  status: z.enum(["belum", "proses", "selesai"]).default("belum"),
  prioritas: z.enum(["rendah", "sedang", "tinggi"]).default("sedang"),
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
    const status = searchParams.get("status");
    const prioritas = searchParams.get("prioritas");

    const whereClause: Record<string, unknown> = {
      matkul: {
        semester: {
          user_id: userId,
        },
      },
    };

    if (matkulId) whereClause.matkul_id = matkulId;
    if (status) whereClause.status = status;
    if (prioritas) whereClause.prioritas = prioritas;

    const tugasList = await db.tugasDeadline.findMany({
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
      orderBy: [{ deadline: "asc" }, { prioritas: "desc" }],
    });

    return NextResponse.json({ tugas: tugasList });
  } catch (error) {
    console.error("Error fetching tugas:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data tugas & deadline" },
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
    const validated = tugasSchema.parse(body);

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

    const newTugas = await db.tugasDeadline.create({
      data: {
        matkul_id: validated.matkul_id,
        judul: validated.judul,
        deskripsi: validated.deskripsi || null,
        deadline: new Date(validated.deadline),
        status: validated.status,
        prioritas: validated.prioritas,
      },
      include: {
        matkul: true,
      },
    });

    return NextResponse.json({ tugas: newTugas }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }
    console.error("Error creating tugas:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan tugas baru" },
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
        { error: "ID tugas wajib disertakan" },
        { status: 400 }
      );
    }

    // Pastikan tugas ini milik user yang sedang login
    const currentTugas = await db.tugasDeadline.findFirst({
      where: {
        id,
        matkul: { semester: { user_id: userId } },
      },
    });

    if (!currentTugas) {
      return NextResponse.json(
        { error: "Tugas tidak ditemukan atau Anda tidak memiliki akses" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (data.matkul_id) {
      // Jika matkul dipindahkan, pastikan matkul tujuan milik user
      const targetMatkul = await db.matkul.findFirst({
        where: { id: data.matkul_id, semester: { user_id: userId } },
      });
      if (!targetMatkul) {
        return NextResponse.json(
          { error: "Mata kuliah target tidak valid" },
          { status: 400 }
        );
      }
      updateData.matkul_id = data.matkul_id;
    }
    if (data.judul) updateData.judul = data.judul;
    if (data.deskripsi !== undefined) updateData.deskripsi = data.deskripsi;
    if (data.deadline) updateData.deadline = new Date(data.deadline);
    if (data.status) updateData.status = data.status;
    if (data.prioritas) updateData.prioritas = data.prioritas;

    const updated = await db.tugasDeadline.update({
      where: { id },
      data: updateData,
      include: {
        matkul: true,
      },
    });

    return NextResponse.json({ tugas: updated });
  } catch (error) {
    console.error("Error updating tugas:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui data tugas" },
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
        { error: "ID tugas wajib disertakan" },
        { status: 400 }
      );
    }

    const currentTugas = await db.tugasDeadline.findFirst({
      where: {
        id,
        matkul: { semester: { user_id: userId } },
      },
    });

    if (!currentTugas) {
      return NextResponse.json(
        { error: "Tugas tidak ditemukan atau Anda tidak memiliki hak akses" },
        { status: 404 }
      );
    }

    await db.tugasDeadline.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting tugas:", error);
    return NextResponse.json(
      { error: "Gagal menghapus tugas" },
      { status: 500 }
    );
  }
}

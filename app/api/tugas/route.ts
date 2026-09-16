import { NextRequest, NextResponse } from "next/server";
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
    const { searchParams } = new URL(req.url);
    const matkulId = searchParams.get("matkul_id");
    const status = searchParams.get("status");
    const prioritas = searchParams.get("prioritas");

    const whereClause: Record<string, unknown> = {};
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
    const body = await req.json();
    const validated = tugasSchema.parse(body);

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
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID tugas wajib disertakan" },
        { status: 400 }
      );
    }

    // Allow partial updates (e.g. just toggling status)
    const updateData: Record<string, unknown> = {};
    if (data.matkul_id) updateData.matkul_id = data.matkul_id;
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
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID tugas wajib disertakan" },
        { status: 400 }
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

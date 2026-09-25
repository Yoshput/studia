import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { searchParams } = new URL(req.url);
    const matkulId = searchParams.get("matkul_id");
    const query = searchParams.get("q")?.toLowerCase();

    const whereClause: any = { user_id: userId };
    if (matkulId) {
      whereClause.matkul_id = matkulId;
    }

    const catatan = await prisma.catatanKuliah.findMany({
      where: whereClause,
      include: {
        matkul: {
          select: { id: true, nama: true, kode: true, warna: true },
        },
      },
      orderBy: [{ is_favorite: "desc" }, { updatedAt: "desc" }],
    });

    // Client-side or in-memory search filter if query is present
    const filtered = query
      ? catatan.filter(
          (c: any) =>
            c.judul.toLowerCase().includes(query) ||
            c.konten.toLowerCase().includes(query) ||
            (c.tags && c.tags.toLowerCase().includes(query))
        )
      : catatan;

    return NextResponse.json({ catatan: filtered });
  } catch (error: any) {
    console.error("GET /api/catatan error:", error);
    return NextResponse.json({ error: error.message || "Gagal mengambil catatan" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const body = await req.json();

    const { judul, konten, matkul_id, tags } = body;
    if (!judul || !judul.trim()) {
      return NextResponse.json({ error: "Judul catatan wajib diisi" }, { status: 400 });
    }

    const newNote = await prisma.catatanKuliah.create({
      data: {
        user_id: userId,
        judul: judul.trim(),
        konten: konten || "",
        matkul_id: matkul_id || null,
        tags: tags || null,
      },
      include: {
        matkul: {
          select: { id: true, nama: true, kode: true, warna: true },
        },
      },
    });

    return NextResponse.json({ success: true, catatan: newNote }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/catatan error:", error);
    return NextResponse.json({ error: error.message || "Gagal membuat catatan" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const body = await req.json();

    const { id, judul, konten, matkul_id, tags, is_favorite } = body;
    if (!id) {
      return NextResponse.json({ error: "ID catatan diperlukan" }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.catatanKuliah.findFirst({
      where: { id, user_id: userId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Catatan tidak ditemukan" }, { status: 404 });
    }

    const updated = await prisma.catatanKuliah.update({
      where: { id },
      data: {
        judul: judul !== undefined ? judul.trim() : existing.judul,
        konten: konten !== undefined ? konten : existing.konten,
        matkul_id: matkul_id !== undefined ? matkul_id || null : existing.matkul_id,
        tags: tags !== undefined ? tags : existing.tags,
        is_favorite: is_favorite !== undefined ? is_favorite : existing.is_favorite,
      },
      include: {
        matkul: {
          select: { id: true, nama: true, kode: true, warna: true },
        },
      },
    });

    return NextResponse.json({ success: true, catatan: updated });
  } catch (error: any) {
    console.error("PUT /api/catatan error:", error);
    return NextResponse.json({ error: error.message || "Gagal memperbarui catatan" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID catatan diperlukan" }, { status: 400 });
    }

    const existing = await prisma.catatanKuliah.findFirst({
      where: { id, user_id: userId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Catatan tidak ditemukan" }, { status: 404 });
    }

    await prisma.catatanKuliah.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Catatan berhasil dihapus" });
  } catch (error: any) {
    console.error("DELETE /api/catatan error:", error);
    return NextResponse.json({ error: error.message || "Gagal menghapus catatan" }, { status: 500 });
  }
}

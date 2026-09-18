import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const bobotArraySchema = z.object({
  matkul_id: z.string().min(1, "Mata kuliah wajib dipilih"),
  bobot: z.array(
    z.object({
      kategori: z.string(),
      bobot_persen: z.coerce.number().min(0).max(100),
    })
  ),
});

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Autentikasi diperlukan" }, { status: 401 });
    }

    const body = await req.json();
    const validated = bobotArraySchema.parse(body);

    // Pastikan matkul_id milik user yang bersangkutan
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

    // Sum validation check: 100%
    const totalPercent = validated.bobot.reduce((acc, b) => acc + b.bobot_persen, 0);
    if (Math.abs(totalPercent - 100) > 0.01) {
      return NextResponse.json(
        { error: `Total bobot harus berjumlah 100% (saat ini ${totalPercent}%)` },
        { status: 400 }
      );
    }

    const updates = await Promise.all(
      validated.bobot.map((item) =>
        db.nilaiBobot.upsert({
          where: {
            matkul_id_kategori: {
              matkul_id: validated.matkul_id,
              kategori: item.kategori,
            },
          },
          update: {
            bobot_persen: item.bobot_persen,
          },
          create: {
            matkul_id: validated.matkul_id,
            kategori: item.kategori,
            bobot_persen: item.bobot_persen,
          },
        })
      )
    );

    return NextResponse.json({ bobot: updates });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }
    console.error("Error updating bobot:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui bobot nilai" },
      { status: 500 }
    );
  }
}

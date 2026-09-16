import { NextRequest, NextResponse } from "next/server";
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
    const body = await req.json();
    const validated = bobotArraySchema.parse(body);

    // Sum validation check: warn or ensure valid
    const totalPercent = validated.bobot.reduce((acc, b) => acc + b.bobot_persen, 0);
    if (Math.abs(totalPercent - 100) > 0.01) {
      return NextResponse.json(
        { error: `Total bobot harus berjumlah 100% (saat ini ${totalPercent}%)` },
        { status: 400 }
      );
    }

    // Upsert each category weight
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

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateWithGemini } from "@/lib/ai/gemini";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rawText, judul, matkulNama } = await req.json();
    if (!rawText || !rawText.trim()) {
      return NextResponse.json({ error: "Konten catatan kosong" }, { status: 400 });
    }

    const systemPrompt = `Kamu adalah asisten akademik AI perapih catatan kuliah profesional untuk mahasiswa.
Tugasmu: Mengubah draf catatan kuliah yang acak-acakan atau ringkas menjadi format Markdown akademik yang sangat rapi, terstruktur, komprehensif, dan mudah dipelajari ulang (bergaya Notion / Apple Notes).
Pedoman penulisan:
1. Mulai dengan blok ringkasan intisari materi singkat di atas.
2. Gunakan hierarki heading yang logis (## Konsep Inti, ### Subtopik, dsb).
3. Gunakan bullet points, penekanan tebal (bold) pada kata kunci teknis, dan contoh aplikatif.
4. Buat bagian "Istilah Kunci & Definisi" jika ada istilah baru.
5. Buat bagian "Checklist Poin Penting untuk Ujian / Tugas" di akhir.
6. HANYA kembalikan teks Markdown murni tanpa kata pengantar atau penutup seperti "Tentu, ini hasilnya:".`;

    const userPrompt = `Mata Kuliah: ${matkulNama || "Umum"}
Judul: ${judul || "Catatan Kuliah"}
Draf Catatan Mentah Mahasiswa:
---
${rawText}
---
Ubah draf di atas menjadi Markdown catatan kuliah yang rapi, padat, dan terstruktur.`;

    const polishedMarkdown = await generateWithGemini({
      systemPrompt,
      userPrompt,
      temperature: 0.3,
    });

    return NextResponse.json({
      success: true,
      polishedMarkdown,
    });
  } catch (error: any) {
    console.error("POST /api/catatan/polish error:", error);
    return NextResponse.json({ error: error.message || "Gagal merapikan catatan dengan AI" }, { status: 500 });
  }
}

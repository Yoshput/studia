import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { parsePptxBuffer } from "@/lib/materi/pptx-parser";
import { generateWithGemini } from "@/lib/ai/gemini";

export const maxDuration = 60; // Allow 60 seconds on serverless

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const matkulId = formData.get("matkul_id") as string | null;
    const customTitle = formData.get("judul_materi") as string | null;

    if (!file) {
      return NextResponse.json({ error: "File presentasi .pptx wajib diunggah" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".pptx")) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Harap unggah berkas berekstensi .pptx" },
        { status: 400 }
      );
    }

    // Limit file size (max 25MB)
    const MAX_SIZE = 25 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Ukuran file terlalu besar. Maksimum 25 MB per dokumen." },
        { status: 400 }
      );
    }

    // Read directly into memory buffer (Zero disk persistence)
    const arrayBuffer = await file.arrayBuffer();
    const parsedPptx = await parsePptxBuffer(arrayBuffer);

    if (parsedPptx.totalSlides === 0 || !parsedPptx.fullText) {
      return NextResponse.json(
        { error: "Tidak dapat menemukan teks slide pada berkas PPTX ini. Pastikan slide berisi teks bukan hanya gambar murni." },
        { status: 400 }
      );
    }

    const title = customTitle?.trim() || file.name.replace(/\.pptx$/i, "");

    // Prompt Gemini for comprehensive academic summary + flashcards
    const systemPrompt = `Kamu adalah AI perangkum materi kuliah ilmiah terbaik untuk mahasiswa.
Tugasmu: Menganalisis seluruh teks slide presentasi PPTX, mengekstrak konsep terpenting, dan menghasilkan output JSON yang terstruktur dan siap dipelajari.

KEMBALIKAN HANYA JSON MURNI dengan format berikut:
{
  "judul": "Judul Materi Ringkasan",
  "ringkasan_eksekutif": "Ringkasan komprehensif dalam 2-3 paragraf padat tentang apa yang dibahas",
  "markdown_body": "Teks materi lengkap dalam format Markdown rapi dengan heading ##, ###, bullet points, penekanan tebal, penjelasan konsep per sub-topik, dan daftar istilah penting.",
  "key_points": [
    "Poin kunci 1",
    "Poin kunci 2",
    "Poin kunci 3",
    "Poin kunci 4",
    "Poin kunci 5"
  ],
  "flashcards": [
    {
      "pertanyaan": "Pertanyaan pemahaman konsep?",
      "jawaban": "Jawaban jelas dan ringkas."
    }
  ]
}`;

    const userPrompt = `Judul Dokumen: ${title}
Total Slide: ${parsedPptx.totalSlides} Slide
Isi Teks Ekstraksi PPTX:
---
${parsedPptx.fullText.substring(0, 30000)}
---
Hasilkan ringkasan akademik lengkap, poin kunci, dan 5 kartu flashcard latihan dalam format JSON murni.`;

    const rawResult = await generateWithGemini({
      systemPrompt,
      userPrompt,
      temperature: 0.3,
      responseFormat: "json",
    });

    let aiData;
    try {
      const clean = rawResult.replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
      aiData = JSON.parse(clean);
    } catch (e) {
      console.error("Gagal mengurai JSON ringkasan PPT:", rawResult);
      // Fallback
      aiData = {
        judul: title,
        ringkasan_eksekutif: "Ringkasan materi berhasil diekstraksi.",
        markdown_body: rawResult,
        key_points: ["Materi slide berhasil diproses."],
        flashcards: [],
      };
    }

    // Save summary to database (file asli otomatis dihapus dari memori)
    const saved = await prisma.pptSummary.create({
      data: {
        user_id: userId,
        matkul_id: matkulId || null,
        judul_materi: aiData.judul || title,
        nama_file: file.name,
        total_slides: parsedPptx.totalSlides,
        summary_markdown: `${aiData.ringkasan_eksekutif ? `> **Ringkasan Inti:**\n> ${aiData.ringkasan_eksekutif}\n\n` : ""}${aiData.markdown_body || ""}`,
        key_points_json: JSON.stringify(aiData.key_points || []),
        flashcards_json: JSON.stringify(aiData.flashcards || []),
      },
      include: {
        matkul: {
          select: { id: true, nama: true, kode: true, warna: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      summary: {
        ...saved,
        key_points: aiData.key_points || [],
        flashcards: aiData.flashcards || [],
      },
      message: `Berhasil merangkum ${parsedPptx.totalSlides} slide! Berkas fisik telah otomatis dibersihkan demi keamanan privasi Anda.`,
    });
  } catch (error: any) {
    console.error("POST /api/materi/summarize-ppt error:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan saat memproses ringkasan PPTX." },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const summaries = await prisma.pptSummary.findMany({
      where: { user_id: userId },
      include: {
        matkul: {
          select: { id: true, nama: true, kode: true, warna: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const parsed = summaries.map((s: any) => {
      let key_points = [];
      let flashcards = [];
      try {
        key_points = JSON.parse(s.key_points_json || "[]");
      } catch {}
      try {
        flashcards = JSON.parse(s.flashcards_json || "[]");
      } catch {}
      return {
        ...s,
        key_points,
        flashcards,
      };
    });

    return NextResponse.json({ summaries: parsed });
  } catch (error: any) {
    console.error("GET /api/materi/summarize-ppt error:", error);
    return NextResponse.json({ error: error.message || "Gagal mengambil daftar ringkasan materi" }, { status: 500 });
  }
}

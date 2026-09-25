import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateWithGemini } from "@/lib/ai/gemini";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { matkul_id, matkul_nama, topik, target_minggu, fokus } = await req.json();

    if (!topik || !topik.trim()) {
      return NextResponse.json({ error: "Topik atau tujuan belajar wajib diisi" }, { status: 400 });
    }

    const weeks = target_minggu && target_minggu >= 1 && target_minggu <= 8 ? target_minggu : 4;

    const systemPrompt = `Kamu adalah arsitek kurikulum akademik dan spesialis strategi belajar untuk mahasiswa teknik dan sains.
Tugasmu: Menyusun alur roadmap belajar bertahap yang realistis, terstruktur, terukur, dan berbasis aksi untuk mahasiswa.
KEMBALIKAN HANYA JSON MURNI sesuai skema ini:
{
  "judul": "Nama Roadmap Belajar",
  "ringkasan": "Deskripsi 1-2 kalimat mengenai fokus alur belajar ini",
  "steps": [
    {
      "step_number": 1,
      "phase": "Minggu 1: Fondasi",
      "title": "Judul Tahapan",
      "description": "Penjelasan inti apa yang harus dikuasai pada tahap ini",
      "action_items": [
        "Aksi konkret 1",
        "Aksi konkret 2",
        "Aksi konkret 3"
      ],
      "key_concept": "Konsep kunci yang wajib dimengerti"
    }
  ]
}`;

    const userPrompt = `Mata Kuliah: ${matkul_nama || "Umum"}
Topik / Materi: ${topik}
Durasi Target: ${weeks} Minggu
Fokus Utama: ${fokus || "Persiapan ujian dan penguasaan konsep praktikal"}
Buat roadmap belajar bertahap sebanyak ${weeks} tahapan mingguan. Hasilkan JSON murni tanpa markdown fences.`;

    const rawJson = await generateWithGemini({
      systemPrompt,
      userPrompt,
      temperature: 0.3,
      responseFormat: "json",
    });

    let parsed;
    try {
      // Clean possible fences
      const clean = rawJson.replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
      parsed = JSON.parse(clean);
    } catch (e) {
      console.error("JSON parse error from Gemini roadmap:", rawJson);
      throw new Error("Gagal mengurai format JSON roadmap dari AI.");
    }

    // Attach completion status to steps
    const stepsWithStatus = (parsed.steps || []).map((s: any, idx: number) => ({
      step_number: s.step_number || idx + 1,
      phase: s.phase || `Tahap ${idx + 1}`,
      title: s.title || `Langkah ${idx + 1}`,
      description: s.description || "",
      action_items: (s.action_items || []).map((act: string) => ({
        text: act,
        is_done: false,
      })),
      key_concept: s.key_concept || "",
      is_completed: false,
    }));

    // Save to database
    const newRoadmap = await prisma.studyRoadmap.create({
      data: {
        user_id: userId,
        matkul_id: matkul_id || null,
        judul: parsed.judul || `Roadmap: ${topik}`,
        topik: topik.trim(),
        steps_json: JSON.stringify(stepsWithStatus),
        progress_percent: 0,
      },
      include: {
        matkul: {
          select: { id: true, nama: true, kode: true, warna: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      roadmap: {
        ...newRoadmap,
        steps: stepsWithStatus,
      },
    });
  } catch (error: any) {
    console.error("POST /api/roadmap/generate error:", error);
    return NextResponse.json({ error: error.message || "Gagal membuat roadmap belajar" }, { status: 500 });
  }
}

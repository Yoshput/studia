import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  calculateEstimatedGrade,
  calculateAttentionScore,
  getDaysRemaining,
} from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Indonesian day names mapping
const DAYS_ID = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Pesan pertanyaan tidak boleh kosong" },
        { status: 400 }
      );
    }

    const todayDate = new Date();
    const todayDayName = DAYS_ID[todayDate.getDay()];

    // Client passed custom API key header (from UI settings) or server env
    const clientGeminiKey = req.headers.get("x-gemini-key")?.trim();
    const geminiApiKey = clientGeminiKey || process.env.GEMINI_API_KEY?.trim();
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY?.trim();

    // Fetch student's academic context
    const activeSemester = await db.semester.findFirst({
      where: { is_active: true },
      include: {
        matkul: {
          include: {
            bobot_nilai: true,
            nilai: true,
            progress: {
              orderBy: { tanggal: "desc" },
              take: 5,
            },
            tugas: {
              where: { status: { not: "selesai" } },
              orderBy: { deadline: "asc" },
            },
          },
        },
      },
    });

    if (!activeSemester) {
      return NextResponse.json({
        reply: "Belum ada semester aktif yang terdaftar di sistem database.",
      });
    }

    const todayMatkul = activeSemester.matkul.filter(
      (m) => m.hari.toLowerCase() === todayDayName.toLowerCase()
    );

    const allPendingTasks = activeSemester.matkul
      .flatMap((m) =>
        m.tugas.map((t) => ({
          ...t,
          matkulNama: m.nama,
          remaining: getDaysRemaining(t.deadline),
        }))
      )
      .sort((a, b) => a.deadline.getTime() - b.deadline.getTime());

    const urgentTasks = allPendingTasks.filter((t) => t.remaining.days <= 3);

    const matkulStats = activeSemester.matkul.map((m) => {
      const grade = calculateEstimatedGrade(m.nilai, m.bobot_nilai);
      const urgentCount = m.tugas.filter((t) => getDaysRemaining(t.deadline).days <= 3).length;
      const attention = calculateAttentionScore({
        id: m.id,
        nama: m.nama,
        sks: m.sks,
        currentScore: grade.currentScore,
        pendingTasksCount: m.tugas.length,
        urgentTasksCount: urgentCount,
        progressCount: m.progress.length,
      });

      return {
        nama: m.nama,
        sks: m.sks,
        dosen: m.dosen,
        ruang: m.ruang,
        hari: m.hari,
        jam: `${m.jam_mulai} - ${m.jam_selesai}`,
        score: grade.currentScore,
        gradeLetter: grade.letter,
        pendingTasks: m.tugas.length,
        attention,
      };
    });

    const needAttentionList = matkulStats.filter(
      (m) => m.attention.status === "perlu_perhatian" || m.attention.status === "waspada"
    );

    // Fetch logged in user identity for personalized conversation
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    const userEmail = session?.user?.email;

    let studentUser = null;
    if (userId || userEmail) {
      studentUser = await db.user.findFirst({
        where: {
          OR: [
            ...(userId ? [{ id: userId }] : []),
            ...(userEmail ? [{ email: userEmail }] : []),
          ],
        },
      });
    }

    const studentFullName = studentUser?.nama || session?.user?.name || "Mahasiswa";
    const studentCallName = studentFullName.split(" ")[0] || "Teman";
    const studentNim = studentUser?.nim || "-";
    const studentProdi = studentUser?.prodi || "Teknik Informatika";
    const studentKelas = studentUser?.kelas || "-";

    // Build context summary for AI
    const academicContextText = `
=== PROFIL MAHASISWA & KONTEKS AKADEMIK ===
Nama Mahasiswa: ${studentFullName}
NIM: ${studentNim}
Program Studi: ${studentProdi} (Kelas: ${studentKelas})
Institusi: Telkom University Purwokerto
Semester Aktif: Semester 5 (Tahun Ajaran 2026/2027)
Hari Ini: ${todayDayName}, ${todayDate.toLocaleDateString("id-ID", { dateStyle: "full" })}

Jadwal Kuliah Hari Ini (${todayDayName}):
${
  todayMatkul.length > 0
    ? todayMatkul
        .map(
          (m, idx) =>
            `${idx + 1}. ${m.nama} [${m.kode || "-"}] (${m.jam_mulai}-${m.jam_selesai} WIB, Ruang: ${m.ruang}, Dosen: ${m.dosen})`
        )
        .join("\n")
    : "Tidak ada jadwal kuliah hari ini. Waktu luang untuk belajar mandiri, praktikum, atau istirahat."
}

Daftar 8 Mata Kuliah Semester 5:
1. Senin: Tata Tulis Ilmiah (07:30 - 10:30, DC-104)
2. Selasa: Keamanan Siber (15:30 - 18:30, Lab Cyber / DC-101)
3. Rabu: Manajemen Projek TIK (12:30 - 15:30, DC-203)
4. Kamis: Kewarganegaraan (06:30 - 08:30, DC-201) & Komputasi Awan dan Terdistribusi (15:30 - 18:30, Lab Cloud)
5. Jum'at: Sistem Keamanan Cerdas (08:30 - 11:30, Lab Jarkom), Sosio-Informatik dan Keprofesian (13:30 - 15:30, DC-103), Kecerdasan Artifisial (15:30 - 18:30, DC-102)

Tugas Berjalan Saat Ini:
${
  allPendingTasks.length > 0
    ? allPendingTasks
        .map(
          (t, idx) =>
            `${idx + 1}. "${t.judul}" [${t.matkulNama}] - Batas: ${t.remaining.label} (Prioritas: ${t.prioritas}) - Catatan: ${t.deskripsi || "-"}`
        )
        .join("\n")
    : "Saat ini seluruh tugas telah tuntas (0 tugas pending)."
}

Konteks Lingkungan & Gaya Hidup Kampus:
- Lokasi: Kampus Telkom University Purwokerto (Jl. D.I. Panjaitan / Kawasan Dukuhwaluh, Purwokerto, Jawa Tengah).
- Kuliner & Tempat Favorit: Mendoan hangat kriuk sambal kecap rawit, Soto Sokaraja dengan kerupuk cantir & bumbu kacang, Ayam Geprek sekitar Dukuhwaluh, Kedai Kopi nugas colokan wifi di Purwokerto (seperti sekitar HR Soebronto atau Raden Patah).
- Karakter Bot: Bernama "Aiko" (Asisten Cerdas & Sahabat Belajar Mahasiswa). Komunikatif, hangat, cerdas, supportif, paham dunia coding/IT (Linux, VMware, Python, Cyber Security, AI, Web Dev), dan luwes menjawab apa saja mulai dari pertanyaan akademik sampai rekomendasi santai sehari-hari.
`;

    const systemInstruction = `Kamu adalah "Aiko", asisten akademik AI pintar dan sahabat belajar mahasiswa untuk ${studentFullName} (mahasiswa ${studentProdi} Telkom University Purwokerto).
Kamu memiliki kepribadian yang ramah, santai, cerdas, solutif, dan berempati tinggi.
Jawablah dengan Bahasa Indonesia yang alami, luwes, dan menyenangkan. Panggil pengguna dengan nama "${studentCallName}".
Jika ditanya tentang jadwal kuliah, deadline tugas, nilai, atau kampus, gunakan data kontekstual yang diberikan secara akurat.
Jika ditanya pertanyaan santai sehari-hari (misalnya: "mood makan apa ya enaknya hari ini", rekomendasi kuliner, curhat nugas, kopi, motivasi belajar, tips praktikum), jawablah dengan santai, kreatif, dan berikan rekomendasi nyata yang relevan untuk anak kuliahan di Purwokerto atau mahasiswa IT tanpa terikat template kaku.

${academicContextText}`;

    // =========================================================================
    // 1. GOOGLE GEMINI API INTEGRATION (Prioritized when key available)
    // =========================================================================
    if (geminiApiKey && geminiApiKey.length > 5) {
      try {
        const geminiModels = [
          "gemini-2.5-flash",
          "gemini-flash-latest",
          "gemini-2.5-flash-lite",
          "gemini-3.5-flash",
        ];
        for (const model of geminiModels) {
          try {
            const geminiRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  systemInstruction: {
                    parts: [{ text: systemInstruction }],
                  },
                  contents: [
                    {
                      role: "user",
                      parts: [{ text: message }],
                    },
                  ],
                  generationConfig: {
                    temperature: 0.75,
                    maxOutputTokens: 600,
                  },
                }),
              }
            );

            if (geminiRes.ok) {
              const gData = await geminiRes.json();
              const replyText = gData.candidates?.[0]?.content?.parts?.[0]?.text;
              if (replyText && replyText.trim().length > 0) {
                return NextResponse.json({
                  reply: replyText.trim(),
                  engine: "gemini",
                  model,
                });
              }
            } else {
              const errBody = await geminiRes.text();
              console.warn(`Gemini ${model} failed (${geminiRes.status}):`, errBody);
            }
          } catch (modelErr) {
            console.warn(`Error with ${model}:`, modelErr);
          }
        }
      } catch (geminiErr) {
        console.warn("Google Gemini API error, falling back:", geminiErr);
      }
    }

    // =========================================================================
    // 2. ANTHROPIC CLAUDE API INTEGRATION (Secondary fallback)
    // =========================================================================
    if (anthropicApiKey && anthropicApiKey.length > 10) {
      try {
        const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": anthropicApiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-3-haiku-20240307",
            max_tokens: 500,
            system: systemInstruction,
            messages: [{ role: "user", content: message }],
          }),
        });

        if (anthropicRes.ok) {
          const aiData = await anthropicRes.json();
          const reply = aiData.content?.[0]?.text;
          if (reply) {
            return NextResponse.json({ reply, engine: "anthropic" });
          }
        }
      } catch (err) {
        console.warn("Anthropic API call failed:", err);
      }
    }

    // =========================================================================
    // 3. ENHANCED CONTEXTUAL REASONING ENGINE (High-Fidelity Smart Fallback)
    // =========================================================================
    const lower = message.toLowerCase().trim();

    // 1. Rekomendasi Makanan / Mood Kuliner / Lapar
    if (
      lower.includes("makan") ||
      lower.includes("laper") ||
      lower.includes("lapar") ||
      lower.includes("kuliner") ||
      lower.includes("menu") ||
      lower.includes("kenyang") ||
      lower.includes("saran makan")
    ) {
      const foodSuggestions = [
        `Lagi bingung mau makan apa, ${studentCallName}? Kalau pengen yang anget dan khas banget, cobain **Soto Sokaraja** pake kerupuk cantir plus sambal kacang! Atau kalau mau yang simpel buat nemenin nugas: **Mendoan hangat** cocol kecap rawit di Jl. Suparno / sekitar Dukuhwaluh mantap banget!`,
        "Wah pas banget jam makan! Kalau butuh tenaga buat praktikum dan ngoding, **Ayam Geprek** level pedas favorit anak kampus di sekitar Dukuhwaluh bisa jadi pilihan cepat dan ngenyangin. Jangan lupa es teh jumbo-nya ya!",
        "Mood santai sambil buka laptop? Mending melipir cari **Mie Dok-Dok / Nasi Goreng Magelangan** anget di burjo dekat kampus Telkom, atau ngopi santai di kafe sekitar HR Soebronto biar dapet wifi colokan sekalian!",
      ];
      const randomFood = foodSuggestions[Math.floor(Math.random() * foodSuggestions.length)];
      return NextResponse.json({ reply: randomFood, engine: "smart-local" });
    }

    // 2. Kali Linux / VMware / Cyber Security / Sistem Keamanan Cerdas
    if (
      lower.includes("kali linux") ||
      lower.includes("vmware") ||
      lower.includes("virtual machine") ||
      lower.includes("sistem keamanan cerdas") ||
      lower.includes("cyber") ||
      lower.includes("keamanan siber")
    ) {
      return NextResponse.json({
        reply: `Untuk praktikum **Sistem Keamanan Cerdas**, pastikan setup VMware dan Kali Linux kamu sudah optimal ya ${studentCallName}:
1. Alokasikan RAM minimal 4 GB dan 2 CPU cores di VMware agar Kali Linux tidak lag.
2. Pasang \`open-vm-tools-desktop\` (\`sudo apt update && sudo apt install -y open-vm-tools-desktop\`) supaya resolusi layar otomatis pas dan clipboard copy-paste host-guest berfungsi mulus.
3. Gunakan mode Network **NAT** untuk koneksi internet dasar, atau **Bridged** jika butuh latihan scanning jaringan lab.
Sudah siap kelompok praktikumnya?`,
        engine: "smart-local",
      });
    }

    // 3. Tanya Jadwal Kuliah
    if (
      lower.includes("jadwal") ||
      lower.includes("kuliah hari ini") ||
      lower.includes("kelas hari ini") ||
      lower.includes("ada kelas")
    ) {
      if (todayMatkul.length === 0) {
        return NextResponse.json({
          reply: `Hari ini (${todayDayName}) kamu tidak ada jadwal kelas kuliah tatap muka di kampus, ${studentCallName}! Waktu yang pas buat santai sejenak, ngelanjutin tugas atau istirahat.`,
          engine: "smart-local",
        });
      }
      const list = todayMatkul
        .map(
          (m, idx) =>
            `${idx + 1}. **${m.nama}** (${m.jam_mulai} - ${m.jam_selesai} WIB)\n   Ruang: ${m.ruang} • Dosen: ${m.dosen}`
        )
        .join("\n\n");
      return NextResponse.json({
        reply: `Jadwal kuliah kamu hari ini (**${todayDayName}**):\n\n${list}\n\nSemangat kuliahnya, jangan lupa presensi scan wajah di kampus ya!`,
        engine: "smart-local",
      });
    }

    // 4. Tanya Deadline & Tugas
    if (
      lower.includes("deadline") ||
      lower.includes("tugas") ||
      lower.includes("to-do") ||
      lower.includes("pr") ||
      lower.includes("kerjaan")
    ) {
      if (allPendingTasks.length === 0) {
        return NextResponse.json({
          reply: "Mantap jiwa! Seluruh daftar tugas kamu saat ini beres dan tidak ada deadline yang tertunda. Kamu bisa fokus eksplorasi materi baru!",
          engine: "smart-local",
        });
      }

      let reply = `Kamu memiliki **${allPendingTasks.length} tugas aktif**:\n\n`;
      allPendingTasks.forEach((t, i) => {
        reply += `${i + 1}. **${t.judul}**\n   Mata Kuliah: ${t.matkulNama}\n   Batas Waktu: ${t.remaining.label} (Prioritas: ${t.prioritas})\n   ${t.deskripsi ? `Catatan: ${t.deskripsi}` : ""}\n\n`;
      });
      return NextResponse.json({ reply: reply.trim(), engine: "smart-local" });
    }

    // 5. Tanya Nilai & IPK
    if (
      lower.includes("nilai") ||
      lower.includes("ipk") ||
      lower.includes("transkrip") ||
      lower.includes("grade") ||
      lower.includes("sks")
    ) {
      return NextResponse.json({
        reply: `Catatan akademik semester ini siap dipantau, ${studentCallName}! Kamu bisa melihat detail evaluasi tiap mata kuliah, bobot penilaian, dan rekapitulasi nilai di menu **Nilai & Transkrip**. Tetap semangat dan pertahankan performa terbaikmu ya!`,
        engine: "smart-local",
      });
    }

    // 6. Sapaan / Halo / Hai
    if (
      lower === "halo" ||
      lower === "hai" ||
      lower === "p" ||
      lower.startsWith("halo") ||
      lower.startsWith("hai") ||
      lower.includes("assalamu")
    ) {
      return NextResponse.json({
        reply: `Halo ${studentCallName}! Ada yang bisa Aiko bantu hari ini? Kamu bisa tanya jadwal kuliah, tugas, tips praktikum, rekomendasi makanan, atau sekadar ngobrol santai! 😊`,
        engine: "smart-local",
      });
    }

    // 7. Tanya Siapa Kamu / Bot
    if (lower.includes("siapa kamu") || lower.includes("namamu") || lower.includes("kamu siapa")) {
      return NextResponse.json({
        reply: `Aku **Aiko**, asisten akademik AI dan sahabat belajar digitalmu di Semestr! Aku siap bantu kamu mantau jadwal kuliah, deadline tugas, hitung estimasi nilai, kasih tips praktikum, sampai ngobrol santai seputar kampus Telkom University Purwokerto.`,
        engine: "smart-local",
      });
    }

    // Default conversational response
    return NextResponse.json({
      reply: `Halo ${studentCallName}! Terkait "${message}", aku selalu siap nemenin kamu di semester ini. Kamu mau cek jadwal kuliah hari ini, pantau progres tugas, atau butuh rekomendasi tempat nugas dan kuliner enak di Purwokerto?`,
      engine: "smart-local",
    });
  } catch (error) {
    console.error("Error in assistant API:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada layanan asisten" },
      { status: 500 }
    );
  }
}

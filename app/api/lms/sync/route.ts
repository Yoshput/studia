import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { parseMoodleIcs } from "@/lib/lms/ical-parser";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        lms_ical_url: true,
        lms_last_sync: true,
      },
    });

    const lmsTaskCount = await prisma.tugasDeadline.count({
      where: {
        source: "lms_celoe",
        matkul: {
          semester: {
            user_id: userId,
          },
        },
      },
    });

    return NextResponse.json({
      hasIcalUrl: !!user?.lms_ical_url,
      icalUrl: user?.lms_ical_url ? `${user.lms_ical_url.substring(0, 30)}...` : null,
      lastSync: user?.lms_last_sync,
      lmsTaskCount,
    });
  } catch (error: any) {
    console.error("GET /api/lms/sync error:", error);
    return NextResponse.json({ error: error.message || "Gagal mengambil status sinkronisasi" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json().catch(() => ({}));
    let icalUrl = body.icalUrl?.trim();

    // If URL not provided in body, load existing one from user profile
    if (!icalUrl) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { lms_ical_url: true },
      });
      icalUrl = user?.lms_ical_url;
    }

    if (!icalUrl) {
      return NextResponse.json(
        { error: "URL iCal CeLOE belum diisi. Masukkan link ekspor kalender dari CeLOE Moodle Anda." },
        { status: 400 }
      );
    }

    // Validate URL scheme
    if (!icalUrl.startsWith("http://") && !icalUrl.startsWith("https://") && !icalUrl.startsWith("webcal://")) {
      return NextResponse.json(
        { error: "Format URL kalender tidak valid. Harus diawali dengan https:// atau webcal://" },
        { status: 400 }
      );
    }

    // Convert webcal:// to https://
    const fetchUrl = icalUrl.replace(/^webcal:\/\//i, "https://");

    // Fetch the .ics calendar data
    const icsRes = await fetch(fetchUrl, {
      headers: {
        "User-Agent": "Studia-Academic-OS/2.0 (Telkom University Companion)",
      },
      next: { revalidate: 0 },
    });

    if (!icsRes.ok) {
      return NextResponse.json(
        { error: `Gagal mengunduh kalender dari CeLOE (Status: ${icsRes.status}). Pastikan link masih aktif.` },
        { status: 400 }
      );
    }

    const icsContent = await icsRes.text();
    if (!icsContent.includes("BEGIN:VCALENDAR")) {
      return NextResponse.json(
        { error: "Konten yang diunduh bukan format iCalendar (.ics) valid dari CeLOE." },
        { status: 400 }
      );
    }

    // Parse events
    const parsedEvents = parseMoodleIcs(icsContent);

    // Save/update user's ical url
    await prisma.user.update({
      where: { id: userId },
      data: {
        lms_ical_url: icalUrl,
        lms_last_sync: new Date(),
      },
    });

    // Find active semester and user matkul
    let activeSemester = await prisma.semester.findFirst({
      where: { user_id: userId, is_active: true },
      include: { matkul: true },
    });

    if (!activeSemester) {
      // Find or create default semester
      activeSemester = await prisma.semester.create({
        data: {
          user_id: userId,
          nama_semester: "Semester Ganjil 2026/2027",
          tahun_ajaran: "2026/2027",
          is_active: true,
        },
        include: { matkul: true },
      });
    }

    let defaultMatkul = activeSemester.matkul[0];
    if (!defaultMatkul) {
      defaultMatkul = await prisma.matkul.create({
        data: {
          semester_id: activeSemester.id,
          nama: "CeLOE LMS Moodle",
          kode: "CELOE",
          dosen: "Dosen CeLOE",
          sks: 2,
          hari: "Senin",
          jam_mulai: "07:30",
          jam_selesai: "09:30",
          ruang: "Online CeLOE",
          warna: "#E11D48",
        },
      });
    }

    const matkulList = activeSemester.matkul.length > 0 ? activeSemester.matkul : [defaultMatkul];

    let createdCount = 0;
    let updatedCount = 0;

    for (const evt of parsedEvents) {
      // Match course
      let targetMatkulId = defaultMatkul.id;

      if (evt.courseName) {
        const found = matkulList.find((m: any) => {
          const mNama = m.nama.toLowerCase();
          const cNama = evt.courseName!.toLowerCase();
          return mNama.includes(cNama) || cNama.includes(mNama) || (m.kode && cNama.includes(m.kode.toLowerCase()));
        });
        if (found) targetMatkulId = found.id;
      }

      // Check if already exists by lms_uid
      const existing = await prisma.tugasDeadline.findFirst({
        where: {
          lms_uid: evt.uid,
          matkul: {
            semester: {
              user_id: userId,
            },
          },
        },
      });

      if (existing) {
        await prisma.tugasDeadline.update({
          where: { id: existing.id },
          data: {
            judul: evt.judul,
            deskripsi: evt.deskripsi || existing.deskripsi,
            deadline: evt.deadline,
            url: evt.url || existing.url,
            prioritas: evt.prioritas,
          },
        });
        updatedCount++;
      } else {
        await prisma.tugasDeadline.create({
          data: {
            matkul_id: targetMatkulId,
            judul: evt.judul,
            deskripsi: evt.deskripsi || null,
            deadline: evt.deadline,
            prioritas: evt.prioritas,
            status: "belum",
            source: "lms_celoe",
            lms_uid: evt.uid,
            url: evt.url || null,
          },
        });
        createdCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sinkronisasi CeLOE berhasil! ${createdCount} tugas baru ditambahkan, ${updatedCount} tugas diperbarui.`,
      createdCount,
      updatedCount,
      totalEvents: parsedEvents.length,
      syncedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("POST /api/lms/sync error:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan saat memproses sinkronisasi CeLOE." },
      { status: 500 }
    );
  }
}

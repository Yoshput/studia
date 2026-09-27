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
    let icsContent = body.icsContent?.trim();

    // If icsContent is not provided, fetch from icalUrl
    if (!icsContent) {
      if (!icalUrl) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { lms_ical_url: true },
        });
        icalUrl = user?.lms_ical_url;
      }

      if (!icalUrl) {
        return NextResponse.json(
          { error: "URL iCal atau file kalender belum diisi. Masukkan URL atau unggah file .ics dari CeLOE Moodle Anda." },
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

      const fetchUrl = icalUrl.replace(/^webcal:\/\//i, "https://");

      try {
        const icsRes = await fetch(fetchUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            "Accept": "text/calendar,text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
          },
          next: { revalidate: 0 },
        });

        if (!icsRes.ok) {
          if (icsRes.status === 403) {
            return NextResponse.json(
              {
                error: "Server CeLOE memblokir permintaan otomatis dari cloud (Status: 403 Forbidden Cloudflare). Silakan unduh file kalender langsung dengan klik tombol merah 'Export' di CeLOE, lalu unggah file icalexport.ics pada tab 'Unggah File .ics' di bawah.",
                cloudflareBlocked: true,
              },
              { status: 400 }
            );
          }

          return NextResponse.json(
            { error: `Gagal mengunduh kalender dari CeLOE (Status: ${icsRes.status}). Pastikan token kalender masih aktif atau unggah file .ics secara langsung.` },
            { status: 400 }
          );
        }

        icsContent = await icsRes.text();
      } catch (fetchErr: any) {
        return NextResponse.json(
          {
            error: "Tidak dapat menghubungi server CeLOE dari cloud. Silakan klik tombol 'Export' di halaman CeLOE Anda dan unggah file .ics tersebut ke Studia.",
            cloudflareBlocked: true,
          },
          { status: 400 }
        );
      }
    }

    if (!icsContent || !icsContent.includes("BEGIN:VCALENDAR")) {
      return NextResponse.json(
        { error: "Konten kalender tidak valid atau tidak memiliki format iCalendar (BEGIN:VCALENDAR)." },
        { status: 400 }
      );
    }

    // Parse events
    const parsedEvents = parseMoodleIcs(icsContent);

    // Save/update user's ical url
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(icalUrl ? { lms_ical_url: icalUrl } : {}),
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

    const matkulList = [...activeSemester.matkul];
    let defaultMatkul = matkulList[0] || null;

    const getDefaultMatkul = async () => {
      if (defaultMatkul) return defaultMatkul;
      const created = await prisma.matkul.create({
        data: {
          semester_id: activeSemester.id,
          nama: "CeLOE LMS Umum",
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
      defaultMatkul = created;
      matkulList.push(created);
      return created;
    };

    let createdCount = 0;
    let updatedCount = 0;

    for (const evt of parsedEvents) {
      // Match course
      let targetMatkulId: string;

      if (evt.courseName) {
        const cleanCourseCode = evt.courseName.split("-")[0].trim();
        const found = matkulList.find((m: any) => {
          const mNama = m.nama.toLowerCase();
          const cNama = evt.courseName!.toLowerCase();
          const mKode = (m.kode || "").toLowerCase();
          const cKode = cleanCourseCode.toLowerCase();
          return (
            mNama.includes(cNama) ||
            cNama.includes(mNama) ||
            (mKode && (cKode.includes(mKode) || mKode.includes(cKode)))
          );
        });

        if (found) {
          targetMatkulId = found.id;
        } else {
          // Auto create course with balanced weekday and timeslot
          const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
          const TIMES = [
            { start: "07:30", end: "10:30" },
            { start: "10:30", end: "13:30" },
            { start: "13:30", end: "16:30" },
          ];
          const day = DAYS[matkulList.length % DAYS.length];
          const time = TIMES[Math.floor(matkulList.length / DAYS.length) % TIMES.length];
          const COLORS = ["#007AFF", "#5856D6", "#AF52DE", "#FF2D55", "#FF9500", "#34C759", "#00C7BE"];

          try {
            const newMatkul = await prisma.matkul.create({
              data: {
                semester_id: activeSemester.id,
                nama: evt.courseName,
                kode: cleanCourseCode || "CELOE",
                dosen: "Dosen Pengampu",
                sks: 3,
                hari: day,
                jam_mulai: time.start,
                jam_selesai: time.end,
                ruang: "Ruang Kuliah",
                warna: COLORS[matkulList.length % COLORS.length],
              },
            });
            matkulList.push(newMatkul);
            targetMatkulId = newMatkul.id;
          } catch {
            const fallback = await getDefaultMatkul();
            targetMatkulId = fallback.id;
          }
        }
      } else {
        const fallback = await getDefaultMatkul();
        targetMatkulId = fallback.id;
      }

      // Check if already exists by lms_uid OR by exact title in the user's active semester
      const existing = await prisma.tugasDeadline.findFirst({
        where: {
          matkul: {
            semester: {
              user_id: userId,
            },
          },
          OR: [
            { lms_uid: evt.uid },
            { judul: evt.judul },
          ],
        },
      });

      if (existing) {
        // PRESERVE user completion status! Never revert completed tasks or duplicate them.
        await prisma.tugasDeadline.update({
          where: { id: existing.id },
          data: {
            judul: evt.judul,
            deskripsi: evt.deskripsi || existing.deskripsi,
            deadline: evt.deadline,
            url: evt.url || existing.url,
            prioritas: evt.prioritas,
            lms_uid: evt.uid,
            status: existing.status, // Strictly keep user's current status
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

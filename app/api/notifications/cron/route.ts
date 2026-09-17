import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendPushToUser } from "@/lib/webpush";

const DAYS_ID = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export async function GET() {
  return handleCron();
}

export async function POST() {
  return handleCron();
}

async function handleCron() {
  try {
    const user = await db.user.findFirst();
    if (!user) {
      return NextResponse.json({ message: "No user found" }, { status: 200 });
    }

    const now = new Date();
    const nowWib = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
    const todayDayName = DAYS_ID[nowWib.getDay()];
    const currentHour = nowWib.getHours();
    const currentMinute = nowWib.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinute;

    const notificationsSent: string[] = [];

    // 1. Check Classes (15 minutes before)
    const todayClasses = await db.matkul.findMany({
      where: {
        hari: todayDayName,
      },
    });

    for (const matkul of todayClasses) {
      const [startH, startM] = matkul.jam_mulai.split(":").map(Number);
      if (!isNaN(startH) && !isNaN(startM)) {
        const classStartMinutes = startH * 60 + startM;
        const diffMinutes = classStartMinutes - currentTotalMinutes;

        if (diffMinutes >= 10 && diffMinutes <= 20) {
          const res = await sendPushToUser(user.id, {
            title: `Kuliah Segera Dimulai (${diffMinutes} Menit)`,
            body: `${matkul.nama} di ruang ${matkul.ruang} mulai pukul ${matkul.jam_mulai} WIB.`,
            url: "/jadwal",
            tag: `class-${matkul.id}-${nowWib.toDateString()}`,
          });
          if (res.success) {
            notificationsSent.push(`Class: ${matkul.nama}`);
          }
        }
      }
    }

    // 2. Check Tasks (H-1 and H-3 hours)
    const activeTasks = await db.tugasDeadline.findMany({
      where: {
        status: { not: "selesai" },
      },
      include: {
        matkul: true,
      },
    });

    for (const task of activeTasks) {
      const deadline = new Date(task.deadline);
      const diffMs = deadline.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      // H-3 hours (between 2.5 and 3.5 hours)
      if (diffHours >= 2.5 && diffHours <= 3.5) {
        const res = await sendPushToUser(user.id, {
          title: "Batas Pengumpulan Mendekat (3 Jam)",
          body: `Tugas "${task.judul}" (${task.matkul.nama}) segera kumpulkan sebelum tenggat waktu.`,
          url: "/tugas",
          tag: `task-h3-${task.id}`,
        });
        if (res.success) {
          notificationsSent.push(`Task H-3: ${task.judul}`);
        }
      }
      // H-1 day (between 23 and 25 hours)
      else if (diffHours >= 23 && diffHours <= 25) {
        const res = await sendPushToUser(user.id, {
          title: "Pengingat Deadline Tugas (Besok)",
          body: `Tugas "${task.judul}" (${task.matkul.nama}) memiliki tenggat pengumpulan besok.`,
          url: "/tugas",
          tag: `task-h24-${task.id}`,
        });
        if (res.success) {
          notificationsSent.push(`Task H-24: ${task.judul}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      dispatched: notificationsSent,
    });
  } catch (error: any) {
    console.error("Cron notification error:", error);
    return NextResponse.json(
      { error: "Cron execution failed", details: error?.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendPushToUser } from "@/lib/webpush";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    let user = null;

    const userId = (session?.user as { id?: string })?.id;
    const userEmail = session?.user?.email;

    if (userId || userEmail) {
      user = await db.user.findFirst({
        where: {
          OR: [
            ...(userId ? [{ id: userId }] : []),
            ...(userEmail ? [{ email: userEmail }] : []),
          ],
        },
      });
    }

    if (!user) {
      return NextResponse.json({ error: "Silakan login untuk menguji notifikasi" }, { status: 401 });
    }

    const res = await sendPushToUser(user.id, {
      title: "Semestr — Uji Coba Pengingat",
      body: "Notifikasi sistem berhasil tersambung! Anda akan menerima pengingat jadwal kuliah dan deadline tugas.",
      url: "/dashboard",
      tag: "test-notification",
    });

    if (!res.success) {
      return NextResponse.json(
        {
          error: res.message || "Belum ada perangkat yang terdaftar atau pengiriman gagal. Pastikan izin notifikasi browser telah aktif.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Notifikasi uji coba berhasil dikirim ke ${res.sent} perangkat terdaftar.`,
    });
  } catch (error: any) {
    console.error("Test notification error:", error);
    return NextResponse.json(
      { error: "Gagal mengirim notifikasi uji coba" },
      { status: 500 }
    );
  }
}

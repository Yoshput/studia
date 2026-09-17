import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    let user = null;

    if (session?.user?.email) {
      user = await db.user.findUnique({
        where: { email: session.user.email },
      });
    }

    if (!user) {
      user = await db.user.findFirst();
    }

    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 401 });
    }

    const body = await req.json();
    const { endpoint, keys } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { error: "Payload subscription tidak lengkap" },
        { status: 400 }
      );
    }

    const existing = await db.pushSubscription.findFirst({
      where: { endpoint },
    });

    if (existing) {
      await db.pushSubscription.update({
        where: { id: existing.id },
        data: {
          user_id: user.id,
          p256dh: keys.p256dh,
          auth: keys.auth,
        },
      });
    } else {
      await db.pushSubscription.create({
        data: {
          user_id: user.id,
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Push subscription berhasil didaftarkan ke sistem",
    });
  } catch (error: any) {
    console.error("Subscribe push error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan push subscription" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { endpoint } = body;

    if (endpoint) {
      await db.pushSubscription.deleteMany({
        where: { endpoint },
      });
    }

    return NextResponse.json({ success: true, message: "Subscription berhasil dihapus" });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus subscription" },
      { status: 500 }
    );
  }
}

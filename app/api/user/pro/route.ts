import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    if (!userId) {
      return NextResponse.json({ error: "Autentikasi diperlukan" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nama: true,
        email: true,
        is_pro: true,
        pro_plan: true,
        pro_expires_at: true,
      },
    });

    return NextResponse.json({
      is_pro: user?.is_pro ?? false,
      pro_plan: user?.pro_plan ?? "free",
      pro_expires_at: user?.pro_expires_at ?? null,
    });
  } catch (error) {
    console.error("Error fetching PRO status:", error);
    return NextResponse.json({ error: "Gagal memuat status PRO" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    if (!userId) {
      return NextResponse.json({ error: "Autentikasi diperlukan" }, { status: 401 });
    }

    const body = await req.json();
    const { action, promo_code, plan } = body;

    // Promo Code activation
    if (action === "redeem_code") {
      const validCodes: Record<string, { plan: string; days: number }> = {
        TELKOMJUARA: { plan: "PRO_SEMESTER", days: 180 },
        SEMESTRPRO: { plan: "PRO_SEMESTER", days: 180 },
        CUMLAUDE: { plan: "PRO_LIFETIME", days: 3650 },
        YOSSIKA2026: { plan: "PRO_LIFETIME", days: 3650 },
      };

      const cleanCode = String(promo_code || "").trim().toUpperCase();
      const matched = validCodes[cleanCode];

      if (!matched) {
        return NextResponse.json(
          { error: "Kode voucher tidak valid atau sudah kadaluarsa" },
          { status: 400 }
        );
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + matched.days);

      const updated = await db.user.update({
        where: { id: userId },
        data: {
          is_pro: true,
          pro_plan: matched.plan,
          pro_expires_at: expiresAt,
        },
        select: {
          id: true,
          is_pro: true,
          pro_plan: true,
          pro_expires_at: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Selamat! Paket ${matched.plan === "PRO_LIFETIME" ? "PRO Seumur Hidup" : "PRO Semester"} berhasil diaktifkan.`,
        user: updated,
      });
    }

    // Direct Upgrade Request (e.g. mock test or upgrade handler)
    if (action === "upgrade") {
      const selectedPlan = plan === "lifetime" ? "PRO_LIFETIME" : "PRO_SEMESTER";
      const days = selectedPlan === "PRO_LIFETIME" ? 3650 : 180;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);

      const updated = await db.user.update({
        where: { id: userId },
        data: {
          is_pro: true,
          pro_plan: selectedPlan,
          pro_expires_at: expiresAt,
        },
        select: {
          id: true,
          is_pro: true,
          pro_plan: true,
          pro_expires_at: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Status PRO Anda telah aktif!",
        user: updated,
      });
    }

    return NextResponse.json({ error: "Aksi tidak valid" }, { status: 400 });
  } catch (error) {
    console.error("Error updating PRO status:", error);
    return NextResponse.json({ error: "Gagal memperbarui status PRO" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || "";
const MIDTRANS_IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === "true";
const MIDTRANS_BASE_URL = MIDTRANS_IS_PRODUCTION
  ? "https://app.midtrans.com/snap/v1/transactions"
  : "https://app.sandbox.midtrans.com/snap/v1/transactions";

const PRICES: Record<string, number> = {
  semester: 19000,
  lifetime: 39000,
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    if (!userId) {
      return NextResponse.json({ error: "Autentikasi diperlukan" }, { status: 401 });
    }

    if (!MIDTRANS_SERVER_KEY) {
      return NextResponse.json(
        { error: "Layanan pembayaran belum dikonfigurasi. Hubungi admin." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { plan } = body;

    if (!plan || !PRICES[plan]) {
      return NextResponse.json({ error: "Paket tidak valid" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, nama: true, email: true, nim: true, is_pro: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    if (user.is_pro) {
      return NextResponse.json({ error: "Kamu sudah berlangganan PRO" }, { status: 400 });
    }

    const orderId = `SEMESTR-${plan.toUpperCase()}-${userId.slice(-8)}-${Date.now()}`;
    const grossAmount = PRICES[plan];

    const payload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      credit_card: {
        secure: true,
      },
      item_details: [
        {
          id: `semestr-pro-${plan}`,
          price: grossAmount,
          quantity: 1,
          name: `Semestr PRO ${plan === "lifetime" ? "Selamanya (Lifetime)" : "1 Semester"}`,
          category: "SaaS Subscription",
        },
      ],
      customer_details: {
        first_name: user.nama || "Mahasiswa",
        email: user.email || "",
        phone: "",
        billing_address: {
          first_name: user.nama || "Mahasiswa",
          email: user.email || "",
          country_code: "IDN",
        },
      },
      metadata: {
        user_id: userId,
        plan: plan,
        nim: user.nim || "",
      },
    };

    const authHeader = "Basic " + Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString("base64");

    const midtransRes = await fetch(MIDTRANS_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(payload),
    });

    const midtransData = await midtransRes.json();

    if (!midtransRes.ok) {
      console.error("Midtrans error:", midtransData);
      return NextResponse.json(
        { error: "Gagal membuat sesi pembayaran. Coba lagi." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      snap_token: midtransData.token,
      order_id: orderId,
      redirect_url: midtransData.redirect_url,
    });
  } catch (error) {
    console.error("Error creating payment transaction:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

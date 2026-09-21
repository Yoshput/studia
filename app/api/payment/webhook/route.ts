import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as crypto from "crypto";

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || "";

/**
 * Midtrans Webhook — dipanggil otomatis oleh Midtrans setelah pembayaran berhasil.
 * HANYA endpoint ini yang boleh mengaktifkan status PRO.
 * Signature diverifikasi menggunakan SHA-512 agar tidak bisa dipalsukan.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type,
      metadata,
    } = body;

    // 1. Verifikasi signature Midtrans (keamanan kritis!)
    const rawSignature = `${order_id}${status_code}${gross_amount}${MIDTRANS_SERVER_KEY}`;
    const expectedSignature = crypto
      .createHash("sha512")
      .update(rawSignature)
      .digest("hex");

    if (signature_key !== expectedSignature) {
      console.error("Midtrans webhook: invalid signature!", { order_id });
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    // 2. Cek status pembayaran
    const isSuccess =
      (transaction_status === "capture" && fraud_status === "accept") ||
      transaction_status === "settlement";

    const isPending =
      transaction_status === "pending" ||
      transaction_status === "authorize";

    const isFailed =
      transaction_status === "cancel" ||
      transaction_status === "deny" ||
      transaction_status === "expire" ||
      transaction_status === "failure";

    console.log(`Midtrans webhook: ${order_id} → ${transaction_status} (${payment_type})`);

    if (isFailed) {
      // Catat di log saja, tidak perlu update DB
      console.log(`Payment failed/cancelled for order: ${order_id}`);
      return NextResponse.json({ ok: true, status: "failed_noted" });
    }

    if (isPending) {
      return NextResponse.json({ ok: true, status: "pending" });
    }

    if (isSuccess) {
      // 3. Ekstrak data dari metadata Midtrans
      const userId = metadata?.user_id;
      const plan = metadata?.plan; // "semester" atau "lifetime"

      if (!userId || !plan) {
        console.error("Midtrans webhook: missing metadata", { order_id, metadata });
        return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
      }

      const selectedPlan = plan === "lifetime" ? "PRO_LIFETIME" : "PRO_SEMESTER";
      const days = selectedPlan === "PRO_LIFETIME" ? 3650 : 180;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);

      // 4. Aktifkan PRO di database
      await db.user.update({
        where: { id: userId },
        data: {
          is_pro: true,
          pro_plan: selectedPlan,
          pro_expires_at: expiresAt,
        },
      });

      console.log(
        `✅ PRO activated: user=${userId}, plan=${selectedPlan}, order=${order_id}`
      );

      return NextResponse.json({ ok: true, status: "pro_activated" });
    }

    return NextResponse.json({ ok: true, status: "unhandled" });
  } catch (error) {
    console.error("Midtrans webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

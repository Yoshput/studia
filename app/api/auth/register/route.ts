import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  nama: z.string().min(2, "Nama lengkap minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Kata sandi minimal 8 karakter"),
  nim: z.string().optional().nullable(),
  kelas: z.string().optional().nullable(),
  prodi: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = registerSchema.parse(body);

    const existingUser = await db.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar di sistem" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(validated.password, 12);

    const newUser = await db.user.create({
      data: {
        nama: validated.nama,
        email: validated.email,
        password_hash: passwordHash,
        nim: validated.nim,
        kelas: validated.kelas,
        prodi: validated.prodi,
        is_pro: false,
        pro_plan: "free",
      },
      select: {
        id: true,
        nama: true,
        email: true,
        nim: true,
        kelas: true,
        prodi: true,
      },
    });

    // Otomatis siapkan workspace semester terisolasi untuk user baru
    const { ensureUserWorkspace } = await import("@/lib/workspace");
    await ensureUserWorkspace(newUser.id);

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Gagal mendaftarkan akun baru" },
      { status: 500 }
    );
  }
}

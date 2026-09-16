import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await db.user.findFirst({
      select: {
        id: true,
        nama: true,
        email: true,
        nim: true,
        kelas: true,
        prodi: true,
        avatar_url: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Gagal memuat profil pengguna" },
      { status: 500 }
    );
  }
}

import bcrypt from "bcryptjs";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { nama, avatar_url, nim, kelas, prodi, new_password } = body;

    const user = await db.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    let password_hash: string | undefined;
    if (new_password && typeof new_password === "string" && new_password.length >= 6) {
      password_hash = await bcrypt.hash(new_password, 10);
    }

    const updated = await db.user.update({
      where: { id: user.id },
      data: {
        ...(nama ? { nama } : {}),
        ...(avatar_url !== undefined ? { avatar_url } : {}),
        ...(nim ? { nim } : {}),
        ...(kelas ? { kelas } : {}),
        ...(prodi ? { prodi } : {}),
        ...(password_hash ? { password_hash } : {}),
      },
      select: {
        id: true,
        nama: true,
        email: true,
        nim: true,
        kelas: true,
        prodi: true,
        avatar_url: true,
      },
    });

    return NextResponse.json({ user: updated, message: "Profil berhasil diperbarui" });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui profil pengguna" },
      { status: 500 }
    );
  }
}

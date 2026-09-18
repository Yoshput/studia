import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Sesi tidak valid, silakan login terlebih dahulu", user: null },
        { status: 401 }
      );
    }

    const userId = (session.user as { id?: string })?.id;
    const userEmail = session.user.email;

    // Strictly lookup the currently logged-in user
    const user = await db.user.findFirst({
      where: {
        OR: [
          ...(userId ? [{ id: userId }] : []),
          ...(userEmail ? [{ email: userEmail }] : []),
        ],
      },
      select: {
        id: true,
        nama: true,
        email: true,
        nim: true,
        kelas: true,
        prodi: true,
        dosen_wali: true,
        avatar_url: true,
        is_pro: true,
        pro_plan: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Akun pengguna tidak ditemukan", user: null },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Gagal memuat profil pengguna" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Tidak memiliki izin untuk memperbarui profil" },
        { status: 401 }
      );
    }

    const userId = (session.user as { id?: string })?.id;
    const userEmail = session.user.email;

    const user = await db.user.findFirst({
      where: {
        OR: [
          ...(userId ? [{ id: userId }] : []),
          ...(userEmail ? [{ email: userEmail }] : []),
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Akun pengguna tidak ditemukan" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { nama, avatar_url, nim, kelas, prodi, dosen_wali, new_password } = body;

    let password_hash: string | undefined;
    if (new_password && typeof new_password === "string" && new_password.length >= 6) {
      password_hash = await bcrypt.hash(new_password, 10);
    }

    const updated = await db.user.update({
      where: { id: user.id },
      data: {
        ...(nama ? { nama: String(nama).trim() } : {}),
        ...(avatar_url !== undefined ? { avatar_url } : {}),
        ...(nim !== undefined ? { nim: nim ? String(nim).trim() : null } : {}),
        ...(kelas !== undefined ? { kelas: kelas ? String(kelas).trim() : null } : {}),
        ...(prodi !== undefined ? { prodi: prodi ? String(prodi).trim() : null } : {}),
        ...(dosen_wali !== undefined ? { dosen_wali: dosen_wali ? String(dosen_wali).trim() : null } : {}),
        ...(password_hash ? { password_hash } : {}),
      },
      select: {
        id: true,
        nama: true,
        email: true,
        nim: true,
        kelas: true,
        prodi: true,
        dosen_wali: true,
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

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureUserWorkspace } from "@/lib/workspace";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Autentikasi diperlukan" },
        { status: 401 }
      );
    }

    // Pastikan user memiliki workspace terisolasi
    let activeSemester = await db.semester.findFirst({
      where: {
        user_id: userId,
        is_active: true,
      },
      include: {
        matkul: {
          include: {
            progress: true,
            nilai: true,
            bobot_nilai: true,
            tugas: true,
          },
        },
      },
    });

    if (!activeSemester) {
      activeSemester = await ensureUserWorkspace(userId);
    }

    const allSemesters = await db.semester.findMany({
      where: {
        user_id: userId,
      },
      include: {
        khs_items: true,
        matkul: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      activeSemester,
      semesters: allSemesters,
    });
  } catch (error) {
    console.error("Error fetching semester:", error);
    return NextResponse.json(
      { error: "Gagal memuat data semester" },
      { status: 500 }
    );
  }
}

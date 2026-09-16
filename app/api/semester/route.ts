import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const activeSemester = await db.semester.findFirst({
      where: { is_active: true },
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

    const allSemesters = await db.semester.findMany({
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

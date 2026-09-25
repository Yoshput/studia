import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { searchParams } = new URL(req.url);
    const matkulId = searchParams.get("matkul_id");

    const whereClause: any = { user_id: userId };
    if (matkulId) whereClause.matkul_id = matkulId;

    const roadmaps = await prisma.studyRoadmap.findMany({
      where: whereClause,
      include: {
        matkul: {
          select: { id: true, nama: true, kode: true, warna: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const parsed = roadmaps.map((r: any) => {
      let steps = [];
      try {
        steps = JSON.parse(r.steps_json || "[]");
      } catch {}
      return {
        ...r,
        steps,
      };
    });

    return NextResponse.json({ roadmaps: parsed });
  } catch (error: any) {
    console.error("GET /api/roadmap error:", error);
    return NextResponse.json({ error: error.message || "Gagal mengambil data roadmap" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const body = await req.json();

    const { id, step_number, action_index, toggle_step } = body;
    if (!id) {
      return NextResponse.json({ error: "ID roadmap diperlukan" }, { status: 400 });
    }

    const roadmap = await prisma.studyRoadmap.findFirst({
      where: { id, user_id: userId },
    });

    if (!roadmap) {
      return NextResponse.json({ error: "Roadmap tidak ditemukan" }, { status: 404 });
    }

    let steps = [];
    try {
      steps = JSON.parse(roadmap.steps_json || "[]");
    } catch {}

    const targetStep = steps.find((s: any) => s.step_number === step_number);
    if (targetStep) {
      if (toggle_step) {
        // Toggle the entire step
        targetStep.is_completed = !targetStep.is_completed;
        if (targetStep.action_items) {
          targetStep.action_items.forEach((act: any) => {
            act.is_done = targetStep.is_completed;
          });
        }
      } else if (action_index !== undefined && targetStep.action_items?.[action_index]) {
        // Toggle specific action item
        targetStep.action_items[action_index].is_done = !targetStep.action_items[action_index].is_done;
        // If all action items done, mark step as completed
        const allDone = targetStep.action_items.every((a: any) => a.is_done);
        targetStep.is_completed = allDone;
      }
    }

    // Calculate overall progress percentage
    let totalItems = 0;
    let completedItems = 0;
    steps.forEach((s: any) => {
      if (s.action_items && s.action_items.length > 0) {
        s.action_items.forEach((a: any) => {
          totalItems++;
          if (a.is_done) completedItems++;
        });
      } else {
        totalItems++;
        if (s.is_completed) completedItems++;
      }
    });

    const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    const updated = await prisma.studyRoadmap.update({
      where: { id },
      data: {
        steps_json: JSON.stringify(steps),
        progress_percent: progressPercent,
      },
      include: {
        matkul: {
          select: { id: true, nama: true, kode: true, warna: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      roadmap: {
        ...updated,
        steps,
      },
    });
  } catch (error: any) {
    console.error("PUT /api/roadmap error:", error);
    return NextResponse.json({ error: error.message || "Gagal mengupdate progress roadmap" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID roadmap diperlukan" }, { status: 400 });
    }

    await prisma.studyRoadmap.deleteMany({
      where: { id, user_id: userId },
    });

    return NextResponse.json({ success: true, message: "Roadmap berhasil dihapus" });
  } catch (error: any) {
    console.error("DELETE /api/roadmap error:", error);
    return NextResponse.json({ error: error.message || "Gagal menghapus roadmap" }, { status: 500 });
  }
}

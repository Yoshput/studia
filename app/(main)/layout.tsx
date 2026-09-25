import React from "react";
import { Navbar } from "@/components/Navbar";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { DesktopHeader } from "@/components/DesktopHeader";
import { BottomTabBar } from "@/components/BottomTabBar";
import { MascotWidget } from "@/components/assistant/MascotWidget";
import { ReminderOverlay } from "@/components/reminders/ReminderOverlay";
import { NavigationProgress } from "@/components/ui/NavigationProgress";
import { PageTransition } from "@/components/ui/PageTransition";
import { db } from "@/lib/db";
import { getDaysRemaining } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let semesterName = "Semester 5";
  let greetingMessage = "Selamat datang kembali! Mari pantau agenda akademik hari ini.";
  let hasUrgentDeadline = false;

  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;

    const activeSem = await db.semester.findFirst({
      where: {
        is_active: true,
        ...(userId ? { user_id: userId } : {}),
      },
      include: {
        matkul: {
          include: {
            tugas: {
              where: { status: { not: "selesai" } },
            },
          },
        },
      },
    });

    if (activeSem) {
      semesterName = activeSem.nama_semester;

      const urgentTasks = activeSem.matkul
        .flatMap((m) => m.tugas)
        .filter((t) => getDaysRemaining(t.deadline).days <= 3);

      if (urgentTasks.length > 0) {
        hasUrgentDeadline = true;
        greetingMessage = `Perhatian: Ada ${urgentTasks.length} tugas mendekati batas waktu dalam 3 hari ke depan.`;
      }
    }
  } catch {
    // Database might not be migrated yet on initial load
  }

  return (
    <div className="min-h-screen bg-ios-bg text-ios-textPrimary transition-colors duration-200">
      {/* Top Navigation Visual Feedback Bar */}
      <NavigationProgress />

      {/* Desktop CMS Left Sidebar (Hidden on Mobile) */}
      <DesktopSidebar semesterName={semesterName} />

      {/* Main Content Area: Responsive Dual-Mode (Padding Left on Desktop for Sidebar) */}
      <div className="md:pl-64 lg:pl-72 flex flex-col min-h-screen transition-all duration-200">
        {/* Desktop CMS Header (Hidden on Mobile) */}
        <DesktopHeader semesterName={semesterName} />

        {/* Mobile Top Navbar (Hidden on Desktop) */}
        <Navbar semesterName={semesterName} />

        {/* Dynamic Main Canvas: 
            Mobile: max-w-[640px] centered, pb-28 for bottom bar 
            Desktop: max-w-7xl wide CMS canvas with professional spacing */}
        <main className="flex-1 w-full max-w-[640px] md:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-28 md:pb-12">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>

      {/* Aiko Mascot Live Companion Widget */}
      <MascotWidget
        greetingMessage={greetingMessage}
        hasUrgentDeadline={hasUrgentDeadline}
      />

      {/* In-App Floating Reminders for Deadlines & Classes */}
      <ReminderOverlay />

      {/* Mobile Bottom Tab Bar (Hidden on Desktop) */}
      <BottomTabBar />
    </div>
  );
}


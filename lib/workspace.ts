import { db } from "./db";

/**
 * Memastikan user memiliki minimal 1 Semester aktif yang terisolasi.
 * Jika belum ada, buatkan semester default otomatis agar dashboard tidak kosong/error.
 */
export async function ensureUserWorkspace(userId: string) {
  if (!userId) return null;

  try {
    let activeSemester = await db.semester.findFirst({
      where: {
        user_id: userId,
        is_active: true,
      },
      include: {
        matkul: {
          include: {
            tugas: true,
            nilai: true,
            bobot_nilai: true,
            progress: true,
          },
        },
        khs_items: true,
      },
    });

    if (!activeSemester) {
      // Buat semester aktif pertama untuk user ini
      activeSemester = await db.semester.create({
        data: {
          user_id: userId,
          nama_semester: "Semester 5",
          tahun_ajaran: "2026/2027 - Ganjil",
          ipk: 0.0,
          is_active: true,
        },
        include: {
          matkul: {
            include: {
              tugas: true,
              nilai: true,
              bobot_nilai: true,
              progress: true,
            },
          },
          khs_items: true,
        },
      });
    }

    return activeSemester;
  } catch (error) {
    console.error("Error in ensureUserWorkspace:", error);
    return null;
  }
}

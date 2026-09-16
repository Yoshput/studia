import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateIndo(date: Date | string): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function formatShortDateIndo(date: Date | string): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
  }).format(d);
}

export function getDaysRemaining(deadlineDate: Date | string): {
  days: number;
  label: string;
  isUrgent: boolean;
  isOverdue: boolean;
} {
  const now = new Date();
  const target = new Date(deadlineDate);

  // Strip time for clean day comparison
  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const diffDays = Math.round((targetDay - nowDay) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      days: diffDays,
      label: `Lewat ${Math.abs(diffDays)} hari`,
      isUrgent: true,
      isOverdue: true,
    };
  }
  if (diffDays === 0) {
    return { days: 0, label: "Hari ini", isUrgent: true, isOverdue: false };
  }
  if (diffDays === 1) {
    return { days: 1, label: "Besok", isUrgent: true, isOverdue: false };
  }
  if (diffDays <= 3) {
    return {
      days: diffDays,
      label: `${diffDays} hari lagi`,
      isUrgent: true,
      isOverdue: false,
    };
  }
  return {
    days: diffDays,
    label: `${diffDays} hari lagi`,
    isUrgent: false,
    isOverdue: false,
  };
}

export function getGradeLetter(score: number): { letter: string; gpa: number } {
  if (score >= 80) return { letter: "A", gpa: 4.0 };
  if (score >= 75) return { letter: "AB", gpa: 3.5 };
  if (score >= 65) return { letter: "B", gpa: 3.0 };
  if (score >= 60) return { letter: "BC", gpa: 2.5 };
  if (score >= 50) return { letter: "C", gpa: 2.0 };
  if (score >= 40) return { letter: "D", gpa: 1.0 };
  return { letter: "E", gpa: 0.0 };
}

export interface BobotItem {
  kategori: string;
  bobot_persen: number;
}

export interface NilaiItem {
  kategori: string;
  nilai: number;
}

export function calculateEstimatedGrade(
  nilaiList: NilaiItem[],
  bobotList: BobotItem[]
): {
  currentScore: number;
  totalWeightEntered: number;
  letter: string;
  gpa: number;
} {
  if (!bobotList || bobotList.length === 0) {
    return { currentScore: 0, totalWeightEntered: 0, letter: "-", gpa: 0 };
  }

  // Calculate average per category first
  const categoryScores: Record<string, { total: number; count: number }> = {};
  for (const item of nilaiList) {
    if (!categoryScores[item.kategori]) {
      categoryScores[item.kategori] = { total: 0, count: 0 };
    }
    categoryScores[item.kategori].total += item.nilai;
    categoryScores[item.kategori].count += 1;
  }

  let totalWeightedScore = 0;
  let totalWeightEntered = 0;

  for (const b of bobotList) {
    const cat = categoryScores[b.kategori];
    if (cat && cat.count > 0) {
      const avg = cat.total / cat.count;
      totalWeightedScore += avg * (b.bobot_persen / 100);
      totalWeightEntered += b.bobot_persen;
    }
  }

  // Normalize current score against entered weight
  const currentNormalized =
    totalWeightEntered > 0
      ? (totalWeightedScore / totalWeightEntered) * 100
      : 0;

  const gradeInfo = getGradeLetter(currentNormalized);

  return {
    currentScore: Math.round(currentNormalized * 10) / 10,
    totalWeightEntered: Math.round(totalWeightEntered),
    letter: totalWeightEntered > 0 ? gradeInfo.letter : "-",
    gpa: gradeInfo.gpa,
  };
}

export interface MatkulAttentionData {
  id: string;
  nama: string;
  sks: number;
  currentScore: number;
  pendingTasksCount: number;
  urgentTasksCount: number;
  progressCount: number;
}

export function calculateAttentionScore(data: MatkulAttentionData): {
  score: number;
  status: "perlu_perhatian" | "waspada" | "aman";
  reason: string;
} {
  let attentionPoints = 0;
  const reasons: string[] = [];

  // 1. Nilai rendah
  if (data.currentScore > 0 && data.currentScore < 70) {
    attentionPoints += 40;
    reasons.push(`Nilai berjalan ${data.currentScore}`);
  } else if (data.currentScore >= 70 && data.currentScore < 78) {
    attentionPoints += 15;
  }

  // 2. Tugas mendesak / tertunda
  if (data.urgentTasksCount > 0) {
    attentionPoints += data.urgentTasksCount * 25;
    reasons.push(`${data.urgentTasksCount} tugas mendekati batas waktu`);
  } else if (data.pendingTasksCount > 0) {
    attentionPoints += data.pendingTasksCount * 10;
    reasons.push(`${data.pendingTasksCount} tugas belum selesai`);
  }

  // 3. Frekuensi progress harian rendah
  if (data.progressCount === 0) {
    attentionPoints += 20;
    reasons.push("Belum ada catatan belajar");
  } else if (data.progressCount <= 2) {
    attentionPoints += 10;
  }

  let status: "perlu_perhatian" | "waspada" | "aman" = "aman";
  if (attentionPoints >= 40) {
    status = "perlu_perhatian";
  } else if (attentionPoints >= 20) {
    status = "waspada";
  }

  return {
    score: attentionPoints,
    status,
    reason: reasons.length > 0 ? reasons.join(" • ") : "Progress belajar dan tugas terkendali",
  };
}

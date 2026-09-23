"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BadgeStatus } from "@/components/ui/BadgeStatus";
import { Sheet } from "@/components/ui/Sheet";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { DeadlinePicker } from "@/components/ui/DeadlinePicker";
import { AikoDashboardWidget } from "@/components/assistant/AikoDashboardWidget";
import { ChatSheet } from "@/components/assistant/ChatSheet";
import { TaskDeadlineWidget } from "@/components/widgets/TaskDeadlineWidget";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Plus,
  BookOpen,
  Camera,
  CheckSquare,
  Sparkles,
  UserCheck,
  X,
} from "lucide-react";
import {
  formatDateIndo,
  getDaysRemaining,
  calculateEstimatedGrade,
  calculateAttentionScore,
} from "@/lib/utils";
import { Matkul, TugasDeadline } from "@/types";

const DAYS_ID = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [matkulList, setMatkulList] = useState<Matkul[]>([]);
  const [tugasList, setTugasList] = useState<TugasDeadline[]>([]);
  const [allTugasList, setAllTugasList] = useState<TugasDeadline[]>([]);
  const [semesterInfo, setSemesterInfo] = useState<{
    nama_semester: string;
    tahun_ajaran: string;
    ipk: number | null;
  } | null>(null);

  // Quick action sheets
  const [isProgressSheetOpen, setIsProgressSheetOpen] = useState(false);
  const [isTugasSheetOpen, setIsTugasSheetOpen] = useState(false);

  // Form states
  const [selectedMatkulId, setSelectedMatkulId] = useState("");
  const [materiDipelajari, setMateriDipelajari] = useState("");
  const [catatanProgress, setCatatanProgress] = useState("");
  const [pemahaman, setPemahaman] = useState(4);
  const [submittingProgress, setSubmittingProgress] = useState(false);

  const [tugasJudul, setTugasJudul] = useState("");
  const [tugasMatkulId, setTugasMatkulId] = useState("");
  const [tugasDeadline, setTugasDeadline] = useState("");
  const [tugasPrioritas, setTugasPrioritas] = useState<"rendah" | "sedang" | "tinggi">("sedang");
  const [submittingTugas, setSubmittingTugas] = useState(false);

  const [userProfile, setUserProfile] = useState<{
    nama: string;
    nim: string | null;
    kelas: string | null;
    prodi: string | null;
    avatar_url?: string | null;
  } | null>(null);

  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isFullChatOpen, setIsFullChatOpen] = useState(false);

  const todayDate = new Date();
  const todayDayName = DAYS_ID[todayDate.getDay()];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [matkulRes, semRes, tugasRes, userRes] = await Promise.all([
        fetch("/api/matkul"),
        fetch("/api/semester"),
        fetch("/api/tugas"),
        fetch("/api/user/profile"),
      ]);

      const matkulData = await matkulRes.json();
      const semData = await semRes.json();
      const tugasData = await tugasRes.json();
      const userData = await userRes.json();

      if (userData.user) setUserProfile(userData.user);
      if (matkulData.matkul) setMatkulList(matkulData.matkul);
      if (semData.activeSemester) setSemesterInfo(semData.activeSemester);
      if (tugasData.tugas) {
        setAllTugasList(tugasData.tugas);
        // Active (uncompleted) tasks
        const activeOnly = tugasData.tugas.filter((t: TugasDeadline) => t.status !== "selesai");
        setTugasList(activeOnly);
      }

      if (matkulData.matkul && matkulData.matkul.length > 0) {
        setSelectedMatkulId(matkulData.matkul[0].id);
        setTugasMatkulId(matkulData.matkul[0].id);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      localStorage.removeItem("semestr-user-avatar");
    } catch {}

    fetchData();

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("welcome") === "1") {
        setShowWelcomeModal(true);
        // Clean URL cleanly without triggering re-render
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }
  }, []);

  // Filter today's classes
  const todayClasses = matkulList.filter(
    (m) => m.hari.toLowerCase() === todayDayName.toLowerCase()
  );

  // Calculate total SKS
  const totalSks = matkulList.reduce((sum, m) => sum + m.sks, 0);

  // Urgent and upcoming deadlines (up to 4)
  const upcomingDeadlines = tugasList
    .map((t) => ({
      ...t,
      remaining: getDaysRemaining(t.deadline),
    }))
    .slice(0, 4);

  // Attention scores
  const attentionList = matkulList
    .map((m) => {
      const grade = calculateEstimatedGrade(m.nilai || [], m.bobot_nilai || []);
      const pendingCount = (m.tugas || []).filter((t) => t.status !== "selesai").length;
      const urgentCount = (m.tugas || []).filter(
        (t) => t.status !== "selesai" && getDaysRemaining(t.deadline).days <= 3
      ).length;

      const attention = calculateAttentionScore({
        id: m.id,
        nama: m.nama,
        sks: m.sks,
        currentScore: grade.currentScore,
        pendingTasksCount: pendingCount,
        urgentTasksCount: urgentCount,
        progressCount: (m.progress || []).length,
      });

      return {
        ...m,
        grade,
        attention,
      };
    })
    .filter((m) => m.attention.status !== "aman")
    .sort((a, b) => b.attention.score - a.attention.score);

  const handleSaveProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatkulId || !materiDipelajari.trim()) return;

    setSubmittingProgress(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matkul_id: selectedMatkulId,
          tanggal: new Date().toISOString(),
          materi_dipelajari: materiDipelajari,
          catatan: catatanProgress || null,
          tingkat_pemahaman: pemahaman,
        }),
      });

      if (res.ok) {
        setIsProgressSheetOpen(false);
        setMateriDipelajari("");
        setCatatanProgress("");
        fetchData();
      }
    } catch (err) {
      console.error("Save progress error:", err);
    } finally {
      setSubmittingProgress(false);
    }
  };

  const handleSaveTugas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tugasMatkulId || !tugasJudul.trim() || !tugasDeadline) return;

    setSubmittingTugas(true);
    try {
      const res = await fetch("/api/tugas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matkul_id: tugasMatkulId,
          judul: tugasJudul,
          deadline: new Date(tugasDeadline).toISOString(),
          prioritas: tugasPrioritas,
          status: "belum",
        }),
      });

      if (res.ok) {
        setIsTugasSheetOpen(false);
        setTugasJudul("");
        setTugasDeadline("");
        fetchData();
      }
    } catch (err) {
      console.error("Save tugas error:", err);
    } finally {
      setSubmittingTugas(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Interactive Welcome Modal on Successful Login */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-md bg-white dark:bg-[#1c1c1e] rounded-3xl p-6 sm:p-7 shadow-2xl border border-ios-border/80 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-ios-accent/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Close button */}
            <button
              onClick={() => setShowWelcomeModal(false)}
              className="absolute top-4 right-4 p-2 text-ios-textSecondary hover:text-ios-textPrimary rounded-full hover:bg-ios-surfaceSecondary transition-colors"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header / Avatar badge */}
            <div className="flex items-center gap-3.5 mb-5">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-ios-accent to-blue-500 p-0.5 shadow-md flex items-center justify-center">
                  <div className="w-full h-full bg-white dark:bg-ios-card rounded-[14px] flex items-center justify-center overflow-hidden">
                    {userProfile?.avatar_url ? (
                      <img
                        src={userProfile.avatar_url}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-bold text-ios-accent">
                        {userProfile?.nama?.charAt(0) || "M"}
                      </span>
                    )}
                  </div>
                </div>
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-[#1c1c1e] flex items-center justify-center shadow-sm">
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </span>
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Autentikasi Berhasil</span>
                </div>
                <h3 className="text-[19px] font-bold text-ios-textPrimary leading-snug">
                  Selamat Datang, {userProfile?.nama?.split(" ")[0] || "Mahasiswa"}! 👋
                </h3>
              </div>
            </div>

            {/* Brief body */}
            <p className="text-[13px] text-ios-textSecondary leading-relaxed mb-5">
              Sesi akademik Anda aktif. Agenda kuliah dan pantauan tugas untuk semester ini telah disinkronkan:
            </p>

            {/* Snapshot Cards */}
            <div className="grid grid-cols-2 gap-2.5 mb-6">
              <div className="p-3 bg-ios-surfaceSecondary/70 rounded-2xl border border-ios-border/60 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-ios-textSecondary text-[11.5px] font-medium mb-1">
                  <Calendar className="w-3.5 h-3.5 text-ios-accent" />
                  <span>Kuliah Hari Ini</span>
                </div>
                <div className="text-base font-bold text-ios-textPrimary">
                  {todayClasses.length > 0 ? `${todayClasses.length} Kelas` : "Tidak ada kuliah"}
                </div>
                <div className="text-[11px] text-ios-textSecondary mt-0.5">
                  {todayDayName}
                </div>
              </div>

              <div className="p-3 bg-ios-surfaceSecondary/70 rounded-2xl border border-ios-border/60 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-ios-textSecondary text-[11.5px] font-medium mb-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Tugas Berjalan</span>
                </div>
                <div className="text-base font-bold text-ios-textPrimary">
                  {tugasList.length} Tugas Aktif
                </div>
                <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                  {upcomingDeadlines.length > 0 ? "Perlu ditinjau" : "Semua beres"}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <Link href="/absen" className="w-full sm:w-1/2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-center gap-1.5 py-2.5 text-[13px] rounded-xl"
                  onClick={() => setShowWelcomeModal(false)}
                >
                  <Camera className="w-3.5 h-3.5" />
                  Presensi Hari Ini
                </Button>
              </Link>
              <Button
                variant="primary"
                size="sm"
                className="w-full sm:w-1/2 justify-center gap-1.5 py-2.5 text-[13px] rounded-xl shadow-md"
                onClick={() => setShowWelcomeModal(false)}
              >
                <span>Mulai Hari Ini</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Greeting Header */}
      <div className="pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {userProfile?.nim && (
              <p className="text-[12px] font-mono font-semibold text-ios-accent">
                NIM: {userProfile.nim} {userProfile.kelas ? `• ${userProfile.kelas}` : ""}
              </p>
            )}
            <h1 className="text-[26px] sm:text-[30px] font-bold text-ios-textPrimary tracking-tight mt-0.5">
              Halo, {userProfile?.nama || "Mahasiswa"}!
            </h1>
            <p className="text-[13px] text-ios-textSecondary">
              {formatDateIndo(todayDate)} • {userProfile?.prodi || "Akun Mahasiswa Semestr"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsProgressSheetOpen(true)}
              className="hidden sm:flex gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Input Progress</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsTugasSheetOpen(true)}
              className="hidden sm:flex gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Catat Tugas</span>
            </Button>

            <Link href="/absen">
              <Button variant="primary" size="sm" className="gap-1.5 shadow-sm">
                <Camera className="w-3.5 h-3.5" />
                <span>Scan Presensi</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row: 4 Columns on Desktop CMS, 2 Columns on Mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 bg-ios-surface border border-ios-border hover:shadow-iosHover transition-shadow">
          <p className="text-[11.5px] font-semibold text-ios-textSecondary uppercase tracking-wider">
            IPK Kumulatif Resmi
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[32px] sm:text-[36px] font-black text-ios-textPrimary leading-none">
              {semesterInfo?.ipk !== null && semesterInfo?.ipk !== undefined && semesterInfo.ipk > 0
                ? semesterInfo.ipk.toFixed(2)
                : totalSks > 0
                ? "0.00"
                : "-"}
            </span>
            <span className="text-[11.5px] font-bold text-ios-success">
              {semesterInfo?.ipk && semesterInfo.ipk >= 3.5
                ? "Sangat Memuaskan"
                : semesterInfo?.ipk && semesterInfo.ipk >= 3.0
                ? "Memuaskan"
                : totalSks > 0
                ? "Semester Berjalan"
                : "Akun Baru"}
            </span>
          </div>
          <p className="text-[11px] text-ios-textSecondary mt-2">
            {totalSks > 0 ? `${totalSks} SKS Terdaftar` : "Mulai susun mata kuliah kamu"}
          </p>
        </Card>

        <Card className="p-4 bg-ios-surface border border-ios-border hover:shadow-iosHover transition-shadow">
          <p className="text-[11.5px] font-semibold text-ios-textSecondary uppercase tracking-wider">
            Beban {semesterInfo?.nama_semester || "Semester Aktif"}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[32px] sm:text-[36px] font-black text-ios-textPrimary leading-none">
              {totalSks}
            </span>
            <span className="text-[13px] font-semibold text-ios-textSecondary">
              SKS
            </span>
          </div>
          <p className="text-[11px] text-ios-textSecondary mt-2">
            {matkulList.length} Mata Kuliah Aktif
          </p>
        </Card>

        <Card className="p-4 bg-ios-surface border border-ios-border hover:shadow-iosHover transition-shadow">
          <p className="text-[11.5px] font-semibold text-ios-textSecondary uppercase tracking-wider">
            Kuliah Hari Ini
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[32px] sm:text-[36px] font-black text-ios-textPrimary leading-none">
              {todayClasses.length}
            </span>
            <span className="text-[12.5px] font-semibold text-ios-textSecondary">
              Kelas ({todayDayName})
            </span>
          </div>
          <p className="text-[11px] text-ios-textSecondary mt-2">
            {todayClasses.length > 0 ? "Shift perkuliahan terjadwal" : "Tidak ada perkuliahan hari ini"}
          </p>
        </Card>

        <Card className="p-4 bg-ios-surface border border-ios-border hover:shadow-iosHover transition-shadow">
          <p className="text-[11.5px] font-semibold text-ios-textSecondary uppercase tracking-wider">
            Tugas Aktif
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[32px] sm:text-[36px] font-black text-ios-textPrimary leading-none">
              {tugasList.length}
            </span>
            <span className="text-[12px] font-bold text-ios-warning">
              Tugas Berjalan
            </span>
          </div>
          <p className="text-[11px] text-ios-textSecondary mt-2">
            Keamanan Siber &amp; Kali Linux
          </p>
        </Card>
      </div>

      {/* Dual-Mode Responsive Split Canvas (12 Columns on Desktop CMS, 1 Column on Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Main Section (8 Columns on Desktop) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Aiko AI Interactive Companion Widget */}
          <AikoDashboardWidget
            studentName={userProfile?.nama || "Mahasiswa"}
            onOpenFullChat={() => setIsFullChatOpen(true)}
          />

          {/* Presensi Biometrik Banner Card */}
          <Card className="p-4 sm:p-5 bg-gradient-to-r from-ios-surfaceSecondary/90 via-ios-surfaceSecondary/50 to-ios-surface border border-ios-accent/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-ios-accent/15 text-ios-accent flex items-center justify-center flex-shrink-0 shadow-sm">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-ios-textPrimary">
                  Presensi Kehadiran Biometrik Wajah
                </h3>
                <p className="text-[12.5px] text-ios-textSecondary leading-snug">
                  Pindai kondisi wajah dan pakaian berkerah rapi dengan kamera normal (non-mirror).
                </p>
              </div>
            </div>

            <Link href="/absen">
              <Button variant="secondary" size="sm" className="gap-1.5 flex-shrink-0 font-semibold shadow-sm">
                <span>Buka Scanner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </Card>

          {/* Today's Classes Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-bold text-ios-textPrimary tracking-tight flex items-center gap-2">
                <Calendar className="w-4 h-4 text-ios-accent" />
                <span>Jadwal Kuliah Hari Ini ({todayDayName})</span>
              </h2>
              <Link
                href="/jadwal"
                className="text-[12.5px] font-semibold text-ios-accent hover:underline flex items-center gap-1"
              >
                <span>Lihat 8 Matkul</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {todayClasses.length === 0 ? (
              <Card className="p-6 text-center bg-ios-surface border border-ios-border">
                <p className="text-[14px] text-ios-textPrimary font-semibold">
                  Tidak ada perkuliahan terjadwal untuk hari ini ({todayDayName})
                </p>
                <p className="text-[12px] text-ios-textSecondary mt-1">
                  Waktu yang tepat untuk fokus mengerjakan {tugasList.length} tugas aktif atau praktikum mandiri.
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {todayClasses.map((item) => (
                  <Card
                    key={item.id}
                    className="p-4 sm:p-5 border-l-4 hover:shadow-iosHover transition-all"
                    style={{ borderLeftColor: item.warna || "#007AFF" }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-mono font-semibold text-ios-textSecondary">
                            {item.kode || "MATKUL"}
                          </span>
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-ios-surfaceSecondary border border-ios-border text-ios-textSecondary">
                            {item.sks} SKS
                          </span>
                        </div>
                        <h3 className="text-[17px] font-bold text-ios-textPrimary mt-1">
                          {item.nama}
                        </h3>
                        <p className="text-[13px] text-ios-textSecondary mt-0.5">
                          {item.dosen}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3.5 pt-3 border-t border-ios-border flex items-center justify-between text-[13px]">
                      <span className="flex items-center gap-1.5 font-semibold text-ios-textPrimary">
                        <Clock className="w-4 h-4 text-ios-accent" />
                        {item.jam_mulai} – {item.jam_selesai} WIB
                      </span>
                      <span className="flex items-center gap-1.5 text-ios-textSecondary font-medium">
                        <MapPin className="w-4 h-4 text-ios-danger" />
                        {item.ruang}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Quick Action Buttons (visible on small screens) */}
          <div className="sm:hidden pt-2 flex gap-2.5">
            <Button
              variant="secondary"
              className="flex-1 gap-1.5"
              onClick={() => setIsProgressSheetOpen(true)}
            >
              <BookOpen className="w-4 h-4" />
              <span>Isi Progress</span>
            </Button>
            <Button
              variant="secondary"
              className="flex-1 gap-1.5"
              onClick={() => setIsTugasSheetOpen(true)}
            >
              <Plus className="w-4 h-4" />
              <span>Catat Tugas</span>
            </Button>
          </div>
        </div>

        {/* Right / Sidebar Section (4 Columns on Desktop CMS) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          {/* Scrollable Task & Deadline Widget */}
          <TaskDeadlineWidget
            tasks={allTugasList}
            onTaskUpdated={fetchData}
          />

          {/* Attention Required Card (if any) */}
          {attentionList.length > 0 && (
            <Card className="p-4 border-ios-warning/40 bg-ios-surfaceSecondary/40">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-full bg-ios-warning/15 text-ios-warning mt-0.5">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-ios-textPrimary">
                    Fokus Perhatian Akademik
                  </h3>
                  <p className="text-[12px] text-ios-textSecondary mt-0.5">
                    Berdasarkan pantauan deadline dan evaluasi nilai:
                  </p>
                  <div className="mt-2 space-y-1.5">
                    {attentionList.slice(0, 2).map((m) => (
                      <div
                        key={m.id}
                        className="p-2.5 rounded-lg bg-ios-surface border border-ios-border text-[12px] flex items-center justify-between"
                      >
                        <span className="font-semibold text-ios-textPrimary">
                          {m.nama}
                        </span>
                        <span className="text-[11px] text-ios-textSecondary">
                          {m.attention.reason}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Institutional Note & System Health */}
          <Card className="p-4 bg-gradient-to-br from-ios-surface to-ios-surfaceSecondary/50 border border-ios-border">
            <div className="flex items-center gap-2 text-[12px] font-bold text-ios-textPrimary">
              <Sparkles className="w-4 h-4 text-ios-accent" />
              <span>Sistem Akademik Terverifikasi</span>
            </div>
            <p className="text-[12px] text-ios-textSecondary mt-1 leading-relaxed">
              Jadwal shift kuliah, IPK kumulatif resmi, dan tugas terindeks otomatis ke database. Mode Live Voice 3D didukung oleh Google Gemini 2.5 Flash.
            </p>
          </Card>
        </div>
      </div>

      {/* Sheet Input Progress Harian */}
      <Sheet
        isOpen={isProgressSheetOpen}
        onClose={() => setIsProgressSheetOpen(false)}
        title="Catat Progress Belajar"
        description="Dokumentasikan materi perkuliahan atau riset mandiri hari ini."
      >
        <form onSubmit={handleSaveProgress} className="space-y-4">
          <Select
            label="Mata Kuliah"
            value={selectedMatkulId}
            onChange={(e) => setSelectedMatkulId(e.target.value)}
            required
          >
            {matkulList.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nama} ({m.kode || `${m.sks} SKS`})
              </option>
            ))}
          </Select>

          <Input
            label="Materi yang Dipelajari"
            placeholder="Contoh: Analisis Vulnerability Nmap atau Cluster Kubernetes"
            value={materiDipelajari}
            onChange={(e) => setMateriDipelajari(e.target.value)}
            required
          />

          <Textarea
            label="Catatan / Ringkasan Pemahaman"
            placeholder="Tuliskan poin teknis atau catatan yang perlu diingat..."
            value={catatanProgress}
            onChange={(e) => setCatatanProgress(e.target.value)}
            rows={3}
          />

          <div>
            <label className="block text-[13px] font-medium text-ios-textSecondary mb-2">
              Tingkat Pemahaman: {pemahaman} / 5
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setPemahaman(lvl)}
                  className={`flex-1 py-2 rounded-btn font-semibold text-[14px] border transition-all ${
                    pemahaman === lvl
                      ? "bg-ios-accent text-white border-ios-accent shadow-sm"
                      : "bg-ios-surfaceSecondary text-ios-textSecondary border-ios-border hover:bg-ios-surface"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={submittingProgress}
            >
              Simpan Progress Harian
            </Button>
          </div>
        </form>
      </Sheet>

      {/* Sheet Tambah Tugas */}
      <Sheet
        isOpen={isTugasSheetOpen}
        onClose={() => setIsTugasSheetOpen(false)}
        title="Tambah Tugas Baru"
        description="Catat tugas beserta batas waktu pengumpulan."
      >
        <form onSubmit={handleSaveTugas} className="space-y-4">
          <Select
            label="Mata Kuliah Terkait"
            value={tugasMatkulId}
            onChange={(e) => setTugasMatkulId(e.target.value)}
            required
          >
            {matkulList.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nama}
              </option>
            ))}
          </Select>

          <Input
            label="Judul Tugas"
            placeholder="Contoh: Laporan Praktikum Modul 2 Docker"
            value={tugasJudul}
            onChange={(e) => setTugasJudul(e.target.value)}
            required
          />

          <DeadlinePicker
            label="Batas Waktu (Deadline)"
            value={tugasDeadline}
            onChange={setTugasDeadline}
            required
          />

          <div>
            <label className="block text-[13px] font-medium text-ios-textSecondary mb-2">
              Prioritas Tugas
            </label>
            <div className="flex gap-2">
              {(["rendah", "sedang", "tinggi"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setTugasPrioritas(p)}
                  className={`flex-1 py-2 rounded-btn font-semibold text-[13px] capitalize border transition-all ${
                    tugasPrioritas === p
                      ? "bg-ios-accent text-white border-ios-accent shadow-sm"
                      : "bg-ios-surfaceSecondary text-ios-textSecondary border-ios-border hover:bg-ios-surface"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={submittingTugas}
            >
              Simpan Tugas
            </Button>
          </div>
        </form>
      </Sheet>

      {/* Full Aiko 3D Chat Sheet */}
      <ChatSheet
        isOpen={isFullChatOpen}
        onClose={() => setIsFullChatOpen(false)}
      />
    </div>
  );
}

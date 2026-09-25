"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { Input, Select } from "@/components/ui/Input";
import { BadgeStatus } from "@/components/ui/BadgeStatus";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import {
  GraduationCap,
  Plus,
  Trash2,
  SlidersHorizontal,
  BarChart2,
  TrendingUp,
  FileText,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Download,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from "recharts";
import { formatShortDateIndo, calculateEstimatedGrade, getGradeLetter } from "@/lib/utils";
import { Matkul, Nilai } from "@/types";
import { GpaOptimizerModal } from "@/components/pro/GpaOptimizerModal";
import { exportKhsToCsv } from "@/lib/export";
import { fetchWithCache, invalidateClientCache } from "@/lib/client-cache";

const KATEGORI_OPTIONS = ["Quiz", "Tugas", "UTS", "UAS", "Project", "Tubes"] as const;

interface KhsItem {
  id: string;
  kode_matkul: string;
  nama_matkul: string;
  sks: number;
  nilai_huruf: string;
  nilai_indeks: number;
}

interface SemesterData {
  id: string;
  nama_semester: string;
  tahun_ajaran: string;
  ipk: number | null;
  is_active: boolean;
  khs_items?: KhsItem[];
}

export default function NilaiPage() {
  const [tabView, setTabView] = useState<"aktif" | "khs" | "tren">("aktif");
  const [matkulList, setMatkulList] = useState<Matkul[]>([]);
  const [semestersList, setSemestersList] = useState<SemesterData[]>([]);
  const [selectedMatkulId, setSelectedMatkulId] = useState<string>("");
  const [selectedKhsSemester, setSelectedKhsSemester] = useState<string>("Semester 1");
  const [loading, setLoading] = useState(true);

  // Sheet states
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isBobotSheetOpen, setIsBobotSheetOpen] = useState(false);
  const [isGpaModalOpen, setIsGpaModalOpen] = useState(false);

  // Form add nilai
  const [kategori, setKategori] = useState<string>("Quiz");
  const [namaItem, setNamaItem] = useState("");
  const [nilaiAngka, setNilaiAngka] = useState<number | "">(85);
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputMode, setInputMode] = useState<"standard" | "lms">("standard");
  const [lmsScore, setLmsScore] = useState<number | "">(8);
  const [lmsMaxScore, setLmsMaxScore] = useState<number | "">(10);

  // Bobot editing state
  const [editBobotList, setEditBobotList] = useState<{ kategori: string; bobot_persen: number }[]>([]);
  const [bobotError, setBobotError] = useState("");
  const [isSubmittingBobot, setIsSubmittingBobot] = useState(false);

  const [userProfile, setUserProfile] = useState<{ prodi?: string | null; nama?: string | null; nim?: string | null } | null>(null);

  const fetchData = async () => {
    try {
      const [mData, sData, uData] = await Promise.all([
        fetchWithCache("/api/matkul"),
        fetchWithCache("/api/semester"),
        fetchWithCache("/api/user/profile"),
      ]);

      if (uData?.user) {
        setUserProfile(uData.user);
      }

      if (mData?.matkul) {
        setMatkulList(mData.matkul);
        if (mData.matkul.length > 0 && !selectedMatkulId) {
          setSelectedMatkulId(mData.matkul[0].id);
        }
      }

      if (sData?.semesters) {
        setSemestersList(sData.semesters);
      }
    } catch (err) {
      console.error("Failed to load grades:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const currentMatkul = matkulList.find((m) => m.id === selectedMatkulId) || matkulList[0];

  const estimated = currentMatkul
    ? calculateEstimatedGrade(currentMatkul.nilai || [], currentMatkul.bobot_nilai || [])
    : { currentScore: 0, totalWeightEntered: 0, letter: "-", gpa: 0 };

  // Current semester course comparison chart data
  const comparisonChartData = matkulList.map((m) => {
    const est = calculateEstimatedGrade(m.nilai || [], m.bobot_nilai || []);
    return {
      name: m.nama.length > 10 ? `${m.nama.slice(0, 8)}...` : m.nama,
      fullName: m.nama,
      nilai: est.currentScore,
      warna: m.warna || "#007AFF",
    };
  });

  // GPA Trend Chart Data across semesters — dynamically from user's semester list
  const gpaTrendData = useMemo(() => {
    if (!semestersList || semestersList.length === 0) return [];
    return semestersList.map((sem, idx) => ({
      name: `Sem ${idx + 1}`,
      ips: typeof sem.ipk === "number" ? sem.ipk : 0,
      label: `${sem.nama_semester} — ${sem.tahun_ajaran} (IPS: ${typeof sem.ipk === "number" ? sem.ipk.toFixed(2) : "-"})`,
    }));
  }, [semestersList]);

  const handleOpenAdd = () => {
    setKategori("Quiz");
    setNamaItem("");
    setNilaiAngka(85);
    setTanggal(new Date().toISOString().slice(0, 10));
    setIsAddSheetOpen(true);
  };

  const handleOpenBobot = () => {
    if (!currentMatkul) return;
    const initialBobot =
      currentMatkul.bobot_nilai && currentMatkul.bobot_nilai.length > 0
        ? currentMatkul.bobot_nilai.map((b) => ({
            kategori: b.kategori,
            bobot_persen: b.bobot_persen,
          }))
        : [
            { kategori: "Quiz", bobot_persen: 15 },
            { kategori: "Tugas", bobot_persen: 20 },
            { kategori: "UTS", bobot_persen: 25 },
            { kategori: "UAS", bobot_persen: 25 },
            { kategori: "Tubes", bobot_persen: 15 },
          ];
    setEditBobotList(initialBobot);
    setBobotError("");
    setIsBobotSheetOpen(true);
  };

  const handleSaveNilai = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalNilai =
      inputMode === "lms"
        ? lmsScore !== "" && Number(lmsMaxScore) > 0
          ? Math.min(100, Math.round(((Number(lmsScore) / Number(lmsMaxScore)) * 100) * 10) / 10)
          : 0
        : Number(nilaiAngka);

    if (!selectedMatkulId || !namaItem.trim()) return;
    if (inputMode === "standard" && nilaiAngka === "") return;
    if (inputMode === "lms" && (lmsScore === "" || Number(lmsMaxScore) <= 0)) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/nilai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matkul_id: selectedMatkulId,
          kategori,
          nama_item: namaItem,
          nilai: finalNilai,
          tanggal: new Date(tanggal).toISOString(),
        }),
      });

      if (res.ok) {
        setIsAddSheetOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveBobot = async (e: React.FormEvent) => {
    e.preventDefault();
    const sum = editBobotList.reduce((acc, b) => acc + Number(b.bobot_persen), 0);
    if (Math.abs(sum - 100) > 0.01) {
      setBobotError(`Total bobot harus berjumlah 100% (saat ini ${sum}%)`);
      return;
    }

    setIsSubmittingBobot(true);
    try {
      const res = await fetch("/api/nilai/bobot", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matkul_id: selectedMatkulId,
          bobot: editBobotList,
        }),
      });

      if (res.ok) {
        setIsBobotSheetOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        setBobotError(err.error || "Gagal menyimpan bobot");
      }
    } catch {
      setBobotError("Terjadi kendala server saat menyimpan bobot");
    } finally {
      setIsSubmittingBobot(false);
    }
  };

  const handleDeleteNilai = async (id: string, namaNilai: string) => {
    if (!confirm(`Hapus nilai "${namaNilai}"?`)) return;

    try {
      const res = await fetch(`/api/nilai?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const currentKhsSemester = semestersList.find(
    (s) => s.nama_semester === selectedKhsSemester
  ) || semestersList[0];

  return (
    <div className="space-y-4 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-ios-textPrimary tracking-tight">
            Transkrip &amp; Nilai
          </h1>
          <p className="text-[13px] text-ios-textSecondary">
            IPK Kumulatif: <strong className="text-ios-accent">{semestersList.length > 0 ? (semestersList[semestersList.length - 1]?.ipk ?? 0).toFixed(2) : "-"}</strong> (KHS Resmi)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsGpaModalOpen(true)}
            className="gap-1.5 border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>Simulator Cum Laude</span>
          </Button>

          {tabView === "aktif" && (
            <Button variant="primary" size="sm" onClick={handleOpenAdd} className="gap-1.5">
              <Plus className="w-4 h-4" />
              <span>Input Nilai</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main View Switcher */}
      <SegmentedControl
        name="nilai-main-tabs"
        options={[
          { value: "aktif", label: "Semester Berjalan", icon: <GraduationCap className="w-3.5 h-3.5" /> },
          { value: "khs", label: "KHS Resmi Tel-U", icon: <FileText className="w-3.5 h-3.5" /> },
          { value: "tren", label: "Tren IPK", icon: <TrendingUp className="w-3.5 h-3.5" /> },
        ]}
        value={tabView}
        onChange={(v) => setTabView(v as "aktif" | "khs" | "tren")}
      />

      {/* VIEW 1: ACTIVE SEMESTER */}
      {tabView === "aktif" && (
        <div className="space-y-4">
          {/* Overview Bar Chart */}
          <Card className="p-4">
            <h2 className="text-[15px] font-bold text-ios-textPrimary flex items-center gap-1.5 mb-3">
              <BarChart2 className="w-4 h-4 text-ios-accent" />
              <span>Nilai Berjalan Semester 5 (2026/2027 Ganjil)</span>
            </h2>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonChartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "var(--text-secondary)" }}
                    axisLine={{ stroke: "var(--border)" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: "var(--text-secondary)" }}
                    axisLine={{ stroke: "var(--border)" }}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-ios-surface border border-ios-border rounded-lg p-2 shadow-md text-[12px]">
                            <p className="font-semibold text-ios-textPrimary">{d.fullName}</p>
                            <p className="text-ios-accent mt-0.5">
                              Skor Berjalan: {d.nilai > 0 ? d.nilai : "Belum diinput"}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="nilai" radius={[6, 6, 0, 0]}>
                    {comparisonChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.warna} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Matkul Selector */}
          <div>
            <label className="block text-[13px] font-medium text-ios-textSecondary mb-2">
              Pilih Mata Kuliah untuk Detail Asesmen &amp; Bobot
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {matkulList.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMatkulId(m.id)}
                  className={`px-3 py-1.5 rounded-full text-[13px] font-semibold flex-shrink-0 transition-all border ${
                    selectedMatkulId === m.id
                      ? "bg-ios-accent text-white border-ios-accent shadow-sm"
                      : "bg-ios-surfaceSecondary text-ios-textSecondary border-ios-border hover:bg-ios-surface"
                  }`}
                >
                  {m.nama}
                </button>
              ))}
            </div>
          </div>

          {currentMatkul && (
            <div className="space-y-3">
              {/* Estimated Grade Summary Card */}
              <Card className="p-4 border-l-4" style={{ borderLeftColor: currentMatkul.warna || "#007AFF" }}>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-mono font-semibold text-ios-textSecondary">
                      {currentMatkul.kode || "MATKUL"} • {currentMatkul.sks} SKS
                    </span>
                    <h3 className="text-[18px] font-bold text-ios-textPrimary mt-0.5">
                      {currentMatkul.nama}
                    </h3>
                    <p className="text-[13px] text-ios-textSecondary">
                      Dosen: {currentMatkul.dosen}
                    </p>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleOpenBobot}
                    className="gap-1.5"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Atur Bobot</span>
                  </Button>
                </div>

                <div className="mt-4 pt-3 border-t border-ios-border grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-ios-surfaceSecondary">
                    <span className="text-[11px] text-ios-textSecondary block">
                      Nilai Berjalan
                    </span>
                    <span className="text-[22px] font-bold text-ios-textPrimary leading-tight">
                      {estimated.currentScore > 0 ? estimated.currentScore : "-"}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-ios-surfaceSecondary">
                    <span className="text-[11px] text-ios-textSecondary block">
                      Estimasi Huruf
                    </span>
                    <span className="text-[22px] font-bold text-ios-accent leading-tight">
                      {estimated.letter}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-ios-surfaceSecondary">
                    <span className="text-[11px] text-ios-textSecondary block">
                      Bobot Masuk
                    </span>
                    <span className="text-[22px] font-bold text-ios-textPrimary leading-tight">
                      {estimated.totalWeightEntered}%
                    </span>
                  </div>
                </div>
              </Card>

              {/* Component assessment list */}
              <div className="space-y-2 pt-1">
                <h4 className="text-[14px] font-bold text-ios-textPrimary">
                  Komponen Penilaian Terdaftar ({currentMatkul.nilai?.length || 0})
                </h4>

                {(!currentMatkul.nilai || currentMatkul.nilai.length === 0) ? (
                  <Card className="p-6 text-center">
                    <p className="text-[14px] text-ios-textPrimary font-semibold">
                      Belum ada nilai yang diinput untuk mata kuliah ini
                    </p>
                    <p className="text-[12px] text-ios-textSecondary mt-0.5">
                      Gunakan tombol "Input Nilai" untuk mencatat hasil Quiz atau Tugas.
                    </p>
                  </Card>
                ) : (
                  currentMatkul.nilai.map((n) => (
                    <Card key={n.id} className="p-3.5 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <BadgeStatus size="sm" variant="aman">
                            {n.kategori}
                          </BadgeStatus>
                          <span className="text-[11px] text-ios-textSecondary">
                            {formatShortDateIndo(n.tanggal)}
                          </span>
                        </div>
                        <h5 className="text-[14px] font-semibold text-ios-textPrimary mt-0.5 truncate">
                          {n.nama_item}
                        </h5>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[20px] font-black text-ios-textPrimary">
                          {n.nilai}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteNilai(n.id, n.nama_item)}
                          className="p-1.5 rounded-md text-ios-textSecondary hover:text-ios-danger transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: HISTORICAL KHS TELKOM UNIVERSITY */}
      {tabView === "khs" && (
        <div className="space-y-4">
          {/* Semester Selector */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {semestersList
              .filter((s) => s.khs_items && s.khs_items.length > 0)
              .map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedKhsSemester(s.nama_semester)}
                  className={`px-3.5 py-1.5 rounded-full text-[13px] font-bold flex-shrink-0 transition-all border ${
                    selectedKhsSemester === s.nama_semester
                      ? "bg-ios-accent text-white border-ios-accent shadow-sm"
                      : "bg-ios-surfaceSecondary text-ios-textSecondary border-ios-border hover:bg-ios-surface"
                  }`}
                >
                  {s.nama_semester} ({s.ipk ? `IPS ${s.ipk.toFixed(2)}` : ""})
                </button>
              ))}
          </div>

          {currentKhsSemester && (
            <Card className="p-4 space-y-3">
              <div className="flex items-start justify-between border-b border-ios-border pb-3">
                <div>
                  <h3 className="text-[17px] font-bold text-ios-textPrimary">
                    {currentKhsSemester.nama_semester} — {currentKhsSemester.tahun_ajaran}
                  </h3>
                  <p className="text-[12px] text-ios-textSecondary font-mono">
                    {userProfile?.prodi || "Kartu Hasil Studi Resmi"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      exportKhsToCsv(
                        currentKhsSemester.nama_semester,
                        currentKhsSemester.khs_items || [],
                        { nama: userProfile?.nama || "Mahasiswa Telkom", nim: userProfile?.nim || "" }
                      );
                    }}
                    className="gap-1.5 text-[12px] font-semibold"
                  >
                    <Download className="w-3.5 h-3.5 text-ios-accent" />
                    <span>Export KHS (CSV)</span>
                  </Button>
                  <div className="text-right pl-2 border-l border-ios-border">
                    <span className="text-[10px] uppercase font-bold text-ios-textSecondary block">
                      Indeks Semester (IPS)
                    </span>
                    <span className="text-[24px] font-black text-ios-accent">
                      {currentKhsSemester.ipk?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Table of courses in this semester */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-ios-border text-ios-textSecondary font-semibold text-[11px] uppercase tracking-wider">
                      <th className="py-2">Kode</th>
                      <th className="py-2">Mata Kuliah</th>
                      <th className="py-2 text-center">SKS</th>
                      <th className="py-2 text-center">Nilai</th>
                      <th className="py-2 text-right">Indeks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ios-border/60">
                    {(currentKhsSemester.khs_items || []).map((item) => (
                      <tr key={item.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="py-2.5 font-mono text-[11px] font-semibold text-ios-textSecondary">
                          {item.kode_matkul}
                        </td>
                        <td className="py-2.5 font-medium text-ios-textPrimary">
                          {item.nama_matkul}
                        </td>
                        <td className="py-2.5 text-center font-semibold text-ios-textSecondary">
                          {item.sks}
                        </td>
                        <td className="py-2.5 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded font-bold text-[12px] ${
                              item.nilai_huruf === "A"
                                ? "bg-[#34C759]/15 text-[#34C759]"
                                : item.nilai_huruf === "AB"
                                ? "bg-[#007AFF]/15 text-[#007AFF]"
                                : "bg-[#FF9500]/15 text-[#FF9500]"
                            }`}
                          >
                            {item.nilai_huruf}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-mono font-bold text-ios-textPrimary">
                          {item.nilai_indeks.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* VIEW 3: GPA PROGRESSION TREND */}
      {tabView === "tren" && (
        <div className="space-y-4">
          <Card className="p-4">
            <h2 className="text-[15px] font-bold text-ios-textPrimary mb-1 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-ios-success" />
              <span>Grafik Pertumbuhan IPS per Semester</span>
            </h2>
            <p className="text-[12px] text-ios-textSecondary mb-4">
              Data diambil dari catatan KHS tiap semester yang sudah kamu isi.
            </p>

            {gpaTrendData.length === 0 || gpaTrendData.every(d => d.ips === 0) ? (
              <div className="h-56 w-full flex flex-col items-center justify-center text-center gap-3 text-ios-textSecondary">
                <TrendingUp className="w-10 h-10 opacity-25" />
                <div>
                  <p className="text-[14px] font-semibold text-ios-textPrimary">Belum Ada Data Semester</p>
                  <p className="text-[12px] mt-0.5">Isi IPK di tiap semester kamu agar grafik ini terisi.</p>
                </div>
              </div>
            ) : (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={gpaTrendData} margin={{ top: 15, right: 15, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
                      axisLine={{ stroke: "var(--border)" }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={["auto", 4.0]}
                      tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
                      axisLine={{ stroke: "var(--border)" }}
                      tickLine={false}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="bg-ios-surface border border-ios-border rounded-lg p-2.5 shadow-md text-[12px]">
                              <p className="font-bold text-ios-textPrimary">{d.label}</p>
                              <p className="text-ios-success font-black text-[14px] mt-0.5">
                                IP: {d.ips.toFixed(2)}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="ips"
                      stroke="#34C759"
                      strokeWidth={3}
                      dot={{ fill: "#34C759", r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Sheet Input Nilai */}
      <Sheet
        isOpen={isAddSheetOpen}
        onClose={() => setIsAddSheetOpen(false)}
        title="Input Komponen Nilai"
        description="Catat hasil evaluasi mata kuliah semester aktif."
      >
        <form onSubmit={handleSaveNilai} className="space-y-3.5">
          <Select
            label="Mata Kuliah"
            value={selectedMatkulId}
            onChange={(e) => setSelectedMatkulId(e.target.value)}
            required
          >
            {matkulList.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nama}
              </option>
            ))}
          </Select>

          <Select
            label="Kategori Nilai"
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            required
          >
            {KATEGORI_OPTIONS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </Select>

          <Input
            label="Nama Asesmen / Item"
            placeholder="Contoh: Quiz 2 — Asymmetric Key & RSA"
            value={namaItem}
            onChange={(e) => setNamaItem(e.target.value)}
            required
          />

          {/* Format Selector */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] font-semibold text-ios-textSecondary uppercase tracking-wider">
              Format Penilaian
            </label>
            <SegmentedControl
              options={[
                { value: "standard", label: "Skala 100 (Standar)" },
                { value: "lms", label: "Skor LMS CeLOE (Pecahan)" },
              ]}
              value={inputMode}
              onChange={(v) => setInputMode(v as "standard" | "lms")}
            />
          </div>

          {inputMode === "standard" ? (
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Nilai Angka (0-100)"
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={nilaiAngka}
                  onChange={(e) => setNilaiAngka(e.target.value === "" ? "" : Number(e.target.value))}
                  required
                />
                <Input
                  label="Tanggal"
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  required
                />
              </div>

              {/* Smart Guard: Jika terketik angka <= 10 di mode 100 */}
              {typeof nilaiAngka === "number" && nilaiAngka > 0 && nilaiAngka <= 10 && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-[12px] text-amber-700 dark:text-amber-300 flex flex-col gap-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                    <span>
                      Kamu memasukkan angka <strong>{nilaiAngka}</strong>. Apakah ini nilai kuis CeLOE skala 10? Kalau ya, nilai setaranya adalah <strong>{nilaiAngka * 10}</strong> (Skala 100).
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pl-6">
                    <button
                      type="button"
                      onClick={() => setNilaiAngka(nilaiAngka * 10)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors"
                    >
                      Ubah jadi {nilaiAngka * 10}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLmsScore(nilaiAngka);
                        setLmsMaxScore(10);
                        setInputMode("lms");
                      }}
                      className="px-2 py-1 text-xs font-medium text-ios-textSecondary hover:underline"
                    >
                      Hitung di Mode LMS
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 p-3.5 rounded-2xl bg-ios-surfaceSecondary/70 border border-ios-border">
              <div className="text-xs text-ios-textSecondary">
                💡 Masukkan skor yang tertera di LMS CeLOE (misal <strong>8.00</strong> dari total <strong>10.00</strong>). Sistem akan otomatis mengonversi ke skala 100.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Skor Diperoleh"
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="Misal: 8.00"
                  value={lmsScore}
                  onChange={(e) => setLmsScore(e.target.value === "" ? "" : Number(e.target.value))}
                  required
                />
                <Input
                  label="Skor Maksimal LMS"
                  type="number"
                  min={0.1}
                  step={0.01}
                  placeholder="Misal: 10"
                  value={lmsMaxScore}
                  onChange={(e) => setLmsMaxScore(e.target.value === "" ? "" : Number(e.target.value))}
                  required
                />
              </div>

              {/* Preset cepat untuk Total Skor LMS */}
              <div className="flex items-center gap-1.5 flex-wrap text-xs text-ios-textSecondary">
                <span className="text-[11px]">Preset Max:</span>
                {[10, 20, 50, 100].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setLmsMaxScore(val)}
                    className={`px-2.5 py-0.5 rounded-lg border text-[11px] font-semibold transition-all ${
                      Number(lmsMaxScore) === val
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-ios-surface border-ios-border text-ios-text hover:border-primary/50"
                    }`}
                  >
                    /{val}
                  </button>
                ))}
              </div>

              {/* Live Preview Konversi */}
              {lmsScore !== "" && Number(lmsMaxScore) > 0 && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                      Terkonversi ke Skala 100
                    </div>
                    <div className="text-xl font-black text-emerald-700 dark:text-emerald-300">
                      {Math.min(100, Math.round(((Number(lmsScore) / Number(lmsMaxScore)) * 100) * 10) / 10)}
                      <span className="text-xs font-normal opacity-75 ml-1">/ 100</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-sm">
                      {getGradeLetter(Math.min(100, (Number(lmsScore) / Number(lmsMaxScore)) * 100)).letter} • Indeks {getGradeLetter(Math.min(100, (Number(lmsScore) / Number(lmsMaxScore)) * 100)).gpa.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <Input
                label="Tanggal"
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                required
              />
            </div>
          )}

          <div className="pt-3">
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSubmitting}
            >
              Simpan Nilai
            </Button>
          </div>
        </form>
      </Sheet>

      {/* Sheet Atur Bobot */}
      <Sheet
        isOpen={isBobotSheetOpen}
        onClose={() => setIsBobotSheetOpen(false)}
        title="Pengaturan Bobot Nilai"
        description={`Sesuaikan bobot penilaian untuk ${currentMatkul?.nama}. Total harus 100%.`}
      >
        <form onSubmit={handleSaveBobot} className="space-y-3.5">
          {bobotError && (
            <div className="p-3 rounded-btn bg-ios-danger/10 border border-ios-danger/25 text-ios-danger text-[13px] font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{bobotError}</span>
            </div>
          )}

          <div className="space-y-2.5">
            {editBobotList.map((b, idx) => (
              <div
                key={b.kategori}
                className="flex items-center justify-between p-3 rounded-btn bg-ios-surfaceSecondary border border-ios-border"
              >
                <span className="text-[14px] font-medium text-ios-textPrimary">
                  {b.kategori}
                </span>
                <div className="flex items-center gap-1.5 w-28">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={b.bobot_persen}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const updated = [...editBobotList];
                      updated[idx].bobot_persen = val;
                      setEditBobotList(updated);
                    }}
                    className="w-full px-2.5 py-1.5 text-right font-semibold rounded-md border border-ios-border bg-ios-surface text-[14px] focus:outline-none focus:border-ios-accent"
                  />
                  <span className="text-[13px] text-ios-textSecondary font-semibold">%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-btn bg-ios-surface border border-ios-border flex items-center justify-between text-[14px] font-semibold">
            <span>Total Bobot:</span>
            <span
              className={
                Math.abs(editBobotList.reduce((acc, b) => acc + Number(b.bobot_persen), 0) - 100) < 0.01
                  ? "text-ios-success"
                  : "text-ios-danger"
              }
            >
              {editBobotList.reduce((acc, b) => acc + Number(b.bobot_persen), 0)}%
            </span>
          </div>

          <div className="pt-3">
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSubmittingBobot}
            >
              Simpan Perubahan Bobot
            </Button>
          </div>
        </form>
      </Sheet>

      <GpaOptimizerModal
        isOpen={isGpaModalOpen}
        onClose={() => setIsGpaModalOpen(false)}
        matkulList={matkulList}
      />
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { BadgeStatus } from "@/components/ui/BadgeStatus";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { DeadlinePicker } from "@/components/ui/DeadlinePicker";
import {
  CheckSquare,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  List,
  CheckCircle2,
  Circle,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Loader2,
  Sparkles,
  GraduationCap,
  X,
  UploadCloud,
  FileCheck,
  FileText,
  Link as LinkIcon,
} from "lucide-react";
import { formatDateIndo, formatShortDateIndo, getDaysRemaining, cn } from "@/lib/utils";
import { TugasDeadline, Matkul } from "@/types";
import { fetchWithCache, getCachedData, invalidateClientCache } from "@/lib/client-cache";

export default function TugasPage() {
  const [tugasList, setTugasList] = useState<TugasDeadline[]>(() => {
    return getCachedData("/api/tugas")?.tugas || [];
  });
  const [matkulList, setMatkulList] = useState<Matkul[]>(() => {
    return getCachedData("/api/matkul")?.matkul || [];
  });
  const [loading, setLoading] = useState(() => !getCachedData("/api/tugas"));

  // View state: list or calendar
  const [viewMode, setViewMode] = useState<"list" | "kalender">("list");
  const [filterStatus, setFilterStatus] = useState<string>("aktif");

  // Sheet states
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editingTugas, setEditingTugas] = useState<TugasDeadline | null>(null);

  // Form states
  const [matkulId, setMatkulId] = useState("");
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [deadline, setDeadline] = useState("");
  const [prioritas, setPrioritas] = useState<"rendah" | "sedang" | "tinggi">("sedang");
  const [status, setStatus] = useState<"belum" | "proses" | "selesai">("belum");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // LMS CeLOE Sync States
  const [isLmsModalOpen, setIsLmsModalOpen] = useState(false);
  const [lmsSyncMode, setLmsSyncMode] = useState<"url" | "file">("url");
  const [lmsUrl, setLmsUrl] = useState("");
  const [isSyncingLms, setIsSyncingLms] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [lmsStatus, setLmsStatus] = useState<{
    hasIcalUrl?: boolean;
    lastSync?: string | null;
    lmsTaskCount?: number;
  }>({});

  const fetchLmsStatus = async () => {
    try {
      const res = await fetch("/api/lms/sync");
      if (res.ok) {
        const data = await res.json();
        setLmsStatus(data);
      }
    } catch {}
  };

  const fetchData = async () => {
    try {
      const [tData, mData] = await Promise.all([
        fetchWithCache("/api/tugas"),
        fetchWithCache("/api/matkul"),
      ]);

      if (tData?.tugas) setTugasList(tData.tugas);
      if (mData?.matkul) {
        setMatkulList(mData.matkul);
        if (mData.matkul.length > 0 && !matkulId) {
          setMatkulId(mData.matkul[0].id);
        }
      }
      fetchLmsStatus();
    } catch (err) {
      console.error("Failed to load tugas:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncWithContent = async (content: string, fileName?: string) => {
    try {
      setIsSyncingLms(true);
      setSyncFeedback(null);
      const res = await fetch("/api/lms/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          icsContent: content,
          icalUrl: lmsUrl.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSyncFeedback({ type: "success", text: data.message });
        fetchData();
        fetchLmsStatus();
      } else {
        setSyncFeedback({
          type: "error",
          text: data.error || "Gagal sinkronisasi data kalender.",
        });
      }
    } catch (err: any) {
      setSyncFeedback({
        type: "error",
        text: "Terjadi kesalahan koneksi saat memproses data kalender.",
      });
    } finally {
      setIsSyncingLms(false);
    }
  };

  const handleFileChange = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".ics") && !file.name.toLowerCase().endsWith(".txt")) {
      setSyncFeedback({
        type: "error",
        text: "File harus berformat .ics (iCalendar) dari CeLOE Moodle.",
      });
      return;
    }
    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setFileContent(text);
      handleSyncWithContent(text, file.name);
    };
    reader.readAsText(file);
  };

  const handleSyncLms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lmsSyncMode === "file") {
      if (fileContent) {
        return handleSyncWithContent(fileContent, selectedFileName || undefined);
      }
      fileInputRef.current?.click();
      return;
    }

    if (!lmsUrl.trim()) {
      setSyncFeedback({
        type: "error",
        text: "Silakan masukkan URL kalender iCal CeLOE Anda.",
      });
      return;
    }

    try {
      setIsSyncingLms(true);
      setSyncFeedback(null);
      const res = await fetch("/api/lms/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ icalUrl: lmsUrl.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSyncFeedback({ type: "success", text: data.message });
        fetchData();
        fetchLmsStatus();
      } else {
        if (data.cloudflareBlocked) {
          setLmsSyncMode("file");
        }
        setSyncFeedback({
          type: "error",
          text: data.error || "Gagal melakukan sinkronisasi CeLOE.",
        });
      }
    } catch (err: any) {
      setSyncFeedback({
        type: "error",
        text: "Terjadi kesalahan koneksi saat sinkronisasi.",
      });
    } finally {
      setIsSyncingLms(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setJudul("");
    setDeskripsi("");
    setDeadline("");
    setPrioritas("sedang");
    setStatus("belum");
  };

  const handleOpenAdd = () => {
    resetForm();
    if (matkulList.length > 0 && !matkulId) {
      setMatkulId(matkulList[0].id);
    }
    setIsAddSheetOpen(true);
  };

  const handleOpenEdit = (t: TugasDeadline) => {
    setEditingTugas(t);
    setMatkulId(t.matkul_id);
    setJudul(t.judul);
    setDeskripsi(t.deskripsi || "");
    const d = new Date(t.deadline);
    // Format to YYYY-MM-DDTHH:mm for datetime-local input
    const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setDeadline(localIso);
    setPrioritas(t.prioritas);
    setStatus(t.status);
    setIsEditSheetOpen(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matkulId || !judul.trim() || !deadline) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/tugas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matkul_id: matkulId,
          judul,
          deskripsi: deskripsi || null,
          deadline: new Date(deadline).toISOString(),
          prioritas,
          status,
        }),
      });

      if (res.ok) {
        setIsAddSheetOpen(false);
        resetForm();
        fetchData();
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTugas || !matkulId || !judul.trim() || !deadline) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/tugas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingTugas.id,
          matkul_id: matkulId,
          judul,
          deskripsi: deskripsi || null,
          deadline: new Date(deadline).toISOString(),
          prioritas,
          status,
        }),
      });

      if (res.ok) {
        setIsEditSheetOpen(false);
        setEditingTugas(null);
        fetchData();
      }
    } catch (err) {
      console.error("Update error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (t: TugasDeadline) => {
    const nextStatus = t.status === "selesai" ? "belum" : "selesai";
    try {
      const res = await fetch("/api/tugas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: t.id,
          status: nextStatus,
        }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  const handleDelete = async (id: string, judulTugas: string) => {
    if (!confirm(`Hapus tugas "${judulTugas}"?`)) return;

    try {
      const res = await fetch(`/api/tugas?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Filter tugas
  const filteredTugas = tugasList.filter((t) => {
    if (filterStatus === "aktif") return t.status !== "selesai";
    if (filterStatus === "selesai") return t.status === "selesai";
    return true;
  });

  const pendingCount = tugasList.filter((t) => t.status !== "selesai").length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-[26px] font-bold text-ios-textPrimary tracking-tight">
            Tugas & Deadline
          </h1>
          <p className="text-[13px] text-ios-textSecondary">
            {pendingCount} tugas aktif menanti penyelesaian
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsLmsModalOpen(true)}
            className="gap-1.5 text-ios-accent border-ios-accent/30 bg-ios-accent/10 hover:bg-ios-accent/20"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isSyncingLms && "animate-spin")} />
            <span>Sinkron CeLOE</span>
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenAdd} className="gap-1.5 shadow-sm">
            <Plus className="w-4 h-4" />
            <span>Tambah</span>
          </Button>
        </div>
      </div>

      {/* Controls: View Mode & Status Filter */}
      <div className="flex items-center gap-2">
        <div className="w-40">
          <SegmentedControl
            name="tugas-view"
            options={[
              { value: "list", label: "Daftar", icon: <List className="w-3.5 h-3.5" /> },
              { value: "kalender", label: "Kalender", icon: <Calendar className="w-3.5 h-3.5" /> },
            ]}
            value={viewMode}
            onChange={(v) => setViewMode(v as "list" | "kalender")}
          />
        </div>

        <div className="flex-1">
          <SegmentedControl
            name="tugas-status-filter"
            options={[
              { value: "aktif", label: "Aktif" },
              { value: "selesai", label: "Selesai" },
              { value: "semua", label: "Semua" },
            ]}
            value={filterStatus}
            onChange={setFilterStatus}
          />
        </div>
      </div>

      {/* Content: List Mode */}
      {viewMode === "list" ? (
        <div className="space-y-2.5">
          {filteredTugas.length === 0 ? (
            <Card className="p-8 text-center bg-ios-surface">
              <CheckSquare className="w-8 h-8 text-ios-textSecondary mx-auto mb-2 opacity-50" />
              <p className="text-[15px] font-semibold text-ios-textPrimary">
                Tidak ada tugas pada filter ini
              </p>
              <p className="text-[13px] text-ios-textSecondary mt-1">
                Gunakan tombol Tambah di atas untuk mendaftarkan tugas baru.
              </p>
            </Card>
          ) : (
            filteredTugas.map((t) => {
              const remaining = getDaysRemaining(t.deadline);
              const isDone = t.status === "selesai";

              return (
                <Card
                  key={t.id}
                  className={`p-4 transition-all duration-200 ${
                    isDone ? "opacity-60 bg-ios-surfaceSecondary/50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Status Toggle Checkbox */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(t)}
                      className="mt-0.5 text-ios-textSecondary hover:text-ios-accent transition-colors"
                      title={isDone ? "Tandai belum selesai" : "Tandai selesai"}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-ios-success" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    {/* Task Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-ios-textSecondary truncate">
                          {t.matkul?.nama || "Mata Kuliah"}
                        </span>
                        <BadgeStatus
                          size="sm"
                          variant={
                            t.prioritas === "tinggi"
                              ? "urgent"
                              : t.prioritas === "sedang"
                              ? "proses"
                              : "neutral"
                          }
                        >
                          {t.prioritas}
                        </BadgeStatus>
                      </div>

                      <h3
                        className={`text-[15px] font-semibold text-ios-textPrimary mt-0.5 ${
                          isDone ? "line-through text-ios-textSecondary" : ""
                        }`}
                      >
                        {t.judul}
                      </h3>

                      {t.deskripsi && (
                        <div className="mt-1.5 space-y-1.5">
                          <p className="text-[13px] text-ios-textSecondary whitespace-pre-line leading-relaxed">
                            {t.deskripsi}
                          </p>
                          {(() => {
                            const urlMatch = t.deskripsi.match(/(https?:\/\/[^\s]+)/);
                            if (!urlMatch) return null;
                            return (
                              <a
                                href={urlMatch[0]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-ios-accent hover:underline bg-ios-accent/10 hover:bg-ios-accent/15 px-2.5 py-1 rounded-lg border border-ios-accent/20 transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Buka Link Pengumpulan / Berkas</span>
                              </a>
                            );
                          })()}
                        </div>
                      )}

                      <div className="mt-2.5 flex items-center justify-between text-[12px] pt-2 border-t border-ios-border/60">
                        <span className="flex items-center gap-1.5 text-ios-textSecondary">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatShortDateIndo(t.deadline)}</span>
                        </span>

                        <BadgeStatus
                          size="sm"
                          variant={
                            isDone
                              ? "selesai"
                              : remaining.isUrgent
                              ? "urgent"
                              : "neutral"
                          }
                        >
                          {isDone ? "Selesai" : remaining.label}
                        </BadgeStatus>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 -mr-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(t)}
                        className="p-1.5 rounded-md text-ios-textSecondary hover:text-ios-accent hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        title="Edit Tugas"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(t.id, t.judul)}
                        className="p-1.5 rounded-md text-ios-textSecondary hover:text-ios-danger hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        title="Hapus Tugas"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      ) : (
        /* Calendar View Mode */
        <div className="space-y-3">
          <Card className="p-4">
            <h3 className="text-[16px] font-semibold text-ios-textPrimary mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-ios-accent" />
              <span>Agenda Tenggat Waktu</span>
            </h3>

            {/* Grouped by Date */}
            <div className="space-y-3">
              {filteredTugas.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-btn bg-ios-surfaceSecondary border border-ios-border flex items-center justify-between gap-3"
                >
                  <div>
                    <span className="text-[11px] font-semibold text-ios-textSecondary block">
                      {formatDateIndo(t.deadline)}
                    </span>
                    <span className="text-[14px] font-medium text-ios-textPrimary mt-0.5 block">
                      {t.judul}
                    </span>
                    <span className="text-[12px] text-ios-textSecondary">
                      {t.matkul?.nama}
                    </span>
                  </div>
                  <BadgeStatus
                    size="sm"
                    variant={
                      t.status === "selesai"
                        ? "selesai"
                        : getDaysRemaining(t.deadline).isUrgent
                        ? "urgent"
                        : "neutral"
                    }
                  >
                    {t.status === "selesai"
                      ? "Selesai"
                      : getDaysRemaining(t.deadline).label}
                  </BadgeStatus>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Add Sheet */}
      <Sheet
        isOpen={isAddSheetOpen}
        onClose={() => setIsAddSheetOpen(false)}
        title="Catat Tugas Baru"
        description="Masukkan rincian tugas dan jadwal tenggat waktu."
      >
        <form onSubmit={handleSaveAdd} className="space-y-3.5">
          <Select
            label="Mata Kuliah"
            value={matkulId}
            onChange={(e) => setMatkulId(e.target.value)}
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
            placeholder="Contoh: Laporan Praktikum Modul 3"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            required
          />

          <Textarea
            label="Deskripsi / Catatan Tambahan"
            placeholder="Instruksi pengumpulan, format berkas, atau tautan referensi..."
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            rows={3}
          />

          <DeadlinePicker
            label="Batas Waktu (Deadline)"
            value={deadline}
            onChange={setDeadline}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Prioritas"
              value={prioritas}
              onChange={(e) => setPrioritas(e.target.value as "rendah" | "sedang" | "tinggi")}
            >
              <option value="rendah">Rendah</option>
              <option value="sedang">Sedang</option>
              <option value="tinggi">Tinggi (Penting)</option>
            </Select>

            <Select
              label="Status Awal"
              value={status}
              onChange={(e) => setStatus(e.target.value as "belum" | "proses" | "selesai")}
            >
              <option value="belum">Belum Dimulai</option>
              <option value="proses">Sedang Dikerjakan</option>
              <option value="selesai">Selesai</option>
            </Select>
          </div>

          <div className="pt-3">
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSubmitting}
            >
              Simpan Tugas
            </Button>
          </div>
        </form>
      </Sheet>

      {/* Edit Sheet */}
      <Sheet
        isOpen={isEditSheetOpen}
        onClose={() => setIsEditSheetOpen(false)}
        title="Ubah Tugas"
        description="Perbarui informasi tugas atau perpanjang tenggat waktu."
      >
        <form onSubmit={handleSaveEdit} className="space-y-3.5">
          <Select
            label="Mata Kuliah"
            value={matkulId}
            onChange={(e) => setMatkulId(e.target.value)}
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
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            required
          />

          <Textarea
            label="Deskripsi"
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            rows={3}
          />

          <DeadlinePicker
            label="Batas Waktu"
            value={deadline}
            onChange={setDeadline}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Prioritas"
              value={prioritas}
              onChange={(e) => setPrioritas(e.target.value as "rendah" | "sedang" | "tinggi")}
            >
              <option value="rendah">Rendah</option>
              <option value="sedang">Sedang</option>
              <option value="tinggi">Tinggi</option>
            </Select>

            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as "belum" | "proses" | "selesai")}
            >
              <option value="belum">Belum Dimulai</option>
              <option value="proses">Sedang Dikerjakan</option>
              <option value="selesai">Selesai</option>
            </Select>
          </div>

          <div className="pt-3">
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSubmitting}
            >
              Perbarui Tugas
            </Button>
          </div>
        </form>
      </Sheet>

      {/* Modal Sinkronisasi CeLOE (Moodle LMS) */}
      {isLmsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-ios-surface rounded-3xl p-6 border border-ios-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-ios-textPrimary">
                    Sinkronisasi LMS CeLOE Tel-U
                  </h3>
                  <p className="text-[11.5px] text-ios-textSecondary">
                    Tarik otomatis deadline tugas &amp; kuis dari Moodle kampus
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLmsModalOpen(false)}
                className="text-ios-textSecondary hover:text-ios-textPrimary p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Sync Info */}
            <div className="p-3.5 rounded-2xl bg-ios-surfaceSecondary border border-ios-border text-[12px] space-y-1">
              <div className="flex justify-between">
                <span className="text-ios-textSecondary">Status Kalender:</span>
                <span className="font-semibold text-ios-textPrimary">
                  {lmsStatus.hasIcalUrl ? "Terhubung" : "Belum terhubung"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ios-textSecondary">Tugas CeLOE Tersinkron:</span>
                <span className="font-semibold text-ios-accent">
                  {lmsStatus.lmsTaskCount || 0} Tugas
                </span>
              </div>
              {lmsStatus.lastSync && (
                <div className="flex justify-between">
                  <span className="text-ios-textSecondary">Terakhir Disinkron:</span>
                  <span className="text-ios-textPrimary">
                    {new Date(lmsStatus.lastSync).toLocaleString("id-ID", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })} WIB
                  </span>
                </div>
              )}
            </div>

            {/* Method Tab Switcher */}
            <div className="flex p-1 bg-ios-surfaceSecondary border border-ios-border rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => setLmsSyncMode("file")}
                className={cn(
                  "flex-1 py-1.5 px-3 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all",
                  lmsSyncMode === "file"
                    ? "bg-ios-surface text-ios-textPrimary shadow-sm"
                    : "text-ios-textSecondary hover:text-ios-textPrimary"
                )}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Unggah File .ics</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">100% Berhasil</span>
              </button>
              <button
                type="button"
                onClick={() => setLmsSyncMode("url")}
                className={cn(
                  "flex-1 py-1.5 px-3 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all",
                  lmsSyncMode === "url"
                    ? "bg-ios-surface text-ios-textPrimary shadow-sm"
                    : "text-ios-textSecondary hover:text-ios-textPrimary"
                )}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Tautan URL Kalender</span>
              </button>
            </div>

            {/* How-to Guide based on Mode */}
            {lmsSyncMode === "file" ? (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[11.5px] text-ios-textPrimary leading-relaxed space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <FileCheck className="w-4 h-4" />
                  Cara Paling Cepat &amp; Bebas Blokir Firewall:
                </p>
                <p className="text-ios-textSecondary">
                  Di halaman <strong className="text-ios-textPrimary">Export calendar</strong> CeLOE Anda (seperti screenshot Anda), cukup klik tombol merah <strong className="text-rose-500">"Export"</strong> di samping <em>"Get calendar URL"</em>. File <code className="bg-ios-surface px-1 py-0.5 rounded border border-ios-border text-[11px]">icalexport.ics</code> akan langsung terunduh ke laptop/HP Anda. Seret atau pilih file tersebut di bawah.
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-ios-surfaceSecondary/50 border border-ios-border text-[11.5px] text-ios-textSecondary leading-relaxed space-y-1.5">
                <p className="font-bold text-ios-textPrimary">
                  Cara Mengambil Link iCal Kalender CeLOE:
                </p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Buka <strong className="text-ios-textPrimary">lms.telkomuniversity.ac.id</strong> &rarr; menu <strong>Calendar</strong>.</li>
                  <li>Gulir ke bawah, klik <strong>Export calendar</strong>.</li>
                  <li>Pilih <em>"All events"</em> dan <em>"Recent and next 60 days"</em>, lalu klik <strong>Get calendar URL</strong>.</li>
                  <li>Salin link URL dan tempelkan di bawah.</li>
                </ol>
              </div>
            )}

            {syncFeedback && (
              <div
                className={cn(
                  "p-3 rounded-xl text-[12px] font-medium border leading-snug",
                  syncFeedback.type === "success"
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    : "bg-red-500/10 border-red-500/20 text-red-500"
                )}
              >
                {syncFeedback.text}
              </div>
            )}

            {lmsSyncMode === "file" ? (
              <div className="space-y-3 pt-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".ics,.txt"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileChange(file);
                  }}
                />

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingFile(true);
                  }}
                  onDragLeave={() => setIsDraggingFile(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingFile(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFileChange(file);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "cursor-pointer border-2 border-dashed rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center gap-2",
                    isDraggingFile
                      ? "border-ios-accent bg-ios-accent/5 scale-[1.01]"
                      : "border-ios-border hover:border-ios-accent/50 bg-ios-surfaceSecondary/40"
                  )}
                >
                  <div className="p-3 rounded-2xl bg-ios-surface shadow-sm border border-ios-border text-ios-accent">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-ios-textPrimary">
                      {selectedFileName ? selectedFileName : "Klik untuk Pilih File atau Seret File ke Sini"}
                    </p>
                    <p className="text-[11.5px] text-ios-textSecondary mt-0.5">
                      Mendukung file kalender CeLOE (<code className="font-semibold text-ios-textPrimary">.ics</code>)
                    </p>
                  </div>
                  {selectedFileName && (
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      File siap diproses
                    </span>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsLmsModalOpen(false)}
                    className="flex-1"
                  >
                    Tutup
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    disabled={isSyncingLms}
                    onClick={() => {
                      if (fileContent) {
                        handleSyncWithContent(fileContent, selectedFileName || undefined);
                      } else {
                        fileInputRef.current?.click();
                      }
                    }}
                    className="flex-1 gap-1.5 shadow-sm"
                  >
                    {isSyncingLms ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    <span>{isSyncingLms ? "Memproses File..." : "Impor File Kalender"}</span>
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSyncLms} className="space-y-3 pt-1">
                <div>
                  <label className="block text-[12px] font-semibold text-ios-textPrimary mb-1">
                    URL Kalender iCal CeLOE (.ics)
                  </label>
                  <input
                    type="url"
                    placeholder="https://lms.telkomuniversity.ac.id/calendar/export_execute.php?..."
                    value={lmsUrl}
                    onChange={(e) => setLmsUrl(e.target.value)}
                    className="w-full p-2.5 text-[12px] bg-ios-surfaceSecondary border border-ios-border rounded-xl focus:outline-none focus:ring-1 focus:ring-ios-accent"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsLmsModalOpen(false)}
                    className="flex-1"
                  >
                    Tutup
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSyncingLms}
                    className="flex-1 gap-1.5 shadow-sm"
                  >
                    {isSyncingLms ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    <span>{isSyncingLms ? "Menyinkronkan..." : "Sinkronkan Sekarang"}</span>
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

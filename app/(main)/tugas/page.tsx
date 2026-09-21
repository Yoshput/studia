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
} from "lucide-react";
import { formatDateIndo, formatShortDateIndo, getDaysRemaining } from "@/lib/utils";
import { TugasDeadline, Matkul } from "@/types";

export default function TugasPage() {
  const [tugasList, setTugasList] = useState<TugasDeadline[]>([]);
  const [matkulList, setMatkulList] = useState<Matkul[]>([]);
  const [loading, setLoading] = useState(true);

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

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tugasRes, matkulRes] = await Promise.all([
        fetch("/api/tugas"),
        fetch("/api/matkul"),
      ]);
      const tData = await tugasRes.json();
      const mData = await matkulRes.json();

      if (tData.tugas) setTugasList(tData.tugas);
      if (mData.matkul) {
        setMatkulList(mData.matkul);
        if (mData.matkul.length > 0 && !matkulId) {
          setMatkulId(mData.matkul[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load tugas:", err);
    } finally {
      setLoading(false);
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
        <Button variant="primary" size="sm" onClick={handleOpenAdd} className="gap-1.5">
          <Plus className="w-4 h-4" />
          <span>Tambah</span>
        </Button>
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
    </div>
  );
}

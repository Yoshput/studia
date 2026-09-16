"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { BadgeStatus } from "@/components/ui/BadgeStatus";
import {
  BookOpenCheck,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { formatDateIndo, formatShortDateIndo } from "@/lib/utils";
import { ProgressHarian, Matkul } from "@/types";

export default function ProgressPage() {
  const [progressList, setProgressList] = useState<ProgressHarian[]>([]);
  const [matkulList, setMatkulList] = useState<Matkul[]>([]);
  const [selectedMatkulFilter, setSelectedMatkulFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  // Sheets
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ProgressHarian | null>(null);

  // Form states
  const [matkulId, setMatkulId] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [materi, setMateri] = useState("");
  const [catatan, setCatatan] = useState("");
  const [pemahaman, setPemahaman] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [progRes, matRes] = await Promise.all([
        fetch("/api/progress"),
        fetch("/api/matkul"),
      ]);

      const pData = await progRes.json();
      const mData = await matRes.json();

      if (pData.progress) setProgressList(pData.progress);
      if (mData.matkul) {
        setMatkulList(mData.matkul);
        if (mData.matkul.length > 0 && !matkulId) {
          setMatkulId(mData.matkul[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load progress:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setTanggal(new Date().toISOString().slice(0, 10));
    setMateri("");
    setCatatan("");
    setPemahaman(4);
  };

  const handleOpenAdd = () => {
    resetForm();
    if (matkulList.length > 0 && !matkulId) {
      setMatkulId(matkulList[0].id);
    }
    setIsAddSheetOpen(true);
  };

  const handleOpenEdit = (entry: ProgressHarian) => {
    setEditingEntry(entry);
    setMatkulId(entry.matkul_id);
    setTanggal(new Date(entry.tanggal).toISOString().slice(0, 10));
    setMateri(entry.materi_dipelajari);
    setCatatan(entry.catatan || "");
    setPemahaman(entry.tingkat_pemahaman);
    setIsEditSheetOpen(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matkulId || !materi.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matkul_id: matkulId,
          tanggal: new Date(tanggal).toISOString(),
          materi_dipelajari: materi,
          catatan: catatan || null,
          tingkat_pemahaman: pemahaman,
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
    if (!editingEntry || !matkulId || !materi.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/progress", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingEntry.id,
          matkul_id: matkulId,
          tanggal: new Date(tanggal).toISOString(),
          materi_dipelajari: materi,
          catatan: catatan || null,
          tingkat_pemahaman: pemahaman,
        }),
      });

      if (res.ok) {
        setIsEditSheetOpen(false);
        setEditingEntry(null);
        fetchData();
      }
    } catch (err) {
      console.error("Update error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, materiJudul: string) => {
    if (!confirm(`Hapus catatan progress "${materiJudul}"?`)) return;

    try {
      const res = await fetch(`/api/progress?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const filteredProgress =
    selectedMatkulFilter === "all"
      ? progressList
      : progressList.filter((p) => p.matkul_id === selectedMatkulFilter);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-[26px] font-bold text-ios-textPrimary tracking-tight">
            Progress Belajar
          </h1>
          <p className="text-[13px] text-ios-textSecondary">
            {progressList.length} sesi belajar tercatat di semester ini
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={handleOpenAdd} className="gap-1.5">
          <Plus className="w-4 h-4" />
          <span>Isi Progress</span>
        </Button>
      </div>

      {/* Filter by Matkul */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          type="button"
          onClick={() => setSelectedMatkulFilter("all")}
          className={`px-3 py-1.5 rounded-full text-[13px] font-semibold flex-shrink-0 transition-all border ${
            selectedMatkulFilter === "all"
              ? "bg-ios-accent text-white border-ios-accent shadow-sm"
              : "bg-ios-surfaceSecondary text-ios-textSecondary border-ios-border hover:bg-ios-surface"
          }`}
        >
          Semua Matkul ({progressList.length})
        </button>
        {matkulList.map((m) => {
          const count = progressList.filter((p) => p.matkul_id === m.id).length;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedMatkulFilter(m.id)}
              className={`px-3 py-1.5 rounded-full text-[13px] font-semibold flex-shrink-0 transition-all border ${
                selectedMatkulFilter === m.id
                  ? "bg-ios-accent text-white border-ios-accent shadow-sm"
                  : "bg-ios-surfaceSecondary text-ios-textSecondary border-ios-border hover:bg-ios-surface"
              }`}
            >
              {m.kode ? `${m.kode} ` : ""}
              {m.nama} ({count})
            </button>
          );
        })}
      </div>

      {/* Progress Timeline View */}
      <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-ios-border before:-z-0">
        {filteredProgress.length === 0 ? (
          <Card className="p-8 text-center bg-ios-surface z-10 relative">
            <BookOpenCheck className="w-8 h-8 text-ios-textSecondary mx-auto mb-2 opacity-50" />
            <p className="text-[15px] font-semibold text-ios-textPrimary">
              Belum ada catatan progress belajar
            </p>
            <p className="text-[13px] text-ios-textSecondary mt-1">
              Catat materi yang baru saja kamu pelajari agar pemahamanmu terdokumentasi.
            </p>
          </Card>
        ) : (
          filteredProgress.map((item) => (
            <div key={item.id} className="relative pl-8 z-10">
              {/* Timeline dot */}
              <div
                className="absolute left-2 top-4 w-3.5 h-3.5 rounded-full border-2 border-ios-surface shadow-sm -translate-x-1/2"
                style={{ backgroundColor: item.matkul?.warna || "#007AFF" }}
              />

              <Card className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-ios-textSecondary">
                        {item.matkul?.nama}
                      </span>
                      <span className="text-[11px] text-ios-textSecondary">
                        • {formatDateIndo(item.tanggal)}
                      </span>
                    </div>

                    <h3 className="text-[16px] font-bold text-ios-textPrimary mt-0.5">
                      {item.materi_dipelajari}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 -mr-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 rounded-md text-ios-textSecondary hover:text-ios-accent transition-colors"
                      title="Edit Progress"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id, item.materi_dipelajari)}
                      className="p-1.5 rounded-md text-ios-textSecondary hover:text-ios-danger transition-colors"
                      title="Hapus Progress"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {item.catatan && (
                  <p className="text-[13px] text-ios-textSecondary mt-2 leading-relaxed bg-ios-surfaceSecondary/60 p-2.5 rounded-lg border border-ios-border/60">
                    {item.catatan}
                  </p>
                )}

                <div className="mt-3 pt-2.5 border-t border-ios-border/60 flex items-center justify-between text-[12px]">
                  <span className="text-ios-textSecondary font-medium">
                    Tingkat Pemahaman
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`w-2 h-2 rounded-full ${
                          star <= item.tingkat_pemahaman
                            ? "bg-ios-accent"
                            : "bg-ios-border"
                        }`}
                      />
                    ))}
                    <span className="text-[11px] font-bold text-ios-textPrimary ml-1">
                      {item.tingkat_pemahaman}/5
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          ))
        )}
      </div>

      {/* Add Sheet */}
      <Sheet
        isOpen={isAddSheetOpen}
        onClose={() => setIsAddSheetOpen(false)}
        title="Catat Progress Belajar"
        description="Dokumentasikan materi perkuliahan atau belajar mandiri."
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
            label="Tanggal Belajar"
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            required
          />

          <Input
            label="Materi yang Dipelajari"
            placeholder="Contoh: Algoritma Pencarian BFS & DFS"
            value={materi}
            onChange={(e) => setMateri(e.target.value)}
            required
          />

          <Textarea
            label="Catatan & Refleksi Pemahaman"
            placeholder="Ringkasan poin penting, konsep yang perlu diulang, atau kode referensi..."
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            rows={3}
          />

          <div>
            <label className="block text-[13px] font-medium text-ios-textSecondary mb-2">
              Tingkat Pemahaman: {pemahaman} dari 5
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

          <div className="pt-3">
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSubmitting}
            >
              Simpan Catatan Belajar
            </Button>
          </div>
        </form>
      </Sheet>

      {/* Edit Sheet */}
      <Sheet
        isOpen={isEditSheetOpen}
        onClose={() => setIsEditSheetOpen(false)}
        title="Ubah Catatan Belajar"
        description="Perbarui informasi materi atau catatan pemahaman."
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
            label="Tanggal Belajar"
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            required
          />

          <Input
            label="Materi yang Dipelajari"
            value={materi}
            onChange={(e) => setMateri(e.target.value)}
            required
          />

          <Textarea
            label="Catatan"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            rows={3}
          />

          <div>
            <label className="block text-[13px] font-medium text-ios-textSecondary mb-2">
              Tingkat Pemahaman: {pemahaman} dari 5
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

          <div className="pt-3">
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSubmitting}
            >
              Perbarui Catatan
            </Button>
          </div>
        </form>
      </Sheet>
    </div>
  );
}

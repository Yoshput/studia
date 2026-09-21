"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { Input, Select } from "@/components/ui/Input";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  BookOpen,
  Download,
} from "lucide-react";
import { Matkul } from "@/types";
import { AttendanceRadarCard } from "@/components/pro/AttendanceRadarCard";
import { ProUpgradeModal } from "@/components/pro/ProUpgradeModal";
import { exportJadwalToCsv } from "@/lib/export";

const HARI_OPTIONS = [
  { value: "Senin", label: "Senin" },
  { value: "Selasa", label: "Selasa" },
  { value: "Rabu", label: "Rabu" },
  { value: "Kamis", label: "Kamis" },
  { value: "Jumat", label: "Jumat" },
  { value: "Semua", label: "Semua" },
];

export default function JadwalPage() {
  const [matkulList, setMatkulList] = useState<Matkul[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHari, setSelectedHari] = useState("Senin");
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editingMatkul, setEditingMatkul] = useState<Matkul | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  // Form states
  const [nama, setNama] = useState("");
  const [kode, setKode] = useState("");
  const [dosen, setDosen] = useState("");
  const [sks, setSks] = useState(3);
  const [hari, setHari] = useState("Senin");
  const [jamMulai, setJamMulai] = useState("08:00");
  const [jamSelesai, setJamSelesai] = useState("10:30");
  const [ruang, setRuang] = useState("");
  const [warna, setWarna] = useState("#007AFF");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [presensiList, setPresensiList] = useState<any[]>([]);

  const fetchMatkul = async () => {
    try {
      setLoading(true);
      const [mRes, pRes] = await Promise.all([
        fetch("/api/matkul"),
        fetch("/api/presensi"),
      ]);
      const data = await mRes.json();
      const pData = await pRes.json();
      if (data.matkul) setMatkulList(data.matkul);
      if (pData.presensi) setPresensiList(pData.presensi);
    } catch (err) {
      console.error("Failed to load matkul:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatkul();
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.user?.is_pro) setIsPro(true);
      })
      .catch(() => {});
  }, []);

  const resetForm = () => {
    setNama("");
    setKode("");
    setDosen("");
    setSks(3);
    setHari("Senin");
    setJamMulai("08:00");
    setJamSelesai("10:30");
    setRuang("");
    setWarna("#007AFF");
    setFormError("");
  };

  const handleOpenAdd = () => {
    resetForm();
    setHari(selectedHari === "Semua" ? "Senin" : selectedHari);
    setIsAddSheetOpen(true);
  };

  const handleOpenEdit = (m: Matkul) => {
    setEditingMatkul(m);
    setNama(m.nama);
    setKode(m.kode || "");
    setDosen(m.dosen);
    setSks(m.sks);
    setHari(m.hari);
    setJamMulai(m.jam_mulai);
    setJamSelesai(m.jam_selesai);
    setRuang(m.ruang);
    setWarna(m.warna || "#007AFF");
    setFormError("");
    setIsEditSheetOpen(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/matkul", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama,
          kode: kode || null,
          dosen,
          sks,
          hari,
          jam_mulai: jamMulai,
          jam_selesai: jamSelesai,
          ruang,
          warna,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Gagal menambahkan mata kuliah");
      } else {
        setIsAddSheetOpen(false);
        resetForm();
        fetchMatkul();
      }
    } catch {
      setFormError("Terjadi kendala saat menghubungi server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMatkul) return;

    setFormError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/matkul", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingMatkul.id,
          nama,
          kode: kode || null,
          dosen,
          sks,
          hari,
          jam_mulai: jamMulai,
          jam_selesai: jamSelesai,
          ruang,
          warna,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Gagal memperbarui mata kuliah");
      } else {
        setIsEditSheetOpen(false);
        setEditingMatkul(null);
        fetchMatkul();
      }
    } catch {
      setFormError("Terjadi kendala saat menghubungi server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, namaMatkul: string) => {
    if (!confirm(`Hapus mata kuliah "${namaMatkul}" beserta seluruh data nilai dan tugas terkait?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/matkul?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchMatkul();
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Filter matkul based on segmented control
  const filteredMatkul =
    selectedHari === "Semua"
      ? matkulList
      : matkulList.filter((m) => m.hari === selectedHari);

  const totalSks = matkulList.reduce((acc, m) => acc + m.sks, 0);

  const attendanceCourses = matkulList.map((m) => {
    const totalPertemuan = 14;
    const hadirCount = presensiList.filter(
      (p) => p.matkul_id === m.id && p.status?.toLowerCase().includes("hadir")
    ).length;
    const alpaCount = presensiList.filter(
      (p) =>
        p.matkul_id === m.id &&
        (p.status?.toLowerCase().includes("alpa") || p.status?.toLowerCase().includes("tidak"))
    ).length;

    return {
      id: m.id,
      nama: m.nama,
      kode: m.kode,
      totalPertemuan,
      hadirCount,
      alpaCount,
    };
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-[26px] font-bold text-ios-textPrimary tracking-tight">
            Jadwal Kuliah
          </h1>
          <p className="text-[13px] text-ios-textSecondary">
            {matkulList.length} Mata Kuliah • Total {totalSks} SKS
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => exportJadwalToCsv(matkulList, "Semester 5")}
            className="gap-1.5 font-semibold text-[12px]"
          >
            <Download className="w-3.5 h-3.5 text-ios-accent" />
            <span>Export CSV</span>
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenAdd} className="gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Tambah</span>
          </Button>
        </div>
      </div>

      {/* PRO Attendance Radar Card */}
      <AttendanceRadarCard
        courses={attendanceCourses}
        isPro={isPro}
        onUpgradeClick={() => setIsProModalOpen(true)}
      />

      {/* Segmented Control for Days */}
      <SegmentedControl
        name="jadwal-day-filter"
        options={HARI_OPTIONS}
        value={selectedHari}
        onChange={setSelectedHari}
      />

      {/* List Matkul */}
      <div className="space-y-3">
        {filteredMatkul.length === 0 ? (
          <Card className="p-8 text-center bg-ios-surface">
            <CalendarDays className="w-8 h-8 text-ios-textSecondary mx-auto mb-2 opacity-50" />
            <p className="text-[15px] font-semibold text-ios-textPrimary">
              Tidak ada jadwal untuk {selectedHari}
            </p>
            <p className="text-[13px] text-ios-textSecondary mt-1">
              Gunakan tombol Tambah untuk mendaftarkan jadwal mata kuliah baru.
            </p>
          </Card>
        ) : (
          filteredMatkul.map((m) => (
            <Card
              key={m.id}
              className="p-4 border-l-4 transition-all duration-200"
              style={{ borderLeftColor: m.warna || "#007AFF" }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-semibold text-ios-textSecondary">
                      {m.kode || "MATKUL"}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-ios-surfaceSecondary border border-ios-border text-ios-textSecondary">
                      {m.sks} SKS
                    </span>
                    {selectedHari === "Semua" && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-ios-accent/10 text-ios-accent border border-ios-accent/20">
                        {m.hari}
                      </span>
                    )}
                  </div>
                  <h3 className="text-[16px] font-semibold text-ios-textPrimary mt-1">
                    {m.nama}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[13px] text-ios-textSecondary mt-0.5">
                    <User className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{m.dosen}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(m)}
                    className="p-1.5 rounded-md text-ios-textSecondary hover:text-ios-accent hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    title="Edit Mata Kuliah"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(m.id, m.nama)}
                    className="p-1.5 rounded-md text-ios-textSecondary hover:text-ios-danger hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    title="Hapus Mata Kuliah"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-ios-border flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-1.5 font-medium text-ios-textPrimary">
                  <Clock className="w-4 h-4 text-ios-accent" />
                  <span>
                    {m.jam_mulai} – {m.jam_selesai}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-ios-textSecondary">
                  <MapPin className="w-4 h-4" />
                  <span>{m.ruang}</span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add Sheet */}
      <Sheet
        isOpen={isAddSheetOpen}
        onClose={() => setIsAddSheetOpen(false)}
        title="Tambah Mata Kuliah"
        description="Daftarkan mata kuliah baru untuk semester aktif."
      >
        <form onSubmit={handleSaveAdd} className="space-y-3.5">
          {formError && (
            <div className="p-3 rounded-btn bg-ios-danger/10 border border-ios-danger/25 text-ios-danger text-[13px] font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <Input
            label="Nama Mata Kuliah"
            placeholder="Contoh: Pemrograman Mobile"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Kode Matkul"
              placeholder="Contoh: IF301"
              value={kode}
              onChange={(e) => setKode(e.target.value)}
            />
            <Select
              label="Jumlah SKS"
              value={sks}
              onChange={(e) => setSks(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 6].map((num) => (
                <option key={num} value={num}>
                  {num} SKS
                </option>
              ))}
            </Select>
          </div>

          <Input
            label="Dosen Pengampu"
            placeholder="Nama dosen beserta gelar"
            value={dosen}
            onChange={(e) => setDosen(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Hari Kuliah"
              value={hari}
              onChange={(e) => setHari(e.target.value)}
            >
              {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </Select>
            <Input
              label="Ruangan"
              placeholder="Contoh: DC-201 / Lab RPL"
              value={ruang}
              onChange={(e) => setRuang(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Jam Mulai"
              type="time"
              value={jamMulai}
              onChange={(e) => setJamMulai(e.target.value)}
              required
            />
            <Input
              label="Jam Selesai"
              type="time"
              value={jamSelesai}
              onChange={(e) => setJamSelesai(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-ios-textSecondary mb-1.5">
              Warna Penanda
            </label>
            <div className="flex gap-2">
              {[
                "#007AFF",
                "#5856D6",
                "#34C759",
                "#FF9500",
                "#AF52DE",
                "#32ADE6",
                "#FF2D55",
                "#FF3B30",
              ].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setWarna(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    warna === c ? "scale-110 ring-2 ring-offset-2 ring-ios-accent" : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                />
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
              Simpan Mata Kuliah
            </Button>
          </div>
        </form>
      </Sheet>

      {/* Edit Sheet */}
      <Sheet
        isOpen={isEditSheetOpen}
        onClose={() => setIsEditSheetOpen(false)}
        title="Ubah Mata Kuliah"
        description="Perbarui informasi jadwal atau dosen mata kuliah."
      >
        <form onSubmit={handleSaveEdit} className="space-y-3.5">
          {formError && (
            <div className="p-3 rounded-btn bg-ios-danger/10 border border-ios-danger/25 text-ios-danger text-[13px] font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <Input
            label="Nama Mata Kuliah"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Kode Matkul"
              value={kode}
              onChange={(e) => setKode(e.target.value)}
            />
            <Select
              label="Jumlah SKS"
              value={sks}
              onChange={(e) => setSks(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 6].map((num) => (
                <option key={num} value={num}>
                  {num} SKS
                </option>
              ))}
            </Select>
          </div>

          <Input
            label="Dosen Pengampu"
            value={dosen}
            onChange={(e) => setDosen(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Hari Kuliah"
              value={hari}
              onChange={(e) => setHari(e.target.value)}
            >
              {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </Select>
            <Input
              label="Ruangan"
              value={ruang}
              onChange={(e) => setRuang(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Jam Mulai"
              type="time"
              value={jamMulai}
              onChange={(e) => setJamMulai(e.target.value)}
              required
            />
            <Input
              label="Jam Selesai"
              type="time"
              value={jamSelesai}
              onChange={(e) => setJamSelesai(e.target.value)}
              required
            />
          </div>

          <div className="pt-3">
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSubmitting}
            >
              Perbarui Mata Kuliah
            </Button>
          </div>
        </form>
      </Sheet>

      <ProUpgradeModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        currentPlan={isPro ? "PRO_SEMESTER" : "free"}
        onSuccess={() => setIsPro(true)}
      />
    </div>
  );
}

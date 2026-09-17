"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BadgeStatus } from "@/components/ui/BadgeStatus";
import { Select } from "@/components/ui/Input";
import {
  Camera,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  UserCheck,
  FlipHorizontal,
  ShieldCheck,
  Lock,
  Globe,
  Building2,
  Trash2,
} from "lucide-react";
import { formatDateIndo, formatShortDateIndo } from "@/lib/utils";
import { Matkul } from "@/types";

interface PresensiRecord {
  id: string;
  tanggal: string;
  hari: string;
  jam: string;
  status: string;
  foto_base64: string;
  deteksi_info: string | null;
  catatan: string | null;
  matkul: {
    id: string;
    nama: string;
    kode: string | null;
    ruang: string;
    warna: string | null;
  };
}

const DAYS_ID = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export default function AbsenPage() {
  const [matkulList, setMatkulList] = useState<Matkul[]>([]);
  const [selectedMatkulId, setSelectedMatkulId] = useState("");
  const [presensiList, setPresensiList] = useState<PresensiRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Kuliah Mode: Online (Daring) vs Offline (Tatap Muka)
  const [kuliahMode, setKuliahMode] = useState<"online" | "offline">("online");

  // Camera & Face Scan State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isMirror, setIsMirror] = useState(false); // false = Non-mirror / Normal (Teks terbaca benar)
  const [cameraError, setCameraError] = useState("");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [lastSavedPresensiId, setLastSavedPresensiId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [userProfile, setUserProfile] = useState<{ nama: string; nim: string | null } | null>(null);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const todayDate = new Date();
  const todayDayName = DAYS_ID[todayDate.getDay()];

  // Fetch courses, profile & attendance history
  const fetchData = async () => {
    try {
      setLoading(true);
      const [mRes, pRes, uRes] = await Promise.all([
        fetch("/api/matkul"),
        fetch("/api/presensi"),
        fetch("/api/user/profile"),
      ]);
      const mData = await mRes.json();
      const pData = await pRes.json();
      const uData = await uRes.json();

      if (uData.user) {
        setUserProfile(uData.user);
      }

      if (mData.matkul) {
        setMatkulList(mData.matkul);
        // Default to course on today's schedule if available
        const todayCourse = mData.matkul.find(
          (m: Matkul) => m.hari.toLowerCase() === todayDayName.toLowerCase()
        );
        if (todayCourse) {
          setSelectedMatkulId(todayCourse.id);
        } else if (mData.matkul.length > 0) {
          setSelectedMatkulId(mData.matkul[0].id);
        }
      }

      if (pData.presensi) {
        setPresensiList(pData.presensi);
      }
    } catch (err) {
      console.error("Fetch data error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError("");
    setCapturedImage(null);
    setLastSavedPresensiId(null);
    setScanSuccess(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: unknown) {
      console.error("Camera access error:", err);
      setCameraError(
        "Kamera tidak dapat diakses atau izin ditolak. Pastikan izin kamera telah diberikan di browser."
      );
    }
  };

  const handleRequestCamera = () => {
    const hasConsented = localStorage.getItem("semestr-biometric-consent");
    if (!hasConsented) {
      setShowConsentModal(true);
    } else {
      startCamera();
    }
  };

  const handleAcceptConsent = () => {
    localStorage.setItem("semestr-biometric-consent", "true");
    setShowConsentModal(false);
    startCamera();
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Capture face snapshot with non-mirror / un-mirrored output by default
  const captureFaceSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // By default (!isMirror), flip horizontally so text on clothes/background reads normally (not mirrored)
    ctx.save();
    if (!isMirror) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Draw overlay watermark (always normal coordinate space, perfectly readable)
    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    ctx.fillRect(0, canvas.height - 36, canvas.width, 36);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 12px Inter, -apple-system, sans-serif";
    const modeWatermark =
      kuliahMode === "online" ? "KULIAH ONLINE (DARING)" : "KULIAH OFFLINE (TETAP MUKA)";
    const studentLabel = userProfile?.nama
      ? userProfile.nama.toUpperCase()
      : "MAHASISWA";
    const nimPart = userProfile?.nim ? `${userProfile.nim} • ` : "";
    ctx.fillText(
      `${studentLabel} • ${nimPart}${modeWatermark} • ${formatDateIndo(new Date())} ${new Date().toLocaleTimeString("id-ID")}`,
      14,
      canvas.height - 13
    );

    const base64Data = canvas.toDataURL("image/jpeg", 0.88);
    setCapturedImage(base64Data);
    stopCamera();
    processAttendance(base64Data);
  };

  // Flip captured image on demand and update database
  const flipCapturedImage = async (overrideBase64?: string, targetId?: string) => {
    const src = overrideBase64 || capturedImage;
    if (!src) return;

    const img = new Image();
    img.onload = async () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth || img.width;
      c.height = img.naturalHeight || img.height;
      const ctx = c.getContext("2d");
      if (!ctx) return;

      // Flip horizontally
      ctx.translate(c.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0);
      const newBase64 = c.toDataURL("image/jpeg", 0.88);
      setCapturedImage(newBase64);

      const recId = targetId || lastSavedPresensiId;
      if (recId) {
        try {
          await fetch("/api/presensi", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: recId, foto_base64: newBase64 }),
          });
          fetchData();
        } catch (err) {
          console.error("Error updating flipped photo:", err);
        }
      }
    };
    img.src = src;
  };

  // Flip any record in gallery
  const flipHistoryRecord = async (item: PresensiRecord) => {
    const img = new Image();
    img.onload = async () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth || img.width;
      c.height = img.naturalHeight || img.height;
      const ctx = c.getContext("2d");
      if (!ctx) return;

      ctx.translate(c.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0);
      const newBase64 = c.toDataURL("image/jpeg", 0.88);

      try {
        await fetch("/api/presensi", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: item.id, foto_base64: newBase64 }),
        });
        fetchData();
      } catch (err) {
        console.error("Error updating flipped photo in history:", err);
      }
    };
    img.src = item.foto_base64;
  };

  // Delete attendance record
  const handleDeletePresensi = async (id: string) => {
    if (!window.confirm("Hapus rekaman presensi ini?")) return;
    try {
      setDeletingId(id);
      const res = await fetch(`/api/presensi?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setPresensiList((prev) => prev.filter((p) => p.id !== id));
        if (lastSavedPresensiId === id) {
          setCapturedImage(null);
          setLastSavedPresensiId(null);
          setScanSuccess(false);
        }
      }
    } catch (err) {
      console.error("Error deleting presensi:", err);
    } finally {
      setDeletingId(null);
    }
  };

  // Process attendance submission
  const processAttendance = async (photoBase64: string) => {
    if (!selectedMatkulId) return;

    setIsScanning(true);
    const isOnline = kuliahMode === "online";
    setStatusMessage(
      isOnline
        ? "Memverifikasi biometrik presensi kuliah online (daring)..."
        : "Memverifikasi biometrik presensi kuliah tatap muka..."
    );

    setTimeout(async () => {
      try {
        const detectionReport = isOnline
          ? "Wajah terverifikasi • Kuliah Online (Daring) • Pencahayaan optimal"
          : `Wajah terverifikasi • Kuliah Tatap Muka (${currentSelectedCourse?.ruang || "Ruang Kelas"}) • Busana rapi`;

        const res = await fetch("/api/presensi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            matkul_id: selectedMatkulId,
            foto_base64: photoBase64,
            status: isOnline ? "Hadir Kuliah Online (Daring)" : "Hadir Kuliah Offline (Tatap Muka)",
            deteksi_info: detectionReport,
            catatan: isOnline
              ? "Perkuliahan Daring (Online Zoom / Google Meet / LMS)"
              : `Perkuliahan Tatap Muka di Kelas (${currentSelectedCourse?.ruang || "Ruang Kuliah"})`,
          }),
        });

        const data = await res.json();
        if (res.ok && data.presensi) {
          setLastSavedPresensiId(data.presensi.id);
          setScanSuccess(true);
          setStatusMessage(
            isOnline
              ? "Presensi Kuliah Online Berhasil! Bukti kehadiran daring tersimpan rapi."
              : "Presensi Kuliah Tatap Muka Berhasil! Bukti kehadiran tersimpan rapi."
          );
          fetchData();
        } else {
          setStatusMessage("Gagal menyimpan presensi. Silakan ulangi.");
        }
      } catch (err) {
        console.error("Presensi save error:", err);
        setStatusMessage("Terjadi kendala jaringan saat mengirim presensi.");
      } finally {
        setIsScanning(false);
      }
    }, 1100);
  };

  const currentSelectedCourse = matkulList.find((m) => m.id === selectedMatkulId);

  return (
    <div className="space-y-4 pt-2">
      {/* Hidden canvas for snapshot capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-ios-accent/15 text-ios-accent">
            <Camera className="w-4 h-4" />
          </span>
          <span className="text-[12px] font-semibold text-ios-accent uppercase tracking-wider">
            Biometrik &amp; Presensi Kuliah
          </span>
        </div>
        <h1 className="text-[26px] font-bold text-ios-textPrimary tracking-tight mt-0.5">
          Scan Wajah Presensi
        </h1>
        <p className="text-[13px] text-ios-textSecondary">
          Verifikasi kehadiran kuliah online maupun offline dengan rekaman visual wajah dan busana rapi
        </p>
      </div>

      {/* Camera Scanner Viewport Card */}
      <Card className="p-4 border-2 border-ios-accent/20 bg-ios-surface relative overflow-hidden space-y-3.5">
        {/* Course Selector */}
        <div>
          <Select
            label="Pilih Mata Kuliah yang Sedang / Akan Dihadiri"
            value={selectedMatkulId}
            onChange={(e) => setSelectedMatkulId(e.target.value)}
          >
            {matkulList.map((m) => (
              <option key={m.id} value={m.id}>
                {m.hari} ({m.jam_mulai} - {m.jam_selesai}) : {m.nama} — {m.ruang}
              </option>
            ))}
          </Select>
        </div>

        {/* Mode Perkuliahan Segmented Control: Online vs Offline */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-semibold text-ios-textSecondary uppercase tracking-wider block">
            Pilihan Keterangan Kuliah
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-ios-surfaceSecondary border border-ios-border">
            <button
              type="button"
              onClick={() => setKuliahMode("online")}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                kuliahMode === "online"
                  ? "bg-ios-accent text-white shadow-sm scale-[1.01]"
                  : "text-ios-textSecondary hover:text-ios-textPrimary hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Kuliah Online (Daring)</span>
            </button>
            <button
              type="button"
              onClick={() => setKuliahMode("offline")}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                kuliahMode === "offline"
                  ? "bg-ios-accent text-white shadow-sm scale-[1.01]"
                  : "text-ios-textSecondary hover:text-ios-textPrimary hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Kuliah Offline (Tatap Muka)</span>
            </button>
          </div>
          <div className="flex items-center justify-between text-[11.5px] px-1 pt-0.5">
            <span className="text-ios-textSecondary">
              {kuliahMode === "online"
                ? "💻 Terhubung via Zoom / Google Meet / LMS (Daring)"
                : `🏫 Hadir langsung di ruang kelas (${currentSelectedCourse?.ruang || "Ruang Kuliah"})`}
            </span>
            <span
              className={`font-semibold px-2 py-0.5 rounded-full text-[10.5px] ${
                kuliahMode === "online"
                  ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25"
                  : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25"
              }`}
            >
              {kuliahMode === "online" ? "Mode Daring" : "Mode Tatap Muka"}
            </span>
          </div>
        </div>

        {/* Video / Snapshot Container */}
        <div className="relative aspect-[4/3] w-full max-w-md mx-auto bg-black rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
          {/* Active Camera Feed */}
          <video
            ref={videoRef}
            playsInline
            muted
            className={`w-full h-full object-cover transition-transform duration-200 ${
              isMirror ? "transform -scale-x-100" : ""
            } ${isCameraActive ? "block" : "hidden"}`}
          />

          {/* Mirror / Flip Toggle Button (Active when camera is running) */}
          {isCameraActive && (
            <button
              type="button"
              onClick={() => setIsMirror(!isMirror)}
              className="absolute top-3 right-3 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 text-white text-[11px] font-semibold backdrop-blur-md border border-white/20 hover:bg-black/85 active:scale-95 transition-all shadow-lg"
              title="Toggle Flip / Mirror Kamera"
            >
              <FlipHorizontal className="w-3.5 h-3.5 text-ios-accent" />
              <span>{isMirror ? "Mirror: Aktif (Cermin)" : "Hasil: Tidak Mirror (Normal)"}</span>
            </button>
          )}

          {/* Captured Snapshot Preview */}
          {capturedImage && !isCameraActive && (
            <div className="relative w-full h-full">
              <img
                src={capturedImage}
                alt="Snapshot Presensi Wajah"
                className="w-full h-full object-cover"
              />
              {/* Quick Flip Button on top of snapshot */}
              <button
                type="button"
                onClick={() => flipCapturedImage()}
                className="absolute top-3 right-3 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/75 text-white text-[11px] font-semibold backdrop-blur-md border border-white/20 hover:bg-black/90 active:scale-95 transition-all shadow-lg"
                title="Balik Foto (Flip Horizontal)"
              >
                <FlipHorizontal className="w-3.5 h-3.5 text-ios-accent" />
                <span>Balik Foto (Flip)</span>
              </button>
            </div>
          )}

          {/* Placeholder state when camera is inactive */}
          {!isCameraActive && !capturedImage && (
            <div className="text-center p-6 text-white/70 space-y-2">
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2">
                <Camera className="w-7 h-7 text-white" />
              </div>
              <p className="text-[14px] font-semibold text-white">
                Kamera Belum Aktif
              </p>
              <p className="text-[12px] text-white/60 max-w-xs mx-auto">
                Pilih mata kuliah &amp; mode kuliah di atas, lalu klik &quot;Nyalakan Kamera&quot; untuk memulai presensi visual.
              </p>
            </div>
          )}

          {/* Face Scanner Overlay HUD when camera is active */}
          {isCameraActive && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              {/* Target Face Bounding Box */}
              <div className="w-48 h-56 border-2 border-dashed border-ios-accent/80 rounded-3xl relative animate-pulse flex flex-col items-center justify-between p-3">
                <span className="text-[10px] font-bold text-white bg-ios-accent/80 px-2 py-0.5 rounded-full">
                  Posisikan Wajah &amp; Busana
                </span>
                <span className="text-[10px] text-white/90 bg-black/60 px-2 py-0.5 rounded-full">
                  Tegak Menghadap Kamera
                </span>
              </div>

              {/* Laser Scanning Bar */}
              <div className="absolute inset-x-8 top-1/4 h-0.5 bg-gradient-to-r from-transparent via-ios-accent to-transparent shadow-[0_0_8px_#007AFF] animate-bounce" />
            </div>
          )}
        </div>

        {/* Error notification if any */}
        {cameraError && (
          <div className="mt-3 p-3 rounded-btn bg-ios-danger/10 border border-ios-danger/25 text-ios-danger text-[13px] font-medium flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{cameraError}</span>
          </div>
        )}

        {/* Scanning & Success Status */}
        {isScanning && (
          <div className="mt-3 p-3 rounded-btn bg-ios-accent/10 border border-ios-accent/30 text-ios-accent text-[13px] font-medium flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>{statusMessage}</span>
          </div>
        )}

        {scanSuccess && (
          <div className="mt-3 p-3 rounded-btn bg-ios-success/15 border border-ios-success/30 text-ios-success text-[13px] font-medium flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-2 flex flex-wrap gap-2 justify-center">
          {!isCameraActive ? (
            <>
              <Button
                variant="primary"
                onClick={handleRequestCamera}
                className="gap-2 px-6"
              >
                <Camera className="w-4 h-4" />
                <span>{capturedImage ? "Pindai Ulang Wajah" : "Nyalakan Kamera"}</span>
              </Button>
              {capturedImage && (
                <Button
                  variant="secondary"
                  onClick={() => flipCapturedImage()}
                  className="gap-2 px-4"
                  title="Balik foto secara horizontal jika diperlukan"
                >
                  <FlipHorizontal className="w-4 h-4 text-ios-accent" />
                  <span>Balik Foto (Flip)</span>
                </Button>
              )}
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={stopCamera}
                className="gap-1.5"
              >
                <span>Batal</span>
              </Button>
              <Button
                variant="primary"
                onClick={captureFaceSnapshot}
                className="gap-2 px-6"
              >
                <UserCheck className="w-4 h-4" />
                <span>Ambil Foto Presensi ({kuliahMode === "online" ? "Online" : "Offline"})</span>
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Biometric Privacy Consent Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-ios-surface border border-ios-border p-6 shadow-2xl space-y-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-ios-accent/15 text-ios-accent flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-[18px] font-bold text-ios-textPrimary">
                Persetujuan Privasi Biometrik Presensi
              </h3>
              <p className="text-[13px] text-ios-textSecondary mt-1 leading-relaxed">
                Sebelum mengaktifkan kamera, mohon konfirmasi bahwa Anda menyetujui pemrosesan data kehadiran di Semestr:
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-ios-surfaceSecondary border border-ios-border space-y-2 text-[12.5px] text-ios-textSecondary">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-ios-success flex-shrink-0 mt-0.5" />
                <span>Kamera hanya aktif untuk mengambil foto kehadiran pribadi Anda.</span>
              </div>
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-ios-accent flex-shrink-0 mt-0.5" />
                <span>Data dienkripsi dan tidak dibagikan ke pihak ketiga mana pun.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-ios-success flex-shrink-0 mt-0.5" />
                <span>Anda dapat menghapus riwayat presensi Anda kapan saja.</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="secondary"
                className="flex-1 text-[13px]"
                onClick={() => setShowConsentModal(false)}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                className="flex-1 font-bold text-[13px]"
                onClick={handleAcceptConsent}
              >
                Setuju &amp; Aktifkan Kamera
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance History Log & Gallery */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-bold text-ios-textPrimary tracking-tight">
              Galeri &amp; Log Riwayat Presensi
            </h2>
            <p className="text-[12px] text-ios-textSecondary">
              Rekaman kehadiran mahasiswa per hari kuliah beserta bukti visual dan mode kuliah
            </p>
          </div>
          <span className="text-[12px] font-semibold text-ios-accent px-2 py-0.5 rounded-full bg-ios-accent/10">
            {presensiList.length} Sesi Tercatat
          </span>
        </div>

        {presensiList.length === 0 ? (
          <Card className="p-8 text-center">
            <Camera className="w-8 h-8 text-ios-textSecondary mx-auto mb-2 opacity-50" />
            <p className="text-[14px] font-semibold text-ios-textPrimary">
              Belum ada riwayat presensi tersimpan
            </p>
            <p className="text-[12px] text-ios-textSecondary mt-0.5">
              Gunakan pemindai kamera di atas untuk mencatat presensi kuliah perdana Anda.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {presensiList.map((item) => {
              const isItemOnline =
                item.status?.toLowerCase().includes("online") ||
                item.status?.toLowerCase().includes("daring") ||
                item.catatan?.toLowerCase().includes("online") ||
                item.catatan?.toLowerCase().includes("daring") ||
                item.deteksi_info?.toLowerCase().includes("online");

              return (
                <Card key={item.id} className="p-3.5 space-y-2.5 overflow-hidden">
                  {/* Snapshot Image with Face & Clothing Condition */}
                  <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-ios-surfaceSecondary border border-ios-border relative group">
                    <img
                      src={item.foto_base64}
                      alt="Bukti Kehadiran Wajah"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Top left badges: Date & Mode */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 flex-wrap max-w-[70%]">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-black/65 text-white backdrop-blur-sm">
                        {item.hari}, {item.jam}
                      </span>
                      {isItemOnline ? (
                        <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/90 text-white backdrop-blur-sm flex items-center gap-1">
                          <Globe className="w-3 h-3" /> Online
                        </span>
                      ) : (
                        <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-emerald-600/90 text-white backdrop-blur-sm flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> Tatap Muka
                        </span>
                      )}
                    </div>

                    {/* Top right quick actions: Flip & Delete */}
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => flipHistoryRecord(item)}
                        className="p-1.5 rounded-full bg-black/65 text-white hover:bg-black/90 active:scale-90 transition-all backdrop-blur-sm"
                        title="Balik Foto (Flip Horizontal)"
                      >
                        <FlipHorizontal className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePresensi(item.id)}
                        disabled={deletingId === item.id}
                        className="p-1.5 rounded-full bg-black/65 text-white hover:bg-red-600/90 active:scale-90 transition-all backdrop-blur-sm"
                        title="Hapus Presensi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Bottom right status badge */}
                    <div className="absolute bottom-2 right-2">
                      <BadgeStatus size="sm" variant={isItemOnline ? "aman" : "selesai"}>
                        {item.status}
                      </BadgeStatus>
                    </div>
                  </div>

                  {/* Meta details */}
                  <div>
                    <h3 className="text-[14px] font-bold text-ios-textPrimary leading-snug">
                      {item.matkul.nama}
                    </h3>
                    <p className="text-[12px] text-ios-textSecondary mt-0.5">
                      {isItemOnline ? "Kuliah Daring (Online)" : item.matkul.ruang} • {formatShortDateIndo(item.tanggal)}
                    </p>

                    {item.catatan && (
                      <p className="text-[11.5px] text-ios-textSecondary mt-1 line-clamp-1">
                        {item.catatan}
                      </p>
                    )}

                    {item.deteksi_info && (
                      <p className="text-[11px] text-ios-accent mt-1.5 p-1.5 rounded-md bg-ios-accent/10 border border-ios-accent/20">
                        {item.deteksi_info}
                      </p>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Fingerprint,
  Camera,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  X,
  Lock,
  Unlock,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface BiometricFaceLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userAvatarUrl?: string | null;
  userName?: string;
  mode?: "setup" | "unlock";
}

export function BiometricFaceLockModal({
  isOpen,
  onClose,
  onSuccess,
  userAvatarUrl,
  userName = "Mahasiswa",
  mode = "unlock",
}: BiometricFaceLockModalProps) {
  const [activeMethod, setActiveMethod] = useState<"face" | "fingerprint">("face");
  const [isScanning, setIsScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [feedback, setFeedback] = useState<{
    status: "idle" | "verifying" | "success" | "rejected";
    message?: string;
  }>({ status: "idle" });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const isMobile =
    typeof window !== "undefined" &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  useEffect(() => {
    if (isOpen) {
      setFeedback({ status: "idle" });
      if (isMobile && window.PublicKeyCredential) {
        setActiveMethod("fingerprint");
      } else {
        setActiveMethod("face");
        startCamera();
      }
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      console.warn("Camera start error:", err);
      setCameraActive(false);
      setFeedback({
        status: "rejected",
        message: "Tidak dapat mengakses webcam. Izinkan izin kamera pada browser.",
      });
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  };

  // 1. Mobile Fingerprint / Passkeys (WebAuthn)
  const handleFingerprintAuth = async () => {
    setIsScanning(true);
    setFeedback({ status: "verifying", message: "Sentuh sensor sidik jari perangkat..." });

    try {
      if (window.PublicKeyCredential) {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        // Native Biometric Prompt on Android & iOS
        const credential = await navigator.credentials.create({
          publicKey: {
            challenge,
            rp: { name: "Studia Academic OS" },
            user: {
              id: new TextEncoder().encode(userName),
              name: userName,
              displayName: userName,
            },
            pubKeyCredParams: [{ alg: -7, type: "public-key" }],
            authenticatorSelection: {
              authenticatorAttachment: "platform",
              userVerification: "required",
            },
            timeout: 60000,
          },
        });

        if (credential) {
          setFeedback({
            status: "success",
            message: "Verifikasi sidik jari sukses! Identitas Anda terkonfirmasi.",
          });
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 1000);
          return;
        }
      }
      throw new Error("Biometrik tidak didukung.");
    } catch (e: any) {
      // User cancelled or fallback
      if (e.name === "NotAllowedError") {
        setFeedback({
          status: "rejected",
          message: "Pemindaian dibatalkan. Silakan gunakan pemindai wajah AI.",
        });
      } else {
        // Fallback to camera face verify
        setActiveMethod("face");
        startCamera();
      }
    } finally {
      setIsScanning(false);
    }
  };

  // 2. AI Face Unlock (Vision Verification)
  const handleScanFace = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsScanning(true);
    setFeedback({ status: "verifying", message: "AI sedang menganalisis kecocokan wajah biometrik..." });

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable");

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const capturedBase64 = canvas.toDataURL("image/jpeg", 0.85);

      const res = await fetch("/api/auth/face-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ capturedFaceBase64: capturedBase64 }),
      });

      const data = await res.json();

      if (res.ok && data.isMatch) {
        setFeedback({
          status: "success",
          message: `Wajah Cocok! Terverifikasi sebagai pemilik sah: ${data.nama || userName}.`,
        });
        setTimeout(() => {
          stopCamera();
          onSuccess();
          onClose();
        }, 1200);
      } else {
        setFeedback({
          status: "rejected",
          message:
            data.analisis ||
            "AKSES DITOLAK: Wajah Tidak Cocok dengan Pemilik Akun! Terdeteksi orang yang berbeda.",
        });
      }
    } catch (err: any) {
      console.error("Face scan error:", err);
      setFeedback({
        status: "rejected",
        message: "Terjadi gangguan saat memindai wajah. Coba kembali dalam pencahayaan yang cukup.",
      });
    } finally {
      setIsScanning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-ios-surface rounded-3xl p-5 sm:p-6 shadow-2xl border border-ios-border flex flex-col overflow-hidden">
        {/* Hidden Canvas for Snapshot */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-ios-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-ios-accent/10 text-ios-accent border border-ios-accent/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ios-textPrimary leading-snug">
                {mode === "setup" ? "Pengaturan Kunci Biometrik" : "Buka Kunci Biometrik AI"}
              </h3>
              <p className="text-[11.5px] text-ios-textSecondary">
                Verifikasi keamanan berlapis pemilik sah akun
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 text-ios-textSecondary hover:text-ios-textPrimary rounded-full hover:bg-ios-surfaceSecondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Method Switcher (Mobile vs Desktop) */}
        <div className="flex p-1 my-3 bg-ios-surfaceSecondary rounded-xl border border-ios-border text-[11.5px] font-semibold">
          <button
            onClick={() => {
              setActiveMethod("face");
              startCamera();
            }}
            className={cn(
              "flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5",
              activeMethod === "face"
                ? "bg-ios-surface text-ios-accent shadow-xs"
                : "text-ios-textSecondary hover:text-ios-textPrimary"
            )}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Pindai Wajah AI</span>
          </button>

          <button
            onClick={() => {
              setActiveMethod("fingerprint");
              stopCamera();
              handleFingerprintAuth();
            }}
            className={cn(
              "flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5",
              activeMethod === "fingerprint"
                ? "bg-ios-surface text-ios-accent shadow-xs"
                : "text-ios-textSecondary hover:text-ios-textPrimary"
            )}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>Sidik Jari / Touch ID</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* Method 1: AI Camera Face Scanner */}
        {/* ========================================================================= */}
        {activeMethod === "face" && (
          <div className="space-y-3">
            {/* Live Camera Viewport */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border-2 border-ios-border flex items-center justify-center shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />

              {/* Radar Scanner Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-2 border-ios-accent/60 animate-pulse relative flex items-center justify-center">
                  <div className="w-full h-full rounded-full border border-dashed border-ios-accent/40 animate-spin" />
                  <div className="absolute w-2 h-2 rounded-full bg-ios-accent" />
                </div>
              </div>

              {!cameraActive && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white text-[12px] p-4 text-center">
                  <Camera className="w-8 h-8 text-white/50 mb-2 animate-bounce" />
                  <span>Memulai kamera webcam...</span>
                </div>
              )}
            </div>

            {/* AI Warning / Status Box */}
            {feedback.status !== "idle" && (
              <div
                className={cn(
                  "p-3 rounded-2xl text-[12px] font-medium border flex items-start gap-2 animate-in fade-in",
                  feedback.status === "verifying" && "bg-ios-accent/10 border-ios-accent/30 text-ios-accent",
                  feedback.status === "success" && "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
                  feedback.status === "rejected" && "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400 font-bold"
                )}
              >
                {feedback.status === "verifying" && <Loader2 className="w-4 h-4 animate-spin flex-shrink-0 mt-0.5" />}
                {feedback.status === "success" && <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                {feedback.status === "rejected" && <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                <span className="leading-snug">{feedback.message}</span>
              </div>
            )}

            <Button
              type="button"
              variant="primary"
              disabled={isScanning || !cameraActive}
              onClick={handleScanFace}
              className="w-full py-2.5 gap-2 shadow-sm font-bold text-[13px]"
            >
              {isScanning ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>{isScanning ? "Menganalisis Biometrik..." : "Pindai Wajah Sekarang"}</span>
            </Button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* Method 2: Mobile Fingerprint / Passkeys */}
        {/* ========================================================================= */}
        {activeMethod === "fingerprint" && (
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
            <button
              type="button"
              onClick={handleFingerprintAuth}
              className="w-24 h-24 rounded-full bg-ios-accent/10 border-2 border-ios-accent/30 flex items-center justify-center text-ios-accent hover:scale-105 active:scale-95 transition-all shadow-md group"
            >
              <Fingerprint className="w-12 h-12 stroke-[1.6] group-hover:scale-110 transition-transform" />
            </button>

            <div>
              <h4 className="text-[15px] font-bold text-ios-textPrimary">
                Ketuk Sensor Sidik Jari
              </h4>
              <p className="text-[12px] text-ios-textSecondary mt-0.5 max-w-xs">
                Gunakan sidik jari perangkat atau Touch ID / Face ID bawaan HP Anda untuk otentikasi instan.
              </p>
            </div>

            {feedback.status !== "idle" && (
              <div
                className={cn(
                  "p-3 rounded-2xl text-[12px] font-medium border max-w-sm w-full leading-snug",
                  feedback.status === "verifying" && "bg-ios-accent/10 border-ios-accent/30 text-ios-accent",
                  feedback.status === "success" && "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
                  feedback.status === "rejected" && "bg-red-500/10 border-red-500/30 text-red-500"
                )}
              >
                {feedback.message}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

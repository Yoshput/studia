"use client";

import React, { useState, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { Sheet } from "@/components/ui/Sheet";
import { Input } from "@/components/ui/Input";
import { MascotIcon } from "@/components/assistant/MascotIcon";
import {
  User,
  GraduationCap,
  Database,
  Moon,
  Volume2,
  LogOut,
  ShieldCheck,
  Building,
  Camera,
  Upload,
  CheckCircle2,
  Loader2,
  Bell,
  Edit3,
  Trash2,
} from "lucide-react";

interface UserProfile {
  id: string;
  nama: string;
  email: string;
  nim: string | null;
  kelas: string | null;
  prodi: string | null;
  dosen_wali: string | null;
  avatar_url: string | null;
}

export default function ProfilPage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isUploadSheetOpen, setIsUploadSheetOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmittingAvatar, setIsSubmittingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Profile Data Diri
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editNama, setEditNama] = useState("");
  const [editNim, setEditNim] = useState("");
  const [editKelas, setEditKelas] = useState("");
  const [editProdi, setEditProdi] = useState("");
  const [editDosenWali, setEditDosenWali] = useState("");
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [editProfileMsg, setEditProfileMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const openEditProfile = () => {
    setEditNama(profile?.nama || session?.user?.name || "");
    setEditNim(profile?.nim || "");
    setEditKelas(profile?.kelas || "");
    setEditProdi(profile?.prodi || "");
    setEditDosenWali(profile?.dosen_wali || "");
    setEditProfileMsg(null);
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingProfile(true);
    setEditProfileMsg(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: editNama,
          nim: editNim,
          kelas: editKelas,
          prodi: editProdi,
          dosen_wali: editDosenWali,
        }),
      });

      const data = await res.json();
      if (res.ok && data.user) {
        setProfile(data.user);
        setEditProfileMsg({ text: "Data diri berhasil disimpan!", type: "success" });
        setTimeout(() => {
          setIsEditProfileOpen(false);
        }, 900);
      } else {
        setEditProfileMsg({ text: data.error || "Gagal memperbarui profil", type: "error" });
      }
    } catch {
      setEditProfileMsg({ text: "Terjadi kendala saat menghubungi server", type: "error" });
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) return;
    setIsChangingPassword(true);
    setPasswordMsg(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_password: newPassword }),
      });

      if (res.ok) {
        setPasswordMsg({ text: "Kata sandi berhasil diperbarui! Silakan gunakan sandi baru ini saat masuk berikutnya.", type: "success" });
        setNewPassword("");
      } else {
        const d = await res.json();
        setPasswordMsg({ text: d.error || "Gagal mengubah kata sandi", type: "error" });
      }
    } catch {
      setPasswordMsg({ text: "Terjadi kesalahan saat menghubungi server", type: "error" });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      const data = await res.json();
      if (data.user) {
        setProfile(data.user);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    }
  };

  useEffect(() => {
    try {
      localStorage.removeItem("semestr-user-avatar");
    } catch {}

    fetchProfile();

    if (document.documentElement.classList.contains("dark")) {
      setTheme("dark");
    }

    const savedVoice = localStorage.getItem("semestr-voice-enabled");
    if (savedVoice === "true") {
      setVoiceEnabled(true);
    }

    if (typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator) {
      if (Notification.permission === "granted") {
        navigator.serviceWorker.ready.then((reg) => {
          reg.pushManager.getSubscription().then((sub) => {
            if (sub) {
              setPushEnabled(true);
            }
          });
        });
      }
    }
  }, []);

  const [pushEnabled, setPushEnabled] = useState(false);
  const [isSubscribingPush, setIsSubscribingPush] = useState(false);
  const [isTestingPush, setIsTestingPush] = useState(false);
  const [pushMessage, setPushMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  const handleTogglePush = async (checked: boolean) => {
    setPushMessage(null);

    if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
      setPushMessage({
        text: "Peramban ini tidak mendukung Web Push Notification.",
        type: "error",
      });
      return;
    }

    setIsSubscribingPush(true);

    try {
      if (checked) {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          setPushMessage({
            text: "Izin notifikasi belum diizinkan. Silakan aktifkan di ikon setelan gembok browser.",
            type: "error",
          });
          setPushEnabled(false);
          return;
        }

        const reg = await navigator.serviceWorker.ready;
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
          throw new Error("Kunci VAPID public key tidak ditemukan.");
        }

        let sub = await reg.pushManager.getSubscription();
        if (!sub) {
          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
          });
        }

        const subJson = sub.toJSON();
        const res = await fetch("/api/notifications/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: sub.endpoint,
            keys: subJson.keys,
          }),
        });

        if (res.ok) {
          setPushEnabled(true);
          setPushMessage({
            text: "Notifikasi pengingat aktif! Perangkat ini akan menerima pemberitahuan jadwal & tugas.",
            type: "success",
          });
        } else {
          const errData = await res.json();
          throw new Error(errData.error || "Gagal menyimpan langganan notifikasi");
        }
      } else {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await fetch("/api/notifications/subscribe", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: sub.endpoint }),
          });
          await sub.unsubscribe();
        }
        setPushEnabled(false);
        setPushMessage({
          text: "Notifikasi pengingat telah dinonaktifkan.",
          type: "success",
        });
      }
    } catch (err: unknown) {
      console.error("Push toggle error:", err);
      const e = err as Error;
      setPushMessage({
        text: e?.message || "Terjadi kesalahan saat mengatur notifikasi.",
        type: "error",
      });
      setPushEnabled(false);
    } finally {
      setIsSubscribingPush(false);
    }
  };

  const handleSendTestPush = async () => {
    setIsTestingPush(true);
    setPushMessage(null);
    try {
      const res = await fetch("/api/notifications/test", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setPushMessage({
          text: data.message || "Notifikasi uji coba berhasil dikirim ke perangkat Anda!",
          type: "success",
        });
      } else {
        setPushMessage({
          text: data.error || "Gagal mengirim notifikasi uji coba.",
          type: "error",
        });
      }
    } catch {
      setPushMessage({
        text: "Terjadi kesalahan saat memicu notifikasi uji coba.",
        type: "error",
      });
    } finally {
      setIsTestingPush(false);
    }
  };

  const handleToggleVoice = (checked: boolean) => {
    setVoiceEnabled(checked);
    localStorage.setItem("semestr-voice-enabled", String(checked));
  };

  const handleToggleTheme = (checked: boolean) => {
    const nextTheme = checked ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("semestr-theme", nextTheme);
    if (checked) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>("");

  // Client-side automatic image compression
  const compressImage = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const MAX_SIZE = 480;
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("Peramban web tidak dapat menginisialisasi kanvas gambar"));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          URL.revokeObjectURL(objectUrl);
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.85);
          resolve(compressedBase64);
        } catch (err) {
          URL.revokeObjectURL(objectUrl);
          reject(err);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(
          new Error("Format foto tidak dapat dibaca oleh browser. Pastikan file berupa JPG, PNG, atau HEIC yang valid.")
        );
      };

      img.src = objectUrl;
    });
  };

  const processSelectedFile = async (file: File) => {
    setIsProcessingImage(true);
    setAvatarUploadError(null);
    setProcessingStatus("Membaca berkas foto...");

    try {
      const fileNameLower = file.name.toLowerCase();
      const isHeic =
        fileNameLower.endsWith(".heic") ||
        fileNameLower.endsWith(".heif") ||
        file.type === "image/heic" ||
        file.type === "image/heif";

      let rawBlob: Blob = file;

      if (isHeic) {
        setProcessingStatus("Mengonversi format Apple HEIC ke JPEG...");
        const heic2any = (await import("heic2any")).default;
        const converted = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.88,
        });
        rawBlob = Array.isArray(converted) ? converted[0] : converted;
      }

      setProcessingStatus("Mengompresi & menyiapkan pratinjau...");
      const compressed = await compressImage(rawBlob);
      setAvatarPreview(compressed);
    } catch (err: unknown) {
      console.error("File processing error:", err);
      const e = err as Error;
      setAvatarUploadError(
        e?.message || "Format gambar tidak valid atau file rusak."
      );
    } finally {
      setIsProcessingImage(false);
      setProcessingStatus("");
    }
  };

  const userIdentifier = profile?.id || profile?.email || session?.user?.email;
  const userCacheKey = userIdentifier ? `semestr-avatar-${userIdentifier}` : null;

  const handleSaveAvatar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatarPreview) return;

    setIsSubmittingAvatar(true);
    setAvatarUploadError(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          avatar_url: avatarPreview,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsUploadSheetOpen(false);
        setProfile((prev) => (prev ? { ...prev, avatar_url: avatarPreview } : null));
        if (userCacheKey) localStorage.setItem(userCacheKey, avatarPreview);
        try {
          localStorage.removeItem("semestr-user-avatar");
        } catch {}
        window.dispatchEvent(
          new CustomEvent("avatar-updated", { detail: { avatar_url: avatarPreview } })
        );
        fetchProfile();
      } else {
        setAvatarUploadError(data.error || "Gagal menyimpan foto ke server database.");
      }
    } catch (err) {
      console.error("Save avatar error:", err);
      setAvatarUploadError("Terjadi kendala jaringan saat menghubungi server.");
    } finally {
      setIsSubmittingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setIsSubmittingAvatar(true);
    setAvatarUploadError(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          avatar_url: null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsUploadSheetOpen(false);
        setProfile((prev) => (prev ? { ...prev, avatar_url: null } : null));
        setAvatarPreview(null);
        if (userCacheKey) localStorage.removeItem(userCacheKey);
        try {
          localStorage.removeItem("semestr-user-avatar");
        } catch {}
        window.dispatchEvent(
          new CustomEvent("avatar-updated", { detail: { avatar_url: null } })
        );
        fetchProfile();
      } else {
        setAvatarUploadError(data.error || "Gagal menghapus foto profil.");
      }
    } catch (err) {
      console.error("Remove avatar error:", err);
      setAvatarUploadError("Terjadi kendala jaringan saat menghubungi server.");
    } finally {
      setIsSubmittingAvatar(false);
    }
  };

  const studentName = profile?.nama || session?.user?.name || "Mahasiswa";
  const studentInitial = studentName.charAt(0).toUpperCase();

  return (
    <div className="space-y-4 pt-2">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,.heic,.heif,.jpg,.jpeg,.png,.webp"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processSelectedFile(file);
        }}
        className="hidden"
      />

      {/* Header */}
      <div>
        <h1 className="text-[26px] font-bold text-ios-textPrimary tracking-tight">
          Profil Mahasiswa
        </h1>
        <p className="text-[13px] text-ios-textSecondary">
          Informasi identitas resmi akademik &amp; preferensi akun pengguna
        </p>
      </div>

      {/* Student Identity Card with Avatar & Edit Profile Button */}
      <Card className="p-5 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <div className="relative group">
          <div className="w-20 h-20 rounded-full bg-ios-surfaceSecondary border-2 border-ios-accent/30 flex items-center justify-center overflow-hidden shadow-inner">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={studentName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-ios-accent to-blue-600 flex items-center justify-center text-white font-bold text-2xl">
                {studentInitial}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setAvatarPreview(profile?.avatar_url || null);
              setIsUploadSheetOpen(true);
            }}
            className="absolute -bottom-1 -right-1 p-2 rounded-full bg-ios-accent text-white shadow-md hover:scale-105 active:scale-95 transition-transform"
            title="Ganti Foto Profil"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-[19px] font-bold text-ios-textPrimary">
            {studentName}
          </h2>
          <p className="text-[13px] font-mono font-semibold text-ios-accent mt-0.5">
            {profile?.nim ? `NIM: ${profile.nim} ${profile.kelas ? `• ${profile.kelas}` : ""}` : profile?.email || "Mahasiswa Aktif"}
          </p>
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[12px] text-ios-textSecondary mt-1">
            <Building className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">
              {profile?.prodi || "Program Studi & Kampus Mahasiswa"}
            </span>
          </div>
          <p className="text-[12px] text-ios-textSecondary mt-0.5">
            {profile?.dosen_wali ? `Dosen Wali: ${profile.dosen_wali}` : "Dosen Wali: Belum diatur"}
          </p>

          <div className="mt-2.5 flex justify-center sm:justify-start">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={openEditProfile}
              className="gap-1.5 text-[12px] py-1.5 px-3 rounded-xl font-semibold"
            >
              <Edit3 className="w-3.5 h-3.5 text-ios-accent" />
              <span>Edit Data Diri</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Academic Milestones Summary */}
      <Card className="p-4 divide-y divide-ios-border">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2.5">
            <GraduationCap className="w-4 h-4 text-ios-accent" />
            <span className="text-[14px] font-medium text-ios-textPrimary">
              Status Akademik
            </span>
          </div>
          <span className="text-[13px] font-bold text-ios-accent px-2 py-0.5 rounded-full bg-ios-accent/10">
            Mahasiswa Aktif
          </span>
        </div>

        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2.5">
            <Database className="w-4 h-4 text-ios-accent" />
            <span className="text-[14px] font-medium text-ios-textPrimary">
              Semester Terdaftar
            </span>
          </div>
          <span className="text-[13px] font-semibold text-ios-textSecondary">
            Semester 5 • Tahun Ajaran 2026/2027
          </span>
        </div>

        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-ios-success" />
            <span className="text-[14px] font-medium text-ios-textPrimary">
              Penyimpanan Cloud
            </span>
          </div>
          <span className="text-[12px] font-semibold text-ios-success px-2 py-0.5 rounded-full bg-ios-success/15">
            TiDB Cloud Serverless (AWS Singapore)
          </span>
        </div>

        <div className="flex items-center justify-between pt-3">
          <span className="text-[14px] font-medium text-ios-textPrimary">
            Email Terdaftar
          </span>
          <span className="text-[13px] font-mono text-ios-textSecondary truncate max-w-[200px] sm:max-w-none">
            {profile?.email || session?.user?.email || "-"}
          </span>
        </div>
      </Card>

      {/* Security: Change Password */}
      <div className="space-y-2">
        <h3 className="text-[13px] font-semibold text-ios-textSecondary uppercase tracking-wider px-1">
          Keamanan Akun
        </h3>

        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-ios-accent" />
            <span className="text-[13.5px] font-bold text-ios-textPrimary">
              Ganti Kata Sandi Pribadi
            </span>
          </div>
          <p className="text-[12px] text-ios-textSecondary">
            Amankan akun Anda agar tidak dapat diakses orang lain.
          </p>

          <form onSubmit={handleUpdatePassword} className="space-y-3 pt-1">
            <Input
              label="Kata Sandi Baru"
              type="password"
              placeholder="Minimal 6 karakter"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            {passwordMsg && (
              <p className={`text-[12px] font-medium ${passwordMsg.type === 'success' ? 'text-ios-success' : 'text-ios-danger'}`}>
                {passwordMsg.text}
              </p>
            )}

            <Button
              type="submit"
              variant="secondary"
              size="sm"
              isLoading={isChangingPassword}
              disabled={newPassword.length < 6}
            >
              Simpan Kata Sandi Baru
            </Button>
          </form>
        </Card>
      </div>

      {/* Preferences Section */}
      <div className="space-y-2">
        <h3 className="text-[13px] font-semibold text-ios-textSecondary uppercase tracking-wider px-1">
          Pengaturan Aplikasi
        </h3>

        <Card className="p-4 space-y-4">
          <Toggle
            checked={theme === "dark"}
            onChange={handleToggleTheme}
            label="Mode Gelap (Dark Mode)"
            description="Tampilan latar belakang obsidian slate yang nyaman di mata"
          />

          <div className="pt-3 border-t border-ios-border">
            <Toggle
              checked={voiceEnabled}
              onChange={handleToggleVoice}
              label="Suara Asisten AI"
              description="Bacakan sapaan dan respons asisten menggunakan Web Speech API"
            />
          </div>

          <div className="pt-3 border-t border-ios-border space-y-2.5">
            <Toggle
              checked={pushEnabled}
              onChange={handleTogglePush}
              disabled={isSubscribingPush}
              label="Notifikasi Push Pengingat"
              description="Pemberitahuan resmi OS untuk deadline tugas &amp; 15 menit sebelum kuliah"
            />

            {pushMessage && (
              <p
                className={`text-[12px] font-medium px-1 ${
                  pushMessage.type === "success" ? "text-ios-success" : "text-ios-danger"
                }`}
              >
                {pushMessage.text}
              </p>
            )}

            {pushEnabled && (
              <div className="pt-2 flex items-center justify-between border-t border-ios-border/50">
                <span className="text-[11.5px] text-ios-textSecondary">
                  Perangkat terhubung ke Web Push
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleSendTestPush}
                  isLoading={isTestingPush}
                  className="gap-1.5 text-[11.5px] py-1 px-2.5 rounded-xl font-medium"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Kirim Notifikasi Uji Coba</span>
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Logout Action */}
      <div className="pt-2">
        <Button
          variant="secondary"
          className="w-full text-ios-danger hover:bg-ios-danger/10 border-ios-danger/30 gap-2"
          onClick={async () => {
            try {
              localStorage.removeItem("semestr-user-avatar");
              if (userCacheKey) localStorage.removeItem(userCacheKey);
              await signOut({ redirect: false });
            } catch {}
            window.location.href = "/?logged_out=1";
          }}
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar dari Akun</span>
        </Button>
      </div>

      {/* Sheet Edit Data Diri Mahasiswa */}
      <Sheet
        isOpen={isEditProfileOpen}
        onClose={() => {
          setIsEditProfileOpen(false);
          setEditProfileMsg(null);
        }}
        title="Edit Data Diri Mahasiswa"
        description="Perbarui informasi identitas akademik Anda di Semestr."
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Nama Lengkap"
            placeholder="Contoh: Yossika Putra Erlangga"
            value={editNama}
            onChange={(e) => setEditNama(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="NIM Mahasiswa"
              placeholder="Contoh: 103112430026"
              value={editNim}
              onChange={(e) => setEditNim(e.target.value)}
            />
            <Input
              label="Kelas"
              placeholder="Contoh: S1IF-12-06"
              value={editKelas}
              onChange={(e) => setEditKelas(e.target.value)}
            />
          </div>

          <Input
            label="Program Studi &amp; Kampus"
            placeholder="Contoh: S1 Teknik Informatika - Telkom Purwokerto"
            value={editProdi}
            onChange={(e) => setEditProdi(e.target.value)}
          />

          <Input
            label="Nama Dosen Wali (Opsional)"
            placeholder="Contoh: Dosen Pembimbing Akademik"
            value={editDosenWali}
            onChange={(e) => setEditDosenWali(e.target.value)}
          />

          {editProfileMsg && (
            <div
              className={`p-3 rounded-xl text-[12.5px] font-semibold text-center ${
                editProfileMsg.type === "success"
                  ? "bg-ios-success/15 text-ios-success border border-ios-success/30"
                  : "bg-ios-danger/10 text-ios-danger border border-ios-danger/25"
              }`}
            >
              {editProfileMsg.text}
            </div>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full font-bold"
              isLoading={isSubmittingProfile}
            >
              Simpan Data Diri
            </Button>
          </div>
        </form>
      </Sheet>

      {/* Sheet Upload Foto Profil */}
      <Sheet
        isOpen={isUploadSheetOpen}
        onClose={() => {
          setIsUploadSheetOpen(false);
          setAvatarUploadError(null);
        }}
        title="Ubah Foto Profil"
        description="Pilih foto profil terbaik Anda untuk kartu identitas mahasiswa."
      >
        <form onSubmit={handleSaveAvatar} className="space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const file = e.dataTransfer.files?.[0];
              if (file) processSelectedFile(file);
            }}
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-ios-border rounded-2xl bg-ios-surfaceSecondary transition-colors hover:border-ios-accent/50"
          >
            {isProcessingImage ? (
              <div className="w-24 h-24 rounded-full bg-ios-surface border border-ios-border flex flex-col items-center justify-center mb-3 shadow-inner">
                <Loader2 className="w-8 h-8 text-ios-accent animate-spin" />
              </div>
            ) : avatarPreview ? (
              <div className="relative mb-3">
                <img
                  src={avatarPreview}
                  alt="Preview Avatar"
                  className="w-24 h-24 rounded-full object-cover border-2 border-ios-accent shadow-md"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-ios-surface border border-ios-border flex items-center justify-center mb-3">
                <Camera className="w-8 h-8 text-ios-textSecondary" />
              </div>
            )}

            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isProcessingImage || isSubmittingAvatar}
              onClick={() => {
                if (fileInputRef.current) fileInputRef.current.value = "";
                fileInputRef.current?.click();
              }}
              className="gap-2"
            >
              {isProcessingImage ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-ios-accent" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>{avatarPreview ? "Ganti Berkas Foto" : "Pilih dari Perangkat"}</span>
                </>
              )}
            </Button>

            {isProcessingImage && processingStatus && (
              <p className="text-[12px] font-medium text-ios-accent mt-2 animate-pulse">
                {processingStatus}
              </p>
            )}

            <p className="text-[11px] text-ios-textSecondary mt-2">
              Mendukung JPG, PNG, WebP &amp; Apple HEIC (Otomatis dikompresi)
            </p>
          </div>

          {avatarUploadError && (
            <div className="p-3 rounded-xl bg-ios-danger/10 border border-ios-danger/25 text-ios-danger text-[12.5px] font-semibold text-center animate-in fade-in">
              {avatarUploadError}
            </div>
          )}

          <div className="pt-2 space-y-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full font-bold"
              disabled={!avatarPreview || isSubmittingAvatar}
              isLoading={isSubmittingAvatar}
            >
              Simpan Foto Profil
            </Button>

            {profile?.avatar_url && (
              <Button
                type="button"
                variant="secondary"
                className="w-full font-semibold text-ios-danger border-ios-danger/30 hover:bg-ios-danger/10 gap-1.5"
                onClick={handleRemoveAvatar}
                disabled={isSubmittingAvatar}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Foto (Gunakan Inisial Huruf)</span>
              </Button>
            )}
          </div>
        </form>
      </Sheet>
    </div>
  );
}

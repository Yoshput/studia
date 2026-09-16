"use client";

import React, { useState, useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
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
  ExternalLink,
  CheckCircle2,
} from "lucide-react";

interface UserProfile {
  id: string;
  nama: string;
  email: string;
  nim: string | null;
  kelas: string | null;
  prodi: string | null;
  avatar_url: string | null;
}

export default function ProfilPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isUploadSheetOpen, setIsUploadSheetOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmittingAvatar, setIsSubmittingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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
    fetchProfile();

    if (document.documentElement.classList.contains("dark")) {
      setTheme("dark");
    }

    const savedVoice = localStorage.getItem("semestr-voice-enabled");
    if (savedVoice === "true") {
      setVoiceEnabled(true);
    }
  }, []);

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

  // Client-side automatic image compression to prevent Vercel 413 Payload Too Large
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 400; // 400x400 max resolution for crisp circular avatar
        let width = img.width;
        let height = img.height;

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
          resolve(img.src);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Compress to high-quality JPEG (~40KB payload)
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.85);
        resolve(compressedBase64);
      };

      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploadError(null);
    try {
      const compressed = await compressImage(file);
      setAvatarPreview(compressed);
    } catch (err) {
      console.error("Compression error:", err);
      setAvatarUploadError("Format gambar tidak valid atau file rusak.");
    }
  };

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
        localStorage.setItem("semestr-user-avatar", avatarPreview);
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

  return (
    <div className="space-y-4 pt-2">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header */}
      <div>
        <h1 className="text-[26px] font-bold text-ios-textPrimary tracking-tight">
          Profil Mahasiswa
        </h1>
        <p className="text-[13px] text-ios-textSecondary">
          Informasi identitas resmi Telkom University &amp; preferensi akun
        </p>
      </div>

      {/* Student Identity Card with Avatar Upload */}
      <Card className="p-5 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <div className="relative group">
          <div className="w-20 h-20 rounded-full bg-ios-accent/10 border-2 border-ios-accent/30 flex items-center justify-center overflow-hidden shadow-inner">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.nama}
                className="w-full h-full object-cover"
              />
            ) : (
              <MascotIcon size={48} />
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
            {profile?.nama || "YOSSIKA PUTRA ERLANGGA"}
          </h2>
          <p className="text-[13px] font-mono font-semibold text-ios-accent mt-0.5">
            NIM: {profile?.nim || "103112430026"} • {profile?.kelas || "S1IF-12-06"}
          </p>
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[12px] text-ios-textSecondary mt-1">
            <Building className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">
              {profile?.prodi || "S1 Teknik Informatika - Kampus Purwokerto"}
            </span>
          </div>
          <p className="text-[12px] text-ios-textSecondary mt-0.5">
            Dosen Wali: Annisaa Utami, S.Kom., M.Kom. (ANT)
          </p>
        </div>
      </Card>

      {/* Academic Milestones Summary */}
      <Card className="p-4 divide-y divide-ios-border">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2.5">
            <GraduationCap className="w-4 h-4 text-ios-accent" />
            <span className="text-[14px] font-medium text-ios-textPrimary">
              IPK Resmi Terkini
            </span>
          </div>
          <span className="text-[15px] font-bold text-ios-accent">
            3.64
          </span>
        </div>

        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2.5">
            <Database className="w-4 h-4 text-ios-accent" />
            <span className="text-[14px] font-medium text-ios-textPrimary">
              Total Beban SKS
            </span>
          </div>
          <span className="text-[13px] font-semibold text-ios-textSecondary">
            84 SKS Selesai (Tingkat I, II, III) + 22 SKS Berjalan
          </span>
        </div>

        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-ios-success" />
            <span className="text-[14px] font-medium text-ios-textPrimary">
              Database Backend
            </span>
          </div>
          <span className="text-[12px] font-semibold text-ios-success px-2 py-0.5 rounded-full bg-ios-success/15">
            TiDB Cloud Serverless (AWS Singapore)
          </span>
        </div>

        <div className="flex items-center justify-between pt-3">
          <span className="text-[14px] font-medium text-ios-textPrimary">
            Portofolio Resmi
          </span>
          <a
            href="https://yossikaputra.my.id"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] font-semibold text-ios-accent flex items-center gap-1 hover:underline"
          >
            <span>yossikaputra.my.id</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
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
        </Card>
      </div>

      {/* Logout Action */}
      <div className="pt-2">
        <Button
          variant="secondary"
          className="w-full text-ios-danger hover:bg-ios-danger/10 border-ios-danger/30 gap-2"
          onClick={async () => {
            try {
              await signOut({ redirect: false });
            } catch (e) {}
            window.location.href = "/?logged_out=1";
          }}
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar dari Akun</span>
        </Button>
      </div>

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
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-ios-border rounded-2xl bg-ios-surfaceSecondary">
            {avatarPreview ? (
              <div className="relative mb-3">
                <img
                  src={avatarPreview}
                  alt="Preview Avatar"
                  className="w-24 h-24 rounded-full object-cover border-2 border-ios-accent shadow-md"
                  onError={() => setAvatarPreview("/avatars/yossika.jpg")}
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
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>{avatarPreview ? "Ganti Berkas Foto" : "Pilih dari Perangkat"}</span>
            </Button>
            <p className="text-[11px] text-ios-textSecondary mt-2">
              Format JPG, PNG, atau WebP (Otomatis dioptimasi &amp; dikompresi)
            </p>
          </div>

          {avatarUploadError && (
            <div className="p-3 rounded-xl bg-ios-danger/10 border border-ios-danger/25 text-ios-danger text-[12.5px] font-semibold text-center animate-in fade-in">
              {avatarUploadError}
            </div>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full font-bold"
              disabled={!avatarPreview || isSubmittingAvatar}
              isLoading={isSubmittingAvatar}
            >
              Simpan Foto Profil
            </Button>
          </div>
        </form>
      </Sheet>
    </div>
  );
}

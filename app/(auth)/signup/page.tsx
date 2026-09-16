"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { MascotIcon } from "@/components/assistant/MascotIcon";
import { ArrowRight, UserPlus, CheckCircle2, ArrowLeft } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [nim, setNim] = useState("");
  const [kelas, setKelas] = useState("");
  const [prodi, setProdi] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok");
      return;
    }

    if (password.length < 6) {
      setError("Kata sandi minimal 6 karakter");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama,
          nim,
          kelas,
          prodi,
          email,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal melakukan pendaftaran");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
    } catch {
      setError("Terjadi kendala jaringan saat menghubungi server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-ios-bg text-ios-textPrimary transition-colors duration-200">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ios-textSecondary hover:text-ios-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-ios-surface border border-ios-border shadow-sm mb-3">
            <MascotIcon size={40} />
          </div>
          <h1 className="text-[24px] font-bold tracking-tight text-ios-textPrimary">
            Pendaftaran Akun Mahasiswa
          </h1>
          <p className="text-[13px] text-ios-textSecondary mt-0.5">
            Daftarkan akun Semestr untuk mengelola agenda akademik Anda
          </p>
        </div>

        {/* Signup Form Card */}
        <Card className="p-6">
          {success ? (
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-ios-success/20 text-ios-success flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-[18px] font-bold text-ios-textPrimary">
                Pendaftaran Berhasil!
              </h3>
              <p className="text-[13px] text-ios-textSecondary">
                Akun Anda telah tersimpan di sistem. Mengalihkan ke halaman login...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {error && (
                <div className="p-3 rounded-btn bg-ios-danger/10 border border-ios-danger/25 text-ios-danger text-[13px] font-medium">
                  {error}
                </div>
              )}

              <Input
                label="Nama Lengkap"
                placeholder="Contoh: Yossika Putra Erlangga"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="NIM Mahasiswa"
                  placeholder="103112430026"
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  required
                />
                <Input
                  label="Kelas"
                  placeholder="S1IF-12-06"
                  value={kelas}
                  onChange={(e) => setKelas(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Program Studi & Kampus"
                value={prodi}
                onChange={(e) => setProdi(e.target.value)}
                required
              />

              <Input
                label="Email Kampus / Personal"
                type="email"
                placeholder="yossika@telkomuniversity.ac.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Kata Sandi"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Input
                  label="Konfirmasi Sandi"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2"
                isLoading={isLoading}
              >
                <span>Daftar Akun Baru</span>
                <UserPlus className="w-4 h-4 ml-1.5" />
              </Button>

              <div className="text-center pt-3 border-t border-ios-border text-[13px] text-ios-textSecondary">
                Sudah memiliki akun?{" "}
                <Link href="/login" className="text-ios-accent font-semibold hover:underline">
                  Masuk di sini
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}

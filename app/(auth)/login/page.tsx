"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MascotIcon } from "@/components/assistant/MascotIcon";
import { ArrowRight, ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError(res.error || "Email atau kata sandi tidak sesuai");
        setIsLoading(false);
      } else {
        setIsSuccess(true);
        setIsLoading(false);
        setTimeout(() => {
          router.push("/dashboard?welcome=1");
        }, 1100);
      }
    } catch {
      setError("Terjadi kendala saat menghubungi server login");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-ios-bg text-ios-textPrimary transition-colors duration-200">
      <div className="w-full max-w-sm">
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

        {/* App Title & Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-ios-surface border border-ios-border shadow-sm mb-3">
            <MascotIcon size={44} />
          </div>
          <h1 className="text-[26px] font-bold tracking-tight text-ios-textPrimary">
            Masuk ke Semestr
          </h1>
          <p className="text-[13px] text-ios-textSecondary mt-0.5">
            Platform Akademik &amp; Manajemen Studi Mahasiswa
          </p>
        </div>

        {/* Login Card */}
        <Card className="p-6">
          {isSuccess ? (
            <div className="py-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping opacity-75" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[12px] font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Autentikasi Berhasil</span>
                </div>
                <h3 className="text-[20px] font-bold text-ios-textPrimary">
                  Selamat Datang Kembali!
                </h3>
                <p className="text-[13px] text-ios-textSecondary">
                  Menyiapkan agenda kuliah &amp; ruang kerja Anda...
                </p>
              </div>

              {/* Progress pulse line */}
              <div className="w-48 h-1.5 bg-ios-surfaceSecondary rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 animate-pulse w-full" />
              </div>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-btn bg-ios-danger/10 border border-ios-danger/25 text-ios-danger text-[13px] font-medium">
                    {error}
                  </div>
                )}

                <div>
                  <Input
                    label="Email Akun"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    required
                    autoComplete="email"
                  />
                </div>

                <div>
                  <Input
                    label="Kata Sandi"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full mt-2"
                  isLoading={isLoading}
                >
                  <span>Masuk ke Akun</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-ios-border" />
                </div>
                <div className="relative flex justify-center text-[12px] uppercase">
                  <span className="bg-ios-surface px-2 text-ios-textSecondary font-medium">
                    atau lanjutkan dengan
                  </span>
                </div>
              </div>

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/dashboard?welcome=1" })}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-btn bg-ios-surface border border-ios-border hover:bg-ios-surfaceSecondary active:scale-[0.98] transition-all text-[13.5px] font-semibold text-ios-textPrimary shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Masuk dengan Google</span>
              </button>

              <div className="mt-5 pt-4 border-t border-ios-border text-center">
                <p className="text-[13px] text-ios-textSecondary">
                  Belum memiliki akun?{" "}
                  <Link href="/signup" className="text-ios-accent font-semibold hover:underline">
                    Daftar Mahasiswa Baru
                  </Link>
                </p>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

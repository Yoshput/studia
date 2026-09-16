"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MascotIcon } from "@/components/assistant/MascotIcon";
import { ArrowRight, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("yossika@telkomuniversity.ac.id");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Terjadi kendala saat menghubungi server login");
    } finally {
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
            Teknik Informatika • Telkom University Purwokerto
          </p>
        </div>

        {/* Login Card */}
        <Card className="p-6">
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
                placeholder="nama@telkomuniversity.ac.id"
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

          <div className="mt-5 pt-4 border-t border-ios-border space-y-3 text-center">
            <p className="text-[13px] text-ios-textSecondary">
              Belum memiliki akun?{" "}
              <Link href="/signup" className="text-ios-accent font-semibold hover:underline">
                Daftar Mahasiswa Baru
              </Link>
            </p>

            <div className="p-2.5 rounded-lg bg-ios-surfaceSecondary border border-ios-border text-[11px] text-ios-textSecondary text-left">
              <span className="font-semibold text-ios-textPrimary block mb-0.5">
                Kredensial Default (Yossika Putra Erlangga):
              </span>
              <code>yossika@telkomuniversity.ac.id</code> • <code>password123</code>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { MascotIcon } from "@/components/assistant/MascotIcon";
import { TelkomLogo } from "@/components/TelkomLogo";
import { Button } from "@/components/ui/Button";
import { RefreshCw, Home, AlertOctagon } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-ios-bg text-ios-textPrimary transition-colors duration-200">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ios-surface border border-ios-border shadow-sm">
          <TelkomLogo size={20} withText={true} subtext="Purwokerto" />
        </div>

        <div className="relative inline-flex p-4 rounded-3xl bg-ios-surface border border-ios-border shadow-md">
          <MascotIcon size={72} />
          <span className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-ios-danger text-white shadow">
            <AlertOctagon className="w-5 h-5" />
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-[26px] font-bold tracking-tight text-ios-textPrimary">
            Terjadi Kendala Sistem
          </h1>
          <p className="text-[13.5px] text-ios-textSecondary max-w-sm mx-auto leading-relaxed">
            Terjadi kesalahan tak terduga saat memproses data akademik Anda. Silakan coba muat ulang atau kembali ke beranda.
          </p>
          {error?.digest && (
            <p className="text-[11px] font-mono text-ios-textSecondary/70">
              Kode Error: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="primary"
            onClick={() => reset()}
            className="w-full sm:w-auto gap-2 px-5"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Muat Ulang Halaman</span>
          </Button>

          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              className="w-full gap-2 px-5"
            >
              <Home className="w-4 h-4" />
              <span>Ke Dashboard</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

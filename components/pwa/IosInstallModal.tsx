"use client";

import React from "react";
import { X, Share2, PlusSquare, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface IosInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function IosInstallModal({ isOpen, onClose }: IosInstallModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-ios-surface rounded-3xl p-6 shadow-2xl border border-ios-border animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-ios-textSecondary hover:text-ios-textPrimary hover:bg-ios-surfaceSecondary transition-colors"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-ios-accent to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-md">
            S
          </div>
          <div>
            <h3 className="text-base font-bold text-ios-textPrimary">
              Pasang di Layar Utama iOS
            </h3>
            <p className="text-[12px] text-ios-textSecondary">
              Jadikan Semestr sebagai aplikasi native di iPhone / iPad
            </p>
          </div>
        </div>

        <div className="space-y-3.5 my-5 text-[13px] text-ios-textSecondary">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-ios-surfaceSecondary border border-ios-border/60">
            <div className="p-2 rounded-xl bg-ios-surface text-ios-accent shadow-sm flex-shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-ios-textPrimary text-[13px]">
                1. Ketuk Tombol Bagikan
              </p>
              <p className="text-[12px] mt-0.5">
                Buka menu Bagikan (Share) pada toolbar Safari di bagian bawah layar.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-ios-surfaceSecondary border border-ios-border/60">
            <div className="p-2 rounded-xl bg-ios-surface text-ios-accent shadow-sm flex-shrink-0">
              <PlusSquare className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-ios-textPrimary text-[13px]">
                2. Pilih Tambah ke Layar Utama
              </p>
              <p className="text-[12px] mt-0.5">
                Gulir daftar opsi ke bawah lalu ketuk &quot;Tambah ke Layar Utama&quot; (Add to Home Screen).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-ios-surfaceSecondary border border-ios-border/60">
            <div className="p-2 rounded-xl bg-ios-surface text-ios-accent shadow-sm flex-shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-ios-textPrimary text-[13px]">
                3. Buka Seperti Aplikasi Asli
              </p>
              <p className="text-[12px] mt-0.5">
                Ikon Semestr akan muncul di home screen Anda dan berjalan dalam mode layar penuh (standalone).
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          className="w-full justify-center py-2.5 font-semibold text-[13px]"
          onClick={onClose}
        >
          Mengerti
        </Button>
      </div>
    </div>
  );
}

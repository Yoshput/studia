"use client";

import React, { useState } from "react";
import { LiveAnimeAvatar } from "./LiveAnimeAvatar";
import {
  Sparkles,
  Send,
  Calendar,
  Clock,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  Copy,
  Check,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AikoDashboardWidgetProps {
  studentName?: string;
  onOpenFullChat?: () => void;
}

const QUICK_PROMPTS = [
  { label: "📅 Buatkan jadwal terbaik kuliah", text: "coba buatkan saya jadwal terbaik buat kuliah saat ini" },
  { label: "⏰ Tugas paling mendesak", text: "deadline tugas apa yang paling mendesak?" },
  { label: "🎯 Tips lolos praktikum & IPK", text: "berikan tips belajar dan menjaga performa nilai semester ini" },
  { label: "☕ Kafe & kuliner nugas", text: "rekomendasi tempat nugas dan kuliner enak sekitar kampus" },
];

export function AikoDashboardWidget({
  studentName = "Mahasiswa",
  onOpenFullChat,
}: AikoDashboardWidgetProps) {
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "aiko"; text: string }>>([
    {
      role: "aiko",
      text: `Halo ${studentName.split(" ")[0]}! Aku Aiko, asisten akademikmu. Butuh bantuan jadwal kuliah, deadline tugas, atau strategi belajar hari ini?`,
    },
  ]);
  const [isCopied, setIsCopied] = useState(false);

  const handleSend = async (messageToSend?: string) => {
    const text = (messageToSend || inputMessage).trim();
    if (!text || isLoading) return;

    // Tambahkan pesan user ke histori
    setChatHistory((prev) => [...prev, { role: "user", text }]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();
      const reply = data.reply || "Maaf, aku belum bisa memproses jawaban saat ini. Coba tanyakan lagi ya!";
      setChatHistory((prev) => [...prev, { role: "aiko", text: reply }]);
    } catch {
      setChatHistory((prev) => [
        ...prev,
        {
          role: "aiko",
          text: "Kendala koneksi internet saat menghubungi asisten AI. Silakan coba kirim ulang ya!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyLatestResponse = () => {
    const lastAikoMessage = [...chatHistory].reverse().find((m) => m.role === "aiko");
    if (!lastAikoMessage) return;
    navigator.clipboard.writeText(lastAikoMessage.text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1800);
  };

  const resetChat = () => {
    setChatHistory([
      {
        role: "aiko",
        text: `Halo lagi, ${studentName.split(" ")[0]}! Percakapan sudah disegarkan. Ada yang mau kamu tanyakan seputar perkuliahan?`,
      },
    ]);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ios-surface via-ios-surfaceSecondary/50 to-ios-surface border border-ios-border shadow-sm p-4 sm:p-5 transition-all">
      {/* Ambient background glow */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-ios-accent/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* 1. Header Widget */}
      <div className="flex items-center justify-between mb-3.5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-ios-accent to-pink-500 p-0.5 flex-shrink-0 shadow-sm">
            <div className="w-full h-full bg-ios-surface rounded-[14px] flex items-center justify-center overflow-hidden">
              <LiveAnimeAvatar size="sm" showStatusBadge={false} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-[14.5px] font-bold text-ios-textPrimary tracking-tight">
                Aiko AI Companion
              </h3>
              <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded-full bg-ios-accent/15 text-ios-accent border border-ios-accent/25 uppercase">
                Gemini 2.5
              </span>
            </div>
            <p className="text-[11px] text-ios-textSecondary leading-none mt-0.5">
              Asisten Cerdas Mahasiswa Telkom University
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={resetChat}
            className="p-1.5 rounded-lg text-ios-textSecondary hover:text-ios-textPrimary hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Segarkan Chat"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          {onOpenFullChat && (
            <button
              type="button"
              onClick={onOpenFullChat}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-ios-surfaceSecondary border border-ios-border text-[11px] font-semibold text-ios-accent hover:border-ios-accent/40 transition-colors"
              title="Buka obrolan penuh dan Live 3D Voice"
            >
              <span>Full Chat</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Interactive Message Feed (Scrollable & Responsive) */}
      <div className="space-y-2.5 max-h-56 overflow-y-auto no-scrollbar pr-1 mb-3.5 text-[12.5px] relative z-10">
        {chatHistory.map((item, idx) => (
          <div
            key={idx}
            className={cn(
              "flex flex-col",
              item.role === "user" ? "items-end" : "items-start"
            )}
          >
            <div
              className={cn(
                "p-3 rounded-2xl max-w-[92%] leading-relaxed shadow-xs",
                item.role === "user"
                  ? "bg-ios-accent text-white rounded-tr-xs font-medium"
                  : "bg-ios-surfaceSecondary/90 border border-ios-border/70 text-ios-textPrimary rounded-tl-xs whitespace-pre-line"
              )}
            >
              {item.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-ios-surfaceSecondary/80 rounded-2xl max-w-[70%] border border-ios-border/60 text-ios-textSecondary">
            <span className="inline-block w-2 h-2 rounded-full bg-ios-accent animate-ping" />
            <span className="text-[12px] font-medium animate-pulse">Aiko sedang menyusun jawaban...</span>
          </div>
        )}
      </div>

      {/* 3. Quick Suggestion Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-2 relative z-10">
        {QUICK_PROMPTS.map((qp, i) => (
          <button
            key={i}
            type="button"
            disabled={isLoading}
            onClick={() => handleSend(qp.text)}
            className="flex-shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-ios-surfaceSecondary hover:bg-ios-surface border border-ios-border text-ios-textSecondary hover:text-ios-textPrimary hover:border-ios-accent/30 transition-all active:scale-95 disabled:opacity-50"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* 4. Chat Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 relative z-10"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Tanyakan jadwal, tugas, atau tips praktikum..."
          className="flex-1 px-3.5 py-2 rounded-2xl bg-ios-surfaceSecondary border border-ios-border text-[12.5px] text-ios-textPrimary placeholder:text-ios-textSecondary/70 focus:outline-none focus:ring-2 focus:ring-ios-accent/20 focus:border-ios-accent transition-all"
        />

        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className="p-2.5 rounded-2xl bg-ios-accent text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all active:scale-95 flex-shrink-0"
          aria-label="Kirim pertanyaan"
        >
          <Send className="w-4 h-4" />
        </button>

        {chatHistory.length > 1 && (
          <button
            type="button"
            onClick={copyLatestResponse}
            className="p-2.5 rounded-2xl bg-ios-surfaceSecondary border border-ios-border text-ios-textSecondary hover:text-ios-textPrimary transition-all active:scale-95 flex-shrink-0"
            title="Salin jawaban terakhir"
          >
            {isCopied ? <Check className="w-4 h-4 text-ios-success" /> : <Copy className="w-4 h-4" />}
          </button>
        )}
      </form>
    </div>
  );
}

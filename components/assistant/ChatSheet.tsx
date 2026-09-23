"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { LiveAnimeAvatar, AvatarStatus } from "./LiveAnimeAvatar";
import { ThreeLiveAvatar } from "./ThreeLiveAvatar";
import { LiveVoiceModal } from "./LiveVoiceModal";
import {
  Send,
  Volume2,
  VolumeX,
  Trash2,
  Mic,
  MicOff,
  Sparkles,
  Key,
  ExternalLink,
  CheckCircle2,
  Radio,
  PhoneCall,
  Box,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  engine?: string;
}

interface ChatSheetProps {
  isOpen: boolean;
  onClose: () => void;
  voiceEnabled?: boolean;
  onToggleVoice?: () => void;
}

const QUICK_PROMPTS = [
  "Jadwal kuliah hari ini",
  "Deadline tugas paling mendesak",
  "Coba buatkan jadwal terbaik untuk kuliah",
  "Tips persiapan praktikum dan tugas",
  "Rekomendasi tempat nugas tenang",
];

export function ChatSheet({
  isOpen,
  onClose,
  voiceEnabled = false,
  onToggleVoice = () => {},
}: ChatSheetProps) {
  const { data: session } = useSession();
  const userName = session?.user?.name?.split(" ")[0] || "Teman";

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init-1",
      sender: "assistant",
      text: `Halo ${userName}! Aiko di sini memantau seluruh agenda kuliah dan tugasmu hari ini. Ada materi yang mau dibahas atau tugas yang ingin dikerjakan bareng?`,
      timestamp: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      engine: "gemini",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [avatarStatus, setAvatarStatus] = useState<AvatarStatus>("idle");
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [keySavedMessage, setKeySavedMessage] = useState("");
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState(false);
  const [use3DAvatar, setUse3DAvatar] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load saved Gemini API Key from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem("semestr_gemini_api_key");
      if (savedKey) {
        setGeminiApiKey(savedKey);
      }
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Text to Speech (TTS) with Lip-Sync
  const speakText = (text: string) => {
    if (!voiceEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const cleanText = text
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/__(.*?)__/g, "$1")
        .replace(/[•\-#]/g, "")
        .replace(/https?:\/\/\S+/g, "");

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = "id-ID";
      utterance.rate = 1.05;

      utterance.onstart = () => {
        setAvatarStatus("talking");
      };

      utterance.onend = () => {
        setAvatarStatus("idle");
      };

      utterance.onerror = () => {
        setAvatarStatus("idle");
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Speech synthesis error:", err);
      setAvatarStatus("idle");
    }
  };

  // Web Speech API: Voice Input (Microphone)
  const toggleListening = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError("Browser kamu belum mendukung Web Speech Recognition. Gunakan Google Chrome / Edge.");
      setTimeout(() => setSpeechError(""), 4000);
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setAvatarStatus("idle");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "id-ID";
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setAvatarStatus("listening");
        setSpeechError("");
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error !== "no-speech") {
          setSpeechError(`Mic kendala: ${event.error}`);
        }
        setIsListening(false);
        setAvatarStatus("idle");
      };

      recognition.onend = () => {
        setIsListening(false);
        setAvatarStatus("idle");
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn("Failed to initialize speech recognition:", err);
      setSpeechError("Gagal mengakses mikrofon.");
      setIsListening(false);
      setAvatarStatus("idle");
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setAvatarStatus("thinking");

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (geminiApiKey.trim()) {
        headers["x-gemini-key"] = geminiApiKey.trim();
      }

      const res = await fetch("/api/assistant", {
        method: "POST",
        headers,
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();
      const replyText =
        data.reply ||
        "Maaf, saat ini sistem sedang memproses data kamu. Silakan ulangi beberapa saat lagi.";

      const assistantMessage: Message = {
        id: `asst-${Date.now()}`,
        sender: "assistant",
        text: replyText,
        timestamp: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        engine: data.engine || (data.model ? "gemini" : "smart-local"),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (voiceEnabled) {
        speakText(replyText);
      } else {
        setAvatarStatus("idle");
      }
    } catch (error) {
      console.error("Failed to query assistant:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "assistant",
          text: "Terjadi kendala koneksi ke server asisten. Pastikan server lokal kamu berjalan.",
          timestamp: new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
      setAvatarStatus("idle");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: "cleared-1",
        sender: "assistant",
        text: "Riwayat percakapan telah dibersihkan. Ada yang bisa Aiko bantu terkait perkuliahan atau harimu?",
        timestamp: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        engine: "gemini",
      },
    ]);
  };

  const handleSaveApiKey = () => {
    localStorage.setItem("semestr_gemini_api_key", geminiApiKey.trim());
    setKeySavedMessage("Google Gemini API Key berhasil disimpan!");
    setTimeout(() => {
      setKeySavedMessage("");
      setIsSettingsOpen(false);
    }, 1200);
  };

  return (
    <>
      <Sheet
        isOpen={isOpen}
        onClose={onClose}
        title="Aiko — Asisten Akademik & Live 3D Companion"
        description="Tanyakan jadwal perkuliahan, deadline tugas, tips ngoding, atau ngobrol santai."
        className="max-w-xl h-[90vh] flex flex-col p-0"
      >
        <div className="flex flex-col h-full bg-ios-surface">
          {/* Interactive Live 3D / Live2D Anime Avatar Showcase Header */}
          <div className="pt-3 pb-2 px-5 bg-gradient-to-b from-ios-surfaceSecondary/80 via-ios-surfaceSecondary/40 to-ios-surface border-b border-ios-border/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {use3DAvatar ? (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-ios-accent/20 to-purple-500/20 border border-ios-border/80 flex items-center justify-center overflow-hidden shadow-inner flex-shrink-0">
                  <ThreeLiveAvatar
                    status={avatarStatus}
                    size="sm"
                    showStatusBadge={false}
                  />
                </div>
              ) : (
                <LiveAnimeAvatar
                  status={avatarStatus}
                  size="sm"
                  showStatusBadge={false}
                />
              )}

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[15px] text-ios-textPrimary tracking-tight">
                    Aiko
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-ios-accent/10 text-ios-accent border border-ios-accent/20">
                    Telkom University
                  </span>
                </div>
                <p className="text-[11.5px] text-ios-textSecondary flex items-center gap-1.5 mt-0.5">
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    avatarStatus === "idle" ? "bg-emerald-500" : "bg-ios-accent animate-ping"
                  )} />
                  <span>
                    {avatarStatus === "listening"
                      ? "Mendengarkan suaramu..."
                      : avatarStatus === "thinking"
                      ? "Menyusun jawaban..."
                      : avatarStatus === "talking"
                      ? "Sedang berbicara..."
                      : "Aktif mendampingi perkuliahanmu"}
                  </span>
                </p>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="flex items-center gap-1.5">
              {/* Fullscreen Live Voice Call Button */}
              <button
                type="button"
                onClick={() => setIsLiveVoiceOpen(true)}
                className="px-2.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 active:scale-95 transition-all flex items-center gap-1 text-[11px] font-semibold"
                title="Buka Panggilan Suara Interaktif"
              >
                <PhoneCall className="w-3 h-3 text-emerald-500" />
                <span>Live Call</span>
              </button>

              {/* Voice Output Toggle */}
              <button
                type="button"
                onClick={onToggleVoice}
                className={cn(
                  "p-1.5 rounded-full border transition-all flex items-center justify-center",
                  voiceEnabled
                    ? "bg-ios-accent/15 border-ios-accent/30 text-ios-accent"
                    : "bg-ios-surfaceSecondary border-ios-border text-ios-textSecondary hover:text-ios-textPrimary"
                )}
                title={voiceEnabled ? "Suara TTS Aktif" : "Suara TTS Nonaktif"}
              >
                {voiceEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 text-ios-accent" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Clear Chat */}
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 rounded-full border border-ios-border bg-ios-surfaceSecondary text-ios-textSecondary hover:text-ios-danger hover:border-ios-danger/30 transition-all"
                title="Bersihkan percakapan"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Gemini API Settings Dropdown Drawer */}
          {isSettingsOpen && (
            <div className="p-4 bg-ios-surfaceSecondary/90 border-b border-ios-border text-[13px] space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-ios-accent" />
                  <span className="font-semibold text-ios-textPrimary">
                    Google Gemini 2.5 Flash Terhubung
                  </span>
                </div>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-ios-accent flex items-center gap-1 hover:underline font-medium"
                >
                  <span>Google AI Studio</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-[12px] text-ios-textSecondary leading-relaxed">
                API Key Anda telah tersimpan dan aktif menggunakan model resmi <strong>Gemini 2.5 Flash</strong> dengan kecepatan kilat dan pemahaman konteks perkuliahan penuh.
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="Paste API Key (AQ.Ab8RN...)"
                  className="flex-1 px-3 py-1.5 rounded-btn bg-ios-surface border border-ios-border text-[13px] text-ios-textPrimary focus:outline-none focus:border-ios-accent"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveApiKey}
                  className="flex-shrink-0"
                >
                  Simpan
                </Button>
              </div>
              {keySavedMessage && (
                <p className="text-[12px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{keySavedMessage}</span>
                </p>
              )}
            </div>
          )}

          {/* Mic Error Banner if any */}
          {speechError && (
            <div className="px-5 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-600 dark:text-amber-400 text-[12px] font-medium flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>{speechError}</span>
            </div>
          )}

          {/* Message Thread */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5">
            {messages.map((m) => {
              const isUser = m.sender === "user";
              return (
                <div
                  key={m.id}
                  className={cn("flex gap-2.5 max-w-[88%]", isUser ? "ml-auto justify-end" : "")}
                >
                  {!isUser && (
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-7 h-7 rounded-full overflow-hidden border border-ios-border flex items-center justify-center bg-ios-surfaceSecondary shadow-xs">
                        <LiveAnimeAvatar size="sm" showStatusBadge={false} />
                      </div>
                    </div>
                  )}
                  <div
                    className={cn(
                      "px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-xs",
                      isUser
                        ? "bg-ios-accent text-white rounded-br-xs font-medium"
                        : "bg-ios-surfaceSecondary text-ios-textPrimary border border-ios-border/70 rounded-bl-xs whitespace-pre-wrap"
                    )}
                  >
                    <p>{m.text}</p>
                    <div className="flex items-center justify-end mt-1 text-[10px]">
                      <span
                        className={cn(
                          isUser ? "text-white/70" : "text-ios-textSecondary/70"
                        )}
                      >
                        {m.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Thinking / Loading Animation */}
            {isLoading && (
              <div className="flex gap-2 items-center">
                <div className="w-7 h-7 rounded-full overflow-hidden border border-ios-border flex items-center justify-center bg-ios-surfaceSecondary">
                  <LiveAnimeAvatar size="sm" showStatusBadge={false} />
                </div>
                <div className="bg-ios-surfaceSecondary border border-ios-border px-3.5 py-2 rounded-2xl text-[12px] text-ios-textSecondary flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-ios-accent rounded-full animate-ping" />
                  <span>Aiko sedang menulis...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompt chips */}
          <div className="px-5 py-2 border-t border-ios-border/60 bg-ios-surface">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  disabled={isLoading}
                  className="flex-shrink-0 text-[11.5px] px-3 py-1 rounded-full bg-ios-surfaceSecondary border border-ios-border text-ios-textSecondary hover:text-ios-textPrimary hover:border-ios-accent/40 active:scale-95 transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Listening Soundwave Banner */}
          {isListening && (
            <div className="px-4 py-2 bg-ios-accent/10 border-t border-ios-accent/20 flex items-center justify-between text-[12px] text-ios-accent font-medium animate-pulse">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ios-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-ios-accent"></span>
                </span>
                <span>Mendengarkan suara Anda... Silakan berbicara</span>
              </div>
              <button
                type="button"
                onClick={toggleListening}
                className="text-[11px] underline font-semibold text-ios-accent hover:text-ios-accent/80"
              >
                Selesai Bicara
              </button>
            </div>
          )}

          {/* Input Bar with Mic STT Button */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-ios-border bg-ios-surface flex items-center gap-2"
          >
            {/* Voice Input Microphone Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0 shadow-sm border",
                isListening
                  ? "bg-red-500 text-white border-red-400 animate-pulse scale-105 shadow-red-500/30"
                  : "bg-ios-surfaceSecondary border-ios-border text-ios-textSecondary hover:text-ios-accent hover:border-ios-accent/40 active:scale-95"
              )}
              title={isListening ? "Klik untuk menghentikan rekaman suara" : "Bicara menggunakan mikrofon (Voice Input)"}
            >
              {isListening ? (
                <MicOff className="w-4 h-4 text-white" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isListening
                  ? "Mendengarkan... Suara akan tertranskripsi otomatis..."
                  : "Ketik pertanyaan atau tekan tombol mic untuk bicara..."
              }
              className="flex-1 px-4 py-2 rounded-btn bg-ios-surfaceSecondary border border-ios-border text-[13.5px] text-ios-textPrimary placeholder:text-ios-textSecondary/60 focus:outline-none focus:border-ios-accent min-h-[42px]"
              disabled={isLoading}
            />

            {/* Send Button */}
            <Button
              type="submit"
              variant="primary"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="rounded-full w-10 h-10 flex-shrink-0"
              title="Kirim pesan"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Sheet>

      {/* Live Voice Duplex Call Modal */}
      <LiveVoiceModal
        isOpen={isLiveVoiceOpen}
        onClose={() => setIsLiveVoiceOpen(false)}
      />
    </>
  );
}

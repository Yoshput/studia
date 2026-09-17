"use client";

import React, { useState, useEffect, useRef } from "react";
import { ThreeLiveAvatar, ThreeAvatarStatus } from "./ThreeLiveAvatar";
import {
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  VolumeX,
  Sparkles,
  Radio,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LiveVoiceModal({ isOpen, onClose }: LiveVoiceModalProps) {
  const [avatarStatus, setAvatarStatus] = useState<ThreeAvatarStatus>("idle");
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [lastAssistantReply, setLastAssistantReply] = useState(
    "Hai! Aku Aiko 3D. Silakan bicara langsung lewat mic, aku siap mendengarkan!"
  );
  const [statusText, setStatusText] = useState("Siap Mendengarkan Suaramu");

  const recognitionRef = useRef<any>(null);
  const isSpeakingRef = useRef(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Stop everything on close
  useEffect(() => {
    if (!isOpen) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setAvatarStatus("idle");
      isSpeakingRef.current = false;
      return;
    }

    // Initial greeting when opening Live Voice Call
    setStatusText("Aiko 3D Terhubung • Gemini 2.5 Flash Aktif");
    speakVoice("Hai! Aku Aiko 3D, asisten akademikmu di Semestr. Ada yang ingin kamu tanyakan lewat suara?");
  }, [isOpen]);

  // Text-To-Speech Output via Laptop/HP Speaker
  const speakVoice = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      startListening();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      const cleanText = text
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/__(.*?)__/g, "$1")
        .replace(/[•\-#]/g, "")
        .replace(/https?:\/\/\S+/g, "");

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = "id-ID";
      utterance.rate = 1.05;

      utterance.onstart = () => {
        isSpeakingRef.current = true;
        setAvatarStatus("talking");
        setStatusText("Aiko Sedang Berbicara...");
      };

      utterance.onend = () => {
        isSpeakingRef.current = false;
        setAvatarStatus("idle");
        setStatusText("Mendengarkan giliranmu...");
        // Auto resume listening after assistant finishes speaking
        setTimeout(() => {
          if (!isMicMuted && isOpen) {
            startListening();
          }
        }, 300);
      };

      utterance.onerror = () => {
        isSpeakingRef.current = false;
        setAvatarStatus("idle");
        startListening();
      };

      if (!isSpeakerMuted) {
        window.speechSynthesis.speak(utterance);
      } else {
        setAvatarStatus("idle");
        startListening();
      }
    } catch (err) {
      console.warn("Speech Synthesis failed:", err);
      isSpeakingRef.current = false;
      startListening();
    }
  };

  // Start Speech Recognition (Microphone)
  const startListening = () => {
    if (typeof window === "undefined" || isSpeakingRef.current || isMicMuted) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "id-ID";
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setAvatarStatus("listening");
        setStatusText("Mendengarkan suaramu... Silakan bicara");
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setLiveTranscript(transcript);

        // Auto send on pause/silence (1.5 seconds)
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (transcript.trim().length > 1) {
            recognition.stop();
            handleSendSpokenQuery(transcript);
          }
        }, 1500);
      };

      recognition.onerror = (e: any) => {
        if (e.error !== "no-speech") {
          console.warn("Speech error:", e.error);
        }
        setAvatarStatus("idle");
      };

      recognition.onend = () => {
        if (!isSpeakingRef.current && !isMicMuted && isOpen) {
          // Re-listen if no speech yet
          setAvatarStatus("idle");
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn("Failed to start speech recognition:", err);
    }
  };

  // Send query to Gemini API
  const handleSendSpokenQuery = async (query: string) => {
    if (!query.trim()) return;

    setAvatarStatus("thinking");
    setStatusText("Memproses pertanyaan dengan Gemini 2.5 Flash...");

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      const data = await res.json();
      const reply = data.reply || "Bisa diulangi pertanyaannya?";
      setLastAssistantReply(reply);
      setLiveTranscript("");
      speakVoice(reply);
    } catch (err) {
      console.error("Live Voice Query error:", err);
      const errMsg = "Maaf, terjadi kendala jaringan. Silakan tanyakan kembali ya.";
      setLastAssistantReply(errMsg);
      speakVoice(errMsg);
    }
  };

  const toggleMic = () => {
    if (!isMicMuted) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsMicMuted(true);
      setAvatarStatus("idle");
      setStatusText("Mikrofon Dinonaktifkan");
    } else {
      setIsMicMuted(false);
      startListening();
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerMuted(!isSpeakerMuted);
    if (!isSpeakerMuted && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setAvatarStatus("idle");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Top Bar Header */}
      <div className="w-full max-w-2xl flex items-center justify-between text-white/90">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-[13px] font-bold tracking-wide">
            GEMINI 2.5 FLASH • LIVE 3D VOICE CALL
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/10 text-white/80 font-medium">
            Telkom Purwokerto
          </span>
        </div>
      </div>

      {/* Centerpiece: Interactive Three.js 3D Avatar */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg relative my-2">
        <ThreeLiveAvatar
          status={avatarStatus}
          size="lg"
          showStatusBadge={false}
          className="w-full"
        />

        {/* Dynamic Status Pill */}
        <div className="mt-3 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white text-[12px] font-medium flex items-center gap-2 shadow-lg">
          {avatarStatus === "listening" && <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />}
          {avatarStatus === "thinking" && <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />}
          {avatarStatus === "talking" && <Volume2 className="w-3.5 h-3.5 text-sky-400 animate-bounce" />}
          {avatarStatus === "idle" && <Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
          <span>{statusText}</span>
        </div>

        {/* Live Audio Transcription / Assistant Reply Bubble */}
        <div className="mt-4 w-full max-w-md bg-white/10 border border-white/15 rounded-2xl p-4 text-center backdrop-blur-md shadow-2xl min-h-[90px] flex flex-col items-center justify-center">
          {liveTranscript ? (
            <p className="text-[14px] text-amber-300 font-medium animate-pulse">
              "{liveTranscript}"
            </p>
          ) : (
            <p className="text-[13px] text-white/90 leading-relaxed font-normal">
              {lastAssistantReply}
            </p>
          )}
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="w-full max-w-md flex items-center justify-center gap-4 py-3">
        {/* Mute Mic Button */}
        <button
          type="button"
          onClick={toggleMic}
          className={cn(
            "w-13 h-13 rounded-full flex items-center justify-center transition-all shadow-lg border",
            isMicMuted
              ? "bg-red-500 text-white border-red-400"
              : "bg-white/15 text-white border-white/20 hover:bg-white/25 active:scale-95"
          )}
          title={isMicMuted ? "Aktifkan Mic" : "Matikan Mic"}
        >
          {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* End Call / Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
          title="Akhiri Panggilan Suara Live"
        >
          <PhoneOff className="w-7 h-7" />
        </button>

        {/* Speaker Volume Toggle */}
        <button
          type="button"
          onClick={toggleSpeaker}
          className={cn(
            "w-13 h-13 rounded-full flex items-center justify-center transition-all shadow-lg border",
            isSpeakerMuted
              ? "bg-amber-500 text-white border-amber-400"
              : "bg-white/15 text-white border-white/20 hover:bg-white/25 active:scale-95"
          )}
          title={isSpeakerMuted ? "Bunyikan Suara" : "Bisukan Speaker"}
        >
          {isSpeakerMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}

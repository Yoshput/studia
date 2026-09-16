"use client";

import React, { useState, useEffect, useRef } from "react";
import { LiveAnimeAvatar } from "./LiveAnimeAvatar";
import { ChatSheet } from "./ChatSheet";
import { X, Sparkles, AlertCircle } from "lucide-react";
import gsap from "gsap";

interface MascotWidgetProps {
  greetingMessage?: string;
  hasUrgentDeadline?: boolean;
}

export function MascotWidget({
  greetingMessage,
  hasUrgentDeadline = false,
}: MascotWidgetProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showGreetingBubble, setShowGreetingBubble] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const mascotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check saved voice setting
    const savedVoice = localStorage.getItem("semestr-voice-enabled");
    if (savedVoice === "true") {
      setVoiceEnabled(true);
    }

    // GSAP Subtle Idle Floating Animation
    if (mascotRef.current) {
      gsap.to(mascotRef.current, {
        y: -5,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }

    // Show initial greeting after brief delay
    const timer = setTimeout(() => {
      setShowGreetingBubble(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const toggleVoice = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    localStorage.setItem("semestr-voice-enabled", String(next));
  };

  const defaultGreeting =
    greetingMessage ||
    (hasUrgentDeadline
      ? "Perhatian: ada tugas yang mendekati batas waktu dalam 3 hari ke depan."
      : "Selamat belajar! Jadwal dan tugas semestermu terpantau rapi.");

  return (
    <>
      {/* Floating Mascot in Bottom Right (above bottom nav bar) */}
      <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end pointer-events-auto">
        {/* Dynamic Greeting Bubble */}
        {showGreetingBubble && (
          <div className="mb-2 max-w-[240px] bg-ios-surface border border-ios-border rounded-2xl p-3 shadow-iosHover relative animate-in fade-in slide-in-from-bottom-2 duration-300">
            <button
              type="button"
              onClick={() => setShowGreetingBubble(false)}
              className="absolute top-2 right-2 p-1 text-ios-textSecondary hover:text-ios-textPrimary rounded-full"
              aria-label="Tutup sapaan"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-start gap-1.5 pr-4">
              {hasUrgentDeadline ? (
                <AlertCircle className="w-4 h-4 text-ios-danger flex-shrink-0 mt-0.5" />
              ) : (
                <Sparkles className="w-4 h-4 text-ios-accent flex-shrink-0 mt-0.5" />
              )}
              <p className="text-[12px] font-medium text-ios-textPrimary leading-snug">
                {defaultGreeting}
              </p>
            </div>
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowGreetingBubble(false);
                  setIsChatOpen(true);
                }}
                className="text-[11px] font-semibold text-ios-accent hover:underline"
              >
                Buka Chat Asisten &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Mascot Avatar Button */}
        <div ref={mascotRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setShowGreetingBubble(false);
              setIsChatOpen(true);
            }}
            className="w-14 h-14 p-0.5 bg-ios-surface border-2 border-ios-accent/30 rounded-full shadow-lg hover:shadow-xl transition-transform active:scale-95 flex items-center justify-center relative group overflow-hidden"
            aria-label="Buka Asisten AI Aiko"
          >
            <LiveAnimeAvatar size="sm" showStatusBadge={false} />
            {hasUrgentDeadline && (
              <span className="absolute top-1 right-1 w-3 h-3 bg-ios-danger border-2 border-white dark:border-black rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Slide-up Chat Sheet */}
      <ChatSheet
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        voiceEnabled={voiceEnabled}
        onToggleVoice={toggleVoice}
      />
    </>
  );
}

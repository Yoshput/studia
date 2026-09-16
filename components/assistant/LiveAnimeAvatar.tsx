"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, Sparkles, Volume2, Radio } from "lucide-react";

export type AvatarStatus = "idle" | "listening" | "thinking" | "talking";

interface LiveAnimeAvatarProps {
  status?: AvatarStatus;
  size?: "sm" | "md" | "lg";
  className?: string;
  showStatusBadge?: boolean;
}

export function LiveAnimeAvatar({
  status = "idle",
  size = "md",
  className = "",
  showStatusBadge = true,
}: LiveAnimeAvatarProps) {
  // Tracking mouse for 3D parallax tilt and pupil gaze
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(0); // 0: closed, 1: mid, 2: wide
  const [isWinking, setIsWinking] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dimension presets
  const dimensions = {
    sm: { width: 56, height: 56 },
    md: { width: 110, height: 110 },
    lg: { width: 150, height: 150 },
  }[size];

  // Mouse Parallax movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const x = Math.max(-1, Math.min(1, (e.clientX - centerX) / 200));
      const y = Math.max(-1, Math.min(1, (e.clientY - centerY) / 200));
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Natural Blinking Cycle
  useEffect(() => {
    let blinkTimeout: NodeJS.Timeout;
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);
        const nextTime = 2500 + Math.random() * 3000;
        blinkTimeout = setTimeout(triggerBlink, nextTime);
      }, 180);
    };

    blinkTimeout = setTimeout(triggerBlink, 3000);
    return () => clearTimeout(blinkTimeout);
  }, []);

  // Lip-Sync Mouth Animation during "talking"
  useEffect(() => {
    if (status !== "talking") {
      setMouthOpen(0);
      return;
    }

    const interval = setInterval(() => {
      setMouthOpen((prev) => (prev === 0 ? 1 : prev === 1 ? 2 : prev === 2 ? 1 : 0));
    }, 130);

    return () => clearInterval(interval);
  }, [status]);

  // Click / Tap reaction (cute wink)
  const handleAvatarClick = () => {
    setIsWinking(true);
    setTimeout(() => setIsWinking(false), 600);
  };

  // Parallax offsets
  const tiltX = mousePos.x * 12; // deg
  const tiltY = -mousePos.y * 10; // deg
  const pupilX = mousePos.x * 5;
  const pupilY = mousePos.y * 4;
  const hairSway = mousePos.x * 5;

  // Status-based label & colors
  const statusInfo = {
    idle: {
      text: "Aiko • Standby",
      color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      ringColor: "from-blue-500/20 via-indigo-500/20 to-purple-500/20",
      badgeIcon: Sparkles,
    },
    listening: {
      text: "Aiko • Mendengarkan...",
      color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
      ringColor: "from-amber-400/40 via-orange-500/40 to-yellow-400/40",
      badgeIcon: Mic,
    },
    thinking: {
      text: "Aiko • Berpikir...",
      color: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
      ringColor: "from-purple-500/40 via-pink-500/40 to-blue-500/40",
      badgeIcon: Radio,
    },
    talking: {
      text: "Aiko • Berbicara...",
      color: "bg-ios-accent/15 text-ios-accent border-ios-accent/30",
      ringColor: "from-sky-400/40 via-blue-500/40 to-indigo-500/40",
      badgeIcon: Volume2,
    },
  }[status];

  const BadgeIcon = statusInfo.badgeIcon;

  return (
    <div
      ref={containerRef}
      onClick={handleAvatarClick}
      className={`flex flex-col items-center justify-center select-none cursor-pointer group ${className}`}
      title="Aiko — Asisten Akademik Anime Live2D (Klik untuk interaksi)"
    >
      {/* 3D Perspective Card Container */}
      <div
        className="relative flex items-center justify-center transition-transform duration-150 ease-out"
        style={{
          width: dimensions.width,
          height: dimensions.height,
          perspective: 800,
        }}
      >
        {/* Holographic Glowing Orbit Ring */}
        <div
          className={`absolute inset-[-10%] rounded-full bg-gradient-to-tr ${statusInfo.ringColor} blur-md transition-all duration-500 ${
            status === "listening" || status === "talking" ? "scale-110 animate-pulse" : "animate-spin-slow"
          }`}
        />

        {/* Ambient Outer Ring */}
        <div className="absolute inset-0 rounded-full border border-white/25 dark:border-white/10 shadow-sm pointer-events-none" />

        {/* 3D Tilting Anime Head Layer */}
        <div
          className="relative w-full h-full flex items-center justify-center transition-transform duration-200"
          style={{
            transform: `rotateY(${tiltX}deg) rotateX(${tiltY}deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          <svg
            viewBox="0 0 160 160"
            className="w-full h-full drop-shadow-lg overflow-visible"
          >
            <defs>
              {/* Hair Gradient */}
              <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4F46E5" />
                <stop offset="50%" stopColor="#7C3AED" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>

              {/* Eye Iris Gradient */}
              <linearGradient id="eyeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="60%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#1E1B4B" />
              </linearGradient>

              {/* Skin Tone */}
              <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFF2EB" />
                <stop offset="100%" stopColor="#FDE3D6" />
              </linearGradient>

              {/* Headphone Glow */}
              <linearGradient id="hpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06B6D4" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>

            {/* Back Hair & Twintails */}
            <g transform={`translate(${hairSway * 0.7}, 0)`}>
              <path
                d="M 40 70 C 15 85 10 125 25 145 C 32 140 38 120 42 95 Z"
                fill="url(#hairGrad)"
                opacity="0.95"
              />
              <path
                d="M 120 70 C 145 85 150 125 135 145 C 128 140 122 120 118 95 Z"
                fill="url(#hairGrad)"
                opacity="0.95"
              />
            </g>

            {/* Cyber Headphone Band */}
            <path
              d="M 32 68 C 32 30 128 30 128 68"
              fill="none"
              stroke="#334155"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M 60 36 C 70 33 90 33 100 36"
              fill="none"
              stroke="#38BDF8"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Cyber Headphone Earcups */}
            <rect
              x="22"
              y="58"
              width="16"
              height="30"
              rx="8"
              fill="url(#hpGrad)"
            />
            <rect
              x="122"
              y="58"
              width="16"
              height="30"
              rx="8"
              fill="url(#hpGrad)"
            />
            <circle cx="30" cy="73" r="4" fill="#FFFFFF" opacity="0.9" />
            <circle cx="130" cy="73" r="4" fill="#FFFFFF" opacity="0.9" />

            {/* Face Base */}
            <path
              d="M 46 62 C 46 45 114 45 114 62 C 114 98 100 120 80 124 C 60 120 46 98 46 62 Z"
              fill="url(#skinGrad)"
            />

            {/* Soft Anime Blush Cheeks */}
            <ellipse
              cx="58"
              cy="92"
              rx={status === "listening" ? "9" : "7"}
              ry="4"
              fill="#FB7185"
              opacity={status === "listening" ? "0.6" : "0.35"}
            />
            <ellipse
              cx="102"
              cy="92"
              rx={status === "listening" ? "9" : "7"}
              ry="4"
              fill="#FB7185"
              opacity={status === "listening" ? "0.6" : "0.35"}
            />

            {/* Left Eye */}
            <g transform="translate(62, 80)">
              {isBlinking ? (
                <path
                  d="M -10 0 Q 0 4 10 0"
                  fill="none"
                  stroke="#1E293B"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              ) : (
                <>
                  <ellipse cx="0" cy="0" rx="10" ry="12" fill="#FFFFFF" />
                  <g transform={`translate(${pupilX}, ${pupilY})`}>
                    <ellipse cx="0" cy="0" rx="7.5" ry="9.5" fill="url(#eyeGrad)" />
                    <circle cx="0" cy="1" r="3.8" fill="#0F172A" />
                    <circle cx="-2.5" cy="-3" r="2.8" fill="#FFFFFF" />
                    <circle cx="2.5" cy="3" r="1.4" fill="#FFFFFF" />
                  </g>
                  <path
                    d="M -12 -9 Q 0 -15 12 -9"
                    fill="none"
                    stroke="#0F172A"
                    strokeWidth="3.8"
                    strokeLinecap="round"
                  />
                </>
              )}
            </g>

            {/* Right Eye */}
            <g transform="translate(98, 80)">
              {isBlinking || isWinking ? (
                <path
                  d="M -10 0 Q 0 5 10 0"
                  fill="none"
                  stroke="#1E293B"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              ) : (
                <>
                  <ellipse cx="0" cy="0" rx="10" ry="12" fill="#FFFFFF" />
                  <g transform={`translate(${pupilX}, ${pupilY})`}>
                    <ellipse cx="0" cy="0" rx="7.5" ry="9.5" fill="url(#eyeGrad)" />
                    <circle cx="0" cy="1" r="3.8" fill="#0F172A" />
                    <circle cx="-2.5" cy="-3" r="2.8" fill="#FFFFFF" />
                    <circle cx="2.5" cy="3" r="1.4" fill="#FFFFFF" />
                  </g>
                  <path
                    d="M -12 -9 Q 0 -15 12 -9"
                    fill="none"
                    stroke="#0F172A"
                    strokeWidth="3.8"
                    strokeLinecap="round"
                  />
                </>
              )}
            </g>

            {/* Cute Nose */}
            <path
              d="M 80 88 L 79 90"
              stroke="#E29D80"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Mouth (Lip-Sync when Talking) */}
            <g transform="translate(80, 104)">
              {mouthOpen === 0 ? (
                <path
                  d="M -6 -1 Q 0 3 6 -1"
                  fill="none"
                  stroke="#991B1B"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              ) : mouthOpen === 1 ? (
                <ellipse cx="0" cy="0" rx="5" ry="4" fill="#E11D48" />
              ) : (
                <path
                  d="M -7 -2 Q 0 8 7 -2 Z"
                  fill="#E11D48"
                  stroke="#991B1B"
                  strokeWidth="1.2"
                />
              )}
            </g>

            {/* Bangs / Fringe */}
            <g transform={`translate(${hairSway}, 0)`}>
              <path
                d="M 44 60 Q 55 78 52 88 Q 62 70 66 58 Z"
                fill="url(#hairGrad)"
              />
              <path
                d="M 64 54 Q 78 78 77 86 Q 84 72 88 54 Z"
                fill="url(#hairGrad)"
              />
              <path
                d="M 86 54 Q 98 76 102 88 Q 106 70 114 60 Z"
                fill="url(#hairGrad)"
              />
              <path
                d="M 52 50 Q 80 44 108 50"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.65"
              />
            </g>
          </svg>
        </div>
      </div>

      {/* Interactive Status Indicator Badge */}
      {showStatusBadge && (
        <div
          className={`mt-2 px-3 py-0.5 rounded-full text-[11px] font-semibold border flex items-center gap-1.5 transition-all duration-300 shadow-sm ${statusInfo.color}`}
        >
          <BadgeIcon
            className={`w-3 h-3 ${
              status === "listening" || status === "talking" ? "animate-pulse" : ""
            }`}
          />
          <span>{statusInfo.text}</span>
        </div>
      )}
    </div>
  );
}

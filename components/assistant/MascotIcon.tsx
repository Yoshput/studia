"use client";

import React from "react";

interface MascotIconProps {
  isSpeaking?: boolean;
  className?: string;
  size?: number;
}

export function MascotIcon({ isSpeaking = false, className = "", size = 36 }: MascotIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Head / Body */}
      <rect
        x="6"
        y="7"
        width="28"
        height="26"
        rx="10"
        className="fill-ios-accent stroke-ios-border"
        strokeWidth="1.5"
      />

      {/* Screen Face Area */}
      <rect
        x="10"
        y="11"
        width="20"
        height="18"
        rx="6"
        className="fill-white dark:fill-[#1C1C1E]"
      />

      {/* Eyes */}
      <ellipse
        cx="16"
        cy="18"
        rx="2"
        ry={isSpeaking ? "3" : "2"}
        className="fill-ios-textPrimary transition-all duration-150"
      />
      <ellipse
        cx="24"
        cy="18"
        rx="2"
        ry={isSpeaking ? "3" : "2"}
        className="fill-ios-textPrimary transition-all duration-150"
      />

      {/* Mouth */}
      {isSpeaking ? (
        <rect
          x="18"
          y="23"
          width="4"
          height="2"
          rx="1"
          className="fill-ios-accent animate-pulse"
        />
      ) : (
        <path
          d="M17 23.5C18 24.5 22 24.5 23 23.5"
          stroke="currentColor"
          className="stroke-ios-textSecondary"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      )}

      {/* Antenna / Cap Pip */}
      <circle cx="20" cy="4.5" r="1.75" className="fill-ios-accent" />
      <line x1="20" y1="4.5" x2="20" y2="7" stroke="var(--accent)" strokeWidth="1.5" />
    </svg>
  );
}

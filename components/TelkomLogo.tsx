import React from "react";

interface TelkomLogoProps {
  className?: string;
  size?: number;
  withText?: boolean;
  subtext?: string;
}

export function TelkomLogo({
  className = "",
  size = 28,
  withText = false,
  subtext,
}: TelkomLogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Official Telkom University Shield Emblem SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 transition-transform hover:scale-105 duration-200"
        aria-label="Telkom University"
      >
        <defs>
          <linearGradient id="telkomShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ED1E28" />
            <stop offset="100%" stopColor="#B6252A" />
          </linearGradient>
          <filter id="telkomGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#B6252A" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Shield Outer Silhouette */}
        <path
          d="M60 4C78 16 100 20 112 24C112 72 88 102 60 116C32 102 8 72 8 24C20 20 42 16 60 4Z"
          fill="url(#telkomShieldGrad)"
          filter="url(#telkomGlow)"
        />

        {/* Shield Inner Border Highlight */}
        <path
          d="M60 9C76 19 96 23 107 27C107 70 85 98 60 110C35 98 13 70 13 27C24 23 44 19 60 9Z"
          stroke="rgba(255, 255, 255, 0.25)"
          strokeWidth="1.5"
          fill="none"
        />

        {/* Telkom University Stylized T / Flame / Lotus Petals */}
        {/* Central Stem */}
        <path
          d="M56 46C56 44 57.5 42 60 42C62.5 42 64 44 64 46V88C64 90 62.5 91 60 91C57.5 91 56 90 56 88V46Z"
          fill="#FFFFFF"
        />

        {/* Top Horizontal Arch / Bar */}
        <path
          d="M32 38C42 34 52 33 60 33C68 33 78 34 88 38C89.5 38.6 90 40 89 41.5C88 43 86.5 43.5 85 43C76 40 67 39 60 39C53 39 44 40 35 43C33.5 43.5 32 43 31 41.5C30 40 30.5 38.6 32 38Z"
          fill="#FFFFFF"
        />

        {/* Left Wing / Petal */}
        <path
          d="M33 50C39 52 47 57 53 66C54 67.5 53.5 69 52 69.5C50.5 70 49 69.5 48 68C43 61 36 57 31 55C29.5 54.5 29 53 30 51.5C31 50 32 49.5 33 50Z"
          fill="#FFFFFF"
          fillOpacity="0.95"
        />

        {/* Right Wing / Petal */}
        <path
          d="M87 50C81 52 73 57 67 66C66 67.5 66.5 69 68 69.5C69.5 70 71 69.5 72 68C77 61 84 57 89 55C90.5 54.5 91 53 90 51.5C89 50 88 49.5 87 50Z"
          fill="#FFFFFF"
          fillOpacity="0.95"
        />

        {/* Lower Left Subtle Flare */}
        <path
          d="M40 70C46 73 51 78 54 84C54.8 85.5 54 86.8 52.5 87.2C51 87.6 49.8 87 49 85.5C46.5 80.5 42 76.5 37 74C35.5 73.2 35.2 71.8 36 70.8C36.8 69.8 38.5 69.2 40 70Z"
          fill="#FFFFFF"
          fillOpacity="0.9"
        />

        {/* Lower Right Subtle Flare */}
        <path
          d="M80 70C74 73 69 78 66 84C65.2 85.5 66 86.8 67.5 87.2C69 87.6 70.2 87 71 85.5C73.5 80.5 78 76.5 83 74C84.5 73.2 84.8 71.8 84 70.8C83.2 69.8 81.5 69.2 80 70Z"
          fill="#FFFFFF"
          fillOpacity="0.9"
        />
      </svg>

      {/* Typography option */}
      {withText && (
        <div className="flex flex-col text-left leading-tight">
          <span className="text-[13px] font-bold text-ios-textPrimary tracking-tight">
            Telkom University
          </span>
          {subtext && (
            <span className="text-[10px] font-medium text-ios-textSecondary leading-none">
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

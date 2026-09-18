import React from "react";
import Image from "next/image";

interface TelkomLogoProps {
  className?: string;
  size?: number;
  withText?: boolean;
  subtext?: string;
  variant?: "emblem" | "portrait";
}

export function TelkomLogo({
  className = "",
  size = 28,
  withText = false,
  subtext,
  variant = "emblem",
}: TelkomLogoProps) {
  if (variant === "portrait") {
    return (
      <div className={`inline-flex flex-col items-center select-none ${className}`}>
        <Image
          src="/images/telkom/logo-telkom-portrait.png"
          alt="Telkom University"
          width={Math.round(size * 2.2)}
          height={Math.round(size * 2.6)}
          className="h-auto w-auto object-contain transition-transform hover:scale-105 duration-200"
          priority
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      {/* Official Telkom University Emblem */}
      <div
        className="relative flex-shrink-0 flex items-center justify-center transition-transform hover:scale-105 duration-200"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <Image
          src="/images/telkom/logo-telkom-emblem.png"
          alt="Logo Telkom University"
          width={size}
          height={size}
          className="w-full h-full object-contain"
          priority
        />
      </div>

      {/* Dynamic Typography (Adapts to Dark & Light Mode) */}
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


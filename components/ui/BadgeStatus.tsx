import React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "selesai" | "proses" | "belum" | "urgent" | "aman" | "neutral";

interface BadgeStatusProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md";
}

export function BadgeStatus({
  variant = "neutral",
  children,
  className,
  size = "md",
}: BadgeStatusProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    selesai: "bg-[#34C759]/12 text-[#34C759] border-[#34C759]/25 dark:bg-[#34C759]/20",
    proses: "bg-[#FF9F0A]/12 text-[#FF9F0A] border-[#FF9F0A]/25 dark:bg-[#FF9F0A]/20",
    belum: "bg-[#8E8E93]/12 text-[#8E8E93] border-[#8E8E93]/25 dark:bg-[#8E8E93]/20",
    urgent: "bg-[#FF3B30]/12 text-[#FF3B30] border-[#FF3B30]/25 dark:bg-[#FF3B30]/20",
    aman: "bg-[#007AFF]/12 text-[#007AFF] border-[#007AFF]/25 dark:bg-[#0A84FF]/20",
    neutral: "bg-ios-surfaceSecondary text-ios-textSecondary border-ios-border",
  };

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 font-medium",
    md: "text-[12px] px-2.5 py-1 font-semibold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border leading-none select-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}

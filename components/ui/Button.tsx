"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  children: React.ReactNode;
  isLoading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  className,
  disabled,
  isLoading = false,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-btn transition-colors focus:outline-none focus:ring-2 focus:ring-ios-accent/20 disabled:opacity-50 disabled:pointer-events-none select-none";

  const variants = {
    primary: "bg-ios-accent text-white dark:text-black hover:opacity-90 active:opacity-85 shadow-sm",
    secondary:
      "bg-ios-surfaceSecondary text-ios-textPrimary border border-ios-border hover:bg-ios-surface hover:border-ios-textSecondary/30",
    danger: "bg-ios-danger text-white hover:bg-ios-danger/90 active:bg-ios-danger/85 shadow-sm",
    ghost: "bg-transparent text-ios-textSecondary hover:text-ios-textPrimary hover:bg-black/5 dark:hover:bg-white/5",
  };

  const sizes = {
    sm: "text-[13px] px-3 py-1.5 h-8 min-w-[32px]",
    md: "text-[15px] px-4 py-2.5 min-h-[44px]",
    lg: "text-[16px] px-5 py-3 min-h-[48px]",
    icon: "h-10 w-10 min-h-[44px] min-w-[44px] p-0",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.1 }}
      disabled={disabled || isLoading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
      ) : null}
      {children}
    </motion.button>
  );
}

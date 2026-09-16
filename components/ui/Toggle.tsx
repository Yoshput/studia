"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, description, disabled = false }: ToggleProps) {
  return (
    <label
      className={cn(
        "flex items-center justify-between gap-3 cursor-pointer select-none",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {(label || description) && (
        <div className="flex flex-col">
          {label && <span className="text-[15px] font-medium text-ios-textPrimary">{label}</span>}
          {description && (
            <span className="text-[12px] text-ios-textSecondary">{description}</span>
          )}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          "w-12 h-7 rounded-full p-0.5 transition-colors duration-200 focus:outline-none flex items-center",
          checked ? "bg-ios-success" : "bg-ios-border"
        )}
      >
        <motion.div
          animate={{ x: checked ? 20 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="w-6 h-6 rounded-full bg-white shadow-md"
        />
      </button>
    </label>
  );
}

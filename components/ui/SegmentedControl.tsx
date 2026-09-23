"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Option<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface SegmentedControlProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  name?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
  name = "segmented-control",
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        "inline-flex p-1 bg-ios-surfaceSecondary border border-ios-border rounded-xl w-full max-w-full overflow-x-auto",
        className
      )}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <motion.button
            key={option.value}
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-[13px] rounded-lg transition-colors select-none z-10 whitespace-nowrap min-h-[36px]",
              isSelected
                ? "text-ios-textPrimary font-semibold"
                : "text-ios-textSecondary hover:text-ios-textPrimary font-medium"
            )}
          >
            {isSelected && (
              <motion.div
                layoutId={`segmented-active-${name}`}
                className="absolute inset-0 bg-ios-surface rounded-lg shadow-sm border border-ios-border/60 -z-10"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            {option.icon}
            <span>{option.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

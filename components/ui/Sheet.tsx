"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Sheet({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: SheetProps) {
  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          {/* Backdrop with slight blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Sheet Modal Container */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            className={cn(
              "relative z-10 w-full max-w-lg bg-ios-surface rounded-t-sheet sm:rounded-2xl border-t sm:border border-ios-border shadow-iosSheet max-h-[90vh] flex flex-col overflow-hidden",
              className
            )}
          >
            {/* Grab Handle for iOS feel */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1.5 bg-ios-border rounded-full" />
            </div>

            {/* Header */}
            {(title || description) && (
              <div className="flex items-start justify-between px-5 pt-3 pb-3 border-b border-ios-border/60">
                <div>
                  {title && (
                    <h2 className="text-[18px] font-semibold text-ios-textPrimary tracking-tight">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="text-[13px] text-ios-textSecondary mt-0.5">
                      {description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 -mr-1 rounded-full text-ios-textSecondary hover:text-ios-textPrimary hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Content area with scrolling */}
            <div className="p-5 overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

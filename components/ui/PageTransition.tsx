"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // When pathname changes, trigger a quick smooth entry
    setIsTransitioning(false);
  }, [pathname]);

  // Intercept all internal navigation clicks to trigger immediate glass blur feedback
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }

      if (href === pathname || href === window.location.pathname) return;

      // Immediately show subtle frosted glass effect
      setIsTransitioning(true);
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });
    return () => document.removeEventListener("click", handleAnchorClick, { capture: true });
  }, [pathname]);

  return (
    <div className="relative w-full">
      {/* Silky-Smooth iOS Page Cross-fade Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0.88, filter: "blur(4px)", y: 3 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          exit={{ opacity: 0.92, filter: "blur(3px)" }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {/* Frosted Glass Loading Overlay for Heavy Page Switches */}
      {isTransitioning && (
        <div className="fixed inset-0 z-40 bg-white/35 dark:bg-black/40 backdrop-blur-md flex items-center justify-center pointer-events-none animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/90 dark:bg-[#1c1c1e]/90 shadow-2xl border border-ios-border text-[12.5px] font-semibold text-ios-textPrimary">
            <Loader2 className="w-4 h-4 animate-spin text-ios-accent" />
            <span>Memuat data...</span>
          </div>
        </div>
      )}
    </div>
  );
}

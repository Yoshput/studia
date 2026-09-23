"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Top Progress Bar yang memberikan visual feedback seketika saat user berpindah halaman/rute
 * Khas aplikasi modern (seperti YouTube, GitHub, Linear)
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Selesai navigasi: luncurkan ke 100% lalu hilangkan
    setProgress(100);
    const timer = setTimeout(() => {
      setIsNavigating(false);
      setProgress(0);
    }, 280);

    return () => clearTimeout(timer);
  }, [pathname]);

  // Dengarkan semua klik pada tag <a> internal untuk langsung memicu progress bar
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }

      // Jika klik ke rute yang sama, abaikan
      if (href === pathname || href === window.location.pathname) return;

      setIsNavigating(true);
      setProgress(25);

      const t1 = setTimeout(() => setProgress(65), 100);
      const t2 = setTimeout(() => setProgress(85), 250);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });
    return () => document.removeEventListener("click", handleAnchorClick, { capture: true });
  }, [pathname]);

  if (!isNavigating && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none h-[2.5px] bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-ios-accent via-red-500 to-amber-400 transition-all duration-200 ease-out shadow-[0_0_8px_rgba(182,37,42,0.6)]"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transitionProperty: "width, opacity",
          transitionDuration: progress === 100 ? "250ms" : "180ms",
        }}
      />
    </div>
  );
}

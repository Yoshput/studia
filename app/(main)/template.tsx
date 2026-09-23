"use client";

import React from "react";
import { motion } from "framer-motion";

/**
 * Next.js template.tsx me-remount setiap kali berpindah halaman di dalam (main)
 * Memberikan animasi transisi halaman yang smooth & interaktif (fade-in + subtle slide up)
 */
export default function MainTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{
        duration: 0.22,
        ease: [0.22, 1, 0.36, 1], // iOS standard ease-out curve
      }}
      className="w-full flex-1"
    >
      {children}
    </motion.div>
  );
}

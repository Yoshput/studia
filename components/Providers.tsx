"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { PWAInstallProvider } from "@/components/pwa/PWAInstallContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PWAInstallProvider>{children}</PWAInstallProvider>
    </SessionProvider>
  );
}


"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { IosInstallModal } from "./IosInstallModal";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface PWAInstallContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isIos: boolean;
  promptInstall: () => Promise<void>;
}

const PWAInstallContext = createContext<PWAInstallContextType>({
  isInstallable: false,
  isInstalled: false,
  isIos: false,
  promptInstall: async () => {},
});

export function PWAInstallProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);

  useEffect(() => {
    const checkStandalone = () => {
      const isStandaloneMedia = window.matchMedia("(display-mode: standalone)").matches;
      const isStandaloneNavigator = (window.navigator as any).standalone === true;
      if (isStandaloneMedia || isStandaloneNavigator) {
        setIsInstalled(true);
      }
    };

    checkStandalone();

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIos && !isInstalled) {
      setShowIosModal(true);
    }
  };

  const isInstallable = (!isInstalled && (!!deferredPrompt || isIos));

  return (
    <PWAInstallContext.Provider
      value={{
        isInstallable,
        isInstalled,
        isIos,
        promptInstall,
      }}
    >
      {children}
      <IosInstallModal
        isOpen={showIosModal}
        onClose={() => setShowIosModal(false)}
      />
    </PWAInstallContext.Provider>
  );
}

export function usePWAInstall() {
  return useContext(PWAInstallContext);
}

import { useCallback, useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface Window {
    __deferredInstallPrompt: BeforeInstallPromptEvent | null;
  }
}

interface UseInstallPromptReturn {
  canInstall: boolean;
  isIos: boolean;
  isStandalone: boolean;
  install: () => Promise<boolean>;
}

export const useInstallPrompt = (): UseInstallPromptReturn => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(
      () => window.__deferredInstallPrompt,
    );
  const [canInstall, setCanInstall] = useState(
    () => window.__deferredInstallPrompt !== null,
  );
  const [isStandalone] = useState(
    () =>
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone),
  );

  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    const handler = () => {
      setCanInstall(false);
      setDeferredPrompt(null);
    };
    window.addEventListener("appinstalled", handler);
    return () => window.removeEventListener("appinstalled", handler);
  }, []);

  const install = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    window.__deferredInstallPrompt = null;
    setDeferredPrompt(null);
    setCanInstall(false);
    return outcome === "accepted";
  }, [deferredPrompt]);

  return { canInstall, isIos, isStandalone, install };
};

'use client';

import { useEffect, useState } from 'react';

interface PWAInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWA() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<PWAInstallPromptEvent | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [swReady, setSwReady] = useState(false);
  const [swUpdating, setSwUpdating] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as PWAInstallPromptEvent);
      setCanInstall(true);
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setInstallPrompt(null);
    };

    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial online status
    setIsOnline(navigator.onLine);

    // Service worker registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          setSwReady(true);
          console.log('[v0] Service worker registered:', registration);

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setSwUpdating(true);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('[v0] Service worker registration failed:', error);
        });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installApp = async () => {
    if (!installPrompt) {
      console.warn('[v0] Install prompt not available');
      return;
    }

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      console.log(`[v0] User response to install prompt: ${outcome}`);
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setCanInstall(false);
      setInstallPrompt(null);
    } catch (error) {
      console.error('[v0] Installation failed:', error);
    }
  };

  const skipInstall = () => {
    setCanInstall(false);
    setInstallPrompt(null);
  };

  return {
    isInstalled,
    canInstall,
    installApp,
    skipInstall,
    isOnline,
    swReady,
    swUpdating,
  };
}

'use client';

import { usePWA } from '@/hooks/use-pwa';
import { X, Download } from 'lucide-react';
import { useEffect, useState } from 'react';

export function PWAPrompt() {
  const { canInstall, installApp, skipInstall } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (canInstall) {
      setShowPrompt(true);
    }
  }, [canInstall]);

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm animate-in slide-in-from-bottom-2 duration-300 z-50">
      <div className="rounded-lg border border-border bg-card p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-card-foreground">Install App</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Get quick access to Wealth Platform. Install on your device for offline access.
            </p>
          </div>
          <button
            onClick={() => {
              setShowPrompt(false);
              skipInstall();
            }}
            className="text-muted-foreground hover:text-card-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => {
              setShowPrompt(false);
              skipInstall();
            }}
            className="flex-1 rounded-md border border-border px-3 py-2 text-sm font-medium text-card-foreground hover:bg-muted transition-colors"
          >
            Not now
          </button>
          <button
            onClick={() => {
              installApp();
              setShowPrompt(false);
            }}
            className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Download className="h-4 w-4" />
            Install
          </button>
        </div>
      </div>
    </div>
  );
}

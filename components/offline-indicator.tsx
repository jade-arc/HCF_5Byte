'use client';

import { usePWA } from '@/hooks/use-pwa';
import { WifiOff, Wifi } from 'lucide-react';
import { useEffect, useState } from 'react';

export function OfflineIndicator() {
  const { isOnline } = usePWA();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShow(true);
    } else {
      const timer = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (show && !isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-destructive text-destructive-foreground px-4 py-3 flex items-center gap-2 z-50">
        <WifiOff className="h-4 w-4" />
        <span className="text-sm font-medium">You're offline. Some features may be limited.</span>
      </div>
    );
  }

  if (show && isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-primary text-primary-foreground px-4 py-3 flex items-center gap-2 z-50 animate-out fade-out duration-1000">
        <Wifi className="h-4 w-4" />
        <span className="text-sm font-medium">Back online</span>
      </div>
    );
  }

  return null;
}

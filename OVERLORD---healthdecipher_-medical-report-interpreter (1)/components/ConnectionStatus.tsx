
import React, { useState, useEffect } from 'react';

export const ConnectionStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-lg shadow p-2 px-3">
      <span className={`h-2.5 w-2.5 rounded-full transition-colors ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
      <span className="text-sm font-medium text-gray-600">{isOnline ? 'Connected' : 'Offline'}</span>
    </div>
  );
};

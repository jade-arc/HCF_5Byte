
import React, { useState, useEffect } from 'react';
import { Spinner } from './Spinner';

interface StatusBarProps {
  isLoading: boolean;
  loadingMessage: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({ isLoading, loadingMessage }) => {
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

  const StatusIndicator: React.FC<{isOnline: boolean}> = ({ isOnline }) => (
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
      <span className="text-sm font-medium">{isOnline ? 'Connected' : 'Offline'}</span>
    </div>
  );

  const LoadingIndicator: React.FC<{message: string}> = ({ message }) => (
    <div className="flex items-center gap-2 animate-pulse">
       <div className="w-5 h-5">
         <Spinner />
       </div>
      <span className="text-sm font-medium">{message}</span>
    </div>
  );


  return (
    <div className="bg-white rounded-lg shadow p-3 mb-8 flex items-center justify-center text-gray-600">
      {isLoading ? (
        <LoadingIndicator message={loadingMessage} />
      ) : (
        <StatusIndicator isOnline={isOnline} />
      )}
    </div>
  );
};

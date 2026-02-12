
import React from 'react';
import { AnimatedLoadingText } from './ui/AnimatedLoadingText';

interface StatusBarProps {
  isLoading: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({ isLoading }) => {
  if (!isLoading) {
    return null;
  }
  
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow p-3 mb-8 flex items-center justify-center text-gray-600 h-16">
      <AnimatedLoadingText words={["ANALYZING", "INTERPRETING", "FINALIZING"]} />
    </div>
  );
};
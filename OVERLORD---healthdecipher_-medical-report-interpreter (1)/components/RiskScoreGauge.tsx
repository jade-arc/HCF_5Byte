
import React from 'react';

interface RiskScoreGaugeProps {
  score: number;
  level: 'Low' | 'Moderate' | 'High';
}

const levelConfig = {
  Low: { color: '#10B981', label: 'Low Risk' },
  Moderate: { color: '#F59E0B', label: 'Moderate Risk' },
  High: { color: '#EF4444', label: 'High Risk' },
};

export const RiskScoreGauge: React.FC<RiskScoreGaugeProps> = ({ score, level }) => {
  const config = levelConfig[level];
  const circumference = 2 * Math.PI * 52; // 2 * pi * radius
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex-shrink-0 w-48 h-48">
      <svg className="w-full h-full" viewBox="0 0 120 120">
        {/* Background track */}
        <circle
          className="text-gray-200"
          strokeWidth="12"
          stroke="currentColor"
          fill="transparent"
          r="52"
          cx="60"
          cy="60"
        />
        {/* Foreground arc */}
        <circle
          strokeWidth="12"
          stroke={config.color}
          fill="transparent"
          r="52"
          cx="60"
          cy="60"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold" style={{ color: config.color }}>
          {score}
        </span>
        <span className="text-sm font-semibold mt-1" style={{ color: config.color }}>
          {config.label}
        </span>
      </div>
    </div>
  );
};

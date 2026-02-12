
import React, { useState, useEffect } from 'react';
import type { InterpretedResult } from '../types';
import { PieChart } from './PieChart';
import { CloseIcon } from './icons/CloseIcon';
import { InfoIcon } from './icons/InfoIcon';

interface ResultModalProps {
  result: (InterpretedResult & { chartData: any[], primaryColor: string }) | null | undefined;
  onClose: () => void;
}

const parseValue = (str: string): number | null => {
    if (!str) return null;
    const match = str.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : null;
};

const getStatusPillColor = (status: InterpretedResult['Status']) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('high')) return 'bg-red-100 text-red-800';
    if (lowerStatus.includes('low')) return 'bg-yellow-100 text-yellow-800';
    if (lowerStatus.includes('normal')) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
};

export const ResultModal: React.FC<ResultModalProps> = ({ result, onClose }) => {
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    if (result) {
        requestAnimationFrame(() => setIsShowing(true));
    } else {
        setIsShowing(false);
    }
  }, [result]);

  if (!result) return null;

  const DetailSection: React.FC<{ title: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ title, children, icon }) => (
    <div>
        <h3 className="text-md font-bold text-gray-700 mb-2 flex items-center gap-2">
            {icon}
            <span>{title}</span>
        </h3>
        <div className="bg-gray-50/80 p-3 rounded-md text-gray-600 text-sm">
            {children}
        </div>
    </div>
  )

  return (
    <div 
      className={`fixed inset-0 bg-black z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isShowing ? 'bg-opacity-50' : 'bg-opacity-0'}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="result-modal-title"
    >
      <div 
        className={`bg-white rounded-xl shadow-2xl w-full max-w-lg relative p-6 md:p-8 transition-all duration-300 ease-in-out ${isShowing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <CloseIcon className="w-6 h-6" />
        </button>

        <h2 id="result-modal-title" className="text-2xl font-bold text-primary mb-2">{result.Term}</h2>
        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusPillColor(result.Status)}`}>
            {result.Status}
        </span>

        <div className="my-6 flex flex-col md:flex-row items-center gap-6">
            <div className="relative w-36 h-36 flex-shrink-0">
                <PieChart data={result.chartData} holeSize={0.6} />
            </div>
            <div className="text-center md:text-left">
                <p className="text-lg text-dark">Your Result: <span className="font-bold">{result.Value}</span></p>
                <p className="text-md text-gray-500">Normal Range: {result.NormalRange}</p>
            </div>
        </div>

        <div className="space-y-4 text-left">
            <DetailSection title="What it means" icon={<InfoIcon className="w-5 h-5" />}>
                <p>{result.SimpleExplanation}</p>
            </DetailSection>
            {result.WhyItMatters && (
                <DetailSection title="Why it matters">
                    <p>{result.WhyItMatters}</p>
                </DetailSection>
            )}
             {result.WhenToWorry && (
                <DetailSection title="When to worry">
                     <p>{result.WhenToWorry}</p>
                </DetailSection>
            )}
            <DetailSection title="What you can do">
                <p>{result.ActionableAdvice}</p>
            </DetailSection>
        </div>
      </div>
    </div>
  );
};

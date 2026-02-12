
import React from 'react';
import type { InterpretedResult } from '../types';
import { PieChart } from './PieChart';
import { CloseIcon } from './icons/CloseIcon';

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
  if (!result) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="result-modal-title"
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative p-6 md:p-8 transform transition-all"
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
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="font-bold text-4xl leading-tight" style={{color: result.primaryColor}}>{parseValue(result.Value)}</span>
                    <span className="text-md text-gray-500 leading-none">{result.Value.replace(/[\d\s.]/g, '')}</span>
                </div>
            </div>
            <div className="text-center md:text-left">
                <p className="text-lg text-dark">Your Result: <span className="font-bold">{result.Value}</span></p>
                <p className="text-md text-gray-500">Normal Range: {result.NormalRange}</p>
            </div>
        </div>

        <div className="space-y-4 text-left">
            <div>
                <h3 className="text-md font-bold text-gray-700 mb-1">What it means:</h3>
                <p className="text-gray-600">{result.SimpleExplanation}</p>
            </div>
            <div>
                <h3 className="text-md font-bold text-gray-700 mb-1">What you can do:</h3>
                <p className="text-gray-600">{result.ActionableAdvice}</p>
            </div>
        </div>
      </div>
    </div>
  );
};
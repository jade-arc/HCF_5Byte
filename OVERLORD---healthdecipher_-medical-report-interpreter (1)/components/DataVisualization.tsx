
import React, { useState } from 'react';
import type { InterpretedResult } from '../types';
import { PieChart } from './PieChart';
import { ResultModal } from './ResultModal';

interface DataVisualizationProps {
  results: InterpretedResult[];
}

// A simple parser to extract numerical values from strings like "14.5 g/dL" or "4.5-5.5"
const parseValue = (str: string): number | null => {
  if (!str) return null;
  const match = str.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
};

const parseRange = (str: string): { low: number; high: number } | null => {
  if (!str) return null;
  const matches = str.match(/[\d.]+/g);
  if (matches && matches.length >= 2) {
    return { low: parseFloat(matches[0]), high: parseFloat(matches[1]) };
  }
  return null;
};

export const DataVisualization: React.FC<DataVisualizationProps> = ({ results }) => {
  const [selectedResult, setSelectedResult] = useState<(InterpretedResult & { chartData: any[], primaryColor: string }) | null>(null);

  const chartableResults = results.map(result => {
    const value = parseValue(result.Value);
    const range = parseRange(result.NormalRange);
    
    if (value === null || range === null) {
      return null;
    }

    const isHigh = result.Status.toLowerCase() === 'high';
    const isLow = result.Status.toLowerCase() === 'low';

    let data, primaryColor;
    if (isHigh) {
      primaryColor = '#EF4444'; // red-500
      data = [
        { value: range.high, color: '#D1D5DB' }, // gray-300 (normal part, less emphasis)
        { value: value - range.high, color: primaryColor } // red (high part)
      ];
    } else if (isLow) {
      primaryColor = '#F59E0B'; // amber-500
      data = [
        { value: value, color: primaryColor },
        { value: range.high - value, color: '#D1D5DB' }, // gray-300 (rest of normal range)
      ];
    } else { // Normal
      primaryColor = '#10B981'; // green-500
      data = [
        { value: value, color: primaryColor },
        { value: range.high - value, color: '#D1D5DB' }
      ];
    }

    return { ...result, chartData: data, primaryColor };
  }).filter(Boolean);

  if(chartableResults.length === 0) return null;

  return (
    <div className="mb-6">
      <h4 className="text-lg font-bold text-gray-700 mb-4">Visual Summary</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {chartableResults.map((result, index) => (
          result && (
            <button 
              key={index} 
              onClick={() => setSelectedResult(result)}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center hover:shadow-md hover:border-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <h5 className="font-bold text-dark text-md mb-2 truncate">{result.Term}</h5>
              <div className="relative w-24 h-24 mx-auto">
                <PieChart data={result.chartData} holeSize={0.6} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="font-bold text-2xl leading-tight" style={{color: result.primaryColor}}>{parseValue(result.Value)}</span>
                  <span className="text-xs text-gray-500 leading-none">{result.Value.replace(/[\d\s.]/g, '')}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Normal: {result.NormalRange}</p>
            </button>
          )
        ))}
      </div>
      {selectedResult && (
        <ResultModal result={selectedResult} onClose={() => setSelectedResult(null)} />
      )}
    </div>
  );
};
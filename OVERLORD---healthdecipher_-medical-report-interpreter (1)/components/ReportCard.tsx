
import React, { useState, useMemo, useEffect } from 'react';
import type { Report } from '../types';
import { ChevronIcon } from './icons/ChevronIcon';
import { DataVisualization } from './DataVisualization';
import { Spinner } from './Spinner';
import { TrashIcon } from './icons/TrashIcon';
import { StyledButton } from './ui/StyledButton';
import { InfoIcon } from './icons/InfoIcon';

interface ReportCardProps {
  report: Report;
  onAnalyse: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report, onAnalyse, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (report.status === 'pending' || report.status === 'completed') {
        setIsOpen(true);
    }
  }, [report.status]);

  const sortedResults = useMemo(() => {
    if (report.status !== 'completed') return [];
    const statusPriority = { 'high': 1, 'low': 2, 'normal': 3 };
    return [...report.results].sort((a, b) => {
      const aStatus = a.Status.toLowerCase();
      const bStatus = b.Status.toLowerCase();
      const aPrio = statusPriority[aStatus] || 4;
      const bPrio = statusPriority[bStatus] || 4;
      return aPrio - bPrio;
    });
  }, [report.results, report.status]);

  const hasAbnormalResults = useMemo(() => {
    if (report.status !== 'completed') return false;
    return report.results.some(r => r.Status.toLowerCase() !== 'normal');
  }, [report.results, report.status]);

  const cardRingColor = useMemo(() => {
    if (report.status === 'failed') return 'ring-gray-300';
    if (hasAbnormalResults) return 'ring-red-400';
    if (report.status === 'completed') return 'ring-green-400';
    return 'ring-transparent';
  }, [report.status, hasAbnormalResults]);

  const handleViewClick = () => {
    if (!report.fileData || !report.mimeType) return;
    const url = `data:${report.mimeType};base64,${report.fileData}`;
    window.open(url, '_blank');
  };

  const AnalysisActions: React.FC = () => (
    <div className="text-center py-6">
        <p className="text-gray-500 mb-4">This report has not been analyzed yet.</p>
        <div className="flex justify-center items-center gap-4">
            <button
                onClick={handleViewClick}
                className="bg-gray-200 text-dark font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors duration-200 h-[42px]"
            >
                View Document
            </button>
            <StyledButton onClick={() => onAnalyse(report.id)}>
                Analyse Report
            </StyledButton>
        </div>
    </div>
  );

  return (
    <div className={`bg-white rounded-xl overflow-hidden transition-all duration-300 ring-2 shadow-sm ${cardRingColor} hover:shadow-lg hover:scale-[1.01]`}>
      <div className="w-full flex justify-between items-center p-4 md:p-6 text-left">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex-grow flex items-center gap-3 text-left cursor-pointer"
        >
          <div>
            <p className="text-sm text-gray-500">
              {new Date(report.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <h3 className="text-lg font-semibold text-gray-800 break-all">{report.fileName}</h3>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
                {report.status === 'unanalyzed' && <span className="px-3 py-1 text-xs font-bold text-gray-700 bg-gray-200 rounded-full">Not Analyzed</span>}
                {report.status === 'pending' && <span className="px-3 py-1 text-xs font-bold text-white bg-blue-500 rounded-full">Analyzing...</span>}
                {report.status === 'failed' && <span className="px-3 py-1 text-xs font-bold text-white bg-gray-500 rounded-full">Failed</span>}
                {hasAbnormalResults && <span className="px-3 py-1 text-xs font-bold text-white bg-red-500 rounded-full pulse-ring">Action Required</span>}
                {report.status === 'completed' && !hasAbnormalResults && <span className="px-3 py-1 text-xs font-bold text-white bg-green-500 rounded-full">Normal</span>}
                 {report.confidenceScore && (
                    <div className="group relative">
                        <span className="px-3 py-1 text-xs font-bold text-blue-800 bg-blue-100 rounded-full">
                            AI Confidence: {report.confidenceScore}%
                        </span>
                        <div className="absolute bottom-full mb-2 w-48 bg-gray-800 text-white text-xs rounded-lg py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
                            {report.confidenceReason}
                            <svg className="absolute text-gray-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                        </div>
                    </div>
                )}
            </div>
          </div>
        </div>
        <div className="flex items-center pl-4">
             <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(report.id);
                }}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
                aria-label="Delete report"
            >
                <TrashIcon className="w-5 h-5" />
            </button>
            <button onClick={() => setIsOpen(!isOpen)} disabled={report.status === 'pending'} className="p-2 ml-2">
                <ChevronIcon className={`w-6 h-6 text-gray-500 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
        </div>
      </div>

       <div className={`transition-all duration-500 ease-in-out grid ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
           <div className="px-4 md:px-6 pb-6 border-t border-gray-200">
            <div className="mt-4">
              {report.status === 'unanalyzed' && <AnalysisActions />}
              {report.status === 'pending' && (
                <div className="flex flex-col items-center justify-center text-gray-500 py-8">
                  <div className="w-8 h-8"><Spinner /></div>
                  <p className="mt-3 font-medium">AI analysis in progress...</p>
                </div>
              )}
              {report.status === 'completed' && <DataVisualization results={sortedResults} />}
              {report.status === 'failed' && (
                <div className="bg-red-50 text-red-700 p-4 rounded-md">
                  <p className="font-bold">Analysis Failed</p>
                  <p className="text-sm">{report.error || 'An unknown error occurred.'}</p>
                   <button
                      onClick={() => onAnalyse(report.id)}
                      className="mt-3 bg-red-600 text-white font-bold py-1 px-3 text-sm rounded-md hover:bg-red-700 transition-colors duration-200"
                  >
                      Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

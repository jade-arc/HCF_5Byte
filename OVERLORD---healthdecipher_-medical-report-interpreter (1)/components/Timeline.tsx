
import React from 'react';
import type { Report } from '../types';
import { ReportCard } from './ReportCard';

interface TimelineProps {
  reports: Report[];
  onAnalyse: (id: string) => void;
  onDelete: (id: string) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ reports, onAnalyse, onDelete }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-dark mb-6">Your Health Timeline</h2>
      {reports.length === 0 ? (
        <div className="bg-white text-center p-12 rounded-xl shadow-sm">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No reports yet</h3>
            <p className="mt-1 text-sm text-gray-500">Upload your first medical report to get started.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reports.map((report, index) => (
            <div 
              key={report.id} 
              className="fade-in-up" 
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ReportCard report={report} onAnalyse={onAnalyse} onDelete={onDelete} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


import React from 'react';
import type { Prescription } from '../types';
import { PrescriptionCard } from './PrescriptionCard';

interface PrescriptionListProps {
  prescriptions: Prescription[];
  onAnalyse: (id: string) => void;
  onDelete: (id: string) => void;
}

export const PrescriptionList: React.FC<PrescriptionListProps> = ({ prescriptions, onAnalyse, onDelete }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-dark mb-6">Your Prescriptions</h2>
      {prescriptions.length === 0 ? (
        <div className="bg-white text-center p-12 rounded-xl shadow-sm">
          <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m9.75 9.75-2.625-2.625M9.75 9.75l4.875 4.875m0 0a3.375 3.375 0 0 1-4.875 0 3.375 3.375 0 0 1 0-4.875" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No prescriptions yet</h3>
          <p className="mt-1 text-sm text-gray-500">Upload your first prescription to store it here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((prescription) => (
            <PrescriptionCard 
                key={prescription.id} 
                prescription={prescription} 
                onAnalyse={onAnalyse}
                onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

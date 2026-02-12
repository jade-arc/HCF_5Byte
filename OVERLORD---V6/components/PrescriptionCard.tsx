
import React, { useState } from 'react';
import type { Prescription } from '../types';
import { PrescriptionIcon } from './icons/PrescriptionIcon';
import { ChevronIcon } from './icons/ChevronIcon';
import { Spinner } from './Spinner';

interface PrescriptionCardProps {
  prescription: Prescription;
  onAnalyse: (id: string) => void;
  isAnalysisDisabled: boolean;
}

export const PrescriptionCard: React.FC<PrescriptionCardProps> = ({ prescription, onAnalyse, isAnalysisDisabled }) => {
  const [isOpen, setIsOpen] = useState(false);
    
  const handleViewClick = () => {
    const url = `data:${prescription.mimeType};base64,${prescription.fileData}`;
    window.open(url, '_blank');
  };

  const hasResults = prescription.status === 'completed' && prescription.results && prescription.results.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300">
        <div className="p-4 md:p-6 flex items-start justify-between">
            <div className="flex items-start space-x-4">
                <PrescriptionIcon className="w-8 h-8 text-secondary flex-shrink-0 mt-1" />
                <div>
                    <p className="text-sm text-gray-500">
                        {new Date(prescription.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <h3 className="text-md font-semibold text-dark break-all">{prescription.fileName}</h3>
                    <div className="mt-1">
                        {prescription.status === 'unanalyzed' && <span className="px-2 py-0.5 text-xs font-semibold text-gray-700 bg-gray-200 rounded-full">Not Analyzed</span>}
                        {prescription.status === 'pending' && <span className="px-2 py-0.5 text-xs font-semibold text-white bg-blue-500 rounded-full">Analyzing...</span>}
                        {prescription.status === 'failed' && <span className="px-2 py-0.5 text-xs font-semibold text-white bg-gray-500 rounded-full">Failed</span>}
                        {prescription.status === 'completed' && <span className="px-2 py-0.5 text-xs font-semibold text-white bg-green-500 rounded-full">Analyzed</span>}
                    </div>
                </div>
            </div>
            <div className="flex items-center ml-4">
                <button
                    onClick={handleViewClick}
                    className="bg-gray-200 text-dark font-bold py-2 px-3 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                >
                    View File
                </button>
                 {hasResults && (
                    <button onClick={() => setIsOpen(!isOpen)} className="p-2 ml-2">
                        <ChevronIcon className={`w-6 h-6 text-gray-500 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                )}
            </div>
        </div>

        {(prescription.status === 'unanalyzed' || prescription.status === 'failed') && (
            <div className="px-4 md:px-6 pb-4 border-t border-gray-200 pt-4 text-center">
                <button 
                    onClick={() => onAnalyse(prescription.id)} 
                    disabled={isAnalysisDisabled}
                    className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {prescription.status === 'failed' ? 'Try Analysis Again' : 'Analyse Prescription'}
                </button>
                {isAnalysisDisabled && <p className="text-xs text-gray-500 mt-2">Please add an API key in Settings to enable analysis.</p>}
                {prescription.status === 'failed' && <p className="text-red-600 text-sm mt-2">{prescription.error}</p>}
            </div>
        )}

        {prescription.status === 'pending' && (
             <div className="px-4 md:px-6 pb-4 border-t border-gray-200 pt-4 flex justify-center items-center gap-2 text-gray-500">
                <div className="w-5 h-5"><Spinner /></div>
                <span>Analysis in progress...</span>
             </div>
        )}

        {isOpen && hasResults && (
            <div className="px-4 md:px-6 pb-4 border-t border-gray-200">
                {prescription.results?.map((item, index) => (
                    <div key={index} className="py-3 border-b border-gray-100 last:border-b-0">
                        <h4 className="font-bold text-primary">{item.Medication}</h4>
                        <div className="grid grid-cols-3 gap-x-4 text-sm mt-1">
                            <div><strong className="text-gray-500 block">Dosage:</strong> {item.Dosage}</div>
                            <div><strong className="text-gray-500 block">Frequency:</strong> {item.Frequency}</div>
                            <div className="col-span-3 mt-1"><strong className="text-gray-500 block">Reason:</strong> {item.Reason}</div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};

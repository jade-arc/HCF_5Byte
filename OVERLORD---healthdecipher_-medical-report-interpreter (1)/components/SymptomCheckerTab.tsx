
import React, { useState } from 'react';
import { BrainIcon } from './icons/BrainIcon';
import { StyledButton } from './ui/StyledButton';
import { Spinner } from './Spinner';
import type { Report, SymptomCorrelation } from '../types';
import * as geminiService from '../services/geminiService';

interface SymptomCheckerTabProps {
    reports: Report[];
}

export const SymptomCheckerTab: React.FC<SymptomCheckerTabProps> = ({ reports }) => {
    const [symptoms, setSymptoms] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<SymptomCorrelation | null>(null);

    const handleAnalyze = async () => {
        if (!symptoms.trim()) {
            setError("Please describe your symptoms before analyzing.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const apiKey = localStorage.getItem('gemini-api-key');
            if (!apiKey) {
                throw new Error("API Key not found. Please go to the Settings page to add your Gemini API key.");
            }
            const latestReport = reports
                .filter(r => r.status === 'completed')
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] || null;

            const analysisResult = await geminiService.correlateSymptoms(symptoms, latestReport, apiKey);
            setResult(analysisResult);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                <h2 className="text-2xl font-bold text-dark mb-4 flex items-center gap-2">
                    <BrainIcon className="w-6 h-6" />
                    <span>AI Symptom Checker</span>
                </h2>
                <p className="text-gray-600 mb-6">
                    Describe your symptoms, and our AI will analyze potential correlations with your latest lab results. This is not a medical diagnosis. Always consult a healthcare professional.
                </p>
                <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:outline-none focus:ring-primary focus:border-primary bg-white text-gray-900"
                    placeholder="e.g., I've been feeling very tired and getting short of breath easily..."
                    disabled={isLoading}
                />
                <div className="mt-4">
                    <StyledButton onClick={handleAnalyze} disabled={isLoading || !symptoms.trim()}>
                        {isLoading ? <Spinner className="w-5 h-5" /> : 'Analyze Symptoms'}
                    </StyledButton>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                    <p className="font-bold">Analysis Error</p>
                    <p>{error}</p>
                </div>
            )}

            {result && (
                 <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 fade-in-up">
                    <h3 className="text-xl font-bold text-dark mb-4">Analysis Results for: "{result.Symptom}"</h3>
                    {result.PossibleCauses.length > 0 ? (
                        <div className="space-y-3 mb-4">
                            <h4 className="font-semibold text-gray-700">Potential Correlations from Lab Data:</h4>
                            {result.PossibleCauses.map((cause, index) => (
                                <div key={index} className="p-3 bg-light rounded-lg border border-gray-200">
                                    <p className="font-bold text-dark">{cause.Biomarker} ({cause.Finding})</p>
                                    <p className="text-sm text-gray-600">{cause.Explanation}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 mb-4">No direct correlations found with your recent lab data.</p>
                    )}
                    <div>
                         <h4 className="font-semibold text-gray-700">Suggested Action:</h4>
                         <p className="text-gray-600 mt-1">{result.SuggestedAction}</p>
                    </div>
                 </div>
            )}
        </div>
    );
};

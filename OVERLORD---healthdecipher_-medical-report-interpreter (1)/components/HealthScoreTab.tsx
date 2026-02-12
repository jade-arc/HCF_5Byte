
import React, { useState, useEffect } from 'react';
import type { Report, HealthSummary } from '../types';
import { getHealthSummary } from '../services/healthAnalysisService';
import { RiskScoreGauge } from './RiskScoreGauge';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';

interface HealthScoreTabProps {
    reports: Report[];
}

export const HealthScoreTab: React.FC<HealthScoreTabProps> = ({ reports }) => {
    const [summary, setSummary] = useState<HealthSummary | null>(null);

    useEffect(() => {
        const completedReports = reports.filter(r => r.status === 'completed');
        if (completedReports.length > 0) {
            // The service automatically uses the latest report for the summary
            setSummary(getHealthSummary(completedReports));
        } else {
            setSummary(null);
        }
    }, [reports]);

    return (
        <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                <h2 className="text-2xl font-bold text-dark mb-2 flex items-center gap-2">
                    <ShieldCheckIcon className="w-6 h-6" />
                    <span>Health Risk Score</span>
                </h2>
                <p className="text-gray-600 mb-6">This score is based on your most recently analyzed lab report.</p>

                {summary ? (
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <RiskScoreGauge score={summary.riskScore} level={summary.riskLevel} />
                        <div className="flex-1">
                            <h3 className="font-bold text-lg text-dark">Contributing Factors</h3>
                            <p className="text-sm text-gray-500 mb-2">Key results from your latest report influencing this score.</p>
                            <ul className="space-y-1 text-sm">
                                {summary.primaryFactors.map((factor, i) => <li key={i} className="font-semibold text-red-600">Primary: {factor}</li>)}
                                {summary.secondaryFactors.map((factor, i) => <li key={i} className="text-yellow-700">Secondary: {factor}</li>)}
                                 {summary.primaryFactors.length === 0 && summary.secondaryFactors.length === 0 && (
                                    <li className="text-green-600 font-medium">No abnormal factors detected. Great job!</li>
                                )}
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">No score to display</h3>
                        <p className="mt-1 text-sm text-gray-500">Upload and analyze a report to calculate your health score.</p>
                    </div>
                )}
            </div>

             {summary && summary.preventiveSuggestions.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-dark mb-4">Preventive Health Suggestions</h2>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {summary.preventiveSuggestions.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                </div>
            )}
        </div>
    );
};

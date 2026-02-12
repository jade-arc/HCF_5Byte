
import React, { useState, useEffect } from 'react';
import type { Profile, Prescription, Report, Medication } from '../types';
import { DocumentIcon } from './icons/DocumentIcon';
import { PrescriptionIcon } from './icons/PrescriptionIcon';
import { getBiomarkerTrends } from '../services/healthAnalysisService';
import { TrendUpIcon } from './icons/TrendUpIcon';
import { TrendDownIcon } from './icons/TrendDownIcon';
import { TrendStableIcon } from './icons/TrendStableIcon';
import { PillIcon } from './icons/PillIcon';

interface HomeTabProps {
    profile: Profile;
    prescriptions: Prescription[];
    reports: Report[];
    medications: Medication[];
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number | string }> = ({ icon, label, value }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 h-full">
        <div className="bg-primary/10 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-3xl font-bold text-primary">{value}</p>
            <p className="text-gray-500 font-medium">{label}</p>
        </div>
    </div>
);

const TrendIcon: React.FC<{ trend: 'Improving' | 'Worsening' | 'Stable' }> = ({ trend }) => {
    switch (trend) {
        case 'Improving': return <TrendDownIcon className="w-5 h-5 text-green-500" />;
        case 'Worsening': return <TrendUpIcon className="w-5 h-5 text-red-500" />;
        case 'Stable': return <TrendStableIcon className="w-5 h-5 text-gray-500" />;
        default: return null;
    }
}

export const HomeTab: React.FC<HomeTabProps> = ({ profile, prescriptions, reports, medications }) => {
    const [trends, setTrends] = useState<ReturnType<typeof getBiomarkerTrends>>([]);

    useEffect(() => {
        const completedReports = reports.filter(r => r.status === 'completed');
        if (completedReports.length > 0) {
            setTrends(getBiomarkerTrends(completedReports, medications));
        } else {
            setTrends([]);
        }
    }, [reports, medications]);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-dark">Hello, {profile.name || 'User'}!</h1>
                <p className="text-gray-600 mt-1">Welcome to your personal health dashboard.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-8">
                     <StatCard 
                        icon={<DocumentIcon className="w-8 h-8 text-primary" />} 
                        label="Total Reports" 
                        value={reports.length} 
                    />
                    <StatCard 
                        icon={<PrescriptionIcon className="w-8 h-8 text-primary" />} 
                        label="Total Prescriptions" 
                        value={prescriptions.length} 
                    />
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 h-full">
                    <h2 className="text-2xl font-bold text-dark mb-4">Biomarker Trends</h2>
                    {trends.length > 0 ? (
                        <ul className="space-y-3">
                            {trends.map(t => (
                                <li key={t.term} className="p-2 bg-light rounded-md">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-dark">{t.term}</span>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <TrendIcon trend={t.trend} />
                                            <span>{t.trend}</span>
                                        </div>
                                    </div>
                                    {t.medicationImpact && (
                                        <div className="flex items-center gap-1 mt-1 text-xs text-blue-600">
                                            <PillIcon className="w-3 h-3" />
                                            <span>{t.medicationImpact}</span>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 text-center py-4 text-sm">Upload and analyze at least two reports to see trend analysis.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

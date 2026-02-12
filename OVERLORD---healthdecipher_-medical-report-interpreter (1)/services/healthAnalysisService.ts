
import type { Report, HealthSummary, InterpretedResult, Medication } from '../types';

// Simple parser to extract a numerical value from a string like "14.5 g/dL"
const parseValue = (str: string): number | null => {
  if (!str) return null;
  const match = str.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
};

// --- TREND ANALYSIS ---

const TREND_TERMS = ['Hemoglobin', 'RBC', 'WBC', 'Platelets', 'Hematocrit'];

// A simple map of medications to the biomarkers they are expected to influence.
const MEDICATION_IMPACT_MAP: { [key: string]: { biomarkers: string[], desiredEffect: 'decrease' | 'increase' } } = {
    'statin': { biomarkers: ['ldl', 'cholesterol'], desiredEffect: 'decrease' },
    'metformin': { biomarkers: ['hba1c', 'glucose'], desiredEffect: 'decrease' },
    'levothyroxine': { biomarkers: ['tsh'], desiredEffect: 'decrease' },
    'iron': { biomarkers: ['hemoglobin', 'hematocrit', 'rbc'], desiredEffect: 'increase' }
};

const findRelevantMedication = (medicationName: string) => {
    const lowerMedName = medicationName.toLowerCase();
    for (const key in MEDICATION_IMPACT_MAP) {
        if (lowerMedName.includes(key)) {
            return { name: medicationName, ...MEDICATION_IMPACT_MAP[key] };
        }
    }
    return null;
}

export const getBiomarkerTrends = (
    reports: Report[],
    medications: Medication[]
): { term: string; trend: 'Improving' | 'Worsening' | 'Stable', medicationImpact?: string }[] => {
    if (reports.length < 2) return [];

    const sortedReports = reports.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const trends = TREND_TERMS.map(term => {
        const values: { value: number; status: string }[] = [];
        sortedReports.forEach(report => {
            const result = report.results.find(r => r.Term.toLowerCase() === term.toLowerCase());
            if (result) {
                const value = parseValue(result.Value);
                if (value !== null) {
                    values.push({ value, status: result.Status.toLowerCase() });
                }
            }
        });

        if (values.length < 2) return null;

        const first = values[0];
        const last = values[values.length - 1];
        
        let trend: 'Improving' | 'Worsening' | 'Stable' = 'Stable';

        // If status changed from abnormal to normal, it's improving.
        if (first.status !== 'normal' && last.status === 'normal') {
            trend = 'Improving';
        }
        // If status changed from normal to abnormal, it's worsening.
        else if (first.status === 'normal' && last.status !== 'normal') {
            trend = 'Worsening';
        } else {
            const diff = last.value - first.value;
            const changePercentage = Math.abs(diff / first.value);

            if (changePercentage >= 0.05) { // Only consider > 5% change
                // For values where lower is better (e.g., WBC), a decrease is an improvement
                if (term === 'WBC') {
                    trend = diff < 0 ? 'Improving' : 'Worsening';
                }
                // For values where higher is generally better (e.g., Hemoglobin), an increase is an improvement
                else if (['Hemoglobin', 'RBC', 'Hematocrit'].includes(term)) {
                     trend = diff > 0 ? 'Improving' : 'Worsening';
                }
            }
        }
        
        let medicationImpact: string | undefined = undefined;
        const relevantUserMeds = medications
            .map(m => ({ userMed: m, mappedMed: findRelevantMedication(m.name) }))
            .filter(m => m.mappedMed && m.mappedMed.biomarkers.includes(term.toLowerCase()));
        
        if (relevantUserMeds.length > 0) {
            const med = relevantUserMeds[0];
            const medStartDate = new Date(med.userMed.startDate);
            
            const firstReportDate = new Date(sortedReports[0].date);
            const lastReportDate = new Date(sortedReports[sortedReports.length - 1].date);
            
            if (medStartDate > firstReportDate && medStartDate < lastReportDate) {
                 medicationImpact = `Trend after starting ${med.userMed.name}.`;
            }
        }

        return { term, trend, medicationImpact };

    }).filter(Boolean);

    return trends as { term: string; trend: 'Improving' | 'Worsening' | 'Stable', medicationImpact?: string }[];
}


// --- RISK SCORING ---

const scoreParameter = (result: InterpretedResult): number => {
    const status = result.Status.toLowerCase();
    const term = result.Term.toLowerCase();
    
    // Assign higher weights to more critical parameters
    const termWeight = {
        hemoglobin: 3,
        wbc: 2, // White Blood Cell Count
        platelets: 2,
        rbc: 1, // Red Blood Cell Count
        hematocrit: 1,
    }[term] || 1;

    if (status === 'high') return 20 * termWeight;
    if (status === 'low') return 20 * termWeight;
    return 0; // Normal
};

export const getHealthSummary = (reports: Report[]): HealthSummary => {
    if (reports.length === 0) {
        return { riskScore: 0, riskLevel: 'Low', primaryFactors: [], secondaryFactors: [], preventiveSuggestions: [] };
    }

    // Use the latest report for scoring
    const latestReport = reports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    let totalScore = 0;
    const abnormalResults: (InterpretedResult & { score: number })[] = [];

    latestReport.results.forEach(result => {
        const score = scoreParameter(result);
        if (score > 0) {
            totalScore += score;
            abnormalResults.push({ ...result, score });
        }
    });
    
    // Cap score at 100
    const riskScore = Math.min(Math.round(totalScore), 100);

    let riskLevel: HealthSummary['riskLevel'] = 'Low';
    if (riskScore >= 60) riskLevel = 'High';
    else if (riskScore >= 30) riskLevel = 'Moderate';

    // Identify contributing factors
    abnormalResults.sort((a, b) => b.score - a.score);
    const primaryFactors = abnormalResults.slice(0, 1).map(r => `${r.Term} (${r.Status})`);
    const secondaryFactors = abnormalResults.slice(1, 3).map(r => `${r.Term} (${r.Status})`);
    
    // Generate suggestions (this would be more sophisticated in a real app)
    const suggestions = new Set<string>();
    if (riskLevel === 'High') {
        suggestions.add("Consult your doctor soon to discuss these results.");
    }
    if (abnormalResults.some(r => r.Term.toLowerCase() === 'hemoglobin' && r.Status.toLowerCase() === 'low')) {
        suggestions.add("Consider iron-rich foods like spinach, lentils, and red meat.");
    }
     if (abnormalResults.some(r => r.Term.toLowerCase() === 'wbc' && r.Status.toLowerCase() === 'high')) {
        suggestions.add("Focus on rest and hydration as your body may be fighting an infection.");
    }
     if (riskLevel === 'Low') {
        suggestions.add("Continue maintaining your healthy lifestyle and regular check-ups.");
    } else {
        suggestions.add("Ensure you are getting adequate sleep and managing stress levels.");
    }


    return {
        riskScore,
        riskLevel,
        primaryFactors,
        secondaryFactors,
        preventiveSuggestions: Array.from(suggestions),
    };
};

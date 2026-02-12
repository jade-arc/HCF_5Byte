
export interface InterpretedResult {
  Term: string;
  Status: 'High' | 'Low' | 'Normal' | string;
  Value: string; // e.g., "14.5 g/dL"
  NormalRange: string; // e.g., "13.5 - 17.5 g/dL"
  SimpleExplanation: string;
  ActionableAdvice: string;
  WhyItMatters?: string;
  WhenToWorry?: string;
}

export interface Report {
  id: string;
  date: string;
  fileName: string;
  results: InterpretedResult[];
  status: 'unanalyzed' | 'pending' | 'completed' | 'failed';
  error?: string;
  fileData?: string; // base64 encoded data
  mimeType?: string;
  confidenceScore?: number;
  confidenceReason?: string;
}

export interface InterpretedPrescription {
    Medication: string;
    Dosage: string;
    Frequency: string;
    Reason: string;
    FollowUpAppointment?: string; // e.g., "In 2 weeks", "On July 15th"
}

export interface Prescription {
  id: string;
  date: string;
  fileName: string;
  fileData: string; // base64 encoded data
  mimeType: string;
  status: 'unanalyzed' | 'pending' | 'completed' | 'failed';
  results?: InterpretedPrescription[];
  error?: string;
}

export interface Profile {
    name?: string;
    age?: string;
    gender?: string;
    bloodType?: string;
}

export interface Appointment {
    id: string;
    title: string;
    date: string; // Storing as YYYY-MM-DD
    time: string; // Storing as HH:MM
}

export interface UserCredentials {
    username: string;
    password: string;
}

export interface HealthSummary {
    riskScore: number;
    riskLevel: 'Low' | 'Moderate' | 'High';
    primaryFactors: string[];
    secondaryFactors: string[];
    preventiveSuggestions: string[];
}

export interface SymptomCorrelation {
    Symptom: string;
    PossibleCauses: {
        Biomarker: string;
        Finding: string;
        Explanation: string;
    }[];
    SuggestedAction: string;
}

export interface Medication {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  dosage?: string;
}

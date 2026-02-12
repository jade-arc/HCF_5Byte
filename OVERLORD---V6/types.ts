
export interface InterpretedResult {
  Term: string;
  Status: 'High' | 'Low' | 'Normal' | string;
  Value: string; // e.g., "14.5 g/dL"
  NormalRange: string; // e.g., "13.5 - 17.5 g/dL"
  SimpleExplanation: string;
  ActionableAdvice: string;
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
}

export interface InterpretedPrescription {
    Medication: string;
    Dosage: string;
    Frequency: string;
    Reason: string;
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

// This service acts as the API layer between the frontend and the (mock) backend.
// It translates frontend actions into calls to the database service.

import type { Report, Prescription, Profile, Appointment, UserCredentials, Medication } from '../types';
import * as db from './dbService';
import { interpretMedicalReport, interpretPrescription } from './geminiService';


// --- Helper Functions ---

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

// --- Auth Functions ---

export const signUp = async (credentials: UserCredentials): Promise<string> => {
  if (!credentials.password || credentials.password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
  }
  db.createUser(credentials);
  return signIn(credentials); // Auto sign-in after signup
};

export const signIn = async (credentials: UserCredentials): Promise<string> => {
  if (!db.verifyPassword(credentials)) {
    throw new Error('Invalid username or password.');
  }
  // The "token" is now just the username, to be held in App state.
  return credentials.username;
};

// Sign out is handled in App.tsx by clearing the state. No server action needed.
export const signOut = () => {};

// Token is no longer stored, so this is handled by App state.
export const getToken = (): string | null => null;


// --- Data Functions (per-user) ---

// Reports
export const getReports = async (username: string): Promise<Report[]> => db.getReportsForUser(username);
export const deleteReport = async (username: string, id: string): Promise<void> => db.deleteReportForUser(username, id);

export const addReports = async (username: string, files: FileList): Promise<Report[]> => {
    const newReports: Report[] = [];
    for (const file of Array.from(files)) {
        const base64Data = await fileToBase64(file);
        const newReport: Report = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            fileName: file.name,
            results: [],
            status: 'unanalyzed',
            fileData: base64Data,
            mimeType: file.type
        };
        db.addReportForUser(username, newReport);
        newReports.push(newReport);
    }
    return newReports;
}

export const updateReportStatus = async (username: string, id: string, status: Report['status'], error?: string): Promise<Report | null> => {
    const report = db.findReportForUser(username, id);
    if (!report) return null;
    
    report.status = status;
    if (error) report.error = error;

    return report;
}

export const analyseReport = async (username: string, id: string): Promise<Report> => {
    const report = db.findReportForUser(username, id);
    if (!report || !report.fileData || !report.mimeType) {
        throw new Error("Report data not found for analysis.");
    }

    const apiKey = localStorage.getItem('gemini-api-key'); 
    if (!apiKey) {
        throw new Error("API Key not found. Please go to the Settings page to add your Gemini API key.");
    }

    const { results, confidenceScore, confidenceReason } = await interpretMedicalReport(
        report.fileData,
        report.mimeType,
        apiKey,
        () => {}
    );

    report.results = results;
    report.confidenceScore = confidenceScore;
    report.confidenceReason = confidenceReason;
    report.status = 'completed';
    return report;
}


// Prescriptions
export const getPrescriptions = async (username: string): Promise<Prescription[]> => db.getPrescriptionsForUser(username);
export const deletePrescription = async (username: string, id: string): Promise<void> => db.deletePrescriptionForUser(username, id);

export const addPrescriptions = async (username: string, files: FileList): Promise<Prescription[]> => {
    const newPrescriptions: Prescription[] = [];
    for (const file of Array.from(files)) {
         const base64Data = await fileToBase64(file);
        const newPrescription: Prescription = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            fileName: file.name,
            fileData: base64Data,
            mimeType: file.type,
            status: 'unanalyzed'
        };
        db.addPrescriptionForUser(username, newPrescription);
        newPrescriptions.push(newPrescription);
    }
    return newPrescriptions;
}

export const updatePrescriptionStatus = async (username: string, id: string, status: Prescription['status'], error?: string): Promise<Prescription | null> => {
    const prescription = db.findPrescriptionForUser(username, id);
    if(!prescription) return null;

    prescription.status = status;
    if (error) prescription.error = error;
    
    return prescription;
}

export const analysePrescription = async (username: string, id: string): Promise<Prescription> => {
    const prescription = db.findPrescriptionForUser(username, id);
     if (!prescription || !prescription.fileData || !prescription.mimeType) {
        throw new Error("Prescription data not found.");
    }
    const apiKey = localStorage.getItem('gemini-api-key'); 
    if (!apiKey) {
        throw new Error("API Key not found. Please go to the Settings page to add your Gemini API key.");
    }
    const results = await interpretPrescription(prescription.fileData, prescription.mimeType, apiKey);
    prescription.results = results;
    prescription.status = 'completed';
    return prescription;
}


// Profile
export const getProfile = async (username: string): Promise<Profile> => db.getProfileForUser(username);
export const saveProfile = async (username: string, profile: Profile): Promise<void> => {
    db.saveProfileForUser(username, profile);
};

// Appointments
export const getAppointments = async (username: string): Promise<Appointment[]> => db.getAppointmentsForUser(username);

export const addAppointment = async (username: string, appointment: Omit<Appointment, 'id'>): Promise<Appointment> => {
    const newAppointment = { ...appointment, id: crypto.randomUUID() };
    db.addAppointmentForUser(username, newAppointment);
    return newAppointment;
};

export const deleteAppointment = async (username: string, id: string): Promise<void> => {
    db.deleteAppointmentForUser(username, id);
};

// Medications
export const getMedications = async (username: string): Promise<Medication[]> => db.getMedicationsForUser(username);
export const addMedication = async (username: string, medication: Omit<Medication, 'id'>): Promise<Medication> => {
    const newMedication = { ...medication, id: crypto.randomUUID() };
    db.addMedicationForUser(username, newMedication);
    return newMedication;
}
export const deleteMedication = async (username: string, id: string): Promise<void> => {
    db.deleteMedicationForUser(username, id);
};

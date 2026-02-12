
// This is a MOCK in-memory database to simulate a real backend.
// All data will be reset on page refresh.

import type { Report, Prescription, Profile, Appointment, UserCredentials, Medication } from '../types';

interface UserData {
    reports: Report[];
    prescriptions: Prescription[];
    profile: Profile;
    appointments: Appointment[];
    medications: Medication[];
}

interface Database {
    users: { [username: string]: { passwordHash: string } };
    data: { [username: string]: UserData };
}

// Initialize our in-memory database.
const db: Database = {
    users: {},
    data: {},
};

// --- Helper Functions ---

// A very simple mock hashing function for demonstration
const mockHash = (password: string) => `hashed_${password}_mock`;

// --- User Management ---

export const findUser = (username: string) => {
    return db.users[username] || null;
};

export const createUser = (credentials: UserCredentials) => {
    if (db.users[credentials.username]) {
        throw new Error('Username already exists.');
    }
    db.users[credentials.username] = {
        passwordHash: mockHash(credentials.password),
    };
    db.data[credentials.username] = {
        reports: [],
        prescriptions: [],
        profile: {},
        appointments: [],
        medications: [],
    };
    return db.users[credentials.username];
};

export const verifyPassword = (credentials: UserCredentials): boolean => {
    const user = findUser(credentials.username);
    return !!user && user.passwordHash === mockHash(credentials.password);
}


// --- Data Access Functions ---

const getUserData = (username: string): UserData => {
    if (!db.data[username]) {
        // This case should ideally not be hit if user is created properly
        db.data[username] = { reports: [], prescriptions: [], profile: {}, appointments: [], medications: [] };
    }
    return db.data[username];
};

// Reports
export const getReportsForUser = (username: string): Report[] => getUserData(username).reports;
export const addReportForUser = (username: string, report: Report): void => {
    getUserData(username).reports.unshift(report);
};
export const deleteReportForUser = (username: string, id: string): void => {
    const userData = getUserData(username);
    userData.reports = userData.reports.filter(r => r.id !== id);
};
export const findReportForUser = (username: string, id: string): Report | undefined => {
    return getUserData(username).reports.find(r => r.id === id);
};


// Prescriptions
export const getPrescriptionsForUser = (username: string): Prescription[] => getUserData(username).prescriptions;
export const addPrescriptionForUser = (username: string, p: Prescription): void => {
    getUserData(username).prescriptions.unshift(p);
};
export const deletePrescriptionForUser = (username: string, id: string): void => {
    const userData = getUserData(username);
    userData.prescriptions = userData.prescriptions.filter(p => p.id !== id);
};
export const findPrescriptionForUser = (username: string, id: string): Prescription | undefined => {
    return getUserData(username).prescriptions.find(p => p.id === id);
};

// Profile
export const getProfileForUser = (username: string): Profile => getUserData(username).profile;
export const saveProfileForUser = (username: string, profile: Profile): void => {
    getUserData(username).profile = profile;
};

// Appointments
export const getAppointmentsForUser = (username: string): Appointment[] => getUserData(username).appointments;
export const addAppointmentForUser = (username: string, app: Appointment): void => {
    getUserData(username).appointments.push(app);
};
export const deleteAppointmentForUser = (username: string, id: string): void => {
    const userData = getUserData(username);
    userData.appointments = userData.appointments.filter(a => a.id !== id);
};

// Medications
export const getMedicationsForUser = (username: string): Medication[] => getUserData(username).medications;
export const addMedicationForUser = (username: string, med: Medication): void => {
    getUserData(username).medications.push(med);
};
export const deleteMedicationForUser = (username: string, id: string): void => {
    const userData = getUserData(username);
    userData.medications = userData.medications.filter(m => m.id !== id);
};

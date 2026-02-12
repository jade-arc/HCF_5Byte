
import type { Report, Prescription, Profile, Appointment } from '../types';

const DB_NAME = 'HealthDecipherDB';
const DB_VERSION = 2; // Incremented version for schema change
const REPORTS_STORE = 'reports';
const PRESCRIPTIONS_STORE = 'prescriptions';
const PROFILE_STORE = 'profile';
const APPOINTMENTS_STORE = 'appointments';

let db: IDBDatabase;

export const initDB = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(true);
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Error opening DB', request.error);
      reject(false);
    };

    request.onsuccess = () => {
      db = request.result;
      console.log('Database opened successfully');
      resolve(true);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(REPORTS_STORE)) {
        db.createObjectStore(REPORTS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(PRESCRIPTIONS_STORE)) {
        db.createObjectStore(PRESCRIPTIONS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(PROFILE_STORE)) {
        // Use a fixed key 'userProfile' since there's only one.
        db.createObjectStore(PROFILE_STORE, { keyPath: 'id' });
      }
       if (!db.objectStoreNames.contains(APPOINTMENTS_STORE)) {
        db.createObjectStore(APPOINTMENTS_STORE, { keyPath: 'id' });
      }
    };
  });
};

const getStore = (storeName: string, mode: IDBTransactionMode) => {
  const tx = db.transaction(storeName, mode);
  return tx.objectStore(storeName);
};

// Report Functions
export const addReport = (report: Report): Promise<void> => {
    return new Promise((resolve, reject) => {
        const store = getStore(REPORTS_STORE, 'readwrite');
        const request = store.add(report);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const updateReport = (report: Report): Promise<void> => {
    return new Promise((resolve, reject) => {
        const store = getStore(REPORTS_STORE, 'readwrite');
        const request = store.put(report);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const deleteReport = (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const store = getStore(REPORTS_STORE, 'readwrite');
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const getReports = (): Promise<Report[]> => {
    return new Promise((resolve, reject) => {
        const store = getStore(REPORTS_STORE, 'readonly');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        request.onerror = () => reject(request.error);
    });
};

// Prescription Functions
export const addPrescription = (prescription: Prescription): Promise<void> => {
    return new Promise((resolve, reject) => {
        const store = getStore(PRESCRIPTIONS_STORE, 'readwrite');
        const request = store.add(prescription);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const updatePrescription = (prescription: Prescription): Promise<void> => {
    return new Promise((resolve, reject) => {
        const store = getStore(PRESCRIPTIONS_STORE, 'readwrite');
        const request = store.put(prescription);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const getPrescriptions = (): Promise<Prescription[]> => {
    return new Promise((resolve, reject) => {
        const store = getStore(PRESCRIPTIONS_STORE, 'readonly');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        request.onerror = () => reject(request.error);
    });
};

// Profile Functions
export const getProfile = (): Promise<Profile | undefined> => {
    return new Promise((resolve, reject) => {
        const store = getStore(PROFILE_STORE, 'readonly');
        const request = store.get('userProfile'); // Fixed key
        request.onsuccess = () => resolve(request.result?.data);
        request.onerror = () => reject(request.error);
    });
};

export const saveProfile = (profile: Profile): Promise<void> => {
    return new Promise((resolve, reject) => {
        const store = getStore(PROFILE_STORE, 'readwrite');
        const request = store.put({ id: 'userProfile', data: profile });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

// Appointment Functions
export const addAppointment = (appointment: Appointment): Promise<void> => {
    return new Promise((resolve, reject) => {
        const store = getStore(APPOINTMENTS_STORE, 'readwrite');
        const request = store.add(appointment);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const getAppointments = (): Promise<Appointment[]> => {
    return new Promise((resolve, reject) => {
        const store = getStore(APPOINTMENTS_STORE, 'readonly');
        const request = store.getAll();
        request.onsuccess = () => {
            const sorted = request.result.sort((a,b) => {
                const dateA = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
                const dateB = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
                return dateA - dateB;
            });
            resolve(sorted);
        }
        request.onerror = () => reject(request.error);
    });
};

export const deleteAppointment = (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const store = getStore(APPOINTMENTS_STORE, 'readwrite');
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};
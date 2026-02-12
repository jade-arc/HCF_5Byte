
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { Timeline } from './components/Timeline';
import { PrescriptionList } from './components/PrescriptionList';
import { interpretMedicalReport, validateApiKey, interpretPrescription } from './services/geminiService';
import * as db from './services/dbService';
import type { Report, Prescription, Profile, Appointment } from './types';
import { PrescriptionIcon } from './components/icons/PrescriptionIcon';
import { KeyIcon } from './components/icons/KeyIcon';
import { StatusBar } from './components/StatusBar';
import { Spinner } from './components/Spinner';
import { CheckCircleIcon } from './components/icons/CheckCircleIcon';
import { XCircleIcon } from './components/icons/XCircleIcon';
import { ProfileTab } from './components/ProfileTab';
import { AppointmentsTab } from './components/AppointmentsTab';


type ActiveTab = 'reports' | 'prescriptions' | 'appointments' | 'profile' | 'settings';

const App: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [profile, setProfile] = useState<Profile>({});
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [isUploadingPrescription, setIsUploadingPrescription] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('reports');
  const [isDbInitialized, setIsDbInitialized] = useState<boolean>(false);

  // API Key validation states
  const [isVerifyingKey, setIsVerifyingKey] = useState<boolean>(false);
  const [keyVerificationStatus, setKeyVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [keyVerificationMessage, setKeyVerificationMessage] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      await db.initDB();
      setIsDbInitialized(true);
      const [
        storedReports, 
        storedPrescriptions, 
        storedProfile,
        storedAppointments
      ] = await Promise.all([
        db.getReports(),
        db.getPrescriptions(),
        db.getProfile(),
        db.getAppointments(),
      ]);
      setReports(storedReports);
      setPrescriptions(storedPrescriptions);
      if (storedProfile) setProfile(storedProfile);
      setAppointments(storedAppointments);
    }
    loadData();

    const storedApiKey = localStorage.getItem('gemini-api-key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setApiKeyInput(storedApiKey);
      setKeyVerificationStatus('success');
    }
  }, []);

  useEffect(() => {
    const hasPendingReports = reports.some(r => r.status === 'pending');
    const hasPendingPrescriptions = prescriptions.some(p => p.status === 'pending');
    setIsLoading(hasPendingReports || hasPendingPrescriptions);
    if (hasPendingReports || hasPendingPrescriptions) {
      setLoadingMessage('Analyzing documents in background...');
    } else {
      setLoadingMessage('');
    }
  }, [reports, prescriptions]);

  const handleApiKeySave = async () => {
    setIsVerifyingKey(true);
    setKeyVerificationStatus('idle');
    setKeyVerificationMessage('');

    const { isValid, message } = await validateApiKey(apiKeyInput);

    if (isValid) {
        setKeyVerificationStatus('success');
        localStorage.setItem('gemini-api-key', apiKeyInput);
        setApiKey(apiKeyInput);
    } else {
        setKeyVerificationStatus('error');
    }
    
    setKeyVerificationMessage(message);
    setIsVerifyingKey(false);
  };

  const processFileForAnalysis = async (fileData: string, mimeType: string, reportId: string) => {
    try {
      const interpretedResults = await interpretMedicalReport(
        fileData,
        mimeType,
        apiKey,
        (message) => {
          console.log(`[${reportId}]: ${message}`);
        }
      );

      const reportToUpdate = await db.getReports().then(reports => reports.find(r => r.id === reportId));
      if (!reportToUpdate) return;

      const completedReport: Report = {
        ...reportToUpdate,
        results: interpretedResults,
        status: 'completed',
        fileData: undefined, // Clear file data after processing
        mimeType: undefined,
      };
      await db.updateReport(completedReport);
      setReports(prev => prev.map(r => r.id === reportId ? completedReport : r).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

    } catch (err) {
      console.error(`Failed to process ${reportId}:`, err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      
      const reportToUpdate = await db.getReports().then(reports => reports.find(r => r.id === reportId));
      if (!reportToUpdate) return;
      
      const failedReport: Report = {
        ...reportToUpdate,
        status: 'failed',
        error: errorMessage,
      };
      await db.updateReport(failedReport);
      setReports(prev => prev.map(r => r.id === reportId ? failedReport : r).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (!isDbInitialized) {
      setError("Database is not ready. Please try again in a moment.");
      return;
    }
    setError(null);

    const newUnanalyzedReports: Report[] = [];
    for (const file of Array.from(files)) {
        const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
        });

        const newReport: Report = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            fileName: file.name,
            results: [],
            status: 'unanalyzed',
            fileData: base64Data,
            mimeType: file.type
        };
        newUnanalyzedReports.push(newReport);
        await db.addReport(newReport);
    }

    setReports(prev => [...newUnanalyzedReports, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const handleAnalyseReport = async (reportId: string) => {
    if (!apiKey) {
      setError("Please add your Gemini API key to analyze reports.");
      return;
    }

    const reportToAnalyze = reports.find(r => r.id === reportId);
    if (!reportToAnalyze || !reportToAnalyze.fileData || !reportToAnalyze.mimeType) {
        setError("Report data is missing, cannot analyze.");
        return;
    }

    const pendingReport: Report = { ...reportToAnalyze, status: 'pending' };
    setReports(prev => prev.map(r => r.id === reportId ? pendingReport : r));
    await db.updateReport(pendingReport);

    processFileForAnalysis(reportToAnalyze.fileData, reportToAnalyze.mimeType, reportId);
  };

  const handleDeleteReport = async (reportId: string) => {
    if (window.confirm("Are you sure you want to delete this report? This action cannot be undone.")) {
        await db.deleteReport(reportId);
        setReports(prev => prev.filter(r => r.id !== reportId));
    }
  };
  
  const handlePrescriptionUpload = async (files: FileList) => {
    setIsUploadingPrescription(true);
    setError(null);

    const newPrescriptions: Prescription[] = [];
    for (const file of Array.from(files)) {
        const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
        });

        const newPrescription: Prescription = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            fileName: file.name,
            fileData: base64Data,
            mimeType: file.type,
            status: 'unanalyzed'
        };
        newPrescriptions.push(newPrescription);
        await db.addPrescription(newPrescription);
    }
    
    setPrescriptions(prev => [...newPrescriptions, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setIsUploadingPrescription(false);
  };

    const handleAnalysePrescription = async (prescriptionId: string) => {
        if (!apiKey) {
            setError("Please add your API key to analyze prescriptions.");
            return;
        }

        const prescription = prescriptions.find(p => p.id === prescriptionId);
        if (!prescription) return;

        setPrescriptions(prev => prev.map(p => p.id === prescriptionId ? { ...p, status: 'pending' } : p));
        await db.updatePrescription({ ...prescription, status: 'pending' });

        try {
            const results = await interpretPrescription(prescription.fileData, prescription.mimeType, apiKey);
            const completed: Prescription = { ...prescription, status: 'completed', results };
            setPrescriptions(prev => prev.map(p => p.id === prescriptionId ? completed : p));
            await db.updatePrescription(completed);
        } catch (err) {
            const error = err instanceof Error ? err.message : "An unknown error occurred.";
            const failed: Prescription = { ...prescription, status: 'failed', error };
            setPrescriptions(prev => prev.map(p => p.id === prescriptionId ? failed : p));
            await db.updatePrescription(failed);
        }
    };

    const handleSaveProfile = async (newProfile: Profile) => {
        await db.saveProfile(newProfile);
        setProfile(newProfile);
    };

    const handleAddAppointment = async (appointment: Omit<Appointment, 'id'>) => {
        const newAppointment = { ...appointment, id: crypto.randomUUID() };
        await db.addAppointment(newAppointment);
        setAppointments(prev => [...prev, newAppointment].sort((a,b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()));
    };

    const handleDeleteAppointment = async (id: string) => {
        await db.deleteAppointment(id);
        setAppointments(prev => prev.filter(app => app.id !== id));
    };

  return (
    <div className="min-h-screen bg-light font-sans text-dark">
      <Header />
      <main className="container mx-auto p-4 md:p-8 max-w-4xl">
        <StatusBar isLoading={isLoading} loadingMessage={loadingMessage} />

        <div className="mb-6">
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {['reports', 'prescriptions', 'appointments', 'profile', 'settings'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as ActiveTab)}
                            className={`${
                                activeTab === tab
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } capitalize whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 focus:outline-none`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-8 rounded-md" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {activeTab === 'reports' && (
            <div className="space-y-8">
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-primary mb-4">Upload Lab Report</h2>
                    <p className="text-gray-600 mb-6">
                        Upload a PDF or image of your CBC report for AI analysis and a simple explanation.
                    </p>
                    <FileUpload 
                        onFileUpload={handleFileUpload} 
                        isLoading={isLoading} 
                        loadingText={loadingMessage}
                        isDisabled={!apiKey}
                        disabledText="Please save an API key to enable analysis."
                    />
                </div>
                <Timeline reports={reports} onAnalyse={handleAnalyseReport} onDelete={handleDeleteReport} />
            </div>
        )}

        {activeTab === 'prescriptions' && (
            <div className="space-y-8">
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-primary mb-4">Upload Prescription</h2>
                    <p className="text-gray-600 mb-6">
                        Upload a PDF or image of your doctor's prescription for secure storage and easy access.
                    </p>
                    <FileUpload 
                        onFileUpload={handlePrescriptionUpload} 
                        isLoading={isUploadingPrescription} 
                        loadingText="Uploading..." 
                        icon={<PrescriptionIcon className="w-12 h-12 mb-4" />} 
                    />
                </div>
                <PrescriptionList 
                    prescriptions={prescriptions} 
                    onAnalyse={handleAnalysePrescription}
                    isAnalysisDisabled={!apiKey}
                />
            </div>
        )}

        {activeTab === 'appointments' && (
            <AppointmentsTab 
                appointments={appointments}
                onAdd={handleAddAppointment}
                onDelete={handleDeleteAppointment}
            />
        )}

        {activeTab === 'profile' && (
            <ProfileTab profile={profile} onSave={handleSaveProfile} />
        )}

        {activeTab === 'settings' && (
             <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                    <KeyIcon className="w-6 h-6" />
                    <span>API Configuration</span>
                </h2>
                <p className="text-gray-600 mb-4">
                    To use the AI-powered report analysis, please provide your Google Gemini API key. Your key is stored securely in your browser's local storage.
                </p>
                <div className="flex items-start gap-2">
                    <div className="relative flex-grow">
                        <input
                            type="password"
                            value={apiKeyInput}
                             onChange={(e) => {
                                setApiKeyInput(e.target.value);
                                setKeyVerificationStatus('idle'); // Reset status on change
                                setKeyVerificationMessage('');
                            }}
                            placeholder="Enter your API Key"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none pr-10"
                        />
                         <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            {keyVerificationStatus === 'success' && !isVerifyingKey && <CheckCircleIcon className="w-5 h-5 text-green-500" />}
                            {keyVerificationStatus === 'error' && !isVerifyingKey && <XCircleIcon className="w-5 h-5 text-red-500" />}
                        </div>
                    </div>
                    <button
                        onClick={handleApiKeySave}
                        disabled={isVerifyingKey || !apiKeyInput}
                        className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center h-[42px] w-24"
                    >
                        {isVerifyingKey ? <div className="w-5 h-5"><Spinner className="text-white" /></div> : 'Save'}
                    </button>
                </div>
                {keyVerificationMessage && (
                    <p className={`mt-2 text-sm ${keyVerificationStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {keyVerificationMessage}
                    </p>
                )}
            </div>
        )}
      </main>
    </div>
  );
};

export default App;
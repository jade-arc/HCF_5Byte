
import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { FileUpload } from './components/FileUpload';
import { Timeline } from './components/Timeline';
import { PrescriptionList } from './components/PrescriptionList';
import * as authService from './services/authService';
import type { Report, Prescription, Profile, Appointment, UserCredentials, Medication } from './types';
import { PrescriptionIcon } from './components/icons/PrescriptionIcon';
import { ProfileTab } from './components/ProfileTab';
import { AppointmentsTab } from './components/AppointmentsTab';
import { ConnectionStatus } from './components/ConnectionStatus';
import { HomeTab } from './components/HomeTab';
import { AuthPage } from './components/AuthPage';
import { SettingsTab } from './components/SettingsTab';
import { OnboardingPage } from './components/OnboardingPage';
import { Spinner } from './components/Spinner';
import { SymptomCheckerTab } from './components/SymptomCheckerTab';
import { HealthScoreTab } from './components/HealthScoreTab';
import { MedicationsTab } from './components/MedicationsTab';


export type ActiveTab = 'home' | 'profile' | 'reports' | 'prescriptions' | 'medications' | 'appointments' | 'symptom-checker' | 'health-score' | 'settings';

const App: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [profile, setProfile] = useState<Profile>({});
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [isUploadingPrescription, setIsUploadingPrescription] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false); 
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Switch body class based on auth state for styling
  useEffect(() => {
    document.body.classList.toggle('login-view', !authToken);
    document.body.classList.toggle('app-view', !!authToken);
  }, [authToken]);

  const loadUserData = useCallback(async () => {
    if (!authToken) return;
    
    try {
      const [
        storedReports, 
        storedPrescriptions, 
        storedProfile,
        storedAppointments,
        storedMedications
      ] = await Promise.all([
        authService.getReports(authToken),
        authService.getPrescriptions(authToken),
        authService.getProfile(authToken),
        authService.getAppointments(authToken),
        authService.getMedications(authToken),
      ]);
      setReports(storedReports);
      setPrescriptions(storedPrescriptions);
      setMedications(storedMedications);
      if (storedProfile) {
        setProfile(storedProfile);
        setNeedsOnboarding(!storedProfile.name);
      } else {
        setNeedsOnboarding(true);
      }
      setAppointments(storedAppointments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user data.');
      handleLogout();
    }
  }, [authToken]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);


  useEffect(() => {
    const hasPendingReports = reports.some(r => r.status === 'pending');
    const hasPendingPrescriptions = prescriptions.some(p => p.status === 'pending');
    setIsLoading(hasPendingReports || hasPendingPrescriptions);
    if (hasPendingReports || hasPendingPrescriptions) {
      setLoadingMessage('Analyzing documents...');
    } else {
      setLoadingMessage('');
    }
  }, [reports, prescriptions]);

  const handleLogin = async (credentials: UserCredentials) => {
    setError(null);
    try {
      const token = await authService.signIn(credentials);
      setAuthToken(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    }
  };
  
  const handleSignup = async (credentials: UserCredentials) => {
    setError(null);
    try {
      const token = await authService.signUp(credentials);
      setAuthToken(token);
      setNeedsOnboarding(true); 
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    }
  };
  
  const handleLogout = () => {
    authService.signOut();
    setAuthToken(null);
    setReports([]);
    setPrescriptions([]);
    setMedications([]);
    setProfile({});
    setAppointments([]);
    setActiveTab('home');
    setNeedsOnboarding(false);
  };
  
  const handleAnalysisError = (err: unknown) => {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
     if (errorMessage.includes("API Key not found")) {
        setError(errorMessage);
        setActiveTab('settings');
    } else {
        setError(errorMessage);
    }
  }

  const processFileForAnalysis = async (reportId: string) => {
    if (!authToken) return;
    try {
      const completedReport = await authService.analyseReport(authToken, reportId);
      setReports(prev => prev.map(r => r.id === reportId ? completedReport : r).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (err) {
      handleAnalysisError(err);
      console.error(`Failed to process ${reportId}:`, err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      const failedReport = await authService.updateReportStatus(authToken, reportId, 'failed', errorMessage);
      if(failedReport) {
        setReports(prev => prev.map(r => r.id === reportId ? failedReport : r).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (!authToken) return;
    setError(null);
    let newReports: Report[] = [];
    try {
        newReports = await authService.addReports(authToken, files);
    } catch(err) {
        setError(err instanceof Error ? err.message : 'Failed to upload files.');
    }
    setReports(prev => [...newReports, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const handleAnalyseReport = async (reportId: string) => {
    if (!authToken) return;
    setError(null);
    const pendingReport = await authService.updateReportStatus(authToken, reportId, 'pending');
    if (pendingReport) {
        setReports(prev => prev.map(r => r.id === reportId ? pendingReport : r));
        processFileForAnalysis(reportId);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!authToken) return;
    if (window.confirm("Are you sure you want to delete this report? This action cannot be undone.")) {
        await authService.deleteReport(authToken, reportId);
        setReports(prev => prev.filter(r => r.id !== reportId));
    }
  };
  
  const handlePrescriptionUpload = async (files: FileList) => {
    if (!authToken) return;
    setIsUploadingPrescription(true);
    setError(null);
    let newPrescriptions: Prescription[] = [];
    try {
        newPrescriptions = await authService.addPrescriptions(authToken, files);
    } catch(err) {
        setError(err instanceof Error ? err.message : 'Failed to upload prescriptions.');
    }
    setPrescriptions(prev => [...newPrescriptions, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setIsUploadingPrescription(false);
  };
  
  const handleDeletePrescription = async (prescriptionId: string) => {
    if (!authToken) return;
    if (window.confirm("Are you sure you want to delete this prescription? This action cannot be undone.")) {
        await authService.deletePrescription(authToken, prescriptionId);
        setPrescriptions(prev => prev.filter(p => p.id !== prescriptionId));
    }
  };

    const handleAnalysePrescription = async (prescriptionId: string) => {
        if (!authToken) return;
        setError(null);
        let pendingPrescription: Prescription | null = null;
        try {
            pendingPrescription = await authService.updatePrescriptionStatus(authToken, prescriptionId, 'pending');
            setPrescriptions(prev => prev.map(p => p.id === prescriptionId ? pendingPrescription : p));

            const completed = await authService.analysePrescription(authToken, prescriptionId);
            setPrescriptions(prev => prev.map(p => p.id === prescriptionId ? completed : p));

            if (completed.results) {
                let medicationsAddedCount = 0;
                for (const item of completed.results) {
                    await handleAddMedication({
                        name: item.Medication,
                        dosage: item.Dosage,
                        startDate: new Date(completed.date).toISOString().split('T')[0],
                    });
                    medicationsAddedCount++;

                    if (item.FollowUpAppointment) {
                        await handleAddAppointment({
                            title: `Follow-up for ${item.Medication}`,
                            date: item.FollowUpAppointment,
                            time: ''
                        });
                        alert(`An appointment for "${item.Medication}" follow-up was automatically scheduled for ${item.FollowUpAppointment}!`);
                    }
                }
                 if (medicationsAddedCount > 0) {
                    alert(`${medicationsAddedCount} medication(s) from this prescription have been automatically added to your medication list.`);
                }
            }
        } catch (err) {
            handleAnalysisError(err);
            const error = err instanceof Error ? err.message : "An unknown error occurred.";
            const failed = await authService.updatePrescriptionStatus(authToken, prescriptionId, 'failed', error);
            if (failed) {
                setPrescriptions(prev => prev.map(p => p.id === prescriptionId ? failed : p));
            }
        }
    };

    const handleSaveProfile = async (newProfile: Profile) => {
        if (!authToken) return;
        await authService.saveProfile(authToken, newProfile);
        setProfile(newProfile);
    };

    const handleOnboardingComplete = async (newProfile: Profile) => {
        await handleSaveProfile(newProfile);
        setNeedsOnboarding(false);
    };

    const handleAddAppointment = async (appointment: Omit<Appointment, 'id'>) => {
        if (!authToken) return;
        const newAppointment = await authService.addAppointment(authToken, appointment);
        setAppointments(prev => [...prev, newAppointment].sort((a,b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()));
    };

    const handleDeleteAppointment = async (id: string) => {
        if (!authToken) return;
        await authService.deleteAppointment(authToken, id);
        setAppointments(prev => prev.filter(app => app.id !== id));
    };

    const handleAddMedication = async (medication: Omit<Medication, 'id'>) => {
        if (!authToken) return;
        const newMedication = await authService.addMedication(authToken, medication);
        setMedications(prev => [...prev, newMedication].sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()));
    };

    const handleDeleteMedication = async (id: string) => {
        if (!authToken) return;
        await authService.deleteMedication(authToken, id);
        setMedications(prev => prev.filter(med => med.id !== id));
    };
    
    if (isAuthLoading) {
      return (
        <div className="w-screen h-screen flex items-center justify-center bg-light">
             <div className="w-16 h-16"><Spinner/></div>
        </div>
      );
    }
    
    if (!authToken) {
        return <AuthPage onLogin={handleLogin} onSignup={handleSignup} error={error} />;
    }

    if (needsOnboarding) {
        return <OnboardingPage onComplete={handleOnboardingComplete} />;
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'home':
                return <HomeTab profile={profile} reports={reports} prescriptions={prescriptions} medications={medications} />;
            case 'profile':
                return <ProfileTab profile={profile} onSave={handleSaveProfile} />;
            case 'reports':
                return (
                    <div className="space-y-8">
                        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Upload Lab Report</h2>
                            <p className="text-gray-600 mb-6">
                                Upload a PDF or image of your CBC report for AI analysis and a simple explanation.
                            </p>
                            <FileUpload 
                                onFileUpload={handleFileUpload} 
                                isLoading={isLoading} 
                                loadingText={loadingMessage}
                            />
                        </div>
                        <Timeline reports={reports} onAnalyse={handleAnalyseReport} onDelete={handleDeleteReport} />
                    </div>
                );
            case 'prescriptions':
                 return (
                    <div className="space-y-8">
                        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Upload Prescription</h2>
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
                            onDelete={handleDeletePrescription}
                        />
                    </div>
                );
            case 'medications':
                return <MedicationsTab medications={medications} onAdd={handleAddMedication} onDelete={handleDeleteMedication} />;
            case 'appointments':
                return (
                    <AppointmentsTab 
                        appointments={appointments}
                        onAdd={handleAddAppointment}
                        onDelete={handleDeleteAppointment}
                    />
                );
            case 'symptom-checker':
                return <SymptomCheckerTab reports={reports} />;
            case 'health-score':
                return <HealthScoreTab reports={reports} />;
            case 'settings':
                return (
                   <SettingsTab onLogout={handleLogout} />
                );
        }
    }

  return (
    <div className="min-h-screen font-sans text-dark flex h-screen overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        reportsCount={reports.length}
        prescriptionsCount={prescriptions.length}
        medicationsCount={medications.length}
        onLogout={handleLogout}
      />
      <div className="flex-1 relative overflow-y-auto flex flex-col">
        <div className="absolute top-6 right-6 z-10">
          <ConnectionStatus />
        </div>
        <main className="p-4 md:p-8 flex-grow">
          <div className="max-w-4xl mx-auto w-full">
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-8 rounded-md" role="alert">
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            )}
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;

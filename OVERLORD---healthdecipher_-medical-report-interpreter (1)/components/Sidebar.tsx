
import React from 'react';
import type { ActiveTab } from '../App';
import { UserIcon } from './icons/UserIcon';
import { DocumentIcon } from './icons/DocumentIcon';
import { PrescriptionIcon } from './icons/PrescriptionIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { KeyIcon } from './icons/KeyIcon';
import { HomeIcon } from './icons/HomeIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { BrainIcon } from './icons/BrainIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { PillIcon } from './icons/PillIcon';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  reportsCount: number;
  prescriptionsCount: number;
  medicationsCount: number;
  onLogout: () => void;
}

const navItems = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'profile', label: 'Profile', icon: UserIcon },
  { id: 'reports', label: 'Reports', icon: DocumentIcon, countKey: 'reports' },
  { id: 'prescriptions', label: 'Prescriptions', icon: PrescriptionIcon, countKey: 'prescriptions' },
  { id: 'medications', label: 'Medications', icon: PillIcon, countKey: 'medications' },
  { id: 'appointments', label: 'Appointments', icon: CalendarIcon },
  { id: 'health-score', label: 'Health Score', icon: ShieldCheckIcon },
  { id: 'symptom-checker', label: 'Symptom Checker', icon: BrainIcon },
  { id: 'settings', label: 'Settings', icon: KeyIcon },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, reportsCount, prescriptionsCount, medicationsCount, onLogout }) => {
    const counts = {
        reports: reportsCount,
        prescriptions: prescriptionsCount,
        medications: medicationsCount,
    };
  
  return (
    <aside className="w-64 bg-white/70 backdrop-blur-md flex-shrink-0 m-4 rounded-2xl h-[calc(100vh-2rem)] sticky top-4 border border-gray-200/80">
     <div className="flex-grow flex flex-col p-4 relative z-10 h-full">
      <div className="flex items-center space-x-3 p-4 mb-6">
        <svg className="w-8 h-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
        </svg>
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">
          HealthDecipher
        </h1>
      </div>
      <nav className="flex-grow">
        <ul>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const count = item.countKey ? counts[item.countKey] : null;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id as ActiveTab)}
                  className={`w-full flex items-center justify-between gap-3 p-3 my-1 rounded-lg text-left font-semibold transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-dark'
                  }`}
                >
                    <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                    </div>
                  {count > 0 && (
                      <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
        <div className="mt-auto">
             <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 p-3 my-1 rounded-lg text-left font-semibold text-gray-600 hover:bg-gray-100 hover:text-dark transition-colors duration-200"
            >
                <LogoutIcon className="w-5 h-5" />
                <span>Logout</span>
            </button>
        </div>
      </div>
    </aside>
  );
};

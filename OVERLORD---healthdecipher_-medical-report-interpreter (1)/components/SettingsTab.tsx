
import React, { useState, useEffect } from 'react';
import { KeyIcon } from './icons/KeyIcon';
import { StyledButton } from './ui/StyledButton';
import { LogoutIcon } from './icons/LogoutIcon';
import { EyeIcon } from './icons/EyeIcon';
import { EyeSlashIcon } from './icons/EyeSlashIcon';

interface SettingsTabProps {
    onLogout: () => void;
}

const API_KEY_STORAGE_KEY = 'gemini-api-key';

export const SettingsTab: React.FC<SettingsTabProps> = ({ onLogout }) => {
    const [apiKey, setApiKey] = useState('');
    const [isKeySaved, setIsKeySaved] = useState(false);
    const [showKey, setShowKey] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    useEffect(() => {
        const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
        if (storedKey) {
            setApiKey(storedKey);
            setIsKeySaved(true);
        }
    }, []);

    const handleSaveKey = () => {
        localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
        setIsKeySaved(true);
        setSaveMessage('API Key saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
    };
    
    const handleClearKey = () => {
        localStorage.removeItem(API_KEY_STORAGE_KEY);
        setApiKey('');
        setIsKeySaved(false);
        setSaveMessage('API Key cleared.');
        setTimeout(() => setSaveMessage(''), 3000);
    }

    return (
        <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                <h2 className="text-2xl font-bold text-dark mb-4 flex items-center gap-2">
                    <KeyIcon className="w-6 h-6" />
                    <span>API Key Configuration</span>
                </h2>
                <p className="text-gray-600 mb-6">
                    Your Gemini API key is required to analyze medical documents. The key is stored securely in your browser's local storage and is never sent to our servers.
                </p>
                
                 {isKeySaved ? (
                    <div className="bg-green-100 text-green-800 p-3 rounded-md text-sm font-medium mb-4">
                       API Key is set and ready for analysis.
                    </div>
                ) : (
                     <div className="bg-yellow-100 text-yellow-800 p-3 rounded-md text-sm font-medium mb-4">
                       API Key is not set. Analysis features are disabled.
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">Gemini API Key</label>
                        <div className="relative mt-1">
                            <input 
                                type={showKey ? 'text' : 'password'}
                                id="apiKey" 
                                value={apiKey} 
                                onChange={(e) => setApiKey(e.target.value)}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-white text-gray-900 pr-10"
                                placeholder="Enter your API key here"
                            />
                            <button
                                type="button"
                                onClick={() => setShowKey(!showKey)}
                                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"
                                aria-label={showKey ? 'Hide key' : 'Show key'}
                            >
                                {showKey ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                         <StyledButton onClick={handleSaveKey} disabled={!apiKey}>
                            {isKeySaved ? 'Update Key' : 'Save Key'}
                        </StyledButton>
                         {isKeySaved && (
                            <button onClick={handleClearKey} className="text-sm text-red-600 hover:underline">
                                Clear Key
                            </button>
                        )}
                        {saveMessage && <span className="text-sm text-gray-600">{saveMessage}</span>}
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                <h2 className="text-2xl font-bold text-red-600 mb-4 flex items-center gap-2">
                    <LogoutIcon className="w-6 h-6" />
                    <span>Sign Out</span>
                </h2>
                <p className="text-gray-600 mb-6">
                    This will log you out of your account on this device. You can always sign back in later.
                </p>
                <button
                    onClick={onLogout}
                    className="bg-red-600 text-white font-bold py-2 px-5 rounded-lg shadow-md hover:bg-red-700 hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center h-[42px]"
                >
                   Sign Out
                </button>
            </div>
        </div>
    );
};

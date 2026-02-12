
import React, { useState } from 'react';
import type { Profile } from '../types';
import { StyledButton } from './ui/StyledButton';
import { Spinner } from './Spinner';

interface OnboardingPageProps {
  onComplete: (profile: Profile) => Promise<void>;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onComplete }) => {
    const [formData, setFormData] = useState<Profile>({
        name: '',
        age: '',
        gender: '',
        bloodType: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await onComplete(formData);
        setIsLoading(false);
    };

    const isFormValid = formData.name && formData.age;

    return (
        <div className="w-screen h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-primary tracking-tight mt-2">
                        Welcome to HealthDecipher!
                    </h1>
                    <p className="text-gray-500">Let's set up your profile to get started.</p>
                </div>
                <div className="liquid-glass rounded-xl p-6 md:p-8">
                    <div className="relative z-10">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name <span className="text-red-500">*</span></label>
                                <input type="text" name="name" id="name" value={formData.name || ''} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-white text-gray-900" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age <span className="text-red-500">*</span></label>
                                    <input type="number" name="age" id="age" value={formData.age || ''} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-white text-gray-900" />
                                </div>
                                <div>
                                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                                    <select name="gender" id="gender" value={formData.gender || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-white text-gray-900">
                                        <option value="">Select...</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                        <option value="Prefer not to say">Prefer not to say</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700">Blood Type</label>
                                <select name="bloodType" id="bloodType" value={formData.bloodType || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-white text-gray-900">
                                    <option value="">Select...</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                            </div>
                            <div className="pt-4">
                                <StyledButton type="submit" className="w-full" disabled={isLoading || !isFormValid}>
                                    {isLoading ? <Spinner className="w-5 h-5" /> : 'Save & Continue'}
                                </StyledButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

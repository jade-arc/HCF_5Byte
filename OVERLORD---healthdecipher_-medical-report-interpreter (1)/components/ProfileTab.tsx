
import React, { useState, useEffect } from 'react';
import type { Profile } from '../types';
import { UserIcon } from './icons/UserIcon';
import { StyledButton } from './ui/StyledButton';

interface ProfileTabProps {
    profile: Profile;
    onSave: (profile: Profile) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ profile, onSave }) => {
    const [formData, setFormData] = useState<Profile>(profile);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setFormData(profile);
    }, [profile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000); // Hide message after 2s
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
            <h2 className="text-2xl font-bold text-dark mb-6 flex items-center gap-2">
                <UserIcon className="w-6 h-6" />
                <span>Your Profile</span>
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input type="text" name="name" id="name" value={formData.name || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-white text-gray-900" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
                        <input type="number" name="age" id="age" value={formData.age || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-white text-gray-900" />
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
                <div className="pt-2 flex items-center gap-4">
                    <StyledButton type="submit">
                        Save Profile
                    </StyledButton>
                    {isSaved && <span className="text-green-600 text-sm font-medium">Profile saved!</span>}
                </div>
            </form>
        </div>
    );
};

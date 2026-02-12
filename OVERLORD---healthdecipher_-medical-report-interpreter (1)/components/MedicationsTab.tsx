
import React, { useState } from 'react';
import type { Medication } from '../types';
import { PillIcon } from './icons/PillIcon';
import { TrashIcon } from './icons/TrashIcon';
import { StyledButton } from './ui/StyledButton';

interface MedicationsTabProps {
    medications: Medication[];
    onAdd: (medication: Omit<Medication, 'id'>) => void;
    onDelete: (id: string) => void;
}

export const MedicationsTab: React.FC<MedicationsTabProps> = ({ medications, onAdd, onDelete }) => {
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [dosage, setDosage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !startDate) return;
        onAdd({ name, startDate, dosage });
        setName('');
        setStartDate('');
        setDosage('');
    };

    return (
        <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                <h2 className="text-2xl font-bold text-dark mb-4 flex items-center gap-2">
                    <PillIcon className="w-6 h-6" />
                    <span>Add New Medication</span>
                </h2>
                <p className="text-gray-600 mb-6">
                    Track your medications to see how they impact your lab results over time.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Medication Name</label>
                            <input type="text" name="name" id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Atorvastatin" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-white text-gray-900" />
                        </div>
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                            <input type="date" name="startDate" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-white text-gray-900" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="dosage" className="block text-sm font-medium text-gray-700">Dosage (Optional)</label>
                        <input type="text" name="dosage" id="dosage" value={dosage} onChange={e => setDosage(e.target.value)} placeholder="e.g., 20mg daily" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-white text-gray-900" />
                    </div>
                    <div className="pt-2">
                        <StyledButton type="submit">
                            Add Medication
                        </StyledButton>
                    </div>
                </form>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                <h2 className="text-2xl font-bold text-dark mb-4">Your Medications</h2>
                {medications.length === 0 ? (
                    <p className="text-gray-500">You have not added any medications yet.</p>
                ) : (
                    <ul className="space-y-3">
                        {medications.map(med => (
                            <li key={med.id} className="p-4 bg-light rounded-lg flex justify-between items-center transition-all hover:shadow-md hover:scale-[1.01] border border-gray-200">
                                <div>
                                    <p className="font-semibold text-dark">{med.name}</p>
                                    <p className="text-sm text-gray-600">
                                        Started: {new Date(`${med.startDate}T00:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        {med.dosage && ` - ${med.dosage}`}
                                    </p>
                                </div>
                                <button onClick={() => onDelete(med.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

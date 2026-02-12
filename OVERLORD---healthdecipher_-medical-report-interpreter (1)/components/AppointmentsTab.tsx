
import React, { useState } from 'react';
import type { Appointment } from '../types';
import { CalendarIcon } from './icons/CalendarIcon';
import { TrashIcon } from './icons/TrashIcon';
import { StyledButton } from './ui/StyledButton';

interface AppointmentsTabProps {
    appointments: Appointment[];
    onAdd: (appointment: Omit<Appointment, 'id'>) => void;
    onDelete: (id:string) => void;
}

export const AppointmentsTab: React.FC<AppointmentsTabProps> = ({ appointments, onAdd, onDelete }) => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !date) return;
        onAdd({ title, date, time });
        setTitle('');
        setDate('');
        setTime('');
    };

    return (
        <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                <h2 className="text-2xl font-bold text-dark mb-4 flex items-center gap-2">
                    <CalendarIcon className="w-6 h-6" />
                    <span>Add New Appointment</span>
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                        <input type="text" name="title" id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Annual Check-up" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-white text-gray-900" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                            <input type="date" name="date" id="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-white text-gray-900" />
                        </div>
                        <div>
                            <label htmlFor="time" className="block text-sm font-medium text-gray-700">Time (Optional)</label>
                            <input type="time" name="time" id="time" value={time} onChange={e => setTime(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-white text-gray-900" />
                        </div>
                    </div>
                    <div className="pt-2">
                        <StyledButton type="submit">
                            Add Reminder
                        </StyledButton>
                    </div>
                </form>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                <h2 className="text-2xl font-bold text-dark mb-4">Upcoming Appointments</h2>
                {appointments.length === 0 ? (
                    <p className="text-gray-500">You have no upcoming appointments.</p>
                ) : (
                    <ul className="space-y-3">
                        {appointments.map(app => (
                            <li key={app.id} className="p-4 bg-light rounded-lg flex justify-between items-center transition-all hover:shadow-md hover:scale-[1.01] border border-gray-200">
                                <div>
                                    <p className="font-semibold text-dark">{app.title}</p>
                                    <p className="text-sm text-gray-600">
                                        {new Date(`${app.date}T${app.time || '00:00'}`).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        {app.time && ` at ${new Date(`1970-01-01T${app.time}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
                                    </p>
                                </div>
                                <button onClick={() => onDelete(app.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
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

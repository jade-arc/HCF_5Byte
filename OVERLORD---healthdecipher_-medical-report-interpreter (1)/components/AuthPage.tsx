
import React, { useState } from 'react';
import type { UserCredentials } from '../types';
import { StyledButton } from './ui/StyledButton';
import { Spinner } from './Spinner';

interface AuthPageProps {
  onLogin: (credentials: UserCredentials) => Promise<void>;
  onSignup: (credentials: UserCredentials) => Promise<void>;
  error: string | null;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onSignup, error }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (isLoginView) {
      await onLogin({ username, password });
    } else {
      await onSignup({ username, password });
    }
    setIsLoading(false);
  };

  const pageTextColor = '#4f4242'; // Corresponds to 'dark' color in login theme
  const primaryColor = '#a65c5c'; // Corresponds to 'primary' color in login theme

  return (
    <div className="w-screen h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
            <div className="text-center mb-8">
                 <svg className="w-12 h-12 mx-auto" style={{ color: primaryColor }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
                </svg>
                <h1 className="text-3xl font-bold tracking-tight mt-2" style={{ color: primaryColor }}>
                    HealthDecipher
                </h1>
                <p style={{ color: '#5e5050' }}>Your personal health record, simplified.</p>
            </div>
            <div className="liquid-glass rounded-xl p-6 md:p-8">
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold text-center mb-6" style={{ color: primaryColor }}>
                        {isLoginView ? 'Sign In' : 'Create Account'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium" style={{ color: pageTextColor }}>Username</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 bg-white text-gray-900"
                                placeholder="healthuser"
                            />
                        </div>
                        <div>
                            <label htmlFor="password_auth" className="block text-sm font-medium" style={{ color: pageTextColor }}>Password</label>
                            <input
                                type="password"
                                id="password_auth"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 bg-white text-gray-900"
                                placeholder="••••••••"
                            />
                        </div>
                         {error && (
                            <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md">{error}</p>
                        )}
                        <div className="pt-2">
                            <StyledButton type="submit" className="w-full !bg-gradient-to-br !from-pink-500 !to-rose-500" disabled={isLoading}>
                               {isLoading ? <Spinner className="w-5 h-5" /> : (isLoginView ? 'Sign In' : 'Sign Up')}
                            </StyledButton>
                        </div>
                    </form>
                    <p className="text-center text-sm mt-6" style={{ color: pageTextColor }}>
                        {isLoginView ? "Don't have an account?" : "Already have an account?"}
                        <button onClick={() => setIsLoginView(!isLoginView)} className="font-semibold hover:underline ml-1" style={{ color: primaryColor }}>
                            {isLoginView ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
};

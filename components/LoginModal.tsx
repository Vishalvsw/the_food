import React, { useState } from 'react';
import { Role } from '../types';
import * as api from '../services/api';
import { ArrowRightIcon, UserIcon, XMarkIcon, EnvelopeIcon, SpinnerIcon, CheckCircleIcon, ArrowLeftIcon, BuildingStorefrontIcon, SparklesIcon } from './common/Icons';

type View = 'login' | 'forgotPassword' | 'resetSent';

const RoleButton = ({ role, title, icon, onLogin }: { role: Role, title: string, icon: React.ReactNode, onLogin: (role: Role) => void }) => (
    <button
        onClick={() => onLogin(role)}
        className="w-full flex items-center p-4 text-left bg-slate-100 hover:bg-indigo-100 rounded-lg transition-all group border border-slate-200 hover:border-indigo-300"
    >
        <div className="bg-white text-slate-600 p-3 rounded-lg mr-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            {icon}
        </div>
        <div className="flex-grow">
            <p className="font-bold text-slate-800 text-lg">{title}</p>
        </div>
        <ArrowRightIcon className="w-6 h-6 text-slate-400 transform transition-transform group-hover:translate-x-1 group-hover:text-indigo-600" />
    </button>
);


const LoginModal = ({ onClose, onLogin }: { onClose: () => void, onLogin: (role: Role) => void }) => {
    const [view, setView] = useState<View>('login');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }
        setIsLoading(true);
        setError('');
        await api.requestPasswordReset(email);
        setIsLoading(false);
        setView('resetSent');
    };

    const handleBackToLogin = () => {
        setView('login');
        setEmail('');
        setError('');
        setIsLoading(false);
    };

    const renderContent = () => {
        switch (view) {
            case 'forgotPassword':
                return (
                    <>
                        <div className="p-8 pb-4 text-center">
                            <h3 className="text-2xl font-bold text-slate-800">Reset Your Password</h3>
                            <p className="text-slate-600 mt-2">Enter your email and we'll send you a link to get back into your account.</p>
                        </div>
                        <form onSubmit={handlePasswordReset} className="p-8 pt-4 space-y-4">
                            <div>
                                <label htmlFor="email-reset" className="sr-only">Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <EnvelopeIcon className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <input
                                        id="email-reset"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        className={`w-full border rounded-lg px-3 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${error ? 'border-red-500' : 'border-slate-300'}`}
                                        required
                                    />
                                </div>
                                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center items-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-5 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
                            >
                                {isLoading ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
                            </button>
                            <button type="button" onClick={() => setView('login')} className="w-full text-center text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors py-2">
                                Back to Login
                            </button>
                        </form>
                    </>
                );
            case 'resetSent':
                return (
                    <div className="p-8 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="bg-green-100 text-green-600 p-4 rounded-full">
                                <CheckCircleIcon className="w-10 h-10" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800">Check Your Email</h3>
                        <p className="text-slate-600 mt-2">
                            We've sent a password reset link to <strong className="text-slate-800">{email}</strong>. Please check your inbox.
                        </p>
                        <button onClick={handleBackToLogin} className="mt-6 w-full bg-slate-200 text-slate-700 font-semibold py-3 px-5 rounded-lg hover:bg-slate-300 transition-colors">
                            Back to Login
                        </button>
                    </div>
                );
            case 'login':
            default:
                return (
                    <>
                        <div className="p-8 text-center">
                            <h3 className="text-2xl font-bold text-slate-800">Welcome to QuickMeal</h3>
                            <p className="text-slate-600 mt-2">Please select your role to continue.</p>
                        </div>

                        <div className="p-8 pt-0 space-y-4">
                            <RoleButton 
                                role={Role.Employee}
                                title="Login as Employee"
                                icon={<UserIcon className="w-7 h-7" />}
                                onLogin={onLogin}
                            />
                            <RoleButton 
                                role={Role.Vendor}
                                title="Login as Vendor"
                                icon={<BuildingStorefrontIcon className="w-7 h-7" />}
                                onLogin={onLogin}
                            />
                            <RoleButton 
                                role={Role.Admin}
                                title="Login as Admin"
                                icon={<SparklesIcon className="w-7 h-7" />}
                                onLogin={onLogin}
                            />
                            <div className="text-center pt-2">
                                <button onClick={() => setView('forgotPassword')} className="text-sm font-semibold text-indigo-600 hover:underline">
                                    Forgot Password?
                                </button>
                            </div>
                        </div>
                    </>
                );
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-md relative"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10 p-2">
                    <XMarkIcon className="w-6 h-6" />
                </button>
                {renderContent()}
            </div>
        </div>
    );
};

export default LoginModal;
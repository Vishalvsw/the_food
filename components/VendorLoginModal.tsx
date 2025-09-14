import React from 'react';
import { Role } from '../types';
import { BuildingStorefrontIcon, XMarkIcon } from './common/Icons';

const VendorLoginModal = ({ onClose, onLogin }: { onClose: () => void, onLogin: (role: Role) => void }) => {
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
                <div className="p-8 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-indigo-100 text-indigo-600 p-4 rounded-full">
                            <BuildingStorefrontIcon className="w-10 h-10" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800">Vendor Portal</h3>
                    <p className="text-slate-600 mt-2">Manage your menu, track orders, and grow your business with QuickMeal.</p>
                </div>

                <div className="p-8 pt-2">
                    <button
                        onClick={() => onLogin(Role.Vendor)}
                        className="w-full bg-indigo-600 text-white font-semibold py-3 px-5 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                    >
                        Login to Vendor Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VendorLoginModal;
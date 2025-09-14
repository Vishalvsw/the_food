import React, { useState, useRef, useEffect } from 'react';
import { BoxIcon, ClockIcon, UserIcon, FacebookIcon, TwitterIcon, InstagramIcon, ShoppingCartIcon, SparklesIcon, ChevronDownIcon, ChatBubbleOvalLeftEllipsisIcon } from './common/Icons';

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-slate-200 text-center">
        <div className="bg-indigo-100 text-indigo-600 p-4 rounded-full inline-block mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        <p className="text-slate-600 mt-2">{description}</p>
    </div>
);

const LandingPage = ({ onAuthClick }: { onAuthClick: () => void; }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleAction = (e: React.MouseEvent) => {
        e.preventDefault();
        onAuthClick();
        setIsDropdownOpen(false);
    }

    return (
        <div className="bg-slate-50 text-slate-800 antialiased">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-40 border-b border-slate-200">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <BoxIcon className="w-8 h-8 text-indigo-600" />
                        <h1 className="text-2xl font-bold text-slate-800">QuickMeal</h1>
                    </div>
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(prev => !prev)}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
                        >
                            Login / Register
                            <ChevronDownIcon className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isDropdownOpen && (
                             <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50 animate-fade-in-down">
                                <a href="#" onClick={handleAction} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                                    <UserIcon className="w-5 h-5"/>
                                    <span>Employee Login</span>
                                </a>
                                <a href="#" onClick={handleAction} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                                    <ShoppingCartIcon className="w-5 h-5"/>
                                    <span>Vendor Portal</span>
                                </a>
                                <div className="my-1 border-t border-slate-200"></div>
                                <a href="#" onClick={handleAction} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                                    <SparklesIcon className="w-5 h-5"/>
                                    <span>Admin Login</span>
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main>
                <section className="relative py-20 sm:py-28 bg-white overflow-hidden">
                    <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
                    <div className="container mx-auto px-4 text-center relative">
                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight">
                            Effortless Office Meals,
                            <br/>
                            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">Intelligently Planned.</span>
                        </h2>
                        <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-600">
                            Say goodbye to lunchtime chaos. QuickMeal's AI-powered platform helps you pre-order delicious meals, so your food is always ready for pickup, just for you.
                        </p>
                        <div className="mt-8 flex justify-center gap-4">
                            <button onClick={onAuthClick} className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                                View Today's Menu
                            </button>
                        </div>
                    </div>
                </section>

                {/* How it works */}
                 <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-slate-900">How It Works</h2>
                            <p className="text-slate-600 mt-2">Simple, fast, and convenient.</p>
                        </div>
                        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                            <div className="flex flex-col items-center">
                                <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                                    <ShoppingCartIcon className="w-10 h-10"/>
                                </div>
                                <h3 className="font-bold text-xl text-slate-800">1. Browse & Order</h3>
                                <p className="text-slate-600 mt-2">Explore the daily menu, get smart recommendations, and place your order in seconds.</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                                    <SparklesIcon className="w-10 h-10"/>
                                </div>
                                <h3 className="font-bold text-xl text-slate-800">2. We Prepare</h3>
                                <p className="text-slate-600 mt-2">Our vendors receive orders in advance, preparing your meal fresh, just for you.</p>
                            </div>
                             <div className="flex flex-col items-center">
                                <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                                    <UserIcon className="w-10 h-10"/>
                                </div>
                                <h3 className="font-bold text-xl text-slate-800">3. Enjoy</h3>
                                <p className="text-slate-600 mt-2">Skip the queue. Your delicious meal is ready for a quick and easy pickup.</p>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Features Section */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                             <h2 className="text-3xl font-bold text-slate-900">Powered by AI</h2>
                            <p className="text-slate-600 mt-2">A smarter way to manage your meals.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <FeatureCard 
                                icon={<SparklesIcon className="w-8 h-8" />}
                                title="Smart Recommendations"
                                description="Don't know what to eat? Our AI analyzes the menu to suggest the perfect meal for you."
                            />
                             <FeatureCard 
                                icon={<ChatBubbleOvalLeftEllipsisIcon className="w-8 h-8" />}
                                title="24/7 AI Assistant"
                                description="Have questions? Our friendly chatbot can help you with menu details, order status, and more."
                            />
                             <FeatureCard 
                                icon={<ShoppingCartIcon className="w-8 h-8" />}
                                title="Optimized for Vendors"
                                description="AI helps vendors create enticing descriptions and predict demand to reduce food waste."
                            />
                        </div>
                    </div>
                </section>

            </main>

            {/* Footer */}
            <footer className="bg-slate-800 text-slate-300">
                <div className="container mx-auto px-4 py-12">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center gap-3">
                           <BoxIcon className="w-8 h-8 text-indigo-400" />
                           <h1 className="text-2xl font-bold text-white">QuickMeal</h1>
                        </div>
                        <div className="flex gap-6 mt-6 md:mt-0">
                            <a href="#" className="hover:text-indigo-400 transition-colors"><FacebookIcon className="w-6 h-6"/></a>
                            <a href="#" className="hover:text-indigo-400 transition-colors"><TwitterIcon className="w-6 h-6"/></a>
                            <a href="#" className="hover:text-indigo-400 transition-colors"><InstagramIcon className="w-6 h-6"/></a>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-slate-700 text-center text-sm text-slate-400">
                        <p>&copy; {new Date().getFullYear()} QuickMeal Inc. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
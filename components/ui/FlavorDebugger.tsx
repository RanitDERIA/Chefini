'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
    AlertTriangle,
    CheckCircle2,
    ChefHat,
    XCircle,
    ArrowRight,
    RotateCcw,
    Sparkles,
    Flame,
    Droplets,
    Soup,
    Utensils,
    X,
    Info,
    Stethoscope
} from 'lucide-react';

// ==========================================
// TOAST SYSTEM
// ==========================================
interface ToastItem {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
}

function useToast() {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    return { toasts, showToast, removeToast };
}

function Toast({ message, type = 'success', onClose, duration = 3000 }: { message: string, type?: 'success' | 'error' | 'info', onClose: () => void, duration?: number }) {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const styles = {
        success: 'bg-green-400 border-green-600',
        error: 'bg-red-500 border-red-700',
        info: 'bg-chefini-yellow border-yellow-600'
    };

    const icons = {
        success: CheckCircle2,
        error: AlertTriangle,
        info: Info
    };

    const Icon = icons[type];

    return (
        <div className={`fixed top-6 right-6 z-50 ${styles[type]} border-4 border-black shadow-brutal-lg p-4 min-w-[300px] max-w-md animate-slide-in`}>
            <div className="flex items-start gap-3">
                <Icon className="text-black flex-shrink-0" size={24} />
                <p className="text-black font-bold flex-1">{message}</p>
                <button onClick={onClose} className="text-black hover:opacity-70 transition-opacity">
                    <X size={20} />
                </button>
            </div>
        </div>
    );
}

// ==========================================
// SYMPTOMS DATA
// ==========================================
const SYMPTOMS = [
    { id: 'salty', label: 'TOO SALTY', icon: '🧂', desc: 'Sodium overload', color: 'bg-blue-50 border-blue-500' },
    { id: 'acidic', label: 'TOO SOUR', icon: '🍋', desc: 'Mouth puckering', color: 'bg-yellow-50 border-yellow-500' },
    { id: 'spicy', label: 'TOO SPICY', icon: '🔥', desc: 'Mouth on fire', color: 'bg-red-50 border-red-500' },
    { id: 'sweet', label: 'TOO SWEET', icon: '🍬', desc: 'Sugar rush', color: 'bg-pink-50 border-pink-500' },
    { id: 'bland', label: 'TASTES BLAND', icon: '😶', desc: 'Missing flavor', color: 'bg-gray-50 border-gray-500' },
    { id: 'burnt', label: 'SLIGHTLY BURNT', icon: '⚫', desc: 'Oops moment', color: 'bg-orange-50 border-orange-700' },
];

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function FlavorDebugger() {
    const [dishName, setDishName] = useState('');
    const [additionalContext, setAdditionalContext] = useState('');
    const [selectedError, setSelectedError] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'scanning' | 'patched'>('idle');
    const [result, setResult] = useState<{ diagnosis: string; fix_title: string; instruction: string } | null>(null);
    const resultRef = useRef<HTMLDivElement>(null);
    const { showToast, toasts, removeToast } = useToast();

    const handleDebug = async () => {
        if (!dishName || !selectedError) {
            showToast('Please fill in all fields', 'error');
            return;
        }

        setStatus('scanning');
        setResult(null);

        try {
            const res = await fetch('/api/debug-dish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dish: dishName,
                    issue: selectedError,
                    context: additionalContext || undefined
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setResult(data);
                setStatus('patched');
                showToast('Fix calculated successfully!', 'success');
                setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
            } else {
                showToast(data.error || 'Failed to calculate fix', 'error');
                setStatus('idle');
            }
        } catch (err) {
            showToast('Connection failed. Please try again.', 'error');
            setStatus('idle');
        }
    };

    const reset = () => {
        setStatus('idle');
        setDishName('');
        setAdditionalContext('');
        setSelectedError(null);
        setResult(null);
    };

    return (
        <div>
            {/* Toast Container */}
            {toasts.map(toast => (
                <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
            ))}

            {/* Header Section - EXACTLY like shopping list */}
            <div className="mb-8 bg-black border-4 border-chefini-yellow p-6">
                <h1 className="text-4xl font-black flex items-center gap-3">
                    <Stethoscope className="text-chefini-yellow" size={40} />
                    FLAVOR RESCUE LAB
                </h1>
                <p className="text-gray-400 mt-2">
                    Did you add too much salt? Is it too spicy? Don't panic • We'll calculate the chemical fix
                </p>
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-3 gap-6">

                {/* Left Sidebar - Input Form */}
                <div className="lg:col-span-1">
                    <div className="bg-black border-4 border-chefini-yellow p-6 sticky top-6">
                        <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
                            <Soup className="text-chefini-yellow" />
                            DISH DETAILS
                        </h2>

                        {/* Question 1: Dish Name */}
                        <div className={`mb-6 transition-all duration-300 ${status !== 'idle' ? 'opacity-50 pointer-events-none' : ''}`}>
                            <label className="block text-sm font-black text-white mb-2">
                                WHAT DISH ARE WE SAVING?
                            </label>
                            <input
                                type="text"
                                value={dishName}
                                onChange={(e) => setDishName(e.target.value)}
                                placeholder="e.g., Chicken Curry, Pasta..."
                                className="w-full px-4 py-3 border-2 border-white bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-chefini-yellow font-bold placeholder:text-gray-400"
                            />
                        </div>

                        {/* Additional Context */}
                        <div className={`mb-6 transition-all duration-300 ${status !== 'idle' ? 'opacity-50 pointer-events-none' : ''}`}>
                            <label className="block text-sm font-black text-white mb-2">
                                ADDITIONAL DETAILS (OPTIONAL)
                            </label>
                            <textarea
                                value={additionalContext}
                                onChange={(e) => setAdditionalContext(e.target.value)}
                                placeholder="Tell us about ingredients used, cooking method, or what went wrong..."
                                rows={4}
                                className="w-full px-4 py-3 border-2 border-white bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-chefini-yellow font-bold placeholder:text-gray-400 resize-none"
                            />
                            <p className="text-xs text-gray-400 mt-2 font-bold">
                                💡 More details = Better fix!
                            </p>
                        </div>

                        {/* Stats Display */}
                        <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-600">
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-black text-chefini-yellow mb-1">
                                        {dishName ? '✓' : '?'}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        DISH
                                    </div>
                                </div>
                                <div>
                                    <div className="text-2xl font-black text-green-400 mb-1">
                                        {additionalContext ? '✓' : '○'}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        CONTEXT
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Problem Selection & Results */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Question 2: The Problem */}
                    <div className={`bg-white border-4 border-black shadow-brutal transition-all duration-300 ${status !== 'idle' ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="bg-chefini-yellow border-b-4 border-black p-4">
                            <h3 className="text-xl font-black text-black flex items-center gap-2">
                                <AlertTriangle size={24} />
                                WHAT'S THE PROBLEM?
                            </h3>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {SYMPTOMS.map((sym) => (
                                    <button
                                        key={sym.id}
                                        onClick={() => setSelectedError(sym.id)}
                                        className={`relative p-4 border-4 text-left transition-all duration-200 group ${selectedError === sym.id
                                                ? `${sym.color} shadow-brutal-sm -translate-y-0.5`
                                                : 'bg-white border-black hover:bg-gray-50 hover:shadow-brutal-sm hover:-translate-y-0.5'
                                            }`}
                                    >
                                        <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform origin-left">{sym.icon}</div>
                                        <div className="font-black uppercase text-xs md:text-sm leading-tight text-black">{sym.label}</div>
                                        <div className="text-[10px] md:text-xs font-bold mt-1 text-gray-600">
                                            {sym.desc}
                                        </div>

                                        {selectedError === sym.id && (
                                            <div className="absolute top-2 right-2 text-black">
                                                <CheckCircle2 size={20} className="md:w-6 md:h-6" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Action Button */}
                            {status === 'idle' && (
                                <button
                                    onClick={handleDebug}
                                    disabled={!dishName || !selectedError}
                                    className="w-full mt-6 py-4 bg-chefini-yellow border-4 border-black text-black text-xl font-black uppercase hover:bg-black hover:text-chefini-yellow transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-brutal hover:shadow-brutal-lg active:shadow-none active:translate-y-1 flex items-center justify-center gap-3"
                                >
                                    <Sparkles size={24} strokeWidth={3} />
                                    CALCULATE FIX
                                    <ArrowRight size={24} strokeWidth={3} />
                                </button>
                            )}

                            {/* Loading State */}
                            {status === 'scanning' && (
                                <div className="mt-6 py-12 flex flex-col items-center justify-center text-center animate-in fade-in bg-gray-50 border-4 border-black border-dashed">
                                    <div className="w-16 h-16 border-8 border-black border-t-chefini-yellow rounded-full animate-spin mb-6"></div>
                                    <h3 className="text-2xl font-black uppercase">Analyzing Chemistry...</h3>
                                    <p className="text-gray-600 font-bold mt-2">Consulting the flavor matrix</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Result Card */}
                    {status === 'patched' && result && (
                        <div ref={resultRef} className="animate-in slide-in-from-bottom-4 duration-500">

                            <div className="bg-white border-4 border-green-500 shadow-brutal overflow-hidden">

                                {/* Success Header */}
                                <div className="bg-green-400 border-b-4 border-black p-4">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 size={32} className="text-black" />
                                        <div>
                                            <p className="font-black text-2xl leading-none text-black">FIX CALCULATED!</p>
                                            <p className="text-sm text-black font-bold">Ready to rescue your dish</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Result Content */}
                                <div className="p-6 space-y-6">

                                    {/* Diagnosis */}
                                    <div className="border-l-4 border-chefini-yellow bg-yellow-50 p-4">
                                        <h4 className="text-black font-black uppercase text-sm mb-2 flex items-center gap-2">
                                            <Stethoscope size={18} className="text-chefini-yellow" /> DIAGNOSIS
                                        </h4>
                                        <p className="text-lg font-medium text-black leading-relaxed italic">
                                            "{result.diagnosis}"
                                        </p>
                                    </div>

                                    {/* The Fix */}
                                    <div>
                                        <h4 className="text-black font-black uppercase text-sm mb-3 flex items-center gap-2">
                                            <Sparkles size={18} className="text-chefini-yellow" /> THE FIX
                                        </h4>
                                        <div className="bg-chefini-yellow border-4 border-black p-4 shadow-brutal-sm">
                                            <h3 className="text-2xl md:text-3xl font-black text-black uppercase">
                                                {result.fix_title}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Instructions */}
                                    <div className="bg-white border-4 border-black p-4 shadow-brutal-sm">
                                        <h4 className="text-black font-black uppercase text-sm mb-3 flex items-center gap-2">
                                            <Utensils size={18} /> HOW TO DO IT
                                        </h4>
                                        <p className="text-base md:text-lg font-bold text-black leading-relaxed">
                                            {result.instruction}
                                        </p>
                                    </div>

                                    {/* Magic Tip */}
                                    <div className="bg-purple-50 p-4 border-l-4 border-purple-600">
                                        <div className="flex items-start gap-3">
                                            <Sparkles className="text-purple-600 flex-shrink-0 mt-1" size={20} />
                                            <div>
                                                <span className="font-black block text-sm text-purple-600 mb-1 uppercase">CHEFINI'S TIP:</span>
                                                <p className="text-sm text-purple-900 font-medium italic">
                                                    Always taste as you go. Small adjustments are easier to control than trying to fix major mistakes.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Reset Button */}
                                    <button
                                        onClick={reset}
                                        className="w-full py-4 bg-black text-white font-black uppercase hover:bg-gray-800 transition-all flex items-center justify-center gap-2 border-4 border-black shadow-brutal hover:shadow-brutal-lg"
                                    >
                                        <RotateCcw size={20} /> RESCUE ANOTHER DISH
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
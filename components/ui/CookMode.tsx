// components/ui/CookMode.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    X, 
    ChevronLeft, 
    ChevronRight, 
    Mic, 
    MicOff, 
    Timer, 
    Play, 
    Pause, 
    RotateCcw,
    CheckCircle2,
    Command,
    Volume2,
    VolumeX,
    Sun,
    ChefHat,
    PartyPopper
} from 'lucide-react';

interface CookModeProps {
    instructions: string[];
    onClose: () => void;
    title: string;
}

// -------------------------------------------
// 🍬 HEARTWARMING QUOTES (Emotional/Sweet)
// -------------------------------------------
const OUTRO_MESSAGES = [
    "Serve hot to someone special. ❤️",
    "The secret ingredient is always love.",
    "You just made magic happen!",
    "Tastes like happiness!",
    "Great food is meant to be shared.",
    "Chef's kiss! Perfection. 👌",
    "Now, the best part: Eating it."
];

// -------------------------------------------
// 🎊 ZERO-DEPENDENCY CONFETTI COMPONENT
// -------------------------------------------
const EmojiConfetti = () => {
    // Create an array of 30 particles with random properties
    const particles = Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100 + '%',
        animationDuration: Math.random() * 2 + 3 + 's', // 3-5s
        animationDelay: Math.random() * 2 + 's',
        emoji: ['🎉', '👨‍🍳', '🍲', '✨', '🔥', '❤️', '🥗'][Math.floor(Math.random() * 7)]
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute top-[-10%] text-2xl md:text-4xl animate-fall"
                    style={{
                        left: p.left,
                        animationDuration: p.animationDuration,
                        animationDelay: p.animationDelay
                    }}
                >
                    {p.emoji}
                </div>
            ))}
            <style jsx>{`
                @keyframes fall {
                    0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
                }
                .animate-fall {
                    animation-name: fall;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                }
            `}</style>
        </div>
    );
};

export default function CookMode({ instructions = [], onClose, title }: CookModeProps) {
    // MODES: 'intro' | 'cooking' | 'outro'
    const [mode, setMode] = useState<'intro' | 'cooking' | 'outro'>('intro');
    
    const [currentStep, setCurrentStep] = useState(0);
    const [isListening, setIsListening] = useState(false);
    const [isAutoReadEnabled, setIsAutoReadEnabled] = useState(true);
    const [wakeLockActive, setWakeLockActive] = useState(false);
    
    // Timer State
    const [activeTimer, setActiveTimer] = useState<number | null>(null);
    const [timerTotal, setTimerTotal] = useState<number | null>(null);
    const [isTimerPaused, setIsTimerPaused] = useState(false);
    
    const recognitionRef = useRef<any>(null);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const wakeLockRef = useRef<any>(null);

    // -------------------------------------------
    // 🔊 AUDIO MANAGER (The Wholesome Vibe)
    // -------------------------------------------
    const playSound = (type: 'intro' | 'success' | 'timer' | 'click') => {
        let url = '';
        switch(type) {
            case 'intro':
                // Crisp Pop sound for starting
                url = 'https://actions.google.com/sounds/v1/cartoon/pop.ogg'; 
                break;
            case 'success':
                // ✨ OPTION 4: Wholesome/Magic Chime
                url = 'https://actions.google.com/sounds/v1/cartoon/magic_chime.ogg'; 
                break;
            case 'timer':
                url = 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg';
                break;
            case 'click':
                // Subtle click
                url = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
                break;
        }
        if(url) {
            const audio = new Audio(url);
            audio.volume = 0.6; // Slightly softer
            audio.play().catch(e => console.log("Audio blocked", e));
        }
    };

    // -------------------------------------------
    // 💡 FEATURE: SCREEN WAKE LOCK
    // -------------------------------------------
    useEffect(() => {
        const requestWakeLock = async () => {
            try {
                if ('wakeLock' in navigator) {
                    // @ts-ignore
                    wakeLockRef.current = await navigator.wakeLock.request('screen');
                    setWakeLockActive(true);
                }
            } catch (err) { console.warn(err); }
        };
        requestWakeLock();
        return () => wakeLockRef.current?.release();
    }, []);

    // -------------------------------------------
    // 🗣️ FEATURE: CHEF'S VOICE (Auto-Read)
    // -------------------------------------------
    useEffect(() => {
        if (typeof window === 'undefined' || !isAutoReadEnabled || mode !== 'cooking') return;

        window.speechSynthesis.cancel();
        const textToRead = `Step ${currentStep + 1}. ${instructions[currentStep]}`;
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);

        return () => { window.speechSynthesis.cancel(); };
    }, [currentStep, isAutoReadEnabled, instructions, mode]);

    // -------------------------------------------
    // 🧠 NAVIGATION LOGIC
    // -------------------------------------------
    const handleNext = useCallback(() => {
        if (currentStep < instructions.length - 1) {
            playSound('click');
            setCurrentStep(prev => prev + 1);
        } else {
            // FINISH
            setMode('outro');
            playSound('success'); // Play the wholesome chord
        }
    }, [currentStep, instructions.length]);

    const handlePrev = useCallback(() => {
        if (currentStep > 0) {
            playSound('click');
            setCurrentStep(prev => prev - 1);
        }
    }, [currentStep]);

    const startCooking = () => {
        playSound('intro');
        setMode('cooking');
    };

    // -------------------------------------------
    // 🎤 WEB SPEECH API
    // -------------------------------------------
    useEffect(() => {
        if (typeof window === 'undefined' || mode !== 'cooking') return;

        // @ts-ignore
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
            const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
            if (transcript.includes('next') || transcript.includes('done')) handleNext();
            else if (transcript.includes('back') || transcript.includes('previous')) handlePrev();
            else if (transcript.includes('stop') || transcript.includes('exit')) onClose();
        };

        try { recognitionRef.current.start(); setIsListening(true); } catch (e) {}

        return () => { if (recognitionRef.current) recognitionRef.current.stop(); };
    }, [handleNext, handlePrev, onClose, mode]);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current?.start();
                setIsListening(true);
            } catch(e) {}
        }
    };

    // -------------------------------------------
    // ⏱️ TIMER LOGIC
    // -------------------------------------------
    useEffect(() => {
        if (activeTimer !== null && activeTimer > 0 && !isTimerPaused) {
            timerIntervalRef.current = setInterval(() => {
                setActiveTimer(prev => {
                    if (prev === null || prev <= 1) {
                        clearInterval(timerIntervalRef.current!);
                        playSound('timer');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

        return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
    }, [activeTimer, isTimerPaused]);

    const startTimer = (minutes: number) => {
        const seconds = minutes * 60;
        setTimerTotal(seconds);
        setActiveTimer(seconds);
        setIsTimerPaused(false);
    };

    // -------------------------------------------
    // 📝 TEXT PARSING
    // -------------------------------------------
    const parseInstructionWithTimer = (text: string | undefined) => {
        if (!text) return <span className="text-gray-400 italic">No instruction available.</span>;
        const timeRegex = /\b(\d+(?:-\d+)?)\s*(?:mins?|minutes?)\b/gi;
        
        if (!text.match(timeRegex)) return <span className="text-3xl md:text-5xl font-bold leading-tight text-black">{text}</span>;

        return (
            <span className="text-3xl md:text-5xl font-bold leading-tight text-black">
                {text.split(timeRegex).map((part, i) => {
                    if (/^\d+(?:-\d+)?$/.test(part)) {
                         const numVal = parseInt(part.split('-')[0]); 
                         return (
                            <button key={i} onClick={() => startTimer(numVal)} className="inline-flex items-center mx-2 px-4 py-1 bg-chefini-yellow border-4 border-black text-black hover:bg-black hover:text-chefini-yellow transition-colors align-middle rounded-full text-2xl md:text-4xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none">
                                <Timer size={28} className="mr-2" /><span>{part} min</span>
                            </button>
                         );
                    }
                    if (part.trim().toLowerCase().match(/^(mins?|minutes?)$/)) return null;
                    return <span key={i}>{part}</span>;
                })}
            </span>
        );
    };

    // -------------------------------------------
    // 🎨 RENDER VIEWS
    // -------------------------------------------

    // 1. INTRO VIEW (GET READY)
    if (mode === 'intro') {
        return (
            <div className="fixed inset-0 z-50 bg-chefini-yellow flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
                <div className="bg-white p-8 md:p-12 border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] max-w-lg w-full flex flex-col items-center">
                    <ChefHat size={80} className="text-black mb-6 animate-bounce" />
                    <h1 className="text-4xl md:text-6xl font-black text-black mb-2 uppercase tracking-tighter">Let's Cook!</h1>
                    <p className="text-xl font-bold text-gray-600 mb-8">Get your ingredients ready. We'll guide you step-by-step.</p>
                    
                    <button 
                        onClick={startCooking}
                        className="w-full py-4 bg-black text-white text-2xl font-black uppercase hover:bg-gray-800 transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
                    >
                        <Play size={28} fill="white" /> Start Cooking
                    </button>
                    
                    <button onClick={onClose} className="mt-6 font-bold underline text-black hover:text-red-600">
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    // 2. OUTRO VIEW (CELEBRATION)
    if (mode === 'outro') {
        return (
            <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 text-center animate-in slide-in-from-bottom duration-500">
                {/* Confetti Background */}
                <EmojiConfetti />
                
                <div className="relative z-10 bg-white p-8 md:p-12 border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] max-w-xl w-full flex flex-col items-center">
                    <div className="bg-chefini-yellow p-4 rounded-full border-4 border-black mb-6 animate-bounce">
                        <PartyPopper size={64} className="text-black" />
                    </div>
                    
                    <h1 className="text-4xl md:text-6xl font-black text-black mb-4 uppercase tracking-tighter">Bon Appétit!</h1>
                    
                    <div className="bg-gray-100 p-6 border-l-4 border-chefini-yellow mb-8 w-full">
                         <p className="text-xl md:text-2xl font-bold italic text-gray-800">
                            "{OUTRO_MESSAGES[Math.floor(Math.random() * OUTRO_MESSAGES.length)]}"
                        </p>
                    </div>

                    <div className="flex gap-4 w-full">
                        <button 
                            onClick={onClose}
                            className="flex-1 py-4 bg-black text-white text-xl font-black uppercase hover:bg-gray-800 transition-transform active:scale-95"
                        >
                            Close
                        </button>
                        <button 
                            onClick={() => { setMode('cooking'); setCurrentStep(0); }}
                            className="flex-1 py-4 bg-white text-black border-4 border-black text-xl font-black uppercase hover:bg-gray-50 transition-transform active:scale-95"
                        >
                            Cook Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 3. COOKING VIEW (Main)
    const progress = instructions.length > 0 ? ((currentStep + 1) / instructions.length) * 100 : 0;
    const isLastStep = currentStep === instructions.length - 1;

    return (
        <div className="fixed inset-0 z-50 bg-white text-black flex flex-col animate-in fade-in duration-300 font-sans">
            
            {/* Top Bar */}
            <div className="h-4 bg-gray-200 w-full shrink-0">
                <div className="h-full bg-chefini-yellow transition-all duration-500 ease-out border-r-4 border-black" style={{ width: `${progress}%` }} />
            </div>

            <div className="p-4 flex justify-between items-center border-b-4 border-black shrink-0 bg-white">
                <div className="flex flex-col">
                    <span className="font-black text-sm md:text-base uppercase tracking-widest text-gray-500 flex items-center gap-2">
                        COOK MODE {wakeLockActive && <Sun size={14} className="text-chefini-yellow fill-chefini-yellow animate-pulse" />}
                    </span>
                    <h1 className="font-black text-xl md:text-2xl truncate max-w-[150px] md:max-w-xl">{title}</h1>
                </div>
                
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsAutoReadEnabled(!isAutoReadEnabled)}
                        className={`p-3 border-2 transition-colors ${isAutoReadEnabled ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-200'}`}
                    >
                        {isAutoReadEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
                    </button>
                    <button onClick={onClose} className="p-3 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-colors border-2 border-red-100 hover:border-red-600">
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center overflow-y-auto relative bg-white">
                <div className="mb-8 font-black text-chefini-yellow text-xl md:text-2xl border-4 border-black px-6 py-2 inline-block bg-black shadow-[4px_4px_0px_0px_#E5E7EB]">
                    STEP {currentStep + 1} <span className="text-white text-opacity-50">/</span> {instructions.length}
                </div>
                <div className="max-w-5xl w-full mb-12">
                    {parseInstructionWithTimer(instructions[currentStep])}
                </div>

                {/* Voice Sheet */}
                <div className="mt-auto flex flex-col items-center animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300">
                    <div className="flex items-center gap-2 mb-2 text-gray-400 font-bold text-xs uppercase tracking-widest">
                        <Command size={14} /> Voice Commands Active
                    </div>
                    <div className="flex flex-wrap justify-center gap-3">
                        {["Next", "Back", "Stop"].map(cmd => (
                            <span key={cmd} className="px-3 py-1 bg-gray-100 border-2 border-gray-300 rounded font-bold text-sm text-gray-600">"{cmd}"</span>
                        ))}
                    </div>
                </div>

                {/* Timer Overlay */}
                {activeTimer !== null && (
                    <div className="absolute inset-0 bg-black/95 z-50 flex flex-col items-center justify-center text-chefini-yellow p-4 animate-in fade-in duration-200">
                        <div className="text-2xl font-bold text-white mb-4 uppercase tracking-widest">Timer Active</div>
                        <div className="text-[20vw] md:text-9xl font-black font-mono mb-8 tabular-nums leading-none">
                            {Math.floor(activeTimer / 60)}:{(activeTimer % 60).toString().padStart(2, '0')}
                        </div>
                        <div className="flex gap-6 items-center">
                            <button onClick={() => setIsTimerPaused(!isTimerPaused)} className="p-6 md:p-8 border-4 border-chefini-yellow hover:bg-chefini-yellow hover:text-black transition-colors rounded-full">
                                {isTimerPaused ? <Play size={48} /> : <Pause size={48} />}
                            </button>
                            <button onClick={() => startTimer(timerTotal ? timerTotal/60 : 5)} className="p-6 md:p-8 border-4 border-chefini-yellow hover:bg-chefini-yellow hover:text-black transition-colors rounded-full">
                                <RotateCcw size={48} />
                            </button>
                            <button onClick={() => { setActiveTimer(null); setTimerTotal(null); }} className="p-6 md:p-8 border-4 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors rounded-full">
                                <X size={48} />
                            </button>
                        </div>
                        {activeTimer === 0 && (
                            <div className="absolute inset-0 bg-red-600 flex items-center justify-center flex-col animate-pulse z-50">
                                <div className="text-white text-6xl md:text-9xl font-black mb-8">TIME'S UP!</div>
                                <button onClick={() => { setActiveTimer(null); setTimerTotal(null); }} className="bg-white text-black px-12 py-6 text-3xl font-black border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">DISMISS</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Controls */}
            <div className="p-4 md:p-6 border-t-4 border-black bg-gray-50 flex items-center justify-between shrink-0 gap-4 md:gap-8">
                <button 
                    onClick={handlePrev} disabled={currentStep === 0}
                    className="flex-1 h-20 md:h-24 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center disabled:opacity-30 disabled:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all active:bg-gray-100 group"
                >
                    <ChevronLeft size={48} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="hidden md:inline font-black text-2xl ml-2">PREV</span>
                </button>

                <button 
                    onClick={toggleListening}
                    className={`h-20 w-20 md:h-24 md:w-24 border-4 border-black rounded-full flex items-center justify-center cursor-pointer transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] ${isListening ? 'bg-red-500 text-white' : 'bg-white text-black'}`}
                >
                    {isListening ? (
                        <div className="relative">
                            <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span></span>
                            <Mic size={32} />
                        </div>
                    ) : <MicOff size={32} className="text-gray-400" />}
                </button>

                <button 
                    onClick={handleNext}
                    className={`flex-1 h-20 md:h-24 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all group ${isLastStep ? 'bg-green-500 text-white' : 'bg-chefini-yellow text-black'}`}
                >
                    <span className="hidden md:inline font-black text-2xl mr-2">{isLastStep ? 'FINISH' : 'NEXT'}</span>
                    {isLastStep ? <CheckCircle2 size={48} /> : <ChevronRight size={48} className="group-hover:translate-x-1 transition-transform" />}
                </button>
            </div>
        </div>
    );
}
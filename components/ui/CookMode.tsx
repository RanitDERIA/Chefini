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
    const particles = Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100 + '%',
        animationDuration: Math.random() * 2 + 3 + 's',
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
    const [mode, setMode] = useState<'intro' | 'cooking' | 'outro'>('intro');
    const [currentStep, setCurrentStep] = useState(0);
    const [isAutoReadEnabled, setIsAutoReadEnabled] = useState(true);
    const [wakeLockActive, setWakeLockActive] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [lastTranscript, setLastTranscript] = useState(""); // DEBUG STATE
    const [activeTimer, setActiveTimer] = useState<number | null>(null);
    const [timerTotal, setTimerTotal] = useState<number | null>(null);
    const [isTimerPaused, setIsTimerPaused] = useState(false);

    const recognitionRef = useRef<any>(null);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const wakeLockRef = useRef<any>(null);
    const permissionGrantedRef = useRef(permissionGranted);
    const isSpeakingRef = useRef(isSpeaking);
    const modeRef = useRef(mode);
    const activeTimerRef = useRef(activeTimer);

    useEffect(() => { permissionGrantedRef.current = permissionGranted; }, [permissionGranted]);
    useEffect(() => { isSpeakingRef.current = isSpeaking; }, [isSpeaking]);
    useEffect(() => { modeRef.current = mode; }, [mode]);
    useEffect(() => { activeTimerRef.current = activeTimer; }, [activeTimer]);

    // -------------------------------------------
    // 🔊 AUDIO MANAGER
    // -------------------------------------------
    const playSound = (type: 'intro' | 'success' | 'timer' | 'click') => {
        let url = '';
        switch (type) {
            case 'intro': url = 'https://actions.google.com/sounds/v1/cartoon/pop.ogg'; break;
            case 'success': url = 'https://actions.google.com/sounds/v1/cartoon/magic_chime.ogg'; break;
            case 'timer': url = 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg'; break;
            case 'click': url = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg'; break;
        }
        if (url) {
            const audio = new Audio(url);
            audio.volume = 0.6;
            audio.play().catch(e => console.log("Audio blocked", e));
        }
    };

    // -------------------------------------------
    // 🧠 IMPROVED VOICE COMMAND MATCHING
    // -------------------------------------------
    const matchesCommand = (transcript: string, keywords: string[]): boolean => {
        // Trim and normalize the transcript
        const normalized = transcript.trim();

        // Check if the transcript is EXACTLY one of the keywords (most reliable)
        if (keywords.some(kw => normalized === kw)) {
            return true;
        }

        // Check if transcript STARTS with the keyword (e.g., "next please")
        if (keywords.some(kw => normalized.startsWith(kw + ' ') || normalized.startsWith(kw))) {
            return true;
        }

        // Check if it's a short phrase containing ONLY the keyword
        const words = normalized.split(' ');
        if (words.length <= 3 && keywords.some(kw => words.includes(kw))) {
            return true;
        }

        return false;
    };

    // -------------------------------------------
    // 🧠 NAVIGATION LOGIC
    // -------------------------------------------
    const handleNext = useCallback(() => {
        if (currentStep < instructions.length - 1) {
            playSound('click');
            setCurrentStep(prev => prev + 1);
        } else {
            setMode('outro');
            playSound('success');
        }
    }, [currentStep, instructions.length]);

    const handlePrev = useCallback(() => {
        if (currentStep > 0) {
            playSound('click');
            setCurrentStep(prev => prev - 1);
        }
    }, [currentStep]);

    const handleVoiceCommand = useCallback((transcript: string) => {
        console.log("🎤 Voice Command:", transcript);

        // Don't process commands if timer is active (to avoid conflicts)
        if (activeTimerRef.current !== null && activeTimerRef.current > 0) {
            console.log("⏱️ Timer active, ignoring navigation command");
            return;
        }

        // NEXT command - multiple variations
        if (matchesCommand(transcript, ['next', 'next step', 'done', 'ready', 'continue', 'go', 'okay'])) {
            console.log("✅ Matched: NEXT");
            handleNext();
            return;
        }

        // BACK command
        if (matchesCommand(transcript, ['back', 'previous', 'go back', 'last step', 'wait'])) {
            console.log("✅ Matched: BACK");
            handlePrev();
            return;
        }

        // STOP/EXIT command
        if (matchesCommand(transcript, ['stop', 'exit', 'close', 'quit', 'cancel', 'end'])) {
            console.log("✅ Matched: STOP");
            onClose();
            return;
        }

        console.log("❌ No command matched");
    }, [handleNext, handlePrev, onClose]);

    const handleVoiceCommandRef = useRef(handleVoiceCommand);
    useEffect(() => { handleVoiceCommandRef.current = handleVoiceCommand; }, [handleVoiceCommand]);

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
    // 🎤 SPEECH RECOGNITION HELPERS
    // -------------------------------------------
    const startListening = useCallback(() => {
        if (!recognitionRef.current || isSpeakingRef.current || modeRef.current !== 'cooking') {
            console.log("❌ Cannot start listening:", {
                hasRecognition: !!recognitionRef.current,
                isSpeaking: isSpeakingRef.current,
                mode: modeRef.current
            });
            return;
        }

        try {
            recognitionRef.current.start();
            console.log("🎤 Started listening");
            setErrorMsg(null);
        } catch (e: any) {
            if (e.name !== 'InvalidStateError') {
                console.error("Error starting recognition:", e);
            }
        }
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
                console.log("🔇 Stopped listening");
            } catch (e) {
                console.log("Already stopped");
            }
        }
    }, []);

    // -------------------------------------------
    // 🎤 WEB SPEECH API INITIALIZATION
    // -------------------------------------------
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // @ts-ignore
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Speech Recognition not supported");
            return;
        }

        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false; // Changed to FALSE for better stability
        recognitionRef.current.interimResults = true; // Enable interim results for real-time feedback
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => {
            console.log("🎤 Recognition started");
            setIsListening(true);
        };

        recognitionRef.current.onsoundstart = () => {
            console.log("🔊 Sound detected");
        };

        recognitionRef.current.onend = () => {
            console.log("🎤 Recognition ended");
            setIsListening(false);

            // IMMEDIATE RESTART (Discrete Loop)
            // If we are still in cooking mode and not speaking, restart immediately.
            if (modeRef.current === 'cooking' && !isSpeakingRef.current && permissionGrantedRef.current) {
                console.log("♻️ Restarting recognition loop...");
                // Small delay to prevent CPU thrashing if it fails instantly
                setTimeout(() => startListening(), 100);
            }
        };

        recognitionRef.current.onerror = (event: any) => {
            if (event.error === 'no-speech' || event.error === 'aborted') {
                return;
            }

            console.error("🎤 Recognition error:", event.error);

            if (event.error === 'not-allowed') {
                setErrorMsg("Microphone access denied. Please check your settings.");
                setPermissionGranted(false);
            }

            setIsListening(false);
        };

        recognitionRef.current.onresult = (event: any) => {
            const lastResult = event.results[event.results.length - 1];
            const transcript = lastResult[0].transcript.toLowerCase().trim();

            // Always update debug state to show what it is hearing
            setLastTranscript(transcript + (lastResult.isFinal ? " [FINAL]" : " ..."));

            if (lastResult.isFinal) {
                console.log("📝 Final transcript:", transcript);
                handleVoiceCommandRef.current(transcript);
            }
        };

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, [startListening]);

    // -------------------------------------------
    // 🗣️ FEATURE: CHEF'S VOICE (Auto-Read)
    // -------------------------------------------
    const speakStep = useCallback((text: string) => {
        if (typeof window === 'undefined' || !isAutoReadEnabled) return;

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;

        utterance.onstart = () => {
            console.log("🗣️ TTS started");
            setIsSpeaking(true);
            stopListening();
        };

        utterance.onend = () => {
            console.log("🗣️ TTS ended");
            setIsSpeaking(false);

            if (modeRef.current === 'cooking' && permissionGrantedRef.current) {
                console.log("🎤 Resuming mic after TTS");
                setTimeout(() => startListening(), 500);
            }
        };

        utterance.onerror = (event: any) => {
            // Ignore 'interrupted' or 'canceled' errors which happen normally when skipping steps
            if (event.error === 'interrupted' || event.error === 'canceled') {
                setIsSpeaking(false);
                return;
            }
            console.warn("🗣️ TTS warning:", event);
            setIsSpeaking(false);

            if (modeRef.current === 'cooking' && permissionGrantedRef.current) {
                setTimeout(() => startListening(), 500);
            }
        };

        window.speechSynthesis.speak(utterance);
    }, [isAutoReadEnabled, stopListening, startListening]);

    // Trigger Speak on Step Change
    useEffect(() => {
        if (mode === 'cooking') {
            const textToRead = instructions[currentStep]
                ? `Step ${currentStep + 1}. ${instructions[currentStep]}`
                : "No instruction available.";
            speakStep(textToRead);
        } else {
            if (typeof window !== 'undefined') {
                window.speechSynthesis.cancel();
            }
            stopListening();
        }
    }, [currentStep, mode, speakStep, instructions, stopListening]);

    // START COOKING (Explicit User Action)
    const startCooking = async () => {
        playSound('intro');
        setMode('cooking');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            setPermissionGranted(true);
            console.log("✅ Microphone permission granted");
        } catch (err) {
            console.error("❌ Mic permission denied", err);
            setErrorMsg("Please enable microphone access to use voice commands.");
            setPermissionGranted(false);
        }
    };

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            if (!permissionGranted) {
                startCooking();
            } else if (mode === 'cooking' && !isSpeaking) {
                startListening();
            }
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
        } else if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }

        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
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

        if (!text.match(timeRegex)) {
            return <span className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight text-black tracking-tight">{text}</span>;
        }

        return (
            <span className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight text-black tracking-tight">
                {text.split(timeRegex).map((part, i) => {
                    if (/^\d+(?:-\d+)?$/.test(part)) {
                        const numVal = parseInt(part.split('-')[0]);
                        return (
                            <button
                                key={i}
                                onClick={() => startTimer(numVal)}
                                className="inline-flex items-center mx-2 px-3 py-1 md:px-5 md:py-2 bg-chefini-yellow border-[3px] md:border-4 border-black text-black hover:bg-black hover:text-chefini-yellow transition-colors align-middle rounded-full text-2xl md:text-4xl lg:text-5xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
                            >
                                <Timer size={24} className="md:w-8 md:h-8 mr-2" />
                                <span>{part} min</span>
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

    // 1. INTRO VIEW
    if (mode === 'intro') {
        return (
            <div className="fixed inset-0 z-50 bg-chefini-yellow flex flex-col items-center justify-center p-4 md:p-6 text-center animate-in fade-in zoom-in duration-300 font-sans">
                <div className="bg-white p-6 md:p-12 border-[6px] md:border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] md:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full flex flex-col items-center relative overflow-hidden">
                    <ChefHat size={80} className="text-black mb-6 md:mb-8 animate-bounce" strokeWidth={1.5} />

                    <h1 className="text-4xl md:text-7xl font-black text-black mb-4 uppercase tracking-tighter leading-none">
                        Let's Cook!
                    </h1>

                    <p className="text-lg md:text-2xl font-bold text-gray-600 mb-8 md:mb-12 max-w-md leading-relaxed">
                        Get your ingredients ready. We'll guide you step-by-step.
                    </p>

                    <button
                        onClick={startCooking}
                        className="w-full md:w-auto md:px-12 py-4 md:py-5 bg-black text-white text-xl md:text-2xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 border-4 border-transparent hover:border-chefini-yellow"
                    >
                        <Play size={24} fill="white" className="md:w-8 md:h-8" />
                        <span>Start Cooking</span>
                    </button>

                    <button
                        onClick={onClose}
                        className="mt-6 md:mt-8 font-bold text-gray-400 hover:text-red-600 transition-colors text-sm md:text-base tracking-widest uppercase"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    // 2. OUTRO VIEW
    if (mode === 'outro') {
        return (
            <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-4 text-center animate-in slide-in-from-bottom duration-500 font-sans">
                <EmojiConfetti />

                <div className="relative z-10 bg-white p-6 md:p-12 border-[6px] md:border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] md:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full flex flex-col items-center">
                    <div className="bg-chefini-yellow p-4 md:p-6 rounded-full border-4 border-black mb-6 md:mb-8 animate-bounce shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <PartyPopper size={48} className="text-black md:w-16 md:h-16" />
                    </div>

                    <h1 className="text-4xl md:text-7xl font-black text-black mb-4 uppercase tracking-tighter leading-none">
                        Bon Appétit!
                    </h1>

                    <div className="bg-gray-50 p-6 md:p-8 border-l-[6px] md:border-l-8 border-chefini-yellow mb-8 md:mb-10 w-full text-left">
                        <p className="text-xl md:text-3xl font-black italic text-black leading-tight">
                            "{OUTRO_MESSAGES[Math.floor(Math.random() * OUTRO_MESSAGES.length)]}"
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 w-full">
                        <button
                            onClick={() => { setMode('cooking'); setCurrentStep(0); }}
                            className="flex-1 py-4 bg-chefini-yellow text-black border-4 border-black text-lg md:text-xl font-black uppercase hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:scale-95"
                        >
                            Cook Again
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 bg-white text-black border-4 border-black text-lg md:text-xl font-black uppercase hover:bg-gray-100 transition-all active:scale-95"
                        >
                            Close
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
        <div className="fixed inset-0 h-[100dvh] z-50 bg-white text-black flex flex-col animate-in fade-in duration-300 font-sans overscroll-none supports-[height:100cqh]:h-[100cqh]">
            {/* Top Bar: Progress & Header */}
            <div className="shrink-0 bg-white border-b-4 border-black relative">
                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 h-2 bg-gray-100 w-full">
                    <div
                        className="h-full bg-chefini-yellow transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="p-4 md:p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
                    <div className="flex flex-col">
                        <span className="font-black text-xs md:text-sm uppercase tracking-widest text-gray-500 flex items-center gap-2 mb-1">
                            COOK MODE {wakeLockActive && <Sun size={14} className="text-chefini-yellow fill-chefini-yellow animate-pulse" />}
                        </span>
                        <h1 className="font-black text-2xl md:text-4xl truncate max-w-[200px] md:max-w-2xl">{title}</h1>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <button
                            onClick={() => setIsAutoReadEnabled(!isAutoReadEnabled)}
                            className={`p-3 md:p-4 border-4 transition-all active:scale-95 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] ${isAutoReadEnabled ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-200 hover:border-black hover:text-black'}`}
                            title={isAutoReadEnabled ? 'Mute Voice' : 'Enable Voice'}
                        >
                            {isAutoReadEnabled ? <Volume2 size={24} className="md:w-6 md:h-6" /> : <VolumeX size={24} className="md:w-6 md:h-6" />}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-3 md:p-4 bg-white text-black hover:bg-red-500 hover:text-white transition-all border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:scale-95"
                            title="Exit Cook Mode"
                        >
                            <X size={24} className="md:w-6 md:h-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content: Instructions */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center overflow-y-auto relative bg-gray-50/50">
                <div className="max-w-6xl w-full flex flex-col items-center">
                    <div className="mb-8 md:mb-12 font-black text-black text-lg md:text-2xl border-4 border-black px-6 py-2 inline-block bg-chefini-yellow shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-[-1deg] transform hover:rotate-0 transition-transform">
                        STEP {currentStep + 1} <span className="opacity-50 mx-1">/</span> {instructions.length}
                    </div>

                    <div className="w-full">
                        {parseInstructionWithTimer(instructions[currentStep])}
                    </div>
                </div>

                {/* Voice Status Indicator (Floating) */}
                {isListening && (
                    <div className="absolute bottom-6 md:bottom-12 animate-in slide-in-from-bottom-4 fade-in duration-300 pointer-events-none">
                        <div className="flex items-center gap-3 bg-black text-white px-4 py-2 rounded-full border-2 border-white/20 shadow-xl backdrop-blur-md">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                            <span className="text-sm font-bold tracking-widest uppercase">Listening...</span>
                        </div>
                    </div>
                )}

                {/* Timer Overlay */}
                {activeTimer !== null && (
                    <div className="absolute inset-0 bg-black/95 z-50 flex flex-col items-center justify-center text-chefini-yellow p-4 animate-in fade-in duration-200">
                        <div className="text-2xl font-bold text-white mb-4 uppercase tracking-widest">Timer Active</div>
                        <div className="text-[20vw] md:text-9xl font-black font-mono mb-8 tabular-nums leading-none">
                            {Math.floor(activeTimer / 60)}:{(activeTimer % 60).toString().padStart(2, '0')}
                        </div>
                        <div className="flex gap-4 md:gap-8 items-center">
                            <button
                                onClick={() => setIsTimerPaused(!isTimerPaused)}
                                className="p-6 md:p-8 border-4 border-chefini-yellow hover:bg-chefini-yellow hover:text-black transition-colors rounded-full"
                            >
                                {isTimerPaused ? <Play size={48} /> : <Pause size={48} />}
                            </button>
                            <button
                                onClick={() => startTimer(timerTotal ? timerTotal / 60 : 5)}
                                className="p-6 md:p-8 border-4 border-chefini-yellow hover:bg-chefini-yellow hover:text-black transition-colors rounded-full"
                            >
                                <RotateCcw size={48} />
                            </button>
                            <button
                                onClick={() => { setActiveTimer(null); setTimerTotal(null); }}
                                className="p-6 md:p-8 border-4 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors rounded-full"
                            >
                                <X size={48} />
                            </button>
                        </div>
                        {activeTimer === 0 && (
                            <div className="absolute inset-0 bg-red-600 flex items-center justify-center flex-col animate-pulse z-50">
                                <div className="text-white text-6xl md:text-9xl font-black mb-8">TIME'S UP!</div>
                                <button
                                    onClick={() => { setActiveTimer(null); setTimerTotal(null); }}
                                    className="bg-white text-black px-12 py-6 text-3xl font-black border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                                >
                                    DISMISS
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Error / Status Toast */}
                {errorMsg && (
                    <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-red-100 border-2 border-red-500 text-red-700 px-6 py-3 rounded-none font-bold shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] z-50 flex items-center gap-3 animate-in slide-in-from-top-4 max-w-[90vw]">
                        <span className="text-xl">⚠️</span> {errorMsg}
                    </div>
                )}
            </div>

            {/* Bottom Controls */}
            <div className="p-4 md:p-8 border-t-4 border-black bg-white flex items-center justify-between shrink-0 gap-4 md:gap-8">
                <button
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className="flex-1 h-16 md:h-24 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center disabled:opacity-30 disabled:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all active:bg-gray-100 group"
                    aria-label="Previous Step"
                >
                    <ChevronLeft size={32} className="md:w-12 md:h-12 group-hover:-translate-x-1 transition-transform" />
                    <span className="hidden md:inline font-black text-2xl ml-2">PREV</span>
                </button>

                {/* Mic Toggle Button */}
                <button
                    onClick={toggleListening}
                    className={`h-20 w-20 md:h-28 md:w-28 border-[6px] border-black rounded-full flex items-center justify-center cursor-pointer transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] hover:scale-105 active:scale-95 ${isListening ? 'bg-black text-white' : (isSpeaking ? 'bg-chefini-yellow text-black' : 'bg-white text-black')}`}
                    title={isListening ? "Listening..." : "Tap to Speak"}
                >
                    {isListening ? (
                        <Mic size={32} className="md:w-10 md:h-10 text-red-500 animate-pulse" />
                    ) : (
                        isSpeaking ? <Volume2 size={32} className="md:w-10 md:h-10 animate-pulse" /> : <MicOff size={32} className="md:w-10 md:h-10 text-gray-400" />
                    )}
                </button>

                <button
                    onClick={handleNext}
                    className={`flex-1 h-16 md:h-24 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all group ${isLastStep ? 'bg-green-500 text-white border-green-700 shadow-green-900' : 'bg-chefini-yellow text-black'}`}
                    aria-label={isLastStep ? "Finish Cooking" : "Next Step"}
                >
                    <span className="hidden md:inline font-black text-2xl mr-2">{isLastStep ? 'FINISH' : 'NEXT'}</span>
                    {isLastStep ? <CheckCircle2 size={32} className="md:w-12 md:h-12" /> : <ChevronRight size={32} className="md:w-12 md:h-12 group-hover:translate-x-1 transition-transform" />}
                </button>
            </div>
        </div>
    );
}
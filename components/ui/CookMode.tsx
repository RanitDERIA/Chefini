'use client';

import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Mic, MicOff, Timer, Play, Pause } from 'lucide-react';

interface CookModeProps {
  recipe: {
    title: string;
    instructions: string[];
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function CookMode({ recipe, isOpen, onClose }: CookModeProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerDuration, setTimerDuration] = useState(0);
  const recognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalSteps = recipe.instructions.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  // Extract time duration from instruction text (e.g., "5 minutes", "10 mins", "2 hours")
  const extractTimeDuration = (text: string): number | null => {
    const patterns = [
      /(\d+)\s*(minute|minutes|min|mins)/i,
      /(\d+)\s*(hour|hours|hr|hrs)/i,
      /(\d+)\s*(second|seconds|sec|secs)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();

        if (unit.includes('hour') || unit.includes('hr')) {
          return value * 3600; // hours to seconds
        } else if (unit.includes('minute') || unit.includes('min')) {
          return value * 60; // minutes to seconds
        } else if (unit.includes('second') || unit.includes('sec')) {
          return value; // already in seconds
        }
      }
    }
    return null;
  };

  const currentInstruction = recipe.instructions[currentStep];
  const detectedDuration = extractTimeDuration(currentInstruction);

  // Navigation functions
  const goNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
      stopTimer();
    }
  };

  const goPrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      stopTimer();
    }
  };

  // Timer functions
  const startTimer = (seconds: number) => {
    stopTimer();
    setTimerDuration(seconds);
    setTimerSeconds(seconds);
    setTimerActive(true);
  };

  const stopTimer = () => {
    setTimerActive(false);
    setTimerSeconds(0);
    setTimerDuration(0);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const toggleTimer = () => {
    if (timerActive) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      setTimerActive(false);
    } else {
      setTimerActive(true);
    }
  };

  // Timer countdown effect
  useEffect(() => {
    if (timerActive && timerSeconds > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            playTimerSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [timerActive, timerSeconds]);

  const playTimerSound = () => {
    // Simple beep using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1);
    } catch (error) {
      console.error('Audio playback failed:', error);
    }
  };

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Voice recognition setup
  useEffect(() => {
    if (!isOpen) return;

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
        console.log('Voice command:', transcript);

        if (transcript.includes('next') || transcript.includes('chefini next')) {
          goNext();
        } else if (transcript.includes('back') || transcript.includes('previous')) {
          goPrevious();
        } else if (transcript.includes('stop') || transcript.includes('exit')) {
          onClose();
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current?.start();
        }
      };

      // Auto-start listening
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      stopTimer();
    };
  }, [isOpen, isListening]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Failed to start recognition:', error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-chefini-black flex flex-col">
      
      {/* Progress Bar */}
      <div className="w-full h-3 bg-black border-b-4 border-chefini-yellow">
        <div
          className="h-full bg-chefini-yellow transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <div className="bg-chefini-yellow border-b-4 border-black p-4 md:p-6 flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-xl md:text-2xl font-black text-black truncate">
            🔥 COOK MODE: {recipe.title}
          </h1>
          <p className="text-xs md:text-sm font-bold text-black mt-1">
            Step {currentStep + 1} of {totalSteps}
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-2 md:p-3 bg-black text-white hover:bg-gray-800 transition-colors border-2 border-black ml-4"
          aria-label="Exit cook mode"
        >
          <X size={24} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-4xl">
          
          {/* Step Number Badge */}
          <div className="text-center mb-6 md:mb-8">
            <div className="inline-block bg-chefini-yellow border-4 border-black px-6 py-3 md:px-8 md:py-4">
              <span className="text-3xl md:text-5xl font-black text-black">
                STEP {currentStep + 1}
              </span>
            </div>
          </div>

          {/* Instruction Text */}
          <div className="bg-white border-4 border-black shadow-brutal-lg p-6 md:p-12 mb-6 md:mb-8">
            <p className="text-2xl md:text-4xl lg:text-5xl font-bold text-black leading-relaxed text-center">
              {currentInstruction}
            </p>
          </div>

          {/* Timer Section */}
          {detectedDuration && (
            <div className="bg-chefini-yellow border-4 border-black p-4 md:p-6 mb-6 md:mb-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Timer size={28} className="text-black" />
                  <span className="text-lg md:text-xl font-black text-black">
                    TIMER DETECTED: {formatTime(detectedDuration)}
                  </span>
                </div>

                {!timerActive || timerSeconds === 0 ? (
                  <button
                    onClick={() => startTimer(detectedDuration)}
                    className="px-6 py-3 bg-black text-white font-black border-2 border-black hover:bg-gray-800 transition-colors flex items-center gap-2 w-full md:w-auto justify-center"
                  >
                    <Play size={20} /> START TIMER
                  </button>
                ) : (
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="text-2xl md:text-3xl font-black text-black">
                      {formatTime(timerSeconds)}
                    </div>
                    <button
                      onClick={toggleTimer}
                      className="px-4 py-2 bg-black text-white font-black border-2 border-black hover:bg-gray-800 transition-colors"
                    >
                      {timerActive ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <button
                      onClick={stopTimer}
                      className="px-4 py-2 bg-red-500 text-white font-black border-2 border-black hover:bg-red-600 transition-colors"
                    >
                      STOP
                    </button>
                  </div>
                )}
              </div>

              {timerSeconds > 0 && (
                <div className="mt-4 w-full bg-black h-3 border-2 border-black">
                  <div
                    className="h-full bg-white transition-all duration-1000"
                    style={{ width: `${(timerSeconds / timerDuration) * 100}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Voice Control Indicator */}
          <div className="flex items-center justify-center gap-4 mb-6 md:mb-8">
            <button
              onClick={toggleListening}
              className={`p-3 md:p-4 border-4 border-black transition-all ${
                isListening
                  ? 'bg-red-500 animate-pulse'
                  : 'bg-gray-300'
              }`}
              aria-label={isListening ? 'Stop listening' : 'Start listening'}
            >
              {isListening ? (
                <Mic size={28} className="text-white" />
              ) : (
                <MicOff size={28} className="text-black" />
              )}
            </button>
            <div className="text-center">
              <p className="text-white font-bold text-sm md:text-base">
                {isListening ? '🎤 LISTENING...' : '🔇 VOICE PAUSED'}
              </p>
              <p className="text-gray-400 text-xs md:text-sm mt-1">
                Say: "Next", "Back", or "Stop"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-black border-t-4 border-chefini-yellow p-4 md:p-6">
        <div className="max-w-4xl mx-auto flex items-center gap-3 md:gap-4">
          
          <button
            onClick={goPrevious}
            disabled={currentStep === 0}
            className="flex-1 py-4 md:py-5 bg-white text-black font-black text-lg md:text-xl border-4 border-chefini-yellow hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <ChevronLeft size={28} />
            <span className="hidden md:inline">PREVIOUS</span>
            <span className="md:hidden">PREV</span>
          </button>

          <button
            onClick={goNext}
            disabled={currentStep === totalSteps - 1}
            className="flex-1 py-4 md:py-5 bg-chefini-yellow text-black font-black text-lg md:text-xl border-4 border-chefini-yellow hover:bg-yellow-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <span className="hidden md:inline">NEXT STEP</span>
            <span className="md:hidden">NEXT</span>
            <ChevronRight size={28} />
          </button>
        </div>
      </div>
    </div>
  );
}
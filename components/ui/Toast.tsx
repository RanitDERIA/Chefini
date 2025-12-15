'use client';

import { useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export function useToast() {
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

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = 'success', onClose, duration = 3000 }: ToastProps) {
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
    success: CheckCircle,
    error: AlertCircle,
    info: Info
  };

  const Icon = icons[type];

  return (
    <div className={`fixed top-4 right-4 left-4 sm:left-auto sm:top-6 sm:right-6 z-50 ${styles[type]} border-4 border-black shadow-brutal-lg p-4 w-auto sm:w-96 max-w-full animate-slide-in`}>
      <div className="flex items-start gap-3">
        <Icon className="text-black flex-shrink-0" size={24} />
        <p className="text-black font-bold flex-1 break-words">{message}</p>
        <button
          onClick={onClose}
          className="text-black hover:opacity-70 transition-opacity"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}

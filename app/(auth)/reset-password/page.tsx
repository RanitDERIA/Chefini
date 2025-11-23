'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Lock, CheckCircle, ChefHat, X, AlertCircle, Info } from 'lucide-react';

// --- CUSTOM HOOK: useToast (Implemented from app/hooks/useToast.ts) ---
function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return { toasts, showToast, removeToast };
}

// --- COMPONENT: Toast (Implemented from components/ui/Toast.tsx) ---
const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: 'bg-green-400 border-green-600',
    error: 'bg-red-500 border-red-700',
    info: 'bg-[#FFC72C] border-yellow-600' // Mapped 'bg-chefini-yellow' to hex for preview
  };

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info
  };

  const Icon = icons[type];

  return (
    <div className={`fixed top-6 right-6 z-50 ${styles[type]} border-4 border-black shadow-brutal-lg p-4 min-w-[300px] max-w-md animate-slide-in`}>
      <div className="flex items-start gap-3">
        <Icon className="text-black flex-shrink-0" size={24} />
        <p className="text-black font-bold flex-1">{message}</p>
        <button
          onClick={onClose}
          className="text-black hover:opacity-70 transition-opacity"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

// --- INLINE UI COMPONENTS ---

const ChefiniLogo = ({ size = "md" }) => {
  const sizeClasses = { sm: "text-xl", md: "text-2xl", lg: "text-4xl" };
  return (
    <div className={`font-black tracking-tighter flex items-center justify-center gap-2 ${sizeClasses[size]}`}>
      <ChefHat className="text-[#FFC72C]" size={size === "lg" ? 48 : 32} />
      <span>CHEFINI</span>
    </div>
  );
};

const ChefiniButton = ({ children, className = "", icon: Icon, disabled, ...props }) => {
  return (
    <button
      disabled={disabled}
      className={`
        flex items-center gap-2 px-6 py-3 font-bold uppercase tracking-wide
        border-2 border-black bg-[#FFC72C] hover:bg-white transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
        active:translate-x-[4px] active:translate-y-[4px] active:shadow-none
        ${className}
      `}
      {...props}
    >
      {Icon && <Icon size={20} />}
      {children}
    </button>
  );
};

// --- MAIN PAGE LOGIC ---

export default function ResetPasswordPage() {
  const { toasts, showToast, removeToast } = useToast();
  
  // For demo purposes, simulate URL params
  const [email] = useState('test@example.com');
  const [otp] = useState('123456');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Handle countdown and automatic redirect
  useEffect(() => {
    if (success && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (success && countdown === 0) {
      showToast('Redirecting to login...', 'info');
      setTimeout(() => {
        window.location.href = '/login';
      }, 500);
    }
  }, [success, countdown, showToast]);

  const handleSubmit = async () => {
    // Validation
    if (!password || !confirmPassword) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you would make the API call here:
      // const res = await fetch('/api/auth/reset-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, otp, password })
      // });
      // 
      // if (!res.ok) throw new Error('Failed to reset password');
      
      setSuccess(true);
      showToast('Password reset successful!', 'success');
      
    } catch (err) {
      showToast(err.message || 'Failed to reset password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleManualRedirect = () => {
    showToast('Redirecting to login...', 'info');
    setTimeout(() => {
      window.location.href = '/login';
    }, 500);
  };

  return (
    <>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
      
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#000000' }}>
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8 text-white">
            <ChefiniLogo size="lg" />
            <p className="mt-4 text-gray-400 font-bold">
              Create a new password
            </p>
          </div>

          {/* Form */}
          <div className="bg-white border-4 border-black p-8" style={{ boxShadow: '8px 8px 0px 0px #000' }}>
            {!success ? (
              <>
                <h2 className="text-3xl font-black text-black mb-6">
                  RESET PASSWORD
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      <Lock size={16} className="inline mr-2" />
                      NEW PASSWORD
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 text-black"
                      style={{ '--tw-ring-color': '#FFC72C' }}
                      placeholder="Min. 6 characters"
                      disabled={loading}
                      onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      <Lock size={16} className="inline mr-2" />
                      CONFIRM PASSWORD
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 text-black"
                      style={{ '--tw-ring-color': '#FFC72C' }}
                      placeholder="Re-enter password"
                      disabled={loading}
                      onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                    />
                  </div>

                  <ChefiniButton
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full justify-center"
                    icon={Lock}
                  >
                    {loading ? 'RESETTING...' : 'RESET PASSWORD'}
                  </ChefiniButton>
                </div>

                <div className="mt-6 p-4 bg-green-100 border-2 border-green-500">
                  <p className="text-xs text-black">
                    <strong>✅ OTP Verified!</strong> Your identity has been confirmed. Choose a strong password to secure your account.
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-400 border-4 border-black flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-black" />
                </div>

                <h2 className="text-2xl font-black text-black mb-4">
                  PASSWORD RESET!
                </h2>

                <p className="text-gray-700 mb-2">
                  Your password has been successfully reset.
                </p>
                
                <p className="text-gray-600 text-sm mb-6">
                  Redirecting to login in {countdown} second{countdown !== 1 ? 's' : ''}...
                </p>

                <ChefiniButton 
                  className="w-full justify-center"
                  onClick={handleManualRedirect}
                >
                  GO TO LOGIN NOW
                </ChefiniButton>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* CSS Polyfills for specific classes used in Toast.tsx */
        .shadow-brutal-lg { box-shadow: 8px 8px 0px 0px #000; }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
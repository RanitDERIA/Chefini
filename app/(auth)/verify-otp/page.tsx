'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Shield, RefreshCw } from 'lucide-react';
import ChefiniLogo from '@/components/ui/ChefiniLogo';
import ChefiniButton from '@/components/ui/ChefiniButton';

// ⬇️ ADDED
import Toast from '@/components/ui/Toast';
import { useToast } from '@/app/hooks/useToast';

export default function VerifyOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ⬇️ ADDED
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    if (!email) {
      router.push('/forgot-password');
    }
  }, [email, router]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);

    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
    setOtp(newOtp);

    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      showToast("Please enter all 6 digits", "error");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid OTP');
      }

      router.push(`/reset-password?email=${encodeURIComponent(email)}&otp=${otpCode}`);
    } catch (err: any) {
      showToast(err.message, "error");
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setResending(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!res.ok) throw new Error('Failed to resend OTP');

      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      showToast("New OTP sent to your email!", "success");
    } catch (error) {
      showToast("Failed to resend OTP. Please try again.", "error");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-chefini-black">
      {/* TOAST RENDERING — ADDED */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <ChefiniLogo size="lg" />
          <p className="mt-4 text-gray-400 font-bold">
            Enter the OTP code
          </p>
        </div>

        <div className="bg-white border-4 border-black shadow-brutal-lg p-8">
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-black mb-6"
          >
            <ArrowLeft size={16} />
            Back
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-chefini-yellow border-2 border-black flex items-center justify-center">
              <Shield size={24} className="text-black" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-black">VERIFY OTP</h2>
              <p className="text-sm text-gray-600">Sent to {email}</p>
            </div>
          </div>

          <p className="text-sm text-gray-700 mb-6">
            Enter the 6-digit code we sent to your email
          </p>

          {error && (
            <div className="bg-red-500 text-white p-3 mb-4 border-2 border-black font-bold text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="flex gap-2 mb-6" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-full aspect-square text-center text-3xl font-black border-4 border-black focus:outline-none focus:ring-2 focus:ring-chefini-yellow text-black"
                  disabled={loading}
                />
              ))}
            </div>

            <ChefiniButton
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="w-full justify-center mb-4"
              icon={Shield}
            >
              {loading ? 'VERIFYING...' : 'VERIFY OTP'}
            </ChefiniButton>

            <button
              type="button"
              onClick={resendOTP}
              disabled={resending}
              className="w-full px-4 py-3 bg-white text-black font-bold border-2 border-black hover:bg-gray-100 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={18} />
              {resending ? 'Resending...' : 'Resend OTP'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-100 border-2 border-gray-300">
            <p className="text-xs text-gray-700">
              <strong>💡 Tip:</strong> OTP is valid for <strong>10 minutes</strong>.  
              Check your spam folder if you don&apos;t see the email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

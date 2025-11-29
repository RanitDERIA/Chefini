'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import ChefiniLogo from '@/components/ui/ChefiniLogo';
import ChefiniButton from '@/components/ui/ChefiniButton';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok && res.status !== 200) {
        throw new Error(data.error || 'Something went wrong');
      }

      // Redirect to verify OTP page with email
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-chefini-black">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <ChefiniLogo size="lg" />
          <p className="mt-4 text-gray-400 font-bold">
            Reset your password via OTP
          </p>
        </div>

        {/* Form */}
        <div className="bg-white border-4 border-black shadow-brutal-lg p-8">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-black mb-6"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>

          <h2 className="text-3xl font-black text-black mb-6">
            FORGOT PASSWORD?
          </h2>

          <p className="text-sm text-gray-700 mb-6">
            Enter your email address and we&apos;ll send you a <strong>6-digit OTP code</strong> to reset your password.
          </p>

          {error && (
            <div className="bg-red-500 text-white p-3 mb-4 border-2 border-black font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                <Mail size={16} className="inline mr-2" />
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-chefini-yellow text-black"
                placeholder="your@email.com"
              />
            </div>

            <ChefiniButton
              type="submit"
              disabled={loading}
              className="w-full justify-center"
              icon={Send}
            >
              {loading ? 'SENDING OTP...' : 'SEND OTP CODE'}
            </ChefiniButton>
          </form>

          <div className="mt-6 p-4 bg-chefini-yellow bg-opacity-20 border-2 border-chefini-yellow">
            <p className="text-xs text-black">
              <strong>💡 Tip:</strong> The OTP code will be valid for <strong>10 minutes</strong>. Check your spam folder if you don&apos;t see the email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
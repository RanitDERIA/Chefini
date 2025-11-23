'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ChefiniLogo from '@/components/ui/ChefiniLogo';
import ChefiniButton from '@/components/ui/ChefiniButton';
import { ChefHat, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('Something went wrong');
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
            Welcome back, Chef! Let's cook some magic.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border-4 border-black shadow-brutal-lg p-8">
          <h2 className="text-3xl font-black text-black mb-6 flex items-center gap-2">
            <ChefHat className="text-chefini-yellow" />
            LOGIN
          </h2>

          {error && (
            <div className="bg-red-500 text-white p-3 mb-4 border-2 border-black font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                <Mail size={16} className="inline mr-2" />
                EMAIL
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-black focus:ring-2 focus:ring-chefini-yellow text-black"
                placeholder="chef@gmail.com"
              />
            </div>

            {/* Password + Forgot Password link */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-black">
                  <Lock size={16} className="inline mr-2" />
                  PASSWORD
                </label>

                <Link
                  href="/forgot-password"
                  className="text-xs font-bold text-chefini-yellow hover:underline"
                >
                  Forgot?
                </Link>
              </div>

              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-black focus:ring-2 focus:ring-chefini-yellow text-black"
                placeholder="Your password"
              />
            </div>

            {/* Submit */}
            <ChefiniButton
              type="submit"
              disabled={loading}
              className="w-full justify-center"
              icon={ChefHat}
            >
              {loading ? 'LOGGING IN...' : 'START COOKING'}
            </ChefiniButton>
          </form>

          {/* Divider */}
          <div className="my-6 border-t-2 border-dashed border-black"></div>

          {/* Google Login */}
          <button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="w-full px-6 py-3 font-bold border-2 border-black bg-white text-black shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-brutal-sm transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            CONTINUE WITH GOOGLE
          </button>

          {/* Signup Link */}
          <p className="mt-6 text-center text-sm text-black">
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="font-bold underline hover:text-chefini-yellow"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

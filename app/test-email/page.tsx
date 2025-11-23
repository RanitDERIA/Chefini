'use client';

import { useState } from 'react';
import ChefiniLogo from '@/components/ui/ChefiniLogo';
import ChefiniButton from '@/components/ui/ChefiniButton';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';

export default function TestEmailPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const sendTestEmail = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/test-send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email })
      });

      const data = await res.json();
      setResult(data);
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-chefini-black p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <ChefiniLogo size="lg" />
          <h1 className="text-3xl font-black mt-4">EMAIL TEST PAGE</h1>
          <p className="text-gray-400 mt-2">Test your email configuration</p>
        </div>

        <div className="bg-white border-4 border-black shadow-brutal-lg p-8 text-black">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
            <Mail size={24} />
            SEND TEST EMAIL
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block font-bold mb-2">YOUR EMAIL ADDRESS</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-chefini-yellow"
              />
            </div>

            <ChefiniButton
              onClick={sendTestEmail}
              disabled={!email || loading}
              icon={Send}
              className="w-full justify-center"
            >
              {loading ? 'SENDING...' : 'SEND TEST EMAIL'}
            </ChefiniButton>
          </div>

          {result && (
            <div className={`mt-6 p-4 border-4 ${result.success ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'}`}>
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle size={24} className="text-green-600 flex-shrink-0" />
                ) : (
                  <AlertCircle size={24} className="text-red-600 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className="font-black text-lg mb-2">
                    {result.success ? '✅ SUCCESS!' : '❌ FAILED'}
                  </h3>
                  {result.success ? (
                    <div>
                      <p className="font-bold mb-2">Email sent successfully!</p>
                      <p className="text-sm">Message ID: {result.messageId}</p>
                      <p className="text-sm">Response: {result.response}</p>
                      <p className="text-sm mt-2 text-green-700">
                        ✅ Check your inbox (and spam folder) for the test email!
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-bold mb-2">Error Details:</p>
                      <pre className="text-xs bg-white p-3 border-2 border-red-300 overflow-auto">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-6 p-4 bg-chefini-yellow bg-opacity-20 border-2 border-chefini-yellow">
            <h3 className="font-black mb-2">📋 INSTRUCTIONS:</h3>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Enter your email address (use the same Gmail you configured)</li>
              <li>Click "SEND TEST EMAIL"</li>
              <li>Check your terminal/console for detailed logs</li>
              <li>Check your email inbox (and spam folder)</li>
              <li>If successful, you'll receive a test email from Chefini</li>
            </ol>
          </div>

          {/* Environment Check */}
          <div className="mt-6 p-4 bg-gray-100 border-2 border-gray-300">
            <h3 className="font-black mb-2">🔍 CURRENT CONFIG:</h3>
            <div className="text-sm space-y-1 font-mono">
              <p>EMAIL_HOST: {process.env.NEXT_PUBLIC_EMAIL_HOST || 'Not set'}</p>
              <p>EMAIL_PORT: {process.env.NEXT_PUBLIC_EMAIL_PORT || 'Not set'}</p>
              <p className="text-xs text-gray-600 mt-2">
                (Server-side vars won't show here, but they're checked in the API)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
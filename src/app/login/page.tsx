'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Zap, Crown, Users } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const handleLogin = async (role: 'founder' | 'rep') => {
    setError('');
    setLoadingRole(role);

    try {
      await login(role);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Sales OS</h1>
          <p className="text-sm text-gray-500 mt-1">Select your role to continue</p>
        </div>

        {/* Form / Selection */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <button
              onClick={() => handleLogin('founder')}
              disabled={loadingRole !== null}
              className={`w-full py-3.5 px-4 flex items-center justify-center gap-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-semibold transition-colors border border-indigo-200 ${loadingRole === 'founder' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Crown className="w-5 h-5" />
              {loadingRole === 'founder' ? 'Entering...' : 'Enter as Founder'}
            </button>

            <button
              onClick={() => handleLogin('rep')}
              disabled={loadingRole !== null}
              className={`w-full py-3.5 px-4 flex items-center justify-center gap-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold transition-colors border border-gray-200 ${loadingRole === 'rep' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Users className="w-5 h-5" />
              {loadingRole === 'rep' ? 'Entering...' : 'Enter as Sales Rep'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Lock, User, ShieldCheck, Key, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('acd_admin_auth');
      if (auth === 'true') {
        router.replace('/admin/dashboard');
      }
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      const customUser = localStorage.getItem('acd_custom_admin_user') || 'admin';
      const customPass = localStorage.getItem('acd_custom_admin_pass') || 'admin123';

      if (username.trim() === customUser && password === customPass) {
        localStorage.setItem('acd_admin_auth', 'true');
        localStorage.setItem('acd_admin_user', 'Grandmaster Admin');
        showToast('Welcome back, Admin! Authenticated successfully.', 'success');
        router.push('/admin/dashboard');
      } else {
        const errStr = 'Invalid username or password. Please check your admin credentials.';
        setError(errStr);
        showToast(errStr, 'error');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 glass-card p-8 sm:p-10 rounded-3xl border border-slate-700/80 shadow-2xl relative">
        
        {/* LOGO & TITLE */}
        <div className="text-center space-y-3">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-red-600 mx-auto shadow-xl">
            <Image src="/assets/logo.PNG" alt="ACD Martial Arts Logo" fill className="object-cover" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold font-outfit text-white">Admin Staff Portal</h2>
            <p className="text-xs text-amber-400 font-semibold">ACD Martial Arts – Sports Club Mandsaur</p>
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="bg-red-950/60 border border-red-800 p-3 rounded-xl text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-red-500" /> Admin Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter Admin Username"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-red-500" /> Admin Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Admin Password"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-4 pr-10 py-3 text-sm text-white focus:outline-none focus:border-red-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
          >
            {loading ? 'Authenticating...' : 'Log In To Admin Dashboard'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}

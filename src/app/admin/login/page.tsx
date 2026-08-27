'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, User, ArrowRight, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin1234');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter both admin username and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log(`[Admin Login UI] Submitting login request for: "${username}"...`);
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (data.success && data.token) {
        console.log(`[Admin Login UI] Authentication successful! Storing token and redirecting to /admin/dashboard...`);
        localStorage.setItem('dustbustars_admin_token', data.token);
        localStorage.setItem('dustbustars_admin_info', JSON.stringify(data.admin));
        router.push('/admin/dashboard');
      } else {
        console.warn(`[Admin Login UI] Authentication failed: ${data.error}`);
        setErrorMsg(data.error || 'Invalid administrator credentials.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      console.error('[Admin Login UI] Exception during login:', err);
      setErrorMsg(`Network or server error: ${err.message}`);
    }
  };

  const handleFillDemoCreds = () => {
    setUsername('admin');
    setPassword('admin1234');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-[#070f24] text-slate-100 flex flex-col justify-center items-center px-4 py-12 font-sans relative overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-[#0b1736]/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-black/60 relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-[#0f1a38] to-[#070f24] border border-slate-700/80 shadow-lg shadow-orange-500/10 mb-1">
            <img src="/logo.png" alt="DustBustars Logo" className="h-12 w-auto object-contain" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-[#ff6b00] border border-orange-500/20 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" /> Enterprise Control Center
            </span>
            <h1 className="text-2xl font-black text-white mt-2 tracking-tight">
              Admin Portal Access
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Sign in to manage London cleaners, bookings, and platform analytics
            </p>
          </div>
        </div>

        {/* Demo Credentials Quick-Fill Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-300 space-y-0.5">
            <div className="font-bold text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Demo Admin Account:
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Username: <span className="text-white font-bold">admin</span> | Pass: <span className="text-white font-bold">admin1234</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleFillDemoCreds}
            className="px-2.5 py-1.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-[#ff6b00] border border-orange-500/30 text-xs font-bold cursor-pointer active:scale-95 transition-all whitespace-nowrap"
          >
            Auto Fill ⚡
          </button>
        </div>

        {/* Error Alert Banner */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs font-medium flex items-start gap-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" /> Admin Username or Email
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#ff6b00] transition-colors"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" /> Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#ff6b00] transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#ff6b00] to-amber-500 hover:from-[#e05e00] hover:to-amber-600 text-white font-extrabold text-sm shadow-xl shadow-orange-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                Sign In to Admin Dashboard <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-500">
          <p>DustBustars Enterprise Admin Console &copy; 2026</p>
          <p className="mt-0.5 text-slate-600">Strictly Restricted Authorized Access Only</p>
        </div>

      </div>
    </div>
  );
}

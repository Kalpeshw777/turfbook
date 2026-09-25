'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRole, RoleType } from '@/components/role-context';
import Link from 'next/link';
import {
  User,
  Building2,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const { loginWithEmail, loginWithGoogle, register, setRole } = useRole();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<RoleType>('CUSTOMER');
  const [regTurfName, setRegTurfName] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) return;

    setLoading(true);
    setError('');
    const res = await loginWithEmail(loginEmail);
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Welcome back! Redirecting...');
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } else {
      setError(res.error || 'Login failed. Please check your credentials.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) return;

    setLoading(true);
    setError('');
    const res = await register({
      name: regName,
      email: regEmail,
      phone: regPhone,
      role: regRole,
      turfName: regRole === 'OWNER' ? regTurfName : undefined,
    });
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Account created successfully! Welcome to TurfBook.');
      setTimeout(() => {
        if (regRole === 'OWNER') router.push('/owner');
        else router.push('/');
      }, 1200);
    } else {
      setError(res.error || 'Registration failed.');
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const res = await loginWithGoogle('Kunal Sharma', 'kunal.sharma@gmail.com');
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Signed in with Google! Redirecting...');
      setTimeout(() => router.push('/'), 1000);
    } else {
      setError(res.error || 'Google login failed');
    }
  };

  const handleFastDemoLogin = (role: RoleType) => {
    setRole(role);
    setSuccessMsg(`Logged in as Demo ${role}! Redirecting...`);
    setTimeout(() => {
      if (role === 'OWNER') router.push('/owner');
      else if (role === 'ADMIN') router.push('/admin');
      else router.push('/');
    }, 800);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative">
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-emerald-500/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950/50 mx-auto mb-3">
            <span className="text-2xl">⚽</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Turf<span className="text-emerald-400">Book</span>
          </h1>
          <p className="text-xs text-slate-400">
            Sports pitch booking & arena management system
          </p>
        </div>

        {/* Tab Toggle (Sign In vs Sign Up) */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('LOGIN');
              setError('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 rounded-xl transition-all ${
              mode === 'LOGIN'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('REGISTER');
              setError('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 rounded-xl transition-all ${
              mode === 'REGISTER'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-teal-950/60 border border-teal-800 text-teal-300 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-2xl text-xs font-bold text-white transition-all flex items-center justify-center gap-3 shadow-md hover:border-slate-600"
        >
          {/* Google SVG Icon */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.4 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.98 0 12s.45 3.84 1.24 5.42l4.04-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.6 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px bg-slate-800 flex-1" />
          <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
            Or with email
          </span>
          <div className="h-px bg-slate-800 flex-1" />
        </div>

        {/* Mode 1: LOGIN FORM */}
        {mode === 'LOGIN' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Email Address or Mobile Number
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="e.g. rahul@gmail.com or 9820112345"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-300 font-semibold">Password</label>
                <button
                  type="button"
                  onClick={() => alert('Demo Mode: You can enter any password to sign in!')}
                  className="text-emerald-400 text-[11px] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <span>{loading ? 'Signing In...' : 'Sign In to TurfBook'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Mode 2: REGISTER FORM */
          <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
            {/* Role Picker */}
            <div>
              <label className="text-slate-300 font-semibold block mb-1.5">
                I want to join as:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRegRole('CUSTOMER')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    regRole === 'CUSTOMER'
                      ? 'bg-emerald-950 border-emerald-500 text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="block text-base mb-0.5">⚽</span>
                  <span>Player / Customer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRegRole('OWNER')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    regRole === 'OWNER'
                      ? 'bg-emerald-950 border-emerald-500 text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="block text-base mb-0.5">🏟️</span>
                  <span>Turf Owner / Host</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Sahil Khan"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="sahil@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Mobile Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+91 98200 44556"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* If Turf Owner: Turf Name */}
            {regRole === 'OWNER' && (
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Arena / Turf Business Name *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regTurfName}
                    onChange={(e) => setRegTurfName(e.target.value)}
                    placeholder="e.g. City Football Arena"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <span>{loading ? 'Creating Account...' : 'Complete Sign Up'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 1-Click Fast Demo Login for Testers */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block text-center">
            ⚡ 1-Click Instant Demo Login:
          </span>
          <div className="grid grid-cols-3 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => handleFastDemoLogin('CUSTOMER')}
              className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-center transition-colors"
            >
              ⚽ <strong className="block text-white font-semibold">Rahul</strong> (Customer)
            </button>
            <button
              type="button"
              onClick={() => handleFastDemoLogin('OWNER')}
              className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-emerald-400 text-center transition-colors"
            >
              🏟️ <strong className="block text-emerald-300 font-semibold">Vikram</strong> (Owner)
            </button>
            <button
              type="button"
              onClick={() => handleFastDemoLogin('ADMIN')}
              className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-center transition-colors"
            >
              🛡️ <strong className="block text-white font-semibold">Admin</strong> (Console)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

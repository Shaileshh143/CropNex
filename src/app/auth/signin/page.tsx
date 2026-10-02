'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { ArrowRight, ShieldCheck, CheckCircle2, Lock, Mail, Phone, Eye, EyeOff, AlertCircle, X } from 'lucide-react';

function AgritechSignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [mode, setMode] = useState<'signin' | 'create'>('signin');
  const [identifier, setIdentifier] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Forgot password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotStep, setForgotStep] = useState<'input' | 'otp' | 'success'>('input');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);

  const handleGoogleSignIn = () => {
    setLoading(true);
    signIn('google', { callbackUrl });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanId = identifier.trim();
    if (!cleanId) {
      setErrorMsg('Please enter your mobile number or email address.');
      return;
    }

    if (!password || password.length < 4) {
      setErrorMsg('Password must be at least 4 characters long.');
      return;
    }

    setLoading(true);
    try {
      // In NextAuth credentials, we sign in as a standard Buyer
      const res = await signIn('credentials', {
        role: 'buyer',
        name: mode === 'create' && name.trim() ? name.trim() : (cleanId.includes('@') ? cleanId.split('@')[0] : 'CropNex Buyer'),
        email: cleanId.includes('@') ? cleanId : `${cleanId.replace(/\D/g, '')}@buyer.cropnex.in`,
        redirect: false,
      });

      if (res?.error) {
        setErrorMsg('Invalid credentials. Please try again.');
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setErrorMsg('An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) return;
    setForgotStep('otp');
  };

  const handleVerifyOtpAndReset = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotStep('success');
    setTimeout(() => {
      setForgotModalOpen(false);
      setForgotStep('input');
      setResetSuccessMsg('Password has been successfully updated! You can now sign in.');
    }, 2000);
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-10 px-4 text-gray-900 bg-[#f8faf9]">
      {/* Brand Logo */}
      <Link href="/" className="mb-6 flex flex-col items-center group">
        <img
          src="/images/cropnex_logo.png"
          alt="CropNex Logo"
          className="w-16 h-16 rounded-full object-cover shadow-lg border-2 border-[#f59e0b] mb-2 group-hover:scale-105 transition"
        />
        <span className="text-3xl font-black tracking-tight text-gray-900 flex items-center">
          Crop<span className="text-[#f59e0b]">Nex</span>
          <span className="text-xs text-emerald-700 font-normal ml-0.5">.in</span>
        </span>
        <div className="h-1.5 w-24 bg-gradient-to-r from-[#f59e0b] via-emerald-500 to-[#f59e0b] rounded-full mt-0.5" />
      </Link>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl border border-gray-200 bg-white space-y-5 shadow-xl text-xs">
        {/* Sign In vs Create Account Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
            }}
            className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition ${
              mode === 'signin'
                ? 'border-emerald-700 text-emerald-950 font-black'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('create');
              setErrorMsg(null);
            }}
            className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition ${
              mode === 'create'
                ? 'border-emerald-700 text-emerald-950 font-black'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Reset Success Message */}
        {resetSuccessMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{resetSuccessMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2 font-semibold">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'create' && (
            <div>
              <label className="block font-bold text-gray-800 mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs"
              />
            </div>
          )}

          <div>
            <label className="block font-bold text-gray-800 mb-1">
              Mobile Number or Email
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Enter mobile number or email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs pr-10"
              />
              <div className="absolute right-3 top-3 text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-gray-800">
                {mode === 'signin' ? 'Password' : 'Create Password'}
              </label>
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() => {
                    setForgotIdentifier(identifier);
                    setForgotModalOpen(true);
                  }}
                  className="text-[11px] font-bold text-[#d97706] hover:underline"
                >
                  Forgot Password?
                </button>
              )}
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder={mode === 'signin' ? 'Enter password' : 'At least 6 characters'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold rounded-xl shadow-md transition text-xs sm:text-sm"
          >
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In to CropNex' : 'Create Your CropNex Account'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-3">
          <div className="border-t border-gray-200 w-full" />
          <span className="bg-white px-3 text-[11px] text-gray-400 font-bold uppercase">or</span>
          <div className="border-t border-gray-200 w-full" />
        </div>

        {/* Official Google Sign-In */}
        <div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/40 font-bold text-gray-800 flex items-center justify-center gap-3 shadow-sm transition"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Farmer Link */}
        <div className="pt-2 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-500">
            Are you a farmer or producer?{' '}
            <Link href="/seller" className="text-emerald-800 font-bold hover:underline">
              Sell on CropNex (Farmer Central) →
            </Link>
          </p>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-black text-sm text-gray-900">Reset Your Password</h3>
              <button
                type="button"
                onClick={() => setForgotModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotStep === 'input' && (
              <form onSubmit={handleSendResetOtp} className="space-y-3">
                <p className="text-gray-600 leading-relaxed">
                  Apna registered mobile number ya email enter karein. Hum aapko verification OTP code bhejenge.
                </p>
                <div>
                  <label className="block font-bold mb-1">Mobile or Email</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9821055001 ya rahul@gmail.com"
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl transition"
                >
                  Send Verification OTP
                </button>
              </form>
            )}

            {forgotStep === 'otp' && (
              <form onSubmit={handleVerifyOtpAndReset} className="space-y-3">
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-900 text-[11px]">
                  Verification code sent to <strong>{forgotIdentifier}</strong> (Demo OTP: <strong>4921</strong>)
                </div>
                <div>
                  <label className="block font-bold mb-1">Enter 4-Digit OTP</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter 4921"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-center font-mono font-bold tracking-widest text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Enter New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="New password (min 6 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold rounded-xl transition"
                >
                  Confirm &amp; Reset Password
                </button>
              </form>
            )}

            {forgotStep === 'success' && (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <p className="font-bold text-gray-900">Password Reset Successful!</p>
                <p className="text-[11px] text-gray-500">Redirecting to login...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Notice */}
      <div className="mt-8 text-[11px] text-gray-400 text-center">
        <p>© 2026 CropNex India. Direct Farm-to-Consumer Platform.</p>
      </div>
    </div>
  );
}

export default function AgritechSignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8faf9] flex items-center justify-center text-xs font-bold text-gray-500">
          Loading CropNex Sign In...
        </div>
      }
    >
      <AgritechSignInContent />
    </Suspense>
  );
}

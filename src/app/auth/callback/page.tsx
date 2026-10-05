'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const handleOAuthCallback = async () => {
      try {
        // Exchange session or check existing session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          if (isMounted) {
            setStatus('error');
            setErrorMsg(error.message);
          }
          return;
        }

        if (session) {
          if (isMounted) {
            setStatus('success');
            setTimeout(() => {
              router.push(next);
              router.refresh();
            }, 1000);
          }
        } else {
          // Listen to auth state in case hash processing takes a moment
          const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
            if (newSession && isMounted) {
              setStatus('success');
              setTimeout(() => {
                router.push(next);
                router.refresh();
              }, 1000);
            }
          });

          // Timeout fallback
          setTimeout(() => {
            if (isMounted && status === 'processing') {
              router.push(next);
            }
          }, 3500);

          return () => {
            subscription.unsubscribe();
          };
        }
      } catch (err: any) {
        if (isMounted) {
          setStatus('error');
          setErrorMsg(err?.message || 'Authentication error occurred.');
        }
      }
    };

    handleOAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [next, router, status]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-md w-full space-y-5">
        <div className="flex justify-center">
          <img
            src="/images/cropnex_logo.png"
            alt="CropNex Logo"
            className="w-16 h-16 rounded-full object-cover shadow-md border-2 border-[#f59e0b]"
          />
        </div>

        {status === 'processing' && (
          <div className="space-y-3">
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              Signing into CropNex via Google...
            </h2>
            <p className="text-xs text-gray-500">
              Please wait while we verify your Google credentials and create your secure session.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-3">
            <div className="flex justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 animate-bounce" />
            </div>
            <h2 className="text-lg font-black text-gray-900">
              Welcome to CropNex!
            </h2>
            <p className="text-xs text-emerald-700 font-semibold">
              Google authentication successful. Redirecting to marketplace...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-3">
            <div className="flex justify-center">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-lg font-bold text-red-900">
              Sign In Incomplete
            </h2>
            <p className="text-xs text-red-700">
              {errorMsg || 'Could not complete Google authentication.'}
            </p>
            <div className="pt-2">
              <Link
                href="/auth/signin"
                className="inline-block px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow"
              >
                Return to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}

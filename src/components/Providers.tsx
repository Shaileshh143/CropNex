'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { SupabaseAuthProvider } from '@/context/SupabaseAuthContext';
import { CartProvider } from '@/context/CartContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { LocationProvider } from '@/context/LocationContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SupabaseAuthProvider>
        <LanguageProvider>
          <LocationProvider>
            <CartProvider>{children}</CartProvider>
          </LocationProvider>
        </LanguageProvider>
      </SupabaseAuthProvider>
    </SessionProvider>
  );
}

import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

export const viewport: Viewport = {
  themeColor: '#0e2a1b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'CropNex.in: Online Farm Fresh Produce, Fruits, Vegetables & Grocery Store',
  description:
    'Online shopping at CropNex India for fresh vegetables, farm fruits, organic grains, spices and groceries. Fast delivery, direct farmer pricing, and best deals.',
  manifest: '/manifest.json',
  icons: {
    icon: '/images/icon-192.png',
    shortcut: '/images/icon-192.png',
    apple: '/images/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CropNex',
  },
  applicationName: 'CropNex',
  keywords: [
    'CropNex',
    'Direct Farm Produce',
    'Online Fresh Mandi',
    'Organic Vegetables',
    'Farm to Home',
    'Certified Kisan ID',
    'PWA',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/images/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#0e2a1b" />
      </head>
      <body
        suppressHydrationWarning
        className="antialiased flex flex-col min-h-screen bg-[#f8faf9] text-gray-900 pb-16 sm:pb-0 overflow-x-hidden"
      >
        <Providers>
          <Navbar />
          <CartDrawer />
          <main className="flex-1">{children}</main>
          <Footer />
          <PWAInstallPrompt />
        </Providers>
      </body>
    </html>
  );
}

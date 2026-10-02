import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';

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
    icon: '/images/cropnex_logo.png',
    shortcut: '/images/cropnex_logo.png',
    apple: '/images/cropnex_logo.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CropNex',
  },
  keywords: [
    'CropNex',
    'Direct Farm Produce',
    'Online Fresh Mandi',
    'Organic Vegetables',
    'Farm to Home',
    'Certified Kisan ID',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="antialiased flex flex-col min-h-screen bg-[#f8faf9] text-gray-900 pb-16 sm:pb-0 overflow-x-hidden"
      >
        <Providers>
          <Navbar />
          <CartDrawer />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

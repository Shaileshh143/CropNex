'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Globe, Sprout, Heart, Mail } from 'lucide-react';
import ContactSupportModal from '@/components/ContactSupportModal';

export default function AgritechFooter() {
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="text-white text-xs">
      {/* 1. Back to Top Bar */}
      <button
        onClick={scrollToTop}
        className="w-full py-3.5 bg-[#1b432c] hover:bg-[#23573a] text-center text-xs font-bold text-white transition tracking-wide"
      >
        ▲ Back to top
      </button>

      {/* 2. Main Directory Columns */}
      <div className="bg-[#0e2a1b] py-14 px-6 sm:px-12 border-b border-emerald-900/60">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Column 1 */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm">About CropNex</h4>
            <ul className="space-y-2 text-emerald-200/80 text-xs">
              <li><Link href="/" className="hover:text-white transition">About CropNex India</Link></li>
              <li><Link href="/" className="hover:text-white transition">Direct Farm Linkages</Link></li>
              <li><Link href="/" className="hover:text-white transition">Agricultural Impact</Link></li>
              <li><Link href="/" className="hover:text-white transition">Rural Cold-Chain Logistics</Link></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm">Connect with Us</h4>
            <ul className="space-y-2 text-emerald-200/80 text-xs">
              <li><a href="#" className="hover:text-white transition">Farmer Community</a></li>
              <li><a href="#" className="hover:text-white transition">APMC Mandi Updates</a></li>
              <li><a href="#" className="hover:text-white transition">Kisan Toll-Free: 1800-420-2026</a></li>
              <li>
                <button
                  type="button"
                  onClick={() => setSupportModalOpen(true)}
                  className="hover:text-white text-emerald-100 font-semibold transition flex items-center gap-1.5 text-left group"
                >
                  <span className="text-[#f59e0b]">Help:</span>
                  <span className="underline decoration-dotted underline-offset-4 group-hover:text-white">cropnexhelp@gmail.com</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3 */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm">Sell on CropNex</h4>
            <ul className="space-y-2 text-emerald-200/80 text-xs">
              <li><Link href="/seller" className="hover:text-white text-[#f59e0b] font-bold transition">Farmer &amp; Vendor Central</Link></li>
              <li><Link href="/seller" className="hover:text-white transition">List Your Harvested Crops</Link></li>
              <li><Link href="/seller" className="hover:text-white transition">Direct Escrow Payouts</Link></li>
              <li><Link href="/seller" className="hover:text-white transition">Cold Storage &amp; Fleet Transit</Link></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm">Help &amp; Orders</h4>
            <ul className="space-y-2 text-emerald-200/80 text-xs">
              <li><Link href="/orders" className="hover:text-white transition">Track Your Active Orders</Link></li>
              <li><Link href="/orders" className="hover:text-white transition">Download Tax Invoices</Link></li>
              <li><Link href="/orders" className="hover:text-white transition">Quality Assurance Policy</Link></li>
              <li>
                <button
                  type="button"
                  onClick={() => setSupportModalOpen(true)}
                  className="hover:text-white text-[#f59e0b] font-semibold transition text-left underline decoration-dotted underline-offset-4"
                >
                  24/7 Support: cropnexhelp@gmail.com
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Central Logo & Country Bar */}
        <div className="max-w-7xl mx-auto pt-10 mt-10 border-t border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-emerald-300">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              src="/images/cropnex_logo.png"
              alt="CropNex Logo"
              className="w-8 h-8 rounded-full object-cover shadow-sm border border-[#f59e0b] group-hover:scale-105 transition shrink-0"
            />
            <span className="text-xl font-black text-white flex items-center">
              Crop<span className="text-[#f59e0b]">Nex</span>
              <span className="text-xs text-emerald-300 font-normal ml-0.5">.in</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 text-xs">
            <span>🇮🇳 Direct Farm Produce Across All Indian States</span>
          </div>
        </div>
      </div>

      {/* 3. Bottom Legal Sub-Footer */}
      <div className="bg-[#091c12] py-6 px-4 text-center text-[11px] text-emerald-400/80 space-y-1.5">
        <div className="flex flex-wrap justify-center gap-4 text-emerald-300">
          <span className="hover:underline cursor-pointer">Conditions of Farm Trade</span>
          <span className="hover:underline cursor-pointer">Privacy Notice</span>
          <span className="hover:underline cursor-pointer">Quality Guarantee</span>
        </div>
        <p>© 2026, CropNex.in, Inc. Direct Farm-to-Consumer &amp; Wholesale Marketplace.</p>
      </div>

      {/* Interactive Support Modal */}
      <ContactSupportModal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
      />
    </footer>
  );
}

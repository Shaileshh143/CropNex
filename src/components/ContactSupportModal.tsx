'use client';

import React, { useState } from 'react';
import { Mail, Phone, Copy, Check, ExternalLink, X, HelpCircle, ShieldCheck } from 'lucide-react';

interface ContactSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactSupportModal({ isOpen, onClose }: ContactSupportModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('cropnexhelp@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenGmail = () => {
    window.open(
      'https://mail.google.com/mail/?view=cm&fs=1&to=cropnexhelp@gmail.com&su=CropNex%20Support%20Request&body=Hi%20CropNex%20Support%20Team%2C%0A%0AMy%20query%20is%3A%20',
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleOpenMailto = () => {
    window.location.href = 'mailto:cropnexhelp@gmail.com?subject=CropNex%20Support%20Request';
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-7 text-gray-900 space-y-5 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-gray-900">CropNex Help &amp; Support</h3>
              <p className="text-[11px] text-gray-500">24/7 Assistance for Farmers &amp; Buyers</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Email Box */}
        <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-950 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Official Support Email
            </span>
            <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
              Active
            </span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-emerald-200 flex items-center justify-between shadow-xs">
            <span className="font-mono font-bold text-emerald-950 text-xs sm:text-sm select-all">
              cropnexhelp@gmail.com
            </span>
            <button
              type="button"
              onClick={handleCopyEmail}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold transition shrink-0 ml-2"
              title="Copy email address"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 text-xs">
          {/* 1. Open in Gmail Web */}
          <button
            type="button"
            onClick={handleOpenGmail}
            className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-98"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open in Gmail (Browser)</span>
          </button>

          {/* 2. Open Default Mail App */}
          <button
            type="button"
            onClick={handleOpenMailto}
            className="w-full py-3 px-4 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold flex items-center justify-center gap-2 transition active:scale-98"
          >
            <Mail className="w-4 h-4 text-gray-500" />
            <span>Open in Default Mail App (Outlook/Mail)</span>
          </button>
        </div>

        {/* Toll Free Helpline */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#f59e0b]" />
            <span>Toll-Free Helpline:</span>
          </div>
          <a
            href="tel:18004202026"
            className="font-black text-gray-900 hover:text-emerald-700 hover:underline"
          >
            1800-420-2026
          </a>
        </div>
      </div>
    </div>
  );
}

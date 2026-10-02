'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Building,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { INITIAL_TENDERS } from '@/lib/initialData';

export default function TendersPage() {
  const { language } = useLanguage();
  const [tenders, setTenders] = useState<any[]>(INITIAL_TENDERS);
  const [selectedTender, setSelectedTender] = useState<any | null>(null);
  const [bidSubmitted, setBidSubmitted] = useState(false);

  useEffect(() => {
    fetchTenders();
  }, []);

  const fetchTenders = async () => {
    try {
      const res = await fetch('/api/tenders');
      const data = await res.json();
      if (data.success && data.data) {
        setTenders(data.data);
      }
    } catch (e) {
      console.warn('Tenders fetch fallback', e);
    }
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setBidSubmitted(true);
    setTimeout(() => {
      setBidSubmitted(false);
      setSelectedTender(null);
    }, 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Central &amp; State Procurement Aggregator
            </span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 mt-1">
            Government Agricultural Tenders
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Aggregated institutional procurement notices from MSAMB, FCI, and Armed Forces directly linked with official portals.
          </p>
        </div>

        <a
          href="https://etenders.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition"
        >
          <span>Official etenders.gov.in</span>
          <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
        </a>
      </div>

      {/* Tenders Grid */}
      <div className="space-y-4">
        {tenders.map((tender) => (
          <div
            key={tender.tenderId}
            className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-xl text-xs font-black bg-blue-100 text-blue-900">
                  {tender.tenderId}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                    tender.status === 'Open'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  ● {tender.status}
                </span>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-gray-400">Estimated Budget:</span>
                <span className="text-base font-black text-emerald-700 ml-2">
                  {tender.budgetEst}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-base font-black text-gray-900">
                {language === 'hi' && tender.hindiTitle ? tender.hindiTitle : tender.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-emerald-600" />
                <span>Issuing Authority: <strong>{tender.authority}</strong></span>
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-gray-400 block text-[11px]">Category</span>
                <span className="font-bold text-gray-800">{tender.category}</span>
              </div>
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-gray-400 block text-[11px]">Quantity Required</span>
                <span className="font-bold text-gray-800">{tender.quantityRequired}</span>
              </div>
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-gray-400 block text-[11px]">Target Region</span>
                <span className="font-bold text-gray-800">{tender.district}, {tender.state}</span>
              </div>
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-gray-400 block text-[11px]">Submission Deadline</span>
                <span className="font-bold text-red-600">{tender.deadline}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedTender(tender)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
              >
                Submit FPO / Farmer Bid
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Tender Application Modal */}
      {selectedTender && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div>
                <h3 className="text-lg font-black text-gray-900">Direct Tender Application</h3>
                <p className="text-xs text-gray-500">Ref: {selectedTender.tenderId}</p>
              </div>
              <button
                onClick={() => setSelectedTender(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bidSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-base font-black text-gray-900">Bid Successfully Lodged!</h4>
                <p className="text-xs text-gray-500">
                  Your collective farmer bid has been registered for evaluation with {selectedTender.authority}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">FPO / Cooperative Society Name</label>
                  <input
                    type="text"
                    required
                    defaultValue="Nashik Krishi Vikas FPO Cooperative"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Quote Price (₹/Quintal)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 4200"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Offered Capacity</label>
                    <input
                      type="text"
                      required
                      defaultValue="Full Tender Volume"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Authorized Representative Contact</label>
                  <input
                    type="text"
                    required
                    defaultValue="+91 98221 44521 (Dnyaneshwar Patil)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedTender(null)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition"
                  >
                    Confirm Submission
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

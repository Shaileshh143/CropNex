'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { INITIAL_FORECASTS } from '@/lib/initialData';

export default function ForecastPage() {
  const [forecasts, setForecasts] = useState<any[]>(INITIAL_FORECASTS);
  const [selectedCommodity, setSelectedCommodity] = useState('Tomato Hybrid');

  useEffect(() => {
    fetchForecasts();
  }, []);

  const fetchForecasts = async () => {
    try {
      const res = await fetch('/api/forecast');
      const data = await res.json();
      if (data.success && data.data) {
        setForecasts(data.data);
      }
    } catch (e) {
      console.warn('Forecast fetch fallback', e);
    }
  };

  const currentData =
    forecasts.find((f) => f.commodity.toLowerCase().includes(selectedCommodity.toLowerCase())) ||
    forecasts[0];

  const historical = currentData?.historicalPrices || [];
  const projected = currentData?.projectedPrices || [];

  const maxPrice = Math.max(
    ...historical.map((h: any) => h.price),
    ...projected.map((p: any) => p.price)
  );
  const minPrice = Math.min(
    ...historical.map((h: any) => h.price),
    ...projected.map((p: any) => p.price)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Algorithmic Agritech Intelligence
            </span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 mt-1">
            AI Mandi Spot Price Forecasting Engine
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            30-day econometric trend analysis based on APMC market arrivals, seasonal monsoons, and wholesale demand velocity.
          </p>
        </div>

        {/* Commodity Selector Pills */}
        <div className="flex flex-wrap gap-1.5 p-1.5 rounded-2xl bg-gray-100">
          {forecasts.map((f) => (
            <button
              key={f.commodity}
              onClick={() => setSelectedCommodity(f.commodity)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                selectedCommodity.toLowerCase() === f.commodity.toLowerCase()
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {f.commodity}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Forecast Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Current Spot Rate
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900">₹{currentData?.currentPrice}</span>
            <span className="text-xs text-gray-500 font-semibold">/ kg</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{currentData?.mandi}</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
            30-Day AI Projection
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-700">₹{currentData?.projected30DayPrice}</span>
            <span className="text-xs text-gray-500 font-semibold">/ kg</span>
          </div>
          <p className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            +
            {(
              ((currentData?.projected30DayPrice - currentData?.currentPrice) /
                currentData?.currentPrice) *
              100
            ).toFixed(1)}
            % Expected Momentum
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Model Confidence
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-600">{currentData?.confidenceScore}%</span>
            <span className="text-xs text-blue-600 font-bold">High Precision</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Cross-validated with 10yr APMC datasets</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Harvest Arrivals
          </span>
          <span className="text-xl font-black text-gray-900">{currentData?.harvestArrivalStatus}</span>
          <p className="text-xs text-amber-600 font-semibold mt-1">Tightening supply buffer</p>
        </div>
      </div>

      {/* Interactive Visual Chart & AI Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Interactive Visual Curve */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-base font-black text-gray-900">
                Price Projection Curve: {currentData?.commodity}
              </h3>
              <p className="text-xs text-gray-400">Historical Spot (Past 30 Days) vs AI Projected (Next 30 Days)</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block" />
                Historical
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                AI Projected
              </span>
            </div>
          </div>

          {/* SVG Visualized Trend Line */}
          <div className="relative h-64 w-full flex items-end justify-between gap-2 pt-8 pb-4">
            {/* Historical Bars */}
            {historical.map((h: any, i: number) => {
              const heightPercent = Math.max(15, ((h.price - minPrice + 5) / (maxPrice - minPrice + 10)) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-bold text-gray-600 opacity-0 group-hover:opacity-100 transition">
                    ₹{h.price}
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full rounded-t-xl bg-gray-300 group-hover:bg-gray-400 transition"
                  />
                  <span className="text-[10px] text-gray-400 font-medium truncate w-full text-center">
                    {h.date}
                  </span>
                </div>
              );
            })}

            {/* Projected Bars */}
            {projected.map((p: any, i: number) => {
              const heightPercent = Math.max(15, ((p.price - minPrice + 5) / (maxPrice - minPrice + 10)) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-black text-emerald-700 opacity-0 group-hover:opacity-100 transition">
                    ₹{p.price}
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full rounded-t-xl bg-emerald-500 group-hover:bg-emerald-600 transition shadow-sm"
                  />
                  <span className="text-[10px] text-emerald-700 font-bold truncate w-full text-center">
                    {p.date}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 text-xs text-gray-500 flex items-center justify-between">
            <span>Market Yard Reference: <strong>{currentData?.mandi}</strong></span>
            <span>Update Frequency: <strong>Hourly Algorithmic Synced</strong></span>
          </div>
        </div>

        {/* AI Action Advisory Box */}
        <div className="lg:col-span-4 p-6 sm:p-8 rounded-3xl bg-emerald-950 text-white flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800 text-emerald-200 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              Agronomist Strategic Recommendation
            </div>

            <h3 className="text-xl font-black text-white">
              Farmer Action Advisory
            </h3>

            <p className="text-xs text-emerald-200/90 leading-relaxed bg-emerald-900/60 p-4 rounded-2xl border border-emerald-800">
              {currentData?.recommendation}
            </p>

            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Avoid distress selling at local village gates.</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Lock forward contracts with verified wholesale buyers.</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Utilize CropNex consolidated cold-chain storage.</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => alert(`Forward contract alert registered for ${currentData?.commodity}!`)}
            className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs transition shadow-lg"
          >
            Create Forward Price Alert
          </button>
        </div>
      </div>
    </div>
  );
}

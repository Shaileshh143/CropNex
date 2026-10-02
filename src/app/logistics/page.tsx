'use client';

import React, { useState } from 'react';
import {
  Truck,
  MapPin,
  TrendingDown,
  Leaf,
  CheckCircle2,
  Navigation,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import LiveTransitMap from '@/components/LiveTransitMap';

export default function LogisticsPage() {
  const [optimized, setOptimized] = useState(true);

  const hubs = [
    {
      name: 'Pimpalgaon Baswant Farm-Gate Hub',
      district: 'Nashik',
      crops: 'Hybrid Tomato, Capsicum',
      capacity: '45 Tonnes/day',
      evCharging: 'Active (50 kW DC Fast)',
    },
    {
      name: 'Lasalgaon Mandi Consolidated Point',
      district: 'Nashik',
      crops: 'Garwa Red Onion',
      capacity: '120 Tonnes/day',
      evCharging: 'Active',
    },
    {
      name: 'Sangamner Mid-Corridor Cross-Dock',
      district: 'Ahmednagar',
      crops: 'Horticulture & Dairy',
      capacity: '60 Tonnes/day',
      evCharging: 'Active',
    },
    {
      name: 'Narayangaon Polyhouse Cluster Hub',
      district: 'Pune Rural',
      crops: 'Exotics, Turmeric, Pulses',
      capacity: '35 Tonnes/day',
      evCharging: 'Active',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Smart Agritech Transit Engine
            </span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 mt-1">
            Smart Logistics &amp; Route Clustering
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Combining fragmented smallholder farm-gate harvests into shared EV routes, cutting deadhead runs and food miles by over 20%.
          </p>
        </div>

        {/* Toggle Button */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-gray-100">
          <button
            onClick={() => setOptimized(false)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              !optimized ? 'bg-red-500 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Uncoordinated Routes
          </button>
          <button
            onClick={() => setOptimized(true)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              optimized ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            CropNex Clustered Route
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Transit Distance
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900">{optimized ? '164 km' : '210 km'}</span>
          </div>
          <p className={`text-xs font-bold mt-1 ${optimized ? 'text-emerald-600' : 'text-red-500'}`}>
            {optimized ? '▼ 46 km (-21.9%) Saved' : 'Multiple uncoordinated trips'}
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Total Corridor Fuel Cost
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-700">{optimized ? '₹10,800' : '₹14,200'}</span>
          </div>
          <p className={`text-xs font-bold mt-1 ${optimized ? 'text-emerald-600' : 'text-red-500'}`}>
            {optimized ? '₹3,400 Saved per truck run' : 'High fuel burn with empty backhauls'}
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Carbon Abatement
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-teal-600">{optimized ? '-84 kg CO2e' : 'Baseline'}</span>
          </div>
          <p className="text-xs text-teal-600 font-bold mt-1">Verified Clean Transit</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Vehicle Fill Rate
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-600">{optimized ? '94%' : '52%'}</span>
          </div>
          <p className="text-xs text-purple-600 font-bold mt-1">Multi-farmer consolidated payload</p>
        </div>
      </div>

      {/* Real Interactive Map Component with Google Maps Engine */}
      <LiveTransitMap isOptimized={optimized} />

      {/* Visual Corridor Route Map Simulator */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-black text-gray-900">
              Corridor Simulation: Nashik to Pune Metropolitan Market
            </h3>
            <p className="text-xs text-gray-400">
              Interactive waypoint sequencing based on harvest ready times and produce perishable life.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            {optimized ? 'Optimal Multi-Hub EV Clustering' : 'Traditional Separate Farmer Dispatches'}
          </span>
        </div>

        {/* Waypoints Visual Flow */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-900">HUB 1: Nashik Gate</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">06:00 AM</span>
            </div>
            <p className="text-xs text-gray-600">Pimpalgaon Baswant &amp; Lasalgaon</p>
            <p className="text-[11px] text-emerald-700 font-bold">Loaded: 3,200 kg Tomatoes &amp; Onions</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-900">HUB 2: Sangamner</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">08:15 AM</span>
            </div>
            <p className="text-xs text-gray-600">Cross-dock collection</p>
            <p className="text-[11px] text-emerald-700 font-bold">Added: 1,400 kg Salem Turmeric</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-900">HUB 3: Narayangaon</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">09:45 AM</span>
            </div>
            <p className="text-xs text-gray-600">Polyhouse cold-lock</p>
            <p className="text-[11px] text-emerald-700 font-bold">Added: 800 kg Capsicum</p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-blue-900">DESTINATION: Pune</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-200 text-blue-900">11:30 AM</span>
            </div>
            <p className="text-xs text-gray-600">Pune Wholesale Yard &amp; Retailers</p>
            <p className="text-[11px] text-blue-700 font-bold">Delivered: 5,400 kg Fresh Produce</p>
          </div>
        </div>

        {/* Detailed Corridor Summary */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-gray-600">
            <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Enabled with <strong>CropNex Multi-Hub Dynamic Manifest</strong>: All smallholders share shipping cost proportionally by weight!
            </span>
          </div>
          <button
            onClick={() => alert('Dispatching route manifest to logistics fleet...')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shrink-0"
          >
            Dispatch Consolidated Carrier
          </button>
        </div>
      </div>

      {/* Hubs Directory */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
        <h2 className="text-lg font-black text-gray-900">Active Farm-Gate Collection Hubs</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hubs.map((hub, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md transition space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-xs font-bold text-gray-900">{hub.name}</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {hub.district}
                </span>
              </div>
              <p className="text-xs text-gray-500">Produce: {hub.crops}</p>
              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100">
                <span>Daily Intake: <strong>{hub.capacity}</strong></span>
                <span className="text-emerald-700 font-semibold">⚡ {hub.evCharging}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

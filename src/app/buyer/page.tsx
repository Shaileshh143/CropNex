'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileText,
  MapPin,
  Phone,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { INITIAL_ORDERS } from '@/lib/initialData';

export default function BuyerDashboard() {
  const [orders, setOrders] = useState<any[]>(INITIAL_ORDERS);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<any>(INITIAL_ORDERS[0]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success && data.data) {
        setOrders(data.data);
        if (data.data.length > 0) {
          setActiveTrackingOrder(data.data[0]);
        }
      }
    } catch (e) {
      console.warn('Orders fetch fallback', e);
    }
  };

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'Pending':
        return 1;
      case 'Accepted':
        return 2;
      case 'Dispatched':
        return 3;
      case 'Delivered':
        return 4;
      default:
        return 1;
    }
  };

  const currentStep = getStepIndex(activeTrackingOrder?.status || 'Dispatched');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🏢</span>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Wholesale Buyer &amp; Processor Portal
            </span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 mt-1">
            Buyer Procurement &amp; Real-Time Order Tracking
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Logged in as: Aarav Agro Mart (APMC Vashi, Navi Mumbai). Direct farm shipments and dispatch milestones.
          </p>
        </div>

        <Link
          href="/marketplace"
          className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition self-start md:self-auto"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>New Farm Procurement</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Shipments</span>
            <Truck className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-black text-gray-900">{orders.length}</p>
          <p className="text-xs text-blue-600 font-semibold mt-1">Direct from Nashik &amp; Pune Hubs</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Procurement Savings</span>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-emerald-700">₹48,250</p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">24.5% saved vs traditional mandi brokers</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Mandi Escrow Locked</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-amber-600">₹31,000</p>
          <p className="text-xs text-gray-500 mt-1">Disbursed upon farm quality inspection</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Quality Grade Pass Rate</span>
            <CheckCircle2 className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-black text-purple-600">99.4%</p>
          <p className="text-xs text-gray-500 mt-1">Grade-A+ Verified at Farm Gate</p>
        </div>
      </div>

      {/* Main Tracking Section */}
      {activeTrackingOrder && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-xl text-xs font-black bg-blue-100 text-blue-900">
                  {activeTrackingOrder.orderNumber}
                </span>
                <span className="text-xs font-bold text-gray-500">
                  Created on: {new Date(activeTrackingOrder.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
              <h2 className="text-lg font-black text-gray-900 mt-1">
                Visual Dispatch Stepper Timeline
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => alert(`Downloading GST E-Invoice for ${activeTrackingOrder.orderNumber}...`)}
                className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>E-Invoice (PDF)</span>
              </button>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="relative">
            <div className="grid grid-cols-4 gap-2 text-center">
              {/* Step 1 */}
              <div className="space-y-2">
                <div
                  className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center font-bold text-xs transition ${
                    currentStep >= 1 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  1
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Order Placed</p>
                  <p className="text-[10px] text-gray-400">Escrow Reserved</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="space-y-2">
                <div
                  className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center font-bold text-xs transition ${
                    currentStep >= 2 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  2
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Farmer Accepted</p>
                  <p className="text-[10px] text-gray-400">Crated at Farm Gate</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="space-y-2">
                <div
                  className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center font-bold text-xs transition ${
                    currentStep >= 3 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  3
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">In Transit</p>
                  <p className="text-[10px] text-gray-400">Consolidated EV Carrier</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="space-y-2">
                <div
                  className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center font-bold text-xs transition ${
                    currentStep >= 4 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  4
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Delivered</p>
                  <p className="text-[10px] text-gray-400">Escrow Disbursed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stepper Logs & Driver Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
            <div className="lg:col-span-7 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Live Dispatch Milestones
              </h4>
              <div className="space-y-3 border-l-2 border-emerald-500 pl-4 py-1">
                {activeTrackingOrder.trackingHistory?.map((th: any, idx: number) => (
                  <div key={idx} className="space-y-0.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{th.status}</span>
                      <span className="text-[10px] text-gray-400">
                        ({new Date(th.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600">{th.description}</p>
                    <p className="text-[10px] text-emerald-700 font-medium">📍 {th.location}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Consolidated Transit Vehicle
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Carrier Vehicle:</span>
                  <span className="font-bold text-gray-900">MH-15-EG-4402 (EV Transit)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Driver Partner:</span>
                  <span className="font-bold text-gray-900">Suresh Gaikwad</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Destination:</span>
                  <span className="font-bold text-gray-900">{activeTrackingOrder.deliveryAddress}</span>
                </div>
              </div>
              <a
                href="tel:+919823455990"
                className="w-full py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Call Driver Partner (+91 98234 55990)</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Orders List Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
        <h2 className="text-lg font-black text-gray-900">All Procurement Orders</h2>

        <div className="space-y-3">
          {orders.map((ord) => (
            <div
              key={ord.id || ord.orderNumber}
              onClick={() => setActiveTrackingOrder(ord)}
              className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                activeTrackingOrder?.orderNumber === ord.orderNumber
                  ? 'border-emerald-500 bg-emerald-50/30'
                  : 'border-gray-100 hover:border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-gray-100 text-gray-800">
                  {ord.orderNumber}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">
                    {ord.items?.map((i: any) => i.name).join(', ')}
                  </h4>
                  <p className="text-[11px] text-gray-400">
                    Total: ₹{ord.totalAmount?.toLocaleString('en-IN')} | {ord.district}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                    ord.status === 'Pending'
                      ? 'bg-amber-100 text-amber-800'
                      : ord.status === 'Accepted'
                      ? 'bg-blue-100 text-blue-800'
                      : ord.status === 'Dispatched'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {ord.status}
                </span>
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  Track <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

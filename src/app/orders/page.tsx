'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Package,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  ChevronRight,
  FileText,
  X,
  RotateCcw,
  Star,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { INITIAL_ORDERS } from '@/lib/initialData';

export default function YourOrdersPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { addToCart, setIsCartOpen } = useCart();
  const [orders, setOrders] = useState<any[]>(INITIAL_ORDERS);

  useEffect(() => {
    if ((session?.user as any)?.role === 'farmer') {
      router.replace('/seller');
    }
  }, [session, router]);
  const [activeTab, setActiveTab] = useState<'orders' | 'buy-again' | 'in-transit'>('orders');
  const [trackingModalOrder, setTrackingModalOrder] = useState<any | null>(null);
  const [invoiceModalOrder, setInvoiceModalOrder] = useState<any | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success && data.data) {
        setOrders(data.data);
      }
    } catch (e) {
      console.warn('Orders fetch error', e);
    }
  };

  const handleReorder = (item: any) => {
    const dummyProduct: any = {
      id: item.productId,
      name: item.name,
      pricePerKg: item.pricePerKg,
      unit: item.unit || 'kg',
      image: item.image,
      category: 'Vegetables',
      availableQuantity: 500,
      minOrderQuantity: 1,
      farmLocation: 'Verified Farm',
      district: 'Nashik',
      state: 'Maharashtra',
      farmerName: 'Verified Producer',
      harvestDate: 'Fresh harvest',
      organic: true,
      description: '',
      shelfLifeDays: 10,
    };
    addToCart(dummyProduct, item.quantity || 1);
    setIsCartOpen(true);
    showToast(`Re-added ${item.name} to cart!`);
  };

  const displayedOrders = orders.filter((o) => {
    if (activeTab === 'in-transit') {
      return ['Pending', 'Accepted', 'Dispatched'].includes(o.status);
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-gray-900 min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0e2a1b] text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#f59e0b]" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="text-xs text-gray-500 flex items-center gap-1.5">
        <Link href="/" className="hover:underline text-emerald-800 font-medium">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-900 font-bold">Your Orders</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Your Farm Orders</h1>
          <p className="text-xs text-gray-500 mt-0.5">Track packages, download tax invoices, and reorder fresh batches.</p>
        </div>

        <Link
          href="/"
          className="px-5 py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold text-xs rounded-xl shadow-sm transition self-start sm:self-auto"
        >
          Browse Marketplace
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-200 text-xs sm:text-sm font-semibold text-gray-600">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 transition border-b-2 ${
            activeTab === 'orders'
              ? 'border-emerald-700 text-emerald-900 font-black'
              : 'border-transparent hover:text-gray-900'
          }`}
        >
          All Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('in-transit')}
          className={`pb-3 transition border-b-2 ${
            activeTab === 'in-transit'
              ? 'border-emerald-700 text-emerald-900 font-black'
              : 'border-transparent hover:text-gray-900'
          }`}
        >
          Active in Transit ({orders.filter((o) => ['Pending', 'Accepted', 'Dispatched'].includes(o.status)).length})
        </button>
        <button
          onClick={() => setActiveTab('buy-again')}
          className={`pb-3 transition border-b-2 ${
            activeTab === 'buy-again'
              ? 'border-emerald-700 text-emerald-900 font-black'
              : 'border-transparent hover:text-gray-900'
          }`}
        >
          Buy Again
        </button>
      </div>

      {/* Order Cards */}
      <div className="space-y-6">
        {displayedOrders.map((order) => (
          <div
            key={order.id || order.orderNumber}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm text-xs"
          >
            {/* Header Strip */}
            <div className="bg-[#f2f7f4] px-6 py-3.5 border-b border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-gray-600">
              <div>
                <span className="block text-[10px] uppercase font-bold tracking-wider text-gray-500">
                  Order Placed
                </span>
                <span className="font-bold text-gray-900">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div>
                <span className="block text-[10px] uppercase font-bold tracking-wider text-gray-500">Total</span>
                <span className="font-black text-emerald-900">
                  ₹{order.totalAmount?.toLocaleString('en-IN')}
                </span>
              </div>

              <div>
                <span className="block text-[10px] uppercase font-bold tracking-wider text-gray-500">Ship To</span>
                <span className="font-semibold text-gray-900">{order.buyerName}</span>
              </div>

              <div className="text-right">
                <span className="block text-[10px] uppercase font-bold tracking-wider text-gray-500">
                  Order ID: {order.orderNumber}
                </span>
                <button
                  onClick={() => setInvoiceModalOrder(order)}
                  className="text-emerald-700 hover:underline font-bold"
                >
                  Download Invoice ▾
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col md:flex-row items-start justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <h3 className="font-bold text-sm text-gray-900">
                      Status: {order.status}
                    </h3>
                  </div>
                  <p className="text-gray-500 text-[11px]">
                    Delivery Address: {order.deliveryAddress}
                  </p>
                </div>

                {/* Items */}
                <div className="space-y-3 pt-2">
                  {order.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4 items-center">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 rounded-xl object-cover border border-gray-200"
                        />
                      )}
                      <div>
                        <h4 className="font-bold text-gray-900">{item.name}</h4>
                        <p className="text-gray-500 text-[11px]">
                          Quantity: {item.quantity} {item.unit || 'kg'} • ₹{item.pricePerKg}/kg
                        </p>
                        <button
                          onClick={() => handleReorder(item)}
                          className="mt-2 px-3 py-1 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold rounded-lg text-[11px] shadow-sm transition"
                        >
                          Buy it again
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full md:w-56 space-y-2 shrink-0">
                <button
                  onClick={() => setTrackingModalOrder(order)}
                  className="w-full py-2.5 px-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Track package</span>
                </button>

                <button
                  onClick={() => setInvoiceModalOrder(order)}
                  className="w-full py-2 px-3 bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 rounded-xl shadow-sm font-semibold transition"
                >
                  View Invoice Details
                </button>

                <button
                  onClick={() => setFeedbackModalOpen(true)}
                  className="w-full py-2 px-3 bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 rounded-xl shadow-sm font-semibold transition"
                >
                  Leave farmer review
                </button>
              </div>
            </div>
          </div>
        ))}

        {displayedOrders.length === 0 && (
          <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center space-y-3">
            <Package className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="font-bold text-gray-900">No orders in this tab</h3>
            <p className="text-xs text-gray-500">Place a direct farm order from the marketplace.</p>
          </div>
        )}
      </div>

      {/* TRACKING DETAILS MODAL */}
      {trackingModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 p-6 sm:p-8 space-y-6 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-black text-base text-gray-900">Delivery Tracking</h3>
                <p className="text-gray-500">Order #{trackingModalOrder.orderNumber}</p>
              </div>
              <button
                onClick={() => setTrackingModalOrder(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-1">
              <h4 className="font-bold text-sm text-emerald-950">
                Current Status: {trackingModalOrder.status}
              </h4>
              <p className="text-emerald-800">
                Destination: {trackingModalOrder.deliveryAddress}
              </p>
            </div>

            {/* Tracking Stepper Timeline */}
            <div className="space-y-4 border-l-2 border-emerald-600 pl-4 py-1">
              {trackingModalOrder.trackingHistory?.map((step: any, idx: number) => (
                <div key={idx} className="space-y-0.5">
                  <p className="font-bold text-gray-900">{step.status}</p>
                  <p className="text-gray-600">{step.description}</p>
                  <p className="text-[10px] text-gray-400">
                    📍 {step.location} • {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setTrackingModalOrder(null)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAX INVOICE MODAL */}
      {invoiceModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 p-6 sm:p-8 space-y-5 text-xs text-gray-800">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-black text-base text-gray-900">CropNex Tax Invoice</h3>
                <p className="text-gray-500">Ref: {invoiceModalOrder.orderNumber}</p>
              </div>
              <button
                onClick={() => setInvoiceModalOrder(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl space-y-1.5 border border-gray-200">
              <div className="flex justify-between">
                <span>Buyer Name:</span>
                <span className="font-bold">{invoiceModalOrder.buyerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Mode:</span>
                <span className="font-bold">{invoiceModalOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span className="font-bold">{new Date(invoiceModalOrder.createdAt).toLocaleDateString('en-IN')}</span>
              </div>
            </div>

            <div className="space-y-2 border-t border-b border-gray-100 py-3">
              <h4 className="font-bold">Ordered Produce:</h4>
              {invoiceModalOrder.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-gray-600">
                  <span>{item.name} ({item.quantity} {item.unit || 'kg'} @ ₹{item.pricePerKg})</span>
                  <span className="font-bold text-gray-900">₹{item.total}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between font-black text-sm text-emerald-950">
              <span>Total Paid:</span>
              <span>₹{invoiceModalOrder.totalAmount?.toLocaleString('en-IN')}</span>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setInvoiceModalOrder(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 font-bold hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                  setInvoiceModalOrder(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold"
              >
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FEEDBACK MODAL */}
      {feedbackModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 p-6 space-y-4 text-xs">
            <h3 className="font-bold text-base text-gray-900">Rate Farmer Produce</h3>
            <p className="text-gray-500">Your rating directly empowers verified Indian smallholders.</p>

            <div className="flex gap-2 justify-center py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setFeedbackRating(star)}
                  className="p-1 hover:scale-110 transition"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= feedbackRating
                        ? 'fill-[#f59e0b] text-[#f59e0b]'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              placeholder="Write your review on produce freshness, packing, and quality..."
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setFeedbackModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setFeedbackModalOpen(false);
                  showToast('Thank you! Your feedback has been recorded.');
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

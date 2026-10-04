'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import {
  ShieldCheck,
  CheckCircle2,
  Truck,
  ArrowLeft,
  Lock,
  MapPin,
  Barcode,
  ShoppingBag,
  AlertTriangle,
  CreditCard,
  Banknote,
  Smartphone,
  ChevronRight,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLocation } from '@/context/LocationContext';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { cart, buyNowItem, setBuyNowItem, clearBuyNowItem, updateQuantity, clearCart } = useCart();
  const { buyerLocation, getTransitEstimate } = useLocation();

  const isFarmerAccount = (session?.user as any)?.role === 'farmer';

  // If farmer, redirect to seller portal
  useEffect(() => {
    if ((session?.user as any)?.role === 'farmer') {
      router.replace('/seller');
    }
  }, [session, router]);

  // If buyer is not logged in, immediately redirect to login page
  useEffect(() => {
    if (status !== 'loading' && !session?.user) {
      router.replace('/auth/signin?callbackUrl=/checkout');
    }
  }, [session, status, router]);

  const [fullName, setFullName] = useState(session?.user?.name || 'Rahul Sharma');
  const [mobile, setMobile] = useState('9821055001');
  const [flatHouse, setFlatHouse] = useState('Flat 402, Green Meadows');
  const [areaStreet, setAreaStreet] = useState('Kisan Road, Near Mandi Gate');
  const [landmark, setLandmark] = useState('Behind Agro Center');
  const [city, setCity] = useState(buyerLocation.city);
  const [state, setState] = useState(buyerLocation.state);
  const [pincode, setPincode] = useState(buyerLocation.pincode);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod' | 'card'>('upi');
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);

  useEffect(() => {
    if (session?.user?.name) setFullName(session.user.name);
    setCity(buyerLocation.city);
    setState(buyerLocation.state);
    setPincode(buyerLocation.pincode);
  }, [session, buyerLocation]);

  // Determine items to checkout (buyNowItem takes precedence if present)
  const checkoutItems = buyNowItem ? [buyNowItem] : cart;
  const itemsCount = checkoutItems.reduce((acc, item) => acc + item.quantity, 0);
  const checkoutSubtotal = checkoutItems.reduce((acc, item) => acc + item.product.pricePerKg * item.quantity, 0);
  const totalMrp = checkoutItems.reduce((acc, item) => acc + (item.product.mrp || item.product.pricePerKg * 1.3) * item.quantity, 0);
  const totalSavings = Math.max(0, Math.round(totalMrp - checkoutSubtotal));
  const isFreeDelivery = checkoutSubtotal >= 499;
  const deliveryCharge = isFreeDelivery || checkoutItems.length === 0 ? 0 : 50;
  const grandTotal = checkoutSubtotal + deliveryCharge;

  const handleUpdateItemQuantity = (productId: string, newQty: number) => {
    if (buyNowItem && buyNowItem.product.id === productId) {
      if (newQty <= 0) {
        clearBuyNowItem();
        router.push('/');
      } else {
        setBuyNowItem({ ...buyNowItem, quantity: newQty });
      }
    } else {
      updateQuantity(productId, newQty);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFarmerAccount) {
      alert('Farmer accounts cannot place consumer retail orders. Please sign in with a Buyer account.');
      return;
    }
    if (checkoutItems.length === 0) {
      alert('Your checkout is empty.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        buyerName: fullName,
        buyerEmail: session?.user?.email || 'buyer@cropnex.in',
        buyerPhone: `+91 ${mobile}`,
        deliveryAddress: `${flatHouse}, ${areaStreet}, Landmark: ${landmark}, ${city}, ${state} - ${pincode}`,
        district: city,
        state: state,
        items: checkoutItems.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          pricePerKg: item.product.pricePerKg,
          quantity: item.quantity,
          unit: item.product.unit || 'kg',
          total: item.product.pricePerKg * item.quantity,
          image: item.product.image,
        })),
        subtotal: checkoutSubtotal,
        logisticsFee: deliveryCharge,
        totalAmount: grandTotal,
        paymentMethod: paymentMethod === 'upi' ? 'UPI / Direct Bank Transfer' : paymentMethod === 'cod' ? 'Cash on Delivery (Pay on Inspection)' : 'Debit / Credit Card',
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setOrderSuccess(data.data);
        if (buyNowItem) {
          clearBuyNowItem();
        } else {
          clearCart();
        }
      }
    } catch (err) {
      console.error('Failed to create order', err);
      alert('Order placement failed. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-[#f8faf9] py-12 px-4 flex items-center justify-center text-gray-900">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-8 space-y-6 text-center border border-gray-200 animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block">Direct Farm Order Placed</span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">Thank You For Your Order!</h1>
            <p className="text-xs text-gray-500 mt-1">
              Order ID: <strong className="text-emerald-950 font-mono text-sm">{orderSuccess.orderNumber}</strong>
            </p>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Total Paid / Payable:</span>
              <span className="font-black text-emerald-950 text-sm">₹{orderSuccess.totalAmount?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment Mode:</span>
              <span className="font-semibold text-gray-800">{orderSuccess.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Destination:</span>
              <span className="font-medium text-gray-800 truncate max-w-[260px]">{orderSuccess.deliveryAddress}</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Link
              href="/orders"
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-md block transition"
            >
              Track Package &amp; Print GST Invoice
            </Link>
            <Link
              href="/"
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl block transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faf9] text-gray-900 pb-16">
      {/* Checkout Header */}
      <header className="bg-[#0e2a1b] text-white py-4 px-4 sm:px-8 border-b border-emerald-800/40 sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight">
              Crop<span className="text-[#f59e0b]">Nex</span>
              <span className="text-xs text-emerald-300 ml-0.5">.in</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-bold text-emerald-200">
            <Lock className="w-4 h-4 text-[#f59e0b]" />
            <span>256-Bit SSL Secure Checkout</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/" className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Marketplace
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-xs font-semibold text-gray-500">Order Checkout</span>
        </div>

        {/* 1. FARMER ACCOUNT RESTRICTION BANNER */}
        {isFarmerAccount && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-start gap-3 text-xs text-amber-950">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-black text-sm">Farmer Account Notice: Only Buyers Can Purchase Produce</h3>
              <p className="text-gray-700 leading-relaxed">
                Aapka logged-in account ek Certified Farmer account hai ({session?.user?.name}). Farmer account se retail consumer orders place nahi ho sakte. Please sign in with a Buyer account to checkout.
              </p>
              <div className="pt-2 flex gap-3">
                <Link
                  href="/auth/signin"
                  className="px-4 py-1.5 rounded-lg bg-emerald-800 text-white font-bold hover:bg-emerald-900 transition"
                >
                  Switch to Buyer Account
                </Link>
                <Link
                  href="/seller"
                  className="px-4 py-1.5 rounded-lg bg-gray-200 text-gray-800 font-bold hover:bg-gray-300 transition"
                >
                  Return to Farmer Dashboard
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 2. LOGIN BARRIER (IF NOT LOGGED IN) */}
        {!session?.user && (
          <div className="mb-6 p-6 rounded-3xl bg-white border border-gray-200 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Step 1 Required</span>
              <h3 className="text-base font-black text-gray-900">Sign in to your CropNex account</h3>
              <p className="text-gray-500 mt-0.5">Save your delivery address, track package in real-time, and get farm escrow protection.</p>
            </div>
            <button
              onClick={() => signIn(undefined, { callbackUrl: '/checkout' })}
              className="px-6 py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold rounded-xl transition shadow-sm whitespace-nowrap self-start sm:self-auto"
            >
              Sign In to Continue
            </button>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: ADDRESS, PAYMENT & ITEMS (8 COLS) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Step 1: Delivery Address */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-800 text-white font-black flex items-center justify-center text-xs">
                    1
                  </div>
                  <h2 className="text-base font-black text-gray-900">Delivery Address</h2>
                </div>
                <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Farm-to-Doorstep Delivery</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Enter recipient name"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-800 mb-1">10-Digit Mobile Number</label>
                  <div className="flex">
                    <span className="p-2.5 bg-gray-100 border border-r-0 border-gray-300 rounded-l-xl font-bold text-gray-600">+91</span>
                    <input
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="flex-1 p-2.5 border border-gray-300 rounded-r-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="9821055001"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Flat, House no., Building, Company, Apartment</label>
                <input
                  type="text"
                  required
                  value={flatHouse}
                  onChange={(e) => setFlatHouse(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="e.g. Flat 402, Green Meadows"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Area, Street, Sector, Village</label>
                  <input
                    type="text"
                    required
                    value={areaStreet}
                    onChange={(e) => setAreaStreet(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="e.g. Kisan Road, Mandi Gate"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Landmark</label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="e.g. Near Community Center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Town / City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-800 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm space-y-4 text-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <div className="w-7 h-7 rounded-full bg-emerald-800 text-white font-black flex items-center justify-center text-xs">
                  2
                </div>
                <h2 className="text-base font-black text-gray-900">Select Payment Method</h2>
              </div>

              <div className="space-y-3">
                <label
                  onClick={() => setPaymentMethod('upi')}
                  className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                    paymentMethod === 'upi' ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 text-sm">UPI / QR (Google Pay, PhonePe, Paytm, BHIM)</span>
                      <Smartphone className="w-5 h-5 text-emerald-700" />
                    </div>
                    <p className="text-gray-500 text-[11px] mt-0.5">Instant zero-fee payment with buyer escrow protection.</p>
                  </div>
                </label>

                <label
                  onClick={() => setPaymentMethod('cod')}
                  className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                    paymentMethod === 'cod' ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 text-sm">Cash on Delivery / Pay on Inspection</span>
                      <Banknote className="w-5 h-5 text-emerald-700" />
                    </div>
                    <p className="text-gray-500 text-[11px] mt-0.5">Pay after inspecting produce quality at doorstep.</p>
                  </div>
                </label>

                <label
                  onClick={() => setPaymentMethod('card')}
                  className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                    paymentMethod === 'card' ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 text-sm">Credit / Debit Card / Net Banking</span>
                      <CreditCard className="w-5 h-5 text-emerald-700" />
                    </div>
                    <p className="text-gray-500 text-[11px] mt-0.5">Visa, MasterCard, RuPay &amp; all major Indian banks supported.</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Step 3: Review Items & Delivery Transit */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-800 text-white font-black flex items-center justify-center text-xs">
                    3
                  </div>
                  <h2 className="text-base font-black text-gray-900">Review Farm Items &amp; Realistic Transit</h2>
                </div>
                <span className="font-bold text-gray-600">{itemsCount} {itemsCount === 1 ? 'item' : 'items'}</span>
              </div>

              {checkoutItems.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto" />
                  <p className="text-gray-500 font-bold">No produce items in checkout</p>
                  <Link href="/" className="text-emerald-800 font-bold hover:underline">
                    Browse Fresh Produce
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {checkoutItems.map((item) => {
                    const transit = getTransitEstimate(item.product.district, item.product.state);
                    const itemTotal = item.product.pricePerKg * item.quantity;
                    const itemMrpTotal = (item.product.mrp || item.product.pricePerKg * 1.3) * item.quantity;

                    return (
                      <div
                        key={item.product.id}
                        className="p-4 rounded-2xl border border-gray-200 bg-gray-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3.5">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-20 h-20 rounded-xl object-cover border border-gray-200 shrink-0"
                          />
                          <div className="space-y-1">
                            <h4 className="font-bold text-gray-900 text-sm leading-tight">{item.product.name}</h4>
                            <p className="text-emerald-800 font-semibold text-[11px]">
                              📍 Origin: {item.product.farmLocation}, {item.product.state}
                            </p>
                            <div className="flex items-center gap-1.5 font-mono text-[10px] text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200 w-fit">
                              <Barcode className="w-3 h-3 text-emerald-800" />
                              <span>{item.product.barcode}</span>
                            </div>
                            <div className="flex items-center gap-1 text-emerald-900 font-bold text-[11px] pt-1">
                              <Truck className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Transit: {transit.days} ({transit.badge})</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-200">
                          {/* Stepper */}
                          <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                            <button
                              type="button"
                              onClick={() => handleUpdateItemQuantity(item.product.id, item.quantity - 1)}
                              className="px-2.5 py-1 text-gray-700 hover:bg-gray-100 font-bold"
                            >
                              -
                            </button>
                            <span className="px-2.5 font-bold text-gray-900 text-xs">
                              {item.quantity} {item.product.unit || 'kg'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateItemQuantity(item.product.id, item.quantity + 1)}
                              className="px-2.5 py-1 text-gray-700 hover:bg-gray-100 font-bold"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right mt-2">
                            <div className="text-sm font-black text-gray-900">
                              ₹{itemTotal.toLocaleString('en-IN')}
                            </div>
                            <div className="text-[10px] text-gray-400 line-through">
                              M.R.P.: ₹{Math.round(itemMrpTotal).toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: ORDER SUMMARY & PLACE ORDER (4 COLS) */}
          <div className="lg:col-span-4 sticky top-24 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-lg space-y-5 text-xs">
              <h3 className="text-base font-black text-gray-900 pb-3 border-b border-gray-100">
                Order Summary
              </h3>

              <div className="space-y-2.5 text-gray-600">
                <div className="flex justify-between">
                  <span>Total M.R.P.:</span>
                  <span className="line-through text-gray-400">₹{Math.round(totalMrp).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Farm Selling Price:</span>
                  <span className="font-bold text-gray-900">₹{checkoutSubtotal.toLocaleString('en-IN')}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between text-emerald-800 font-bold">
                    <span>Direct Farm Savings:</span>
                    <span>-₹{totalSavings.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Farm Logistics &amp; Crating:</span>
                  <span className="font-bold text-gray-900">
                    {isFreeDelivery ? <span className="text-emerald-700 font-bold">FREE</span> : `₹${deliveryCharge}`}
                  </span>
                </div>
                {!isFreeDelivery && checkoutSubtotal > 0 && (
                  <p className="text-[10px] text-amber-700 bg-amber-50 p-2 rounded-lg font-medium">
                    Tip: Add ₹{499 - checkoutSubtotal} more produce for FREE farm delivery!
                  </p>
                )}
                <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline text-sm font-bold text-gray-900">
                  <span>Order Total:</span>
                  <span className="text-2xl font-black text-emerald-950">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={submitting || checkoutItems.length === 0 || isFarmerAccount}
                className="w-full py-3.5 px-4 bg-[#f59e0b] hover:bg-[#d97706] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-black text-sm rounded-xl shadow-lg shadow-amber-900/20 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span>Processing Farm Order...</span>
                ) : isFarmerAccount ? (
                  <span>Farmer Account Restricted</span>
                ) : (
                  <>
                    <span>Place Your Order</span>
                    <ChevronRight className="w-4 h-4 stroke-[3]" />
                  </>
                )}
              </button>

              <div className="space-y-2 pt-2 border-t border-gray-100 text-[11px] text-gray-500">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Farm Gate Escrow Protection</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Pay on Inspection or Instant UPI Refund</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

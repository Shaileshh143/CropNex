'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import { useLocation } from '@/context/LocationContext';
import {
  X,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Truck,
  ArrowRight,
  ShoppingBag,
  LogIn,
  User,
  AlertTriangle,
} from 'lucide-react';

export default function CartDrawer() {
  const router = useRouter();
  const { data: session } = useSession();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    clearBuyNowItem,
    isCartOpen,
    setIsCartOpen,
    subtotal,
    totalItems,
  } = useCart();
  const { buyerLocation } = useLocation();

  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [loginRequiredModalOpen, setLoginRequiredModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);

  // Address form auto-populated with detected location & session name
  const [formData, setFormData] = useState({
    fullName: session?.user?.name || 'Rahul Sharma',
    mobile: '9821055001',
    pincode: buyerLocation.pincode,
    flatHouse: 'Flat 402, Green Meadows',
    areaStreet: 'Kisan Road',
    landmark: 'Near Agro Mandi Gate',
    city: buyerLocation.city,
    state: buyerLocation.state,
    paymentMethod: 'UPI / Direct Bank Transfer',
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      fullName: session?.user?.name || prev.fullName,
      city: buyerLocation.city,
      state: buyerLocation.state,
      pincode: buyerLocation.pincode,
    }));
  }, [buyerLocation, session]);

  const [farmerRestrictionModalOpen, setFarmerRestrictionModalOpen] = useState(false);

  if (!isCartOpen) return null;

  const isFreeDelivery = subtotal >= 499;
  const deliveryCharge = isFreeDelivery ? 0 : 50;
  const grandTotal = subtotal + deliveryCharge;

  const handleProceedClick = () => {
    // Clear any temporary buy-now item to checkout the cart
    clearBuyNowItem();

    // 1. If buyer is not logged in, redirect directly to login page!
    if (!session?.user) {
      setIsCartOpen(false);
      router.push('/auth/signin?callbackUrl=/checkout');
      return;
    }
    // 2. Check if farmer account
    if ((session?.user as any)?.role === 'farmer') {
      setFarmerRestrictionModalOpen(true);
      return;
    }
    // 3. Navigate to dedicated checkout page
    setIsCartOpen(false);
    router.push('/checkout');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        buyerName: formData.fullName,
        buyerEmail: session?.user?.email || 'customer@cropnex.in',
        buyerPhone: `+91 ${formData.mobile}`,
        deliveryAddress: `${formData.flatHouse}, ${formData.areaStreet}, Landmark: ${formData.landmark}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
        district: formData.city,
        state: formData.state,
        items: cart.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          pricePerKg: item.product.pricePerKg,
          quantity: item.quantity,
          unit: item.product.unit || 'kg',
          total: item.product.pricePerKg * item.quantity,
          image: item.product.image,
        })),
        subtotal,
        logisticsFee: deliveryCharge,
        totalAmount: grandTotal,
        paymentMethod: formData.paymentMethod,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setOrderSuccess(data.data);
        clearCart();
      }
    } catch (err) {
      console.error('Failed to create order', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinish = () => {
    setOrderSuccess(null);
    setCheckoutModalOpen(false);
    setIsCartOpen(false);
    router.push('/orders');
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsCartOpen(false)}
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
          <div className="w-screen max-w-full sm:max-w-md bg-white shadow-2xl flex flex-col text-gray-900">
            {/* Header */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 flex items-center justify-between bg-emerald-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-[#f59e0b]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">
                    Produce Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
                  </h3>
                  <p className="text-[11px] text-gray-500">Delivering to {buyerLocation.city}, {buyerLocation.state}</p>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Delivery Bar */}
            {cart.length > 0 && (
              <div className="px-4 sm:px-6 py-2 sm:py-2.5 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2 text-xs text-emerald-900 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {isFreeDelivery ? (
                    <strong>Your order qualifies for FREE Farm Delivery!</strong>
                  ) : (
                    <span>Add ₹{499 - subtotal} more for FREE Farm Delivery</span>
                  )}
                </span>
              </div>
            )}

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-20 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto text-emerald-600">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-gray-800">Your Cart is empty</h4>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto">
                    Browse verified produce directly from Indian farmers and orchards.
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-2 px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-md transition"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-3.5 pb-4 border-b border-gray-100 text-xs"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-20 h-20 rounded-xl object-cover border border-gray-200 shrink-0"
                    />
                    <div className="flex-1 space-y-1">
                      <h4 className="font-bold text-gray-900 line-clamp-2 leading-tight">
                        {item.product.name}
                      </h4>
                      <p className="text-emerald-700 font-semibold text-[11px]">
                        📍 Farm: {item.product.farmLocation}, {item.product.state}
                      </p>

                      <div className="flex items-center justify-between pt-2">
                        {/* Stepper +/- */}
                        <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="px-2.5 py-1 text-gray-700 hover:bg-gray-200 font-bold"
                          >
                            -
                          </button>
                          <span className="px-2 font-bold text-gray-900 text-xs">
                            {item.quantity} {item.product.unit || 'kg'}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="px-2.5 py-1 text-gray-700 hover:bg-gray-200 font-bold"
                          >
                            +
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <span className="font-black text-gray-900 text-sm">
                            ₹{(item.product.pricePerKg * item.quantity).toLocaleString('en-IN')}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-red-500 hover:underline text-[11px] block mt-0.5 ml-auto font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary & Proceed Button */}
            {cart.length > 0 && (
              <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50 space-y-3 sm:space-y-3.5">
                <div className="space-y-1.5 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Produce Subtotal:</span>
                    <span className="font-bold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Farm Transit Fee:</span>
                    <span className="font-bold text-gray-900">
                      {isFreeDelivery ? <span className="text-emerald-700">FREE</span> : `₹${deliveryCharge}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-gray-900 pt-1.5 border-t border-gray-200">
                    <span>Order Total:</span>
                    <span className="text-emerald-900 text-base font-black">
                      ₹{grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleProceedClick}
                  className="w-full py-3 px-4 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition"
                >
                  <span>Proceed to Farm Checkout ({totalItems} items)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LOGIN REQUIRED MODAL (APPEARS IF BUYER IS NOT LOGGED IN) */}
      {loginRequiredModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 text-gray-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <LogIn className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-gray-900">Sign In to Continue</h3>
                  <p className="text-xs text-gray-500">Please sign in to place your farm order</p>
                </div>
              </div>
              <button
                onClick={() => setLoginRequiredModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              To guarantee farm gate authenticity, order tracking, and escrow security, you must be logged in before entering your delivery address.
            </p>

            <div className="space-y-3">
              {/* Google Sign In */}
              <button
                onClick={() => {
                  signIn('google', { callbackUrl: '/' });
                }}
                className="w-full py-3 px-4 rounded-xl border border-gray-300 hover:border-gray-400 font-bold text-xs flex items-center justify-center gap-2.5 shadow-sm transition"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-gray-200 w-full" />
                <span className="bg-white px-2 text-[10px] text-gray-400 uppercase font-bold">Or 1-Click Demo</span>
                <div className="border-t border-gray-200 w-full" />
              </div>

              {/* Instant Customer Demo Login */}
              <button
                onClick={async () => {
                  await signIn('credentials', {
                    role: 'buyer',
                    name: 'Rahul Sharma',
                    email: 'rahul.sharma@gmail.com',
                    redirect: false,
                  });
                  setLoginRequiredModalOpen(false);
                  setCheckoutModalOpen(true);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-950 font-bold text-xs flex items-center justify-between transition"
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-700" />
                  <span>Instant Login as Rahul Sharma</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FARMER ACCOUNT PURCHASE RESTRICTION MODAL */}
      {farmerRestrictionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 text-xs text-gray-800 border-2 border-amber-400 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-amber-700">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="font-black text-base text-gray-900">Farmer Account Restricted</h3>
              </div>
              <button
                onClick={() => setFarmerRestrictionModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-950 space-y-2">
              <p className="font-bold">
                ⚠️ Aapka account ek Certified Farmer / Producer account hai!
              </p>
              <p className="text-gray-700 leading-relaxed">
                CropNex policy ke mutabik farmer account se direct retail consumer order nahi kiya ja sakta. Buy sirf registered Buyer account se ho sakta hai.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setFarmerRestrictionModalOpen(false);
                  setIsCartOpen(false);
                  router.push('/seller');
                }}
                className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-center block transition shadow-md"
              >
                Go to Farmer Dashboard &amp; Sell Produce
              </button>
              <button
                onClick={() => setFarmerRestrictionModalOpen(false)}
                className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-center transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL (ADDRESS & PAYMENT) */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 my-8">
            {orderSuccess ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-gray-900">Order Confirmed!</h3>
                <p className="text-xs text-gray-500">
                  Your direct farm procurement order has been logged and the farmer has been notified to harvest and crate your package.
                </p>

                <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Order Number:</span>
                    <span className="font-bold text-emerald-950">{orderSuccess.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Amount:</span>
                    <span className="font-black text-emerald-800">
                      ₹{orderSuccess.totalAmount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment Mode:</span>
                    <span className="font-semibold text-gray-800">{orderSuccess.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Delivery Destination:</span>
                    <span className="font-bold text-gray-900">{orderSuccess.deliveryAddress}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleFinish}
                    className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-md transition"
                  >
                    View &amp; Track Your Order
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePlaceOrder} className="p-6 sm:p-8 space-y-5 text-xs text-gray-800">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Farm Gate Direct Checkout</h3>
                    <p className="text-xs text-gray-500">
                      Logged in as: <strong>{session?.user?.name || formData.fullName}</strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCheckoutModalOpen(false)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Address Section */}
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-700" />
                    <span>1. Delivery Address</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Recipient Name</label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Mobile Number</label>
                      <input
                        type="text"
                        required
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Flat / House / Building Details</label>
                    <input
                      type="text"
                      required
                      value={formData.flatHouse}
                      onChange={(e) => setFormData({ ...formData, flatHouse: e.target.value })}
                      className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Street / Area</label>
                      <input
                        type="text"
                        required
                        value={formData.areaStreet}
                        onChange={(e) => setFormData({ ...formData, areaStreet: e.target.value })}
                        className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Landmark</label>
                      <input
                        type="text"
                        value={formData.landmark}
                        onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                        className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-semibold mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">State</label>
                      <input
                        type="text"
                        required
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Pincode</label>
                      <input
                        type="text"
                        required
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Section */}
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>2. Select Payment Method</span>
                  </h4>

                  <div className="space-y-2">
                    {[
                      'UPI / Direct Bank Transfer',
                      'Cash on Farm Delivery',
                      'Direct Mandi Escrow (Released after Quality Check)',
                      'Net Banking / RTGS',
                    ].map((method) => (
                      <label
                        key={method}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                          formData.paymentMethod === method
                            ? 'border-emerald-600 bg-emerald-50/60 font-bold'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={formData.paymentMethod === method}
                          onChange={() => setFormData({ ...formData, paymentMethod: method })}
                          className="text-emerald-700"
                        />
                        <span>{method}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Total & Action Buttons */}
                <div className="pt-3 border-t border-gray-100 space-y-3">
                  <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center text-sm">
                    <span className="font-bold text-gray-800">Total Payable:</span>
                    <span className="font-black text-emerald-900 text-lg">
                      ₹{grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setCheckoutModalOpen(false)}
                      className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold hover:bg-gray-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-2.5 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold disabled:opacity-50 shadow-md transition"
                    >
                      {submitting ? 'Placing Order...' : 'Confirm Farm Order'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

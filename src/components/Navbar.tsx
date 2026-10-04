'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { useLocation } from '@/context/LocationContext';
import {
  Search,
  ShoppingCart,
  MapPin,
  ChevronDown,
  Menu,
  X,
  User,
  LogOut,
  Package,
  Store,
  Navigation,
  CheckCircle2,
  Home,
  Download,
} from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const { language, setLanguage } = useLanguage();
  const { totalItems, setIsCartOpen } = useCart();
  const {
    buyerLocation,
    setBuyerLocation,
    locationModalOpen,
    setLocationModalOpen,
    requestCurrentLocation,
  } = useLocation();

  // Hide Buyer Navbar completely on /seller or for logged-in farmers
  if (pathname?.startsWith('/seller') || (session?.user as any)?.role === 'farmer') {
    return null;
  }

  const [searchCategory, setSearchCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  // Manual location state in modal
  const [tempCity, setTempCity] = useState(buyerLocation.city);
  const [tempState, setTempState] = useState(buyerLocation.state);
  const [tempPincode, setTempPincode] = useState(buyerLocation.pincode);
  const [gpsLoading, setGpsLoading] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (searchCategory !== 'All') params.append('category', searchCategory);
    router.push(`/?${params.toString()}`);
  };

  const categories = ['All', 'Vegetables', 'Fruits', 'Grains', 'Spices', 'Pulses'];

  const popularStates = [
    { city: 'Mumbai', state: 'Maharashtra', pin: '400001' },
    { city: 'Pune', state: 'Maharashtra', pin: '411001' },
    { city: 'Varanasi', state: 'Uttar Pradesh', pin: '221001' },
    { city: 'Lucknow', state: 'Uttar Pradesh', pin: '226001' },
    { city: 'Ludhiana', state: 'Punjab', pin: '141001' },
    { city: 'Sehore', state: 'Madhya Pradesh', pin: '466001' },
    { city: 'Delhi / NCR', state: 'Delhi', pin: '110001' },
    { city: 'Bengaluru', state: 'Karnataka', pin: '560001' },
  ];

  const handleDetectGPS = async () => {
    setGpsLoading(true);
    await requestCurrentLocation();
    setGpsLoading(false);
  };

  const handleSaveLocation = () => {
    setBuyerLocation({
      city: tempCity || 'Mumbai',
      state: tempState || 'Maharashtra',
      pincode: tempPincode || '400001',
    });
    setLocationModalOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 shadow-md">
      {/* 1. TOP NAV BAR (DEEP FOREST GREEN) */}
      <div className="bg-[#0e2a1b] text-white px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-white/10 transition shrink-0 group"
        >
          <img
            src="/images/cropnex_logo.png"
            alt="CropNex Logo"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover shadow-md border-2 border-[#f59e0b] group-hover:scale-105 transition shrink-0"
          />
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center">
              Crop<span className="text-[#f59e0b]">Nex</span>
              <span className="text-xs text-emerald-300 font-normal ml-0.5">.in</span>
            </span>
            <div className="h-0.5 w-full bg-gradient-to-r from-[#f59e0b] via-emerald-400 to-[#f59e0b] rounded-full -mt-0.5" />
          </div>
        </Link>

        {/* Deliver To Location Selector (Desktop) */}
        <button
          onClick={() => {
            setTempCity(buyerLocation.city);
            setTempState(buyerLocation.state);
            setTempPincode(buyerLocation.pincode);
            setLocationModalOpen(true);
          }}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-left shrink-0 transition"
          title="Click to change your delivery location"
        >
          <MapPin className="w-4 h-4 text-[#f59e0b] shrink-0" />
          <div className="text-[11px] leading-tight">
            <span className="text-emerald-200 block font-normal">
              Deliver to {buyerLocation.city} ({buyerLocation.state})
            </span>
            <span className="font-bold text-white block">
              {buyerLocation.pincode} • Change
            </span>
          </div>
        </button>

        {/* Desktop Central Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden sm:flex flex-1 max-w-2xl items-center h-10 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-[#f59e0b] mx-2 shadow-inner"
        >
          <select
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            className="h-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 font-semibold border-r border-gray-300 focus:outline-none cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Produce' : cat}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search farm fresh produce (Tomato, Onion, Alphonso, Wheat, Rice...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 h-full px-3 text-xs sm:text-sm text-gray-900 focus:outline-none placeholder-gray-400"
          />

          <button
            type="submit"
            className="h-full px-4 sm:px-5 bg-[#f59e0b] hover:bg-[#d97706] text-white flex items-center justify-center transition"
            aria-label="Search"
          >
            <Search className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>

        {/* Right Action Icons: Language, Account, Orders, Cart */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Language Selector */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-xs font-bold text-emerald-100"
            >
              <span>🇮🇳</span>
              <span>{language === 'en' ? 'EN' : language === 'hi' ? 'HI' : 'MR'}</span>
              <ChevronDown className="w-3 h-3 text-emerald-300" />
            </button>

            {langDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-32 bg-white text-gray-900 rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 text-xs font-semibold"
                onClick={() => setLangDropdownOpen(false)}
              >
                <button
                  onClick={() => setLanguage('en')}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-emerald-50 text-gray-800"
                >
                  English (EN)
                </button>
                <button
                  onClick={() => setLanguage('hi')}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-emerald-50 text-gray-800"
                >
                  हिंदी (HI)
                </button>
                <button
                  onClick={() => setLanguage('mr')}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-emerald-50 text-gray-800"
                >
                  मराठी (MR)
                </button>
              </div>
            )}
          </div>

          {/* Account Dropdown */}
          <div className="relative">
            {session?.user ? (
              <div>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-left"
                >
                  <div className="text-[11px] leading-tight">
                    <span className="text-emerald-200 block font-normal">
                      Hello, {session.user.name?.split(' ')[0]}
                    </span>
                    <span className="font-bold text-white flex items-center gap-0.5">
                      Account &amp; Lists <ChevronDown className="w-3 h-3 text-emerald-300" />
                    </span>
                  </div>
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white text-gray-900 rounded-2xl shadow-xl border border-gray-100 py-2 z-50 text-xs"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-bold text-gray-900 truncate">{session.user.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{session.user.email}</p>
                    </div>

                    <Link
                      href="/orders"
                      className="flex items-center gap-2 px-4 py-2.5 hover:bg-emerald-50 text-gray-800"
                    >
                      <Package className="w-3.5 h-3.5 text-emerald-600" />
                      Your Orders
                    </Link>

                    <Link
                      href="/seller"
                      className="flex items-center gap-2 px-4 py-2.5 hover:bg-emerald-50 text-gray-800"
                    >
                      <Store className="w-3.5 h-3.5 text-emerald-600" />
                      Seller Central
                    </Link>

                    <button
                      onClick={() => signOut()}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 font-bold border-t border-gray-100 mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-left"
              >
                <div className="text-[11px] leading-tight">
                  <span className="text-emerald-200 block font-normal">Hello, sign in</span>
                  <span className="font-bold text-white flex items-center gap-0.5">
                    Account <ChevronDown className="w-3 h-3 text-emerald-300" />
                  </span>
                </div>
              </Link>
            )}
          </div>

          {/* Returns & Orders Link */}
          <Link
            href="/orders"
            className="hidden sm:flex items-center px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-left"
          >
            <div className="text-[11px] leading-tight">
              <span className="text-emerald-200 block font-normal">Returns</span>
              <span className="font-bold text-white block">&amp; Orders</span>
            </div>
          </Link>

          {/* Cart Trigger Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition"
            aria-label="Shopping Cart"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-white" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#f59e0b] text-slate-900 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </div>
            <span className="font-bold text-white text-xs sm:text-sm hidden sm:block">
              Cart
            </span>
          </button>
        </div>
      </div>

      {/* MOBILE FULL-WIDTH SEARCH BAR (PHONE ONLY) */}
      <div className="sm:hidden bg-[#0e2a1b] px-3 pb-2.5 pt-0.5">
        <form
          onSubmit={handleSearchSubmit}
          className="w-full flex items-center h-10 rounded-xl overflow-hidden bg-white shadow-md focus-within:ring-2 focus-within:ring-[#f59e0b]"
        >
          <input
            type="text"
            placeholder="Search vegetables, fruits, grains..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 h-full px-3 text-xs text-gray-900 focus:outline-none placeholder-gray-400"
          />
          <button
            type="submit"
            className="h-full px-4 bg-[#f59e0b] hover:bg-[#d97706] text-white flex items-center justify-center transition"
            aria-label="Search"
          >
            <Search className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
      </div>

      {/* 2. SUB-NAVBAR CATEGORY STRIP (MID FOREST GREEN) */}
      <div className="bg-[#1b432c] text-white px-3 sm:px-6 py-2 flex items-center justify-between text-xs sm:text-[13px] font-medium overflow-x-auto whitespace-nowrap scrollbar-none border-t border-emerald-800/40 w-full max-w-full">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/"
            className="flex items-center gap-1 py-1 px-2.5 rounded-md hover:bg-white/10 font-bold"
          >
            <Menu className="w-4 h-4" />
            <span>All Produce</span>
          </Link>

          <Link
            href="/?category=Vegetables"
            className="py-1 px-2.5 rounded-md hover:bg-white/10"
          >
            Fresh Vegetables
          </Link>

          <Link
            href="/?category=Fruits"
            className="py-1 px-2.5 rounded-md hover:bg-white/10"
          >
            Daily Fruits
          </Link>

          <Link
            href="/?category=Grains"
            className="py-1 px-2.5 rounded-md hover:bg-white/10"
          >
            Grains &amp; Flour
          </Link>

          <Link
            href="/?category=Spices"
            className="py-1 px-2.5 rounded-md hover:bg-white/10"
          >
            Spices &amp; Masalas
          </Link>

          <Link
            href="/?category=Pulses"
            className="py-1 px-2.5 rounded-md hover:bg-white/10"
          >
            Dals &amp; Pulses
          </Link>

          <Link
            href="/?organic=true"
            className="py-1 px-2.5 rounded-md hover:bg-white/10 text-emerald-300 font-bold"
          >
            🌿 Certified Organic Store
          </Link>
        </div>

        {/* Sell on CropNex Button */}
        <div className="pl-4 shrink-0">
          <Link
            href="/seller"
            className="py-1 px-3 rounded-md bg-[#f59e0b] hover:bg-[#d97706] font-bold text-slate-900 flex items-center gap-1 text-xs shadow-sm transition"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Sell on CropNex</span>
          </Link>
        </div>
      </div>

      {/* LOCATION PERMISSION & PINCODE MODAL */}
      {locationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden text-gray-900 p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
                  <MapPin className="w-4 h-4" />
                  <span>Buyer Delivery Location</span>
                </div>
                <h3 className="font-black text-xl text-gray-900 mt-1">
                  Where should we deliver your produce?
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Produce transit time and farm origin are calculated accurately based on your state and city.
                </p>
              </div>
              <button
                onClick={() => setLocationModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Auto GPS Detect Button */}
            <button
              onClick={handleDetectGPS}
              disabled={gpsLoading}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-bold text-xs flex items-center justify-center gap-2.5 transition shadow-sm"
            >
              <Navigation className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>
                {gpsLoading ? 'Detecting your location...' : 'Use Current Location (GPS Auto-Detect)'}
              </span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-gray-200 w-full" />
              <span className="bg-white px-2 text-[11px] text-gray-400 font-semibold uppercase">
                Or Select Your Region Manually
              </span>
              <div className="border-t border-gray-200 w-full" />
            </div>

            {/* Manual Form */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">State</label>
                  <select
                    value={tempState}
                    onChange={(e) => {
                      setTempState(e.target.value);
                      if (e.target.value === 'Maharashtra') setTempCity('Mumbai');
                      else if (e.target.value === 'Uttar Pradesh') setTempCity('Varanasi');
                      else if (e.target.value === 'Punjab') setTempCity('Ludhiana');
                      else if (e.target.value === 'Madhya Pradesh') setTempCity('Sehore');
                      else if (e.target.value === 'Delhi') setTempCity('Delhi / NCR');
                      else if (e.target.value === 'Karnataka') setTempCity('Bengaluru');
                      else setTempCity('Regional Hub');
                    }}
                    className="w-full p-2.5 border border-gray-300 rounded-xl bg-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Rajasthan">Rajasthan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">City / District</label>
                  <input
                    type="text"
                    value={tempCity}
                    onChange={(e) => setTempCity(e.target.value)}
                    placeholder="e.g. Mumbai, Pune, Lucknow"
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Delivery Pincode</label>
                <input
                  type="text"
                  maxLength={6}
                  value={tempPincode}
                  onChange={(e) => setTempPincode(e.target.value)}
                  placeholder="e.g. 400001"
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-gray-500 block mb-1.5">
                  Popular Delivery Locations:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {popularStates.map((item) => (
                    <button
                      key={item.city}
                      onClick={() => {
                        setTempCity(item.city);
                        setTempState(item.state);
                        setTempPincode(item.pin);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                        tempCity === item.city
                          ? 'bg-emerald-700 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {item.city} ({item.state})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setLocationModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 font-bold hover:bg-gray-50 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLocation}
                className="flex-1 py-2.5 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold text-xs shadow-md transition"
              >
                Apply Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MOBILE BOTTOM APP BAR (PHONE OPTIMIZED) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0e2a1b]/95 backdrop-blur-md text-white border-t border-emerald-800/80 py-1.5 px-2 flex items-center justify-around shadow-2xl">
        <Link
          href="/"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold py-1 px-2 rounded-xl transition ${
            pathname === '/' ? 'text-[#f59e0b] bg-white/10' : 'text-emerald-100 hover:text-[#f59e0b]'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </Link>

        <Link
          href="/?category=Vegetables"
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold py-1 px-2 rounded-xl text-emerald-100 hover:text-[#f59e0b] transition"
        >
          <span className="text-base leading-none">🥬</span>
          <span>Veggies</span>
        </Link>

        <Link
          href="/?category=Fruits"
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold py-1 px-2 rounded-xl text-emerald-100 hover:text-[#f59e0b] transition"
        >
          <span className="text-base leading-none">🍎</span>
          <span>Fruits</span>
        </Link>

        <Link
          href="/seller"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold py-1 px-2 rounded-xl transition ${
            pathname?.startsWith('/seller') ? 'text-[#f59e0b] bg-white/10' : 'text-[#f59e0b] hover:text-amber-300'
          }`}
        >
          <Store className="w-5 h-5" />
          <span>Sell</span>
        </Link>

        <Link
          href="/orders"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold py-1 px-2 rounded-xl transition ${
            pathname?.startsWith('/orders') ? 'text-[#f59e0b] bg-white/10' : 'text-emerald-100 hover:text-[#f59e0b]'
          }`}
        >
          <Package className="w-5 h-5" />
          <span>Orders</span>
        </Link>

        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold py-1 px-2 rounded-xl text-emerald-100 hover:text-[#f59e0b] transition relative"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#f59e0b] text-slate-900 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow">
                {totalItems}
              </span>
            )}
          </div>
          <span>Cart</span>
        </button>
      </nav>
    </header>
  );
}

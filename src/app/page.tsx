'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Star,
  Check,
  ShieldCheck,
  Clock,
  MapPin,
  ChevronRight,
  Filter,
  X,
  Plus,
  Minus,
  ShoppingCart,
  Sparkles,
  Truck,
  Compass,
  Barcode,
  Award,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Download,
  QrCode,
  ExternalLink,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLocation } from '@/context/LocationContext';
import { INITIAL_PRODUCTS, ProductItem } from '@/lib/initialData';

function AgritechMarketplaceHomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { addToCart, setBuyNowItem, setIsCartOpen } = useCart();
  const { buyerLocation, setLocationModalOpen, getTransitEstimate } = useLocation();

  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || 'All'
  );
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [organicOnly, setOrganicOnly] = useState<boolean>(
    searchParams.get('organic') === 'true'
  );
  const [priceRange, setPriceRange] = useState<string>('All');
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [nearestOnly, setNearestOnly] = useState<boolean>(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Quick View Product Modal
  const [quickProduct, setQuickProduct] = useState<ProductItem | null>(null);
  const [quickQty, setQuickQty] = useState<number>(1);

  // Lab Certificate View Modal
  const [viewCertificateProduct, setViewCertificateProduct] = useState<ProductItem | null>(null);

  // Dedicated Anti-Fraud Produce Barcode Modal
  const [viewBarcodeProduct, setViewBarcodeProduct] = useState<ProductItem | null>(null);

  // Toast feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Banner slide index
  const [currentSlide, setCurrentSlide] = useState(0);

  const banners = [
    {
      title: 'Direct Farm-to-Home Fresh Harvests',
      subtitle: 'Verified Government Kisan IDs • Anti-Fraud Batch Barcodes • Certified Lab Testing',
      tag: '100% FARM-GATE AUTHENTIC',
      bg: 'from-[#0e2a1b] via-[#153825] to-[#1e4a32]',
      btnText: 'Shop Fresh Vegetables',
      category: 'Vegetables',
    },
    {
      title: 'Certified Organic Rural Orchards',
      subtitle: 'Single-origin Ratnagiri Mangoes, Salem Turmeric & Sehore Grains with complete harvest traceability',
      tag: 'NABL & NPOP LAB TESTED',
      bg: 'from-[#1e3a2b] via-[#12281d] to-[#0a1811]',
      btnText: 'Explore Organic Store',
      category: 'Fruits',
    },
    {
      title: 'Direct Whole Grains & Pulse Mills',
      subtitle: 'Aged Punjab 1121 Basmati & MP Sharbati Wheat shipped straight from agricultural mills',
      tag: 'DIRECT PRODUCER LINKAGE',
      bg: 'from-[#1b3d2b] via-[#10291c] to-[#0e2417]',
      btnText: 'Shop Grains & Dals',
      category: 'Grains',
    },
  ];

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setOrganicOnly(false);
    showToast(`Showing ${cat === 'All' ? 'All Farm Produce' : cat}`);
    setTimeout(() => {
      const el = document.getElementById('marketplace-products');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  useEffect(() => {
    const cat = searchParams.get('category');
    setSelectedCategory(cat || 'All');
    const org = searchParams.get('organic');
    setOrganicOnly(org === 'true');
    if (cat || org) {
      setTimeout(() => {
        const el = document.getElementById('marketplace-products');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    }
  }, [searchParams]);

  // Farmer cannot access the buyer store. Auto redirect to dedicated /seller portal
  useEffect(() => {
    if ((session?.user as any)?.role === 'farmer') {
      router.replace('/seller');
    }
  }, [session, router]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [farmerRestrictionModalOpen, setFarmerRestrictionModalOpen] = useState(false);

  const handleAddToCart = (product: ProductItem, qty: number = 1) => {
    if ((session?.user as any)?.role === 'farmer') {
      setFarmerRestrictionModalOpen(true);
      return;
    }
    addToCart(product, qty);
    showToast(`Added ${qty} ${product.unit} of ${product.name} to your cart!`);
  };

  const handleBuyNow = (product: ProductItem, qty: number = 1) => {
    if ((session?.user as any)?.role === 'farmer') {
      setFarmerRestrictionModalOpen(true);
      return;
    }
    // Do not save to general cart! Set dedicated buyNowItem
    setBuyNowItem({ product, quantity: qty });

    // If buyer is not logged in, redirect directly to /auth/signin?callbackUrl=/checkout
    if (!session?.user) {
      router.push('/auth/signin?callbackUrl=/checkout');
      return;
    }

    // If buyer is logged in, proceed directly to checkout
    router.push('/checkout');
  };

  const handleOpenQuickView = (product: ProductItem) => {
    setQuickProduct(product);
    setQuickQty(product.minOrderQuantity || 1);
  };

  // Filter products based on location and criteria
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'All' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    if (selectedState !== 'All' && p.state.toLowerCase() !== selectedState.toLowerCase()) {
      return false;
    }
    if (selectedDistrict !== 'All' && p.district.toLowerCase() !== selectedDistrict.toLowerCase()) {
      return false;
    }
    if (organicOnly && !p.organic) {
      return false;
    }
    if (minRating > 0 && p.rating < minRating) {
      return false;
    }
    if (nearestOnly) {
      if (p.state.toLowerCase() !== buyerLocation.state.toLowerCase()) {
        return false;
      }
    }
    if (priceRange === 'under-50' && p.pricePerKg >= 50) return false;
    if (priceRange === '50-100' && (p.pricePerKg < 50 || p.pricePerKg > 100)) return false;
    if (priceRange === '100-200' && (p.pricePerKg < 100 || p.pricePerKg > 200)) return false;
    if (priceRange === 'above-200' && p.pricePerKg <= 200) return false;

    const query = searchParams.get('search')?.toLowerCase();
    if (query) {
      const match =
        p.name.toLowerCase().includes(query) ||
        p.hindiName?.toLowerCase().includes(query) ||
        p.farmLocation.toLowerCase().includes(query) ||
        p.district.toLowerCase().includes(query) ||
        p.state.toLowerCase().includes(query) ||
        p.barcode.toLowerCase().includes(query);
      if (!match) return false;
    }

    return true;
  });

  if (sortBy === 'price-low') {
    filteredProducts.sort((a, b) => a.pricePerKg - b.pricePerKg);
  } else if (sortBy === 'price-high') {
    filteredProducts.sort((a, b) => b.pricePerKg - a.pricePerKg);
  } else if (sortBy === 'rating') {
    filteredProducts.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'nearest') {
    filteredProducts.sort((a, b) => {
      const aSame = a.state.toLowerCase() === buyerLocation.state.toLowerCase() ? -1 : 1;
      const bSame = b.state.toLowerCase() === buyerLocation.state.toLowerCase() ? -1 : 1;
      return aSame - bSame;
    });
  }

  return (
    <div className="space-y-6 pb-20 text-gray-900 bg-[#f8faf9] min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0e2a1b] text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="w-4 h-4 text-[#f59e0b]" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* 1. BUYER LOCATION & TRANSIT NOTIFICATION BAR */}
      <div className="bg-[#eef5f0] border-b border-emerald-200/80 px-3 sm:px-6 py-2 text-xs overflow-hidden w-full max-w-full">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1.5 text-emerald-950 flex-wrap">
            <Compass className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="leading-tight">
              Location: <strong>{buyerLocation.city}, {buyerLocation.state} ({buyerLocation.pincode})</strong>
            </span>
            <button
              onClick={() => setLocationModalOpen(true)}
              className="text-[#d97706] hover:underline font-bold"
            >
              • Change
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-semibold truncate">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="truncate">Anti-Fraud Barcodes &amp; Verified Kisan IDs Active</span>
          </div>
        </div>
      </div>

      {/* 2. HERO PROMO BANNER CAROUSEL */}
      <div className="relative h-60 sm:h-80 md:h-96 w-full overflow-hidden bg-[#0e2a1b]">
        <div
          className={`absolute inset-0 bg-gradient-to-r ${banners[currentSlide].bg} transition-all duration-700 flex items-center`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-10 lg:px-12 w-full grid grid-cols-1 md:grid-cols-12 items-center gap-4 sm:gap-6">
            <div className="md:col-span-8 text-white space-y-2 sm:space-y-4">
              <span className="inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-900/80 text-[9px] sm:text-[10px] font-black tracking-widest uppercase border border-emerald-500/30 text-emerald-300">
                {banners[currentSlide].tag}
              </span>
              <h1 className="text-xl sm:text-3xl md:text-5xl font-black tracking-tight leading-tight">
                {banners[currentSlide].title}
              </h1>
              <p className="text-[11px] sm:text-sm text-emerald-100 max-w-xl leading-relaxed line-clamp-2 sm:line-clamp-none">
                {banners[currentSlide].subtitle}
              </p>
              <div className="pt-1 sm:pt-2">
                <button
                  onClick={() => {
                    setSelectedCategory(banners[currentSlide].category);
                    showToast(`Filtering for ${banners[currentSlide].category}`);
                  }}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold text-xs sm:text-sm rounded-full shadow-lg shadow-amber-900/30 transition transform hover:-translate-y-0.5"
                >
                  {banners[currentSlide].btnText}
                </button>
              </div>
            </div>

            <div className="hidden md:flex md:col-span-4 justify-end items-center">
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/20 text-white text-xs space-y-3 max-w-xs shadow-2xl flex flex-col items-center text-center">
                <img
                  src="/images/cropnex_logo.png"
                  alt="CropNex Certified"
                  className="w-20 h-20 rounded-full object-cover shadow-xl border-2 border-[#f59e0b]"
                />
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-[#f59e0b] font-bold text-xs">
                    <FileCheck className="w-4 h-4" />
                    <span>Direct Kisan Linkage</span>
                  </div>
                  <p className="text-emerald-100 text-[11px] leading-relaxed">
                    • Certified Kisan ID Verified Farmers<br />
                    • Unique Anti-Fraud QR &amp; Barcodes<br />
                    • 100% Fair Price Direct Farm-to-Consumer
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel indicators */}
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 sm:h-2 rounded-full transition-all ${
                currentSlide === idx ? 'w-6 sm:w-8 bg-[#f59e0b]' : 'w-1.5 sm:w-2 bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 3. POPULAR QUICK-CATEGORY CARDS */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 -mt-6 sm:-mt-16 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
          <div
            onClick={() => handleCategorySelect('Vegetables')}
            className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-md border cursor-pointer hover:shadow-xl transition group ${
              selectedCategory.toLowerCase() === 'vegetables' && !organicOnly
                ? 'bg-emerald-50 border-2 border-emerald-600 ring-2 ring-emerald-300'
                : 'bg-white border-gray-200 hover:border-emerald-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-emerald-700">
                Fresh Vegetables
              </h3>
              {selectedCategory.toLowerCase() === 'vegetables' && !organicOnly && (
                <span className="text-[9px] sm:text-[10px] bg-emerald-700 text-white px-1.5 sm:px-2 py-0.5 rounded-full font-bold">
                  Active
                </span>
              )}
            </div>
            <div className="mt-1.5 sm:mt-2 h-20 sm:h-28 rounded-lg sm:rounded-xl overflow-hidden bg-gray-100">
              <img
                src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80"
                alt="Vegetables"
                className="w-full h-full object-cover group-hover:scale-105 transition"
              />
            </div>
            <p className="text-[10px] sm:text-[11px] text-emerald-700 font-bold mt-1.5 truncate">
              Tomatoes, Onions, Palak →
            </p>
          </div>

          <div
            onClick={() => handleCategorySelect('Fruits')}
            className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-md border cursor-pointer hover:shadow-xl transition group ${
              selectedCategory.toLowerCase() === 'fruits' && !organicOnly
                ? 'bg-amber-50 border-2 border-amber-600 ring-2 ring-amber-300'
                : 'bg-white border-gray-200 hover:border-amber-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-amber-800">
                Daily Fruits
              </h3>
              {selectedCategory.toLowerCase() === 'fruits' && !organicOnly && (
                <span className="text-[9px] sm:text-[10px] bg-amber-700 text-white px-1.5 sm:px-2 py-0.5 rounded-full font-bold">
                  Active
                </span>
              )}
            </div>
            <div className="mt-1.5 sm:mt-2 h-20 sm:h-28 rounded-lg sm:rounded-xl overflow-hidden bg-gray-100">
              <img
                src="https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=400&q=80"
                alt="Fruits"
                className="w-full h-full object-cover group-hover:scale-105 transition"
              />
            </div>
            <p className="text-[10px] sm:text-[11px] text-emerald-700 font-bold mt-1.5 truncate">
              Alphonso, Anaar, Apples →
            </p>
          </div>

          <div
            onClick={() => handleCategorySelect('Grains')}
            className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-md border cursor-pointer hover:shadow-xl transition group ${
              selectedCategory.toLowerCase() === 'grains' && !organicOnly
                ? 'bg-amber-50 border-2 border-amber-600 ring-2 ring-amber-300'
                : 'bg-white border-gray-200 hover:border-emerald-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-emerald-700">
                Grains &amp; Pulses
              </h3>
              {selectedCategory.toLowerCase() === 'grains' && !organicOnly && (
                <span className="text-[9px] sm:text-[10px] bg-amber-700 text-white px-1.5 sm:px-2 py-0.5 rounded-full font-bold">
                  Active
                </span>
              )}
            </div>
            <div className="mt-1.5 sm:mt-2 h-20 sm:h-28 rounded-lg sm:rounded-xl overflow-hidden bg-gray-100">
              <img
                src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80"
                alt="Grains"
                className="w-full h-full object-cover group-hover:scale-105 transition"
              />
            </div>
            <p className="text-[10px] sm:text-[11px] text-emerald-700 font-bold mt-1.5 truncate">
              Sharbati Gehun, Basmati →
            </p>
          </div>

          <div
            onClick={() => {
              setOrganicOnly(!organicOnly);
              showToast(organicOnly ? 'Showing All Produce' : 'Showing 100% Certified Organic Only');
              setTimeout(() => {
                const el = document.getElementById('marketplace-products');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 50);
            }}
            className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-md border cursor-pointer hover:shadow-xl transition group ${
              organicOnly ? 'bg-emerald-50 border-2 border-emerald-600 ring-2 ring-emerald-300' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-emerald-700">
                Organic Store
              </h3>
              {organicOnly && (
                <span className="text-[9px] sm:text-[10px] bg-emerald-600 text-white px-1.5 sm:px-2 py-0.5 rounded-full font-bold">
                  Active
                </span>
              )}
            </div>
            <div className="mt-1.5 sm:mt-2 h-20 sm:h-28 rounded-lg sm:rounded-xl overflow-hidden bg-gray-100">
              <img
                src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80"
                alt="Organic"
                className="w-full h-full object-cover group-hover:scale-105 transition"
              />
            </div>
            <p className="text-[10px] sm:text-[11px] text-emerald-700 font-bold mt-1.5 truncate">
              Zero Chemical • NPOP →
            </p>
          </div>
        </div>
      </div>

      {/* 4. MAIN PRODUCT MARKETPLACE (SIDEBAR FILTERS + PRODUCTS GRID) */}
      <div id="marketplace-products" className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 scroll-mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT SIDEBAR FILTERS (DESKTOP ONLY - STICKY SCROLL) */}
          <aside className="hidden lg:block lg:col-span-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-6 text-xs sticky top-24 self-start max-h-[calc(100vh-110px)] overflow-y-auto scrollbar-thin z-20">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-black text-sm text-gray-900 flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-emerald-700" />
                <span>Filters</span>
              </h3>
              {(selectedCategory !== 'All' || selectedState !== 'All' || selectedDistrict !== 'All' || organicOnly || minRating > 0 || priceRange !== 'All' || nearestOnly) && (
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedState('All');
                    setSelectedDistrict('All');
                    setOrganicOnly(false);
                    setPriceRange('All');
                    setMinRating(0);
                    setNearestOnly(false);
                    showToast('All filters cleared');
                  }}
                  className="text-emerald-700 hover:underline text-[11px] font-bold"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Farm Distance / Origin Filter */}
            <div className="space-y-2">
              <h4 className="font-bold text-gray-900">Farm Proximity</h4>
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-emerald-900">
                <input
                  type="checkbox"
                  checked={nearestOnly}
                  onChange={(e) => {
                    setNearestOnly(e.target.checked);
                    showToast(e.target.checked ? `Showing farms within ${buyerLocation.state}` : 'Showing all farms');
                  }}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>📍 Only Farms in {buyerLocation.state} (Faster Transit)</span>
              </label>
            </div>

            {/* Produce Category */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <h4 className="font-bold text-gray-900">Category</h4>
              <div className="space-y-1">
                {['All', 'Vegetables', 'Fruits', 'Grains', 'Spices', 'Pulses'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className={`block w-full text-left py-1.5 px-2 rounded-lg transition ${
                      selectedCategory.toLowerCase() === cat.toLowerCase() && !organicOnly
                        ? 'font-bold text-white bg-emerald-800'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {cat === 'All' ? 'All Produce' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Farm State Selection */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <h4 className="font-bold text-gray-900">Farm State Origin</h4>
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  showToast(`Selected State: ${e.target.value}`);
                }}
                className="w-full p-2 border border-gray-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="All">All Indian States</option>
                <option value="Maharashtra">Maharashtra (Nashik, Pune, Solapur)</option>
                <option value="Uttar Pradesh">Uttar Pradesh (Varanasi Aloo)</option>
                <option value="Madhya Pradesh">Madhya Pradesh (Sehore Wheat)</option>
                <option value="Punjab">Punjab (Ludhiana Basmati)</option>
                <option value="Jammu and Kashmir">Jammu &amp; Kashmir (Shopian Apples)</option>
                <option value="Tamil Nadu">Tamil Nadu (Ooty Mountain Carrots)</option>
              </select>
            </div>

            {/* Price Filter */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <h4 className="font-bold text-gray-900">Price (per kg)</h4>
              <div className="space-y-1">
                {[
                  { id: 'All', label: 'All Prices' },
                  { id: 'under-50', label: 'Under ₹50' },
                  { id: '50-100', label: '₹50 to ₹100' },
                  { id: '100-200', label: '₹100 to ₹200' },
                  { id: 'above-200', label: 'Over ₹200' },
                ].map((item) => (
                  <label key={item.id} className="flex items-center gap-2 cursor-pointer py-0.5">
                    <input
                      type="radio"
                      name="price"
                      checked={priceRange === item.id}
                      onChange={() => {
                        setPriceRange(item.id);
                        showToast(`Filtered price: ${item.label}`);
                      }}
                      className="text-emerald-700"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* RIGHT MAIN PRODUCTS GRID */}
          <main className="lg:col-span-9 space-y-4">
            {/* Horizontal Quick Category Switcher Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
              {[
                { id: 'All', label: 'All Produce', count: products.length, icon: '🌾' },
                { id: 'Vegetables', label: 'Fresh Vegetables', count: products.filter(p => p.category === 'Vegetables').length, icon: '🥬' },
                { id: 'Fruits', label: 'Daily Fruits', count: products.filter(p => p.category === 'Fruits').length, icon: '🍎' },
                { id: 'Grains', label: 'Grains & Rice', count: products.filter(p => p.category === 'Grains').length, icon: '🌾' },
                { id: 'Spices', label: 'Spices', count: products.filter(p => p.category === 'Spices').length, icon: '🌶️' },
                { id: 'Pulses', label: 'Dals & Pulses', count: products.filter(p => p.category === 'Pulses').length, icon: '🥣' },
              ].map((tab) => {
                const isActive = selectedCategory.toLowerCase() === tab.id.toLowerCase() && !organicOnly;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleCategorySelect(tab.id)}
                    className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
                      isActive
                        ? 'bg-emerald-900 text-white shadow-md ring-2 ring-emerald-500'
                        : 'bg-white text-gray-700 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-emerald-800 text-emerald-200' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
              <button
                onClick={() => {
                  setOrganicOnly(!organicOnly);
                  showToast(organicOnly ? 'Showing all produce' : 'Filtering 100% Certified Organic');
                }}
                className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
                  organicOnly
                    ? 'bg-emerald-700 text-white shadow-md ring-2 ring-emerald-400'
                    : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-300'
                }`}
              >
                <span>🌿</span>
                <span>Certified Organic</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  organicOnly ? 'bg-emerald-800 text-white' : 'bg-emerald-200/70 text-emerald-900'
                }`}>
                  {products.filter(p => p.organic).length}
                </span>
              </button>
            </div>

            {/* Dynamic Category Showcase Banners */}
            {selectedCategory.toLowerCase() === 'vegetables' && !organicOnly && (
              <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-[#123820] text-white p-4 sm:p-5 rounded-2xl shadow-md flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Direct Farm Category
                  </span>
                  <h2 className="text-lg sm:text-xl font-black flex items-center gap-2">
                    <span>🥬 Fresh Farm Vegetables (ताज़ी सब्ज़ियाँ)</span>
                  </h2>
                  <p className="text-xs text-emerald-100/90 leading-tight">
                    Directly harvested from Nashik, Pune, Ooty &amp; Varanasi Mandi Belts • Plump Tomatoes, Crisp Onions, Potatoes, Palak &amp; Polyhouse Capsicum
                  </p>
                </div>
                <button
                  onClick={() => handleCategorySelect('All')}
                  className="text-xs bg-white text-emerald-950 hover:bg-emerald-100 px-3.5 py-1.5 rounded-xl font-bold transition shrink-0 shadow-sm"
                >
                  View All Produce &rarr;
                </button>
              </div>
            )}

            {selectedCategory.toLowerCase() === 'fruits' && !organicOnly && (
              <div className="bg-gradient-to-r from-amber-800 via-orange-800 to-amber-950 text-white p-4 sm:p-5 rounded-2xl shadow-md flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-200 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/30">
                    Direct Farm Category
                  </span>
                  <h2 className="text-lg sm:text-xl font-black flex items-center gap-2">
                    <span>🍎 Daily Fresh Fruits &amp; Orchards (ताज़े फल)</span>
                  </h2>
                  <p className="text-xs text-amber-100/90 leading-tight">
                    Original GI Ratnagiri Devgad Alphonso, Solapur Bhagwa Anaar, Nagpur Santra &amp; Shopian Himalayan Apples
                  </p>
                </div>
                <button
                  onClick={() => handleCategorySelect('All')}
                  className="text-xs bg-white text-amber-950 hover:bg-amber-100 px-3.5 py-1.5 rounded-xl font-bold transition shrink-0 shadow-sm"
                >
                  View All Produce &rarr;
                </button>
              </div>
            )}

            {selectedCategory.toLowerCase() === 'grains' && !organicOnly && (
              <div className="bg-gradient-to-r from-yellow-900 via-amber-900 to-amber-950 text-white p-4 sm:p-5 rounded-2xl shadow-md flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-200 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/30">
                    Direct Farm Category
                  </span>
                  <h2 className="text-lg sm:text-xl font-black flex items-center gap-2">
                    <span>🌾 Grains, Staples &amp; Flour (अनाज और आटा)</span>
                  </h2>
                  <p className="text-xs text-amber-100/90 leading-tight">
                    Direct from Sehore &amp; Khanna grain mills • MP Sharbati Gehun &amp; Punjab 1121 Aged Royal Basmati Rice
                  </p>
                </div>
                <button
                  onClick={() => handleCategorySelect('All')}
                  className="text-xs bg-white text-amber-950 hover:bg-amber-100 px-3.5 py-1.5 rounded-xl font-bold transition shrink-0 shadow-sm"
                >
                  View All Produce &rarr;
                </button>
              </div>
            )}

            {organicOnly && (
              <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-950 text-white p-4 sm:p-5 rounded-2xl shadow-md flex items-center justify-between gap-4 border border-emerald-500/40">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 bg-emerald-900/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    100% Certified Organic Store
                  </span>
                  <h2 className="text-lg sm:text-xl font-black flex items-center gap-2">
                    <span>🌿 Certified Organic Farm Batches (NPOP Lab Tested)</span>
                  </h2>
                  <p className="text-xs text-emerald-100/90 leading-tight">
                    Zero chemical pesticide residue guaranteed. Every batch accompanied by official NPOP Scope Certificate.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setOrganicOnly(false);
                    setSelectedCategory('All');
                  }}
                  className="text-xs bg-white text-emerald-950 hover:bg-emerald-100 px-3.5 py-1.5 rounded-xl font-bold transition shrink-0 shadow-sm"
                >
                  Show All Produce &rarr;
                </button>
              </div>
            )}

            {/* Results & Sort Bar */}
            <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-600">
                  Showing <strong>{filteredProducts.length}</strong>{' '}
                  <strong className="text-emerald-950">
                    {organicOnly ? 'Certified Organic' : selectedCategory === 'All' ? 'items' : selectedCategory}
                  </strong>{' '}
                  for <strong className="text-emerald-900">{buyerLocation.city}</strong>
                </span>

                {/* Mobile Filter Sheet Trigger Button */}
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold rounded-xl text-xs shrink-0 transition"
                >
                  <Filter className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Filters</span>
                  {(selectedCategory !== 'All' || selectedState !== 'All' || organicOnly || priceRange !== 'All' || nearestOnly) && (
                    <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                  )}
                </button>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                <span className="text-gray-500 font-semibold text-[11px] sm:text-xs">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="p-1.5 sm:p-2 border border-gray-300 rounded-lg bg-gray-50 text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="featured">Featured Freshness</option>
                  <option value="nearest">Nearest Farm Origin First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Customer Reviews</option>
                </select>
              </div>
            </div>

            {/* Produce Grid (2 COLUMNS ON MOBILE, 3 ON TABLET/DESKTOP) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2.5 sm:gap-4 md:gap-5">
              {filteredProducts.map((product) => {
                const transit = getTransitEstimate(product.district, product.state);

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 hover:border-emerald-500 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden group p-2.5 sm:p-4 space-y-2 sm:space-y-3"
                  >
                    {/* Top Badges */}
                    <div className="flex items-center justify-between min-h-[20px] sm:min-h-[22px] gap-1">
                      <span className="px-1.5 sm:px-2 py-0.5 bg-emerald-100 text-emerald-900 font-bold text-[9px] sm:text-[10px] rounded-md flex items-center gap-1 shrink-0">
                        <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-700" />
                        <span>{product.grade}</span>
                      </span>

                      {product.organic && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewCertificateProduct(product);
                          }}
                          className="px-1.5 sm:px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[8.5px] sm:text-[10px] font-bold rounded-md border border-emerald-300 hover:bg-emerald-100 transition flex items-center gap-1 truncate"
                        >
                          <FileCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-700 shrink-0" />
                          <span className="truncate">Organic</span>
                        </button>
                      )}
                    </div>

                    {/* Image */}
                    <div
                      onClick={() => handleOpenQuickView(product)}
                      className="relative h-32 sm:h-44 w-full bg-gray-50 rounded-lg sm:rounded-xl overflow-hidden cursor-pointer"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>

                    {/* Product Body */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <h3
                        onClick={() => handleOpenQuickView(product)}
                        className="text-xs sm:text-sm font-bold text-gray-900 hover:text-emerald-700 cursor-pointer line-clamp-2 leading-tight min-h-[32px] sm:min-h-[38px]"
                      >
                        {product.name}
                      </h3>

                      {/* Anti-Fraud Unique Barcode Tag */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewBarcodeProduct(product);
                        }}
                        className="w-full flex items-center justify-between text-[8.5px] sm:text-[10px] font-mono text-gray-700 bg-emerald-50/60 hover:bg-emerald-100 hover:text-emerald-950 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border border-emerald-200/90 transition-all cursor-pointer group/barcode text-left shadow-2xs"
                        title="Click to view full scannable produce barcode"
                      >
                        <span className="flex items-center gap-1 sm:gap-1.5 font-bold text-gray-800 group-hover/barcode:text-emerald-950 truncate">
                          <Barcode className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-800 shrink-0" />
                          <span className="underline decoration-dotted underline-offset-2 truncate">{product.barcode}</span>
                        </span>
                        <span className="text-emerald-800 font-bold text-[8px] sm:text-[9.5px] bg-white px-1 sm:px-1.5 py-0.5 rounded border border-emerald-200 shrink-0 hidden xs:inline">
                          Kisan: {product.kisanId.slice(-6)}
                        </span>
                      </button>

                      {/* Price Block */}
                      <div>
                        <div className="flex items-baseline gap-1.5 sm:gap-2">
                          <span className="text-red-600 font-bold text-[10px] sm:text-xs">
                            -{product.discountPercent}%
                          </span>
                          <span className="text-base sm:text-xl font-black text-gray-900 leading-none">
                            ₹{product.pricePerKg}
                          </span>
                          <span className="text-[10px] sm:text-xs text-gray-500">/ {product.unit}</span>
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-gray-400">
                          M.R.P.: <span className="line-through">₹{product.mrp}</span>
                        </div>
                      </div>

                      {/* Dynamic Realistic Delivery Transit Box */}
                      <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-0.5 sm:space-y-1 text-[10px] sm:text-[11px]">
                        <div className="flex items-center gap-1 text-emerald-900 font-bold">
                          <Truck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-700 shrink-0" />
                          <span className="truncate">{transit.days}</span>
                        </div>
                        <p className="text-gray-500 text-[9px] sm:text-[10px] truncate">
                          📍 {product.district}, {product.state}
                        </p>
                      </div>

                      {/* Seller Info */}
                      <p className="text-[10px] sm:text-[11px] text-gray-500 truncate pt-0.5">
                        By: <span className="font-semibold text-gray-700">{product.farmerName}</span>
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-1 sm:pt-2 grid grid-cols-2 gap-1 sm:gap-2">
                      <button
                        onClick={() => handleAddToCart(product, 1)}
                        className="py-2 sm:py-2.5 px-1 sm:px-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-[10px] sm:text-xs rounded-lg sm:rounded-xl shadow-sm transition flex items-center justify-center gap-1"
                      >
                        <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                        <span className="truncate">Add</span>
                      </button>

                      <button
                        onClick={() => handleBuyNow(product, 1)}
                        className="py-2 sm:py-2.5 px-1 sm:px-3 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold text-[10px] sm:text-xs rounded-lg sm:rounded-xl shadow-sm transition flex items-center justify-center"
                      >
                        <span className="truncate">Buy Now</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </main>
        </div>

        {/* MOBILE FILTER DRAWER / SHEET */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end lg:hidden">
            <div className="w-full max-w-sm bg-white h-full flex flex-col p-5 space-y-4 overflow-y-auto animate-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-emerald-700" />
                  <span>Filter Produce</span>
                </h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Proximity */}
              <div className="space-y-2">
                <h4 className="font-bold text-gray-900 text-xs">Farm Proximity</h4>
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-emerald-900 text-xs">
                  <input
                    type="checkbox"
                    checked={nearestOnly}
                    onChange={(e) => {
                      setNearestOnly(e.target.checked);
                      showToast(e.target.checked ? `Farms within ${buyerLocation.state}` : 'All farms');
                    }}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>📍 Only Farms in {buyerLocation.state}</span>
                </label>
              </div>

              {/* Organic toggle */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <h4 className="font-bold text-gray-900 text-xs">Organic Certification</h4>
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-emerald-900 text-xs">
                  <input
                    type="checkbox"
                    checked={organicOnly}
                    onChange={(e) => {
                      setOrganicOnly(e.target.checked);
                      showToast(e.target.checked ? 'Certified Organic Only' : 'All Produce');
                    }}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>🌿 100% Certified Organic Only (NPOP)</span>
                </label>
              </div>

              {/* Category */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <h4 className="font-bold text-gray-900 text-xs">Category</h4>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {['All', 'Vegetables', 'Fruits', 'Grains', 'Spices', 'Pulses'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategorySelect(cat)}
                      className={`py-2 px-2.5 rounded-lg text-left transition font-semibold ${
                        selectedCategory.toLowerCase() === cat.toLowerCase() && !organicOnly
                          ? 'bg-emerald-800 text-white font-bold'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat === 'All' ? 'All Produce' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Farm State Origin */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <h4 className="font-bold text-gray-900 text-xs">Farm State Origin</h4>
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    showToast(`Selected State: ${e.target.value}`);
                  }}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="All">All Indian States</option>
                  <option value="Maharashtra">Maharashtra (Nashik, Pune, Solapur)</option>
                  <option value="Uttar Pradesh">Uttar Pradesh (Varanasi)</option>
                  <option value="Madhya Pradesh">Madhya Pradesh (Sehore)</option>
                  <option value="Punjab">Punjab (Ludhiana)</option>
                  <option value="Jammu and Kashmir">Jammu &amp; Kashmir (Shopian)</option>
                  <option value="Tamil Nadu">Tamil Nadu (Ooty)</option>
                </select>
              </div>

              {/* Price Filter */}
              <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
                <h4 className="font-bold text-gray-900">Price (per kg)</h4>
                <div className="space-y-1">
                  {[
                    { id: 'All', label: 'All Prices' },
                    { id: 'under-50', label: 'Under ₹50' },
                    { id: '50-100', label: '₹50 to ₹100' },
                    { id: '100-200', label: '₹100 to ₹200' },
                    { id: 'above-200', label: 'Over ₹200' },
                  ].map((item) => (
                    <label key={item.id} className="flex items-center gap-2 cursor-pointer py-1">
                      <input
                        type="radio"
                        name="mobilePrice"
                        checked={priceRange === item.id}
                        onChange={() => setPriceRange(item.id)}
                        className="text-emerald-700"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex gap-2">
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedState('All');
                    setSelectedDistrict('All');
                    setOrganicOnly(false);
                    setPriceRange('All');
                    setMinRating(0);
                    setNearestOnly(false);
                    setMobileFilterOpen(false);
                    showToast('All filters cleared');
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 font-bold hover:bg-gray-50 text-xs"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md transition"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. PRODUCT QUICK-VIEW MODAL */}
      {quickProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 my-8">
            <div className="flex justify-end p-4 border-b border-gray-100">
              <button
                onClick={() => setQuickProduct(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 text-xs text-gray-800">
              {/* Product Photo & Origin Badge */}
              <div className="md:col-span-5 space-y-4">
                <div className="h-64 rounded-2xl overflow-hidden bg-gray-50 border border-gray-200">
                  <img
                    src={quickProduct.image}
                    alt={quickProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2 text-[11px]">
                  <p className="font-bold text-emerald-950 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Farm Origin: {quickProduct.farmLocation}, {quickProduct.state}</span>
                  </p>
                  <p className="text-gray-600">Harvest: {quickProduct.harvestDate}</p>
                  <p className="text-gray-600">Farmer: {quickProduct.farmerName} ({quickProduct.farmerPhone})</p>
                  <div className="flex items-center justify-between pt-1 border-t border-emerald-200 font-mono text-[10px]">
                    <span className="font-bold text-emerald-950">Barcode: {quickProduct.barcode}</span>
                    <span className="text-gray-600">Kisan ID: {quickProduct.kisanId}</span>
                  </div>
                </div>
              </div>

              {/* Product Specs & Purchasing Box */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-gray-900 leading-tight">
                    {quickProduct.name}
                  </h2>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                    Producer: {quickProduct.farmerName}
                  </p>

                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded font-bold text-[10px]">
                        {quickProduct.grade}
                      </span>
                      {quickProduct.organic && (
                        <button
                          onClick={() => setViewCertificateProduct(quickProduct)}
                          className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded font-bold text-[10px] border border-emerald-300 hover:underline"
                        >
                          ✓ View Lab Certificate
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setViewBarcodeProduct(quickProduct)}
                        className="px-2 py-0.5 bg-gray-100 hover:bg-emerald-50 text-gray-800 hover:text-emerald-950 rounded font-bold text-[10px] border border-gray-300 hover:border-emerald-400 flex items-center gap-1 font-mono transition"
                        title="Click to view full scannable barcode"
                      >
                        <Barcode className="w-3.5 h-3.5 text-emerald-800" />
                        <span>{quickProduct.barcode}</span>
                      </button>
                    </div>
                  </div>

                {/* Price */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-red-600 font-bold text-sm">
                      -{quickProduct.discountPercent}%
                    </span>
                    <span className="text-2xl font-black text-gray-900">
                      ₹{quickProduct.pricePerKg}
                    </span>
                    <span className="text-xs text-gray-500">/ {quickProduct.unit}</span>
                  </div>
                  <p className="text-gray-400 text-[11px]">
                    M.R.P.: <span className="line-through">₹{quickProduct.mrp}</span> (Direct Producer Price)
                  </p>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">
                  {quickProduct.description}
                </p>

                {/* Quantity Selector */}
                <div className="flex items-center gap-3 pt-2">
                  <span className="font-bold text-gray-700">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-white">
                    <button
                      onClick={() => setQuickQty(Math.max(1, quickQty - 1))}
                      className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 font-bold"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3.5 font-bold text-gray-900">
                      {quickQty} {quickProduct.unit}
                    </span>
                    <button
                      onClick={() => setQuickQty(quickQty + 1)}
                      className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-emerald-800 text-xs font-bold">
                    = ₹{(quickProduct.pricePerKg * quickQty).toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Modal Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => {
                      handleAddToCart(quickProduct, quickQty);
                      setQuickProduct(null);
                    }}
                    className="py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-md transition"
                  >
                    Add to Cart
                  </button>

                  <button
                    onClick={() => {
                      handleBuyNow(quickProduct, quickQty);
                      setQuickProduct(null);
                    }}
                    className="py-3 px-4 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold rounded-xl shadow-md transition"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. LAB TESTED ORGANIC CERTIFICATE MODAL (AUTHENTIC NPOP SCOPE CERTIFICATE) */}
      {viewCertificateProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl my-4 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 animate-in zoom-in-95 duration-200">
            {/* Top Toolbar (Non-printable) */}
            <div className="print:hidden bg-emerald-950 text-white px-4 sm:px-6 py-3 flex items-center justify-between border-b border-emerald-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="font-bold text-xs sm:text-sm">
                  Govt. of India NPOP Scope Certificate &bull; Authentic Document
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    window.print();
                    showToast('Opening print dialog for Official NPOP Certificate');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Print / Save PDF</span>
                </button>
                <button
                  onClick={() => setViewCertificateProduct(null)}
                  className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition"
                  aria-label="Close Certificate"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Certificate Paper Canvas */}
            <div className="p-2 sm:p-5 bg-amber-50/40">
              <div className="w-full bg-[#fdfdf9] border-4 border-double border-emerald-900 rounded-xl p-4 sm:p-7 relative shadow-lg font-serif text-gray-900">
                {/* Inner Decorative Border */}
                <div className="border border-emerald-800/40 p-3 sm:p-6 rounded-lg relative">
                  {/* Corner Ornaments */}
                  <div className="absolute top-1 left-1 w-3 sm:w-4 h-3 sm:h-4 border-t-2 border-l-2 border-emerald-900"></div>
                  <div className="absolute top-1 right-1 w-3 sm:w-4 h-3 sm:h-4 border-t-2 border-r-2 border-emerald-900"></div>
                  <div className="absolute bottom-1 left-1 w-3 sm:w-4 h-3 sm:h-4 border-b-2 border-l-2 border-emerald-900"></div>
                  <div className="absolute bottom-1 right-1 w-3 sm:w-4 h-3 sm:h-4 border-b-2 border-r-2 border-emerald-900"></div>

                  {/* Certificate Header: Certification Body (Left) & India Organic Logo (Right) */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3 pb-3 border-b border-emerald-900/30 text-center sm:text-left">
                    {/* Left: Aditi Organic Certifications */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center text-amber-300 font-black text-sm shrink-0">
                          AO
                        </div>
                        <div>
                          <h1 className="text-sm sm:text-base font-black tracking-wide text-gray-950 uppercase">
                            Aditi Organic Certifications Pvt. Ltd.
                          </h1>
                          <p className="text-[11px] font-sans font-bold text-emerald-800">
                            Accreditation No. under NPOP: NPOP/NAB/0017
                          </p>
                        </div>
                      </div>
                      <p className="text-[9.5px] font-sans text-gray-600 leading-tight">
                        Plot No. 38, 1st Floor, N.S. Palya, Bannerghatta Road, Bengaluru - 560076, India<br />
                        Phone: +91 80 2668 0404 &bull; Email: aditi@aditicert.net &bull; Web: www.aditicert.net
                      </p>
                    </div>

                    {/* Right: India Organic Official Emblem */}
                    <div className="flex flex-col items-center text-center shrink-0">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 relative flex items-center justify-center">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <path d="M 20,48 C 22,25 45,15 70,22 C 60,32 50,42 42,48 Z" fill="#FF9933" />
                          <path d="M 28,52 C 34,36 54,28 75,34 C 64,44 54,54 44,55 Z" fill="#F4F4F4" stroke="#E0E0E0" strokeWidth="0.5" />
                          <path d="M 30,55 C 40,78 72,75 80,50 C 65,58 45,62 30,55 Z" fill="#138808" />
                          <path d="M 45,55 Q 55,42 70,38" stroke="#138808" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                        </svg>
                      </div>
                      <span className="font-serif font-black text-xs sm:text-sm tracking-wider text-emerald-950 uppercase -mt-0.5">
                        India Organic
                      </span>
                      <span className="font-sans text-[8.5px] text-gray-600 font-semibold leading-tight">
                        APEDA &bull; Govt. of India
                      </span>
                    </div>
                  </div>

                  {/* Document Title */}
                  <div className="text-center py-3 space-y-1">
                    <h2 className="text-lg sm:text-2xl font-black tracking-[0.2em] text-emerald-950 uppercase inline-block border-b-2 border-emerald-900 pb-0.5">
                      Scope Certificate
                    </h2>
                    <p className="font-mono font-bold text-xs sm:text-sm text-red-700 tracking-wider">
                      Certificate No. {viewCertificateProduct.labCertificateNo || 'ORG/SC/2308/001533'}
                    </p>
                  </div>

                  {/* Certified Entity Block */}
                  <div className="space-y-1.5 text-center py-2">
                    <p className="text-[11px] font-sans italic text-gray-600">
                      This is to certify that the product(s) and area(s) of the organisation mentioned below:
                    </p>
                    <div className="py-2.5 px-4 bg-amber-50/70 border border-amber-200/80 rounded-lg inline-block w-full max-w-xl text-center">
                      <h3 className="text-base sm:text-lg font-black text-red-900 tracking-wider font-serif uppercase">
                        {viewCertificateProduct.farmerName}
                      </h3>
                      <p className="text-xs font-sans text-gray-700 font-medium">
                        {viewCertificateProduct.farmLocation}, District: {viewCertificateProduct.district}, {viewCertificateProduct.state}, India
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] font-mono text-emerald-900 font-bold">
                        <span>Govt. Kisan ID: {viewCertificateProduct.kisanId}</span>
                        <span>&bull;</span>
                        <span>Batch: {viewCertificateProduct.barcode}</span>
                      </div>
                    </div>
                  </div>

                  {/* Legal Standard Text matching authentic Certificate */}
                  <p className="text-[11px] sm:text-xs font-sans text-gray-800 leading-relaxed text-justify pt-2">
                    are in accordance with the requirements of India&apos;s <strong>National Programme for Organic Production (NPOP)</strong> Standards
                    (Considered equivalent to Council Regulation (EC) No. 834/2007 (Category A &amp; F) and Swiss Organic Farming Ordinance for unprocessed plant products originating in India).
                  </p>

                  {/* Produce Details Card */}
                  <div className="my-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-sans">
                    <div className="p-2.5 bg-emerald-50/60 border border-emerald-200/70 rounded-lg">
                      <span className="text-gray-500 block text-[10px]">Certified Produce:</span>
                      <span className="font-bold text-gray-900 text-sm">{viewCertificateProduct.name}</span>
                      <span className="block text-[10px] text-emerald-800 font-semibold mt-0.5">
                        Category: {viewCertificateProduct.category} &bull; {viewCertificateProduct.grade}
                      </span>
                    </div>
                    <div className="p-2.5 bg-emerald-50/60 border border-emerald-200/70 rounded-lg">
                      <span className="text-gray-500 block text-[10px]">Residue Analysis &amp; Test Result:</span>
                      <span className="font-bold text-emerald-900 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{viewCertificateProduct.labResidueResult || '0.00% Pesticides Detected (100% Organic PASS)'}</span>
                      </span>
                      <span className="block text-[10px] text-gray-500 mt-0.5">
                        Lab: {viewCertificateProduct.labName || 'FSSAI & NABL Accredited Maharashtra Agri Quality Testing Lab'}
                      </span>
                    </div>
                  </div>

                  {/* Validity Clause */}
                  <div className="my-2.5 py-2 px-3 bg-amber-50/60 border-l-4 border-amber-600 rounded-r text-[11px] font-sans space-y-0.5">
                    <p className="font-bold text-gray-900">
                      This certificate is valid from: <span className="font-mono text-emerald-950 font-bold">{viewCertificateProduct.labTestDate || '28/09/2026'}</span> until: <span className="font-mono text-emerald-950 font-bold">27/09/2027</span>
                    </p>
                    <p className="text-[10px] text-gray-600 italic">
                      The validity solely depends on continued compliance with the required standards and is subject to annual surveillance inspections.
                    </p>
                  </div>

                  {/* Footer Security: Stamp/Signature, Barcode, QR Code */}
                  <div className="pt-3 border-t border-emerald-900/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Left: Authorized Signature & Green Stamp */}
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className="w-20 h-20 rounded-full border-2 border-dashed border-emerald-700/80 flex flex-col items-center justify-center text-center p-1 text-emerald-800 rotate-[-8deg] shadow-xs bg-emerald-50/40">
                          <span className="text-[6.5px] font-bold uppercase tracking-tighter">ADITI ORGANIC CERT.</span>
                          <span className="text-[8px] font-black text-emerald-900 py-0.5">NPOP/NAB/0017</span>
                          <span className="text-[6px] font-bold uppercase tracking-tight text-emerald-700">&bull; CERTIFIED ORGANIC &bull;</span>
                        </div>
                        <div className="absolute top-6 left-2 font-serif italic text-emerald-950 font-bold text-sm pointer-events-none select-none">
                          N. Hegde
                        </div>
                      </div>
                      <div className="text-[9.5px] font-sans text-gray-700">
                        <p className="font-bold text-gray-900">Authorised Signatory</p>
                        <p className="text-gray-500">Certification Manager</p>
                        <p className="text-[8.5px] text-gray-500">Place: Bengaluru &bull; Date: {viewCertificateProduct.labTestDate || '28/09/2026'}</p>
                      </div>
                    </div>

                    {/* Center: Anti-Fraud Barcode */}
                    <div className="flex flex-col items-center justify-center text-center space-y-1">
                      <div className="p-1.5 bg-white border border-gray-300 rounded shadow-xs">
                        <svg className="w-36 h-9" viewBox="0 0 160 36">
                          <rect x="0" y="0" width="2" height="36" fill="#000" />
                          <rect x="3" y="0" width="1" height="36" fill="#000" />
                          <rect x="6" y="0" width="3" height="32" fill="#000" />
                          <rect x="11" y="0" width="1" height="32" fill="#000" />
                          <rect x="14" y="0" width="2" height="32" fill="#000" />
                          <rect x="18" y="0" width="4" height="32" fill="#000" />
                          <rect x="24" y="0" width="1" height="32" fill="#000" />
                          <rect x="27" y="0" width="3" height="32" fill="#000" />
                          <rect x="32" y="0" width="2" height="32" fill="#000" />
                          <rect x="36" y="0" width="1" height="32" fill="#000" />
                          <rect x="39" y="0" width="3" height="32" fill="#000" />
                          <rect x="44" y="0" width="2" height="32" fill="#000" />
                          <rect x="48" y="0" width="4" height="32" fill="#000" />
                          <rect x="54" y="0" width="1" height="32" fill="#000" />
                          <rect x="57" y="0" width="2" height="32" fill="#000" />
                          <rect x="61" y="0" width="3" height="32" fill="#000" />
                          <rect x="66" y="0" width="1" height="32" fill="#000" />
                          <rect x="69" y="0" width="4" height="32" fill="#000" />
                          <rect x="75" y="0" width="2" height="32" fill="#000" />
                          <rect x="79" y="0" width="1" height="32" fill="#000" />
                          <rect x="82" y="0" width="3" height="32" fill="#000" />
                          <rect x="87" y="0" width="2" height="32" fill="#000" />
                          <rect x="91" y="0" width="1" height="32" fill="#000" />
                          <rect x="94" y="0" width="4" height="32" fill="#000" />
                          <rect x="100" y="0" width="2" height="32" fill="#000" />
                          <rect x="104" y="0" width="1" height="32" fill="#000" />
                          <rect x="107" y="0" width="3" height="32" fill="#000" />
                          <rect x="112" y="0" width="2" height="32" fill="#000" />
                          <rect x="116" y="0" width="4" height="32" fill="#000" />
                          <rect x="122" y="0" width="1" height="32" fill="#000" />
                          <rect x="125" y="0" width="3" height="32" fill="#000" />
                          <rect x="130" y="0" width="2" height="32" fill="#000" />
                          <rect x="134" y="0" width="1" height="32" fill="#000" />
                          <rect x="137" y="0" width="3" height="32" fill="#000" />
                          <rect x="142" y="0" width="2" height="32" fill="#000" />
                          <rect x="146" y="0" width="4" height="32" fill="#000" />
                          <rect x="152" y="0" width="1" height="32" fill="#000" />
                          <rect x="155" y="0" width="2" height="36" fill="#000" />
                          <rect x="158" y="0" width="2" height="36" fill="#000" />
                        </svg>
                      </div>
                      <span className="font-mono text-[9px] font-bold text-gray-800 tracking-wider">
                        (253) {viewCertificateProduct.barcode}
                      </span>
                    </div>

                    {/* Right: Verification QR Code */}
                    <div className="flex items-center gap-2 text-right">
                      <div className="text-[9px] font-sans">
                        <span className="font-bold text-emerald-950 block">APEDA TraceNet</span>
                        <span className="text-[8px] text-gray-500">Scan to Verify</span>
                      </div>
                      <div className="p-1 bg-white border border-gray-300 rounded shadow-xs">
                        <QrCode className="w-12 h-12 text-emerald-950" />
                      </div>
                    </div>
                  </div>

                  {/* Official Bottom Disclaimer */}
                  <div className="mt-3 pt-2 border-t border-emerald-900/20 text-center text-[8.5px] font-sans text-gray-500 leading-tight">
                    Issued under the authority of National Programme for Organic Production, Ministry of Commerce &amp; Industry, Government of India.
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Controls */}
            <div className="print:hidden bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <span className="text-xs text-gray-500 font-sans truncate pr-2">
                Authentic NPOP Certificate for <strong>{viewCertificateProduct.name}</strong>
              </span>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => {
                    window.print();
                    showToast('Opening print dialog');
                  }}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download / Print</span>
                </button>
                <button
                  onClick={() => setViewCertificateProduct(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-bold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. FARMER ACCOUNT PURCHASE RESTRICTION MODAL */}
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
                CropNex policy ke mutabik farmer account se direct retail order nahi kiya ja sakta. Buy sirf registered Buyer account se ho sakta hai.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <Link
                href="/seller"
                onClick={() => setFarmerRestrictionModalOpen(false)}
                className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-center block transition shadow-md"
              >
                Go to Farmer Dashboard &amp; Sell Produce
              </Link>
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

      {/* 8. DEDICATED ANTI-FRAUD PRODUCE BARCODE MODAL */}
      {viewBarcodeProduct && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#0e2a1b] text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Barcode className="w-5 h-5 text-[#f59e0b]" />
                <div>
                  <h3 className="font-bold text-sm">Anti-Fraud Produce Barcode</h3>
                  <p className="text-[10px] text-emerald-300 font-mono">GS1-128 &bull; Govt Traceability Standard</p>
                </div>
              </div>
              <button
                onClick={() => setViewBarcodeProduct(null)}
                className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition"
                aria-label="Close Barcode Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Barcode & Produce Card */}
            <div className="p-6 space-y-5 text-gray-900">
              {/* Product Snippet */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-200">
                <img
                  src={viewBarcodeProduct.image}
                  alt={viewBarcodeProduct.name}
                  className="w-14 h-14 object-cover rounded-xl shrink-0 border border-gray-200"
                />
                <div className="min-w-0">
                  <h4 className="font-black text-sm text-gray-900 truncate">{viewBarcodeProduct.name}</h4>
                  <p className="text-xs text-emerald-800 font-bold truncate">Farmer: {viewBarcodeProduct.farmerName}</p>
                  <p className="text-[11px] text-gray-500 font-mono">Kisan ID: {viewBarcodeProduct.kisanId}</p>
                </div>
              </div>

              {/* The Scannable Barcode Canvas */}
              <div className="p-5 bg-white border-2 border-dashed border-emerald-300 rounded-2xl flex flex-col items-center justify-center space-y-2 shadow-inner">
                <span className="text-[10px] font-sans font-bold text-emerald-800 uppercase tracking-widest bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Official Produce Crate Barcode
                </span>

                {/* Simulated High Density Vector Barcode SVG */}
                <div className="w-full max-w-[320px] bg-white p-4 rounded-xl border border-gray-200 flex flex-col items-center shadow-xs">
                  <svg className="w-full h-20" viewBox="0 0 200 50">
                    {/* Guard bars */}
                    <rect x="0" y="0" width="3" height="50" fill="#000" />
                    <rect x="5" y="0" width="1.5" height="50" fill="#000" />
                    {/* Left pattern */}
                    <rect x="9" y="0" width="4" height="42" fill="#000" />
                    <rect x="15" y="0" width="2" height="42" fill="#000" />
                    <rect x="19" y="0" width="1.5" height="42" fill="#000" />
                    <rect x="23" y="0" width="5" height="42" fill="#000" />
                    <rect x="31" y="0" width="2" height="42" fill="#000" />
                    <rect x="35" y="0" width="3" height="42" fill="#000" />
                    <rect x="40" y="0" width="1.5" height="42" fill="#000" />
                    <rect x="44" y="0" width="4" height="42" fill="#000" />
                    <rect x="51" y="0" width="2" height="42" fill="#000" />
                    <rect x="55" y="0" width="5" height="42" fill="#000" />
                    <rect x="63" y="0" width="1.5" height="42" fill="#000" />
                    <rect x="67" y="0" width="3" height="42" fill="#000" />
                    <rect x="73" y="0" width="4" height="42" fill="#000" />
                    <rect x="79" y="0" width="2" height="42" fill="#000" />
                    <rect x="83" y="0" width="5" height="42" fill="#000" />
                    <rect x="90" y="0" width="1.5" height="42" fill="#000" />
                    {/* Center guard bars */}
                    <rect x="95" y="0" width="2" height="50" fill="#000" />
                    <rect x="99" y="0" width="2" height="50" fill="#000" />
                    {/* Right pattern */}
                    <rect x="104" y="0" width="4" height="42" fill="#000" />
                    <rect x="110" y="0" width="2" height="42" fill="#000" />
                    <rect x="114" y="0" width="5" height="42" fill="#000" />
                    <rect x="122" y="0" width="1.5" height="42" fill="#000" />
                    <rect x="126" y="0" width="3" height="42" fill="#000" />
                    <rect x="131" y="0" width="4" height="42" fill="#000" />
                    <rect x="138" y="0" width="2" height="42" fill="#000" />
                    <rect x="142" y="0" width="5" height="42" fill="#000" />
                    <rect x="150" y="0" width="1.5" height="42" fill="#000" />
                    <rect x="154" y="0" width="4" height="42" fill="#000" />
                    <rect x="160" y="0" width="2" height="42" fill="#000" />
                    <rect x="164" y="0" width="5" height="42" fill="#000" />
                    <rect x="172" y="0" width="3" height="42" fill="#000" />
                    <rect x="178" y="0" width="1.5" height="42" fill="#000" />
                    <rect x="182" y="0" width="4" height="42" fill="#000" />
                    <rect x="188" y="0" width="2" height="42" fill="#000" />
                    {/* Right guard */}
                    <rect x="193" y="0" width="1.5" height="50" fill="#000" />
                    <rect x="197" y="0" width="3" height="50" fill="#000" />
                  </svg>
                  <p className="font-mono font-bold text-sm sm:text-base tracking-[0.2em] text-gray-900 mt-2.5">
                    {viewBarcodeProduct.barcode}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold mt-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Tamper-Proof Traceability Serial &bull; Scan-Verified</span>
                </div>
              </div>

              {/* Produce Verification Table */}
              <div className="space-y-2 text-xs bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <div className="flex justify-between py-1 border-b border-gray-200/60">
                  <span className="text-gray-500 font-medium">Certified Farmer:</span>
                  <span className="font-bold text-gray-900">{viewBarcodeProduct.farmerName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200/60 font-mono">
                  <span className="text-gray-500 font-medium">Govt. Certified Kisan ID:</span>
                  <span className="font-bold text-emerald-950">{viewBarcodeProduct.kisanId}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200/60">
                  <span className="text-gray-500 font-medium">Farm Origin:</span>
                  <span className="font-bold text-gray-900">{viewBarcodeProduct.farmLocation}, {viewBarcodeProduct.district} ({viewBarcodeProduct.state})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200/60">
                  <span className="text-gray-500 font-medium">Quality Grade:</span>
                  <span className="font-bold text-emerald-800">{viewBarcodeProduct.grade}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500 font-medium">Harvest Batch:</span>
                  <span className="font-bold text-gray-900">{viewBarcodeProduct.harvestDate}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={() => {
                    window.print();
                    showToast('Printing barcode label');
                  }}
                  className="py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Barcode</span>
                </button>
                <button
                  onClick={() => setViewBarcodeProduct(null)}
                  className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AgritechMarketplaceHomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8faf9] flex items-center justify-center text-xs font-bold text-gray-500">
          Loading CropNex Marketplace...
        </div>
      }
    >
      <AgritechMarketplaceHomeContent />
    </Suspense>
  );
}

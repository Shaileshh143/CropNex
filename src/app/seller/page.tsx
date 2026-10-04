'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import {
  Store,
  Plus,
  Package,
  TrendingUp,
  Clock,
  CheckCircle2,
  Truck,
  X,
  Camera,
  Upload,
  ShieldCheck,
  FileCheck,
  Award,
  Barcode,
  Calendar,
  AlertTriangle,
  QrCode,
  Sparkles,
  FileText,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  MapPin,
  RefreshCw,
  Search,
  Filter,
  Eye,
  LogOut,
  Navigation,
} from 'lucide-react';
import { ProductItem, INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_FORECASTS, INITIAL_TENDERS } from '@/lib/initialData';
import LiveTransitMap from '@/components/LiveTransitMap';

export default function DedicatedFarmerPortalPage() {
  const { data: session } = useSession();

  // Verification & Authentication
  const [verifiedKisanId, setVerifiedKisanId] = useState<string>('');
  const [farmerName, setFarmerName] = useState<string>('');
  const [inputKisanId, setInputKisanId] = useState<string>('');
  const [isVerifyingKisan, setIsVerifyingKisan] = useState(false);
  const [kisanError, setKisanError] = useState<string | null>(null);

  // New Kisan ID Generator modal state
  const [generatorModalOpen, setGeneratorModalOpen] = useState(false);
  const [genName, setGenName] = useState('Dnyaneshwar Patil');
  const [genAadhaar, setGenAadhaar] = useState('9812');
  const [genSurveyNo, setGenSurveyNo] = useState('44/2A');
  const [genState, setGenState] = useState('Maharashtra');
  const [genDistrict, setGenDistrict] = useState('Nashik');
  const [generatingKisan, setGeneratingKisan] = useState(false);

  // Active Dashboard Tab: 'products' | 'add' | 'forecast' | 'tenders' | 'logistics' | 'orders' | 'returns'
  const [activeTab, setActiveTab] = useState<'products' | 'add' | 'forecast' | 'tenders' | 'logistics' | 'orders' | 'returns'>('products');

  // Products and Orders Data
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<any[]>(INITIAL_ORDERS);
  const [tenders, setTenders] = useState<any[]>(INITIAL_TENDERS);
  const [forecasts, setForecasts] = useState<any[]>(INITIAL_FORECASTS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Return Proof Photo Zoom Modal
  const [inspectingProof, setInspectingProof] = useState<any | null>(null);

  // Return Orders Data with images & customer proof
  const [returnOrders, setReturnOrders] = useState<any[]>([
    {
      returnId: 'RTO-CRPNX-9481',
      orderNumber: 'ORD-982104',
      buyerName: 'Pooja Kulkarni (Pune)',
      buyerPhone: '+91 98224 81092',
      produce: 'Nashik Red Onion (Garwa)',
      productImage: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=400&q=80',
      damagedProofImage: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
      reason: 'Moisture ingress & packaging tear during heavy transit rain on highway',
      buyerRemarks: 'Outer gunny bag was soaked in water upon delivery, causing outer layer soft spots. Returning 2 crates for insurance claim.',
      status: 'Under Quality Inspection',
      claimAmount: '₹1,450',
      actionNeeded: 'Insurance Surveyor Reviewing',
      date: '28 Sep 2026',
      quantity: '50 kg',
    },
    {
      returnId: 'RTO-CRPNX-8219',
      orderNumber: 'ORD-761203',
      buyerName: 'Amit Verma (Mumbai)',
      buyerPhone: '+91 99301 22894',
      produce: 'Fresh Hybrid Tomatoes (Grade A+)',
      productImage: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80',
      damagedProofImage: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=600&q=80',
      reason: 'Crate latch breakage due to pothole impact on carrier vehicle',
      buyerRemarks: 'Bottom crate latch cracked and 6 kg tomatoes bruised during sudden transit braking. Carrier admitted damage.',
      status: 'Insurance Reimbursed (100%)',
      claimAmount: '₹960',
      actionNeeded: 'Settled to Farmer Escrow',
      date: '21 Sep 2026',
      quantity: '30 kg',
    },
  ]);

  // Selected Tender for Bidding Modal
  const [selectedTender, setSelectedTender] = useState<any | null>(null);
  const [tenderBidPrice, setTenderBidPrice] = useState('');
  const [tenderBidQty, setTenderBidQty] = useState('');
  const [biddingSuccess, setBiddingSuccess] = useState(false);

  // Selected Commodity for Forecast
  const [selectedCommodity, setSelectedCommodity] = useState('Tomato Hybrid');

  // Logistics Route Optimization State & Selected Hub
  const [logisticsOptimized, setLogisticsOptimized] = useState(true);
  const [selectedHub, setSelectedHub] = useState<string>('Pimpalgaon Baswant Farm-Gate Hub');
  const [logisticsMapMode, setLogisticsMapMode] = useState<'interactive' | 'schematic'>('interactive');

  // ADD PRODUCE FORM STATE
  const [cropName, setCropName] = useState('');
  const [category, setCategory] = useState<'Vegetables' | 'Grains' | 'Fruits' | 'Spices' | 'Pulses'>('Vegetables');
  const [variety, setVariety] = useState('Pusa Desi Hybrid');
  const [pricePerKg, setPricePerKg] = useState('');
  const [mrp, setMrp] = useState('');
  const [availableQuantity, setAvailableQuantity] = useState('');
  const [minOrderQuantity, setMinOrderQuantity] = useState('1');
  const [unit, setUnit] = useState('kg');
  const [farmLocation, setFarmLocation] = useState('Pimpalgaon Farm Gate');
  const [district, setDistrict] = useState('Nashik');
  const [state, setState] = useState('Maharashtra');
  const [farmerPhone, setFarmerPhone] = useState('+91 98221 44521');
  const [description, setDescription] = useState('');

  // Harvest date & automated grading inputs
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [freshnessWindow, setFreshnessWindow] = useState('under-12h');
  const [sortingPurity, setSortingPurity] = useState(92);
  const [isOrganic, setIsOrganic] = useState(true);

  // Camera capture & photo upload (NO URL INPUT!)
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Government & Lab Tested Organic Certificate details
  const [labCertificateNo, setLabCertificateNo] = useState('NPOP/NABL/AGRI-2026-4491');
  const [labName, setLabName] = useState('FSSAI & NABL Accredited State Agricultural Testing Lab, Pune');
  const [labTestDate, setLabTestDate] = useState('28 Sep 2026');
  const [labResidueResult, setLabResidueResult] = useState('0.00% Pesticide Residue Detected (100% Organic PASS)');

  // Unique Anti-Fraud Barcode state
  const [generatedBarcode, setGeneratedBarcode] = useState('');

  useEffect(() => {
    const savedKisan = localStorage.getItem('cropnex_kisan_id');
    const savedFarmer = localStorage.getItem('cropnex_farmer_name');
    if (savedKisan) {
      setVerifiedKisanId(savedKisan);
      setFarmerName(savedFarmer || 'Patil Organic Farms');
    } else if ((session?.user as any)?.role === 'farmer') {
      const generated = 'MH-KISAN-982104';
      setVerifiedKisanId(generated);
      setFarmerName(session?.user?.name || 'Patil Organic Farms');
      localStorage.setItem('cropnex_kisan_id', generated);
      localStorage.setItem('cropnex_farmer_name', session?.user?.name || 'Patil Organic Farms');
    }
    fetchData();
  }, [session]);

  // Update barcode whenever state or crop changes
  useEffect(() => {
    const prefix = state.substring(0, 2).toUpperCase();
    const randomSerial = Math.floor(10000 + Math.random() * 90000);
    setGeneratedBarcode(`CRPNX-AGRI-${prefix}-${randomSerial}`);
  }, [state, cropName]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchData = async () => {
    try {
      const [prodRes, ordRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders'),
      ]);
      const prodData = await prodRes.json();
      const ordData = await ordRes.json();
      if (prodData.success && prodData.data) setProducts(prodData.data);
      if (ordData.success && ordData.data) setOrders(ordData.data);
    } catch (e) {
      // fallback
    }
  };

  // SYSTEM AUTOMATED QUALITY GRADING
  const calculateSystemGrade = () => {
    if (freshnessWindow === 'under-12h' && sortingPurity >= 88) {
      return { grade: 'Grade A+', description: 'Export Quality • Harvested within 12 Hours • Maximum Freshness' };
    } else if ((freshnessWindow === 'under-12h' || freshnessWindow === '12-24h') && sortingPurity >= 75) {
      return { grade: 'Grade A', description: 'Mandi Super Grade • Freshly sorted harvest' };
    } else {
      return { grade: 'Grade B', description: 'Standard / Processing Grade' };
    }
  };

  const systemGrade = calculateSystemGrade();

  // Photo Upload or Camera Capture via FileReader to Base64
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        showToast('Produce photo captured and loaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Farmer verification with Govt Certified Kisan ID
  const handleVerifyExistingKisanId = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifyingKisan(true);
    setKisanError(null);

    const cleaned = inputKisanId.trim().toUpperCase();
    if (cleaned.length < 8) {
      setKisanError('Invalid Kisan ID. Format must be state prefix (e.g. MH-KISAN-984321) or 12-digit PM-KISAN ID.');
      setIsVerifyingKisan(false);
      return;
    }

    setTimeout(() => {
      const recognizedFarmer = 'Patil Organic Farms (Nashik)';
      setVerifiedKisanId(cleaned);
      setFarmerName(recognizedFarmer);
      localStorage.setItem('cropnex_kisan_id', cleaned);
      localStorage.setItem('cropnex_farmer_name', recognizedFarmer);
      setIsVerifyingKisan(false);
      showToast(`Welcome ${recognizedFarmer}! Kisan ID ${cleaned} verified.`);

      signIn('credentials', {
        role: 'farmer',
        name: recognizedFarmer,
        email: 'farmer@cropnex.in',
        redirect: false,
      });
    }, 1200);
  };

  // Instant e-KYC Land Record simulation to issue a new Kisan ID
  const handleGenerateKisanId = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingKisan(true);

    setTimeout(() => {
      const prefix = genState.substring(0, 2).toUpperCase();
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      const newId = `${prefix}-KISAN-${randomNum}`;

      setVerifiedKisanId(newId);
      setFarmerName(genName);
      localStorage.setItem('cropnex_kisan_id', newId);
      localStorage.setItem('cropnex_farmer_name', genName);

      setGeneratingKisan(false);
      setGeneratorModalOpen(false);
      showToast(`e-KYC Verified! Issued Government Certified Kisan ID: ${newId}`);

      signIn('credentials', {
        role: 'farmer',
        name: genName,
        email: 'farmer@cropnex.in',
        redirect: false,
      });
    }, 1500);
  };

  // Handle Form Submission for Adding Produce
  const handleAddProduceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const price = parseFloat(pricePerKg);
    const benchmarkMrp = mrp ? parseFloat(mrp) : Math.round(price * 1.35);

    const defaultImages: Record<string, string> = {
      Vegetables: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
      Fruits: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?auto=format&fit=crop&w=600&q=80',
      Grains: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
      Spices: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
      Pulses: 'https://images.unsplash.com/photo-1585849834908-3481231155e8?auto=format&fit=crop&w=600&q=80',
    };

    const finalImage = capturedImage || defaultImages[category] || defaultImages.Vegetables;

    const payload = {
      name: cropName,
      category,
      variety,
      pricePerKg: price,
      mrp: benchmarkMrp,
      discountPercent: Math.max(0, Math.round(((benchmarkMrp - price) / benchmarkMrp) * 100)),
      availableQuantity: parseFloat(availableQuantity) || 100,
      minOrderQuantity: parseFloat(minOrderQuantity) || 1,
      unit,
      farmLocation,
      district,
      state,
      farmerName,
      farmerPhone,
      kisanId: verifiedKisanId,
      barcode: generatedBarcode,
      image: finalImage,
      description: description || `Freshly harvested ${cropName} (${variety}) from ${farmLocation}.`,
      grade: systemGrade.grade,
      harvestDate,
      freshnessWindow,
      sortingScore: sortingPurity,
      organic: isOrganic,
      labCertificateNo: isOrganic ? labCertificateNo : undefined,
      labName: isOrganic ? labName : undefined,
      labTestDate: isOrganic ? labTestDate : undefined,
      labResidueResult: isOrganic ? labResidueResult : undefined,
    };

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setProducts([data.data, ...products]);
        showToast(`Produce "${cropName}" listed with Unique Barcode ${generatedBarcode}!`);
        setCropName('');
        setPricePerKg('');
        setMrp('');
        setAvailableQuantity('');
        setCapturedImage(null);
        setActiveTab('products');
      } else {
        showToast('Error listing produce. Please try again.');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while saving product.');
    } finally {
      setSubmitting(false);
    }
  };

  // Update order status in Farmer Dashboard
  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((o) => ((o.id === orderId || o.orderNumber === orderId) ? { ...o, status: newStatus } : o))
    );
    showToast(`Order #${orderId} marked as ${newStatus}!`);
  };

  // Submit Tender Bid
  const handleTenderBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBiddingSuccess(true);
    setTimeout(() => {
      setBiddingSuccess(false);
      setSelectedTender(null);
      showToast(`Tender bid submitted successfully for ${selectedTender.tenderId}!`);
    }, 1800);
  };

  // =========================================================================
  // GATE 1: FARMER NOT VERIFIED (SHOW FARMER ACCESS GATE)
  // =========================================================================
  if (!verifiedKisanId) {
    return (
      <div className="min-h-[85vh] bg-[#f8faf9] py-12 px-4 flex flex-col items-center justify-center text-gray-900">
        <div className="text-center max-w-lg space-y-2 mb-8 flex flex-col items-center">
          <img
            src="/images/cropnex_logo.png"
            alt="CropNex Logo"
            className="w-20 h-20 rounded-full object-cover shadow-xl border-3 border-[#f59e0b] mb-2 hover:scale-105 transition"
          />
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs">
            <Store className="w-3.5 h-3.5 text-emerald-700" />
            <span>Dedicated Farmer Seller Central</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Sell Direct on CropNex
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Eliminate APMC commission middlemen. Connect directly to urban consumers, retailers, and institutional buyers with 100% escrow protection.
          </p>
        </div>

        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-200 p-6 sm:p-8 space-y-6 text-xs">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900">Government Kisan ID Verification</h2>
              <p className="text-gray-500 text-[11px]">Anti-Fraud Verification for Indian Farmers</p>
            </div>
          </div>

          {kisanError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{kisanError}</span>
            </div>
          )}

          <form onSubmit={handleVerifyExistingKisanId} className="space-y-4">
            <div>
              <label className="block font-bold text-gray-800 mb-1">
                Enter Government Certified Kisan ID / PM-KISAN ID
              </label>
              <input
                type="text"
                required
                placeholder="e.g. MH-KISAN-984321 or UP-KISAN-120491"
                value={inputKisanId}
                onChange={(e) => setInputKisanId(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none uppercase"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Demo Kisan ID: <strong className="text-emerald-800">MH-KISAN-984321</strong>
              </p>
            </div>

            <button
              type="submit"
              disabled={isVerifyingKisan}
              className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              {isVerifyingKisan ? (
                <span>Validating with Agritech Registry...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Kisan ID &amp; Enter Dashboard</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-gray-100 text-center space-y-2">
            <p className="text-gray-500 text-[11px]">Don&apos;t have a registered Kisan ID yet?</p>
            <button
              type="button"
              onClick={() => setGeneratorModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl border border-emerald-600 text-emerald-800 font-bold hover:bg-emerald-50 transition"
            >
              ⚡ Instant e-KYC: Generate Certified Kisan ID
            </button>
          </div>
        </div>

        {generatorModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-4 text-xs text-gray-800 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-700" />
                  <h3 className="font-black text-base text-gray-900">Digital Land Record e-KYC</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setGeneratorModalOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-gray-600 leading-relaxed">
                Connect your state 7/12 Land Record (Mahabhulekh / Bhulekh) to generate your verified Government Kisan ID automatically.
              </p>

              <form onSubmit={handleGenerateKisanId} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1">Farmer Full Name</label>
                    <input
                      type="text"
                      required
                      value={genName}
                      onChange={(e) => setGenName(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Last 4 Digits of Aadhaar</label>
                    <input
                      type="text"
                      maxLength={4}
                      required
                      value={genAadhaar}
                      onChange={(e) => setGenAadhaar(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold mb-1">Farm Survey No</label>
                    <input
                      type="text"
                      required
                      value={genSurveyNo}
                      onChange={(e) => setGenSurveyNo(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">State</label>
                    <select
                      value={genState}
                      onChange={(e) => setGenState(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-xl bg-white"
                    >
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Punjab">Punjab</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold mb-1">District</label>
                    <input
                      type="text"
                      required
                      value={genDistrict}
                      onChange={(e) => setGenDistrict(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-xl"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setGeneratorModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-300 font-bold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={generatingKisan}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold shadow-md transition"
                  >
                    {generatingKisan ? 'Verifying Land Record...' : 'Verify e-KYC & Issue Kisan ID'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // GATE 2: VERIFIED FARMER SELLER DASHBOARD (FULL SEPARATE SUITE)
  // =========================================================================
  const currentForecast =
    forecasts.find((f) => f.commodity.toLowerCase().includes(selectedCommodity.toLowerCase())) || forecasts[0];

  return (
    <div className="bg-[#f8faf9] min-h-screen text-gray-900 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0e2a1b] text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#f59e0b]" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* 1. DEDICATED FARMER HEADER (NO CONSUMER BUYER NAV BAR) */}
      <header className="bg-[#0e2a1b] text-white border-b border-emerald-800/40 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/images/cropnex_logo.png"
              alt="CropNex Logo"
              className="w-10 h-10 rounded-full object-cover shadow-md border-2 border-[#f59e0b] shrink-0"
            />
            <span className="text-xl font-black tracking-tight text-white flex items-center">
              Crop<span className="text-[#f59e0b]">Nex</span>
              <span className="text-xs text-emerald-300 font-normal ml-0.5">Farmer</span>
            </span>
            <div className="h-4 w-px bg-emerald-700 hidden sm:block" />
            <div className="flex items-center gap-1.5 text-xs text-emerald-200">
              <span className="font-bold text-white">{farmerName}</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-900 text-emerald-300 font-mono text-[10px] border border-emerald-600/40">
                <ShieldCheck className="w-3 h-3 text-[#f59e0b]" />
                {verifiedKisanId}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
            <button
              onClick={() => setActiveTab('add')}
              className="px-3.5 py-1.5 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Produce</span>
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('cropnex_kisan_id');
                localStorage.removeItem('cropnex_farmer_name');
                setVerifiedKisanId('');
                signOut({ callbackUrl: '/' });
              }}
              className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 rounded-lg text-white font-bold flex items-center gap-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* 2. DEDICATED FARMER NAVIGATION TABS */}
        <div className="bg-[#1b432c] border-t border-emerald-800/40 px-4 sm:px-6 lg:px-8 flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none text-xs font-bold">
          {[
            { id: 'products', label: 'My Products', icon: Package, count: products.length },
            { id: 'add', label: 'Add Produce', icon: Plus, highlight: true },
            { id: 'forecast', label: 'AI Forecasting', icon: TrendingUp },
            { id: 'tenders', label: 'Institutional Tenders', icon: FileText, count: tenders.length },
            { id: 'logistics', label: 'Logistics & Map', icon: Truck },
            { id: 'orders', label: 'Buyer Orders', icon: Store, count: orders.length },
            { id: 'returns', label: 'Return Orders (RTO)', icon: RotateCcw, count: returnOrders.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3 sm:px-4 border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
                  isActive
                    ? 'border-[#f59e0b] text-[#f59e0b] bg-emerald-900/30'
                    : 'border-transparent text-emerald-100 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? 'bg-[#f59e0b] text-slate-900' : 'bg-emerald-900 text-emerald-200'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* 3. MAIN DASHBOARD CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* =========================================================================
            TAB 1: MY PRODUCTS
        ========================================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-6 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900">My Listed Farm Produce Batches</h2>
                <p className="text-gray-500 mt-0.5">
                  All items are protected with tamper-proof unique barcodes and backed by your Kisan ID.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('add')}
                className="px-5 py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold rounded-xl shadow-md flex items-center gap-2 self-start sm:self-auto transition"
              >
                <Plus className="w-4 h-4" />
                <span>List New Harvested Batch</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
              {products.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3.5 sm:p-4 shadow-sm hover:shadow-md transition space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="h-40 rounded-xl overflow-hidden bg-gray-50 relative">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 px-2.5 py-0.5 bg-emerald-900/90 text-white rounded font-bold text-[10px] backdrop-blur-sm">
                        {item.grade}
                      </span>
                      {item.organic && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500 text-slate-900 rounded font-black text-[10px]">
                          100% Organic
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-black text-sm text-gray-900">{item.name}</h3>
                      <p className="text-emerald-700 font-semibold text-[11px]">
                        Category: <strong>{item.category}</strong> • Stock: {item.availableQuantity} {item.unit || 'kg'}
                      </p>
                    </div>

                    {/* Barcode Tag */}
                    <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-200 font-mono text-[10px]">
                      <span className="flex items-center gap-1 font-bold text-gray-800">
                        <Barcode className="w-3.5 h-3.5 text-emerald-800" />
                        <span>{item.barcode}</span>
                      </span>
                      <span className="text-emerald-800 font-bold">{item.kisanId}</span>
                    </div>

                    {/* Real Pricing Display */}
                    <div className="flex items-baseline justify-between pt-1">
                      <div>
                        <span className="text-lg font-black text-emerald-950">₹{item.pricePerKg}</span>
                        <span className="text-gray-500"> / {item.unit}</span>
                      </div>
                      <div className="text-[11px] text-gray-400">
                        M.R.P.: <span className="line-through">₹{item.mrp}</span>
                        <span className="ml-1 text-red-600 font-bold">(-{item.discountPercent}%)</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                    <span className="text-gray-500">Harvest: {item.harvestDate}</span>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded font-bold">
                      Active Listing
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: ADD PRODUCE (PRISTINE FULL FORM)
        ========================================================================= */}
        {activeTab === 'add' && (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-200 p-6 sm:p-8 space-y-6 text-xs text-gray-800">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900">List New Farm Harvest Produce</h2>
                <p className="text-gray-500 mt-0.5">
                  Complete produce details, automated quality grade, direct camera upload, and unique anti-fraud barcode.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('products')}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduceSubmit} className="space-y-6">
              {/* 1. Basic Produce Information */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-emerald-700" />
                  <span>1. Commodity &amp; Category Details</span>
                </h3>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">Product / Crop Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nashik Red Onion, Sharbati Wheat, Alphonso Mango, Basmati Paddy"
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-gray-800 mb-1">Product Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full p-2.5 border border-gray-300 rounded-xl bg-white"
                    >
                      <option value="Vegetables">Vegetables</option>
                      <option value="Fruits">Fruits</option>
                      <option value="Grains">Grains &amp; Cereals</option>
                      <option value="Spices">Spices &amp; Condiments</option>
                      <option value="Pulses">Pulses &amp; Legumes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-800 mb-1">Variety / Sub-Type</label>
                    <input
                      type="text"
                      placeholder="e.g. Desi Hybrid / Pusa 1121"
                      value={variety}
                      onChange={(e) => setVariety(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-800 mb-1">Unit of Measurement</label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-xl bg-white"
                    >
                      <option value="kg">Kilogram (kg)</option>
                      <option value="quintal">Quintal (100 kg)</option>
                      <option value="tonne">Metric Tonne (MT)</option>
                      <option value="crate">Crate (25 kg)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-gray-800 mb-1">Total Available Stock</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 1500"
                      value={availableQuantity}
                      onChange={(e) => setAvailableQuantity(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-800 mb-1">Farm Selling Price (₹ / {unit})</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 32"
                      value={pricePerKg}
                      onChange={(e) => setPricePerKg(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-800 mb-1">Retail M.R.P. Benchmark (₹ / {unit})</label>
                    <input
                      type="number"
                      placeholder="e.g. 50"
                      value={mrp}
                      onChange={(e) => setMrp(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Harvest Date & Automated Grading */}
              <div className="space-y-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-700" />
                    <span>2. Harvest Freshness &amp; Automated Grading</span>
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Algorithm Powered
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1">Harvest Date</label>
                    <input
                      type="date"
                      required
                      value={harvestDate}
                      onChange={(e) => setHarvestDate(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Freshness Window Elapsed</label>
                    <select
                      value={freshnessWindow}
                      onChange={(e) => setFreshnessWindow(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-xl bg-white"
                    >
                      <option value="under-12h">Harvested Today (&lt; 12 Hours Ago)</option>
                      <option value="12-24h">Harvested Within 24 Hours</option>
                      <option value="24-48h">Harvested 24-48 Hours Ago</option>
                      <option value="over-48h">Matured Batch (&gt; 48 Hours)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span>Field Sorting Uniformity &amp; Purity:</span>
                    <span className="text-emerald-800">{sortingPurity}% Purity</span>
                  </div>
                  <input
                    type="range"
                    min={60}
                    max={100}
                    value={sortingPurity}
                    onChange={(e) => setSortingPurity(Number(e.target.value))}
                    className="w-full accent-emerald-700 cursor-pointer"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">
                      System Calculated Produce Grade
                    </span>
                    <p className="font-black text-emerald-950 text-base">{systemGrade.grade}</p>
                    <p className="text-[11px] text-emerald-700">{systemGrade.description}</p>
                  </div>
                  <Sparkles className="w-6 h-6 text-[#f59e0b]" />
                </div>
              </div>

              {/* 3. Direct Camera Photo Capture & File Upload */}
              <div className="space-y-3 pt-3 border-t border-gray-100">
                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-700" />
                  <span>3. Real Produce Photo (Direct Mobile Camera or Upload)</span>
                </h3>
                <p className="text-gray-500 text-[11px]">
                  Direct camera photos ensure transparency and fraud prevention. (URL links are disabled).
                </p>

                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={cameraInputRef}
                  onChange={handleImageFileChange}
                  className="hidden"
                />
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="py-3 px-4 rounded-xl border-2 border-dashed border-emerald-600 bg-emerald-50/50 hover:bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center gap-2 transition"
                  >
                    <Camera className="w-5 h-5 text-emerald-700" />
                    <span>Open Mobile Camera</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="py-3 px-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 bg-gray-50 font-bold text-gray-700 flex items-center justify-center gap-2 transition"
                  >
                    <Upload className="w-5 h-5 text-gray-600" />
                    <span>Choose from Gallery</span>
                  </button>
                </div>

                {capturedImage && (
                  <div className="relative h-44 rounded-2xl overflow-hidden border border-emerald-300 bg-gray-100">
                    <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setCapturedImage(null)}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 shadow"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* 4. Anti-Fraud Barcode Preview */}
              <div className="space-y-2 pt-3 border-t border-gray-100">
                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                  <Barcode className="w-4 h-4 text-emerald-700" />
                  <span>4. Unique Batch Serial Barcode</span>
                </h3>
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-mono">AUTOMATIC ANTI-FRAUD IDENTIFIER:</span>
                    <span className="font-mono font-black text-sm text-emerald-950 tracking-wider">
                      {generatedBarcode}
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-bold bg-emerald-100 px-2 py-1 rounded">
                    Tamper Proof
                  </span>
                </div>
              </div>

              {/* 5. Government Lab Tested Organic Certificate */}
              <div className="space-y-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-700" />
                    <span>5. Lab Tested Organic Certification</span>
                  </h3>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-emerald-800">
                    <input
                      type="checkbox"
                      checked={isOrganic}
                      onChange={(e) => setIsOrganic(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>100% Organic Batch</span>
                  </label>
                </div>

                {isOrganic && (
                  <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold mb-1">NPOP / NABL Certificate Number</label>
                        <input
                          type="text"
                          value={labCertificateNo}
                          onChange={(e) => setLabCertificateNo(e.target.value)}
                          className="w-full p-2.5 border border-gray-300 rounded-xl bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-1">Testing Laboratory Name</label>
                        <input
                          type="text"
                          value={labName}
                          onChange={(e) => setLabName(e.target.value)}
                          className="w-full p-2.5 border border-gray-300 rounded-xl bg-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold mb-1">Test Date</label>
                        <input
                          type="text"
                          value={labTestDate}
                          onChange={(e) => setLabTestDate(e.target.value)}
                          className="w-full p-2.5 border border-gray-300 rounded-xl bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-1">Pesticide Residue Analysis Result</label>
                        <input
                          type="text"
                          value={labResidueResult}
                          onChange={(e) => setLabResidueResult(e.target.value)}
                          className="w-full p-2.5 border border-gray-300 rounded-xl bg-white font-semibold text-emerald-950"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-gray-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className="flex-1 py-3 rounded-xl border border-gray-300 font-bold hover:bg-gray-50 text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-black shadow-lg transition"
                >
                  {submitting ? 'Verifying & Publishing Batch...' : 'Publish Produce to Marketplace'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =========================================================================
            TAB 3: AI FORECASTING
        ========================================================================= */}
        {activeTab === 'forecast' && (
          <div className="space-y-6 text-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest block">
                  Algorithmic Mandi Intelligence
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-0.5">
                  AI Spot Price &amp; Demand Forecasting
                </h2>
                <p className="text-gray-500 mt-0.5">
                  Real-time APMC arrivals, seasonal weather patterns, and predictive price trajectory for the next 14-30 days.
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-gray-100 self-start md:self-auto">
                {forecasts.map((f) => (
                  <button
                    key={f.commodity}
                    onClick={() => setSelectedCommodity(f.commodity)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                      selectedCommodity.toLowerCase() === f.commodity.toLowerCase()
                        ? 'bg-emerald-800 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {f.commodity}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
                <span className="text-gray-400 font-bold block">Current Mandi Rate</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-gray-900">₹{currentForecast?.currentPrice}</span>
                  <span className="text-gray-500">/ kg</span>
                </div>
                <p className="text-gray-500 text-[11px]">{currentForecast?.mandi}</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
                <span className="text-gray-400 font-bold block">14-Day AI Projected Rate</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-800">
                    ₹{currentForecast?.projectedPrices?.[currentForecast?.projectedPrices.length - 1]?.price || '48'}
                  </span>
                  <span className="text-gray-500">/ kg</span>
                </div>
                <p className="text-emerald-700 font-bold text-[11px]">
                  ▲ {currentForecast?.projectedChange || '+18.4% Surge'}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
                <span className="text-gray-400 font-bold block">Confidence Level</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-gray-900">{currentForecast?.confidence || '94%'}</span>
                </div>
                <p className="text-gray-500 text-[11px]">Trained on 5 years of historical APMC data</p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm space-y-1">
                <span className="text-emerald-900 font-bold block">AI Harvest Recommendation</span>
                <p className="text-sm font-black text-emerald-950">
                  {currentForecast?.recommendation || 'Hold harvest for 7 days to capture festival demand surge'}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="font-black text-base text-gray-900">14-Day Price Forecast Breakdown for {currentForecast?.commodity}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {currentForecast?.projectedPrices?.map((p: any, idx: number) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-center space-y-1">
                    <span className="text-[10px] text-gray-400 block font-semibold">{p.date}</span>
                    <span className="text-base font-black text-emerald-950 block">₹{p.price}</span>
                    <span className="text-[10px] text-emerald-700 font-bold block">
                      {p.price > currentForecast.currentPrice ? `+₹${p.price - currentForecast.currentPrice}` : 'Stable'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: INSTITUTIONAL TENDERS
        ========================================================================= */}
        {activeTab === 'tenders' && (
          <div className="space-y-6 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest block">
                  Bulk Procurement Gateway
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-0.5">
                  Government &amp; Institutional Tenders
                </h2>
                <p className="text-gray-500 mt-0.5">
                  Direct contracts from FCI, Nafed, Reliance Retail, BigBasket &amp; State Aggregators.
                </p>
              </div>
              <a
                href="https://etenders.gov.in"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 font-bold flex items-center gap-1.5 self-start sm:self-auto"
              >
                <span>Official etenders.gov.in</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="space-y-4">
              {tenders.map((tender) => (
                <div
                  key={tender.tenderId}
                  className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-900 font-mono font-bold text-[10px]">
                        {tender.tenderId}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                        ● {tender.status}
                      </span>
                      <span className="text-gray-400">|</span>
                      <span className="text-gray-600 font-bold">{tender.issuingAuthority}</span>
                    </div>

                    <h3 className="font-black text-base text-gray-900">{tender.title}</h3>
                    <p className="text-gray-500 text-[11px]">{tender.description}</p>

                    <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-gray-600">
                      <span><strong>Procurement Target:</strong> {tender.quantity}</span>
                      <span><strong>Max Budget / Rate:</strong> {tender.benchmarkRate}</span>
                      <span><strong>Submission Deadline:</strong> {tender.deadline}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                    <button
                      onClick={() => {
                        setSelectedTender(tender);
                        setTenderBidPrice(tender.benchmarkRate?.replace(/\D/g, '') || '2800');
                        setTenderBidQty('10');
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold rounded-xl shadow-md transition"
                    >
                      Submit Farmer Bid
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* BID SUBMISSION MODAL */}
            {selectedTender && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-4 text-xs animate-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <div>
                      <h3 className="font-black text-base text-gray-900">Submit Tender Bid Quote</h3>
                      <p className="text-[11px] text-gray-500">{selectedTender.tenderId} - {selectedTender.title}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedTender(null)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {biddingSuccess ? (
                    <div className="py-6 text-center space-y-2">
                      <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                      <p className="font-bold text-gray-900">Bid Successfully Registered!</p>
                      <p className="text-[11px] text-gray-500">Official receipt generated under Kisan ID {verifiedKisanId}</p>
                    </div>
                  ) : (
                    <form onSubmit={handleTenderBidSubmit} className="space-y-3">
                      <div>
                        <label className="block font-bold mb-1">Your Quoted Rate (₹ / Quintal)</label>
                        <input
                          type="number"
                          required
                          value={tenderBidPrice}
                          onChange={(e) => setTenderBidPrice(e.target.value)}
                          className="w-full p-2.5 border border-gray-300 rounded-xl font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-1">Supply Volume You Can Deliver (Tonnes)</label>
                        <input
                          type="number"
                          required
                          value={tenderBidQty}
                          onChange={(e) => setTenderBidQty(e.target.value)}
                          className="w-full p-2.5 border border-gray-300 rounded-xl"
                        />
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-[11px]">
                        Bidder: <strong>{farmerName}</strong> (Kisan ID: {verifiedKisanId})
                      </div>
                      <div className="pt-2 flex gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedTender(null)}
                          className="flex-1 py-2.5 border border-gray-300 rounded-xl font-bold hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-md transition"
                        >
                          Confirm &amp; Place Bid
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 5: LOGISTICS WITH INTERACTIVE TRANSIT MAP
        ========================================================================= */}
        {activeTab === 'logistics' && (
          <div className="space-y-6 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest block">
                  Farm-Gate Cold Chain &amp; Route Clustering
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-0.5">
                  Live Logistics &amp; Highway Transit Map
                </h2>
                <p className="text-gray-500 mt-0.5">
                  Real-time GPS fleet tracking, EV route clustering, and temperature monitored cold-chain dispatches.
                </p>
              </div>

              <div className="flex items-center gap-2 p-1 rounded-2xl bg-gray-100 self-start sm:self-auto">
                <button
                  onClick={() => setLogisticsOptimized(false)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition ${
                    !logisticsOptimized ? 'bg-red-500 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Uncoordinated
                </button>
                <button
                  onClick={() => setLogisticsOptimized(true)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition ${
                    logisticsOptimized ? 'bg-emerald-800 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  CropNex Clustered
                </button>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-1">
                <span className="text-gray-400 font-bold block">Corridor Fleet Distance</span>
                <span className="text-2xl font-black text-gray-900">
                  {logisticsOptimized ? '164 km' : '210 km'}
                </span>
                <p className={`text-[11px] font-bold ${logisticsOptimized ? 'text-emerald-700' : 'text-red-500'}`}>
                  {logisticsOptimized ? '▼ 46 km (-21.9%) Saved' : 'Multiple uncoordinated runs'}
                </p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-1">
                <span className="text-gray-400 font-bold block">Freight Cost per Kg</span>
                <span className="text-2xl font-black text-emerald-950">
                  {logisticsOptimized ? '₹1.15 / kg' : '₹2.40 / kg'}
                </span>
                <p className="text-emerald-700 font-semibold text-[11px]">Save 52% on transport freight</p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-1">
                <span className="text-gray-400 font-bold block">Reefer Cold Temp</span>
                <span className="text-2xl font-black text-emerald-950">4.2°C</span>
                <p className="text-emerald-700 font-semibold text-[11px]">Optimal for Freshness</p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-1">
                <span className="text-gray-400 font-bold block">Active Fleet Vehicles</span>
                <span className="text-2xl font-black text-gray-900">8 Agri-Trucks</span>
                <p className="text-emerald-700 font-semibold text-[11px]">GPS Live Connected</p>
              </div>
            </div>

            {/* Map View Switcher: Interactive Map vs Schematic Vector */}
            <div className="flex items-center justify-between gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-200">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-700" />
                <span className="font-bold text-gray-900 text-xs">Agri-Transit Corridor Map Engine:</span>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-200/70 p-1 rounded-xl">
                <button
                  onClick={() => setLogisticsMapMode('interactive')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    logisticsMapMode === 'interactive'
                      ? 'bg-emerald-800 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span>🗺️ Live GPS Interactive Map</span>
                </button>
                <button
                  onClick={() => setLogisticsMapMode('schematic')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    logisticsMapMode === 'schematic'
                      ? 'bg-emerald-800 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span>📐 Schematic Flow</span>
                </button>
              </div>
            </div>

            {/* RENDER ACTIVE MAP ENGINE */}
            {logisticsMapMode === 'interactive' ? (
              <LiveTransitMap
                isOptimized={logisticsOptimized}
                onSelectHub={(hub) => setSelectedHub(hub)}
              />
            ) : (
              /* SCHEMATIC HIGHWAY MAP CANVAS */
              <div className="bg-[#0e2a1b] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800/60 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-[#f59e0b]" />
                    <h3 className="font-black text-base text-white">Live Agri-Corridor Route Map (Nashik – Pune – Mumbai)</h3>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-emerald-300">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>Live GPS Pulse</span>
                    </span>
                    <span>Corridor: NH-60 &amp; NH-3 (Samruddhi Mahamarg)</span>
                  </div>
                </div>

                {/* SVG Map Illustration */}
                <div className="relative bg-[#071910] rounded-2xl p-4 border border-emerald-900/60 overflow-hidden">
                <svg viewBox="0 0 900 340" className="w-full h-auto">
                  <defs>
                    <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="50%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="glow" />
                      <feComposite in="SourceGraphic" in2="glow" operator="over" />
                    </filter>
                  </defs>

                  {/* Grid Lines */}
                  <g stroke="#0f3d26" strokeWidth="0.5" strokeDasharray="3,3">
                    <line x1="0" y1="80" x2="900" y2="80" />
                    <line x1="0" y1="160" x2="900" y2="160" />
                    <line x1="0" y1="240" x2="900" y2="240" />
                    <line x1="200" y1="0" x2="200" y2="340" />
                    <line x1="400" y1="0" x2="400" y2="340" />
                    <line x1="600" y1="0" x2="600" y2="340" />
                    <line x1="800" y1="0" x2="800" y2="340" />
                  </g>

                  {/* Highway Path */}
                  <path
                    d="M 120 70 Q 280 90 400 150 T 650 210 T 820 270"
                    fill="none"
                    stroke={logisticsOptimized ? 'url(#routeGrad)' : '#ef4444'}
                    strokeWidth={logisticsOptimized ? '6' : '3'}
                    strokeLinecap="round"
                    filter="url(#glow)"
                  />

                  {/* Uncoordinated detour path (if not optimized) */}
                  {!logisticsOptimized && (
                    <path
                      d="M 120 70 Q 180 200 400 150 T 520 70 T 820 270"
                      fill="none"
                      stroke="#f87171"
                      strokeWidth="2"
                      strokeDasharray="4,4"
                    />
                  )}

                  {/* Moving Animated Vehicle on Route */}
                  <circle cx="400" cy="150" r="7" fill="#f59e0b">
                    <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
                  </circle>

                  {/* Hub 1: Pimpalgaon Baswant (Nashik) */}
                  <g transform="translate(120, 70)" className="cursor-pointer" onClick={() => setSelectedHub('Pimpalgaon Baswant Farm-Gate Hub')}>
                    <circle r="12" fill="#0e2a1b" stroke="#f59e0b" strokeWidth="3" />
                    <circle r="5" fill="#f59e0b" />
                    <text x="18" y="5" fill="#ffffff" fontSize="13" fontWeight="bold">1. Pimpalgaon Farm Hub (Nashik)</text>
                    <text x="18" y="20" fill="#a7f3d0" fontSize="10">Origin • Tomato &amp; Vegetables (20.16° N)</text>
                  </g>

                  {/* Hub 2: Lasalgaon APMC */}
                  <g transform="translate(250, 85)" className="cursor-pointer" onClick={() => setSelectedHub('Lasalgaon Mandi Consolidated Point')}>
                    <circle r="10" fill="#0e2a1b" stroke="#10b981" strokeWidth="2.5" />
                    <circle r="4" fill="#10b981" />
                    <text x="-15" y="-15" fill="#ffffff" fontSize="12" fontWeight="bold">2. Lasalgaon Mandi</text>
                    <text x="-15" y="-3" fill="#a7f3d0" fontSize="9">Asia's Onion Hub</text>
                  </g>

                  {/* Hub 3: Sangamner Mid-Corridor */}
                  <g transform="translate(400, 150)" className="cursor-pointer" onClick={() => setSelectedHub('Sangamner Mid-Corridor Cross-Dock')}>
                    <circle r="12" fill="#0e2a1b" stroke="#10b981" strokeWidth="3" />
                    <circle r="5" fill="#10b981" />
                    <text x="18" y="5" fill="#ffffff" fontSize="13" fontWeight="bold">3. Sangamner Cross-Dock Hub</text>
                    <text x="18" y="20" fill="#a7f3d0" fontSize="10">Cold Storage &amp; EV Charging (NH-60)</text>
                  </g>

                  {/* Hub 4: Narayangaon Polyhouse */}
                  <g transform="translate(620, 205)" className="cursor-pointer" onClick={() => setSelectedHub('Narayangaon Polyhouse Cluster Hub')}>
                    <circle r="10" fill="#0e2a1b" stroke="#10b981" strokeWidth="2.5" />
                    <circle r="4" fill="#10b981" />
                    <text x="18" y="5" fill="#ffffff" fontSize="12" fontWeight="bold">4. Narayangaon Polyhouse Cluster</text>
                    <text x="18" y="18" fill="#a7f3d0" fontSize="9">Pune Rural • Exotics &amp; Capsicum</text>
                  </g>

                  {/* Hub 5: Mumbai Vashi APMC Terminal */}
                  <g transform="translate(820, 270)" className="cursor-pointer" onClick={() => setSelectedHub('Vashi APMC Urban Retail Terminal')}>
                    <circle r="14" fill="#0e2a1b" stroke="#3b82f6" strokeWidth="4" />
                    <circle r="6" fill="#3b82f6" />
                    <text x="-160" y="-10" fill="#60a5fa" fontSize="13" fontWeight="black">5. Vashi Mumbai APMC Terminal</text>
                    <text x="-160" y="5" fill="#bfdbfe" fontSize="10">Urban Consumer &amp; Retail Consignee Hub</text>
                  </g>
                </svg>
              </div>

              {/* Selected Hub Details Bar */}
              <div className="p-4 bg-emerald-950/80 rounded-2xl border border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#f59e0b] font-bold uppercase tracking-wider block">Selected Transit Node</span>
                  <h4 className="font-bold text-white text-sm">{selectedHub}</h4>
                  <p className="text-emerald-300 text-[11px]">Direct telemetry linked with carrier reefer units and live dispatch scales.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-800 text-white rounded-lg font-bold">Cold Lock: Active</span>
                  <button
                    onClick={() => showToast(`Logistics manifest downloaded for ${selectedHub}`)}
                    className="px-3 py-1 bg-[#f59e0b] hover:bg-[#d97706] text-slate-900 rounded-lg font-bold transition"
                  >
                    View Manifest
                  </button>
                </div>
              </div>
            </div>
          )}

            {/* Hubs Listing */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 space-y-4">
              <h3 className="font-black text-base text-gray-900">Nearby Farm-Gate Cross-Dock Hubs (Nashik &amp; Pune)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Pimpalgaon Baswant Farm-Gate Hub', district: 'Nashik', crops: 'Hybrid Tomato, Capsicum', capacity: '45 Tonnes/day' },
                  { name: 'Lasalgaon Mandi Consolidated Point', district: 'Nashik', crops: 'Garwa Red Onion', capacity: '120 Tonnes/day' },
                  { name: 'Sangamner Mid-Corridor Hub', district: 'Ahmednagar', crops: 'Horticulture & Dairy', capacity: '60 Tonnes/day' },
                  { name: 'Narayangaon Polyhouse Cluster Hub', district: 'Pune Rural', crops: 'Exotics, Turmeric, Pulses', capacity: '35 Tonnes/day' },
                ].map((hub, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-gray-900 text-sm">{hub.name}</h4>
                      <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded">
                        Active Hub
                      </span>
                    </div>
                    <p className="text-gray-600">District: {hub.district} • Commodities: {hub.crops}</p>
                    <p className="text-emerald-800 font-semibold text-[11px]">Daily Throughput: {hub.capacity}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 6: BUYER ORDERS (WITH PRODUCT IMAGES)
        ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6 text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900">Incoming Buyer Orders to Fulfill</h2>
                <p className="text-gray-500 mt-0.5">Manage crate packing, carrier pickups, and dispatch status with produce photos.</p>
              </div>
            </div>

            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id || order.orderNumber}
                  className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-gray-900">Order #{order.orderNumber}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          order.status === 'Pending'
                            ? 'bg-amber-100 text-amber-800'
                            : order.status === 'Accepted'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'Dispatched'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        ● {order.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-emerald-950">
                        ₹{order.totalAmount?.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-gray-400 block">{order.paymentMethod}</span>
                    </div>
                  </div>

                  {/* Buyer & Destination */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-600 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    <div>
                      <span className="text-gray-400 block text-[10px]">Buyer Name &amp; Contact:</span>
                      <strong className="text-gray-900">{order.buyerName}</strong> ({order.buyerPhone || '+91 98210 55001'})
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Destination Address:</span>
                      <span className="text-gray-800 font-medium">{order.deliveryAddress}</span>
                    </div>
                  </div>

                  {/* PRODUCT CARDS WITH IMAGES */}
                  <div className="space-y-2">
                    <span className="font-bold text-gray-800 text-[11px] block">Items in this Consignment:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {order.items?.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-gray-200 shadow-sm"
                        >
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=200&q=80'}
                            alt={item.name}
                            className="w-16 h-16 rounded-xl object-cover border border-gray-200 shrink-0"
                          />
                          <div className="space-y-0.5 flex-1">
                            <h4 className="font-bold text-gray-900 text-xs leading-tight">{item.name}</h4>
                            <p className="text-gray-500 text-[11px]">
                              Quantity: <strong>{item.quantity} {item.unit || 'kg'}</strong>
                            </p>
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-emerald-800 font-bold text-[11px]">
                                ₹{item.pricePerKg} / {item.unit || 'kg'}
                              </span>
                              <span className="font-black text-gray-900 text-xs">
                                ₹{item.total || item.pricePerKg * item.quantity}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                    {order.status === 'Pending' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id || order.orderNumber, 'Accepted')}
                        className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl transition"
                      >
                        Accept Order
                      </button>
                    )}
                    {order.status === 'Accepted' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id || order.orderNumber, 'Dispatched')}
                        className="px-4 py-2 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold rounded-xl transition"
                      >
                        Mark Dispatched
                      </button>
                    )}
                    {order.status === 'Dispatched' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id || order.orderNumber, 'Delivered')}
                        className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl transition"
                      >
                        Mark Delivered
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 7: RETURN ORDERS (WITH PRODUCT & DAMAGED PROOF IMAGES)
        ========================================================================= */}
        {activeTab === 'returns' && (
          <div className="space-y-6 text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest block">
                  Reverse Logistics &amp; Crop Insurance
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-0.5">
                  Return Orders &amp; Transit Claims (RTO)
                </h2>
                <p className="text-gray-500 mt-0.5">
                  Inspect damaged produce photos, verify carrier dispute claims, and settle escrow insurance refunds.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {returnOrders.map((ret) => (
                <div
                  key={ret.returnId}
                  className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-950 bg-gray-100 px-2.5 py-0.5 rounded">
                        {ret.returnId}
                      </span>
                      <span className="text-gray-500">Ref: {ret.orderNumber}</span>
                      <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                        ● {ret.status}
                      </span>
                    </div>
                    <span className="text-gray-400">{ret.date}</span>
                  </div>

                  {/* 2 PHOTOS: ORIGINAL PRODUCT VS BUYER UPLOADED PROOF */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Photo 1: Original Harvested Product */}
                    <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 flex items-start gap-3">
                      <img
                        src={ret.productImage}
                        alt={ret.produce}
                        className="w-20 h-20 rounded-xl object-cover border border-gray-300 shrink-0"
                      />
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-400 font-bold uppercase block">1. Original Dispatched Produce</span>
                        <h4 className="font-black text-gray-900 text-sm">{ret.produce}</h4>
                        <p className="text-gray-600">Dispatched Volume: <strong>{ret.quantity}</strong></p>
                        <p className="text-emerald-800 font-semibold text-[11px]">Kisan ID: {verifiedKisanId}</p>
                      </div>
                    </div>

                    {/* Photo 2: Customer's Uploaded Damaged Proof Photo */}
                    <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-3">
                      <div className="relative group cursor-pointer" onClick={() => setInspectingProof(ret)}>
                        <img
                          src={ret.damagedProofImage}
                          alt="Damaged Proof"
                          className="w-20 h-20 rounded-xl object-cover border-2 border-amber-400 shrink-0 group-hover:opacity-90 transition"
                        />
                        <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white">
                          <Eye className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="space-y-1 flex-1">
                        <span className="text-[10px] text-amber-800 font-bold uppercase block">
                          2. Buyer Uploaded Damaged Proof Photo
                        </span>
                        <p className="font-bold text-gray-900 text-xs">{ret.buyerName}</p>
                        <button
                          type="button"
                          onClick={() => setInspectingProof(ret)}
                          className="text-[#d97706] font-bold hover:underline flex items-center gap-1 text-[11px]"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Click to Inspect High-Res Photo</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Return Reason Box */}
                  <div className="p-3.5 rounded-2xl bg-red-50/60 border border-red-200 space-y-1">
                    <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block">
                      Reported Return Reason:
                    </span>
                    <p className="font-bold text-red-950 text-xs">{ret.reason}</p>
                    <p className="text-gray-600 text-[11px] leading-relaxed pt-1">
                      <strong>Customer Remarks:</strong> &quot;{ret.buyerRemarks}&quot;
                    </p>
                  </div>

                  {/* Details & Actions Footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-gray-400 block text-[10px]">Transit Insurance Claim:</span>
                        <span className="text-base font-black text-emerald-950">{ret.claimAmount}</span>
                      </div>
                      <div className="h-6 w-px bg-gray-200" />
                      <div>
                        <span className="text-gray-400 block text-[10px]">Action Status:</span>
                        <span className="font-bold text-gray-800">{ret.actionNeeded}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => showToast(`Approved replacement for ${ret.returnId}`)}
                        className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl transition"
                      >
                        Approve Claim
                      </button>
                      <button
                        onClick={() => showToast(`Dispute logged with courier partner for ${ret.returnId}`)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition"
                      >
                        Dispute Carrier
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ZOOM RETURN PROOF MODAL */}
            {inspectingProof && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                <div className="w-full max-w-xl bg-white rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <div>
                      <h3 className="font-black text-base text-gray-900">Buyer Uploaded Return Proof Inspection</h3>
                      <p className="text-[11px] text-gray-500">{inspectingProof.returnId} • {inspectingProof.produce}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setInspectingProof(null)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="h-72 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                    <img
                      src={inspectingProof.damagedProofImage}
                      alt="Full Proof"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1 text-xs">
                    <p><strong>Customer:</strong> {inspectingProof.buyerName} ({inspectingProof.buyerPhone})</p>
                    <p><strong>Reported Reason:</strong> {inspectingProof.reason}</p>
                    <p className="text-gray-500 text-[11px]">Remarks: {inspectingProof.buyerRemarks}</p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setInspectingProof(null)}
                      className="px-5 py-2 bg-gray-800 text-white rounded-xl font-bold"
                    >
                      Close Inspection
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

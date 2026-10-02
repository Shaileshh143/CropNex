'use client';

import React, { useState, useEffect } from 'react';
import {
  Sprout,
  Plus,
  Package,
  TrendingUp,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  X,
  Phone,
  Calendar,
  Layers,
} from 'lucide-react';
import { ProductItem, INITIAL_PRODUCTS, INITIAL_ORDERS } from '@/lib/initialData';

export default function FarmerDashboard() {
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<any[]>(INITIAL_ORDERS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form for adding new produce
  const [newProduce, setNewProduce] = useState({
    name: '',
    category: 'Vegetables',
    pricePerKg: '',
    availableQuantity: '',
    minOrderQuantity: '20',
    unit: 'kg',
    grade: 'Grade A',
    farmLocation: 'Pimpalgaon Baswant',
    district: 'Nashik',
    farmerName: 'Dnyaneshwar Patil',
    farmerPhone: '+91 98221 44521',
    harvestDate: 'Fresh harvested today',
    organic: false,
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    description: '',
    shelfLifeDays: '10',
  });

  useEffect(() => {
    fetchData();
  }, []);

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
      console.warn('Dashboard fetch fallback', e);
    }
  };

  const handleAddProduce = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduce),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddModalOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error('Error adding produce', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          note: `Order updated to ${nextStatus} by Farmer Dnyaneshwar Patil`,
          location: 'Nashik Dispatch Hub',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((ord) =>
            ord.id === orderId || ord.orderNumber === orderId
              ? { ...ord, status: nextStatus }
              : ord
          )
        );
      }
    } catch (err) {
      console.error('Error updating order status', err);
    }
  };

  const totalInventoryKg = products.reduce((acc, p) => acc + (Number(p.availableQuantity) || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
  const activeOrders = orders.filter((o) => ['Pending', 'Accepted', 'Dispatched'].includes(o.status)).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">👨‍🌾</span>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Verified Farmer Hub
            </span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 mt-1">
            Farmer Produce &amp; Order Dashboard
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Welcome back, Dnyaneshwar Patil (Pimpalgaon Baswant, Nashik). Manage direct farm listings and incoming buyer contracts.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>List New Farm Produce</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Farm Inventory</span>
            <Package className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-gray-900">{totalInventoryKg.toLocaleString('en-IN')} kg</p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Across {products.length} live crop varieties</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Orders</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-amber-600">{pendingOrders}</p>
          <p className="text-xs text-gray-500 mt-1">Awaiting farm-gate acceptance</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Direct Realization</span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-emerald-700">₹3,42,000</p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">+38% higher than APMC intermediary</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Mandi Escrow Status</span>
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-black text-blue-600">100%</p>
          <p className="text-xs text-gray-500 mt-1">Guaranteed direct bank settlement</p>
        </div>
      </div>

      {/* Incoming Buyer Orders Section */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-black text-gray-900">Incoming Buyer Orders &amp; Dispatch</h2>
            <p className="text-xs text-gray-500">Advance order stages from acceptance to vehicle loading</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800">
            {activeOrders} Active Direct Orders
          </span>
        </div>

        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id || order.orderNumber}
              className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-100 text-emerald-900">
                    {order.orderNumber}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">{order.buyerName}</h4>
                    <p className="text-[11px] text-gray-500">
                      📍 {order.deliveryAddress} ({order.district})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-sm font-black text-emerald-800">
                      ₹{order.totalAmount?.toLocaleString('en-IN')}
                    </span>
                    <p className="text-[10px] text-gray-400">Escrow: {order.paymentMethod}</p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                      order.status === 'Pending'
                        ? 'bg-amber-100 text-amber-800'
                        : order.status === 'Accepted'
                        ? 'bg-blue-100 text-blue-800'
                        : order.status === 'Dispatched'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Items row */}
              <div className="flex flex-wrap gap-2 text-xs">
                {order.items?.map((item: any, idx: number) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-700 text-[11px]"
                  >
                    📦 {item.name}: <strong>{item.quantity} {item.unit || 'kg'}</strong> (₹{item.total})
                  </span>
                ))}
              </div>

              {/* Status Action Buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2 text-xs">
                {order.status === 'Pending' && (
                  <button
                    onClick={() => handleUpdateStatus(order.id || order.orderNumber, 'Accepted')}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Accept Order</span>
                  </button>
                )}

                {order.status === 'Accepted' && (
                  <button
                    onClick={() => handleUpdateStatus(order.id || order.orderNumber, 'Dispatched')}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition flex items-center gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Dispatch Farm Produce</span>
                  </button>
                )}

                {order.status === 'Dispatched' && (
                  <button
                    onClick={() => handleUpdateStatus(order.id || order.orderNumber, 'Delivered')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark as Delivered</span>
                  </button>
                )}

                {order.status === 'Delivered' && (
                  <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Order Completed &amp; Escrow Released
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Farm Inventory Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
        <h2 className="text-lg font-black text-gray-900">Your Active Farm Produce Listings</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Produce</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Rate / Kg</th>
                <th className="pb-3">Available Stock</th>
                <th className="pb-3">Grading</th>
                <th className="pb-3">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition">
                  <td className="py-3.5 flex items-center gap-3">
                    <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover" />
                    <div>
                      <p className="font-bold text-gray-900">{p.name}</p>
                      <p className="text-[10px] text-gray-400">{p.harvestDate}</p>
                    </div>
                  </td>
                  <td className="py-3.5 text-gray-600">{p.category}</td>
                  <td className="py-3.5 font-bold text-emerald-700">₹{p.pricePerKg}</td>
                  <td className="py-3.5 font-semibold text-gray-900">{p.availableQuantity} {p.unit}</td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {p.grade}
                    </span>
                  </td>
                  <td className="py-3.5 text-gray-500">{p.farmLocation}, {p.district}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD PRODUCE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-black text-gray-900">List New Farm Produce</h3>
                <p className="text-xs text-gray-500">Directly published to CropNex Marketplace &amp; MongoDB</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduce} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Crop / Commodity Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sharbati Wheat, Hybrid Tomato"
                  value={newProduce.name}
                  onChange={(e) => setNewProduce({ ...newProduce, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={newProduce.category}
                    onChange={(e) => setNewProduce({ ...newProduce, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white"
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Grains">Grains</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Spices">Spices</option>
                    <option value="Pulses">Pulses</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Quality Grading</label>
                  <select
                    value={newProduce.grade}
                    onChange={(e) => setNewProduce({ ...newProduce, grade: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white"
                  >
                    <option value="Grade A+">Grade A+ (Premium Export)</option>
                    <option value="Grade A">Grade A (Standard APMC)</option>
                    <option value="Grade B">Grade B (Processing Quality)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Farm-Gate Price (₹/kg)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 35"
                    value={newProduce.pricePerKg}
                    onChange={(e) => setNewProduce({ ...newProduce, pricePerKg: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Available Quantity (kg)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1500"
                    value={newProduce.availableQuantity}
                    onChange={(e) => setNewProduce({ ...newProduce, availableQuantity: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Farm Location</label>
                  <input
                    type="text"
                    required
                    value={newProduce.farmLocation}
                    onChange={(e) => setNewProduce({ ...newProduce, farmLocation: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">District</label>
                  <select
                    value={newProduce.district}
                    onChange={(e) => setNewProduce({ ...newProduce, district: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white"
                  >
                    <option value="Nashik">Nashik</option>
                    <option value="Pune">Pune</option>
                    <option value="Solapur">Solapur</option>
                    <option value="Kolhapur">Kolhapur</option>
                    <option value="Latur">Latur</option>
                    <option value="Ratnagiri">Ratnagiri</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Produce Photo URL</label>
                <input
                  type="url"
                  required
                  value={newProduce.image}
                  onChange={(e) => setNewProduce({ ...newProduce, image: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700 pt-1">
                <input
                  type="checkbox"
                  checked={newProduce.organic}
                  onChange={(e) => setNewProduce({ ...newProduce, organic: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600"
                />
                <span>🌿 Certified Organic Farm Produce</span>
              </label>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold disabled:opacity-50 transition"
                >
                  {submitting ? 'Saving to MongoDB...' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

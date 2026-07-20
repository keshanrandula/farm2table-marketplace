"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminPromosPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState(null);
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minOrderAmount: "0",
    maxDiscountAmount: "0",
    validUntil: "",
    usageLimit: "100"
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const u = JSON.parse(stored);
          if (u.role !== "admin") {
            router.push("/login");
            return;
          }
          setAdminUser(u);
          fetchPromos();
        } catch (e) {
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
    }
  }, [router]);

  async function fetchPromos() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/promos");
      const data = await res.json();
      if (data.success) {
        setPromos(data.data);
      }
    } catch (err) {
      console.error("Error fetching promos:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreatePromo = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discountValue || !formData.validUntil) {
      alert("කරුණාකර අවශ්‍ය සියලුම ක්ෂේත්‍ර පුරවන්න");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/promos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ Promo Code successfully created!");
        setShowModal(false);
        setFormData({
          code: "",
          discountType: "percentage",
          discountValue: "",
          minOrderAmount: "0",
          maxDiscountAmount: "0",
          validUntil: "",
          usageLimit: "100"
        });
        fetchPromos();
      } else {
        alert(data.error || "Failed to create promo code");
      }
    } catch (err) {
      alert("Error creating promo code");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (promoId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "disabled" : "active";
    try {
      const res = await fetch("/api/admin/promos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promoId, status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchPromos();
      }
    } catch (err) {
      alert("Error toggling promo status");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto space-y-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/30 backdrop-blur-md text-emerald-200 text-xs font-bold uppercase tracking-wider">
              Marketing & Coupons Portal
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Promo Codes & Discounts</h1>
            <p className="text-emerald-100 text-sm max-w-xl">
              හෝටල් සහ ගැනුම්කරුවන් සඳහා විශේෂ ප්‍රවර්ධන (Promo Codes / Coupons) සූදානම් කර Checkout එකේදී වට්ටම් ලබාදෙන්න.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="relative z-10 flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black px-6 py-3.5 rounded-2xl shadow-lg transition duration-200 cursor-pointer text-sm"
          >
            <span>✨ Create New Promo Code</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl font-bold">
              🏷️
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Active Coupons</p>
              <h3 className="text-2xl font-black">{promos.filter(p => p.status === 'active').length}</h3>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl font-bold">
              📊
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Redemptions</p>
              <h3 className="text-2xl font-black">{promos.reduce((acc, p) => acc + (p.timesUsed || 0), 0)}</h3>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl font-bold">
              🎁
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Issued</p>
              <h3 className="text-2xl font-black">{promos.length}</h3>
            </div>
          </div>
        </div>

        {/* Promo Codes Table */}
        {loading ? (
          <div className="py-20 text-center space-y-4">
            <div className="inline-block h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium">Loading Promo Codes...</p>
          </div>
        ) : promos.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
            <span className="text-5xl block">🎟️</span>
            <h3 className="text-xl font-bold">No Promo Codes Created</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              පද්ධතියේ තවම කිසිදු ප්‍රවර්ධන කේතයක් නොමැත. "Create New Promo Code" බොත්තම ඔබා පළමු Coupon එක සකස් කරන්න.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900/50">
                    <th className="py-4 px-6">Promo Code</th>
                    <th className="py-4 px-6">Discount Value</th>
                    <th className="py-4 px-6">Min Order</th>
                    <th className="py-4 px-6">Expiry Date</th>
                    <th className="py-4 px-6 text-center">Usage</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 font-semibold">
                  {promos.map((p) => {
                    const isExpired = new Date(p.validUntil) < new Date();

                    return (
                      <tr key={p._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/40 transition">
                        <td className="py-4 px-6 font-mono font-black text-emerald-600 dark:text-emerald-400 text-base">
                          {p.code}
                        </td>
                        <td className="py-4 px-6 font-bold">
                          {p.discountType === "percentage" ? `${p.discountValue}% OFF` : `Rs. ${p.discountValue} OFF`}
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-500">
                          {p.minOrderAmount > 0 ? `Rs. ${p.minOrderAmount}` : "None"}
                        </td>
                        <td className="py-4 px-6 text-xs font-bold text-amber-600">
                          📅 {new Date(p.validUntil).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-center font-bold text-xs">
                          {p.timesUsed} / {p.usageLimit}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                            isExpired ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300" :
                            p.status === "active" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {isExpired ? "EXPIRED" : p.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleToggleStatus(p._id, p.status)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                              p.status === "active"
                                ? "bg-amber-50 text-amber-800 border border-amber-200"
                                : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            }`}
                          >
                            {p.status === "active" ? "Disable" : "Enable"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal for Creating Promo Code */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-700 space-y-6 relative">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">✨ Create Promo Code</h3>
                  <p className="text-xs text-gray-500">වට්ටම් කේතයේ විස්තර සකස් කරන්න</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreatePromo} className="space-y-4 text-sm">
                <div>
                  <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">Promo Code (e.g. HOTEL10) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WELCOME2026"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 font-mono font-extrabold text-emerald-600 uppercase focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">Discount Type</label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (Rs.)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">Value (% or Rs.) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 10"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">Min Order (Rs.)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={formData.minOrderAmount}
                      onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">Max Cap (Rs.)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={formData.maxDiscountAmount}
                      onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">Expiry Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">Usage Limit</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="100"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? "Creating..." : "Save Promo Code"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

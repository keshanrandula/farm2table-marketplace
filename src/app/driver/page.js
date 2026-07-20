"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PodModal from "@/components/PodModal";

export default function DriverDashboard() {
  const router = useRouter();
  const [lang, setLang] = useState("si");
  const [driverId, setDriverId] = useState("");
  const [availableOrders, setAvailableOrders] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedPodOrder, setSelectedPodOrder] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          if (u.role !== "driver") {
            router.push("/login");
            return;
          }
          setDriverId(u.id || u._id || "");
        } catch (e) {
          console.error("Error parsing user session:", e);
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
    }
  }, [router]);

  const fetchData = async () => {
    if (!driverId) return;
    setLoading(true);
    try {
      // 1. Available orders (prepared, driverId = null)
      const availRes = await fetch("/api/orders?unassigned=true");
      const availData = await availRes.json();
      if (availData.success) {
        setAvailableOrders(availData.data);
      }

      // 2. Assigned orders
      const assignedRes = await fetch(`/api/orders?driverId=${driverId}`);
      const assignedData = await assignedRes.json();
      if (assignedData.success) {
        const active = assignedData.data.filter(
          (o) => o.status === "prepared" || o.status === "shipped"
        );
        const completed = assignedData.data.filter(
          (o) => o.status === "completed" || o.status === "delivered"
        );
        setActiveOrders(active);
        setCompletedOrders(completed);
      }
    } catch (err) {
      console.error("Error fetching driver data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [driverId]);

  const handleAcceptOrder = async (orderId) => {
    setActionLoading(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to accept order");
      }
      alert(lang === "si" ? "ඇණවුම සාර්ථකව භාරගන්නා ලදී!" : "Order accepted successfully!");
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setActionLoading(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update status");
      }
      alert(
        lang === "si"
          ? "ඇණවුමේ තත්ත්වය සාර්ථකව යාවත්කාලීන කරන ලදී!"
          : "Order status updated successfully!"
      );
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const text = {
    si: {
      welcome: "සාදරයෙන් පිළිගනිමු, ප්‍රවාහන සහකරු! 🏍️",
      subtitle: "අද දිනයේ ඔබ සඳහා ඇති බෙදාහැරීම් සහ ඇණවුම් ලැයිස්තුව.",
      statAvailable: "ලබාගත හැකි ඇණවුම්",
      statActive: "ක්‍රියාකාරී බෙදාහැරීම්",
      statCompleted: "නිමකළ බෙදාහැරීම්",
      tabAvailable: "බෙදාහැරීම් පුවරුව (Available)",
      tabActive: "මගේ ක්‍රියාකාරී බෙදාහැරීම් (Active)",
      orderNo: "ඇණවුම් අංකය",
      pickupLoc: "ගොවිපල ලිපිනය (Pickup)",
      deliveryLoc: "හෝටල් ලිපිනය (Delivery)",
      items: "භාණ්ඩ ලැයිස්තුව",
      totalEarn: "ප්‍රවාහන ගාස්තුව",
      acceptBtn: "ඇණවුම භාරගන්න",
      pickupBtn: "ලබාගත් බව සලකුණු කරන්න",
      deliverBtn: "භාරදුන් බව සලකුණු කරන්න",
      loading: "දත්ත පූරණය වෙමින් පවතී...",
      noAvailable: "ලබාගත හැකි කිසිදු ඇණවුමක් දැනට නැත.",
      noActive: "ඔබ දැනට කිසිදු ඇණවුමක් භාරගෙන නැත.",
      statusPrepared: "ලබාගැනීමට සූදානම්",
      statusShipped: "ප්‍රවාහනය වෙමින් පවතී",
    },
    en: {
      welcome: "Welcome Back, Delivery Partner! 🏍️",
      subtitle: "Manage your active wholesale shipments and view available delivery jobs.",
      statAvailable: "Available Jobs",
      statActive: "Active Shipments",
      statCompleted: "Completed Deliveries",
      tabAvailable: "Delivery Job Board",
      tabActive: "My Active Deliveries",
      orderNo: "Order ID",
      pickupLoc: "Farm Address (Pickup)",
      deliveryLoc: "Hotel Address (Delivery)",
      items: "Harvest Items",
      totalEarn: "Delivery Fee",
      acceptBtn: "Accept Delivery",
      pickupBtn: "Mark as Picked Up",
      deliverBtn: "Mark as Delivered",
      loading: "Loading delivery data...",
      noAvailable: "No available delivery jobs at the moment.",
      noActive: "You have no active deliveries assigned.",
      statusPrepared: "Ready for Pickup",
      statusShipped: "In Transit",
    },
  };

  const t = text[lang];

  return (
    <div className="space-y-8 relative pb-12 text-gray-800">
      {/* Language Toggle */}
      <button
        onClick={() => setLang(lang === "si" ? "en" : "si")}
        className="absolute top-0 right-0 bg-white border border-gray-200 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer hover:bg-gray-50 transition shadow-sm z-10"
      >
        {lang === "si" ? "English 🌐" : "සිංහල 🌐"}
      </button>

      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t.welcome}</h1>
        <p className="text-sm text-gray-500 mt-1">{t.subtitle}</p>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Stat Card 1 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-650 text-indigo-600 flex items-center justify-center text-xl font-bold">
            📋
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.statAvailable}</p>
            <p className="text-2xl font-black text-gray-900 mt-0.5">{availableOrders.length}</p>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold">
            🚚
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.statActive}</p>
            <p className="text-2xl font-black text-gray-900 mt-0.5">{activeOrders.length}</p>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-green-50 text-green-650 text-green-650 flex items-center justify-center text-xl font-bold">
            ✅
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.statCompleted}</p>
            <p className="text-2xl font-black text-gray-900 mt-0.5">{completedOrders.length}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold text-sm">{t.loading}</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Active Deliveries Section */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>🏍️</span> {t.tabActive}
            </h3>

            {activeOrders.length === 0 ? (
              <div className="py-12 text-center text-gray-400 font-medium bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                {t.noActive}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activeOrders.map((order) => {
                  // Find farmer information (usually inside items)
                  const farmerName = order.items?.[0]?.cropId?.farmerId?.name || "Farmer Partner";
                  const farmerLoc = order.items?.[0]?.cropId?.location || "Farm Site";

                  return (
                    <div key={order._id} className="border border-gray-100 rounded-2xl p-5 bg-white shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                        <span className="font-mono text-xs text-gray-550 font-bold">
                          #{order._id.substring(order._id.length - 8).toUpperCase()}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          order.status === "prepared" 
                            ? "bg-indigo-50 text-indigo-700 border-indigo-100" 
                            : "bg-blue-50 text-blue-700 border-blue-100"
                        }`}>
                          {order.status === "prepared" ? t.statusPrepared : t.statusShipped}
                        </span>
                      </div>

                      <div className="space-y-3 text-sm">
                        {/* Pickup */}
                        <div className="flex gap-2">
                          <span className="text-base shrink-0">🟢</span>
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.pickupLoc}</p>
                            <p className="font-bold text-gray-950">{farmerName}</p>
                            <p className="text-xs text-gray-550">{farmerLoc}</p>
                          </div>
                        </div>

                        {/* Delivery */}
                        <div className="flex gap-2">
                          <span className="text-base shrink-0">🔴</span>
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.deliveryLoc}</p>
                            <p className="font-bold text-gray-900">{order.buyerId?.name || "B2B Client"}</p>
                            <p className="text-xs text-gray-555 text-gray-500">{order.buyerLocation} ({order.distance || 0} km)</p>
                          </div>
                        </div>

                        {/* Items */}
                        <div className="border-t border-gray-50 pt-3">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t.items}</p>
                          <div className="flex flex-wrap gap-2">
                            {order.items.map((item, index) => (
                              <span key={index} className="text-xs bg-gray-50 border border-gray-100 rounded-lg px-2 py-1 font-semibold text-gray-700">
                                🥬 {item.name} ({item.quantity} kg)
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-gray-50 pt-4 gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t.totalEarn}</p>
                          <p className="text-lg font-black text-indigo-650 text-indigo-600 font-bold">LKR {order.deliveryFee}</p>
                        </div>

                        {order.status === "prepared" ? (
                          <button
                            onClick={() => handleUpdateStatus(order._id, "shipped")}
                            disabled={actionLoading === order._id}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition cursor-pointer"
                          >
                            {actionLoading === order._id ? "..." : t.pickupBtn}
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedPodOrder(order)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                          >
                            <span>✍️</span>
                            <span>{t.deliverBtn} (POD)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Available Jobs / Board Section */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>📋</span> {t.tabAvailable}
            </h3>

            {availableOrders.length === 0 ? (
              <div className="py-12 text-center text-gray-400 font-medium bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                {t.noAvailable}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {availableOrders.map((order) => {
                  // Find farmer information (usually inside items)
                  const farmerName = order.items?.[0]?.cropId?.farmerId?.name || "Farmer Partner";
                  const farmerLoc = order.items?.[0]?.cropId?.location || "Farm Site";

                  return (
                    <div key={order._id} className="border border-gray-100 rounded-2xl p-5 bg-white shadow-sm space-y-4 hover:border-indigo-100 transition">
                      <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                        <span className="font-mono text-xs text-gray-550 font-bold">
                          #{order._id.substring(order._id.length - 8).toUpperCase()}
                        </span>
                        <span className="text-[10px] text-gray-400 font-semibold">
                          📅 {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="space-y-3 text-sm">
                        {/* Pickup */}
                        <div className="flex gap-2">
                          <span className="text-base shrink-0">🟢</span>
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.pickupLoc}</p>
                            <p className="font-bold text-gray-900">{farmerName}</p>
                            <p className="text-xs text-gray-550">{farmerLoc}</p>
                          </div>
                        </div>

                        {/* Delivery */}
                        <div className="flex gap-2">
                          <span className="text-base shrink-0">🔴</span>
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.deliveryLoc}</p>
                            <p className="font-bold text-gray-900">{order.buyerId?.name || "B2B Client"}</p>
                            <p className="text-xs text-gray-555 text-gray-500">{order.buyerLocation} ({order.distance || 0} km)</p>
                          </div>
                        </div>

                        {/* Items */}
                        <div className="border-t border-gray-50 pt-3">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t.items}</p>
                          <div className="flex flex-wrap gap-2">
                            {order.items.map((item, index) => (
                              <span key={index} className="text-xs bg-gray-50 border border-gray-100 rounded-lg px-2 py-1 font-semibold text-gray-700">
                                🥬 {item.name} ({item.quantity} kg)
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-gray-50 pt-4 gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t.totalEarn}</p>
                          <p className="text-lg font-black text-indigo-650 text-indigo-600 font-bold">LKR {order.deliveryFee}</p>
                        </div>

                        <button
                          onClick={() => handleAcceptOrder(order._id)}
                          disabled={actionLoading === order._id}
                          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition cursor-pointer"
                        >
                          {actionLoading === order._id ? "..." : t.acceptBtn}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

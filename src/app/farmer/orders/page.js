"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function FarmerOrders() {
  const router = useRouter();
  const { lang, setLang } = useLanguage();
  const [farmerId, setFarmerId] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updateLoading, setUpdateLoading] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          if (u.role !== "farmer") {
            router.push("/login");
            return;
          }
          setFarmerId(u.id || u._id || "");
        } catch (e) {
          console.error("Error parsing user session:", e);
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
    }
  }, [router]);

  useEffect(() => {
    if (!farmerId) return;

    async function fetchFarmerOrders() {
      try {
        const res = await fetch(`/api/orders?farmerId=${farmerId}`);
        const data = await res.json();
        if (data.success) {
          setOrders(data.data);
        } else {
          throw new Error(data.error || "Failed to fetch orders");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchFarmerOrders();
  }, [farmerId]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdateLoading(orderId);
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
      
      // Update local state
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdateLoading(null);
    }
  };

  const text = {
    si: {
      title: "ඇණවුම් කළමනාකරණය",
      subtitle: "පාරිභෝගිකයින් සහ හෝටල් විසින් ඔබගේ අස්වනු සඳහා ලබාදී ඇති ඇණවුම් මෙතැනින් බලන්න.",
      tableId: "ඇණවුම් අංකය",
      tableBuyer: "මිලදී ගන්නා",
      tableCrops: "අස්වනු වර්ග",
      tableTotal: "මුළු වටිනාකම",
      tableStatus: "තත්ත්වය",
      tableAction: "ක්‍රියාකාරකම්",
      statusPending: "ලැබී ඇත",
      statusPrepared: "සූදානම් කර ඇත",
      statusShipped: "ප්‍රවාහනය වෙමින්",
      statusDelivered: "භාරදී ඇත",
      statusCompleted: "නිමවා ඇත",
      statusCancelled: "අවලංගුයි",
      btnShip: "ප්‍රවාහනයට යොමු කරන්න",
      btnPrepare: "සූදානම් බව සලකුණු කරන්න",
      btnDeliver: "භාරදුන් බව සලකුණු කරන්න",
      btnComplete: "නිම කරන්න",
      loading: "ඇණවුම් ලැයිස්තුව පූරණය වෙමින් පවතී...",
      noOrders: "තවමත් කිසිදු ඇණවුමක් ලැබී නැත.",
      error: "දෝෂයකි: ",
      yourItems: "ඔබේ අස්වනු",
      totalEarned: "ඔබට ලැබෙන මුදල",
      kg: "Kg",
      perKg: "රු",
      waitingDriver: "ප්‍රවාහකයා එනතුරු",
      inTransit: "ප්‍රවාහනයේ",
    },
    en: {
      title: "Farmer Order Management",
      subtitle: "View and manage bulk orders placed for your fresh farm listings.",
      tableId: "Order ID",
      tableBuyer: "Buyer",
      tableCrops: "Produce Items",
      tableTotal: "Farmer Share",
      tableStatus: "Status",
      tableAction: "Actions",
      statusPending: "Pending",
      statusPrepared: "Prepared",
      statusShipped: "Shipped",
      statusDelivered: "Delivered",
      statusCompleted: "Completed",
      statusCancelled: "Cancelled",
      btnShip: "Mark as Shipped",
      btnPrepare: "Mark as Prepared",
      btnDeliver: "Mark as Delivered",
      btnComplete: "Complete Order",
      loading: "Loading order listings...",
      noOrders: "No orders received yet.",
      error: "Error: ",
      yourItems: "Your Harvest Items",
      totalEarned: "Farmer Total",
      kg: "Kg",
      perKg: "LKR",
      waitingDriver: "Waiting for Driver",
      inTransit: "In Transit",
    }
  };

  const t = text[lang];

  return (
    <div className="space-y-8 relative pb-12">
      {/* Language Toggle */}
      <button
        onClick={() => setLang(lang === "si" ? "en" : "si")}
        className="absolute top-0 right-0 bg-white border border-gray-200 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer hover:bg-gray-50 transition shadow-sm"
      >
        {lang === "si" ? "English 🌐" : "සිංහල 🌐"}
      </button>

      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t.title}</h1>
        <p className="text-sm text-gray-550 text-gray-500 mt-1">{t.subtitle}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-semibold shadow-sm">
          {t.error} {error}
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center">
          <div className="h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold text-sm">{t.loading}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center text-gray-400 font-medium bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <span className="text-5xl block mb-3">📦</span>
          {t.noOrders}
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-4 px-4">{t.tableId}</th>
                  <th className="py-4 px-4">{t.tableBuyer}</th>
                  <th className="py-4 px-4">{t.tableCrops}</th>
                  <th className="py-4 px-4">{t.tableTotal}</th>
                  <th className="py-4 px-4">{t.tableStatus}</th>
                  <th className="py-4 px-4 text-center">{t.tableAction}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm font-semibold text-gray-700">
                {orders.map((order) => {
                  // Filter items belonging to this farmer
                  const farmerItems = order.items.filter(item => {
                    const itemFarmerId = item.cropId?.farmerId?._id || item.cropId?.farmerId || item.cropId;
                    return !item.cropId?.farmerId || itemFarmerId === farmerId;
                  });

                  const farmerTotal = farmerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

                  return (
                    <tr key={order._id} className="hover:bg-gray-50/50 transition">
                      <td className="py-4 px-4 font-mono text-xs text-gray-500">
                        #{order._id.substring(order._id.length - 8).toUpperCase()}
                        <span className="text-[10px] text-gray-400 block font-sans font-semibold mt-0.5">
                          📅 {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-gray-900 block">{order.buyerId?.name || "B2B Client"}</span>
                        <span className="text-xs text-gray-400 block mt-0.5">{order.buyerId?.email || ""}</span>
                        {order.buyerLocation && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5 inline-block font-extrabold mt-1.5">
                            🚚 Ship to: {order.buyerLocation}
                          </span>
                        )}
                        {order.driverId && (
                          <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-full px-2 py-0.5 inline-block font-extrabold mt-1">
                            🏍️ {lang === "si" ? "ප්‍රවාහකයා" : "Driver"}: {order.driverId.name || "Assigned"}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1 max-w-xs">
                          {farmerItems.map((item, index) => (
                            <div key={index} className="text-xs flex items-center justify-between text-gray-600 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1">
                              <span>🌾 {item.name}</span>
                              <span className="font-bold text-gray-900">{item.quantity} {t.kg}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-emerald-600 font-black">{t.perKg} {farmerTotal.toLocaleString()}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                          order.status === "pending"
                            ? "bg-amber-50 text-amber-700 border-amber-100"
                            : order.status === "prepared"
                            ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                            : order.status === "shipped"
                            ? "bg-blue-50 text-blue-700 border-blue-100"
                            : order.status === "completed" || order.status === "delivered"
                            ? "bg-green-50 text-green-700 border-green-100"
                            : "bg-red-50 text-red-600 border-red-100"
                        }`}>
                          {order.status === "pending" ? t.statusPending :
                           order.status === "prepared" ? t.statusPrepared :
                           order.status === "shipped" ? t.statusShipped :
                           order.status === "completed" || order.status === "delivered" ? t.statusDelivered :
                           t.statusCancelled}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {order.status === "pending" && (
                            <button
                              onClick={() => handleUpdateStatus(order._id, "prepared")}
                              disabled={updateLoading === order._id}
                              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white text-xs font-bold py-2 px-3 rounded-lg shadow-sm cursor-pointer transition"
                            >
                              {updateLoading === order._id ? "..." : t.btnPrepare}
                            </button>
                          )}
                          {order.status === "prepared" && (
                            <span className="text-xs text-indigo-600 font-bold bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg">
                              {order.driverId ? (lang === "si" ? "ප්‍රවාහකයා පැමිණෙන තෙක්" : "Driver Assigned") : t.waitingDriver}
                            </span>
                          )}
                          {order.status === "shipped" && (
                            <span className="text-xs text-blue-600 font-bold bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg">
                              {t.inTransit}
                            </span>
                          )}
                          {(order.status === "completed" || order.status === "delivered" || order.status === "cancelled") && (
                            <span className="text-xs font-semibold text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

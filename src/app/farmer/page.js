"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function FarmerDashboard() {
  const router = useRouter();
  const [crops, setCrops] = useState([]);
  const [orders, setOrders] = useState([]);
  const [farmerId, setFarmerId] = useState("");
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState("si");

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
          return;
        }
      } else {
        router.push("/login");
        return;
      }
    }
  }, [router]);

  useEffect(() => {
    if (!farmerId) return;

    async function fetchFarmerDashboardData() {
      setLoading(true);
      try {
        const cropsRes = await fetch(`/api/crops?farmerId=${farmerId}`);
        const cropsData = await cropsRes.json();
        if (cropsData.success) {
          setCrops(cropsData.data);
        }

        const ordersRes = await fetch(`/api/orders?farmerId=${farmerId}`);
        const ordersData = await ordersRes.json();
        if (ordersData.success) {
          setOrders(ordersData.data);
        }
      } catch (err) {
        console.error("Error fetching farmer dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchFarmerDashboardData();
  }, [farmerId]);

  const text = {
    si: {
      welcome: "සාදරයෙන් පිළිගනිමු, ගොවි මහතා! 🧑‍🌾",
      subtitle: "අද දවසේ ඔබේ ගොවිපල දත්ත සහ අස්වනු සාරාංශය මෙන්න.",
      stat1: "මුළු අස්වනු ලැයිස්තුව",
      stat2: "මුළු තොග ප්‍රමාණය",
      stat3: "ඇස්තමේන්තුගත ආදායම",
      stat4: "භාරදීමට ඇති ඇණවුම්",
      recentTitle: "මෑතකදී එක් කරන ලද අස්වනු",
      tableCrop: "අස්වැන්න",
      tablePrice: "මිල (රු/Kg)",
      tableQty: "ප්‍රමාණය (Kg)",
      tableLoc: "ස්ථානය",
      tableStatus: "තත්ත්වය",
      statusAvailable: "ලබාගත හැක",
      statusSoldOut: "අවසන් වී ඇත",
      addBtn: "නව අස්වැන්නක් ඇතුළත් කරන්න",
      noCrops: "තවමත් අස්වනු ඇතුළත් කර නැත.",
      loading: "දත්ත පූරණය වෙමින් පවතී...",
    },
    en: {
      welcome: "Welcome Back, Farmer! 🧑‍🌾",
      subtitle: "Here's an overview of your farm listings and activity today.",
      stat1: "Total Crops Listed",
      stat2: "Total Available Stock",
      stat3: "Estimated Earnings",
      stat4: "Pending Delivery",
      recentTitle: "Recently Added Crops",
      tableCrop: "Crop Name",
      tablePrice: "Price per Kg",
      tableQty: "Quantity (Kg)",
      tableLoc: "Location",
      tableStatus: "Status",
      statusAvailable: "Available",
      statusSoldOut: "Sold Out",
      addBtn: "Add New Crop",
      noCrops: "No crops listed yet.",
      loading: "Loading data...",
    }
  };

  const t = text[lang];

  // Calculate stats based on crops
  const totalCrops = crops.length;
  const totalQuantity = crops.reduce((sum, crop) => sum + (crop.quantity || 0), 0);
  const estimatedRevenue = crops.reduce((sum, crop) => sum + ((crop.price || 0) * (crop.quantity || 0)), 0);

  return (
    <div className="space-y-8 relative">
      {/* Language Toggle */}
      <button
        onClick={() => setLang(lang === "si" ? "en" : "si")}
        className="absolute top-0 right-0 bg-white border border-gray-200 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer hover:bg-gray-50 transition shadow-sm"
      >
        {lang === "si" ? "English 🌐" : "සිංහල 🌐"}
      </button>

      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t.welcome}</h1>
        <p className="text-sm text-gray-500 mt-1">{t.subtitle}</p>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat Card 1 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
            🌾
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.stat1}</p>
            <p className="text-2xl font-black text-gray-900 mt-0.5">{totalCrops}</p>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
            📦
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.stat2}</p>
            <p className="text-2xl font-black text-gray-900 mt-0.5">{totalQuantity} Kg</p>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
            💰
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.stat3}</p>
            <p className="text-2xl font-black text-gray-900 mt-0.5">LKR {estimatedRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Stat Card 4 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
            🚚
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.stat4}</p>
            <p className="text-2xl font-black text-gray-900 mt-0.5">
              {orders.filter(o => o.status === "pending" || o.status === "shipped").length}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Crops Table */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-bold text-gray-900">{t.recentTitle}</h3>
          <Link href="/farmer/add-crop">
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md shadow-emerald-100 transition cursor-pointer">
              + {t.addBtn}
            </button>
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500 font-medium">{t.loading}</div>
        ) : crops.length === 0 ? (
          <div className="py-12 text-center text-gray-400 font-medium bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            {t.noCrops}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">{t.tableCrop}</th>
                  <th className="py-3.5 px-4">{t.tablePrice}</th>
                  <th className="py-3.5 px-4">{t.tableQty}</th>
                  <th className="py-3.5 px-4">{t.tableLoc}</th>
                  <th className="py-3.5 px-4">{t.tableStatus}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm font-semibold text-gray-700">
                {crops.map((crop) => (
                  <tr key={crop._id} className="hover:bg-gray-50/50 transition">
                    <td className="py-4 px-4 font-bold text-gray-950">{crop.name}</td>
                    <td className="py-4 px-4 text-emerald-600">LKR {crop.price}</td>
                    <td className="py-4 px-4">{crop.quantity} Kg</td>
                    <td className="py-4 px-4 text-gray-500">{crop.location}{crop.address ? ` (${crop.address})` : ""}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                        crop.status === "available"
                          ? "bg-green-50 text-green-700 border border-green-100"
                          : "bg-red-50 text-red-600 border border-red-100"
                      }`}>
                        {crop.status === "available" ? t.statusAvailable : t.statusSoldOut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

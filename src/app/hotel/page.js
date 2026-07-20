"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FarmerMap from "@/components/FarmerMap";

export default function HotelWholesale() {
  const router = useRouter();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState("si");
  const [buyerId, setBuyerId] = useState("");
  
  // Cart items indexed by cropId: { cropId, name, quantity, price, stockLimit }
  const [cart, setCart] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  
  const [orderError, setOrderError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState("");
  const [orderLoading, setOrderLoading] = useState(false);

  // Map & View states
  const [viewMode, setViewMode] = useState("catalog"); // "catalog" or "map"
  const [selectedFarm, setSelectedFarm] = useState({ isOpen: false, locationName: "", crops: [] });
  const [frequency, setFrequency] = useState("once"); // "once", "weekly", "monthly"

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          if (u.role !== "hotel") {
            router.push("/login");
            return;
          }
          setBuyerId(u.id || u._id || "");
        } catch (e) {
          console.error("Error parsing user:", e);
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
    }
  }, [router]);

  const text = {
    si: {
      title: "B2B තොග ඇණවුම් මධ්‍යස්ථානය",
      subtitle: "හෝටල් සහ අවන්හල් සඳහා නැවුම් එළවළු සහ කෘෂි අස්වනු තොග මිලට සෘජුවම ලබාගැනීම.",
      tableCrop: "අස්වැන්න",
      tableStock: "තිබෙන ප්‍රමාණය",
      tablePrice: "කිලෝවක මිල",
      tableFarmer: "ගොවියා",
      cartTitle: "තොග ඇණවුම් ලැයිස්තුව (Bulk Cart)",
      cartEmpty: "තවමත් අස්වනු ඇතුළත් කර නැත.",
      cartTotal: "ඇස්තමේන්තුගත මුදල",
      placeOrder: "තොග ඇණවුම ඉදිරිපත් කරන්න",
      placeOrderLoading: "ඇණවුම සකසමින්...",
      exceedError: "තොග සීමාව ඉක්මවා ඇත!",
      qtyPlaceholder: "ප්‍රමාණය (Kg)",
      kg: "Kg",
      successMsg: "ඔබේ තොග ඇණවුම සාර්ථකව ලැබුණි! යොමු කෙරේ...",
      failedMsg: "ඇණවුම ඉදිරිපත් කිරීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.",
      noCrops: "මිලදී ගැනීමට අස්වනු නොමැත.",
      loading: "අස්වනු තොරතුරු පූරණය වෙමින් පවතී..."
    },
    en: {
      title: "B2B Wholesale Ordering Panel",
      subtitle: "Direct-from-farm premium produce bulk orders at negotiated rates for hotels & kitchens.",
      tableCrop: "Produce",
      tableStock: "Farmer Stock",
      tablePrice: "Price per Kg",
      tableFarmer: "Farmer",
      cartTitle: "Pre-Order Bulk Cart",
      cartEmpty: "No wholesale items added to cart yet.",
      cartTotal: "Wholesale Total Amount",
      placeOrder: "Place Bulk Order",
      placeOrderLoading: "Processing Order...",
      exceedError: "Exceeds available stock!",
      qtyPlaceholder: "Qty (Kg)",
      kg: "Kg",
      successMsg: "Wholesale order placed successfully! Redirecting...",
      failedMsg: "Wholesale order failed. Please check inputs and try again.",
      noCrops: "No wholesale crops currently listed.",
      loading: "Fetching wholesale catalog..."
    }
  };

  const t = text[lang];

  useEffect(() => {
    async function fetchCrops() {
      try {
        const res = await fetch("/api/crops");
        const data = await res.json();
        if (data.success) {
          setCrops(data.data);
        }
      } catch (err) {
        console.error("Wholesale fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCrops();
  }, []);

  const handleQtyChange = (crop, val) => {
    const qty = Number(val);
    const cropId = crop._id;

    if (qty <= 0) {
      // Remove from cart
      setCart((prev) => {
        const copy = { ...prev };
        delete copy[cropId];
        return copy;
      });
      setValidationErrors((prev) => {
        const copy = { ...prev };
        delete copy[cropId];
        return copy;
      });
      return;
    }

    // Check stock limit
    if (qty > crop.quantity) {
      setValidationErrors((prev) => ({
        ...prev,
        [cropId]: `${t.exceedError} (Max: ${crop.quantity} Kg)`
      }));
    } else {
      setValidationErrors((prev) => {
        const copy = { ...prev };
        delete copy[cropId];
        return copy;
      });
    }

    setCart((prev) => ({
      ...prev,
      [cropId]: {
        cropId,
        name: crop.name,
        quantity: qty,
        price: crop.price,
        stockLimit: crop.quantity
      }
    }));
  };

  // Calculate totals
  const cartItems = Object.values(cart);
  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const hasErrors = Object.keys(validationErrors).length > 0;
  const isCartEmpty = cartItems.length === 0;

  const handleSubmitOrder = async () => {
    if (isCartEmpty || hasErrors || orderLoading) return;
    setOrderLoading(true);
    setOrderError("");
    setOrderSuccess("");

    // Fallback buyerId for testing
    const activeBuyerId = buyerId || "60c72b2f9b1d8b22a07c1b53";

    try {
      const isSubscription = frequency === "weekly" || frequency === "monthly";
      const endpoint = isSubscription ? "/api/subscriptions" : "/api/orders";
      
      const payload = {
        buyerId: activeBuyerId,
        items: cartItems,
        totalAmount
      };
      
      if (isSubscription) {
        payload.frequency = frequency;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t.failedMsg);
      }

      setOrderSuccess(
        isSubscription
          ? (lang === "si" ? "දායකත්ව ඇණවුම සාර්ථකව පිහිටුවන ලදී! යොමු කෙරේ..." : "Recurring subscription established successfully! Redirecting...")
          : t.successMsg
      );
      setCart({});
      setValidationErrors({});
      setFrequency("once");
      
      // Reload page / redirect after success
      setTimeout(() => {
        router.push(isSubscription ? "/hotel/subscriptions" : "/hotel/orders");
        setOrderSuccess("");
      }, 2000);
    } catch (err) {
      setOrderError(err.message);
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Language toggle button */}
      <button
        onClick={() => setLang(lang === "si" ? "en" : "si")}
        className="absolute top-0 right-0 bg-white border border-gray-200 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer hover:bg-gray-50 transition shadow-sm z-10"
      >
        {lang === "si" ? "English 🌐" : "සිංහල 🌐"}
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{t.subtitle}</p>
        </div>
      </div>

      {/* View Mode Toggle Buttons */}
      <div className="flex border-b border-gray-200 gap-6">
        <button
          onClick={() => setViewMode("catalog")}
          className={`pb-3 font-bold text-sm border-b-2 transition cursor-pointer ${
            viewMode === "catalog"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          {lang === "si" ? "ලැයිස්තු දසුන" : "Catalog View"}
        </button>
        <button
          onClick={() => setViewMode("map")}
          className={`pb-3 font-bold text-sm border-b-2 transition cursor-pointer ${
            viewMode === "map"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          {lang === "si" ? "සිතියම් දසුන" : "Map View"}
        </button>
      </div>

      {orderSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3.5 rounded-2xl flex items-center gap-3 text-sm font-semibold shadow-sm animate-in fade-in duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{orderSuccess}</span>
        </div>
      )}

      {orderError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3.5 rounded-2xl flex items-center gap-3 text-sm font-semibold shadow-sm animate-in fade-in duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{orderError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Catalog table OR Map component */}
        {viewMode === "catalog" ? (
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-24 text-center">
                <div className="h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-500 font-semibold text-sm">{t.loading}</p>
              </div>
            ) : crops.length === 0 ? (
              <div className="py-12 text-center text-gray-400 font-medium">{t.noCrops}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <th className="py-4 px-4">{t.tableCrop}</th>
                      <th className="py-4 px-4">{t.tableFarmer}</th>
                      <th className="py-4 px-4">{t.tableStock}</th>
                      <th className="py-4 px-4">{t.tablePrice}</th>
                      <th className="py-4 px-4 w-44">{t.qtyPlaceholder}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm font-semibold text-gray-700">
                    {crops.map((crop) => {
                      const error = validationErrors[crop._id];
                      const isSoldOut = crop.quantity <= 0;
                      return (
                        <tr key={crop._id} className="hover:bg-gray-50/50 transition">
                          <td className="py-4 px-4">
                            <span className="font-bold text-gray-955 block text-gray-900">{crop.name}</span>
                            <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">🏷️ {crop.location}{crop.address ? ` (${crop.address})` : ""}</span>
                          </td>
                          <td className="py-4 px-4 text-xs text-gray-500 font-medium">
                            {crop.farmerId?.name || "Local Farmer"}
                          </td>
                          <td className="py-4 px-4">
                            {isSoldOut ? (
                              <span className="text-xs text-red-655 bg-red-50 px-2 py-0.5 rounded border border-red-100 font-bold uppercase text-red-600">Sold Out</span>
                            ) : (
                              <span>{crop.quantity} Kg</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-emerald-600 font-bold">LKR {crop.price}</td>
                          <td className="py-4 px-4">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              placeholder="0"
                              disabled={isSoldOut}
                              value={cart[crop._id]?.quantity || ""}
                              onChange={(e) => handleQtyChange(crop, e.target.value)}
                              className={`w-full px-3 py-2 rounded-xl border text-sm font-bold text-gray-800 focus:outline-none 
                                ${error 
                                  ? "border-red-400 focus:border-red-500 bg-red-50/20" 
                                  : "border-gray-200 focus:border-emerald-500 bg-gray-50/30"
                                }
                              `}
                            />
                            {error && (
                              <p className="text-[10px] text-red-650 mt-1 font-bold leading-tight">{error}</p>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="lg:col-span-2">
            <FarmerMap 
              crops={crops} 
              onSelectFarm={(locCrops, locName) => setSelectedFarm({ isOpen: true, locationName: locName, crops: locCrops })} 
              lang={lang} 
            />
          </div>
        )}

        {/* Right Column: Pre-order cart panel */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-fit">
          <div>
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3.5 mb-4">{t.cartTitle}</h3>
            
            {isCartEmpty ? (
              <p className="text-xs text-gray-400 py-12 text-center font-medium bg-gray-50 rounded-2xl border border-dashed border-gray-200">{t.cartEmpty}</p>
            ) : (
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {cartItems.map((item) => {
                  const hasErr = validationErrors[item.cropId];
                  return (
                    <div key={item.cropId} className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${hasErr ? "border-red-200 bg-red-50/10" : "border-gray-100 hover:bg-gray-50/50"}`}>
                      <div>
                        <h4 className="font-bold text-gray-955 text-sm leading-snug">{item.name}</h4>
                        <p className="text-[11px] text-gray-400 font-semibold mt-1">
                          LKR {item.price} × {item.quantity} {t.kg}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-sm text-emerald-600 block">LKR {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-8 border-t border-gray-100 pt-5 space-y-4">
            
            {!isCartEmpty && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">
                  {lang === "si" ? "ඇණවුම් වාර ගණන (Order Frequency)" : "Order Schedule / Frequency"}
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-150 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:border-emerald-500"
                >
                  <option value="once">📦 {lang === "si" ? "තනි ඇණවුමක් (One-time Order)" : "One-time Order"}</option>
                  <option value="weekly">📅 {lang === "si" ? "සතිපතා දායකත්වය (Weekly Order)" : "Weekly Subscription"}</option>
                  <option value="monthly">📆 {lang === "si" ? "මාසික දායකත්වය (Monthly Order)" : "Monthly Subscription"}</option>
                </select>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.cartTotal}</span>
              <span className="text-2xl font-black text-emerald-600">LKR {totalAmount.toLocaleString()}</span>
            </div>

            <button
              onClick={handleSubmitOrder}
              disabled={isCartEmpty || hasErrors || orderLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-bold py-3.5 rounded-xl transition cursor-pointer shadow-md shadow-emerald-100 text-sm"
            >
              {orderLoading 
                ? t.placeOrderLoading 
                : frequency === "once" 
                  ? t.placeOrder 
                  : (lang === "si" ? "දායකත්ව ඇණවුම සක්‍රිය කරන්න" : "Activate Recurring Pre-Orders")}
            </button>
          </div>
        </div>

      </div>

      {/* Farm Crops Modal Overlay */}
      {selectedFarm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 text-gray-800 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">📍 {selectedFarm.locationName}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{lang === "si" ? "මෙම ස්ථානයේ ඇති අස්වනු ලැයිස්තුව" : "Harvest crops available at this location"}</p>
              </div>
              <button
                onClick={() => setSelectedFarm(prev => ({ ...prev, isOpen: false }))}
                className="text-gray-400 hover:text-gray-600 font-black text-xl cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {selectedFarm.crops.map((crop) => {
                const error = validationErrors[crop._id];
                const isSoldOut = crop.quantity <= 0;
                return (
                  <div key={crop._id} className="p-3.5 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm font-semibold">
                    <div>
                      <span className="font-bold text-gray-950 block">{crop.name}</span>
                      <span className="text-[11px] text-gray-400 font-semibold mt-0.5">🧑‍🌾 {crop.farmerId?.name || "Local Farmer"}</span>
                      <span className="text-xs text-emerald-600 font-black block mt-1.5">LKR {crop.price}/Kg</span>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span className="text-xs text-gray-500 font-bold">
                        {isSoldOut ? (
                          <span className="text-red-655 text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-100">Sold Out</span>
                        ) : (
                          `${crop.quantity} Kg Left`
                        )}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0"
                        disabled={isSoldOut}
                        value={cart[crop._id]?.quantity || ""}
                        onChange={(e) => handleQtyChange(crop, e.target.value)}
                        className={`w-28 px-3 py-1.5 rounded-xl border text-xs font-bold text-gray-800 focus:outline-none bg-white 
                          ${error ? "border-red-400 focus:border-red-500 bg-red-50/25" : "border-gray-200 focus:border-emerald-500"}
                        `}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setSelectedFarm(prev => ({ ...prev, isOpen: false }))}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition cursor-pointer text-sm shadow-md shadow-emerald-50"
            >
              {lang === "si" ? "තහවුරු කරන්න" : "Apply & Close"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

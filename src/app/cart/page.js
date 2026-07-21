"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";

const CITY_COORDS = {
  "Colombo": { lat: 6.9271, lon: 79.8612 },
  "Kandy": { lat: 7.2906, lon: 80.6337 },
  "Nuwara Eliya": { lat: 6.9497, lon: 80.7891 },
  "Jaffna": { lat: 9.6615, lon: 80.0255 },
  "Galle": { lat: 6.0535, lon: 80.2210 },
  "Matara": { lat: 5.9549, lon: 80.5550 },
  "Badulla": { lat: 6.9934, lon: 81.0550 },
  "Anuradhapura": { lat: 8.3114, lon: 80.4037 },
  "Dambulla": { lat: 7.8731, lon: 80.6517 },
  "Negombo": { lat: 7.2089, lon: 79.8484 }
};

const getCoords = (cityName) => {
  if (!cityName) return CITY_COORDS["Colombo"];
  const name = cityName.trim().toLowerCase();
  for (const [key, val] of Object.entries(CITY_COORDS)) {
    if (key.toLowerCase() === name) return val;
  }
  return CITY_COORDS["Nuwara Eliya"]; // Fallback to Nuwara Eliya
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in Km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function ShoppingCart() {
  const router = useRouter();
  const { lang, setLang } = useLanguage();
  const [buyerId, setBuyerId] = useState("");
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [buyerLocation, setBuyerLocation] = useState("Colombo");
  const [buyerRole, setBuyerRole] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [receiptFile, setReceiptFile] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [cardData, setCardData] = useState({ number: "", expiry: "", cvv: "" });

  // Promo Code States
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoError("");
    try {
      const res = await fetch("/api/promos/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoInput, subtotal })
      });
      const data = await res.json();
      if (data.success) {
        setAppliedPromo(data.data);
        setPromoInput("");
      } else {
        setPromoError(data.message || data.error || "Invalid promo code");
      }
    } catch (err) {
      setPromoError("Network error validating promo code");
    } finally {
      setPromoLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          setBuyerId(u.id || u._id || "");
          setBuyerRole(u.role || "");
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
    if (typeof window !== "undefined") {
      const storedCart = localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : {};
      setCart(storedCart);
      setLoading(false);
    }
  }, []);

  const handleQtyChange = (cropId, newQtyVal) => {
    const qty = Number(newQtyVal);
    const item = cart[cropId];
    if (!item) return;

    if (qty <= 0) {
      handleRemoveItem(cropId);
      return;
    }

    // Validate stock
    const errorsCopy = { ...validationErrors };
    if (qty > item.stockLimit) {
      errorsCopy[cropId] = lang === "si" 
        ? `පවතින තොගය ඉක්මවයි! (උපරිම: ${item.stockLimit} Kg)` 
        : `Exceeds available stock! (Max: ${item.stockLimit} Kg)`;
    } else {
      delete errorsCopy[cropId];
    }
    setValidationErrors(errorsCopy);

    const cartCopy = { ...cart };
    cartCopy[cropId] = { ...item, quantity: qty };
    setCart(cartCopy);
    localStorage.setItem("cart", JSON.stringify(cartCopy));
    window.dispatchEvent(new Event("cart-updated"));
  };

  const handleRemoveItem = (cropId) => {
    const cartCopy = { ...cart };
    delete cartCopy[cropId];
    setCart(cartCopy);
    localStorage.setItem("cart", JSON.stringify(cartCopy));

    // Clear validation error if any
    const errorsCopy = { ...validationErrors };
    delete errorsCopy[cropId];
    setValidationErrors(errorsCopy);

    window.dispatchEvent(new Event("cart-updated"));
  };

  const cartItems = Object.values(cart);
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const hasErrors = Object.keys(validationErrors).length > 0;
  const isCartEmpty = cartItems.length === 0;

  // Calculate delivery fee
  const uniqueSources = Array.from(new Set(cartItems.map(item => item.location || 'Nuwara Eliya')));
  const destCoords = CITY_COORDS[buyerLocation] || CITY_COORDS["Colombo"];
  
  let maxDistance = 0;
  let deliveryFee = 0;
  
  uniqueSources.forEach(source => {
    const srcCoords = getCoords(source);
    const dist = calculateDistance(srcCoords.lat, srcCoords.lon, destCoords.lat, destCoords.lon);
    const legFee = 200 + (dist * 10);
    deliveryFee += legFee;
    if (dist > maxDistance) {
      maxDistance = dist;
    }
  });

  const finalDeliveryFee = cartItems.length > 0 ? Math.round(deliveryFee) : 0;
  const finalDistance = Math.round(maxDistance * 10) / 10;

  // B2B Wholesale discount calculation for hotels
  let discountAmount = 0;
  cartItems.forEach(item => {
    let pct = 0;
    if (buyerRole === "hotel") {
      if (item.quantity >= 100) pct = 0.15;
      else if (item.quantity >= 50) pct = 0.10;
      else if (item.quantity >= 20) pct = 0.05;
    }
    discountAmount += Math.round(item.price * item.quantity * pct);
  });

  let couponDiscount = appliedPromo ? appliedPromo.discountAmount : 0;
  let totalDiscount = discountAmount + couponDiscount;
  const grandTotal = Math.max(0, subtotal - totalDiscount + finalDeliveryFee);

  const executeCartCheckout = async (payStatus = "pending", receiptPath = "") => {
    setCheckoutLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const orderPayload = {
      buyerId,
      items: cartItems.map(item => ({
        cropId: item.cropId,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount: grandTotal,
      discountAmount: totalDiscount,
      deliveryFee: finalDeliveryFee,
      distance: finalDistance,
      buyerLocation,
      paymentMethod,
      paymentStatus: payStatus,
      paymentReceipt: receiptPath
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit order");
      }

      setSuccessMsg(lang === "si" ? "ඇණවුම සාර්ථකව සිදු කරන ලදී! යොමු කෙරේ..." : "Order placed successfully! Redirecting...");
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cart-updated"));
      setCart({});
      setModalOpen(false);

      setTimeout(() => {
        router.push("/orders");
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (isCartEmpty || hasErrors || checkoutLoading) return;

    if (paymentMethod === "bank_transfer" && !receiptFile) {
      setErrorMsg(lang === "si" ? "කරුණාකර බැංකු ගෙවීම් රිසිට්පත උඩුගත කරන්න (Mock Upload)." : "Please select/upload a bank receipt file first (Mock Upload).");
      return;
    }

    if (paymentMethod === "card" || paymentMethod === "lankaqr") {
      setModalOpen(true);
    } else {
      await executeCartCheckout("pending", receiptFile);
    }
  };

  const text = {
    si: {
      title: "මගේ සාප්පු සවාරි කරත්තය",
      subtitle: "මිලදී ගැනීමට තෝරාගත් අස්වනු මෙතැනින් කළමනාකරණය කර ඇණවුම් කරන්න.",
      tableCrop: "අස්වැන්න",
      tablePrice: "මිල (Kg)",
      tableQty: "ප්‍රමාණය (Kg)",
      tableTotal: "මුළු මුදල",
      summaryTitle: "ඇණවුම් සාරාංශය",
      summarySubtotal: "අනුකූල මුදල",
      summaryTotal: "ගෙවිය යුතු මුදල",
      btnCheckout: "ඇණවුම ඉදිරිපත් කරන්න",
      btnCheckoutLoading: "සකසමින්...",
      cartEmpty: "කරත්තය හිස්ව පවතී. අස්වනු මිලදී ගැනීමට වෙළඳපොල වෙත යන්න.",
      btnBrowse: "වෙළඳපොල වෙත යන්න",
      loading: "කරත්තය පූරණය වෙමින් පවතී...",
      kg: "Kg",
      perKg: "රු",
      removeBtn: "ඉවත් කරන්න",
      deliveryLabel: "ප්‍රවාහන ගමනාන්තය",
      deliveryFeeLabel: "ප්‍රවාහන ගාස්තුව",
      distanceLabel: "මුළු දුර",
      km: "Km"
    },
    en: {
      title: "My Shopping Cart",
      subtitle: "Review and manage crop items in your cart before submitting checkout.",
      tableCrop: "Produce",
      tablePrice: "Price per Kg",
      tableQty: "Quantity (Kg)",
      tableTotal: "Total Cost",
      summaryTitle: "Order Summary",
      summarySubtotal: "Subtotal",
      summaryTotal: "Total Cost",
      btnCheckout: "Place Checkout Order",
      btnCheckoutLoading: "Processing Checkout...",
      cartEmpty: "Your shopping cart is empty. Explore the marketplace to add listings.",
      btnBrowse: "Browse Marketplace",
      loading: "Loading cart contents...",
      kg: "Kg",
      perKg: "LKR",
      removeBtn: "Remove",
      deliveryLabel: "Delivery Destination",
      deliveryFeeLabel: "Delivery Fee",
      distanceLabel: "Total Distance",
      km: "Km"
    }
  };

  const t = text[lang];

  return (
    <>
      <Navbar lang={lang} setLang={setLang} />
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-8 relative pb-20">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t.title}</h1>
          <p className="text-sm text-gray-550 mt-1">{t.subtitle}</p>
        </div>

        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3.5 rounded-2xl flex items-center gap-3 text-sm font-semibold shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3.5 rounded-2xl flex items-center gap-3 text-sm font-semibold shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center">
            <div className="h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 font-bold text-sm">{t.loading}</p>
          </div>
        ) : isCartEmpty ? (
          <div className="py-16 text-center text-gray-400 font-medium bg-gray-50 rounded-3xl border border-dashed border-gray-200 max-w-2xl mx-auto p-8">
            <span className="text-6xl block mb-4">🛒</span>
            <p className="mb-6 font-semibold">{t.cartEmpty}</p>
            <Link href="/marketplace">
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition cursor-pointer shadow-md">
                {t.btnBrowse}
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Cart Table List */}
            <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm overflow-hidden h-fit">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <th className="py-4 px-4">{t.tableCrop}</th>
                      <th className="py-4 px-4">{t.tablePrice}</th>
                      <th className="py-4 px-4 w-40">{t.tableQty}</th>
                      <th className="py-4 px-4">{t.tableTotal}</th>
                      <th className="py-4 px-4 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm font-semibold text-gray-700">
                    {cartItems.map((item, index) => {
                      const itemId = item.cropId || item._id || item.id || `cart-item-${index}`;
                      const error = validationErrors[itemId] || validationErrors[item.cropId];
                      return (
                        <tr key={itemId} className="hover:bg-gray-50/50 transition">
                          <td className="py-4 px-4">
                            <span className="font-bold text-gray-950 block">{item.name}</span>
                            <span className="text-[10px] text-gray-400 font-bold block mt-0.5">🌾 {item.location || 'Nuwara Eliya'}</span>
                          </td>
                          <td className="py-4 px-4 text-gray-500">
                            {t.perKg} {item.price}
                          </td>
                          <td className="py-4 px-4">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={item.quantity}
                              onChange={(e) => handleQtyChange(item.cropId || itemId, e.target.value)}
                              className={`w-full px-3 py-2 rounded-xl border text-sm font-bold text-gray-800 focus:outline-none 
                                ${error 
                                  ? "border-red-400 focus:border-red-500 bg-red-50/20" 
                                  : "border-gray-200 focus:border-emerald-500 bg-gray-50/30"
                                }
                              `}
                            />
                            {error && (
                              <p className="text-[10px] text-red-600 mt-1 font-bold leading-tight">{error}</p>
                            )}
                          </td>
                          <td className="py-4 px-4 text-emerald-600 font-bold">
                            {t.perKg} {(item.price * item.quantity).toLocaleString()}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => handleRemoveItem(item.cropId || itemId)}
                              className="text-red-500 hover:text-red-700 text-xs font-bold transition cursor-pointer"
                            >
                              {t.removeBtn}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sidebar Summary */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-fit space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3.5 mb-4">{t.summaryTitle}</h3>
                           <div className="space-y-3.5 text-sm font-semibold text-gray-600 border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between">
                    <span>{t.summarySubtotal}</span>
                    <span className="text-gray-950">{t.perKg} {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t.distanceLabel}</span>
                    <span className="text-gray-955">{finalDistance} {t.km}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t.deliveryFeeLabel}</span>
                    <span className="text-emerald-600 font-extrabold">{t.perKg} {finalDeliveryFee.toLocaleString()}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex items-center justify-between text-indigo-700 font-bold">
                      <span>{lang === "si" ? "තොග වට්ටම (Bulk Discount)" : "Bulk Wholesale Discount"}</span>
                      <span>- LKR {discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  {appliedPromo && (
                    <div className="flex items-center justify-between text-emerald-700 font-bold bg-emerald-50 p-2 rounded-xl">
                      <span>🏷️ Promo ({appliedPromo.code}):</span>
                      <span>- LKR {appliedPromo.discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Promo Code Box */}
                <div className="space-y-2 border-t border-gray-100 pt-4">
                  <label className="text-xs font-extrabold text-gray-400 uppercase tracking-wider block">
                    {lang === "si" ? "ප්‍රවර්ධන කේතය (Promo Code)" : "Promo Coupon Code"}
                  </label>
                  {appliedPromo ? (
                    <div className="flex items-center justify-between bg-emerald-100 text-emerald-900 px-3 py-2 rounded-xl text-xs font-bold">
                      <span>✅ Coupon '{appliedPromo.code}' Applied</span>
                      <button onClick={() => setAppliedPromo(null)} className="text-red-600 hover:underline text-[10px]">Remove</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="e.g. HOTEL10"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                        className="flex-1 px-3 py-2 rounded-xl border border-gray-200 uppercase font-mono font-bold text-xs outline-none focus:border-emerald-500"
                      />
                      <button
                        onClick={handleApplyPromo}
                        disabled={promoLoading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-2 rounded-xl transition cursor-pointer disabled:opacity-50"
                      >
                        {promoLoading ? "..." : "Apply"}
                      </button>
                    </div>
                  )}
                  {promoError && (
                    <p className="text-[10px] text-red-600 font-bold leading-tight">{promoError}</p>
                  )}
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2 border-t border-gray-100 pt-4">
                  <label className="text-xs font-extrabold text-gray-400 uppercase tracking-wider block">
                    {lang === "si" ? "ගෙවීම් ක්‍රමය (Payment Method)" : "Payment Method"}
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs font-bold text-gray-750 text-gray-700">
                    <label className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer hover:bg-gray-50 transition ${paymentMethod === 'cod' ? 'border-emerald-500 bg-emerald-50/20' : 'border-gray-200'}`}>
                      <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={() => { setPaymentMethod('cod'); setErrorMsg(''); }} className="accent-emerald-600" />
                      <span>{lang === 'si' ? 'COD' : 'COD'}</span>
                    </label>
                    <label className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer hover:bg-gray-50 transition ${paymentMethod === 'card' ? 'border-emerald-500 bg-emerald-50/20' : 'border-gray-200'}`}>
                      <input type="radio" name="paymentMethod" value="card" checked={paymentMethod === 'card'} onChange={() => { setPaymentMethod('card'); setErrorMsg(''); }} className="accent-emerald-600" />
                      <span>{lang === 'si' ? 'Card (Mock)' : 'Card (Mock)'}</span>
                    </label>
                    <label className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer hover:bg-gray-50 transition ${paymentMethod === 'lankaqr' ? 'border-emerald-500 bg-emerald-50/20' : 'border-gray-200'}`}>
                      <input type="radio" name="paymentMethod" value="lankaqr" checked={paymentMethod === 'lankaqr'} onChange={() => { setPaymentMethod('lankaqr'); setErrorMsg(''); }} className="accent-emerald-600" />
                      <span>{lang === 'si' ? 'LankaQR' : 'LankaQR'}</span>
                    </label>
                    <label className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer hover:bg-gray-50 transition ${paymentMethod === 'bank_transfer' ? 'border-emerald-500 bg-emerald-50/20' : 'border-gray-200'}`}>
                      <input type="radio" name="paymentMethod" value="bank_transfer" checked={paymentMethod === 'bank_transfer'} onChange={() => { setPaymentMethod('bank_transfer'); setErrorMsg(''); }} className="accent-emerald-600" />
                      <span>{lang === 'si' ? 'Bank Transfer' : 'Bank Slip'}</span>
                    </label>
                  </div>
                </div>

                {/* Mock Bank Receipt Upload Field */}
                {paymentMethod === "bank_transfer" && (
                  <div className="space-y-2 border-t border-gray-100 pt-4 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                    <label className="text-xs font-bold text-gray-500 block">
                      {lang === "si" ? "ගෙවීම් රිසිට්පත උඩුගත කරන්න" : "Upload Bank Payment Receipt"}
                    </label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="file" 
                        accept="image/*,.pdf" 
                        id="receipt-upload-cart" 
                        className="hidden" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setReceiptFile(e.target.files[0].name);
                            setErrorMsg("");
                          }
                        }}
                      />
                      <label 
                        htmlFor="receipt-upload-cart" 
                        className="bg-white hover:bg-gray-50 border border-gray-200 text-xs font-bold px-3 py-2 rounded-lg cursor-pointer shadow-sm"
                      >
                        {lang === "si" ? "ගොනුව තෝරන්න (Choose File)" : "Choose File"}
                      </label>
                      <span className="text-[11px] text-gray-500 font-semibold truncate max-w-[150px]">
                        {receiptFile || (lang === "si" ? "ගොනුවක් තෝරා නැත" : "No file chosen")}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 pt-5">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.summaryTotal}</span>
                  <span className="text-2xl font-black text-emerald-600">{t.perKg} {grandTotal.toLocaleString()}</span>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isCartEmpty || hasErrors || checkoutLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold py-3.5 rounded-xl transition cursor-pointer shadow-md shadow-emerald-50 text-sm"
                >
                  {checkoutLoading ? t.btnCheckoutLoading : t.btnCheckout}
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Payment Gateway Modal Popup */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b border-gray-105 border-gray-100 pb-3">
                <h3 className="text-sm font-black text-gray-900">
                  {paymentMethod === "card" 
                    ? (lang === "si" ? "ක්‍රෙඩිට්/ඩෙබිට් කාඩ් ගෙවීම්" : "Card Payment Gateway") 
                    : (lang === "si" ? "LankaQR ස්කෑන් කර ගෙවන්න" : "Scan & Pay with LankaQR")}
                </h3>
                <button 
                  onClick={() => setModalOpen(false)} 
                  className="text-gray-400 hover:text-gray-600 focus:outline-none p-1 cursor-pointer font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              {paymentMethod === "card" ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-emerald-600 to-indigo-700 rounded-2xl p-5 text-white shadow-md relative overflow-hidden h-40 flex flex-col justify-between">
                    <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full"></div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-100">Wholesale Payment Card</p>
                      <p className="text-lg font-mono tracking-widest mt-2">•••• •••• •••• ••••</p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div>
                        <span className="text-[9px] uppercase text-emerald-100 block">Card Holder</span>
                        <span className="text-xs font-bold font-sans">VALUED HOTEL / B2B</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase text-emerald-100 block">Expires</span>
                        <span className="text-xs font-bold font-sans">12/30</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-gray-600 block mb-1">Card Number</label>
                      <input 
                        type="text" 
                        placeholder="4242 4242 4242 4242" 
                        value={cardData.number}
                        onChange={(e) => setCardData(prev => ({ ...prev, number: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 bg-gray-50/50 font-semibold"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-gray-600 block mb-1">Expiry Date</label>
                        <input 
                          type="text" 
                          placeholder="MM/YY" 
                          value={cardData.expiry}
                          onChange={(e) => setCardData(prev => ({ ...prev, expiry: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 bg-gray-50/50 font-semibold text-center"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-gray-600 block mb-1">CVC / CVV</label>
                        <input 
                          type="password" 
                          placeholder="•••" 
                          maxLength="3"
                          value={cardData.cvv}
                          onChange={(e) => setCardData(prev => ({ ...prev, cvv: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 bg-gray-50/50 font-semibold text-center"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <p className="text-xs text-gray-500 font-semibold">
                    {lang === "si" ? "ඔබේ බැංකු App එකෙන් පහත QR කේතය ස්කෑන් කර ගෙවීම් සිදුකරන්න." : "Scan this QR code using your bank mobile application to pay instantly."}
                  </p>
                  
                  <div className="h-40 w-40 bg-gray-100 border border-gray-200 rounded-2xl mx-auto flex items-center justify-center p-3">
                    <div className="h-full w-full bg-white relative flex flex-wrap p-1">
                      <div className="absolute inset-0 m-auto h-8 w-12 bg-emerald-600 text-white font-black text-[8px] flex items-center justify-center rounded border border-white shadow-sm leading-none">
                        LANKAQR
                      </div>
                      <div className="w-1/3 h-1/3 bg-gray-900 border-2 border-white rounded-sm"></div>
                      <div className="w-1/3 h-1/3 bg-transparent"></div>
                      <div className="w-1/3 h-1/3 bg-gray-900 border-2 border-white rounded-sm"></div>
                      <div className="w-1/3 h-1/3 bg-transparent"></div>
                      <div className="w-1/3 h-1/3 bg-gray-950 rounded"></div>
                      <div className="w-1/3 h-1/3 bg-transparent"></div>
                      <div className="w-1/3 h-1/3 bg-gray-900 border-2 border-white rounded-sm"></div>
                      <div className="w-1/3 h-1/3 bg-transparent"></div>
                      <div className="w-1/3 h-1/3 bg-gray-900 border-2 border-white rounded-sm"></div>
                    </div>
                  </div>
                  <span className="text-sm font-black text-gray-900 block mt-2">LKR {grandTotal.toLocaleString()}</span>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold py-3 rounded-xl text-xs transition cursor-pointer text-center"
                  disabled={modalLoading}
                >
                  {lang === "si" ? "අවලංගු කරන්න" : "Cancel"}
                </button>
                <button
                  onClick={async () => {
                    setModalLoading(true);
                    setTimeout(async () => {
                      setModalLoading(false);
                      await executeCartCheckout("paid");
                    }, 1500);
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition cursor-pointer text-center shadow-md shadow-emerald-50"
                  disabled={modalLoading}
                >
                  {modalLoading 
                    ? (lang === "si" ? "තහවුරු කරමින්..." : "Processing...") 
                    : (lang === "si" ? "ගෙවීම තහවුරු කරන්න" : `Pay LKR ${grandTotal.toLocaleString()}`)}
                </button>
              </div>

            </div>
          </div>
        )}

      </main>
    </>
  );
}

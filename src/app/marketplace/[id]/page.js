"use client";
import React, { useState, useEffect } from "react";
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
  return CITY_COORDS["Nuwara Eliya"];
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

export default function ProductDetail({ params }) {
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const { lang, setLang } = useLanguage();
  const [buyerId, setBuyerId] = useState("");
  const [buyerRole, setBuyerRole] = useState("");
  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [reviews, setReviews] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const [buyerLocation, setBuyerLocation] = useState("Colombo");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [receiptFile, setReceiptFile] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [cardData, setCardData] = useState({ number: "", expiry: "", cvv: "" });

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
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    async function fetchCropDetail() {
      try {
        const res = await fetch(`/api/crops/${id}`);
        const data = await res.json();
        if (data.success) {
          setCrop(data.data);
        } else {
          setErrorMsg(data.error || "Failed to load crop details.");
        }
      } catch (err) {
        setErrorMsg("Failed to connect to the database.");
      } finally {
        setLoading(false);
      }
    }

    async function fetchReviews() {
      try {
        const res = await fetch(`/api/reviews?cropId=${id}`);
        const data = await res.json();
        if (data.success) {
          setReviews(data.data);
        }
      } catch (err) {
        console.error("Failed to load reviews:", err);
      }
    }

    fetchCropDetail();
    fetchReviews();
  }, [id]);

  const executePurchaseOrder = async (payStatus = "pending", receiptPath = "") => {
    setPurchaseLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const orderPayload = {
      buyerId,
      items: [
        {
          cropId: crop._id,
          name: crop.name,
          quantity: Number(quantity),
          price: crop.price,
        },
      ],
      totalAmount: grandTotal,
      discountAmount,
      deliveryFee,
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
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to place order.");
      }

      setSuccessMsg(lang === "si" ? "මිලදී ගැනීම සාර්ථකයි! ඇණවුම් පිටුවට යොමු කෙරේ..." : "Purchase successful! Redirecting to orders...");
      setModalOpen(false);
      setTimeout(() => {
        router.push("/orders");
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!buyerId) {
      alert(lang === "si" ? "මිලදී ගැනීමට ප්‍රථම කරුණාකර ඇතුල් (Login) වන්න." : "Please login first to make a purchase.");
      router.push("/login");
      return;
    }

    if (quantity <= 0) {
      setErrorMsg(lang === "si" ? "කරුණාකර වලංගු ප්‍රමාණයක් ඇතුළත් කරන්න." : "Please enter a valid quantity.");
      return;
    }

    if (quantity > crop.quantity) {
      setErrorMsg(lang === "si" ? "තොග සීමාව ඉක්මවා ඇත!" : "Requested quantity exceeds available stock!");
      return;
    }

    if (paymentMethod === "bank_transfer" && !receiptFile) {
      setErrorMsg(lang === "si" ? "කරුණාකර බැංකු ගෙවීම් රිසිට්පත උඩුගත කරන්න (Mock Upload)." : "Please select/upload a bank receipt file first (Mock Upload).");
      return;
    }

    if (paymentMethod === "card" || paymentMethod === "lankaqr") {
      setModalOpen(true);
    } else {
      await executePurchaseOrder("pending", receiptFile);
    }
  };

  const handleAddToCart = () => {
    if (quantity <= 0) {
      setErrorMsg(lang === "si" ? "කරුණාකර වලංගු ප්‍රමාණයක් ඇතුළත් කරන්න." : "Please enter a valid quantity.");
      return;
    }

    if (quantity > crop.quantity) {
      setErrorMsg(lang === "si" ? "තොග සීමාව ඉක්මවා ඇත!" : "Requested quantity exceeds available stock!");
      return;
    }

    try {
      const storedCart = localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : {};
      
      const currentQtyInCart = storedCart[crop._id]?.quantity || 0;
      const newQty = currentQtyInCart + Number(quantity);

      if (newQty > crop.quantity) {
        setErrorMsg(lang === "si" ? `කරත්තයේ ඇති මුළු ප්‍රමාණය පවතින තොගය ඉක්මවයි! (උපරිම: ${crop.quantity} Kg)` : `Total in cart exceeds stock! (Max: ${crop.quantity} Kg)`);
        return;
      }

      storedCart[crop._id] = {
        cropId: crop._id,
        name: crop.name,
        price: crop.price,
        quantity: newQty,
        stockLimit: crop.quantity,
        location: crop.location
      };

      localStorage.setItem("cart", JSON.stringify(storedCart));
      window.dispatchEvent(new Event("cart-updated"));
      setSuccessMsg(lang === "si" ? "කරත්තයට සාර්ථකව එක් කරන ලදී!" : "Added to cart successfully!");
      setErrorMsg("");

      // Clear messages after delay
      setTimeout(() => {
        setSuccessMsg("");
      }, 2000);
    } catch (e) {
      setErrorMsg("Failed to add to cart.");
    }
  };

  const fetchChatHistory = async () => {
    const farmerId = crop?.farmerId?._id || crop?.farmerId;
    if (!buyerId || !farmerId) return;

    try {
      const res = await fetch(`/api/chat?userId1=${buyerId}&userId2=${farmerId}`);
      const data = await res.json();
      if (data.success) {
        setChatMessages(data.data);
      }
    } catch (e) {
      console.error("Failed to load chat history:", e);
    }
  };

  const handleSendMessage = async () => {
    if (!typedMessage.trim() || sendingMsg) return;
    const farmerId = crop?.farmerId?._id || crop?.farmerId;
    if (!buyerId || !farmerId) return;

    setSendingMsg(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: buyerId,
          receiverId: farmerId,
          text: typedMessage,
          cropId: crop._id
        })
      });

      const data = await res.json();
      if (data.success) {
        setChatMessages(prev => [...prev, data.data]);
        setTypedMessage("");
      }
    } catch (e) {
      console.error("Failed to send message:", e);
    } finally {
      setSendingMsg(false);
    }
  };

  useEffect(() => {
    if (!chatOpen || !buyerId || !crop) return;
    
    fetchChatHistory();
    const interval = setInterval(fetchChatHistory, 3000);
    return () => clearInterval(interval);
  }, [chatOpen, buyerId, crop]);

  const text = {
    si: {
      backBtn: "ආපසු වෙළඳපොල වෙත",
      loading: "අස්වනු විස්තර පූරණය වෙමින් පවතී...",
      notAvailable: "අස්වැන්න සොයා ගැනීමට නොහැක.",
      farmer: "ගොවියා",
      farmerEmail: "ඊමේල්",
      location: "ගොවිපල පිහිටීම",
      price: "කිලෝවක මිල",
      stock: "ලබාගත හැකි තොගය",
      checkoutTitle: "ක්ෂණික මිලදී ගැනීම (Checkout)",
      qty: "මිලදී ගන්නා ප්‍රමාණය (Kg)",
      total: "මුළු මුදල",
      btnBuy: "මිලදී ගැනීම තහවුරු කරන්න",
      btnBuyLoading: "ඇණවුම සකසමින්...",
      exceedError: "ප්‍රමාණවත් තොගයක් නොමැත!",
      kg: "Kg",
      perKg: "රු",
      success: "සාර්ථකයි!",
      error: "දෝෂයකි: ",
      reviewsTitle: "පාරිභෝගික අදහස් (Reviews)",
      noReviews: "මෙම අස්වැන්න සඳහා තවමත් කිසිදු අදහසක් පළ කර නැත.",
      deliveryLabel: "ප්‍රවාහන ගමනාන්තය",
      deliveryFeeLabel: "ප්‍රවාහන ගාස්තුව",
      distanceLabel: "මුළු දුර",
      km: "Km"
    },
    en: {
      backBtn: "Back to Marketplace",
      loading: "Loading crop details...",
      notAvailable: "Crop details not found.",
      farmer: "Farmer Name",
      farmerEmail: "Email",
      location: "Farm Location",
      price: "Price per Kg",
      stock: "Available Stock",
      checkoutTitle: "Direct Checkout",
      qty: "Purchase Quantity (Kg)",
      total: "Total Cost",
      btnBuy: "Confirm Purchase",
      btnBuyLoading: "Processing Order...",
      exceedError: "Exceeds available stock!",
      kg: "Kg",
      perKg: "LKR",
      success: "Success!",
      error: "Error: ",
      reviewsTitle: "Customer Reviews",
      noReviews: "No reviews submitted yet for this crop.",
      deliveryLabel: "Delivery Destination",
      deliveryFeeLabel: "Delivery Fee",
      distanceLabel: "Total Distance",
      km: "Km"
    },
  };

  const t = text[lang];

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const srcCoords = getCoords(crop?.location);
  const destCoords = CITY_COORDS[buyerLocation] || CITY_COORDS["Colombo"];
  const distanceVal = crop ? calculateDistance(srcCoords.lat, srcCoords.lon, destCoords.lat, destCoords.lon) : 0;
  const deliveryFee = crop ? Math.round(200 + (distanceVal * 10)) : 0;
  const finalDistance = Math.round(distanceVal * 10) / 10;

  // B2B Wholesale discount calculation for hotels
  let discountPercent = 0;
  if (buyerRole === "hotel") {
    if (quantity >= 100) discountPercent = 0.15;
    else if (quantity >= 50) discountPercent = 0.10;
    else if (quantity >= 20) discountPercent = 0.05;
  }
  const cropSubtotal = crop ? crop.price * (Number(quantity) || 0) : 0;
  const discountAmount = Math.round(cropSubtotal * discountPercent);
  const discountedSubtotal = cropSubtotal - discountAmount;
  const grandTotal = crop ? Math.round(discountedSubtotal + deliveryFee) : 0;

  return (
    <>
      <Navbar lang={lang} setLang={setLang} />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        <Link
          href="/marketplace"
          className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1 mb-6 cursor-pointer"
        >
          ← {t.backBtn}
        </Link>

        {loading ? (
          <div className="py-24 text-center">
            <div className="h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 font-bold text-sm">{t.loading}</p>
          </div>
        ) : !crop ? (
          <div className="py-24 text-center text-gray-400 font-medium bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            {t.notAvailable}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            
            {/* Left Pane - Crop Image Illustration */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-100 border border-gray-100 rounded-3xl p-12 text-center relative shadow-sm h-[400px] flex items-center justify-center overflow-hidden">
              <span className="text-[120px] select-none hover:scale-110 transition duration-300">
                {crop.name.toLowerCase().includes("carrot") ? "🥕" :
                 crop.name.toLowerCase().includes("potato") ? "🥔" :
                 crop.name.toLowerCase().includes("tomato") ? "🍅" :
                 crop.name.toLowerCase().includes("onion") ? "🧅" :
                 crop.name.toLowerCase().includes("chili") ? "🌶️" : "🥬"}
              </span>
              <span className="absolute top-6 left-6 bg-emerald-600 text-white text-xs font-extrabold px-4 py-2 rounded-full shadow-md">
                📍 {crop.location}
              </span>
            </div>

            {/* Right Pane - Content details & purchase */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{crop.name}</h1>
                  {averageRating && (
                    <span className="bg-amber-50 border border-amber-100 text-amber-700 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1">
                      ⭐ {averageRating} ({reviews.length})
                    </span>
                  )}
                </div>
                {/* Quality Badges */}
                {( (crop.grade && crop.grade !== 'N/A') || (crop.organicStatus && crop.organicStatus !== 'conventional') ) && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {crop.grade && crop.grade !== 'N/A' && (
                      <span className="bg-indigo-50 border border-indigo-100 text-indigo-750 text-indigo-700 text-xs font-bold px-3 py-1 rounded-xl">
                        Grade {crop.grade}
                      </span>
                    )}
                    {crop.organicStatus && crop.organicStatus !== 'conventional' && (
                      <span className="bg-emerald-50 border border-emerald-100 text-emerald-750 text-emerald-700 text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1">
                        🌿 {crop.organicStatus === 'organic' ? (lang === "si" ? 'කාබනික' : 'Organic') : (lang === "si" ? 'වස විස නැති' : 'Pesticide-Free')}
                      </span>
                    )}
                  </div>
                )}
                <p className="text-sm font-bold text-gray-405 mt-1.5 uppercase tracking-wider text-gray-400">{t.location}: {crop.location}{crop.address ? ` (${crop.address})` : ""}</p>
              </div>

              {/* Stats Block */}
              <div className="grid grid-cols-2 gap-4 border-y border-gray-100 py-6">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">{t.price}</span>
                  <span className="text-2xl font-black text-emerald-600 block mt-1">{t.perKg} {crop.price}</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">{t.stock}</span>
                  <span className="text-2xl font-black text-amber-700 block mt-1">
                    {crop.quantity > 0 ? `${crop.quantity} ${t.kg}` : "Sold Out"}
                  </span>
                </div>
              </div>

              {/* Farmer Info */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-gray-800 mb-3">👨‍🌾 {t.farmer}</h3>
                  <div className="text-xs font-semibold text-gray-600 space-y-1.5">
                    <p><span className="text-gray-400">{t.farmer}:</span> {crop.farmerId?.name || "Local Farmer"}</p>
                    <p><span className="text-gray-400">{t.farmerEmail}:</span> {crop.farmerId?.email || "N/A"}</p>
                  </div>
                </div>
                {buyerId && buyerId !== (crop.farmerId?._id || crop.farmerId) && (
                  <button
                    onClick={() => setChatOpen(true)}
                    className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-150 font-bold py-2 rounded-xl text-xs transition cursor-pointer border-emerald-100"
                  >
                    💬 {lang === "si" ? "ගොවි මහතා සමඟ කතා කරන්න" : "Chat with Farmer"}
                  </button>
                )}
              </div>

              {/* Checkout Form */}
              {crop.quantity > 0 && (
                <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-md space-y-5">
                  <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">{t.checkoutTitle}</h3>
                  
                  {successMsg && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-semibold">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{successMsg}</span>
                    </div>
                  )}

                  {errorMsg && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-semibold">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">{t.qty}</label>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      max={crop.quantity}
                      value={quantity}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setQuantity(val);
                        if (val > crop.quantity) {
                          setErrorMsg(`${t.exceedError} (Max: ${crop.quantity} Kg)`);
                        } else {
                          setErrorMsg("");
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-emerald-500 rounded-xl font-bold text-gray-800 bg-white"
                      disabled={purchaseLoading}
                    />
                  </div>

                  {/* Destination Dropdown */}
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-gray-400 uppercase tracking-wider block">{t.deliveryLabel}</label>
                    <select
                      value={buyerLocation}
                      onChange={(e) => setBuyerLocation(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-emerald-500 rounded-xl font-bold text-xs text-gray-800 bg-white"
                      disabled={purchaseLoading}
                    >
                      {Object.keys(CITY_COORDS).map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 text-xs font-semibold text-gray-600 border-t border-gray-100 pt-3">
                    <div className="flex items-center justify-between">
                      <span>{t.distanceLabel}</span>
                      <span className="text-gray-900 font-bold">{finalDistance} {t.km}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{t.deliveryFeeLabel}</span>
                      <span className="text-emerald-600 font-bold">{t.perKg} {deliveryFee.toLocaleString()}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex items-center justify-between text-indigo-700 font-bold">
                        <span>{lang === "si" ? "තොග වට්ටම (Bulk Discount)" : "Bulk Wholesale Discount"}</span>
                        <span>- LKR {discountAmount.toLocaleString()}</span>
                      </div>
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
                          id="receipt-upload" 
                          className="hidden" 
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setReceiptFile(e.target.files[0].name);
                              setErrorMsg("");
                            }
                          }}
                        />
                        <label 
                          htmlFor="receipt-upload" 
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

                  <div className="flex items-center justify-between border-t border-gray-150 pt-4">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.total}</span>
                    <span className="text-2xl font-black text-emerald-600">
                      {t.perKg} {grandTotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleAddToCart}
                      disabled={purchaseLoading || quantity <= 0 || quantity > crop.quantity}
                      className="flex-1 bg-white hover:bg-gray-50 text-emerald-700 border border-emerald-250 font-bold py-3.5 rounded-xl transition cursor-pointer shadow-sm text-sm border-emerald-200"
                    >
                      {lang === "si" ? "කරත්තයට එක් කරන්න" : "Add to Cart"}
                    </button>
                    <button
                      onClick={handlePurchase}
                      disabled={purchaseLoading || quantity <= 0 || quantity > crop.quantity}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold py-3.5 rounded-xl transition cursor-pointer shadow-md shadow-emerald-50 text-sm"
                    >
                      {purchaseLoading ? t.btnBuyLoading : t.btnBuy}
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

        {/* Sliding Chat Drawer */}
        {chatOpen && (
          <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white shadow-2xl border-l border-gray-100 flex flex-col justify-between animate-in slide-in-from-right duration-250">
            {/* Drawer Header */}
            <div className="bg-emerald-800 text-white p-5 flex items-center justify-between shadow-md">
              <div>
                <h3 className="text-sm font-black tracking-tight">{lang === "si" ? "පණිවිඩ කවුළුව" : "Direct Chat"}</h3>
                <p className="text-[10px] text-emerald-200 font-bold uppercase tracking-wider">🧑‍🌾 {crop.farmerId?.name || "Farmer"}</p>
              </div>
              <button 
                onClick={() => setChatOpen(false)}
                className="text-white hover:text-emerald-200 focus:outline-none cursor-pointer p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Message Feed */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-gray-50/50">
              {chatMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center">
                  <p className="text-xs font-semibold text-gray-400 max-w-[200px]">
                    {lang === "si" ? "ගොවි මහතාට පණිවිඩයක් යවන්න..." : "No messages yet. Send a query to start conversation."}
                  </p>
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isMine = msg.senderId.toString() === buyerId.toString();
                  return (
                    <div 
                      key={msg._id} 
                      className={`flex flex-col max-w-[80%] ${isMine ? "ml-auto items-end" : "mr-auto items-start"}`}
                    >
                      <div className={`p-3 rounded-2xl text-xs font-semibold shadow-sm leading-relaxed
                        ${isMine 
                          ? "bg-emerald-600 text-white rounded-br-none" 
                          : "bg-white text-gray-800 border border-gray-150 rounded-bl-none"
                        }
                      `}>
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-gray-400 mt-1 font-semibold">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-gray-100 bg-white flex items-center gap-2">
              <input
                type="text"
                placeholder={lang === "si" ? "පණිවිඩය ලියන්න..." : "Type a message..."}
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 px-3 py-2.5 border border-gray-200 focus:outline-none focus:border-emerald-500 rounded-xl font-semibold text-xs text-gray-800 bg-white"
                disabled={sendingMsg}
              />
              <button
                onClick={handleSendMessage}
                disabled={sendingMsg || !typedMessage.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 text-white font-bold p-2.5 rounded-xl transition cursor-pointer shadow-sm shadow-emerald-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Reviews Section */}
        {!loading && crop && (
          <div className="mt-16 pt-12 border-t border-gray-100 space-y-6">
            <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">{t.reviewsTitle}</h3>
            {reviews.length === 0 ? (
              <p className="text-sm text-gray-400 font-semibold bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-6 text-center">
                {t.noReviews}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map((rev) => (
                  <div key={rev._id} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-3 hover:border-emerald-100 transition duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shadow-inner">
                          👤
                        </div>
                        <div>
                          <span className="text-sm font-extrabold text-gray-950 block">{rev.buyerName || "Local Buyer"}</span>
                          <span className="text-[10px] text-gray-400 font-bold block">{new Date(rev.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 text-xs text-amber-500 font-bold">
                        {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-gray-600 leading-relaxed bg-gray-50/50 border border-gray-50 rounded-2xl p-3">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
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
                      await executePurchaseOrder("paid");
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

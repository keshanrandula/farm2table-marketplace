"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";

const LOCATION_COORDINATES = {
  "nuwara eliya": [6.9497, 80.7891],
  "nuwaraeliya": [6.9497, 80.7891],
  "kandy": [7.2906, 80.6337],
  "colombo": [6.9271, 79.8612],
  "jaffna": [9.6615, 80.0255],
  "anuradhapura": [8.3114, 80.4037],
  "badulla": [6.9934, 81.0550],
  "galle": [6.0535, 80.2210],
  "matara": [5.9549, 80.5550],
  "hambantota": [6.1248, 81.1185],
  "kurunegala": [7.4863, 80.3647],
  "ratnapura": [6.6828, 80.3992],
  "kegalle": [7.2513, 80.3464],
  "matale": [7.4675, 80.6234],
  "gampaha": [7.0873, 80.0144],
  "kalutara": [6.5854, 79.9607],
  "trincomalee": [8.5790, 81.2185],
  "batticaloa": [7.7170, 81.7010],
  "ampara": [7.3018, 81.6747],
  "polonnaruwa": [7.9403, 81.0188],
  "puttalam": [8.0362, 79.8283],
  "chilaw": [7.5759, 79.7952],
  "negombo": [7.2081, 79.8358],
  "dambulla": [7.8742, 80.6517],
  "welimada": [6.9038, 80.9075],
  "keppetipola": [6.8833, 80.9167],
  "bandarawela": [6.8315, 80.9981],
};

export default function BuyerOrders() {
  const router = useRouter();
  const { lang, setLang } = useLanguage();
  const [buyerId, setBuyerId] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelLoading, setCancelLoading] = useState(null);

  // Review Modal state
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    orderId: "",
    cropId: "",
    cropName: "",
    rating: 5,
    comment: ""
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedItems, setReviewedItems] = useState({});

  const [trackingOrder, setTrackingOrder] = useState(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [driverSimulatedCoords, setDriverSimulatedCoords] = useState(null);

  // Load Leaflet dynamically
  useEffect(() => {
    if (!trackingOrder) return;
    if (typeof window === "undefined") return;

    if (window.L) {
      setLeafletLoaded(true);
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
    link.crossOrigin = "";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    script.crossOrigin = "";
    script.onload = () => {
      setLeafletLoaded(true);
    };
    document.body.appendChild(script);
  }, [trackingOrder]);

  // Simulate vehicle moving along the route between Pickup and Destination
  useEffect(() => {
    if (!trackingOrder) {
      setDriverSimulatedCoords(null);
      return;
    }

    const pickupLocName = (trackingOrder.items?.[0]?.cropId?.location || "Nuwara Eliya").toLowerCase().trim();
    const destLocName = (trackingOrder.buyerLocation || "Colombo").toLowerCase().trim();

    const startCoords = LOCATION_COORDINATES[pickupLocName] || LOCATION_COORDINATES["nuwara eliya"];
    const endCoords = LOCATION_COORDINATES[destLocName] || LOCATION_COORDINATES["colombo"];

    let percent = 0;
    setDriverSimulatedCoords(startCoords);

    const interval = setInterval(() => {
      percent += 0.05;
      if (percent > 1.0) {
        percent = 0; // loop
      }
      const lat = startCoords[0] + (endCoords[0] - startCoords[0]) * percent;
      const lon = startCoords[1] + (endCoords[1] - startCoords[1]) * percent;
      setDriverSimulatedCoords([lat, lon]);
    }, 1500);

    return () => clearInterval(interval);
  }, [trackingOrder]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          setBuyerId(u.id || u._id || "");
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
    if (!buyerId) return;

    async function fetchBuyerOrders() {
      try {
        const res = await fetch(`/api/orders?buyerId=${buyerId}`);
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

    fetchBuyerOrders();
  }, [buyerId]);

  const handleCancelOrder = async (orderId) => {
    if (!confirm(lang === "si" ? "ඔබට මෙම ඇණවුම අවලංගු කිරීමට අවශ්‍ය බව ස්ථිරද?" : "Are you sure you want to cancel this order?")) {
      return;
    }
    setCancelLoading(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel order");
      }
      
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: "cancelled" } : o))
      );
    } catch (err) {
      alert(err.message);
    } finally {
      setCancelLoading(null);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewModal.comment.trim()) {
      alert(lang === "si" ? "කරුණාකර අදහසක් ඇතුළත් කරන්න." : "Please enter a comment.");
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: reviewModal.orderId,
          cropId: reviewModal.cropId,
          buyerId,
          rating: reviewModal.rating,
          comment: reviewModal.comment
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      setReviewedItems(prev => ({
        ...prev,
        [`${reviewModal.orderId}_${reviewModal.cropId}`]: true
      }));

      alert(lang === "si" ? "අදහස සාර්ථකව පළ කරන ලදී!" : "Review submitted successfully!");
      setReviewModal(prev => ({ ...prev, isOpen: false, comment: "", rating: 5 }));
    } catch (e) {
      alert(e.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const text = {
    si: {
      title: "මගේ ඇණවුම් ඉතිහාසය",
      subtitle: "ඔබ විසින් ලබාදෙන ලද සියලුම ඇණවුම් සහ ඒවායේ වත්මන් තත්ත්වයන් මෙතැනින් බලාගත හැක.",
      orderNo: "ඇණවුම් අංකය",
      date: "දිනය",
      items: "ඇණවුම් කළ දෑ",
      total: "මුළු මුදල",
      status: "තත්ත්වය",
      action: "ක්‍රියාකාරකම්",
      statusPending: "ලැබී ඇත",
      statusShipped: "ප්‍රවාහනය වෙමින්",
      statusDelivered: "භාරදී ඇත",
      statusCompleted: "නිමවා ඇත",
      statusCancelled: "අවලංගු කර ඇත",
      btnCancel: "ඇණවුම අවලංගු කරන්න",
      loading: "ඇණවුම් තොරතුරු පූරණය වෙමින් පවතී...",
      noOrders: "ඔබ තවමත් කිසිදු ඇණවුමක් ලබාදී නැත.",
      error: "දෝෂයකි: ",
      kg: "Kg",
      perKg: "රු",
      writeReview: "අදහස දක්වන්න",
      reviewed: "අදහස් පළ කර ඇත",
      reviewTitle: "පාරිභෝගික අදහස් සහ තරු ලකුණු",
      commentLabel: "ඔබේ අදහස (Comment)",
      ratingLabel: "තරු ප්‍රමාණය (Rating)",
      btnSubmitReview: "අදහස පළකරන්න",
      btnCancelReview: "අවලංගු කරන්න"
    },
    en: {
      title: "My Order History",
      subtitle: "Track all your placed orders, wholesale shipments, and delivery updates.",
      orderNo: "Order ID",
      date: "Date",
      items: "Ordered Produce",
      total: "Total Cost",
      status: "Status",
      action: "Actions",
      statusPending: "Pending",
      statusShipped: "Shipped",
      statusDelivered: "Delivered",
      statusCompleted: "Completed",
      statusCancelled: "Cancelled",
      btnCancel: "Cancel Order",
      loading: "Loading your order history...",
      noOrders: "You have not placed any orders yet.",
      error: "Error: ",
      kg: "Kg",
      perKg: "LKR",
      writeReview: "Write Review",
      reviewed: "Reviewed",
      reviewTitle: "Submit Crop Rating & Review",
      commentLabel: "Write your comment",
      ratingLabel: "Select Rating",
      btnSubmitReview: "Submit Review",
      btnCancelReview: "Cancel"
    }
  };

  const t = text[lang];

  return (
    <>
      <Navbar lang={lang} setLang={setLang} />
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-8 relative pb-20">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{t.subtitle}</p>
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
            <span className="text-5xl block mb-3">📋</span>
            {t.noOrders}
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-4 px-4">{t.orderNo}</th>
                    <th className="py-4 px-4">{t.items}</th>
                    <th className="py-4 px-4">{t.total}</th>
                    <th className="py-4 px-4">{t.status}</th>
                    <th className="py-4 px-4 text-center">{t.action}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm font-semibold text-gray-700">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50/50 transition">
                      <td className="py-4 px-4 font-mono text-xs text-gray-500">
                        #{order._id.substring(order._id.length - 8).toUpperCase()}
                        <span className="text-[10px] text-gray-400 block font-sans font-semibold mt-0.5">
                          📅 {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        {order.buyerLocation && (
                          <span className="text-[10px] text-emerald-600 block font-sans font-bold mt-1">
                            📍 {order.buyerLocation} ({order.distance || 0} km)
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-2 max-w-xs">
                          {order.items.map((item, index) => {
                            const itemCropId = item.cropId?._id || item.cropId;
                            const isReviewed = reviewedItems[`${order._id}_${itemCropId}`];
                            return (
                              <div key={index} className="text-xs flex flex-col gap-1.5 text-gray-600 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-2">
                                <div className="flex items-center justify-between">
                                  <span>🥬 {item.name}</span>
                                  <span className="font-bold text-gray-900">{item.quantity} {t.kg}</span>
                                </div>
                                {(order.status === "completed" || order.status === "delivered") && (
                                  <button
                                    onClick={() => setReviewModal({
                                      isOpen: true,
                                      orderId: order._id,
                                      cropId: itemCropId,
                                      cropName: item.name,
                                      rating: 5,
                                      comment: ""
                                    })}
                                    disabled={isReviewed}
                                    className={`text-[10px] font-extrabold hover:underline text-left mt-0.5 flex items-center gap-0.5 cursor-pointer 
                                      ${isReviewed ? "text-gray-400" : "text-emerald-600"}
                                    `}
                                  >
                                    ⭐ {isReviewed ? t.reviewed : t.writeReview}
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-emerald-600 font-black">
                        {t.perKg} {order.totalAmount.toLocaleString()}
                        {order.deliveryFee > 0 && (
                          <span className="text-[10px] text-gray-400 block font-sans font-semibold mt-0.5 font-bold">
                            (🚚 {lang === "si" ? "ප්‍රවාහන ගාස්තුව" : "Delivery"}: {t.perKg} {order.deliveryFee})
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                          order.status === "pending"
                            ? "bg-amber-50 text-amber-700 border-amber-100"
                            : order.status === "shipped"
                            ? "bg-blue-50 text-blue-700 border-blue-100"
                            : order.status === "completed" || order.status === "delivered"
                            ? "bg-green-50 text-green-700 border-green-100"
                            : "bg-red-50 text-red-600 border-red-100"
                        }`}>
                          {order.status === "pending" ? t.statusPending :
                           order.status === "shipped" ? t.statusShipped :
                           order.status === "completed" || order.status === "delivered" ? t.statusDelivered :
                           t.statusCancelled}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {order.status === "pending" ? (
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            disabled={cancelLoading === order._id}
                            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 text-xs font-bold py-2 px-3 rounded-lg cursor-pointer transition"
                          >
                            {cancelLoading === order._id ? "..." : t.btnCancel}
                          </button>
                        ) : order.status === "shipped" ? (
                          <button
                            onClick={() => setTrackingOrder(order)}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 text-xs font-bold py-2 px-3 rounded-lg cursor-pointer transition"
                          >
                            🗺️ {lang === "si" ? "ස්ථානය බලන්න" : "Track Delivery"}
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Review Form Modal */}
        {reviewModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-5 animate-in fade-in zoom-in duration-200">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{t.reviewTitle}</h3>
                <p className="text-xs font-semibold text-emerald-600 mt-0.5">🥬 {reviewModal.cropName}</p>
              </div>

              {/* Rating selection (Stars) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">{t.ratingLabel}</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewModal(prev => ({ ...prev, rating: star }))}
                      className="text-2xl hover:scale-110 transition cursor-pointer"
                    >
                      {star <= reviewModal.rating ? "⭐" : "☆"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">{t.commentLabel}</label>
                <textarea
                  rows="3"
                  value={reviewModal.comment}
                  onChange={(e) => setReviewModal(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder={lang === "si" ? "ඔබේ අදහස මෙතැන ලියන්න..." : "Write your review comment here..."}
                  className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-emerald-500 rounded-xl font-semibold text-gray-800 bg-white text-sm"
                  disabled={submittingReview}
                ></textarea>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModal(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 font-bold py-3 rounded-xl transition cursor-pointer text-sm"
                  disabled={submittingReview}
                >
                  {t.btnCancelReview}
                </button>
                <button
                  type="button"
                  onClick={handleSubmitReview}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition cursor-pointer shadow-md shadow-emerald-50 text-sm"
                  disabled={submittingReview}
                >
                  {submittingReview ? "..." : t.btnSubmitReview}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Live Delivery Tracking Modal */}
        {trackingOrder && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-gray-100 space-y-6 animate-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b border-gray-105 border-gray-100 pb-3">
                <div>
                  <h3 className="text-lg font-black text-gray-900">
                    {lang === "si" ? "සජීවී බෙදාහැරීම් ලුහුබැඳීම" : "Live Delivery Tracking"}
                  </h3>
                  <p className="text-[11px] text-gray-400 font-bold tracking-wide mt-0.5">
                    {lang === "si" ? "ඇණවුම:" : "Order ID:"} #{trackingOrder._id.substring(trackingOrder._id.length - 8).toUpperCase()}
                  </p>
                </div>
                <button 
                  onClick={() => setTrackingOrder(null)}
                  className="text-gray-400 hover:text-gray-655 hover:text-gray-600 focus:outline-none p-1 cursor-pointer font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Map container */}
              {!leafletLoaded ? (
                <div className="h-80 w-full bg-gray-50 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 space-y-2">
                  <div className="h-8 w-8 border-3 border-indigo-650 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-gray-450 font-bold">{lang === "si" ? "සිතියම පූරණය වෙමින්..." : "Loading tracker map..."}</span>
                </div>
              ) : (
                <TrackingMap 
                  order={trackingOrder} 
                  driverCoords={driverSimulatedCoords} 
                  lang={lang} 
                />
              )}

              {/* Driver & Status Details footer */}
              <div className="bg-indigo-50/30 border border-indigo-50 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-indigo-100 text-indigo-750 text-indigo-600 rounded-full flex items-center justify-center text-lg font-bold">
                    🏍️
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{lang === "si" ? "ප්‍රවාහන සහකරු" : "Delivery Partner"}</p>
                    <p className="font-extrabold text-gray-900 text-sm">{trackingOrder.driverId?.name || (lang === "si" ? "ප්‍රවාහන සහකරු" : "Delivery Driver")}</p>
                    <p className="text-[10px] text-gray-550 font-semibold mt-0.5">{trackingOrder.driverId?.email || "driver@farmtoshop.com"}</p>
                  </div>
                </div>

                <div className="text-right sm:text-right">
                  <span className="inline-block bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {lang === "si" ? "මාර්ගයේ ගමන් කරමින්" : "In Transit"}
                  </span>
                  <p className="text-xs font-bold text-gray-500 mt-1.5">
                    {lang === "si" ? "ඇස්තමේන්තුගත කාලය (ETA):" : "Estimated Arrival (ETA):"}{" "}
                    <span className="text-gray-900 font-extrabold">15-30 mins</span>
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>
    </>
  );
}

function TrackingMap({ order, driverCoords, lang }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const driverMarkerRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.L || !mapContainerRef.current) return;
    const L = window.L;

    const pickupLocName = (order.items?.[0]?.cropId?.location || "Nuwara Eliya").toLowerCase().trim();
    const destLocName = (order.buyerLocation || "Colombo").toLowerCase().trim();

    const startCoords = LOCATION_COORDINATES[pickupLocName] || LOCATION_COORDINATES["nuwara eliya"];
    const endCoords = LOCATION_COORDINATES[destLocName] || LOCATION_COORDINATES["colombo"];

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current).setView(startCoords, 8);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);

      // Add pickup marker
      L.marker(startCoords, {
        icon: L.divIcon({
          html: `<div style="background:#10b981;color:white;padding:4px 8px;border-radius:10px;font-weight:bold;font-size:10px;border:1px solid white;white-space:nowrap;">🟢 Pickup (${pickupLocName.toUpperCase()})</div>`,
          className: "custom-pin",
          iconSize: [80, 20],
          iconAnchor: [40, 10]
        })
      }).addTo(mapInstanceRef.current);

      // Add delivery marker
      L.marker(endCoords, {
        icon: L.divIcon({
          html: `<div style="background:#ef4444;color:white;padding:4px 8px;border-radius:10px;font-weight:bold;font-size:10px;border:1px solid white;white-space:nowrap;">🔴 Delivery (${destLocName.toUpperCase()})</div>`,
          className: "custom-pin",
          iconSize: [80, 20],
          iconAnchor: [40, 10]
        })
      }).addTo(mapInstanceRef.current);

      // Draw polyline connecting pickup to delivery
      L.polyline([startCoords, endCoords], { color: "#4f46e5", weight: 3, dashArray: "5, 10" }).addTo(mapInstanceRef.current);
    }

    // Handle driver marker updates
    if (driverCoords) {
      if (!driverMarkerRef.current) {
        driverMarkerRef.current = L.marker(driverCoords, {
          icon: L.divIcon({
            html: `<div style="font-size:24px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));">🏍️</div>`,
            className: "driver-bike",
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          })
        }).addTo(mapInstanceRef.current);
      } else {
        driverMarkerRef.current.setLatLng(driverCoords);
      }
    }
  }, [driverCoords, order]);

  return <div ref={mapContainerRef} className="w-full h-80 rounded-2xl border border-gray-250 z-0"></div>;
}

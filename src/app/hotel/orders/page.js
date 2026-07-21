"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import InvoiceModal from "@/components/InvoiceModal";
import DriverLiveMap from "@/components/DriverLiveMap";
import { useLanguage } from "@/context/LanguageContext";

export default function HotelOrders() {
  const router = useRouter();
  const { lang, setLang } = useLanguage();
  const [buyerId, setBuyerId] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelLoading, setCancelLoading] = useState(null);

  // Invoice & Tracking Modals
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState(null);

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
    <div className="space-y-8 relative pb-12">
      {/* Language Toggle */}
      <button
        onClick={() => setLang(lang === "si" ? "en" : "si")}
        className="absolute top-0 right-0 bg-white border border-gray-200 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer hover:bg-gray-50 transition shadow-sm z-10"
      >
        {lang === "si" ? "English 🌐" : "සිංහල 🌐"}
      </button>

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
        <div className="py-16 text-center text-gray-400 font-medium bg-white rounded-3xl border border-dashed border-gray-200">
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
                    <td className="py-4 px-4 font-mono text-xs text-gray-550">
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
                                <span className="font-bold text-gray-950">{item.quantity} {t.kg}</span>
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
                      <div className="flex flex-col gap-1.5 items-center justify-center">
                        <button
                          onClick={() => setSelectedInvoiceOrder(order)}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-bold py-1.5 px-3 rounded-lg cursor-pointer transition flex items-center gap-1 shadow-sm"
                        >
                          <span>📄</span>
                          <span>Invoice PDF</span>
                        </button>

                        {(order.status === "shipped" || order.status === "prepared" || order.status === "completed" || order.status === "delivered") && (
                          <button
                            onClick={() => setSelectedTrackingOrder(order)}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold py-1.5 px-3 rounded-lg cursor-pointer transition flex items-center gap-1 shadow-sm"
                          >
                            <span>📍</span>
                            <span>Live GPS Track</span>
                          </button>
                        )}

                        {order.status === "pending" && (
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            disabled={cancelLoading === order._id}
                            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 text-[11px] font-bold py-1 px-2.5 rounded-lg cursor-pointer transition"
                          >
                            {cancelLoading === order._id ? "..." : t.btnCancel}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice PDF Modal */}
      {selectedInvoiceOrder && (
        <InvoiceModal
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}

      {/* Live Driver Tracking Modal */}
      {selectedTrackingOrder && (
        <DriverLiveMap
          order={selectedTrackingOrder}
          onClose={() => setSelectedTrackingOrder(null)}
        />
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
    </div>
  );
}

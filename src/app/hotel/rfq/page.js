"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HotelSidebar from "@/components/HotelSidebar";

export default function HotelRfqPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedRfqForBids, setSelectedRfqForBids] = useState(null);

  const [formData, setFormData] = useState({
    cropName: "",
    category: "Vegetables",
    quantity: "",
    unit: "kg",
    targetBudgetPerUnit: "",
    deliveryLocation: "Colombo",
    requiredDate: "",
    description: ""
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const u = JSON.parse(stored);
          if (u.role !== "hotel") {
            router.push("/login");
            return;
          }
          setUser(u);
          fetchRfqs(u.id || u._id);
        } catch (e) {
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
    }
  }, [router]);

  async function fetchRfqs(hotelId) {
    setLoading(true);
    try {
      const res = await fetch(`/api/rfq?hotelId=${hotelId}`);
      const data = await res.json();
      if (data.success) {
        setRfqs(data.data);
      }
    } catch (err) {
      console.error("Error fetching RFQs:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateRfq = async (e) => {
    e.preventDefault();
    if (!formData.cropName || !formData.quantity || !formData.targetBudgetPerUnit || !formData.requiredDate) {
      alert("කරුණාකර අවශ්‍ය සියලුම ක්ෂේත්‍ර පුරවන්න (Please fill all required fields)");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/rfq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotelId: user.id || user._id,
          hotelName: user.name || "Hotel Buyer",
          ...formData
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setFormData({
          cropName: "",
          category: "Vegetables",
          quantity: "",
          unit: "kg",
          targetBudgetPerUnit: "",
          deliveryLocation: "Colombo",
          requiredDate: "",
          description: ""
        });
        fetchRfqs(user.id || user._id);
      } else {
        alert(data.error || "Failed to create RFQ");
      }
    } catch (err) {
      alert("Network error creating RFQ");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptBid = async (rfqId, bidId) => {
    if (!confirm("මෙම ගොවියාගේ Bidding එක පිළිගෙන ඇණවුම තහවුරු කිරීමට ඔබට විශ්වාසද?")) return;
    try {
      const res = await fetch(`/api/rfq/${rfqId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept_bid", bidId })
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ Bid Accepted! Order successfully created in your Orders list.");
        setSelectedRfqForBids(null);
        fetchRfqs(user.id || user._id);
      } else {
        alert(data.error || "Failed to accept bid");
      }
    } catch (err) {
      alert("Error accepting bid");
    }
  };

  const filteredRfqs = rfqs.filter(r => {
    if (activeTab === "open") return r.status === "open";
    if (activeTab === "accepted") return r.status === "accepted";
    return true;
  });

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <HotelSidebar />
      
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto space-y-8 overflow-y-auto">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 translate-x-8 -translate-y-4">
            <span className="text-[180px] leading-none">⚖️</span>
          </div>
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/30 backdrop-blur-md text-emerald-200 text-xs font-bold uppercase tracking-wider">
              B2B Wholesale Auction
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Bulk Bidding & RFQ Management</h1>
            <p className="text-emerald-100 text-sm max-w-xl">
              ඔබගේ හෝටලයට අවශ්‍ය විශාල එළවළු/පළතුරු ප්‍රමාණය සඳහා ගොවීන්ගෙන් Quotes ගෙන අඩුම සහ හොඳම මිල තෝරාගන්න.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="relative z-10 flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black px-6 py-3.5 rounded-2xl shadow-lg transition duration-200 transform hover:-translate-y-0.5 cursor-pointer text-sm"
          >
            <span>✨ Post New RFQ</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl font-bold">
              📢
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Active RFQs</p>
              <h3 className="text-2xl font-black">{rfqs.filter(r => r.status === 'open').length}</h3>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl font-bold">
              🏷️
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Bids Received</p>
              <h3 className="text-2xl font-black">{rfqs.reduce((acc, r) => acc + (r.bids ? r.bids.length : 0), 0)}</h3>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl font-bold">
              ✅
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Deals Closed</p>
              <h3 className="text-2xl font-black">{rfqs.filter(r => r.status === 'accepted').length}</h3>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-3">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
              activeTab === "all" ? "bg-emerald-600 text-white shadow" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            All Requests ({rfqs.length})
          </button>
          <button
            onClick={() => setActiveTab("open")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
              activeTab === "open" ? "bg-emerald-600 text-white shadow" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            Open for Bids ({rfqs.filter(r => r.status === 'open').length})
          </button>
          <button
            onClick={() => setActiveTab("accepted")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
              activeTab === "accepted" ? "bg-emerald-600 text-white shadow" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            Accepted Deals ({rfqs.filter(r => r.status === 'accepted').length})
          </button>
        </div>

        {/* RFQ Cards List */}
        {loading ? (
          <div className="py-20 text-center space-y-4">
            <div className="inline-block h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium">Loading RFQs...</p>
          </div>
        ) : filteredRfqs.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
            <span className="text-5xl">📦</span>
            <h3 className="text-xl font-bold">No RFQs Found</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              ඔබ තවම කිසිදු Bidding Request එකක් එක් කර නොමැත. "Post New RFQ" බොත්තම ඔබා පළමු Quote ඉල්ලීම යොමු කරන්න.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl transition cursor-pointer"
            >
              + Create RFQ Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredRfqs.map((rfq) => (
              <div
                key={rfq._id}
                className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">{rfq.cropName}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        rfq.status === 'open' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                        rfq.status === 'accepted' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {rfq.status === 'open' ? '🟢 Open for Bids' : rfq.status === 'accepted' ? '✅ Deal Accepted' : 'Closed'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      Category: <span className="font-bold text-gray-700 dark:text-gray-300">{rfq.category}</span> • Location: <span className="font-bold text-gray-700 dark:text-gray-300">📍 {rfq.deliveryLocation}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedRfqForBids(selectedRfqForBids === rfq._id ? null : rfq._id)}
                      className="bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                    >
                      <span>🤝 View Bids ({rfq.bids ? rfq.bids.length : 0})</span>
                      <span>{selectedRfqForBids === rfq._id ? "▲" : "▼"}</span>
                    </button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl text-sm">
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 block font-medium">Quantity Needed</span>
                    <span className="font-black text-gray-900 dark:text-white text-base">{rfq.quantity} {rfq.unit}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 block font-medium">Target Price/Unit</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-base">Rs. {rfq.targetBudgetPerUnit} /{rfq.unit}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 block font-medium">Est. Max Budget</span>
                    <span className="font-black text-gray-900 dark:text-white text-base">Rs. {(rfq.totalBudget || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 block font-medium">Delivery Needed By</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400 text-base">📅 {rfq.requiredDate}</span>
                  </div>
                </div>

                {rfq.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 bg-emerald-50/50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                    💡 <span className="font-semibold">Notes:</span> {rfq.description}
                  </p>
                )}

                {/* Expanded Bids Section */}
                {selectedRfqForBids === rfq._id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                    <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 flex items-center justify-between">
                      <span>Submitted Farmer Bids</span>
                      <span className="text-xs text-gray-500 font-normal">Total Quotes: {rfq.bids ? rfq.bids.length : 0}</span>
                    </h4>

                    {(!rfq.bids || rfq.bids.length === 0) ? (
                      <div className="p-6 text-center text-gray-500 text-xs bg-gray-50 dark:bg-gray-900 rounded-2xl">
                        තවම කිසිදු ගොවියෙකුගෙන් Quotes ලැබී නොමැත. (Waiting for farmer bids)
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {rfq.bids.map((bid) => (
                          <div
                            key={bid._id}
                            className={`p-4 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                              bid.status === 'accepted'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800'
                                : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm">🧑‍🌾 {bid.farmerName}</span>
                                {bid.farmerPhone && (
                                  <span className="text-xs text-gray-500">📞 {bid.farmerPhone}</span>
                                )}
                                {bid.status === 'accepted' && (
                                  <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    WINNING BID
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Delivery Time: <span className="font-bold">{bid.deliveryDays} Day(s)</span>
                                {bid.notes && <span> • "{bid.notes}"</span>}
                              </p>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-xs text-gray-500">Quoted Rate</p>
                                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                                  Rs. {bid.pricePerUnit} /{rfq.unit}
                                </p>
                                <p className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                                  Total: Rs. {(bid.totalAmount || 0).toLocaleString()}
                                </p>
                              </div>

                              {rfq.status === 'open' && (
                                <button
                                  onClick={() => handleAcceptBid(rfq._id, bid._id)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition cursor-pointer"
                                >
                                  Accept & Order
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal for Creating RFQ */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-gray-100 dark:border-gray-700 space-y-6 relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">✨ Create Bulk RFQ</h3>
                  <p className="text-xs text-gray-500">ඔබට අවශ්‍ය තොග ඇණවුමේ විස්තර ඇතුළත් කරන්න</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateRfq} className="space-y-4 text-sm">
                <div>
                  <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">Crop / Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Organic Carrots / Big Onions"
                    value={formData.cropName}
                    onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="Vegetables">Vegetables</option>
                      <option value="Fruits">Fruits</option>
                      <option value="Grains & Rice">Grains & Rice</option>
                      <option value="Spices">Spices</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">Unit</label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="kg">Kilograms (kg)</option>
                      <option value="g">Grams (g)</option>
                      <option value="items">Units / Items</option>
                      <option value="bags">Bags (50kg)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">Quantity Needed *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 500"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">Target Budget / Unit (Rs.) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 150"
                      value={formData.targetBudgetPerUnit}
                      onChange={(e) => setFormData({ ...formData, targetBudgetPerUnit: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">Delivery Location *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Colombo 03 / Kandy"
                      value={formData.deliveryLocation}
                      onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">Delivery Required Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.requiredDate}
                      onChange={(e) => setFormData({ ...formData, requiredDate: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">Additional Specifications / Notes</label>
                  <textarea
                    rows="3"
                    placeholder="e.g. Grade A quality preferred, organic certification required..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  ></textarea>
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
                    {submitting ? "Publishing..." : "Publish RFQ"}
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

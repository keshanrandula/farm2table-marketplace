"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FarmerBidsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRfq, setSelectedRfq] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("open");

  const [bidForm, setBidForm] = useState({
    pricePerUnit: "",
    deliveryDays: "1",
    farmerPhone: "",
    notes: ""
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const u = JSON.parse(stored);
          if (u.role !== "farmer") {
            router.push("/login");
            return;
          }
          setUser(u);
          setBidForm(prev => ({ ...prev, farmerPhone: u.phone || "" }));
          fetchRfqs();
        } catch (e) {
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
    }
  }, [router]);

  async function fetchRfqs() {
    setLoading(true);
    try {
      const res = await fetch("/api/rfq");
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

  const handleOpenBidModal = (rfq) => {
    setSelectedRfq(rfq);
    // If farmer already bid, pre-fill form
    const existingBid = rfq.bids ? rfq.bids.find(b => b.farmerId === (user.id || user._id)) : null;
    if (existingBid) {
      setBidForm({
        pricePerUnit: existingBid.pricePerUnit || "",
        deliveryDays: existingBid.deliveryDays || "1",
        farmerPhone: existingBid.farmerPhone || user.phone || "",
        notes: existingBid.notes || ""
      });
    } else {
      setBidForm({
        pricePerUnit: rfq.targetBudgetPerUnit || "",
        deliveryDays: "1",
        farmerPhone: user.phone || "",
        notes: ""
      });
    }
  };

  const handleSubmitBid = async (e) => {
    e.preventDefault();
    if (!bidForm.pricePerUnit) {
      alert("කරුණාකර ඔබගේ එකක මිල (Price per Unit) ඇතුළත් කරන්න");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/rfq/${selectedRfq._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmerId: user.id || user._id,
          farmerName: user.name || "Farmer Producer",
          ...bidForm
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ Bidding Quote successfully submitted to Hotel!");
        setSelectedRfq(null);
        fetchRfqs();
      } else {
        alert(data.error || "Failed to submit bid");
      }
    } catch (err) {
      alert("Error submitting bid");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter open RFQs and Farmer's submitted bids
  const openRfqs = rfqs.filter(r => r.status === 'open');
  const myBidsRfqs = rfqs.filter(r => r.bids && r.bids.some(b => b.farmerId === (user?.id || user?._id)));

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 translate-x-8 -translate-y-4">
            <span className="text-[180px] leading-none">🧑‍🌾</span>
          </div>
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/30 backdrop-blur-md text-emerald-200 text-xs font-bold uppercase tracking-wider">
              Hotel B2B Tender Opportunities
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Hotel Bids & Wholesale Quotes</h1>
            <p className="text-emerald-100 text-sm max-w-xl">
              හෝටල් සහ ආයතන විසින් නිකුත් කර ඇති තොග එළවළු/පළතුරු Quotes සඳහා ඔබගේ හොඳම මිල ගණන් (Bids) ඉදිරිපත් කරන්න.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl font-bold">
              🏨
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Open Hotel RFQs</p>
              <h3 className="text-2xl font-black">{openRfqs.length}</h3>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl font-bold">
              📝
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">My Submitted Bids</p>
              <h3 className="text-2xl font-black">{myBidsRfqs.length}</h3>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl font-bold">
              🏆
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Won Deals</p>
              <h3 className="text-2xl font-black">
                {myBidsRfqs.filter(r => r.acceptedBid?.farmerId === (user?.id || user?._id)).length}
              </h3>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-3">
          <button
            onClick={() => setActiveTab("open")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
              activeTab === "open" ? "bg-emerald-600 text-white shadow" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            Available Hotel Requests ({openRfqs.length})
          </button>
          <button
            onClick={() => setActiveTab("mybids")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
              activeTab === "mybids" ? "bg-emerald-600 text-white shadow" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            My Submitted Bids ({myBidsRfqs.length})
          </button>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="py-20 text-center space-y-4">
            <div className="inline-block h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium">Loading Hotel Bids...</p>
          </div>
        ) : activeTab === "open" ? (
          openRfqs.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
              <span className="text-5xl">🌾</span>
              <h3 className="text-xl font-bold">No Open Hotel Requests</h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                මෙම අවස්ථාවේ විවෘත RFQ ඉල්ලීම් නොමැත. නව හෝටල් ඉල්ලීම් පැමිණි විගස මෙහි දර්ශනය වේ.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {openRfqs.map((rfq) => {
                const myBid = rfq.bids ? rfq.bids.find(b => b.farmerId === (user?.id || user?._id)) : null;

                return (
                  <div
                    key={rfq._id}
                    className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-6"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">
                              🏨 {rfq.hotelName}
                            </span>
                            <span className="text-xs text-gray-500">📍 {rfq.deliveryLocation}</span>
                          </div>
                          <h3 className="text-xl font-black text-gray-900 dark:text-white mt-1">{rfq.cropName}</h3>
                        </div>
                        <span className="text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-3 py-1 rounded-full">
                          Required: {rfq.requiredDate}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 bg-gray-50 dark:bg-gray-900/60 p-4 rounded-2xl text-xs">
                        <div>
                          <span className="text-gray-500 block">Quantity Needed</span>
                          <span className="text-base font-extrabold text-gray-900 dark:text-white">
                            {rfq.quantity} {rfq.unit}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Hotel Target Budget</span>
                          <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                            Rs. {rfq.targetBudgetPerUnit} /{rfq.unit}
                          </span>
                        </div>
                      </div>

                      {rfq.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 bg-emerald-50/40 dark:bg-emerald-950/20 p-3 rounded-xl">
                          📝 {rfq.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-4">
                      <div>
                        {myBid ? (
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                            ✅ Your Bid: Rs. {myBid.pricePerUnit} /{rfq.unit}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500">
                            {rfq.bids ? rfq.bids.length : 0} Farmer Bids submitted
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleOpenBidModal(rfq)}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs transition shadow cursor-pointer ${
                          myBid
                            ? "bg-amber-500 hover:bg-amber-600 text-white"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        }`}
                      >
                        {myBid ? "✏️ Update Bid" : "🤝 Submit Bid Quote"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* My Submitted Bids Tab */
          myBidsRfqs.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
              <span className="text-5xl">📄</span>
              <h3 className="text-xl font-bold">No Submitted Bids Yet</h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                ඔබ තවම කිසිදු හෝටලයක Quote එකකට Bidding ඉදිරිපත් කර නොමැත. "Available Hotel Requests" එකෙන් Bids ඉදිරිපත් කරන්න.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {myBidsRfqs.map((rfq) => {
                const myBid = rfq.bids.find(b => b.farmerId === (user?.id || user?._id));
                const isWon = rfq.acceptedBid?.farmerId === (user?.id || user?._id);

                return (
                  <div
                    key={rfq._id}
                    className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black">{rfq.cropName}</h3>
                          <span className="text-xs text-gray-500">({rfq.hotelName})</span>
                        </div>
                        <p className="text-xs text-gray-500">Required: {rfq.quantity} {rfq.unit} • Delivery by: 📅 {rfq.requiredDate}</p>
                      </div>

                      <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                        isWon ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" :
                        myBid.status === "rejected" ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300" :
                        "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      }`}>
                        {isWon ? "🏆 DEAL WON!" : myBid.status === "rejected" ? "❌ Not Accepted" : "⏳ Pending Hotel Review"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl text-xs">
                      <div>
                        <span className="text-gray-500 block">Hotel Target Rate</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">Rs. {rfq.targetBudgetPerUnit} /{rfq.unit}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">My Quoted Rate</span>
                        <span className="font-black text-emerald-600 text-base">Rs. {myBid.pricePerUnit} /{rfq.unit}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Total Quoted Value</span>
                        <span className="font-black text-gray-900 dark:text-white text-base">Rs. {(myBid.totalAmount || 0).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Delivery Timeframe</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">{myBid.deliveryDays} Day(s)</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* Modal for Submitting / Editing Bid */}
        {selectedRfq && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-700 space-y-6 relative">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">🤝 Submit Quote Bid</h3>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">{selectedRfq.cropName} ({selectedRfq.quantity} {selectedRfq.unit})</p>
                </div>
                <button
                  onClick={() => setSelectedRfq(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl text-xs space-y-1">
                <p className="text-gray-700 dark:text-gray-300">
                  🏢 Hotel: <span className="font-bold">{selectedRfq.hotelName}</span>
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  🎯 Hotel Target Price: <span className="font-bold text-emerald-600">Rs. {selectedRfq.targetBudgetPerUnit} /{selectedRfq.unit}</span>
                </p>
              </div>

              <form onSubmit={handleSubmitBid} className="space-y-4 text-sm">
                <div>
                  <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">
                    Your Quoted Price / {selectedRfq.unit} (Rs.) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 140"
                    value={bidForm.pricePerUnit}
                    onChange={(e) => setBidForm({ ...bidForm, pricePerUnit: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-lg text-emerald-600"
                  />
                  {bidForm.pricePerUnit && (
                    <p className="text-xs text-gray-500 mt-1">
                      Total Calculated Offer: <span className="font-bold text-gray-900 dark:text-white">Rs. {(Number(bidForm.pricePerUnit) * selectedRfq.quantity).toLocaleString()}</span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">Delivery Days</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="1"
                      value={bidForm.deliveryDays}
                      onChange={(e) => setBidForm({ ...bidForm, deliveryDays: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">Contact Phone</label>
                    <input
                      type="text"
                      placeholder="0771234567"
                      value={bidForm.farmerPhone}
                      onChange={(e) => setBidForm({ ...bidForm, farmerPhone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">Notes / Product Guarantee</label>
                  <textarea
                    rows="2"
                    placeholder="e.g. Freshly harvested tomorrow morning, 100% farm-direct guaranteed."
                    value={bidForm.notes}
                    onChange={(e) => setBidForm({ ...bidForm, notes: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  ></textarea>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setSelectedRfq(null)}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? "Sending Quote..." : "Submit Quote"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
}

"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminPayments() {
  const router = useRouter();
  const { lang, setLang } = useLanguage();
  const [adminUser, setAdminUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null); // for displaying mock receipt modal

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          if (u.role !== "admin") {
            router.push("/login");
          } else {
            setAdminUser(u);
          }
        } catch (e) {
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
    }
  }, [router]);

  async function fetchOrders() {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.success) {
        // Filter orders placed via bank transfer
        const bankOrders = data.data.filter(o => o.paymentMethod === "bank_transfer");
        setOrders(bankOrders);
      } else {
        setErrorMsg("ඇණවුම් දත්ත ලබාගැනීම අසාර්ථක විය / Failed to load orders.");
      }
    } catch (err) {
      setErrorMsg("පද්ධති සම්බන්ධතා දෝෂයකි / Network connection error.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleVerify = async (orderId, newStatus) => {
    setActionLoadingId(orderId);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(lang === "si" ? "ගෙවීම් තත්ත්වය සාර්ථකව යාවත්කාලීන කරන ලදී!" : "Payment verification updated successfully!");
        setSelectedReceipt(null);
        await fetchOrders();
      } else {
        setErrorMsg(data.error || "Failed to update payment status.");
      }
    } catch (err) {
      setErrorMsg("Network error during operation.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const text = {
    si: {
      title: "බැංකු ගෙවීම් තහවුරු කිරීම",
      subtitle: "හෝටල් සහ ගැනුම්කරුවන් විසින් උඩුගත කරන ලද බැංකු රිසිට්පත් පරීක්ෂා කර තහවුරු කරන්න.",
      tableId: "ඇණවුම් අංකය",
      tableBuyer: "ගැනුම්කරු",
      tableAmount: "ගෙවිය යුතු මුදල",
      tableReceipt: "ගෙවීම් පත්‍රිකාව",
      tableStatus: "ගෙවීම් තත්ත්වය",
      tableActions: "ක්‍රියාමාර්ග",
      btnApprove: "තහවුරු කරන්න (Verify)",
      btnReject: "ප්‍රතික්ෂේප කරන්න (Reject)",
      loading: "ගෙවීම් දත්ත පූරණය වෙමින් පවතී...",
      noOrders: "තහවුරු කිරීමට ඇති බැංකු ගෙවීම් කිසිවක් හමු නොවීය.",
      modalTitle: "බැංකු ගෙවීම් රිසිට්පත පරීක්ෂාව",
      verified: "තහවුරු කරන ලදී (Verified)",
      pending: "තහවුරු කිරීමට ඇත (Pending)",
      failed: "ප්‍රතික්ෂේපිත (Rejected)",
      discount: "වට්ටම"
    },
    en: {
      title: "Bank Receipt Verification",
      subtitle: "Review, approve, or decline bank transfer receipts uploaded by B2B buyers.",
      tableId: "Order ID",
      tableBuyer: "Buyer",
      tableAmount: "Total Payable",
      tableReceipt: "Receipt File",
      tableStatus: "Payment Status",
      tableActions: "Actions",
      btnApprove: "Verify Slip",
      btnReject: "Decline",
      loading: "Loading bank payment logs...",
      noOrders: "No bank transfer payments found to verify.",
      modalTitle: "Bank Transfer Receipt Preview",
      verified: "Verified",
      pending: "Pending Approval",
      failed: "Declined",
      discount: "Discount"
    }
  };

  const t = text[lang];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t.title}</h1>
            <p className="text-sm text-gray-500 mt-1">{t.subtitle}</p>
          </div>

          <button
            onClick={() => setLang(lang === "si" ? "en" : "si")}
            className="self-start sm:self-center bg-white hover:bg-gray-100 border border-gray-200 text-xs font-black px-4 py-2.5 rounded-xl transition cursor-pointer shadow-sm"
          >
            {lang === "si" ? "English 🌐" : "සිංහල 🌐"}
          </button>
        </div>

        {/* Messaging banners */}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-xs font-semibold">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Data Grid list */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 font-bold text-sm">{t.loading}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center text-gray-400 font-semibold bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <span className="text-6xl block mb-4">📄</span>
            <p>{t.noOrders}</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-4">
                    <th className="py-3 px-4">{t.tableId}</th>
                    <th className="py-3 px-4">{t.tableBuyer}</th>
                    <th className="py-3 px-4">{t.tableAmount}</th>
                    <th className="py-3 px-4">{t.tableReceipt}</th>
                    <th className="py-3 px-4">{t.tableStatus}</th>
                    <th className="py-3 px-4">{t.tableActions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs font-semibold text-gray-700">
                  {orders.map((order) => {
                    const buyerName = order.buyerId?.name || "B2B Hotel Buyer";
                    const buyerEmail = order.buyerId?.email || "N/A";
                    return (
                      <tr key={order._id} className="hover:bg-gray-50/50 transition">
                        <td className="py-4 px-4 font-mono font-bold text-gray-900 truncate max-w-[100px]">
                          #{order._id.substring(order._id.length - 8)}
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-extrabold text-gray-950 block">{buyerName}</span>
                          <span className="text-[10px] text-gray-400 font-bold block mt-0.5">{buyerEmail}</span>
                        </td>
                        <td className="py-4 px-4 text-emerald-600 font-black">
                          LKR {order.totalAmount.toLocaleString()}
                          {order.discountAmount > 0 && (
                            <span className="block text-[9px] text-indigo-600 font-bold mt-0.5">
                              ({t.discount}: -LKR {order.discountAmount.toLocaleString()})
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => setSelectedReceipt(order)}
                            className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-[10px] font-black text-gray-700 px-3 py-1.5 rounded-xl shadow-sm cursor-pointer"
                          >
                            👁️ {order.paymentReceipt || "receipt.jpg"}
                          </button>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-block px-2.5 py-1 rounded-full border text-[10px] font-extrabold ${
                            order.paymentStatus === "verified"
                              ? "bg-green-50 text-green-700 border-green-100"
                              : order.paymentStatus === "failed"
                              ? "bg-red-50 text-red-650 border-red-100 text-red-600"
                              : "bg-amber-50 text-amber-700 border-amber-100"
                          }`}>
                            {order.paymentStatus === "verified" 
                              ? t.verified 
                              : order.paymentStatus === "failed" 
                              ? t.failed 
                              : t.pending}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {order.paymentStatus === "pending" ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleVerify(order._id, "verified")}
                                disabled={actionLoadingId === order._id}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-[10px] shadow-md shadow-emerald-50 transition cursor-pointer disabled:bg-gray-400"
                              >
                                {t.btnApprove}
                              </button>
                              <button
                                onClick={() => handleVerify(order._id, "failed")}
                                disabled={actionLoadingId === order._id}
                                className="bg-white hover:bg-red-50 hover:text-red-600 border border-gray-200 text-gray-600 font-bold px-3 py-1.5 rounded-xl text-[10px] transition cursor-pointer disabled:bg-gray-400"
                              >
                                {t.btnReject}
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-gray-400 font-bold">Processed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Receipt Preview */}
        {selectedReceipt && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="text-base font-black text-gray-900">{t.modalTitle}</h3>
                <button 
                  onClick={() => setSelectedReceipt(null)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none p-1 cursor-pointer font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Simulated Bank Receipt Slip design */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 font-mono text-[10px] space-y-4 text-gray-700 relative overflow-hidden shadow-inner">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-100 to-transparent rounded-bl-full opacity-35"></div>
                <div className="text-center border-b border-dashed border-gray-200 pb-4">
                  <h4 className="font-sans font-black text-sm text-gray-900">BANK OF CEYLON</h4>
                  <p className="text-[9px] text-gray-400 font-sans mt-0.5">Corporate Wholesale Terminal</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>TXN REF NO:</span>
                    <span className="font-bold text-gray-900">TXN-9021{selectedReceipt._id.substring(0, 4).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DATE / TIME:</span>
                    <span className="font-bold text-gray-900">{new Date(selectedReceipt.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>FROM ACCOUNT:</span>
                    <span className="font-bold text-gray-900">HOTEL-B2B-A/C-••••4910</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TO ACCOUNT:</span>
                    <span className="font-bold text-gray-900">FARM-TO-TABLE-A/C-••••1021</span>
                  </div>
                  <div className="flex justify-between">
                    <span>FILE ATTACHMENT:</span>
                    <span className="font-bold text-indigo-600 truncate max-w-[150px]">{selectedReceipt.paymentReceipt || "receipt.jpg"}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-200 pt-4 text-center">
                  <span className="text-xs font-black text-emerald-600 text-sm block">LKR {selectedReceipt.totalAmount.toLocaleString()}</span>
                  <span className="text-[8px] text-gray-400 uppercase tracking-wider block mt-1">Transaction Successful</span>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold py-3 rounded-xl text-xs transition cursor-pointer text-center"
                >
                  {lang === "si" ? "පිටවන්න" : "Close"}
                </button>
                {selectedReceipt.paymentStatus === "pending" && (
                  <button
                    onClick={() => handleVerify(selectedReceipt._id, "verified")}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition cursor-pointer text-center shadow-md shadow-emerald-50"
                  >
                    {t.btnApprove}
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

    </div>
  );
}

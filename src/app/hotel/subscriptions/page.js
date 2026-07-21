"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function HotelSubscriptions() {
  const router = useRouter();
  const { lang, setLang } = useLanguage();
  const [buyerId, setBuyerId] = useState("");
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Status and Alerts
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // Simulation loading states
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState("");

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
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
    }
  }, [router]);

  const text = {
    si: {
      title: "දායකත්ව සහ ස්වයංක්‍රීය ඇණවුම්",
      subtitle: "සතිපතා හෝ මාසිකව ස්වයංක්‍රීයව සිදුවන ඇණවුම් කාලසටහන් කළමනාකරණය කරන්න.",
      loading: "දායකත්ව තොරතුරු පූරණය වෙමින් පවතී...",
      noSubs: "තවමත් කිසිදු දායකත්ව ඇණවුමක් සක්‍රීය කර නොමැත.",
      frequency: "වාර ගණන",
      weekly: "සතිපතා (Weekly)",
      monthly: "මාසික (Monthly)",
      status: "තත්ත්වය",
      active: "ක්‍රියාකාරී",
      paused: "අත්හිටුවා ඇත",
      lastTrigger: "අවසන් වරට ක්‍රියාත්මක වූ දිනය",
      nextTrigger: "මීළඟ ස්වයංක්‍රීය ඇණවුම",
      total: "සංසරණ මුළු අගය",
      pauseBtn: "තාවකාලිකව නවත්වන්න",
      resumeBtn: "යලි ක්‍රියාත්මක කරන්න",
      deleteBtn: "අවලංගු කරන්න",
      deleteConfirm: "ඔබට මෙම දායකත්ව ඇණවුම අවලංගු කිරීමට අවශ්‍යද?",
      simTitle: "ස්වයංක්‍රීය ඇණවුම් ක්‍රියාකාරී පරීක්ෂණ මෙවලම (Simulate Cron)",
      simDesc: "මීළඟ ඇණවුම් දිනය එනතුරු බලා නොසිට, සක්‍රීය දායකත්වයන් හරහා නව ඇණවුම් ක්ෂණිකව උත්පාදනය කිරීමට මෙම බොත්තම ක්ලික් කරන්න.",
      simBtn: "ස්වයංක්‍රීය ධාවනය අත්හදා බලන්න",
      simSuccess: "ස්වයංක්‍රීය ඇණවුම් සාර්ථකව උත්පාදනය විය! ඇණවුම් පිටුවට යන්න...",
      never: "තවම නැත",
      items: "ඇතුළත් අස්වනු"
    },
    en: {
      title: "Recurring Order Subscriptions",
      subtitle: "Manage your automated weekly and monthly wholesale pre-order replenishment schedules.",
      loading: "Fetching active schedules...",
      noSubs: "No recurring order subscriptions created yet.",
      frequency: "Frequency",
      weekly: "Weekly replenishment",
      monthly: "Monthly replenishment",
      status: "Status",
      active: "Active",
      paused: "Paused",
      lastTrigger: "Last auto-processed",
      nextTrigger: "Next automated schedule",
      total: "Recurring Total Amount",
      pauseBtn: "Pause Schedule",
      resumeBtn: "Resume Schedule",
      deleteBtn: "Cancel Subscription",
      deleteConfirm: "Are you sure you want to cancel this recurring subscription schedule?",
      simTitle: "Replenishment Cron Run Simulation Utility",
      simDesc: "Manually bypass schedule dates to test and instantly trigger crop order creation for active subscriptions.",
      simBtn: "Simulate Cron Trigger",
      simSuccess: "Cron simulation completed! Created new orders. Redirecting...",
      never: "Never processed yet",
      items: "Replenishment Items"
    }
  };

  const t = text[lang];

  const fetchSubscriptions = async () => {
    if (!buyerId) return;
    try {
      const res = await fetch(`/api/subscriptions?buyerId=${buyerId}`);
      const data = await res.json();
      if (data.success) {
        setSubscriptions(data.data);
      } else {
        setErrorMsg(data.error);
      }
    } catch (err) {
      console.error("Subscription load error:", err);
      setErrorMsg("Failed to load subscriptions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (buyerId) {
      fetchSubscriptions();
    }
  }, [buyerId]);

  const handleToggleStatus = async (sub) => {
    const nextStatus = sub.status === "active" ? "paused" : "active";
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch(`/api/subscriptions/${sub._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(
          lang === "si"
            ? `දායකත්වය සාර්ථකව ${nextStatus === "active" ? "සක්‍රිය" : "තාවකාලිකව නවත්වන"} ලදී.`
            : `Subscription schedule successfully ${nextStatus === "active" ? "resumed" : "paused"}.`
        );
        fetchSubscriptions();
      } else {
        setErrorMsg(data.error);
      }
    } catch (err) {
      setErrorMsg("Failed to toggle status.");
    }
  };

  const handleDelete = async (subId) => {
    if (!confirm(t.deleteConfirm)) return;
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch(`/api/subscriptions/${subId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(
          lang === "si"
            ? "දායකත්වය සාර්ථකව අවලංගු කරන ලදී."
            : "Subscription schedule cancelled successfully."
        );
        fetchSubscriptions();
      } else {
        setErrorMsg(data.error);
      }
    } catch (err) {
      setErrorMsg("Failed to delete subscription.");
    }
  };

  const handleSimulateCron = async () => {
    if (simulationLoading || !buyerId) return;
    setSimulationLoading(true);
    setSimulationResult("");
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/subscriptions/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: true, buyerId })
      });
      const data = await res.json();

      if (data.success) {
        setSimulationResult(data.message);
        setSuccessMsg(t.simSuccess);
        fetchSubscriptions();
        
        setTimeout(() => {
          router.push("/hotel/orders");
        }, 2200);
      } else {
        setErrorMsg(data.error || "Simulation run failed.");
      }
    } catch (err) {
      setErrorMsg("Trigger simulation request failed.");
    } finally {
      setSimulationLoading(false);
    }
  };

  return (
    <div className="space-y-8 relative text-gray-800 animate-in fade-in duration-200">
      {/* Language Toggle Button */}
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

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3.5 rounded-2xl flex items-center gap-3 text-sm font-semibold shadow-sm animate-in fade-in duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3.5 rounded-2xl flex items-center gap-3 text-sm font-semibold shadow-sm animate-in fade-in duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns: Subscriptions list */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="py-24 text-center bg-white border border-gray-100 rounded-3xl shadow-sm">
              <div className="h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-500 font-semibold text-sm">{t.loading}</p>
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="py-16 text-center text-gray-400 font-bold bg-white border border-gray-100 rounded-3xl shadow-sm p-8 flex flex-col items-center">
              <span className="text-5xl mb-4 text-gray-300">📅</span>
              <p className="text-gray-500 text-sm">{t.noSubs}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {subscriptions.map((sub) => {
                const nextRun = new Date(sub.nextTrigger).toLocaleDateString();
                const lastRun = sub.lastTriggered ? new Date(sub.lastTriggered).toLocaleDateString() : t.never;
                
                return (
                  <div key={sub._id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition space-y-5 animate-in fade-in duration-200">
                    
                    {/* Header: Badge states */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-50 pb-4">
                      <div className="flex items-center gap-3">
                        <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 capitalize border border-indigo-100">
                          {sub.frequency === "weekly" ? t.weekly : t.monthly}
                        </span>
                        <span className={`px-3.5 py-1.5 rounded-full text-xs font-black border ${
                          sub.status === "active" 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                            : "bg-amber-50 text-amber-700 border-amber-100"
                        }`}>
                          {sub.status === "active" ? t.active : t.paused}
                        </span>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(sub)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                            sub.status === "active"
                              ? "bg-white text-amber-600 border-amber-200 hover:bg-amber-50/20"
                              : "bg-emerald-600 text-white border-transparent hover:bg-emerald-700"
                          }`}
                        >
                          {sub.status === "active" ? t.pauseBtn : t.resumeBtn}
                        </button>
                        <button
                          onClick={() => handleDelete(sub._id)}
                          className="px-3 py-1.5 bg-red-50 text-red-650 hover:bg-red-100/50 rounded-xl text-xs font-bold transition border border-red-100 cursor-pointer"
                        >
                          {t.deleteBtn}
                        </button>
                      </div>
                    </div>

                    {/* Body: Items included */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">{t.items}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {sub.items.map((item) => (
                          <div key={item.cropId} className="flex items-center justify-between bg-gray-50 border border-gray-100/60 p-3 rounded-2xl">
                            <div>
                              <span className="font-bold text-gray-900 block text-xs">{item.name}</span>
                              <span className="text-[10px] text-gray-400 font-semibold mt-0.5">LKR {item.price}/Kg</span>
                            </div>
                            <span className="text-xs font-black text-emerald-600">{item.quantity} Kg</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Timeline Run Stats Footer */}
                    <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-4 text-xs font-semibold text-gray-500">
                      <div>
                        <span>{t.lastTrigger}:</span>
                        <span className="text-gray-900 block mt-0.5 font-bold">{lastRun}</span>
                      </div>
                      <div className="text-right">
                        <span>{t.nextTrigger}:</span>
                        <span className="text-indigo-600 block mt-0.5 font-black">{nextRun}</span>
                      </div>
                    </div>

                    {/* Recurring Total Price */}
                    <div className="flex items-center justify-between border-t border-dashed border-gray-100 pt-4">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.total}</span>
                      <span className="text-lg font-black text-emerald-600">LKR {sub.totalAmount.toLocaleString()}</span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Simulation/Demo Testing Utility */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-fit space-y-6">
          <div className="space-y-4">
            <div className="h-12 w-12 bg-amber-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-amber-100">
              ⚡
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-snug">{t.simTitle}</h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">{t.simDesc}</p>
            </div>
            
            {simulationResult && (
              <div className="bg-indigo-50 border border-indigo-150 text-indigo-800 p-3.5 rounded-2xl text-xs font-bold leading-normal">
                🤖 {simulationResult}
              </div>
            )}
          </div>

          <button
            onClick={handleSimulateCron}
            disabled={simulationLoading || subscriptions.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 text-white font-bold py-3.5 rounded-xl transition cursor-pointer text-sm shadow-md shadow-emerald-50"
          >
            {simulationLoading ? "Running Simulation..." : t.simBtn}
          </button>
        </div>

      </div>
    </div>
  );
}

"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const { lang, setLang } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          setIsLoggedIn(true);
          setUserRole(u.role || "");
        } catch (e) {
          console.error("Error loading user:", e);
        }
      }
    }
  }, []);

  const content = {
    si: {
      badge: "🌱 100% ශ්‍රී ලාංකීය නැවුම් අස්වනු",
      titlePre: "ගොවිබිමෙන් කෙලින්ම",
      titlePost: "ඔබේ මේසයට",
      desc: "අතරමැදියන්ගෙන් තොරව, ලංකාවේ දේශීය ගොවීන්ගේ නැවුම් එළවළු සහ පළතුරු සාධාරණ මිලකට ඔබේ නිවසටම හෝ හෝටලයටම ගෙන්වා ගන්න.",
      btnBuy: "අස්වනු මිලදී ගන්න",
      btnRegister: "ගොවියෙකු ලෙස එකතු වන්න",
      btnDashboard: "මගේ පාලක පුවරුව",
      featuresTitle: "අපගේ විශේෂාංග",
      featuresDesc: "ගොවීන්, ගැනුම්කරුවන් සහ ප්‍රවාහන සහකරුවන් එකට එකතු කරන නවීන කෘෂිකාර්මික පද්ධතිය.",
      featureGradingTitle: "අස්වනු තත්ත්ව සහතික",
      featureGradingDesc: "කාබනික (Organic), වස විස නැති (Pesticide-Free) හෝ Grade A/B/C තත්ත්වයන් අනුව අස්වැන්න තෝරාගැනීමේ පහසුව.",
      featureDiscountTitle: "තොග ඇණවුම් වට්ටම්",
      featureDiscountDesc: "හෝටල් සහ B2B ගැනුම්කරුවන්ට වැඩි ප්‍රමාණයක් (Kg) මිලදී ගැනීමේදී 5%, 10% හෝ 15% ක ස්වයංක්‍රීය වට්ටම්.",
      featurePaymentTitle: "විවිධ ගෙවීම් ක්‍රමවේද",
      featurePaymentDesc: "Credit Card, LankaQR හෝ බැංකු රිසිට්පත් උඩුගත කර පාලකයා හරහා තහවුරු කරගැනීමේ පහසුකම.",
      featureTrackingTitle: "සජීවී ඇණවුම් ලුහුබැඳීම",
      featureTrackingDesc: "ඇණවුම රැගෙන එන ඩ්‍රයිවර්ගේ වත්මන් පිහිටීම සිතියමක් (Interactive Leaflet Map) මඟින් සජීවීව බලාගැනීම.",
      statsFarmers: "ලියාපදිංචි ගොවීන්",
      statsOrders: "සාර්ථක ඇණවුම්",
      statsKg: "බෙදාහළ අස්වනු ප්‍රමාණය"
    },
    en: {
      badge: "🌱 100% Fresh Sri Lankan Harvest",
      titlePre: "Straight from the Farm",
      titlePost: "To Your Table",
      desc: "Get fresh fruits and vegetables directly from local Sri Lankan farmers to your home or hotel. Transparent pricing without middle-men.",
      btnBuy: "Shop Harvest",
      btnRegister: "Join as a Farmer",
      btnDashboard: "Go to Dashboard",
      featuresTitle: "Core Features",
      featuresDesc: "A modern digital marketplace connecting farmers, buyers, and delivery partners seamlessly.",
      featureGradingTitle: "Quality & Organic Badges",
      featureGradingDesc: "Filter crops easily by quality grading (Grade A, B, C) or organic and pesticide-free status.",
      featureDiscountTitle: "Bulk Wholesale Discounts",
      featureDiscountDesc: "Automated tiered discounts (5%, 10%, 15% off) for B2B hotels and restaurants making bulk purchases.",
      featurePaymentTitle: "Flexible Payments Gateway",
      featurePaymentDesc: "Pay with mock Card inputs, LankaQR scanning, or bank transfer slip upload verified by administrators.",
      featureTrackingTitle: "Live Delivery Tracking",
      featureTrackingDesc: "Track your active shipment on an interactive map showing the driver's vehicle moving in real-time.",
      statsFarmers: "Registered Farmers",
      statsOrders: "Successful Deliveries",
      statsKg: "Kilograms Distributed"
    },
    ta: {
      badge: "🌱 100% புதிய இலங்கை விளைச்சல்",
      titlePre: "விவசாய நிலத்தில் இருந்து",
      titlePost: "உங்கள் மேஜைக்கு",
      desc: "இடைத்தரகர்கள் இன்றி, இலங்கையின் உள்ளூர் விவசாயிகளிடமிருந்து புதிய காய்கறிகள் மற்றும் பழங்களை நியாயமான விலையில் பெறுங்கள்.",
      btnBuy: "விளைச்சலை வாங்குங்கள்",
      btnRegister: "விவசாயியாக இணையுங்கள்",
      btnDashboard: "என் டாஷ்போர்டு",
      featuresTitle: "சிறப்பு அம்சங்கள்",
      featuresDesc: "விவசாயிகள், வாங்குபவர்கள் மற்றும் டெலிவரி பங்காளிகளை இணைக்கும் நவீன விவசாய அமைப்பு.",
      featureGradingTitle: "தர சான்றிதழ்கள்",
      featureGradingDesc: "ஆர்கானிக் (Organic) அல்லது Grade A/B/C தரம் அடிப்படையில் விளைச்சலைத் தேர்ந்தெடுக்கும் வசதி.",
      featureDiscountTitle: "மொத்த ஆர்டர் தள்ளுபடிகள்",
      featureDiscountDesc: "ஹோட்டல்கள் மற்றும் B2B வாங்குபவர்களுக்கு 5%, 10% அல்லது 15% தானியங்கி தள்ளுபடி.",
      featurePaymentTitle: "நெகிழ்வான கட்டண முறைகள்",
      featurePaymentDesc: "கார்டு, LankaQR அல்லது வங்கிப் ரசீது மூலம் கட்டணம் செலுத்தும் வசதி.",
      featureTrackingTitle: "நேரலை கண்காணிப்பு",
      featureTrackingDesc: "உங்கள் ஆர்டரை நேரலை வரைபடம் மூலம் கண்காணிக்கவும்.",
      statsFarmers: "பதிவுசெய்த விவசாயிகள்",
      statsOrders: "வெற்றிகரமான டெலிவரிகள்",
      statsKg: "வினியோகிக்கப்பட்ட அளவு (Kg)"
    }
  };

  const t = content[lang] || content.en || content.si;

  return (
    <>
      <Navbar lang={lang} setLang={setLang} />
      
      <main className="bg-gradient-to-b from-green-50 via-white to-white text-gray-800 relative min-h-screen pb-20">
        
        {/* Decorative background grids */}
        <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-emerald-100/30 to-transparent pointer-events-none -z-10"></div>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-16 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-center lg:text-left">
            
            {/* Left Copywrite Column */}
            <div className="space-y-6">
              <span className="inline-flex bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                {t.badge}
              </span>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-tight tracking-tight">
                {t.titlePre} <br />
                <span className="bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">{t.titlePost}</span>
              </h1>
              
              <p className="text-sm sm:text-base text-gray-600 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                {t.desc}
              </p>

              {/* Action buttons */}
              <div className="pt-4 flex flex-wrap justify-center lg:justify-start gap-4">
                <Link href="/marketplace">
                  <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-emerald-100 transition duration-300 cursor-pointer text-xs">
                    {t.btnBuy}
                  </button>
                </Link>

                {isLoggedIn ? (
                  <Link href={userRole === "farmer" ? "/farmer" : userRole === "hotel" ? "/hotel" : userRole === "driver" ? "/driver" : userRole === "admin" ? "/admin" : "/marketplace"}>
                    <button className="bg-white hover:bg-gray-50 text-emerald-700 border border-emerald-250 border-emerald-200 font-bold px-8 py-3.5 rounded-2xl transition duration-300 cursor-pointer shadow-sm text-xs">
                      {t.btnDashboard}
                    </button>
                  </Link>
                ) : (
                  <Link href="/register">
                    <button className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-250 font-bold px-8 py-3.5 rounded-2xl transition duration-300 cursor-pointer shadow-sm text-xs border-gray-200">
                      {t.btnRegister}
                    </button>
                  </Link>
                )}
              </div>
            </div>

            {/* Right Image Presentation Column */}
            <div className="relative group mx-auto lg:ml-auto max-w-lg w-full">
              {/* Decorative green blur behind image */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-600 to-green-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              
              <div className="relative bg-white border border-gray-150 rounded-3xl p-3 shadow-2xl overflow-hidden">
                <img 
                  src="/sri_lanka_organic_farm.png" 
                  alt="Sri Lankan Organic Farming Landscape"
                  className="w-full h-80 object-cover rounded-2xl"
                />
                
                {/* Visual badge overlaying image */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/50 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-gray-400 block">Economic Center Direct</span>
                    <span className="text-xs font-black text-gray-900 block mt-0.5">Dambulla & Keppetipola Wholesale</span>
                  </div>
                  <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-xl shadow-sm">
                    ACTIVE
                  </span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Stats counter */}
        <section className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-3 gap-6 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm text-center">
            <div>
              <p className="text-2xl md:text-3xl font-black text-emerald-600">120+</p>
              <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">{t.statsFarmers}</p>
            </div>
            <div className="border-x border-gray-100">
              <p className="text-2xl md:text-3xl font-black text-emerald-600">1,850+</p>
              <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">{t.statsOrders}</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-black text-emerald-600">15,000+</p>
              <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">{t.statsKg}</p>
            </div>
          </div>
        </section>

        {/* Features Showcase Grid */}
        <section className="max-w-7xl mx-auto px-6 py-16 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t.featuresTitle}</h2>
            <p className="text-sm text-gray-500 font-semibold leading-relaxed">{t.featuresDesc}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1 */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition duration-300 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl font-bold">
                🌿
              </div>
              <h3 className="text-sm font-black text-gray-900">{t.featureGradingTitle}</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-semibold">{t.featureGradingDesc}</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition duration-300 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-750 text-indigo-700 flex items-center justify-center text-xl font-bold">
                🏢
              </div>
              <h3 className="text-sm font-black text-gray-900">{t.featureDiscountTitle}</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-semibold">{t.featureDiscountDesc}</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition duration-300 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center text-xl font-bold">
                💳
              </div>
              <h3 className="text-sm font-black text-gray-900">{t.featurePaymentTitle}</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-semibold">{t.featurePaymentDesc}</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition duration-300 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center text-xl font-bold">
                🗺️
              </div>
              <h3 className="text-sm font-black text-gray-900">{t.featureTrackingTitle}</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-semibold">{t.featureTrackingDesc}</p>
            </div>

          </div>
        </section>

      </main>
    </>
  );
}

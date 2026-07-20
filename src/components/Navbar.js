"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import NotificationBell from "./NotificationBell";

export default function Navbar({ lang: propLang, setLang: propSetLang }) {
  const router = useRouter();
  const [localLang, setLocalLang] = useState("si");
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  // Sync lang with props if available, otherwise use local state
  const lang = propLang || localLang;
  const setLang = propSetLang || setLocalLang;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Error parsing user in Navbar:", e);
        }
      }

      // Load cart count dynamically
      const updateCartCount = () => {
        const storedCart = localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : {};
        const count = Object.keys(storedCart).length;
        setCartCount(count);
      };

      updateCartCount();
      window.addEventListener("cart-updated", updateCartCount);
      return () => window.removeEventListener("cart-updated", updateCartCount);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  const text = {
    si: {
      brand: "Farm To Table",
      marketplace: "වෙළඳපොල",
      login: "ඇතුල් වන්න",
      register: "ලියාපදිංචි වන්න",
      logout: "පිටවන්න",
      dashboard: "පාලක පුවරුව",
      b2bPortal: "B2B තොග ඇණවුම්",
      adminDashboard: "පාලක මණ්ඩලය",
      roles: {
        farmer: "ගොවි මහතා",
        hotel: "හෝටල්/B2B",
        customer: "පාරිභෝගිකයා",
        admin: "පාලකයා",
        driver: "ප්‍රවාහන සහකරු",
      },
    },
    ta: {
      brand: "Farm To Table",
      marketplace: "சந்தை",
      login: "உள்நுழைய",
      register: "பதிவு செய்ய",
      logout: "வெளியேறு",
      dashboard: "டாஷ்போர்டு",
      b2bPortal: "B2B போர்டல்",
      adminDashboard: "நிர்வாகி பலகை",
      roles: {
        farmer: "விவசாயி",
        hotel: "ஹோட்டல்/B2B",
        customer: "வாடிக்கையாளர்",
        admin: "நிர்வாகி",
        driver: "டெலிவரி பார்ட்னர்",
      },
    },
    en: {
      brand: "Farm To Table",
      marketplace: "Marketplace",
      login: "Sign In",
      register: "Register",
      logout: "Sign Out",
      dashboard: "Dashboard",
      b2bPortal: "B2B Panel",
      adminDashboard: "Admin Board",
      roles: {
        farmer: "Farmer",
        hotel: "Hotel/B2B",
        customer: "Customer",
        admin: "Administrator",
        driver: "Delivery Partner",
      },
    },
  };

  const t = text[lang] || text.si;

  return (
    <header className="sticky top-0 z-50 bg-white/85 dark:bg-gray-900/85 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm w-full">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl transition-transform group-hover:scale-110 duration-200">🌱</span>
          <span className="font-black text-xl text-gray-900 dark:text-white tracking-tight leading-none bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
            {t.brand}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/marketplace"
            className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-emerald-600 transition"
          >
            {t.marketplace}
          </Link>

          {user && (user.role === "hotel" || user.role === "customer") && (
            <Link
              href="/orders"
              className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-emerald-600 transition"
            >
              {lang === "si" ? "මගේ ඇණවුම්" : lang === "ta" ? "எனது ஆர்டர்கள்" : "My Orders"}
            </Link>
          )}

          {user && (user.role === "hotel" || user.role === "customer") && (
            <Link
              href="/cart"
              className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-emerald-600 transition"
            >
              🛒 {lang === "si" ? `කරත්තය (${cartCount})` : lang === "ta" ? `கார்ட் (${cartCount})` : `Cart (${cartCount})`}
            </Link>
          )}

          {/* Real-time Notification Bell & Language Switcher */}
          <div className="flex items-center gap-2 border-l border-gray-200 dark:border-gray-700 pl-3">
            <NotificationBell />
            <LanguageSwitcher onLangChange={(newLang) => setLang(newLang)} />
            <ThemeToggle />
          </div>

          {user && (user.role === "hotel" || user.role === "customer") && (
            <Link
              href="/chat"
              className="text-xs sm:text-sm font-bold text-gray-600 hover:text-emerald-600 transition"
            >
              💬 {lang === "si" ? "පණිවිඩ" : "Messages"}
            </Link>
          )}

          {/* Conditional Auth Links */}
          {user ? (
            <div className="flex items-center gap-2.5 sm:gap-4 border-l border-gray-150 pl-2.5 sm:pl-4">
              <span className="text-xs font-semibold text-gray-500 hidden md:inline">
                👋 {user.name} ({t.roles[user.role] || user.role})
              </span>
              
              {user.role === "farmer" && (
                <Link
                  href="/farmer"
                  className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] sm:text-xs font-bold px-3 py-1.5 sm:py-2 rounded-xl hover:bg-emerald-100 transition"
                >
                  {t.dashboard}
                </Link>
              )}

              {user.role === "hotel" && (
                <Link
                  href="/hotel"
                  className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] sm:text-xs font-bold px-3 py-1.5 sm:py-2 rounded-xl hover:bg-emerald-100 transition"
                >
                  {t.b2bPortal}
                </Link>
              )}

              {user.role === "driver" && (
                <Link
                  href="/driver"
                  className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] sm:text-xs font-bold px-3 py-1.5 sm:py-2 rounded-xl hover:bg-emerald-100 transition"
                >
                  {t.dashboard}
                </Link>
              )}

              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] sm:text-xs font-bold px-3 py-1.5 sm:py-2 rounded-xl hover:bg-emerald-100 transition"
                >
                  {t.adminDashboard}
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="bg-gray-50 hover:bg-red-50 hover:text-red-600 text-gray-600 border border-gray-100 text-[11px] sm:text-xs font-bold px-3 py-1.5 sm:py-2 rounded-xl transition cursor-pointer"
              >
                {t.logout}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3 border-l border-gray-150 pl-2.5 sm:pl-4">
              <Link
                href="/login"
                className="text-[11px] sm:text-xs font-bold text-gray-600 hover:text-emerald-600 transition px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl"
              >
                {t.login}
              </Link>
              <Link
                href="/register"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] sm:text-xs font-bold px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl transition shadow-md shadow-emerald-50"
              >
                {t.register}
              </Link>
            </div>
          )}

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === "si" ? "en" : "si")}
            className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-[10px] sm:text-xs font-black px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl transition cursor-pointer"
          >
            {lang === "si" ? "EN 🌐" : "සිංහල 🌐"}
          </button>
        </nav>

      </div>
    </header>
  );
}

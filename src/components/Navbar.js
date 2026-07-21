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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    setMobileMenuOpen(false);
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
      orders: "මගේ ඇණවුම්",
      cart: "කරත්තය",
      messages: "පණිවිඩ",
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
      orders: "எனது ஆர்டர்கள்",
      cart: "கார்ட்",
      messages: "செய்திகள்",
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
      orders: "My Orders",
      cart: "Cart",
      messages: "Messages",
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
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm w-full max-w-full overflow-x-clip">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <span className="text-2xl transition-transform group-hover:scale-110 duration-200">🌱</span>
          <span className="font-black text-lg sm:text-xl text-gray-900 dark:text-white tracking-tight leading-none bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
            {t.brand}
          </span>
        </Link>

        {/* Desktop Navigation (Visible on md and larger) */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6">
          <Link
            href="/marketplace"
            className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
          >
            {t.marketplace}
          </Link>

          {user && (user.role === "hotel" || user.role === "customer") && (
            <Link
              href="/orders"
              className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
            >
              {t.orders}
            </Link>
          )}

          {user && (user.role === "hotel" || user.role === "customer") && (
            <Link
              href="/cart"
              className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition flex items-center gap-1"
            >
              🛒 <span>{t.cart} ({cartCount})</span>
            </Link>
          )}

          {user && (user.role === "hotel" || user.role === "customer") && (
            <Link
              href="/chat"
              className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition flex items-center gap-1"
            >
              💬 <span>{t.messages}</span>
            </Link>
          )}

          {/* Tools: NotificationBell, LanguageSwitcher, ThemeToggle */}
          <div className="flex items-center gap-2 border-l border-gray-200 dark:border-gray-700 pl-3">
            <NotificationBell />
            <LanguageSwitcher onLangChange={(newLang) => setLang(newLang)} />
            <ThemeToggle />
          </div>

          {/* Conditional Auth Links */}
          {user ? (
            <div className="flex items-center gap-3 border-l border-gray-200 dark:border-gray-700 pl-3">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 hidden lg:inline">
                👋 {user.name}
              </span>
              
              {user.role === "farmer" && (
                <Link
                  href="/farmer"
                  className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition"
                >
                  {t.dashboard}
                </Link>
              )}

              {user.role === "hotel" && (
                <Link
                  href="/hotel"
                  className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition"
                >
                  {t.b2bPortal}
                </Link>
              )}

              {user.role === "driver" && (
                <Link
                  href="/driver"
                  className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition"
                >
                  {t.dashboard}
                </Link>
              )}

              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition"
                >
                  {t.adminDashboard}
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="bg-gray-50 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 border border-gray-200 dark:border-gray-700 text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer"
              >
                {t.logout}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 border-l border-gray-200 dark:border-gray-700 pl-3">
              <Link
                href="/login"
                className="text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-emerald-600 transition px-3 py-1.5 rounded-xl"
              >
                {t.login}
              </Link>
              <Link
                href="/register"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-md shadow-emerald-50"
              >
                {t.register}
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Header Controls (Visible on mobile screens) */}
        <div className="flex md:hidden items-center gap-2">
          <NotificationBell />
          <ThemeToggle />
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-5 space-y-4 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <span className="text-xs font-extrabold uppercase text-gray-400">Language / 🌐</span>
            <LanguageSwitcher onLangChange={(newLang) => setLang(newLang)} />
          </div>

          <div className="flex flex-col space-y-3">
            <Link
              href="/marketplace"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-emerald-600 py-1 transition"
            >
              🌱 {t.marketplace}
            </Link>

            {user && (user.role === "hotel" || user.role === "customer") && (
              <Link
                href="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-emerald-600 py-1 transition"
              >
                📦 {t.orders}
              </Link>
            )}

            {user && (user.role === "hotel" || user.role === "customer") && (
              <Link
                href="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-emerald-600 py-1 transition"
              >
                🛒 {t.cart} ({cartCount})
              </Link>
            )}

            {user && (user.role === "hotel" || user.role === "customer") && (
              <Link
                href="/chat"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-emerald-600 py-1 transition"
              >
                💬 {t.messages}
              </Link>
            )}
          </div>

          <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2">
            {user ? (
              <>
                <div className="text-xs font-semibold text-gray-500 pb-1">
                  Logged in as: <span className="font-extrabold text-gray-800 dark:text-gray-200">{user.name}</span> ({t.roles[user.role] || user.role})
                </div>

                {user.role === "farmer" && (
                  <Link
                    href="/farmer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full bg-emerald-600 text-white text-center font-bold text-xs py-2.5 rounded-xl shadow-sm"
                  >
                    {t.dashboard}
                  </Link>
                )}

                {user.role === "hotel" && (
                  <Link
                    href="/hotel"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full bg-emerald-600 text-white text-center font-bold text-xs py-2.5 rounded-xl shadow-sm"
                  >
                    {t.b2bPortal}
                  </Link>
                )}

                {user.role === "driver" && (
                  <Link
                    href="/driver"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full bg-emerald-600 text-white text-center font-bold text-xs py-2.5 rounded-xl shadow-sm"
                  >
                    {t.dashboard}
                  </Link>
                )}

                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full bg-emerald-600 text-white text-center font-bold text-xs py-2.5 rounded-xl shadow-sm"
                  >
                    {t.adminDashboard}
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-red-50 text-gray-700 dark:text-gray-300 hover:text-red-600 font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
                >
                  {t.logout}
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-center font-bold text-xs py-2.5 rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  {t.login}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full bg-emerald-600 text-white text-center font-bold text-xs py-2.5 rounded-xl shadow-sm"
                >
                  {t.register}
                </Link>
              </div>
            )}
          </div>

        </div>
      )}
    </header>
  );
}

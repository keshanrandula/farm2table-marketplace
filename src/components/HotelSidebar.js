"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import NotificationBell from "./NotificationBell";

export default function HotelSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      name: "Wholesale Store",
      nameSi: "තොග වෙළඳපොල",
      path: "/hotel",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      )
    },
    {
      name: "My Orders",
      nameSi: "මගේ ඇණවුම්",
      path: "/hotel/orders",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      name: "Bulk Bidding / RFQ",
      nameSi: "තොග වෙන්දේසි / Quote",
      path: "/hotel/rfq",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5 5 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5 5 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      )
    },
    {
      name: "Subscriptions",
      nameSi: "දායකත්ව ඇණවුම්",
      path: "/hotel/subscriptions",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      name: "Messages",
      nameSi: "පණිවිඩ",
      path: "/hotel/chat",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    },
    {
      name: "Marketplace",
      nameSi: "පාරිභෝගික වෙළඳපොල",
      path: "/marketplace",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      )
    }
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="flex md:hidden items-center justify-between bg-emerald-700 text-white px-6 py-4 shadow-md w-full">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌱</span>
          <span className="font-extrabold text-lg tracking-wider">Hotel B2B Panel</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="focus:outline-none p-1 rounded hover:bg-emerald-800 transition cursor-pointer"
        >
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 md:relative md:translate-x-0 flex flex-col justify-between shadow-xl md:shadow-none min-h-screen md:min-h-0
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div>
          {/* Logo Brand */}
          <div className="hidden md:flex items-center gap-2.5 px-8 py-8 border-b border-gray-100">
            <span className="text-3xl">🌱</span>
            <div>
              <h2 className="font-black text-xl text-gray-900 tracking-tight leading-tight">Farm To Table</h2>
              <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Hotel B2B Portal</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-8 px-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 group
                    ${isActive 
                      ? "bg-emerald-50 text-emerald-700 shadow-sm border-l-4 border-emerald-600" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
                  `}
                >
                  <span className={`transition-colors duration-200 ${isActive ? "text-emerald-600" : "text-gray-400 group-hover:text-gray-600"}`}>
                    {item.icon}
                  </span>
                  <div className="flex flex-col">
                    <span className="leading-tight">{item.name}</span>
                    <span className="text-[10px] opacity-75 font-normal -mt-0.5 leading-none">{item.nameSi}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Info / Exit Button */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50 mt-auto space-y-3">
          {/* Account Profile Badge & Notification Bell */}
          <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-2.5 rounded-2xl border border-gray-200/60 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-xs shadow-inner">
                🏨
              </div>
              <div className="truncate">
                <h4 className="text-xs font-extrabold text-gray-900 dark:text-white truncate">Hotel Account</h4>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">● B2B Portal Active</p>
              </div>
            </div>
            <NotificationBell />
          </div>

          {/* Preferences Controls Row: Language & Dark Theme */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <LanguageSwitcher direction="up" />
            <ThemeToggle />
          </div>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer shadow-sm"
          >
            ← Back to Home
          </Link>
        </div>
      </aside>
    </>
  );
}

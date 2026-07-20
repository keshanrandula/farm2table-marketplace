"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import NotificationBell from "./NotificationBell";

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      name: "Overview",
      nameSi: "දළ විශ්ලේෂණය",
      path: "/farmer",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      )
    },
    {
      name: "Agri Intelligence",
      nameSi: "කාලගුණ සහ මිල විශ්ලේෂණය",
      path: "/farmer/advisory",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-11.314l.707.707m11.314 11.314l.707.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
        </svg>
      )
    },
    {
      name: "AI Disease Scanner",
      nameSi: "AI රෝග හඳුනාගැනීම",
      path: "/farmer/disease-detection",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L5.6 15.12a2 2 0 00-1.8 1.1A2 2 0 004 18.2L5 20.2a2 2 0 001.8 1.1h10.4a2 2 0 001.8-1.1l1-2a2 2 0 00-.572-2.772zM12 4v4m-2-2h4" />
        </svg>
      )
    },
    {
      name: "Orders",
      nameSi: "ඇණවුම් කළමනාකරණය",
      path: "/farmer/orders",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      name: "Hotel Bids",
      nameSi: "හෝටල් Bidding Quotes",
      path: "/farmer/bids",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5 5 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5 5 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      )
    },
    {
      name: "Add New Crop",
      nameSi: "නව අස්වැන්නක් එක් කරන්න",
      path: "/farmer/add-crop",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      name: "Sales Reports",
      nameSi: "විකුණුම් වාර්තා",
      path: "/farmer/reports",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      name: "Messages",
      nameSi: "පණිවිඩ",
      path: "/farmer/chat",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
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
          <span className="font-extrabold text-lg tracking-wider">Farmer Panel</span>
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
              <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Farmer Portal</p>
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
        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-3xl mt-auto space-y-3">
          <div className="flex items-center justify-between gap-2 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm shadow-inner">
                🧑‍🌾
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 leading-tight">Farmer Account</h4>
                <p className="text-[10px] text-gray-500 font-medium">Dashboard Active</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <NotificationBell />
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer shadow-sm"
          >
            ← Back to Home
          </Link>
        </div>
      </aside>
    </>
  );
}

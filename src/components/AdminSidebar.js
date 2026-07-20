"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import NotificationBell from "./NotificationBell";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      name: "Overview",
      nameSi: "දළ විශ්ලේෂණය",
      path: "/admin",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      )
    },
    {
      name: "Verify Payments",
      nameSi: "ගෙවීම් තහවුරු කිරීම",
      path: "/admin/payments",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      name: "User Directory",
      nameSi: "පරිශීලකයින් කළමනාකරණය",
      path: "/admin/users",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      name: "Listings Moderation",
      nameSi: "අස්වනු නියාමනය",
      path: "/admin/crops",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      )
    },
    {
      name: "Promo Codes",
      nameSi: "වට්ටම් සහ කූපන් කේත",
      path: "/admin/promos",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      )
    },
    {
      name: "Payouts & Commission",
      nameSi: "ගෙවීම් සහ කොමිස් පාලනය",
      path: "/admin/payouts",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="flex md:hidden items-center justify-between bg-emerald-800 text-white px-6 py-4 shadow-md w-full">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🛡️</span>
          <span className="font-extrabold text-lg tracking-wider">Admin Panel</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="focus:outline-none p-1 rounded hover:bg-emerald-900 transition cursor-pointer"
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
            <span className="text-3xl">🛡️</span>
            <div>
              <h2 className="font-black text-xl text-gray-900 tracking-tight leading-tight">Farm To Table</h2>
              <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Admin Portal</p>
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
                🛡️
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 leading-tight">Admin System</h4>
                <p className="text-[10px] text-gray-500 font-medium">Session Active</p>
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

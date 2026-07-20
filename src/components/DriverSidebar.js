"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import NotificationBell from "./NotificationBell";

export default function DriverSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      name: "Job Board",
      nameSi: "බෙදාහැරීම් පුවරුව",
      path: "/driver",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      name: "Route Planner",
      nameSi: "මාර්ග සැලසුම්කරු",
      path: "/driver/route",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      )
    },
    {
      name: "Back to Home",
      nameSi: "ප්‍රධාන පිටුවට",
      path: "/",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    }
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="flex md:hidden items-center justify-between bg-indigo-750 bg-indigo-700 text-white px-6 py-4 shadow-md w-full">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🚚</span>
          <span className="font-extrabold text-lg tracking-wider">Driver Panel</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="focus:outline-none p-1 rounded hover:bg-indigo-850 hover:bg-indigo-800 transition cursor-pointer"
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
            <span className="text-3xl">🚚</span>
            <div>
              <h2 className="font-black text-xl text-gray-900 tracking-tight leading-tight">Farm To Table</h2>
              <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Driver Portal</p>
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
                      ? "bg-indigo-55 bg-indigo-50 text-indigo-700 shadow-sm border-l-4 border-indigo-600" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
                  `}
                >
                  <span className={`transition-colors duration-200 ${isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"}`}>
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
        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-3xl mt-auto">
          <div className="flex items-center justify-between gap-2 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm shadow-inner">
                🏍️
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 leading-tight">Driver Account</h4>
                <p className="text-[10px] text-gray-500 font-medium">Dashboard Active</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <NotificationBell />
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

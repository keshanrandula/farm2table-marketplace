"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState("si");
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLang = localStorage.getItem("app_lang") || "si";
      setLang(storedLang);

      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {}
      }

      const handleLangEvent = (e) => {
        if (e.detail) setLang(e.detail);
      };
      window.addEventListener("lang-changed", handleLangEvent);
      return () => window.removeEventListener("lang-changed", handleLangEvent);
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      const uId = user ? (user.id || user._id) : "";
      const uRole = user ? user.role : "all";
      const res = await fetch(`/api/notifications?userId=${uId}&role=${uRole}`);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      const uId = user ? (user.id || user._id) : "";
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true, userId: uId })
      });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Error marking read:", err);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
        aria-label="Notifications"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-5 w-5 bg-red-500 text-white rounded-full font-black text-[10px] flex items-center justify-center border-2 border-white dark:border-gray-800 shadow animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl shadow-2xl z-50 overflow-hidden text-xs">
          {/* Header */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                {lang === "si" ? "දැනුම්දීම්" : lang === "ta" ? "அறிவிப்புகள்" : "Notifications"}
              </span>
              {unreadCount > 0 && (
                <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {unreadCount} New
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold text-[11px]"
              >
                {lang === "si" ? "සියල්ල සලකුණු කරන්න" : lang === "ta" ? "அனைத்தையும் வாசித்ததாகக் குறிக்கவும்" : "Mark all read"}
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/50">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400 font-medium">
                <span className="text-3xl block mb-1">🔕</span>
                {lang === "si" ? "දැනට කිසිදු දැනුම්දීමක් නැත" : lang === "ta" ? "அறிவிப்புகள் எதுவுமில்லை" : "No notifications yet"}
              </div>
            ) : (
              notifications.map((n, idx) => {
                const titleText = lang === "si" ? (n.titleSi || n.title) : lang === "ta" ? (n.titleTa || n.title) : n.title;
                const messageText = lang === "si" ? (n.messageSi || n.message) : lang === "ta" ? (n.messageTa || n.message) : n.message;

                return (
                  <div
                    key={n._id || n.id || `notif-${idx}`}
                    className={`p-4 transition flex gap-3 ${
                      n.isRead ? "bg-white dark:bg-gray-800" : "bg-emerald-50/40 dark:bg-emerald-950/30"
                    }`}
                  >
                    <div className="text-xl shrink-0 mt-0.5">
                      {n.type === "order" ? "📦" : n.type === "chat" ? "💬" : n.type === "payment" ? "💳" : "📢"}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 dark:text-white leading-tight">{titleText}</span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-[11px] leading-relaxed">{messageText}</p>
                      {n.link && (
                        <Link
                          href={n.link}
                          onClick={() => setIsOpen(false)}
                          className="inline-block text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline mt-1"
                        >
                          View Details →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

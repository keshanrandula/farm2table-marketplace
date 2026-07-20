"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";


export default function FarmerChat() {
  const router = useRouter();
  const [lang, setLang] = useState("si");
  const [farmerId, setFarmerId] = useState("");
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null); // Selected thread object
  const [messages, setMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          if (u.role !== "farmer") {
            router.push("/login");
          } else {
            setFarmerId(u.id || u._id || "");
          }
        } catch (e) {
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
    }
  }, [router]);

  // Fetch threads list
  const fetchThreads = async () => {
    if (!farmerId) return;
    try {
      const res = await fetch(`/api/chat/threads?userId=${farmerId}`);
      const data = await res.json();
      if (data.success) {
        setThreads(data.data);
      }
    } catch (e) {
      console.error("Failed to load threads:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, [farmerId]);

  // Fetch messages of active thread
  const fetchMessages = async () => {
    if (!farmerId || !activeThread) return;
    try {
      const res = await fetch(`/api/chat?userId1=${farmerId}&userId2=${activeThread.otherUserId}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (e) {
      console.error("Failed to load messages:", e);
    }
  };

  // Poll active conversation
  useEffect(() => {
    if (!activeThread || !farmerId) return;

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [activeThread, farmerId]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!typedMessage.trim() || sendingMsg || !activeThread) return;

    setSendingMsg(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: farmerId,
          receiverId: activeThread.otherUserId,
          text: typedMessage
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, data.data]);
        setTypedMessage("");
        fetchThreads(); // Refresh last message in threads sidebar
      }
    } catch (e) {
      console.error("Failed to send message:", e);
    } finally {
      setSendingMsg(false);
    }
  };

  const text = {
    si: {
      title: "මගේ පණිවිඩ",
      subtitle: "මිලදී ගන්නන් (හෝටල් සහ පාරිභෝගිකයින්) සමඟ සෘජුව සිදුකළ ගනුදෙනු කතාබස් මෙතැනින් බලන්න.",
      noThreads: "තවමත් කිසිදු පණිවිඩ සංවාදයක් ලැබී නැත.",
      selectPrompt: "කතාබස් කිරීමට මිලදී ගන්නෙකුගේ නමක් තෝරන්න.",
      inputPlaceholder: "පණිවිඩය ලියන්න...",
      roles: {
        farmer: "🧑‍🌾 ගොවියා",
        hotel: "🏨 හෝටලය/B2B",
        customer: "👤 පාරිභෝගිකයා"
      },
      loading: "පණිවිඩ පූරණය වෙමින් පවතී..."
    },
    en: {
      title: "My Messages",
      subtitle: "Coordinate negotiations and crop wholesale inquiries with buyers.",
      noThreads: "No conversations received yet.",
      selectPrompt: "Select a buyer from the sidebar to open the chat window.",
      inputPlaceholder: "Type a message here...",
      roles: {
        farmer: "🧑‍🌾 Farmer",
        hotel: "🏨 Hotel/B2B",
        customer: "👤 Customer"
      },
      loading: "Loading chats..."
    }
  };

  const t = text[lang];

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t.title}</h1>
            <p className="text-sm text-gray-500 mt-1">{t.subtitle}</p>
          </div>
          
          <button
            onClick={() => setLang(lang === "si" ? "en" : "si")}
            className="self-start sm:self-center bg-white hover:bg-gray-105 border border-gray-200 text-xs font-black px-4 py-2.5 rounded-xl transition cursor-pointer shadow-sm"
          >
            {lang === "si" ? "Switch to English 🌐" : "සිංහලට මාරු වන්න 🌐"}
          </button>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <div className="h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 font-bold text-sm">{t.loading}</p>
          </div>
        ) : threads.length === 0 ? (
          <div className="py-16 text-center text-gray-400 font-medium bg-white border border-gray-150 rounded-3xl p-8 shadow-sm">
            <span className="text-5xl block mb-3">💬</span>
            <p>{t.noThreads}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white border border-gray-150 rounded-3xl shadow-sm h-[560px] overflow-hidden">
            
            {/* Left sidebar: Threads */}
            <div className="border-r border-gray-150 overflow-y-auto divide-y divide-gray-50 h-full">
              {threads.map((thread) => {
                const isActive = activeThread?.otherUserId === thread.otherUserId;
                return (
                  <button
                    key={thread.otherUserId}
                    onClick={() => setActiveThread(thread)}
                    className={`w-full text-left p-5 transition flex items-start gap-3.5 hover:bg-gray-50/50 cursor-pointer
                      ${isActive ? "bg-emerald-50/60 hover:bg-emerald-50/60" : ""}
                    `}
                  >
                    <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm shadow-inner shrink-0">
                      👤
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-gray-955 truncate leading-tight">{thread.profile?.name}</h4>
                        {thread.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-[9px] font-black h-4 px-1.5 rounded-full flex items-center justify-center">
                            {thread.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 font-semibold mt-0.5 truncate leading-none">
                        {t.roles[thread.profile?.role] || thread.profile?.role}
                      </p>
                      <p className="text-xs text-gray-500 mt-2 truncate font-medium">
                        {thread.lastMessage}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right chat window */}
            <div className="md:col-span-2 flex flex-col justify-between h-full bg-gray-50/30">
              {activeThread ? (
                <>
                  {/* Chat header */}
                  <div className="bg-emerald-800 text-white p-5 flex items-center gap-3.5 shadow-sm">
                    <div className="h-9 w-9 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-sm shadow-inner shrink-0">
                      👤
                    </div>
                    <div>
                      <h3 className="text-sm font-black tracking-tight">{activeThread.profile?.name}</h3>
                      <p className="text-[10px] text-emerald-200 font-semibold leading-none mt-0.5">{activeThread.profile?.email}</p>
                    </div>
                  </div>

                  {/* Message scroll list */}
                  <div className="flex-1 p-5 overflow-y-auto space-y-4">
                    {messages.map((msg) => {
                      const isMine = msg.senderId.toString() === farmerId.toString();
                      return (
                        <div
                          key={msg._id}
                          className={`flex flex-col max-w-[80%] ${isMine ? "ml-auto items-end" : "mr-auto items-start"}`}
                        >
                          <div className={`p-3 rounded-2xl text-xs font-semibold shadow-sm leading-relaxed
                            ${isMine
                              ? "bg-emerald-600 text-white rounded-br-none"
                              : "bg-white text-gray-800 border border-gray-150 rounded-bl-none"
                            }
                          `}>
                            {msg.text}
                          </div>
                          <span className="text-[9px] text-gray-400 mt-1 font-semibold">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Chat Input bar */}
                  <div className="p-4 border-t border-gray-100 bg-white flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={t.inputPlaceholder}
                      value={typedMessage}
                      onChange={(e) => setTypedMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1 px-4 py-3 border border-gray-200 focus:outline-none focus:border-emerald-500 rounded-xl font-semibold text-xs text-gray-800 bg-white"
                      disabled={sendingMsg}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={sendingMsg || !typedMessage.trim()}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 text-white font-bold p-3 rounded-xl transition cursor-pointer shadow-md shadow-emerald-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-center p-8">
                  <div className="max-w-xs space-y-2.5">
                    <span className="text-5xl block">💬</span>
                    <p className="text-xs font-bold text-gray-400">{t.selectPrompt}</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
    </div>
  );
}

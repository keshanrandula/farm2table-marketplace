"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminOverview() {
  const router = useRouter();
  const [lang, setLang] = useState("si");
  const [adminUser, setAdminUser] = useState(null);
  const [stats, setStats] = useState({
    totalFarmers: 0,
    totalHotels: 0,
    totalCustomers: 0,
    totalCrops: 0,
    totalSales: 0,
    totalUsers: 0
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          if (u.role !== "admin") {
            router.push("/login");
          } else {
            setAdminUser(u);
          }
        } catch (e) {
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
    }
  }, [router]);

  useEffect(() => {
    async function fetchData() {
      try {
        const statsRes = await fetch("/api/admin/stats");
        const statsData = await statsRes.json();
        
        const usersRes = await fetch("/api/admin/users");
        const usersData = await usersRes.json();

        if (statsData.success && usersData.success) {
          setStats(statsData.data);
          setUsers(usersData.data.slice(0, 5));
        } else {
          setErrorMsg("දත්ත ලබාගැනීම අසාර්ථක විය / Failed to load administrative records");
        }
      } catch (err) {
        setErrorMsg("පද්ධති සම්බන්ධතා දෝෂයකි / Network connection error");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const text = {
    si: {
      title: "පාලක දළ විශ්ලේෂණය",
      subtitle: "සමස්ත ගොවි, හෝටල්, පාරිභෝගික සහ අස්වනු ගනුදෙනු නිරීක්ෂණය.",
      cardTotalUsers: "මුළු පරිශීලකයින්",
      cardFarmers: "ගොවීන්",
      cardHotels: "හෝටල්/B2B",
      cardCustomers: "පාරිභෝගිකයින්",
      cardActiveCrops: "අස්වනු වර්ග",
      cardEarnings: "මුළු අලෙවිය",
      recentUsersTitle: "මෑතකදී එක්වූ සාමාජිකයින්",
      tableColName: "නම",
      tableColEmail: "ඊමේල්",
      tableColRole: "කාර්යය",
      tableColJoined: "ලියාපදිංචි දිනය",
      roles: {
        farmer: "🧑‍🌾 ගොවියා",
        hotel: "🏨 හෝටලය",
        customer: "👤 පාරිභෝගිකයා",
        admin: "🛡️ පාලකයා"
      },
      loading: "පාලක දත්ත පූරණය වෙමින් පවතී...",
      kg: "Kg",
      perKg: "රු",
      viewAllUsers: "සියලු පරිශීලකයින් බලන්න →"
    },
    en: {
      title: "Admin Overview",
      subtitle: "System analytics, user activity indicators, and total sales parameters.",
      cardTotalUsers: "Total Registered",
      cardFarmers: "Farmers",
      cardHotels: "Hotels/B2B",
      cardCustomers: "Regular Customers",
      cardActiveCrops: "Listed Crops",
      cardEarnings: "Total Marketplace Revenue",
      recentUsersTitle: "Recent User Registrations",
      tableColName: "Name",
      tableColEmail: "Email",
      tableColRole: "Role",
      tableColJoined: "Joined Date",
      roles: {
        farmer: "🧑‍🌾 Farmer",
        hotel: "🏨 Hotel",
        customer: "👤 Customer",
        admin: "🛡️ Admin"
      },
      loading: "Loading system records...",
      kg: "Kg",
      perKg: "LKR",
      viewAllUsers: "View Full User Directory →"
    }
  };

  const t = text[lang];

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 font-bold text-sm">{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{t.subtitle}</p>
        </div>
        
        <button
          onClick={() => setLang(lang === "si" ? "en" : "si")}
          className="self-start sm:self-center bg-white hover:bg-gray-50 border border-gray-200 text-xs font-black px-4 py-2.5 rounded-xl transition cursor-pointer shadow-sm"
        >
          {lang === "si" ? "Switch to English 🌐" : "සිංහලට මාරු වන්න 🌐"}
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Total Sales */}
        <div className="bg-emerald-600 rounded-3xl p-6 text-white shadow-lg shadow-emerald-600/10 flex flex-col justify-between h-40">
          <div>
            <span className="text-xs font-extrabold text-emerald-100 uppercase tracking-widest block">{t.cardEarnings}</span>
            <span className="text-3xl font-black block mt-2">{t.perKg} {stats.totalSales.toLocaleString()}</span>
          </div>
          <span className="text-[10px] text-emerald-200 font-semibold block">Aggregated from delivered/completed orders</span>
        </div>

        {/* Card 2: Total Users */}
        <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-40">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">{t.cardTotalUsers}</span>
            <span className="text-3xl font-black text-gray-900 block mt-2">{stats.totalUsers}</span>
          </div>
          <div className="flex gap-4 text-xs font-bold text-gray-500 border-t border-gray-50 pt-3">
            <span>🌾 {stats.totalFarmers}</span>
            <span>🏢 {stats.totalHotels}</span>
            <span>👤 {stats.totalCustomers}</span>
          </div>
        </div>

        {/* Card 3: Active Crops */}
        <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-40">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">{t.cardActiveCrops}</span>
            <span className="text-3xl font-black text-gray-900 block mt-2">{stats.totalCrops}</span>
          </div>
          <span className="text-[10px] text-gray-400 font-semibold block">Total crop listings loaded in market directories</span>
        </div>

      </div>

      {/* Table: Recent Users */}
      <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
          <h3 className="text-lg font-bold text-gray-900">{t.recentUsersTitle}</h3>
          <Link href="/admin/users" className="text-xs font-bold text-emerald-600 hover:underline">
            {t.viewAllUsers}
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50">
                <th className="py-3 px-4">{t.tableColName}</th>
                <th className="py-3 px-4">{t.tableColEmail}</th>
                <th className="py-3 px-4">{t.tableColRole}</th>
                <th className="py-3 px-4">{t.tableColJoined}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm font-semibold text-gray-700">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50/50 transition">
                  <td className="py-3 px-4 font-bold text-gray-900">{user.name}</td>
                  <td className="py-3 px-4 text-gray-500 font-medium">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2.5 py-1 rounded-lg border font-bold 
                      ${user.role === 'farmer' ? 'bg-green-50 text-green-700 border-green-100' :
                        user.role === 'hotel' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        user.role === 'admin' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        'bg-gray-50 text-gray-700 border-gray-200'}`}
                    >
                      {t.roles[user.role] || user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-400 font-semibold">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

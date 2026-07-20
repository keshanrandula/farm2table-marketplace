"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UserDirectory() {
  const router = useRouter();
  const [lang, setLang] = useState("si");
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          if (u.role !== "admin") {
            router.push("/login");
          }
        } catch (e) {
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
    }
  }, [router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      } else {
        setErrorMsg("පරිශීලක ලැයිස්තුව ලබාගැනීම අසාර්ථක විය / Failed to load user records");
      }
    } catch (err) {
      setErrorMsg("සම්බන්ධතා දෝෂයකි / Network connection error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId, userName) => {
    const confirmText = lang === "si" 
      ? `ඔබට සහතිකවම "${userName}" පරිශීලකයාව පද්ධතියෙන් ඉවත් කිරීමට අවශ්‍යද? එමඟින් ඔවුන්ගේ සියලුම අස්වනු Listings ද ඉවත් කරනු ලැබේ.`
      : `Are you sure you want to delete user "${userName}"? This will also remove all their listed crops.`;

    if (!confirm(confirmText)) return;

    setDeleteLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(lang === "si" ? "පරිශීලකයා සාර්ථකව ඉවත් කරන ලදී!" : "User removed successfully!");
        fetchUsers();
        
        setTimeout(() => {
          setSuccessMsg("");
        }, 3000);
      } else {
        setErrorMsg(data.error || "Failed to delete user");
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) || 
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const text = {
    si: {
      title: "පරිශීලකයින් කළමනාකරණය",
      subtitle: "පද්ධතියට ලියාපදිංචි වී ඇති සියලුම ගොවීන්, හෝටල් සහ සාමාන්‍ය පාරිභෝගිකයින්ගේ ගිණුම් විස්තර මෙතැනින් කළමනාකරණය කරන්න.",
      searchPlaceholder: "නම හෝ විද්‍යුත් තැපෑල (Email) මඟින් සොයන්න...",
      tableColName: "නම",
      tableColEmail: "ඊමේල්",
      tableColRole: "භූමිකාව",
      tableColJoined: "ලියාපදිංචි දිනය",
      tableColActions: "ක්‍රියාමාර්ග",
      btnDelete: "ඉවත් කරන්න",
      roles: {
        farmer: "🧑‍🌾 ගොවියා",
        hotel: "🏨 හෝටලය",
        customer: "👤 පාරිභෝගිකයා",
        admin: "🛡️ පාලකයා"
      },
      loading: "පරිශීලක ලැයිස්තුව පූරණය වෙමින් පවතී...",
      emptyList: "පරිශීලකයින් කිසිවෙක් හමු නොවිය.",
      deleteConfirm: "ඉවත් කරන්නද?"
    },
    en: {
      title: "User Directory",
      subtitle: "Audit, search, and manage registered system accounts (Farmers, Hotels, and Customers).",
      searchPlaceholder: "Search users by name or email...",
      tableColName: "Name",
      tableColEmail: "Email",
      tableColRole: "Role",
      tableColJoined: "Joined Date",
      tableColActions: "Actions",
      btnDelete: "Delete",
      roles: {
        farmer: "🧑‍🌾 Farmer",
        hotel: "🏨 Hotel",
        customer: "👤 Customer",
        admin: "🛡️ Admin"
      },
      loading: "Loading user directory...",
      emptyList: "No matching users found.",
      deleteConfirm: "Delete account?"
    }
  };

  const t = text[lang];

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
          {lang === "si" ? "Switch to English 🌐" : "සිංහලට මාරু වන්න 🌐"}
        </button>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-xs font-semibold">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Search Input Bar */}
      <div className="bg-white border border-gray-150 rounded-3xl p-5 shadow-sm">
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-emerald-500 rounded-xl font-semibold text-gray-800 bg-white"
        />
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold text-sm">{t.loading}</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="py-24 text-center text-gray-400 font-medium bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          {t.emptyList}
        </div>
      ) : (
        <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="py-4 px-4">{t.tableColName}</th>
                  <th className="py-4 px-4">{t.tableColEmail}</th>
                  <th className="py-4 px-4">{t.tableColRole}</th>
                  <th className="py-4 px-4">{t.tableColJoined}</th>
                  <th className="py-4 px-4 text-center">{t.tableColActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm font-semibold text-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50/50 transition">
                    <td className="py-4 px-4 font-bold text-gray-900">{user.name}</td>
                    <td className="py-4 px-4 text-gray-505 text-gray-500 font-medium">{user.email}</td>
                    <td className="py-4 px-4">
                      <span className={`text-xs px-2.5 py-1 rounded-lg border font-bold 
                        ${user.role === 'farmer' ? 'bg-green-50 text-green-700 border-green-100' :
                          user.role === 'hotel' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          user.role === 'admin' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          'bg-gray-50 text-gray-700 border-gray-200'}`}
                      >
                        {t.roles[user.role] || user.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-gray-400 font-semibold">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {user.role !== "admin" && (
                        <button
                          onClick={() => handleDeleteUser(user._id, user.name)}
                          disabled={deleteLoading}
                          className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                        >
                          {t.btnDelete}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

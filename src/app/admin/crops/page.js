"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ListingModeration() {
  const router = useRouter();
  const [lang, setLang] = useState("si");
  const [crops, setCrops] = useState([]);
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

  const fetchCrops = async () => {
    try {
      const res = await fetch("/api/admin/crops");
      const data = await res.json();
      if (data.success) {
        setCrops(data.data);
      } else {
        setErrorMsg("අස්වනු ලැයිස්තුව ලබාගැනීම අසාර්ථක විය / Failed to load crop records");
      }
    } catch (err) {
      setErrorMsg("සම්බන්ධතා දෝෂයකි / Network connection error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, []);

  const handleDeleteCrop = async (cropId, cropName) => {
    const confirmText = lang === "si" 
      ? `ඔබට සහතිකවම "${cropName}" අස්වනු ලැයිස්තුව පද්ධතියෙන් ඉවත් කිරීමට අවශ්‍යද?`
      : `Are you sure you want to delete crop listing "${cropName}"?`;

    if (!confirm(confirmText)) return;

    setDeleteLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/admin/crops?cropId=${cropId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(lang === "si" ? "අස්වනු ලැයිස්තුව සාර්ථකව ඉවත් කරන ලදී!" : "Crop listing removed successfully!");
        fetchCrops();
        
        setTimeout(() => {
          setSuccessMsg("");
        }, 3000);
      } else {
        setErrorMsg(data.error || "Failed to delete crop listing");
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredCrops = crops.filter(crop => 
    crop.name.toLowerCase().includes(search.toLowerCase()) || 
    (crop.farmerId?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const text = {
    si: {
      title: "අස්වනු නියාමනය",
      subtitle: "වෙළඳපොලෙහි පළකර ඇති සියලුම එළවළු සහ පළතුරු අස්වනු ලැයිස්තු මෙතැනින් අධීක්ෂණය කර අනවශ්‍ය දෑ ඉවත් කරන්න.",
      searchPlaceholder: "අස්වනු නම හෝ ගොවියාගේ නම මඟින් සොයන්න...",
      tableColCrop: "අස්වැන්න",
      tableColFarmer: "ගොවියා",
      tableColStock: "තොග ප්‍රමාණය",
      tableColPrice: "මිල (1Kg)",
      tableColLocation: "ස්ථානය",
      tableColActions: "ක්‍රියාමාර්ග",
      btnDelete: "ඉවත් කරන්න",
      loading: "අස්වනු ලැයිස්තුව පූරණය වෙමින් පවතී...",
      emptyList: "අස්වනු ලැයිස්තු කිසිවක් හමු නොවිය.",
      kg: "Kg",
      perKg: "රු"
    },
    en: {
      title: "Listing Moderation",
      subtitle: "Review, audit, and remove active crop listings posted by farmers across the marketplace.",
      searchPlaceholder: "Search listings by crop name or farmer name...",
      tableColCrop: "Crop Name",
      tableColFarmer: "Farmer",
      tableColStock: "Stock",
      tableColPrice: "Price per Kg",
      tableColLocation: "Location",
      tableColActions: "Actions",
      btnDelete: "Remove Listing",
      loading: "Loading crop listings...",
      emptyList: "No matching listings found.",
      kg: "Kg",
      perKg: "LKR"
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
          {lang === "si" ? "Switch to English 🌐" : "සිංහලට මාරු වන්න 🌐"}
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

      {/* Crops Table */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold text-sm">{t.loading}</p>
        </div>
      ) : filteredCrops.length === 0 ? (
        <div className="py-24 text-center text-gray-400 font-medium bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          {t.emptyList}
        </div>
      ) : (
        <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="py-4 px-4">{t.tableColCrop}</th>
                  <th className="py-4 px-4">{t.tableColFarmer}</th>
                  <th className="py-4 px-4">{t.tableColStock}</th>
                  <th className="py-4 px-4">{t.tableColPrice}</th>
                  <th className="py-4 px-4">{t.tableColLocation}</th>
                  <th className="py-4 px-4 text-center">{t.tableColActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm font-semibold text-gray-700">
                {filteredCrops.map((crop) => (
                  <tr key={crop._id} className="hover:bg-gray-50/50 transition">
                    <td className="py-4 px-4 font-bold text-gray-955">
                      <span className="mr-2">
                        {crop.name.toLowerCase().includes("carrot") ? "🥕" :
                         crop.name.toLowerCase().includes("potato") ? "🥔" :
                         crop.name.toLowerCase().includes("tomato") ? "🍅" :
                         crop.name.toLowerCase().includes("onion") ? "🧅" :
                         crop.name.toLowerCase().includes("chili") ? "🌶️" : "🥬"}
                      </span>
                      {crop.name}
                    </td>
                    <td className="py-4 px-4 text-gray-500 font-medium">{crop.farmerId?.name || "Local Farmer"}</td>
                    <td className="py-4 px-4 text-amber-700 font-bold">
                      {crop.quantity} {t.kg}
                    </td>
                    <td className="py-4 px-4 text-emerald-600 font-extrabold">
                      {t.perKg} {crop.price}
                    </td>
                    <td className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">{crop.location}{crop.address ? ` (${crop.address})` : ""}</td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleDeleteCrop(crop._id, crop.name)}
                        disabled={deleteLoading}
                        className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                      >
                        {t.btnDelete}
                      </button>
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

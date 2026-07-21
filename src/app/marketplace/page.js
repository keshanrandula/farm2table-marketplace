"use client";
import { useState, useEffect } from "react";
import CropCard from "@/components/CropCard";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";

export default function Marketplace() {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const { lang, setLang } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");

  const districts = ["all", "Colombo", "Kandy", "Nuwara Eliya", "Jaffna", "Galle", "Kurunegala", "Badulla"];

  const text = {
    si: {
      title: "නැවුම් අස්වනු වෙළඳපොල",
      subtitle: "අතරමැදියන්ගෙන් තොරව කෙලින්ම ගොවිබිමෙන් නැවුම් අස්වනු සාධාරණ මිලට.",
      searchPlaceholder: "අස්වැන්නේ නමක් සොයන්න... (උදා: කැරට්)",
      selectLocation: "පිහිටීම තෝරන්න",
      allLocations: "සියලුම ස්ථාන",
      loading: "අස්වනු ලැයිස්තුව පූරණය වෙමින් පවතී...",
      noCrops: "කිසිදු අස්වැන්නක් සොයාගත නොහැකි විය. වෙනත් සෙවුම් පදයක් උත්සාහ කරන්න.",
      results: "අස්වනු ලැයිස්තුගත කිරීම්",
      districtNames: {
        all: "සියලුම ස්ථාන",
        Colombo: "කොළඹ (Colombo)",
        Kandy: "මහනුවර (Kandy)",
        "Nuwara Eliya": "නුවරඑළිය (Nuwara Eliya)",
        Jaffna: "යාපනය (Jaffna)",
        Galle: "ගාල්ල (Galle)",
        Kurunegala: "කුරුණෑගල (Kurunegala)",
        Badulla: "බදුල්ල (Badulla)"
      }
    },
    en: {
      title: "Fresh Harvest Marketplace",
      subtitle: "Fresh produce directly from local farmers at fair prices, without middlemen.",
      searchPlaceholder: "Search crop name... (e.g. Carrot)",
      selectLocation: "Select Location",
      allLocations: "All Locations",
      loading: "Loading marketplace listings...",
      noCrops: "No crops found. Try adjusting your search filters.",
      results: "Harvest Listings",
      districtNames: {
        all: "All Locations",
        Colombo: "Colombo",
        Kandy: "Kandy",
        "Nuwara Eliya": "Nuwara Eliya",
        Jaffna: "Jaffna",
        Galle: "Galle",
        Kurunegala: "Kurunegala",
        Badulla: "Badulla"
      }
    },
    ta: {
      title: "புதிய விளைச்சல் சந்தை",
      subtitle: "இடைத்தரகர்கள் இன்றி நேரடியாக உள்ளூர் விவசாயிகளிடமிருந்து நியாயமான விலையில்.",
      searchPlaceholder: "விளைச்சல் பெயரைத் தேடுங்கள்... (எ.கா. கேரட்)",
      selectLocation: "இடத்தைத் தேர்ந்தெடுக்கவும்",
      allLocations: "அனைத்து இடங்களும்",
      loading: "சந்தைப் பட்டியல் ஏற்றப்படுகிறது...",
      noCrops: "எந்த விளைச்சலும் கிடைக்கவில்லை.",
      results: "அறுவடைப் பட்டியல்",
      districtNames: {
        all: "அனைத்து இடங்களும்",
        Colombo: "கொழும்பு",
        Kandy: "கண்டி",
        "Nuwara Eliya": "நுவரெலியா",
        Jaffna: "யாழ்ப்பாணம்",
        Galle: "காலி",
        Kurunegala: "குருநாகல்",
        Badulla: "பதுளை"
      }
    }
  };

  const t = text[lang] || text.en || text.si;

  useEffect(() => {
    async function fetchMarketplaceCrops() {
      setLoading(true);
      try {
        const queryParam = selectedLocation !== "all" ? `?location=${selectedLocation}` : "";
        const res = await fetch(`/api/crops${queryParam}`);
        const data = await res.json();
        if (data.success) {
          setCrops(data.data);
        }
      } catch (err) {
        console.error("Error fetching marketplace crops:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMarketplaceCrops();
  }, [selectedLocation]);

  // Client-side filtering by name for dynamic instant search
  const filteredCrops = crops.filter((crop) =>
    crop.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Navbar lang={lang} setLang={setLang} />
      <div className="min-h-screen bg-gray-50/50 pb-20 relative">

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-800 to-green-900 text-white py-16 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">{t.title}</h1>
        <p className="text-emerald-100 text-sm md:text-base max-w-xl mx-auto mt-3 font-medium">
          {t.subtitle}
        </p>
      </div>

      {/* Filter and Search Bar Section */}
      <div className="max-w-7xl mx-auto px-6 -mt-8">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Dynamic Search Bar */}
          <div className="relative w-full md:flex-1">
            <span className="absolute inset-y-0 left-4 flex items-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:border-emerald-500 font-semibold text-gray-850 bg-gray-50/50"
            />
          </div>

          {/* Location Filter Select */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <label className="text-sm font-bold text-gray-500 shrink-0 hidden sm:inline">{t.selectLocation}:</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full md:w-56 px-4 py-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:border-emerald-500 font-bold bg-white text-gray-800 cursor-pointer"
            >
              {districts.map((dist) => (
                <option key={dist} value={dist}>
                  {t.districtNames[dist] || dist}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Main Grid Content */}
      <main className="max-w-7xl mx-auto px-6 mt-12">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-8">
          <h2 className="text-xl font-bold text-gray-900">{t.results}</h2>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            {filteredCrops.length} Listings
          </span>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <div className="h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 font-bold text-sm">{t.loading}</p>
          </div>
        ) : filteredCrops.length === 0 ? (
          <div className="py-24 text-center max-w-md mx-auto">
            <span className="text-6xl">🥬</span>
            <h3 className="text-lg font-extrabold text-gray-900 mt-4">No Harvest Available</h3>
            <p className="text-gray-500 text-sm mt-2 font-medium">{t.noCrops}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCrops.map((crop) => (
              <CropCard key={crop._id} crop={crop} lang={lang} />
            ))}
          </div>
        )}
      </main>
    </div>
  </>
  );
}

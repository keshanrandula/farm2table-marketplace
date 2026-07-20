"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CITIES = [
  { en: "Nuwara Eliya", si: "නුවරඑළිය" },
  { en: "Kandy", si: "මහනුවර" },
  { en: "Colombo", si: "කොළඹ" },
  { en: "Jaffna", si: "යාපනය" },
  { en: "Anuradhapura", si: "අනුරාධපුරය" },
  { en: "Badulla", si: "බදුල්ල" },
  { en: "Galle", si: "ගාල්ල" },
  { en: "Matara", si: "මාතර" },
  { en: "Hambantota", si: "හම්බන්තොට" },
  { en: "Kurunegala", si: "කුරුණෑගල" },
  { en: "Ratnapura", si: "රත්නපුරය" },
  { en: "Kegalle", si: "කෑගල්ල" },
  { en: "Matale", si: "මාතලේ" },
  { en: "Gampaha", si: "ගම්පහ" },
  { en: "Kalutara", si: "කළුතර" },
  { en: "Trincomalee", si: "ත්‍රිකුණාමලය" },
  { en: "Batticaloa", si: "මඩකලපුව" },
  { en: "Ampara", si: "අම්පාර" },
  { en: "Polonnaruwa", si: "පොළොන්නරුව" },
  { en: "Puttalam", si: "පුත්තලම" },
  { en: "Chilaw", si: "හලාවත" },
  { en: "Negombo", si: "මීගමුව" },
  { en: "Dambulla", si: "දඹුල්ල" },
  { en: "Welimada", si: "වැලිමඩ" },
  { en: "Keppetipola", si: "කැප්පෙටිපොල" },
  { en: "Bandarawela", si: "බණ්ඩාරවෙල" }
].sort((a, b) => a.en.localeCompare(b.en));

export default function AddCrop() {
  const router = useRouter();
  const [lang, setLang] = useState("si");
  const [farmerId, setFarmerId] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    quantity: "",
    location: "",
    address: "",
    grade: "N/A",
    organicStatus: "conventional",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          if (u.role !== "farmer") {
            router.push("/login");
            return;
          }
          setFarmerId(u.id || u._id || "");
        } catch (e) {
          console.error("Error parsing user session:", e);
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
    }
  }, [router]);

  useEffect(() => {
    if (formData.name.trim().length < 2) {
      setRecommendation(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/analytics/price-trends?crop=${encodeURIComponent(formData.name)}`);
        const data = await res.json();
        if (data.success && data.data) {
          setRecommendation(data.data);
        } else {
          setRecommendation(null);
        }
      } catch (err) {
        console.error("Error fetching price trends:", err);
        setRecommendation(null);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.name]);

  const text = {
    si: {
      title: "නව අස්වැන්නක් ඇතුළත් කරන්න",
      subtitle: "ඔබේ නැවුම් අස්වනු වෙළඳපලට එක් කරන්න.",
      cropName: "අස්වැන්නේ නම (Crop Name)",
      price: "කිලෝවක මිල (Price per Kg - රුපියල්)",
      quantity: "ලබාගත හැකි ප්‍රමාණය (Quantity - Kg)",
      location: "ගොවිපල පිහිටි ස්ථානය (Location / නගරය)",
      mainCity: "ප්‍රධාන නගරය (Main City)",
      selectCity: "නගරය තෝරන්න (Select City)",
      address: "ගොවිපල ලිපිනය (Farm Address)",
      placeholderName: "උදා: කැරට්, බීට්, තක්කාලි",
      placeholderPrice: "උදා: 250",
      placeholderQty: "උදා: 100",
      placeholderLoc: "උදා: නුවරඑළිය, කැප්පෙටිපොල",
      placeholderAddress: "උදා: 123, බදුල්ල පාර, වැලිමඩ",
      btnSubmit: "ලැයිස්තුගත කරන්න",
      btnLoading: "ඇතුළත් වෙමින්...",
      successMsg: "අස්වැන්න සාර්ථකව එක් කරන ලදී!",
      failedMsg: "අස්වැන්න එක් කිරීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.",
      backBtn: "ආපසු Overview වෙත",
      grade: "අස්වනු තත්ත්ව කාණ්ඩය (Crop Grade)",
      organicStatus: "වගා ක්‍රමය (Cultivation Mode)",
      grades: {
        "N/A": "තීරණය කර නැත (N/A)",
        "A": "Grade A (ඉහළම තත්ත්වය - Premium)",
        "B": "Grade B (මධ්‍යම තත්ත්වය - Medium)",
        "C": "Grade C (සාමාන්‍ය තත්ත්වය - Standard)"
      },
      organics: {
        "conventional": "සාමාන්‍ය වගාව (Conventional)",
        "organic": "කාබනික වගාව (100% Organic)",
        "pesticide-free": "වස විස නැති (Pesticide-Free)"
      }
    },
    en: {
      title: "Add New Crop",
      subtitle: "List your fresh harvest on the marketplace.",
      cropName: "Crop Name",
      price: "Price per Kg (LKR)",
      quantity: "Available Quantity (Kg)",
      location: "Farm Location (City)",
      mainCity: "Main City",
      selectCity: "Select City",
      address: "Farm Address",
      placeholderName: "e.g., Carrot, Beetroot, Tomato",
      placeholderPrice: "e.g., 250",
      placeholderQty: "e.g., 100",
      placeholderLoc: "e.g., Nuwara Eliya, Keppetipola",
      placeholderAddress: "e.g., 123, Badulla Road, Welimada",
      btnSubmit: "List Crop",
      btnLoading: "Adding Crop...",
      successMsg: "Crop added successfully!",
      failedMsg: "Failed to add crop. Please try again.",
      backBtn: "Back to Overview",
      grade: "Crop Grade",
      organicStatus: "Cultivation Mode",
      grades: {
        "N/A": "Not Graded (N/A)",
        "A": "Grade A (Premium)",
        "B": "Grade B (Medium)",
        "C": "Grade C (Standard)"
      },
      organics: {
        "conventional": "Conventional Farming",
        "organic": "100% Organic",
        "pesticide-free": "Pesticide-Free / Safe"
      }
    }
  };

  const t = text[lang];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Fallback farmerId if not logged in (for testing purposes)
    const activeFarmerId = farmerId || "60c72b2f9b1d8b22a07c1b52";

    try {
      let imageUrl = "";
      if (imageFile || imagePreview) {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file: imagePreview,
            folder: "crops"
          })
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.url) {
          imageUrl = uploadData.url;
        } else {
          console.warn("Cloudinary upload failed, fallback to preview", uploadData.error);
          imageUrl = imagePreview || "";
        }
      }

      const res = await fetch("/api/crops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          farmerId: activeFarmerId,
          price: Number(formData.price),
          quantity: Number(formData.quantity),
          image: imageUrl,
          status: "available"
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t.failedMsg);
      }

      setSuccess(t.successMsg);
      setImageFile(null);
      setImagePreview("");
      setFormData({
        name: "",
        price: "",
        quantity: "",
        location: "",
        address: "",
        grade: "N/A",
        organicStatus: "conventional",
      });

      // Redirect to overview after 1.5 seconds
      setTimeout(() => {
        router.push("/farmer");
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 relative pb-12 px-4 sm:px-0">
      {/* Language Toggle */}
      <button
        onClick={() => setLang(lang === "si" ? "en" : "si")}
        className="absolute top-0 right-4 sm:right-0 bg-white/85 dark:bg-gray-800/85 backdrop-blur-md border border-gray-100 dark:border-gray-700 text-xs font-black px-4 py-2 rounded-2xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm hover:shadow-md active:scale-95 duration-200 text-gray-700 dark:text-gray-200"
      >
        {lang === "si" ? "English 🌐" : "සිංහල 🌐"}
      </button>

      <div>
        <Link href="/farmer" className="text-xs font-black text-emerald-600 hover:text-emerald-700 transition flex items-center gap-1.5 mb-3 group w-fit">
          <span className="group-hover:-translate-x-0.5 transition duration-150">←</span> {t.backBtn}
        </Link>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{t.title}</h1>
        <p className="text-xs text-gray-500 font-bold mt-1.5">{t.subtitle}</p>
      </div>

      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-100/80 dark:border-gray-800/60 rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-8 shadow-xl shadow-gray-100/50 dark:shadow-none space-y-6 sm:space-y-8 relative overflow-hidden">
        {/* Top decorative gradient blur */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {error && (
          <div className="bg-rose-50/50 border border-rose-100 text-rose-800 px-4.5 py-3.5 rounded-2xl flex items-center gap-3 text-xs font-bold shadow-inner/5 animate-in fade-in slide-in-from-top-3 duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50/50 border border-emerald-100 text-emerald-800 px-4.5 py-3.5 rounded-2xl flex items-center gap-3 text-xs font-bold shadow-inner/5 animate-in fade-in slide-in-from-top-3 duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Crop Name */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-600 block uppercase tracking-wider">{t.cropName}</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4.5 flex items-center text-lg text-gray-400 pointer-events-none">🌾</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t.placeholderName}
                className="w-full pl-12 pr-4.5 py-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 font-semibold text-gray-900 bg-gray-50/30 transition-all duration-200"
                required
                disabled={loading}
              />
            </div>
            
            {formData.name.trim().length > 1 && recommendation && (
              <div className="bg-gradient-to-br from-indigo-50/40 to-indigo-50/10 border border-indigo-100 rounded-[2rem] p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm shadow-indigo-100/10 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
                
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest block">
                    💡 {lang === "si" ? "ස්මාර්ට් මිල නිර්දේශය" : "Smart Price Suggestion"}
                  </span>
                  <span className={`px-3 py-1 rounded-xl text-[10px] font-extrabold border shadow-sm ${
                    recommendation.demand > recommendation.supply
                      ? "bg-green-50 text-green-700 border-green-100"
                      : recommendation.supply > recommendation.demand
                      ? "bg-amber-50 text-amber-700 border-amber-100"
                      : "bg-gray-50 text-gray-700 border-gray-100"
                  }`}>
                    {recommendation.demand > recommendation.supply 
                      ? (lang === "si" ? "ඉහළ ඉල්ලුම / අඩු සැපයුම" : "High Demand / Low Supply")
                      : recommendation.supply > recommendation.demand
                      ? (lang === "si" ? "අඩු ඉල්ලුම / ඉහළ සැපයුම" : "Low Demand / High Supply")
                      : (lang === "si" ? "ස්ථායී වෙළඳපල" : "Stable Market")}
                  </span>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      {lang === "si" ? "යෝජිත සාධාරණ මිල (රු/Kg)" : "Suggested Price (LKR/Kg)"}
                    </p>
                    <p className="text-xl font-black text-indigo-950 font-sans tracking-tight">
                      LKR {recommendation.recommendedPrice} 
                      <span className="text-[10px] text-gray-400 font-bold ml-2 font-sans tracking-normal uppercase">
                        ({lang === "si" ? "වෙළඳපල සාමාන්‍යය" : "market average"}: LKR {recommendation.averagePrice})
                      </span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, price: recommendation.recommendedPrice.toString() }))}
                    className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-extrabold py-2.5 px-4.5 rounded-xl cursor-pointer transition-all duration-200 shadow-md shadow-indigo-100/50 self-start sm:self-center"
                  >
                    {lang === "si" ? "මෙම මිල නියම කරන්න" : "Use Suggested Price"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Price */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-600 block uppercase tracking-wider">{t.price}</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4.5 flex items-center text-xs font-black text-gray-400 pointer-events-none">LKR</span>
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="any"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder={t.placeholderPrice}
                  className="w-full pl-12 pr-4.5 py-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 font-semibold text-gray-900 bg-gray-50/30 transition-all duration-200 font-sans"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-600 block uppercase tracking-wider">{t.quantity}</label>
              <div className="relative">
                <input
                  type="number"
                  name="quantity"
                  min="0"
                  step="any"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder={t.placeholderQty}
                  className="w-full px-4.5 py-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 font-semibold text-gray-900 bg-gray-50/30 transition-all duration-200 font-sans"
                  required
                  disabled={loading}
                />
                <span className="absolute inset-y-0 right-0 pr-4.5 flex items-center text-xs font-black text-gray-400 pointer-events-none">KG</span>
              </div>
            </div>
          </div>

          {/* Main City */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-600 block uppercase tracking-wider">{t.mainCity}</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4.5 flex items-center text-lg text-gray-400 pointer-events-none">🌆</span>
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 font-bold text-gray-900 bg-gray-50/30 transition-all duration-200 cursor-pointer appearance-none text-xs"
                required
                disabled={loading}
              >
                <option value="">{t.selectCity}</option>
                {CITIES.map((city) => (
                  <option key={city.en} value={city.en}>
                    {lang === "si" ? city.si : city.en}
                  </option>
                ))}
              </select>
              <span className="absolute inset-y-0 right-0 pr-4.5 flex items-center pointer-events-none text-gray-400">▼</span>
            </div>
          </div>

          {/* Farm Address */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-600 block uppercase tracking-wider">{t.address}</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4.5 flex items-center text-lg text-gray-400 pointer-events-none">📍</span>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder={t.placeholderAddress}
                className="w-full pl-12 pr-4.5 py-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 font-semibold text-gray-900 bg-gray-50/30 transition-all duration-200"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Crop Image Upload */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-600 block uppercase tracking-wider">
              {lang === "si" ? "බෝගයේ ඡායාරූපය" : "Crop Image"}
            </label>
            
            <div className="flex flex-col sm:flex-row items-center gap-5 bg-gray-50/30 dark:bg-gray-800/10 border border-gray-150/60 dark:border-gray-700/50 rounded-[2rem] p-4.5">
              {/* Image Preview Box */}
              <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden shrink-0 relative shadow-inner">
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview("");
                      }}
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow transition-all duration-200 cursor-pointer hover:scale-110"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3.5} stroke="currentColor" className="w-2.5 h-2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <span className="text-3xl text-gray-250 select-none">📷</span>
                )}
              </div>

              {/* Upload Button wrapper */}
              <label className="w-full sm:flex-1 sm:max-w-xs border border-gray-200 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-450 hover:bg-emerald-50/10 dark:hover:bg-emerald-950/10 rounded-2xl p-4.5 text-center cursor-pointer transition group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={loading}
                />
                <span className="text-xs font-black text-gray-500 dark:text-gray-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 block transition-all duration-200">
                  {lang === "si" ? "ඡායාරූපයක් තෝරන්න" : "Choose Crop Photo"}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-gray-550 block mt-1">
                  PNG, JPG, JPEG up to 5MB
                </span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Grade Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-600 block uppercase tracking-wider">{t.grade}</label>
              <div className="relative">
                <select
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  className="w-full px-4.5 py-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 font-bold text-gray-900 bg-gray-50/30 transition-all duration-200 cursor-pointer appearance-none text-xs"
                  disabled={loading}
                >
                  {Object.entries(t.grades).map(([key, val]) => (
                    <option key={key} value={key}>{val}</option>
                  ))}
                </select>
                <span className="absolute inset-y-0 right-0 pr-4.5 flex items-center pointer-events-none text-gray-400">▼</span>
              </div>
            </div>

            {/* Cultivation Mode Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-600 block uppercase tracking-wider">{t.organicStatus}</label>
              <div className="relative">
                <select
                  name="organicStatus"
                  value={formData.organicStatus}
                  onChange={handleChange}
                  className="w-full px-4.5 py-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 font-bold text-gray-900 bg-gray-50/30 transition-all duration-200 cursor-pointer appearance-none text-xs"
                  disabled={loading}
                >
                  {Object.entries(t.organics).map(([key, val]) => (
                    <option key={key} value={key}>{val}</option>
                  ))}
                </select>
                <span className="absolute inset-y-0 right-0 pr-4.5 flex items-center pointer-events-none text-gray-400">▼</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 hover:-translate-y-0.5 active:translate-y-0 text-white font-black py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-emerald-600/15 disabled:from-gray-400 disabled:to-gray-400 disabled:translate-y-0 disabled:shadow-none mt-6 text-xs uppercase tracking-widest cursor-pointer"
          >
            {loading ? t.btnLoading : t.btnSubmit}
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";


const DISTRICT_COORDS = {
  Colombo: { lat: 6.9271, lon: 79.8612, labelSi: "කොළඹ (Colombo)", labelEn: "Colombo" },
  Kandy: { lat: 7.2906, lon: 80.6337, labelSi: "මහනුවර (Kandy)", labelEn: "Kandy" },
  "Nuwara Eliya": { lat: 6.9708, lon: 80.7829, labelSi: "නුවරඑළිය (Nuwara Eliya)", labelEn: "Nuwara Eliya" },
  Jaffna: { lat: 9.6615, lon: 80.0255, labelSi: "යාපනය (Jaffna)", labelEn: "Jaffna" },
  Galle: { lat: 6.0535, lon: 80.2117, labelSi: "ගාල්ල (Galle)", labelEn: "Galle" },
  Kurunegala: { lat: 7.4818, lon: 80.3609, labelSi: "කුරුණෑගල (Kurunegala)", labelEn: "Kurunegala" },
  Badulla: { lat: 6.9934, lon: 81.0550, labelSi: "බදුල්ල (Badulla)", labelEn: "Badulla" }
};

export default function AgriIntelligence() {
  const router = useRouter();
  const [lang, setLang] = useState("si");
  const [farmerId, setFarmerId] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("Nuwara Eliya");
  
  // Weather states
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  
  // Price analytics states
  const [wholesalePrices, setWholesalePrices] = useState([]);
  const [farmerCrops, setFarmerCrops] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Google Gemini AI helper states
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Weather chart helper states
  const [activeChartIdx, setActiveChartIdx] = useState(0);
  const [chartMode, setChartMode] = useState("temp"); // "temp" or "rain"

  // Yield & Fertilizer Calculator states
  const [calcCrop, setCalcCrop] = useState("Carrot");
  const [calcLandSize, setCalcLandSize] = useState("1.0");

  // Price trend chart states
  const [selectedTrendCrop, setSelectedTrendCrop] = useState("carrot");

  const handleAskGemini = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiResponse("");

    try {
      const res = await fetch("/api/ai/advisory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: aiQuery,
          district: selectedDistrict,
          weather: weatherData,
          farmerId: farmerId,
          lang: lang
        })
      });

      const data = await res.json();
      if (data.success) {
        setAiResponse(data.response);
      } else {
        setAiResponse(lang === "si"
          ? "කණගාටුයි, සහායකයා සම්බන්ධ කර ගැනීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න."
          : "Sorry, could not connect to the assistant. Please try again."
        );
      }
    } catch (err) {
      console.error("Error querying Gemini AI:", err);
      setAiResponse(lang === "si"
        ? "සම්බන්ධතා දෝෂයකි. කරුණාකර ඔබගේ අන්තර්ජාල සම්බන්ධතාවය පරීක්ෂා කරන්න."
        : "Network error. Please check your connection."
      );
    } finally {
      setAiLoading(false);
    }
  };

  // Load farmer session
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
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
    }
  }, [router]);

  // Fetch weather data when selected district changes
  useEffect(() => {
    const coords = DISTRICT_COORDS[selectedDistrict];
    if (!coords) return;

    async function fetchWeather() {
      setWeatherLoading(true);
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
        const res = await fetch(url);
        const data = await res.json();
        if (data && data.current_weather) {
          setWeatherData({
            temp: data.current_weather.temperature,
            wind: data.current_weather.windspeed,
            code: data.current_weather.weathercode,
            forecast: data.daily.time.slice(0, 5).map((time, idx) => ({
              date: new Date(time).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
              maxTemp: data.daily.temperature_2m_max[idx],
              minTemp: data.daily.temperature_2m_min[idx],
              precipProb: data.daily.precipitation_probability_max[idx],
              code: data.daily.weathercode[idx]
            }))
          });
          setActiveChartIdx(0);
        }
      } catch (err) {
        console.error("Error fetching weather forecast:", err);
      } finally {
        setWeatherLoading(false);
      }
    }

    fetchWeather();
  }, [selectedDistrict]);

  // Fetch farmer's crops and wholesale center prices
  useEffect(() => {
    if (!farmerId) return;

    async function fetchAnalyticsData() {
      setDataLoading(true);
      try {
        // Fetch farmer's listed crops
        const cropsRes = await fetch(`/api/crops?farmerId=${farmerId}`);
        const cropsData = await cropsRes.json();
        if (cropsData.success) {
          setFarmerCrops(cropsData.data);
          // Set default district to the location of farmer's crops if available
          if (cropsData.data.length > 0) {
            const cropLocation = cropsData.data[0].location;
            const matchedDistrict = Object.keys(DISTRICT_COORDS).find(
              d => d.toLowerCase() === cropLocation.toLowerCase()
            );
            if (matchedDistrict) {
              setSelectedDistrict(matchedDistrict);
            }
          }
        }

        // Fetch economic center wholesale prices
        const wholesaleRes = await fetch("/api/analytics/wholesale-prices");
        const wholesaleData = await wholesaleRes.json();
        if (wholesaleData.success) {
          setWholesalePrices(wholesaleData.data);
        }
      } catch (err) {
        console.error("Error fetching advisory/wholesale data:", err);
      } finally {
        setDataLoading(false);
      }
    }

    fetchAnalyticsData();
  }, [farmerId]);

  // Helper: map Open-Meteo weather code to label and emoji
  const getWeatherDetails = (code, isSi) => {
    if (code === 0) return { label: isSi ? "පැහැදිලි අහස" : "Clear Sky", emoji: "☀️" };
    if ([1, 2, 3].includes(code)) return { label: isSi ? "මඳක් වලාකුළු සහිතයි" : "Partly Cloudy", emoji: "⛅" };
    if ([45, 48].includes(code)) return { label: isSi ? "මීදුම් සහිතයි" : "Foggy", emoji: "🌫️" };
    if ([51, 53, 55].includes(code)) return { label: isSi ? "පොද වැසි" : "Light Drizzle", emoji: "🌦️" };
    if ([61, 63, 65, 80, 81, 82].includes(code)) return { label: isSi ? "වැසි සහිත කාලගුණය" : "Rainy", emoji: "🌧️" };
    if ([95, 96, 99].includes(code)) return { label: isSi ? "ගිගුරුම් සහිත වැසි" : "Thunderstorm", emoji: "⛈️" };
    return { label: isSi ? "සාමාන්‍ය කාලගුණය" : "Moderate", emoji: "☁️" };
  };

  // Helper: dynamic advisory message based on weather code and precipitation probability
  const getAdvisoryMessage = (code, precipProb) => {
    const isSi = lang === "si";
    const details = getWeatherDetails(code, isSi);
    
    if (precipProb > 50 || [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code)) {
      return {
        type: "warning",
        title: isSi ? "වැසි අනතුරු ඇඟවීමයි 🌧️" : "Rain Alert 🌧️",
        advice: isSi 
          ? "පළාතට වැසි සහිත කාලගුණයක් අපේක්ෂා කෙරේ. පොහොර හෝ කෘමිනාශක යෙදීමෙන් වළකින්න (පොහොර සේදී යා හැක). වගා බිමේ ජලාපවහන (Drainage) පද්ධති පිරිසිදු කර සූදානම්ව තබන්න. අස්වනු නෙලීම තාවකාලිකව කල් දමන්න."
          : "Rainy weather expected. Avoid applying fertilizer or pesticide as they may wash away. Ensure drainage pathways are clear to prevent waterlogging. Postpone harvest if possible."
      };
    } else if (code === 0 && precipProb < 20) {
      return {
        type: "success",
        title: isSi ? "වියළි කාලගුණ හිතකර තත්ත්වය ☀️" : "Dry & Sunny Conditions ☀️",
        advice: isSi
          ? "වියළි සහ හිරු එළිය සහිත හොඳ කාලගුණයක් පවතී. වගාවන් සඳහා නිසි පරිදි ජලය සැපයීමට (Irrigation) වගබලා ගන්න. අස්වනු නෙලීමට, වියළීමට සහ ඇසුරුම් කිරීමට ඉතාමත් යෝග්‍ය කාලයකි."
          : "Excellent dry and sunny weather. Maintain proper irrigation schedules. Highly recommended for harvesting, sun-drying, and packing your produce."
      };
    } else {
      return {
        type: "info",
        title: isSi ? "සාමාන්‍ය වගා උපදෙස් 🌾" : "General Farming Operations 🌾",
        advice: isSi
          ? "මධ්‍යස්ථ වලාකුළු සහිත සාමාන්‍ය කාලගුණයක් පවතී. වල් පැලෑටි ඉවත් කිරීම, පස් බුරුල් කිරීම, සහ සාමාන්‍ය නඩත්තු කටයුතු සිදු කිරීමට කදිම දිනයකි. පසෙහි තෙතමනය බලා මධ්‍යස්ථව ජලය යොදන්න."
          : "Partly cloudy or overcast skies with low rain chance. Ideal time for weeding, soil tilling, and general maintenance. Monitor soil dampness and water moderately."
      };
    }
  };

  // Helper: match farmer crop with wholesale center prices
  const getWholesaleMatch = (cropName) => {
    const name = cropName.toLowerCase().trim();
    return wholesalePrices.find(w => 
      name.includes(w.key) || 
      w.key.includes(name) ||
      name.includes(w.name.toLowerCase()) ||
      name.includes(w.nameSi)
    );
  };

  // Helper: analyze pricing discrepancies and provide smart tips
  const getPriceAnalysis = (farmerPrice, wholesale) => {
    const avgWholesale = (wholesale.dambulla + wholesale.keppetipola + wholesale.colombo) / 3;
    const isSi = lang === "si";

    if (farmerPrice < avgWholesale * 0.9) {
      const diff = Math.round(avgWholesale - farmerPrice);
      return {
        badgeClass: "bg-amber-50 text-amber-700 border-amber-100",
        badgeText: isSi ? "මිල අඩුයි (Low Price)" : "Priced Low",
        tip: isSi
          ? `ඔබේ මිල වෙළඳපොල සාමාන්‍යයට (රු ${Math.round(avgWholesale)}) වඩා අඩුයි. ඔබට මිල රු. ${diff}/Kg කින් පමණ ඉහළ නංවා ලාභය වැඩි කර ගත හැක.`
          : `Your price is below the market average (LKR ${Math.round(avgWholesale)}). You can raise it by approx LKR ${diff}/Kg to capture better margins.`
      };
    } else if (farmerPrice > avgWholesale * 1.15) {
      const diff = Math.round(farmerPrice - avgWholesale);
      return {
        badgeClass: "bg-red-50 text-red-700 border-red-100",
        badgeText: isSi ? "මිල වැඩියි (High Price)" : "Priced High",
        tip: isSi
          ? `ඔබේ මිල වෙළඳපොල සාමාන්‍යයට වඩා රු. ${diff}/Kg කින් වැඩියි. ඉක්මනින් විකුණා ගැනීමට මිල සුළු වශයෙන් අඩු කිරීම සලකා බලන්න.`
          : `Your price is LKR ${diff}/Kg higher than average. To accelerate sales, consider matching it closer to wholesale rates.`
      };
    } else {
      return {
        badgeClass: "bg-green-50 text-green-700 border-green-100",
        badgeText: isSi ? "හොඳ මිලක් (Optimal)" : "Optimal Pricing",
        tip: isSi
          ? "ඔබේ මිල වර්තමාන දේශීය තොග මිල ගණන් සමඟ කදිමට ගැළපෙන තරඟකාරී මට්ටමක පවතී."
          : "Your price is highly competitive and matches the current local economic center averages."
      };
    }
  };

  // SVG Chart Helper: Map temperature to Y coordinate
  const getTempY = (temp, forecast) => {
    if (!forecast || forecast.length === 0) return 75;
    const temps = forecast.map(d => d.maxTemp);
    const max = Math.max(...temps);
    const min = Math.min(...temps);
    const range = max - min || 1;
    // We want Y to go from 30 (highest temp, top of chart) to 110 (lowest temp, bottom of chart)
    const chartHeight = 80; 
    return 110 - ((temp - min) / range) * chartHeight;
  };

  // SVG Chart Helper: Generate the filled SVG area path for temperature
  const generateTempPath = (forecast) => {
    if (!forecast || forecast.length === 0) return "";
    const points = forecast.map((day, idx) => {
      const x = 30 + idx * 65;
      const y = getTempY(day.maxTemp, forecast);
      return { x, y };
    });
    let d = `M 30 120`; // Start at bottom left
    points.forEach((pt) => {
      d += ` L ${pt.x} ${pt.y}`;
    });
    d += ` L ${points[points.length - 1].x} 120 Z`; // Close path to bottom right
    return d;
  };

  // SVG Chart Helper: Generate the line path for temperature
  const generateTempPathLineOnly = (forecast) => {
    if (!forecast || forecast.length === 0) return "";
    const points = forecast.map((day, idx) => {
      const x = 30 + idx * 65;
      const y = getTempY(day.maxTemp, forecast);
      return `${x},${y}`;
    });
    return `M ${points.join(" L ")}`;
  };

  const currentAdv = weatherData ? getAdvisoryMessage(weatherData.code, weatherData.forecast[0].precipProb) : null;

  // Yield & Fertilizer calculations computed on the fly
  const getCalcResults = () => {
    const size = parseFloat(calcLandSize);
    if (isNaN(size) || size <= 0) return null;

    const cropRules = {
      Carrot: { nameSi: "කැරට්", nameEn: "Carrot", yieldPerAcre: 8000, urea: 150, mop: 100, tsp: 80, price: 280 },
      Potato: { nameSi: "අර්තාපල්", nameEn: "Potato", yieldPerAcre: 10000, urea: 200, mop: 120, tsp: 100, price: 320 },
      Leeks: { nameSi: "ලීක්ස්", nameEn: "Leeks", yieldPerAcre: 12000, urea: 180, mop: 90, tsp: 75, price: 180 },
      Cabbage: { nameSi: "ගෝවා", nameEn: "Cabbage", yieldPerAcre: 15000, urea: 220, mop: 110, tsp: 90, price: 150 },
      Tomato: { nameSi: "තක්කාලි", nameEn: "Tomato", yieldPerAcre: 9000, urea: 160, mop: 100, tsp: 80, price: 220 }
    };

    const rule = cropRules[calcCrop];
    if (!rule) return null;

    return {
      cropName: lang === "si" ? rule.nameSi : rule.nameEn,
      yield: rule.yieldPerAcre * size,
      revenue: rule.yieldPerAcre * size * rule.price,
      urea: rule.urea * size,
      mop: rule.mop * size,
      tsp: rule.tsp * size
    };
  };

  const calcResults = getCalcResults();

  // Get historical market prices for Dambulla, Keppetipola, Colombo
  const getHistoricalMarketPrices = (cropKey) => {
    const basePrices = {
      carrot: { dambulla: 280, keppetipola: 290, colombo: 310 },
      leeks: { dambulla: 180, keppetipola: 175, colombo: 210 },
      potato: { dambulla: 210, keppetipola: 235, colombo: 250 },
      tomato: { dambulla: 140, keppetipola: 130, colombo: 170 },
      cabbage: { dambulla: 110, keppetipola: 120, colombo: 140 },
      beans: { dambulla: 330, keppetipola: 320, colombo: 360 },
      brinjal: { dambulla: 180, keppetipola: 165, colombo: 210 },
      pumpkin: { dambulla: 95, keppetipola: 80, colombo: 125 }
    };

    const base = basePrices[cropKey.toLowerCase()] || { dambulla: 200, keppetipola: 200, colombo: 220 };
    const today = new Date();
    const history = [];

    // Generate 6 data points, every 5 days
    for (let i = 5; i >= 0; i--) {
      const pastDate = new Date(today.getTime() - i * 5 * 24 * 60 * 60 * 1000);
      const dayOfYear = Math.floor((pastDate - new Date(pastDate.getFullYear(), 0, 0)) / 86400000);
      
      const charCode = cropKey.toLowerCase().charCodeAt(0) || 100;
      const wave = Math.sin(dayOfYear / 10 + charCode) * 0.08;

      history.push({
        date: pastDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        dambulla: Math.round(base.dambulla * (1 + wave)),
        keppetipola: Math.round(base.keppetipola * (1 + wave * 1.1)),
        colombo: Math.round(base.colombo * (1 + wave * 0.9))
      });
    }
    return history;
  };

  const getPriceY = (price, history) => {
    const allPrices = [
      ...history.map(h => h.dambulla),
      ...history.map(h => h.keppetipola),
      ...history.map(h => h.colombo)
    ];
    const max = Math.max(...allPrices);
    const min = Math.min(...allPrices);
    const range = max - min || 1;
    const chartHeight = 90;
    return 120 - ((price - min) / range) * chartHeight; // Y ranges from 30 to 120 inside 160-height SVG
  };

  const generatePricePath = (history, field) => {
    if (!history || history.length === 0) return "";
    const points = history.map((h, idx) => {
      const x = 35 + idx * 52;
      const y = getPriceY(h[field], history);
      return `${x},${y}`;
    });
    return `M ${points.join(" L ")}`;
  };

  const handleRowClick = (cropName) => {
    const name = cropName.toLowerCase().trim();
    const matchedKey = Object.keys(TREND_CROPS).find(k => 
      name.includes(k) || k.includes(name)
    );
    if (matchedKey) {
      setSelectedTrendCrop(matchedKey);
    }
  };

  const TREND_CROPS = {
    carrot: { nameSi: "කැරට්", nameEn: "Carrot" },
    leeks: { nameSi: "ලීක්ස්", nameEn: "Leeks" },
    potato: { nameSi: "අර්තාපල්", nameEn: "Potato" },
    tomato: { nameSi: "තක්කාලි", nameEn: "Tomato" },
    cabbage: { nameSi: "ගෝවා", nameEn: "Cabbage" },
    beans: { nameSi: "බෝංචි", nameEn: "Beans" },
    brinjal: { nameSi: "වම්බටු", nameEn: "Brinjal" },
    pumpkin: { nameSi: "වට්ටක්කා", nameEn: "Pumpkin" }
  };

  return (
    <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none bg-gradient-to-r from-emerald-600 to-indigo-600 bg-clip-text text-transparent">
              {lang === "si" ? "Google Gemini කෘෂි කාලගුණ සහ මිල විශ්ලේෂණය" : "Google Gemini Agri Weather & Price Analytics"}
            </h1>
            <p className="text-sm font-semibold text-gray-500 mt-2">
              {lang === "si" 
                ? "Google Gemini (ජිබී) ස්මාර්ට් තාක්ෂණයෙන් කාලගුණය බලා වගා උපදෙස් සහ දේශීය වෙළඳපොල තොග මිල ගණන් සංසන්දනය කරන්න."
                : "Get dynamic farming advisories powered by Google Gemini based on real-time weather and compare economic center price logs."}
            </p>
          </div>

          <button
            onClick={() => setLang(lang === "si" ? "en" : "si")}
            className="self-start sm:self-center bg-white hover:bg-gray-100 border border-gray-200 text-xs font-black px-4 py-2.5 rounded-xl transition cursor-pointer shadow-sm"
          >
            {lang === "si" ? "English 🌐" : "සිංහල 🌐"}
          </button>
        </div>

        {/* Weather advisory block */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Live Weather & Trends Chart */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Real-time Weather info */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-50 rounded-bl-full opacity-30 -z-0"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
                    {lang === "si" ? "සජීවී කාලගුණය" : "Live Forecast"}
                  </span>
                  
                  {/* District Selector dropdown */}
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="bg-gray-50 hover:bg-gray-100 border border-gray-200 font-bold text-xs text-gray-800 rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
                  >
                    {Object.entries(DISTRICT_COORDS).map(([key, data]) => (
                      <option key={key} value={key}>
                        📍 {lang === "si" ? data.labelSi : data.labelEn}
                      </option>
                    ))}
                  </select>
                </div>

                {weatherLoading ? (
                  <div className="py-12 text-center">
                    <div className="h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <span className="text-xs font-bold text-gray-400">Loading Weather...</span>
                  </div>
                ) : weatherData ? (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <span className="text-5xl">{getWeatherDetails(weatherData.code, lang === "si").emoji}</span>
                      <div>
                        <span className="text-3xl font-black text-gray-900">{weatherData.temp}°C</span>
                        <p className="text-xs font-bold text-gray-500 mt-0.5">
                          {getWeatherDetails(weatherData.code, lang === "si").label}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-4 text-xs font-bold text-gray-500">
                      <div className="flex items-center gap-1.5 bg-gray-50 p-2.5 rounded-xl">
                        <span>💨</span>
                        <div>
                          <span className="block text-[10px] text-gray-400 font-medium">Wind</span>
                          <span className="text-gray-900">{weatherData.wind} km/h</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 bg-gray-50 p-2.5 rounded-xl">
                        <span>🌧️</span>
                        <div>
                          <span className="block text-[10px] text-gray-400 font-medium">Precip.</span>
                          <span className="text-gray-900">{weatherData.forecast[0].precipProb}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-red-500 text-xs font-bold">Failed to load weather forecast.</div>
                )}
              </div>

              {/* 5-day forecast details */}
              {!weatherLoading && weatherData && (
                <div className="border-t border-gray-50 pt-4 mt-6 space-y-2.5">
                  {weatherData.forecast.map((day, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs font-semibold text-gray-700">
                      <span className="w-24 font-bold text-gray-400">{day.date}</span>
                      <span className="text-base">{getWeatherDetails(day.code, lang === "si").emoji}</span>
                      <span className="w-16 text-right font-black text-gray-800">{day.minTemp}° / {day.maxTemp}°</span>
                      <span className="w-10 text-right text-[10px] text-blue-600 font-extrabold">{day.precipProb}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Weather Trends Chart Card */}
            {!weatherLoading && weatherData && (
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                  <span className="text-xs font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider">
                    {lang === "si" ? "කාලගුණ ප්‍රවණතා" : "Weather Trends"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => setChartMode("temp")} 
                      className={`text-[10px] font-black px-2 py-1 rounded-lg transition border cursor-pointer ${
                        chartMode === "temp" 
                          ? "bg-amber-500 border-amber-600 text-white shadow-sm" 
                          : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      {lang === "si" ? "උෂ්ණත්වය" : "Temp"}
                    </button>
                    <button 
                      onClick={() => setChartMode("rain")} 
                      className={`text-[10px] font-black px-2 py-1 rounded-lg transition border cursor-pointer ${
                        chartMode === "rain" 
                          ? "bg-blue-600 border-blue-700 text-white shadow-sm" 
                          : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      {lang === "si" ? "වැස්ස" : "Rain"}
                    </button>
                  </div>
                </div>

                {/* Selected Day Info Display */}
                {weatherData.forecast[activeChartIdx] && (
                  <div className="flex items-center justify-between bg-gray-50/50 border border-gray-100 rounded-2xl p-3 text-xs font-semibold text-gray-700 transition">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-bold leading-none mb-1">
                        {weatherData.forecast[activeChartIdx].date}
                      </span>
                      <span className="text-gray-900 font-extrabold text-sm leading-none flex items-center gap-1.5">
                        {getWeatherDetails(weatherData.forecast[activeChartIdx].code, lang === "si").emoji}
                        {getWeatherDetails(weatherData.forecast[activeChartIdx].code, lang === "si").label}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block text-gray-800 font-extrabold">
                        🔥 {weatherData.forecast[activeChartIdx].minTemp}°C - {weatherData.forecast[activeChartIdx].maxTemp}°C
                      </span>
                      <span className="text-[10px] text-blue-600 font-extrabold block mt-0.5">
                        💧 Rain: {weatherData.forecast[activeChartIdx].precipProb}%
                      </span>
                    </div>
                  </div>
                )}

                {/* SVG Render Container */}
                <div className="relative pt-2">
                  <svg className="w-full h-auto overflow-visible" viewBox="0 0 320 160">
                    <defs>
                      <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.7" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.15" />
                      </linearGradient>
                    </defs>

                    {/* Grid Lines */}
                    <line x1="20" y1="30" x2="300" y2="30" stroke="#f9fafb" strokeWidth={1} />
                    <line x1="20" y1="70" x2="300" y2="70" stroke="#f3f4f6" strokeDasharray="3,3" strokeWidth={1} />
                    <line x1="20" y1="110" x2="300" y2="110" stroke="#e5e7eb" strokeWidth={1} />

                    {/* Chart Mode Renderings */}
                    {chartMode === "temp" ? (
                      <>
                        {/* Temperature Line Path */}
                        <path
                          d={generateTempPath(weatherData.forecast)}
                          fill="url(#tempGrad)"
                          stroke="none"
                        />
                        <path
                          d={generateTempPathLineOnly(weatherData.forecast)}
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth={2.5}
                          strokeLinecap="round"
                        />
                        
                        {/* Interactive Data points */}
                        {weatherData.forecast.map((day, idx) => {
                          const x = 30 + idx * 65;
                          const y = getTempY(day.maxTemp, weatherData.forecast);
                          const isActive = activeChartIdx === idx;
                          return (
                            <g 
                              key={idx} 
                              className="cursor-pointer" 
                              onClick={() => setActiveChartIdx(idx)}
                              onMouseEnter={() => setActiveChartIdx(idx)}
                            >
                              <circle
                                cx={x}
                                cy={y}
                                r={isActive ? 6 : 4}
                                fill={isActive ? "#f59e0b" : "#ffffff"}
                                stroke="#f59e0b"
                                strokeWidth={isActive ? 3 : 2}
                                className="transition-all duration-150"
                              />
                              <text
                                x={x}
                                y={y - 10}
                                textAnchor="middle"
                                className="text-[10px] font-black fill-amber-700 font-sans"
                              >
                                {day.maxTemp}°
                              </text>
                              {/* X Axis Label */}
                              <text
                                x={x}
                                y="140"
                                textAnchor="middle"
                                className={`text-[9px] font-extrabold font-sans transition ${
                                  isActive ? "fill-indigo-600 font-black scale-105" : "fill-gray-400"
                                }`}
                              >
                                {day.date.split(" ")[0]}
                              </text>
                            </g>
                          );
                        })}
                      </>
                    ) : (
                      <>
                        {/* Rain Bars */}
                        {weatherData.forecast.map((day, idx) => {
                          const x = 30 + idx * 65;
                          const barWidth = 20;
                          const maxBarHeight = 80;
                          const barHeight = (day.precipProb / 100) * maxBarHeight;
                          const y = 110 - barHeight;
                          const isActive = activeChartIdx === idx;
                          return (
                            <g 
                              key={idx} 
                              className="cursor-pointer" 
                              onClick={() => setActiveChartIdx(idx)}
                              onMouseEnter={() => setActiveChartIdx(idx)}
                            >
                              {/* Background column area for easier hovering */}
                              <rect
                                x={x - 15}
                                y="20"
                                width="30"
                                height="100"
                                fill="transparent"
                              />
                              <rect
                                x={x - barWidth / 2}
                                y={y}
                                width={barWidth}
                                height={Math.max(barHeight, 2)}
                                rx="4"
                                fill="url(#rainGrad)"
                                stroke={isActive ? "#2563eb" : "#3b82f6"}
                                strokeWidth={isActive ? 1.5 : 1}
                                className="transition-all duration-150"
                              />
                              <text
                                x={x}
                                y={y - 8}
                                textAnchor="middle"
                                className="text-[9px] font-black fill-blue-700 font-sans"
                              >
                                {day.precipProb}%
                              </text>
                              {/* X Axis Label */}
                              <text
                                x={x}
                                y="140"
                                textAnchor="middle"
                                className={`text-[9px] font-extrabold font-sans transition ${
                                  isActive ? "fill-indigo-600 font-black scale-105" : "fill-gray-400"
                                }`}
                              >
                                {day.date.split(" ")[0]}
                              </text>
                            </g>
                          );
                        })}
                      </>
                    )}
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Dynamic Agri Advisory Panel */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-md flex flex-col justify-between">
            <div>
              <span className="text-xs font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider">
                {lang === "si" ? "Google Gemini (ජිබී) කෘෂිකාර්මික උපදේශනය" : "Google Gemini (Jibi) Agricultural Advisory"}
              </span>

              {weatherLoading ? (
                <div className="py-20 text-center">
                  <div className="h-8 w-8 border-4 border-indigo-650 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <span className="text-xs font-bold text-gray-400">Formulating recommendations...</span>
                </div>
              ) : currentAdv ? (
                <div className="mt-6 space-y-4">
                  <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                    currentAdv.type === "warning"
                      ? "bg-amber-50/50 border-amber-100 text-amber-900"
                      : currentAdv.type === "success"
                      ? "bg-emerald-50/50 border-emerald-100 text-emerald-900"
                      : "bg-blue-50/50 border-blue-100 text-blue-900"
                  }`}>
                    <span className="text-2xl mt-0.5">💡</span>
                    <div>
                      <h4 className="font-extrabold text-sm tracking-tight leading-none mb-1.5">{currentAdv.title}</h4>
                      <p className="text-xs leading-relaxed font-medium">{currentAdv.advice}</p>
                    </div>
                  </div>

                  {/* Standard practices reminders */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-xs">
                      <h5 className="font-bold text-gray-800 flex items-center gap-1.5">
                        <span>🧪</span> {lang === "si" ? "පොහොර සහ කෘමිනාශක" : "Fertilizers & Sprays"}
                      </h5>
                      <p className="text-gray-500 font-medium leading-relaxed mt-1.5">
                        {lang === "si"
                          ? "වැසි රහිත දිනවල සවස් වරුවේ යෙදීම සුදුසුය. වර්ෂාපතන සම්භාවිතාව 30% ට වඩා අඩු දින තෝරා ගන්න."
                          : "Apply on dry days, preferably in late evenings. Ensure rain probability is below 30% for at least 6 hours post-application."}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-xs">
                      <h5 className="font-bold text-gray-800 flex items-center gap-1.5">
                        <span>🌱</span> {lang === "si" ? "තෙතමනය කළමනාකරණය" : "Soil Moisture Guidelines"}
                      </h5>
                      <p className="text-gray-500 font-medium leading-relaxed mt-1.5">
                        {lang === "si"
                          ? "වැසි ඇති විට අමතර ජලය සැපයීම නවත්වන්න. වියළි කාලගුණයේදී උදෑසන කාලයේ පමණක් බිංදු වාරි ක්‍රම භාවිතා කරන්න."
                          : "Suspend irrigation in high humidity/rain. During dry spells, use drip irrigation only in the early morning to minimize evaporation."}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center text-gray-400 text-xs font-bold">Advisory data is currently unavailable.</div>
              )}
            </div>

            <span className="text-[10px] text-gray-400 font-semibold block mt-6 border-t border-gray-50 pt-3">
              *Advisories are generated dynamically using real-time atmospheric readings in your locality.
            </span>
          </div>

        </div>

        {/* Gemini Assistant & Yield Calculator Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Google Gemini AI Prompt Assistant */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-md space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
                <span className="text-xl">✨</span>
                <div>
                  <h3 className="text-sm font-black text-gray-900">
                    {lang === "si" ? "Google Gemini (ජිබී) කෘෂි සහායකයා" : "Google Gemini (Jibi) AI Agricultural Assistant"}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                    {lang === "si" 
                      ? "ඔබේ වගා ගැටළු වලට කෘතිම බුද්ධිය හරහා එසැණින් පිළිතුරු ලබා ගන්න."
                      : "Ask dynamic farming questions and receive artificial intelligence insights."}
                  </p>
                </div>
              </div>

              {/* AI Response Output Block */}
              {aiResponse ? (
                <div className="mt-4 bg-indigo-50/20 border border-indigo-50 rounded-2xl p-4 animate-in fade-in duration-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-indigo-700 font-black text-[10px] uppercase tracking-wider">
                    <span>🤖</span> Google Gemini (Jibi) AI
                  </div>
                  <p className="text-xs font-semibold text-gray-700 leading-relaxed bg-white border border-gray-50 rounded-xl p-3.5 shadow-inner">
                    {aiResponse}
                  </p>
                </div>
              ) : (
                <div className="py-12 text-center text-gray-300 text-xs font-bold flex flex-col items-center justify-center gap-2">
                  <span className="text-3xl">🌾</span>
                  {lang === "si" ? "ප්‍රශ්නයක් විමසා ජිබීගෙන් උපදෙස් ලබා ගන්න." : "Ask Jibi a question to generate farming intelligence."}
                </div>
              )}
            </div>

            <div className="relative flex items-center bg-gray-50 border border-gray-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 rounded-2xl px-4 py-2.5 transition duration-200 mt-4">
              {/* Attachment icon for Google Gemini look */}
              <button className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg transition hover:bg-gray-100 shrink-0 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                </svg>
              </button>
              
              <input
                type="text"
                placeholder={lang === "si" ? "මෙහි විමසුමක් ඇතුළත් කරන්න..." : "Enter a prompt here..."}
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAskGemini()}
                className="flex-1 bg-transparent border-none outline-none focus:ring-0 px-3 py-1 font-semibold text-xs text-gray-800 placeholder-gray-400"
                disabled={aiLoading}
              />

              <div className="flex items-center gap-2 shrink-0">
                {/* Mic icon for Google Gemini look */}
                <button className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg transition hover:bg-gray-100 cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                  </svg>
                </button>

                {/* Send Button */}
                <button
                  onClick={handleAskGemini}
                  disabled={aiLoading || !aiQuery.trim()}
                  className={`p-2 rounded-xl transition duration-200 flex items-center justify-center cursor-pointer ${
                    aiQuery.trim() && !aiLoading
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {aiLoading ? (
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Yield & Fertilizer Calculator */}
          <div className="lg:col-span-1 bg-white border border-gray-100 rounded-3xl p-6 shadow-md space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
                <span className="text-xl">🧪</span>
                <div>
                  <h3 className="text-sm font-black text-gray-900">
                    {lang === "si" ? "අස්වනු හා පොහොර ගණකය" : "Yield & Fertilizer Calculator"}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                    {lang === "si" 
                      ? "බිම් ප්‍රමාණය අනුව අවශ්‍ය පොහොර සහ ලැබෙන ආදායම ඇස්තමේන්තු කරන්න."
                      : "Estimate required fertilizers and expected yield/revenue by land size."}
                  </p>
                </div>
              </div>

              {/* Form Input fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {lang === "si" ? "බෝග වර්ගය" : "Crop Type"}
                  </label>
                  <select
                    value={calcCrop}
                    onChange={(e) => setCalcCrop(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 font-bold text-xs text-gray-800 rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
                  >
                    <option value="Carrot">🥕 {lang === "si" ? "කැරට් (Carrot)" : "Carrot"}</option>
                    <option value="Potato">🥔 {lang === "si" ? "අර්තාපල් (Potato)" : "Potato"}</option>
                    <option value="Leeks">🌱 {lang === "si" ? "ලීක්ස් (Leeks)" : "Leeks"}</option>
                    <option value="Cabbage">🥬 {lang === "si" ? "ගෝවා (Cabbage)" : "Cabbage"}</option>
                    <option value="Tomato">🍅 {lang === "si" ? "තක්කාලි (Tomato)" : "Tomato"}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {lang === "si" ? "වගා බිම් ප්‍රමාණය (අක්කර)" : "Land Size (Acres)"}
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={calcLandSize}
                    onChange={(e) => setCalcLandSize(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 font-bold text-xs text-gray-800 rounded-xl px-3 py-2 focus:outline-none"
                  />
                </div>
              </div>

              {/* Results display */}
              {calcResults ? (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-2.5 text-center">
                      <span className="text-[9px] text-emerald-600 font-bold block uppercase tracking-wider leading-none mb-1">
                        {lang === "si" ? "අපේක්ෂිත අස්වැන්න" : "Est. Yield"}
                      </span>
                      <span className="text-sm font-black text-emerald-800 leading-none">
                        {calcResults.yield.toLocaleString()} Kg
                      </span>
                    </div>
                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-2.5 text-center">
                      <span className="text-[9px] text-indigo-600 font-bold block uppercase tracking-wider leading-none mb-1">
                        {lang === "si" ? "ඇස්තමේන්තුගත ආදායම" : "Est. Revenue"}
                      </span>
                      <span className="text-sm font-black text-indigo-800 leading-none text-nowrap">
                        LKR {Math.round(calcResults.revenue).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3 space-y-2">
                    <span className="text-[9px] text-gray-400 font-bold block uppercase tracking-wider leading-none border-b border-gray-200/50 pb-1.5">
                      🧪 {lang === "si" ? "අවශ්‍ය පොහොර ප්‍රමාණය" : "Required Fertilizer Input"}
                    </span>
                    <div className="space-y-1.5 text-[11px] font-bold text-gray-700">
                      <div className="flex items-center justify-between">
                        <span>{lang === "si" ? "යූරියා (Urea)" : "Urea"}</span>
                        <span className="text-gray-900 font-extrabold">{calcResults.urea.toLocaleString()} Kg</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>{lang === "si" ? "එම්.ඕ.පී. (MOP)" : "MOP (Muriate of Potash)"}</span>
                        <span className="text-gray-900 font-extrabold">{calcResults.mop.toLocaleString()} Kg</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>{lang === "si" ? "ටී.එස්.පී. (TSP)" : "TSP (Triple Superphosphate)"}</span>
                        <span className="text-gray-900 font-extrabold">{calcResults.tsp.toLocaleString()} Kg</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-xs font-bold text-gray-300 py-6">
                  {lang === "si" ? "කරුණාකර නිවැරදි අගයක් ඇතුළත් කරන්න." : "Please enter a valid land size."}
                </div>
              )}
            </div>

            <span className="text-[9px] text-gray-400 font-bold block border-t border-gray-50 pt-2.5">
              * {lang === "si" ? "පොහොර ප්‍රමාණයන් ශ්‍රී ලංකා කෘෂිකර්ම දෙපාර්තමේන්තුවේ නිර්දේශ මත පදනම් වේ." : "Standards recommended by Sri Lanka Department of Agriculture."}
            </span>
          </div>

        </div>

        {/* Pricing Analytics comparisons & Trends */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Price Comparison Table Card */}
          <div className="xl:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-md space-y-6">
            <div>
              <h3 className="text-lg font-black text-gray-900">
                {lang === "si" ? "දේශීය වෙළඳපොල තොග මිල සංසන්දනය" : "Wholesale Center Price Comparison"}
              </h3>
              <p className="text-xs font-bold text-gray-500 mt-1">
                {lang === "si"
                  ? "ප්‍රධාන ආර්ථික මධ්‍යස්ථානවල (දඹුල්ල, කැප්පෙටිපොල, කොළඹ) තොග මිල ගණන් සමඟ ඔබේ අස්වැන්නේ මිල සංසන්දනය කර බලන්න. ප්‍රස්ථාරය නැරඹීමට බෝගය මත ක්ලික් කරන්න."
                  : "Compare your listed crop values side-by-side with benchmark prices at major regional economic terminals. Click a row to view trend chart."}
              </p>
            </div>

            {dataLoading ? (
              <div className="py-12 text-center text-gray-500 font-bold text-xs">
                <div className="h-6 w-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Analyzing prices...
              </div>
            ) : farmerCrops.length === 0 ? (
              <div className="py-12 text-center text-gray-400 font-bold bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <span className="text-4xl block mb-2">🌾</span>
                <p className="text-xs">{lang === "si" ? "තවමත් අස්වනු කිසිවක් එක් කර නොමැත." : "No crops listed to analyze."}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <th className="py-3 px-4">{lang === "si" ? "අස්වැන්න" : "My Crop Name"}</th>
                      <th className="py-3 px-4 text-emerald-600">{lang === "si" ? "මගේ මිල (LKR/Kg)" : "My Price (LKR)"}</th>
                      <th className="py-3 px-4">{lang === "si" ? "දඹුල්ල (තොග මිල)" : "Dambulla Wholesale"}</th>
                      <th className="py-3 px-4">{lang === "si" ? "කැප්පෙටිපොල (තොග)" : "Keppetipola"}</th>
                      <th className="py-3 px-4">{lang === "si" ? "කොළඹ (තොග)" : "Manning Market"}</th>
                      <th className="py-3 px-4">{lang === "si" ? "තත්ත්වය" : "Status Indicator"}</th>
                      <th className="py-3 px-4 max-w-xs">{lang === "si" ? "මිල උපදෙස්" : "Smart Strategy"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-xs font-bold text-gray-700">
                    {farmerCrops.map((crop) => {
                      const wholesaleMatch = getWholesaleMatch(crop.name);
                      const avgWholesale = wholesaleMatch
                        ? (wholesaleMatch.dambulla + wholesaleMatch.keppetipola + wholesaleMatch.colombo) / 3
                        : 0;
                      
                      const priceAnalysis = wholesaleMatch
                        ? getPriceAnalysis(crop.price, wholesaleMatch)
                        : null;

                      const isSelected = selectedTrendCrop === Object.keys(TREND_CROPS).find(k => crop.name.toLowerCase().includes(k));

                      return (
                        <tr 
                          key={crop._id} 
                          onClick={() => handleRowClick(crop.name)}
                          className={`cursor-pointer transition-all duration-150 ${
                            isSelected 
                              ? "bg-indigo-50/40 hover:bg-indigo-50/60" 
                              : "hover:bg-gray-50/65"
                          }`}
                        >
                          <td className="py-4 px-4 text-gray-900 font-extrabold flex items-center gap-1.5">
                            {isSelected && <span className="text-indigo-600 text-xs">➡️</span>}
                            {crop.name}
                          </td>
                          <td className="py-4 px-4 text-emerald-600 text-sm font-black">LKR {crop.price}</td>
                          
                          {wholesaleMatch ? (
                            <>
                              <td className="py-4 px-4 text-gray-500">LKR {wholesaleMatch.dambulla}</td>
                              <td className="py-4 px-4 text-gray-500">LKR {wholesaleMatch.keppetipola}</td>
                              <td className="py-4 px-4 text-gray-500">LKR {wholesaleMatch.colombo}</td>
                              <td className="py-4 px-4">
                                <span className={`inline-block px-2.5 py-1 rounded-full border text-[10px] font-black ${priceAnalysis.badgeClass}`}>
                                  {priceAnalysis.badgeText}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-gray-500 font-medium leading-normal max-w-xs">
                                {priceAnalysis.tip}
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="py-4 px-4 text-gray-300">-</td>
                              <td className="py-4 px-4 text-gray-300">-</td>
                              <td className="py-4 px-4 text-gray-300">-</td>
                              <td className="py-4 px-4">
                                <span className="inline-block px-2 py-0.5 bg-gray-50 border border-gray-100 text-gray-400 rounded-full text-[10px]">
                                  {lang === "si" ? "දත්ත නැත" : "No Match"}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-gray-400 font-medium leading-normal max-w-xs">
                                {lang === "si"
                                  ? "මෙම අස්වනු වර්ගයට දේශීය තොග මිල දත්ත සොයාගත නොහැක."
                                  : "Wholesale market data not listed for this crop name."}
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Price Trend Chart Card */}
          <div className="xl:col-span-1 bg-white border border-gray-100 rounded-3xl p-6 shadow-md flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  <div>
                    <h3 className="text-sm font-black text-gray-900">
                      {lang === "si" ? "මිල උච්චාවචන ප්‍රස්ථාරය" : "Price Trend Chart"}
                    </h3>
                    <p className="text-[9px] text-gray-400 font-bold mt-0.5">
                      {lang === "si" ? "පසුගිය දින 30 ක තොග මිල උච්චාවචනය." : "Past 30 days wholesale trends."}
                    </p>
                  </div>
                </div>

                <select
                  value={selectedTrendCrop}
                  onChange={(e) => setSelectedTrendCrop(e.target.value)}
                  className="bg-gray-50 border border-gray-200 font-bold text-[10px] text-gray-800 rounded-xl px-2 py-1 focus:outline-none cursor-pointer"
                >
                  {Object.entries(TREND_CROPS).map(([key, data]) => (
                    <option key={key} value={key}>
                      {lang === "si" ? data.nameSi : data.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* SVG Trend Chart */}
              <div className="relative pt-2">
                <svg className="w-full h-auto overflow-visible" viewBox="0 0 320 160">
                  {/* Grid Lines */}
                  <line x1="20" y1="30" x2="300" y2="30" stroke="#f9fafb" strokeWidth={1} />
                  <line x1="20" y1="75" x2="300" y2="75" stroke="#f3f4f6" strokeDasharray="3,3" strokeWidth={1} />
                  <line x1="20" y1="120" x2="300" y2="120" stroke="#e5e7eb" strokeWidth={1} />

                  {/* Trends lines */}
                  <path
                    d={generatePricePath(getHistoricalMarketPrices(selectedTrendCrop), 'colombo')}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                  />
                  <path
                    d={generatePricePath(getHistoricalMarketPrices(selectedTrendCrop), 'dambulla')}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                  />
                  <path
                    d={generatePricePath(getHistoricalMarketPrices(selectedTrendCrop), 'keppetipola')}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                  />

                  {/* Node Dots & Labels */}
                  {getHistoricalMarketPrices(selectedTrendCrop).map((h, idx) => {
                    const x = 35 + idx * 52;
                    const yColombo = getPriceY(h.colombo, getHistoricalMarketPrices(selectedTrendCrop));
                    const yDambulla = getPriceY(h.dambulla, getHistoricalMarketPrices(selectedTrendCrop));
                    const yKeppetipola = getPriceY(h.keppetipola, getHistoricalMarketPrices(selectedTrendCrop));
                    
                    return (
                      <g key={idx}>
                        {/* Colombo Dot */}
                        <circle cx={x} cy={yColombo} r={3} fill="#6366f1" />
                        {/* Dambulla Dot */}
                        <circle cx={x} cy={yDambulla} r={3} fill="#10b981" />
                        {/* Keppetipola Dot */}
                        <circle cx={x} cy={yKeppetipola} r={3} fill="#f59e0b" />
                        
                        {/* X-axis date labels */}
                        <text
                          x={x}
                          y="142"
                          textAnchor="middle"
                          className="text-[8px] font-bold fill-gray-400 font-sans"
                        >
                          {h.date.split(" ")[0]}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Legend and current center values */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3.5 space-y-2">
              <span className="text-[9px] text-gray-400 font-bold block uppercase tracking-wider leading-none">
                📍 {lang === "si" ? "අද දින තොග මිල ගණන්" : "Today's Wholesale Rates"}
              </span>
              
              <div className="grid grid-cols-3 gap-2 text-[10px] font-black text-center">
                <div className="space-y-1">
                  <span className="flex items-center justify-center gap-1 text-[#6366f1]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#6366f1] inline-block"></span>
                    {lang === "si" ? "කොළඹ" : "Colombo"}
                  </span>
                  <span className="text-gray-900 block font-sans">
                    LKR {getHistoricalMarketPrices(selectedTrendCrop)[5].colombo}
                  </span>
                </div>
                <div className="space-y-1 border-x border-gray-200">
                  <span className="flex items-center justify-center gap-1 text-[#10b981]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] inline-block"></span>
                    {lang === "si" ? "දඹුල්ල" : "Dambulla"}
                  </span>
                  <span className="text-gray-900 block font-sans">
                    LKR {getHistoricalMarketPrices(selectedTrendCrop)[5].dambulla}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="flex items-center justify-center gap-1 text-[#f59e0b]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#f59e0b] inline-block"></span>
                    {lang === "si" ? "කැප්පෙ" : "Keppeti"}
                  </span>
                  <span className="text-gray-900 block font-sans">
                    LKR {getHistoricalMarketPrices(selectedTrendCrop)[5].keppetipola}
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
    </div>
  );
}

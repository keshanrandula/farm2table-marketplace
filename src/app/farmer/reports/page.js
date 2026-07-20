"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";


export default function FarmerReports() {
  const router = useRouter();
  const [lang, setLang] = useState("si");
  const [farmerId, setFarmerId] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Tab control
  const [activeTab, setActiveTab] = useState("sales"); // "sales" or "market"

  // Market Analytics State
  const [marketCrops, setMarketCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [marketLoading, setMarketLoading] = useState(false);

  // Statistics State
  const [metrics, setMetrics] = useState({
    totalEarnings: 0,
    totalQtySold: 0,
    orderCount: 0,
    averageOrderValue: 0
  });
  const [monthlySales, setMonthlySales] = useState([]);
  const [cropBreakdown, setCropBreakdown] = useState([]);
  const [buyerBreakdown, setBuyerBreakdown] = useState({ hotel: 0, customer: 0 });

  useEffect(() => {
    if (activeTab !== "market") return;
    async function fetchMarketAnalytics() {
      setMarketLoading(true);
      try {
        const res = await fetch("/api/analytics/price-trends");
        const data = await res.json();
        if (data.success && data.data) {
          setMarketCrops(data.data);
          if (data.data.length > 0 && !selectedCrop) {
            setSelectedCrop(data.data[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching market analytics:", err);
      } finally {
        setMarketLoading(false);
      }
    }
    fetchMarketAnalytics();
  }, [activeTab]);

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

  useEffect(() => {
    if (!farmerId) return;

    async function fetchFarmerOrders() {
      try {
        const res = await fetch(`/api/orders?farmerId=${farmerId}`);
        const data = await res.json();
        if (data.success) {
          setOrders(data.data);
          calculateAnalytics(data.data);
        } else {
          setErrorMsg("වාර්තා දත්ත පූරණය කිරීම අසාර්ථක විය / Failed to load sales records.");
        }
      } catch (err) {
        setErrorMsg("සම්බන්ධතා දෝෂයකි / Network connection error.");
      } finally {
        setLoading(false);
      }
    }

    fetchFarmerOrders();
  }, [farmerId]);

  const calculateAnalytics = (ordersList) => {
    let totalEarnings = 0;
    let totalQtySold = 0;
    let count = 0;

    const salesByMonth = {};
    const salesByCrop = {};
    let hotelSales = 0;
    let customerSales = 0;

    ordersList.forEach(order => {
      if (order.status === "cancelled") return;

      let containsFarmerItem = false;
      let orderFarmerSubtotal = 0;

      order.items.forEach(item => {
        const itemFarmerId = item.cropId?.farmerId?._id || item.cropId?.farmerId || "";
        if (itemFarmerId.toString() === farmerId.toString()) {
          containsFarmerItem = true;
          const itemRevenue = item.price * item.quantity;
          orderFarmerSubtotal += itemRevenue;
          totalEarnings += itemRevenue;
          totalQtySold += item.quantity;

          // Group by Crop Name
          const cropName = item.name || item.cropId?.name || "Other";
          salesByCrop[cropName] = (salesByCrop[cropName] || 0) + item.quantity;
        }
      });

      if (containsFarmerItem) {
        count++;
        // Group by Month of order creation
        const orderDate = new Date(order.createdAt);
        const monthName = orderDate.toLocaleString("en-US", { month: "short" }); // e.g. "Jan", "Feb"
        salesByMonth[monthName] = (salesByMonth[monthName] || 0) + orderFarmerSubtotal;

        // Group by Buyer Role
        const buyerRole = order.buyerId?.role || "customer";
        if (buyerRole === "hotel") {
          hotelSales += orderFarmerSubtotal;
        } else {
          customerSales += orderFarmerSubtotal;
        }
      }
    });

    // Populate Metrics
    setMetrics({
      totalEarnings,
      totalQtySold,
      orderCount: count,
      averageOrderValue: count > 0 ? Math.round(totalEarnings / count) : 0
    });

    // Monthly sales over the last 6 months in chronological order
    const monthsOrder = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      monthsOrder.push(d.toLocaleString("en-US", { month: "short" }));
    }

    const monthlyData = monthsOrder.map(m => ({
      month: m,
      sales: salesByMonth[m] || 0
    }));
    setMonthlySales(monthlyData);

    // Crop breakdown sorted by quantity
    const cropData = Object.entries(salesByCrop)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity);
    setCropBreakdown(cropData);

    // Buyer ratio
    setBuyerBreakdown({ hotel: hotelSales, customer: customerSales });
  };

  // Helper for drawing SVG Trend Line
  const drawSvgTrend = () => {
    if (monthlySales.length === 0) return null;
    const width = 500;
    const height = 180;
    const paddingLeft = 60;
    const paddingRight = 30;
    const paddingTop = 20;
    const paddingBottom = 30;

    const maxSales = Math.max(...monthlySales.map(m => m.sales), 1000);
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const points = monthlySales.map((m, idx) => {
      const x = paddingLeft + idx * (chartWidth / (monthlySales.length - 1));
      const y = paddingTop + chartHeight - (m.sales / maxSales) * chartHeight;
      return { x, y, sales: m.sales, month: m.month };
    });

    const lineD = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const areaD = `${lineD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = paddingTop + chartHeight * ratio;
          const gridVal = Math.round(maxSales * (1 - ratio));
          return (
            <g key={i}>
              <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#f3f4f6" strokeWidth="1" />
              <text x={paddingLeft - 8} y={y + 4} textAnchor="end" className="text-[9px] fill-gray-400 font-bold">
                {gridVal >= 1000 ? `${(gridVal / 1000).toFixed(0)}k` : gridVal}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaD} fill="url(#chartGrad)" />

        {/* Trend Line */}
        <path d={lineD} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />

        {/* Points & Labels */}
        {points.map((p, idx) => (
          <g key={idx} className="group cursor-pointer">
            <circle cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke="#10b981" strokeWidth="2.5" />
            <circle cx={p.x} cy={p.y} r="2" fill="#10b981" />
            
            {/* Tooltip Label */}
            <text
              x={p.x}
              y={p.y - 10}
              textAnchor="middle"
              className="text-[9px] font-extrabold fill-emerald-700 bg-white"
            >
              {p.sales > 0 ? `${(p.sales / 1000).toFixed(1)}k` : ""}
            </text>

            {/* X-axis Label */}
            <text
              x={p.x}
              y={height - 12}
              textAnchor="middle"
              className="text-[10px] fill-gray-400 font-bold"
            >
              {p.month}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  const text = {
    si: {
      title: "වාර්තා සහ දත්ත විශ්ලේෂණය",
      subtitle: "ඔබගේ අස්වනු අලෙවිය, වෙළඳපල මිල ප්‍රවණතා සහ මිල නිර්දේශයන්.",
      cardEarnings: "මුළු ආදායම",
      cardQty: "මුළු අලෙවිය (Kg)",
      cardOrders: "ඇණවුම් ගණන",
      cardAvgValue: "සාමාන්‍ය ඇණවුමක අගය",
      chartTrendTitle: "මාසික විකුණුම් ප්‍රවණතාවය (Sales Trend)",
      chartCropTitle: "වැඩිපුරම අලෙවි වූ අස්වනු (Top Sold Crops)",
      chartBuyerTitle: "ගනුදෙනුකරුවන්ගේ අනුපාතය",
      tableColMonth: "මාසය",
      tableColRevenue: "ආදායම",
      buyerHotels: "🏨 හෝටල් (B2B)",
      buyerCustomers: "👤 පාරිභෝගිකයින් (B2C)",
      loading: "වාර්තා සහ ප්‍රස්ථාර සකසමින් පවතී...",
      kg: "Kg",
      perKg: "රු",
      noSales: "දැනට කිසිදු විකුණුම් වාර්තාවක් නොමැත.",
      tabMySales: "මගේ විකුණුම්",
      tabMarket: "වෙළඳපල මිල විශ්ලේෂණය",
      marketSupply: "වෙළඳපල සැපයුම",
      marketDemand: "වෙළඳපල ඉල්ලුම",
      recommendedPrice: "යෝජිත සාධාරණ මිල",
      avgMarketPrice: "සාමාන්‍ය වෙළඳපල මිල",
      cropSelect: "අස්වැන්න තෝරන්න",
      priceChartTitle: "මිල වෙනස්වීමේ ප්‍රවණතාවය",
      marketOverview: "වෙළඳපල දත්ත සාරාංශය",
      marketDashboard: "ස්මාර්ට් මිල නිර්දේශයන්",
      noMarketCrops: "වෙළඳපල දත්ත කිසිවක් හමු නොවීය."
    },
    en: {
      title: "Reports & Market Analytics",
      subtitle: "Analyze your crop sales patterns, market price trends, and smart pricing recommendations.",
      cardEarnings: "Total Earnings",
      cardQty: "Total Weight Sold",
      cardOrders: "Total Orders",
      cardAvgValue: "Average Order Value",
      chartTrendTitle: "Monthly Revenue Trend",
      chartCropTitle: "Top Selling Harvest (by Weight)",
      chartBuyerTitle: "Customer Channel Distribution",
      tableColMonth: "Month",
      tableColRevenue: "Earnings",
      buyerHotels: "🏨 Hotels (B2B Wholesale)",
      buyerCustomers: "👤 Customers (B2C Retail)",
      loading: "Generating financial reports...",
      kg: "Kg",
      perKg: "LKR",
      noSales: "No sales records available yet.",
      tabMySales: "My Sales",
      tabMarket: "Market Price Analytics",
      marketSupply: "Active Market Supply",
      marketDemand: "Total Market Demand",
      recommendedPrice: "Recommended Price",
      avgMarketPrice: "Market Average Price",
      cropSelect: "Select Crop Category",
      priceChartTitle: "Price Fluctuation Timeline",
      marketOverview: "Market Summary",
      marketDashboard: "Smart Pricing Insights",
      noMarketCrops: "No market crop records available."
    }
  };

  // SVG Price Trend Chart drawing
  const drawCropPriceTrend = (crop) => {
    if (!crop || !crop.history || crop.history.length === 0) return null;
    const historyData = crop.history;
    const width = 500;
    const height = 180;
    const paddingLeft = 50;
    const paddingRight = 30;
    const paddingTop = 25;
    const paddingBottom = 30;

    const prices = historyData.map(h => h.price);
    const minPrice = Math.max(0, Math.min(...prices) * 0.9);
    const maxPrice = Math.max(...prices) * 1.1;
    const priceDiff = maxPrice - minPrice || 10;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const points = historyData.map((h, idx) => {
      const x = paddingLeft + idx * (chartWidth / (historyData.length - 1));
      const y = paddingTop + chartHeight - ((h.price - minPrice) / priceDiff) * chartHeight;
      return { x, y, price: h.price, date: h.date };
    });

    const lineD = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const areaD = `${lineD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          <linearGradient id="cropChartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = paddingTop + chartHeight * ratio;
          const gridVal = Math.round(maxPrice - (priceDiff * ratio));
          return (
            <g key={i}>
              <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#f3f4f6" strokeWidth="1" />
              <text x={paddingLeft - 8} y={y + 4} textAnchor="end" className="text-[9px] fill-gray-400 font-extrabold">
                {gridVal}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaD} fill="url(#cropChartGrad)" />

        {/* Trend Line */}
        <path d={lineD} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />

        {/* Points & Labels */}
        {points.map((p, idx) => (
          <g key={idx} className="group cursor-pointer">
            <circle cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke="#6366f1" strokeWidth="2.5" />
            <circle cx={p.x} cy={p.y} r="2" fill="#6366f1" />
            
            {/* Tooltip Label */}
            <text
              x={p.x}
              y={p.y - 10}
              textAnchor="middle"
              className="text-[9px] font-black fill-indigo-700 bg-white"
            >
              LKR {p.price}
            </text>

            {/* X-axis Label */}
            <text
              x={p.x}
              y={height - 12}
              textAnchor="middle"
              className="text-[8px] fill-gray-400 font-bold"
            >
              {p.date}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  const t = text[lang];
  const maxCropQty = cropBreakdown[0] ? cropBreakdown[0].quantity : 1;
  const totalBuyerSales = buyerBreakdown.hotel + buyerBreakdown.customer || 1;
  const hotelPercentage = Math.round((buyerBreakdown.hotel / totalBuyerSales) * 100);
  const customerPercentage = Math.round((buyerBreakdown.customer / totalBuyerSales) * 100);

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
            className="self-start sm:self-center bg-white hover:bg-gray-100 border border-gray-200 text-xs font-black px-4 py-2.5 rounded-xl transition cursor-pointer shadow-sm"
          >
            {lang === "si" ? "Switch to English 🌐" : "සිංහලට මාරු වන්න 🌐"}
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Tab Selection Toggle */}
        <div className="flex border-b border-gray-200 gap-6">
          <button
            onClick={() => setActiveTab("sales")}
            className={`pb-3 font-bold text-sm border-b-2 transition cursor-pointer ${
              activeTab === "sales"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {t.tabMySales}
          </button>
          <button
            onClick={() => setActiveTab("market")}
            className={`pb-3 font-bold text-sm border-b-2 transition cursor-pointer ${
              activeTab === "market"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {t.tabMarket}
          </button>
        </div>

        {activeTab === "sales" ? (
          <>
            {loading ? (
              <div className="py-24 text-center">
                <div className="h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 font-bold text-sm">{t.loading}</p>
              </div>
            ) : metrics.orderCount === 0 ? (
              <div className="py-20 text-center text-gray-400 font-semibold bg-white rounded-3xl border border-gray-150 p-8 shadow-sm">
                <span className="text-6xl block mb-4">📊</span>
                <p>{t.noSales}</p>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in duration-200">
                
                {/* Stats Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  <div className="bg-emerald-600 rounded-3xl p-6 text-white shadow-lg shadow-emerald-600/10 flex flex-col justify-between h-36">
                    <span className="text-xs font-extrabold text-emerald-100 uppercase tracking-wider block">{t.cardEarnings}</span>
                    <span className="text-2xl font-black block mt-2">{t.perKg} {metrics.totalEarnings.toLocaleString()}</span>
                  </div>

                  <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-36">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">{t.cardQty}</span>
                    <span className="text-2xl font-black text-gray-900 block mt-2">{metrics.totalQtySold.toLocaleString()} {t.kg}</span>
                  </div>

                  <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-36">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">{t.cardOrders}</span>
                    <span className="text-2xl font-black text-gray-900 block mt-2">{metrics.orderCount}</span>
                  </div>

                  <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-36">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">{t.cardAvgValue}</span>
                    <span className="text-2xl font-black text-emerald-600 block mt-2">{t.perKg} {metrics.averageOrderValue.toLocaleString()}</span>
                  </div>

                </div>

                {/* Trend Graphs & Side bars */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Sales Monthly Line chart */}
                  <div className="lg:col-span-2 bg-white border border-gray-150 rounded-3xl p-6 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-gray-900 border-b border-gray-50 pb-3">{t.chartTrendTitle}</h3>
                    <div className="w-full">
                      {drawSvgTrend()}
                    </div>
                  </div>

                  {/* Channel Distribution */}
                  <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-full">
                    <div>
                      <h3 className="text-base font-bold text-gray-900 border-b border-gray-50 pb-3 mb-4">{t.chartBuyerTitle}</h3>
                      <div className="space-y-4 pt-2">
                        
                        {/* Hotels Wholesale */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-bold text-gray-600">
                            <span>{t.buyerHotels}</span>
                            <span className="text-gray-900">{hotelPercentage}% ({t.perKg} {buyerBreakdown.hotel.toLocaleString()})</span>
                          </div>
                          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${hotelPercentage}%` }}></div>
                          </div>
                        </div>

                        {/* Customers Retail */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-bold text-gray-600">
                            <span>{t.buyerCustomers}</span>
                            <span className="text-gray-900">{customerPercentage}% ({t.perKg} {buyerBreakdown.customer.toLocaleString()})</span>
                          </div>
                          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${customerPercentage}%` }}></div>
                          </div>
                        </div>

                      </div>
                    </div>
                    
                    <span className="text-[10px] text-gray-400 font-semibold block mt-6 border-t border-gray-50 pt-3">
                      Calculates revenue splits between bulk B2B purchase volume vs B2C direct buyer order tickets.
                    </span>
                  </div>

                </div>

                {/* Crop Sales Histogram Breakdown */}
                <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-gray-900 border-b border-gray-50 pb-3">{t.chartCropTitle}</h3>
                  
                  <div className="space-y-4">
                    {cropBreakdown.map((crop, idx) => {
                      const percentage = Math.round((crop.quantity / maxCropQty) * 100);
                      return (
                        <div key={idx} className="flex items-center gap-4 text-xs font-semibold text-gray-700">
                          
                          {/* Name tag */}
                          <span className="w-28 truncate font-bold text-gray-955">{crop.name}</span>
                          
                          {/* Progress Bar bar */}
                          <div className="flex-1 h-8 bg-gray-50 rounded-xl border border-gray-100 relative overflow-hidden flex items-center px-3">
                            <div 
                              className="absolute inset-y-0 left-0 bg-emerald-50 border-r border-emerald-100 transition-all duration-500" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                            <span className="relative z-10 text-[10px] text-emerald-800 font-extrabold">{crop.quantity} {t.kg}</span>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}
          </>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-200 text-gray-800">
            {marketLoading ? (
              <div className="py-24 text-center">
                <div className="h-10 w-10 border-4 border-indigo-650 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 font-bold text-sm">{lang === "si" ? "වෙළඳපල දත්ත පූරණය වෙමින් පවතී..." : "Loading market records..."}</p>
              </div>
            ) : marketCrops.length === 0 ? (
              <div className="py-20 text-center text-gray-400 font-semibold bg-white rounded-3xl border border-gray-150 p-8 shadow-sm">
                <span className="text-6xl block mb-4">📈</span>
                <p>{t.noMarketCrops}</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Crop selector dropdown */}
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{t.cropSelect}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{t.marketDashboard}</p>
                  </div>
                  <select
                    onChange={(e) => {
                      const matched = marketCrops.find(c => c.rawName === e.target.value);
                      if (matched) setSelectedCrop(matched);
                    }}
                    value={selectedCrop?.rawName || ""}
                    className="bg-white border border-gray-200 font-semibold text-gray-805 text-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 w-full sm:w-64"
                  >
                    {marketCrops.map((c) => (
                      <option key={c.rawName} value={c.rawName}>
                        🌾 {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCrop && (
                  <>
                    {/* Selected Crop statistics card grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {/* Stat 1: Recommended Price */}
                      <div className="bg-indigo-650 bg-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-600/10 flex flex-col justify-between h-36">
                        <span className="text-xs font-extrabold text-indigo-100 uppercase tracking-wider block">{t.recommendedPrice}</span>
                        <span className="text-2xl font-black block mt-2">LKR {selectedCrop.recommendedPrice} / Kg</span>
                      </div>

                      {/* Stat 2: Average Market Price */}
                      <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-36">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">{t.avgMarketPrice}</span>
                        <span className="text-2xl font-black text-gray-900 block mt-2">LKR {selectedCrop.averagePrice} / Kg</span>
                      </div>

                      {/* Stat 3: Current Supply */}
                      <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-36">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">{t.marketSupply}</span>
                        <span className="text-2xl font-black text-amber-600 block mt-2">{selectedCrop.supply.toLocaleString()} {t.kg}</span>
                      </div>

                      {/* Stat 4: Current Demand */}
                      <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-36">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">{t.marketDemand}</span>
                        <span className="text-2xl font-black text-emerald-600 block mt-2">{selectedCrop.demand.toLocaleString()} {t.kg}</span>
                      </div>
                    </div>

                    {/* SVG price timeline chart & crop comparative analytics */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Price Trend SVG Chart */}
                      <div className="lg:col-span-2 bg-white border border-gray-150 rounded-3xl p-6 shadow-sm space-y-4">
                        <h3 className="text-base font-bold text-gray-900 border-b border-gray-50 pb-3">{t.priceChartTitle} ({selectedCrop.name})</h3>
                        <div className="w-full">
                          {drawCropPriceTrend(selectedCrop)}
                        </div>
                      </div>

                      {/* Sidebar panel list of other recommended prices */}
                      <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-full">
                        <div>
                          <h3 className="text-base font-bold text-gray-900 border-b border-gray-50 pb-3 mb-4">{lang === "si" ? "මිල යෝජනා සැසඳීම" : "Price Suggestion Comparison"}</h3>
                          <div className="space-y-3 pt-1 overflow-y-auto max-h-72">
                            {marketCrops.map((c) => (
                              <div
                                key={c.rawName}
                                onClick={() => setSelectedCrop(c)}
                                className={`flex items-center justify-between text-xs font-bold p-2.5 rounded-xl border transition cursor-pointer ${
                                  c.rawName === selectedCrop.rawName
                                    ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                                    : "bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100/50"
                                }`}
                              >
                                <span>🌾 {c.name}</span>
                                <span className={c.rawName === selectedCrop.rawName ? "text-indigo-900 font-extrabold" : "text-gray-900"}>
                                  LKR {c.recommendedPrice}/Kg
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

    </div>
  );
}

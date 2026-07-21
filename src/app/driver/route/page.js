"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const LOCATION_COORDINATES = {
  "nuwara eliya": [6.9497, 80.7891],
  "nuwaraeliya": [6.9497, 80.7891],
  "kandy": [7.2906, 80.6337],
  "colombo": [6.9271, 79.8612],
  "jaffna": [9.6615, 80.0255],
  "anuradhapura": [8.3114, 80.4037],
  "badulla": [6.9934, 81.0550],
  "galle": [6.0535, 80.2210],
  "matara": [5.9549, 80.5550],
  "hambantota": [6.1248, 81.1185],
  "kurunegala": [7.4863, 80.3647],
  "ratnapura": [6.6828, 80.3992],
  "kegalle": [7.2513, 80.3464],
  "matale": [7.4675, 80.6234],
  "gampaha": [7.0873, 80.0144],
  "kalutara": [6.5854, 79.9607],
  "trincomalee": [8.5790, 81.2185],
  "batticaloa": [7.7170, 81.7010],
  "ampara": [7.3018, 81.6747],
  "polonnaruwa": [7.9403, 81.0188],
  "puttalam": [8.0362, 79.8283],
  "chilaw": [7.5759, 79.7952],
  "negombo": [7.2081, 79.8358],
  "dambulla": [7.8742, 80.6517],
  "welimada": [6.9038, 80.9075],
  "keppetipola": [6.8833, 80.9167],
  "bandarawela": [6.8315, 80.9981],
};

// Simple Haversine distance calculator
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function RouteOptimization() {
  const router = useRouter();
  const [lang, setLang] = useState("si");
  const [driverId, setDriverId] = useState("");
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startCity, setStartCity] = useState("Colombo");
  const [optimizedRoute, setOptimizedRoute] = useState([]);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routeLayersRef = useRef([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          if (u.role !== "driver") {
            router.push("/login");
            return;
          }
          setDriverId(u.id || u._id || "");
        } catch (e) {
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
    }
  }, [router]);

  // Load Leaflet Script
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.L) {
      setLeafletLoaded(true);
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
    link.crossOrigin = "";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    script.crossOrigin = "";
    script.onload = () => {
      setLeafletLoaded(true);
    };
    document.body.appendChild(script);
  }, []);

  // Fetch active shipments
  const fetchActiveDeliveries = async () => {
    if (!driverId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?driverId=${driverId}`);
      const data = await res.json();
      if (data.success) {
        const active = data.data.filter(
          (o) => o.status === "prepared" || o.status === "shipped"
        );
        setActiveOrders(active);
      }
    } catch (err) {
      console.error("Failed to load driver orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveDeliveries();
  }, [driverId]);

  // Sequence route optimization algorithm
  useEffect(() => {
    if (activeOrders.length === 0) {
      setOptimizedRoute([]);
      return;
    }

    const startCoords = LOCATION_COORDINATES[startCity.toLowerCase()] || LOCATION_COORDINATES["colombo"];
    let currentCoords = [...startCoords];
    
    // Build list of remaining nodes to visit
    // For each order, we have a pickup task and a delivery task
    const tasks = [];
    activeOrders.forEach((order) => {
      const pickupCity = (order.items?.[0]?.cropId?.location || "Nuwara Eliya").toLowerCase().trim();
      const destCity = (order.buyerLocation || "Colombo").toLowerCase().trim();

      tasks.push({
        id: `${order._id}_pickup`,
        orderId: order._id,
        type: "pickup",
        cityName: order.items?.[0]?.cropId?.location || "Nuwara Eliya",
        coords: LOCATION_COORDINATES[pickupCity] || LOCATION_COORDINATES["nuwara eliya"],
        farmerName: order.items?.[0]?.cropId?.farmerId?.name || "Farmer Partner",
        itemsText: order.items.map(i => `${i.name} (${i.quantity} kg)`).join(", ")
      });

      tasks.push({
        id: `${order._id}_delivery`,
        orderId: order._id,
        type: "delivery",
        cityName: order.buyerLocation || "Colombo",
        coords: LOCATION_COORDINATES[destCity] || LOCATION_COORDINATES["colombo"],
        buyerName: order.buyerId?.name || "B2B Buyer",
        itemsText: order.items.map(i => `${i.name} (${i.quantity} kg)`).join(", ")
      });
    });

    const route = [];
    const completedTasks = new Set();
    const pickedUpOrders = new Set();

    // Loop through all orders to satisfy pickups and deliveries:
    // If order.status was shipped, it means it is already picked up!
    activeOrders.forEach(order => {
      if (order.status === "shipped") {
        pickedUpOrders.add(order._id);
        // Mark pickup task as already done
        completedTasks.add(`${order._id}_pickup`);
      }
    });

    // Greedy solver
    while (completedTasks.size < tasks.length) {
      // Find eligible tasks
      const eligibleTasks = tasks.filter(task => {
        if (completedTasks.has(task.id)) return false;
        if (task.type === "pickup") return true;
        if (task.type === "delivery") {
          // Can only deliver if picked up
          return pickedUpOrders.has(task.orderId);
        }
        return false;
      });

      if (eligibleTasks.length === 0) break;

      // Find closest task
      let closestTask = null;
      let minDistance = Infinity;

      eligibleTasks.forEach(task => {
        const dist = calculateDistance(
          currentCoords[0],
          currentCoords[1],
          task.coords[0],
          task.coords[1]
        );
        if (dist < minDistance) {
          minDistance = dist;
          closestTask = task;
        }
      });

      if (closestTask) {
        route.push({
          ...closestTask,
          distanceFromLast: Math.round(minDistance * 10) / 10
        });
        currentCoords = [...closestTask.coords];
        completedTasks.add(closestTask.id);
        if (closestTask.type === "pickup") {
          pickedUpOrders.add(closestTask.orderId);
        }
      } else {
        break;
      }
    }

    setOptimizedRoute(route);
  }, [activeOrders, startCity]);

  // Render optimized route on map
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current || typeof window === "undefined" || !window.L) return;
    const L = window.L;

    // Reset previous layers
    if (mapInstanceRef.current) {
      routeLayersRef.current.forEach(layer => layer.remove());
      routeLayersRef.current = [];
    } else {
      mapInstanceRef.current = L.map(mapContainerRef.current).setView([7.8731, 80.7718], 8);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }

    const startCoords = LOCATION_COORDINATES[startCity.toLowerCase()] || LOCATION_COORDINATES["colombo"];
    
    // Plot Start marker
    const startMarker = L.marker(startCoords, {
      icon: L.divIcon({
        html: `<div style="background-color:#4f46e5;color:white;padding:5px 10px;border-radius:12px;font-weight:black;font-size:10px;border:2px solid white;white-space:nowrap;box-shadow:0 2px 4px rgba(0,0,0,0.2);">🏁 Start (${startCity})</div>`,
        className: "start-pin",
        iconSize: [100, 24],
        iconAnchor: [50, 12]
      })
    }).addTo(mapInstanceRef.current);
    routeLayersRef.current.push(startMarker);

    const pathPoints = [startCoords];

    // Plot route stops
    optimizedRoute.forEach((stop, index) => {
      const isPickup = stop.type === "pickup";
      const badgeColor = isPickup ? "#10b981" : "#ef4444";
      const markerText = isPickup 
        ? `🟢 Stop ${index + 1}: Pickup (${stop.cityName})`
        : `🔴 Stop ${index + 1}: Delivery (${stop.cityName})`;

      const marker = L.marker(stop.coords, {
        icon: L.divIcon({
          html: `<div style="background-color:${badgeColor};color:white;padding:5px 10px;border-radius:12px;font-weight:black;font-size:10px;border:2px solid white;white-space:nowrap;box-shadow:0 2px 4px rgba(0,0,0,0.2);">${markerText}</div>`,
          className: "stop-pin",
          iconSize: [150, 24],
          iconAnchor: [75, 12]
        })
      }).addTo(mapInstanceRef.current);
      
      routeLayersRef.current.push(marker);
      pathPoints.push(stop.coords);
    });

    // Draw connecting path line
    if (pathPoints.length > 1) {
      const line = L.polyline(pathPoints, { color: "#4f46e5", weight: 3, opacity: 0.8 }).addTo(mapInstanceRef.current);
      routeLayersRef.current.push(line);
      mapInstanceRef.current.fitBounds(pathPoints, { padding: [50, 50] });
    } else {
      mapInstanceRef.current.setView(startCoords, 9);
    }

  }, [leafletLoaded, optimizedRoute, startCity]);

  const text = {
    si: {
      title: "මාර්ග ප්‍රශස්තකරණය (Route Optimization)",
      subtitle: "එකවර ඇණවුම් කිහිපයක් බෙදා හැරීමේදී ලඟම සහ කාර්යක්ෂම මාර්ගය සැලසුම් කරන්න.",
      lblStartCity: "මගේ වත්මන් පිහිටීම (Start Location)",
      routeListTitle: "ප්‍රශස්ත බෙදාහැරීම් අනුපිළිවෙල (Optimized Stops)",
      emptyOrders: "මාර්ගය සැලසුම් කිරීමට සක්‍රීය ඇණවුම් කිහිපයක් භාරගන්න.",
      loading: "මාර්ගය ගණනය වෙමින් පවතී...",
      pickupStop: "අස්වනු ලබාගැනීම (Pickup)",
      deliveryStop: "හෝටලයට භාරදීම (Delivery)",
      distanceLabel: "පෙර ස්ථානයේ සිට දුර",
      km: "Km",
      instructions: "පියවරෙන් පියවර උපදෙස් (Navigation instructions)",
      insPickup: "ගොවිපලෙන් අස්වැන්න ලබාගන්න",
      insDeliver: "හෝටලය/ගැනුම්කරු වෙත භාරදන්න"
    },
    en: {
      title: "Delivery Route Optimization",
      subtitle: "Automatically solve the shortest path to sequence all your active pickups and B2B hotel drop-offs.",
      lblStartCity: "Choose Starting City",
      routeListTitle: "Optimized Sequence of Stops",
      emptyOrders: "No active shipping jobs found to optimize. Accept delivery jobs first.",
      loading: "Calculating optimized path...",
      pickupStop: "Pickup Crops",
      deliveryStop: "Deliver to Buyer",
      distanceLabel: "Distance from last node",
      km: "km",
      instructions: "Step-by-step Navigation Steps",
      insPickup: "Collect harvest items from",
      insDeliver: "Drop-off items to"
    }
  };

  const t = text[lang];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
        
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t.title}</h1>
            <p className="text-sm text-gray-500 mt-1">{t.subtitle}</p>
          </div>

          <button
            onClick={() => setLang(lang === "si" ? "en" : "si")}
            className="self-start sm:self-center bg-white hover:bg-gray-100 border border-gray-200 text-xs font-black px-4 py-2.5 rounded-xl transition cursor-pointer shadow-sm"
          >
            {lang === "si" ? "English 🌐" : "සිංහල 🌐"}
          </button>
        </div>

        {/* Starting location selection dropdown */}
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm max-w-sm space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">{t.lblStartCity}</label>
          <select
            value={startCity}
            onChange={(e) => setStartCity(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-indigo-500 rounded-xl font-bold text-xs text-gray-800 bg-white"
          >
            {Object.keys(LOCATION_COORDINATES).map(city => (
              <option key={city} value={city.charAt(0).toUpperCase() + city.slice(1)}>{city.charAt(0).toUpperCase() + city.slice(1)}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 font-bold text-sm">{t.loading}</p>
          </div>
        ) : activeOrders.length === 0 ? (
          <div className="py-20 text-center text-gray-400 font-semibold bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <span className="text-6xl block mb-4">🗺️</span>
            <p>{t.emptyOrders}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Map Plotting Column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="w-full h-[450px] rounded-3xl overflow-hidden border border-gray-200 relative shadow-inner z-0">
                {!leafletLoaded && (
                  <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center z-10 space-y-2">
                    <div className="h-8 w-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-gray-500 font-bold">Loading optimized route map...</span>
                  </div>
                )}
                <div ref={mapContainerRef} className="w-full h-full z-0"></div>
              </div>
            </div>

            {/* Steps & Navigation sidebar */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-base font-black text-gray-900 border-b border-gray-50 pb-3">
                  📍 {t.routeListTitle}
                </h3>

                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 text-xs">
                  {optimizedRoute.map((stop, index) => {
                    const isPickup = stop.type === "pickup";
                    return (
                      <div key={stop.id} className="flex gap-3.5 relative">
                        {/* Timeline path bullet */}
                        <div className="flex flex-col items-center shrink-0">
                          <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-white text-[10px]
                            ${isPickup ? "bg-emerald-600 shadow-md shadow-emerald-50" : "bg-red-500 shadow-md shadow-red-50"}
                          `}>
                            {index + 1}
                          </div>
                          {index < optimizedRoute.length - 1 && (
                            <div className="w-0.5 bg-gray-250 flex-1 my-1 border-l border-dashed border-gray-300"></div>
                          )}
                        </div>

                        {/* Stop details card */}
                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex-1 space-y-1.5 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border
                              ${isPickup 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                                : "bg-red-50 text-red-650 text-red-600 border-red-100"
                              }
                            `}>
                              {isPickup ? t.pickupStop : t.deliveryStop}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold">
                              +{stop.distanceFromLast} {t.km}
                            </span>
                          </div>

                          <p className="font-extrabold text-gray-950 text-xs">{stop.cityName}</p>
                          
                          <p className="text-[10px] text-gray-550 leading-relaxed">
                            {isPickup ? (
                              <>
                                <strong>{stop.farmerName}:</strong> {stop.itemsText}
                              </>
                            ) : (
                              <>
                                <strong>{stop.buyerName}:</strong> {stop.itemsText}
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Steps */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                  <h3 className="text-base font-black text-gray-900">
                    📋 {t.instructions}
                  </h3>
                  {optimizedRoute.length > 0 && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(startCity + ", Sri Lanka")}&destination=${encodeURIComponent(optimizedRoute[optimizedRoute.length - 1].cityName + ", Sri Lanka")}&waypoints=${encodeURIComponent(optimizedRoute.slice(0, -1).map(s => s.cityName + ", Sri Lanka").join('|'))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>🌐 Google Maps</span>
                    </a>
                  )}
                </div>
                <div className="space-y-3.5 text-xs text-gray-600 font-semibold leading-relaxed">
                  {optimizedRoute.map((stop, index) => (
                    <div key={stop.id} className="flex gap-2 items-start">
                      <span>📌</span>
                      <p>
                        <strong>Stop {index + 1}:</strong> {stop.type === "pickup" ? t.insPickup : t.insDeliver}{" "}
                        <span className="text-gray-900 font-bold">{stop.type === "pickup" ? stop.farmerName : stop.buyerName}</span>{" "}
                        at <span className="underline font-bold text-gray-950">{stop.cityName}</span>.
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

    </div>
  );
}

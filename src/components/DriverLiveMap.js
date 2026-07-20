"use client";
import { useEffect, useRef, useState } from "react";

const LOCATION_COORDINATES = {
  "nuwara eliya": [6.9497, 80.7891],
  "kandy": [7.2906, 80.6337],
  "colombo": [6.9271, 79.8612],
  "jaffna": [9.6615, 80.0255],
  "anuradhapura": [8.3114, 80.4037],
  "dambulla": [7.8742, 80.6517],
  "galle": [6.0535, 80.2210],
  "negombo": [7.2081, 79.8358],
  "kurunegala": [7.4863, 80.3647],
  "badulla": [6.9934, 81.0550]
};

export default function DriverLiveMap({ order, onClose }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [progress, setProgress] = useState(65); // 65% on the way

  const originName = "Dambulla Agro Hub";
  const destinationName = order?.buyerLocation || "Colombo";

  const originCoords = LOCATION_COORDINATES["dambulla"];
  const destCoords = LOCATION_COORDINATES[destinationName.toLowerCase()] || LOCATION_COORDINATES["colombo"];

  // Calculate live driver position between origin and destination based on progress %
  const currentLat = originCoords[0] + (destCoords[0] - originCoords[0]) * (progress / 100);
  const currentLng = originCoords[1] + (destCoords[1] - originCoords[1]) * (progress / 100);
  const driverCoords = [currentLat, currentLng];

  // Load Leaflet CDN script dynamically
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.L) {
      setLeafletLoaded(true);
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => {
      setLeafletLoaded(true);
    };
    document.body.appendChild(script);
  }, []);

  // Initialize Map and Markers
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current || !window.L) return;

    const L = window.L;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current).setView(driverCoords, 9);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;

    // Draw route line
    const routeLine = L.polyline([originCoords, destCoords], {
      color: "#10b981",
      weight: 5,
      opacity: 0.8,
      dashArray: "8, 8"
    }).addTo(map);

    // Farm Origin Marker
    const originIcon = L.divIcon({
      html: `<div style="background-color: #15803d; color: white; padding: 4px 8px; border-radius: 999px; font-weight: bold; font-size: 11px; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.2);">🌾 Farm: ${originName}</div>`,
      className: "custom-div-icon",
      iconSize: [120, 30]
    });
    L.marker(originCoords, { icon: originIcon }).addTo(map);

    // Hotel Destination Marker
    const destIcon = L.divIcon({
      html: `<div style="background-color: #0284c7; color: white; padding: 4px 8px; border-radius: 999px; font-weight: bold; font-size: 11px; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.2);">🏨 Hotel: ${destinationName}</div>`,
      className: "custom-div-icon",
      iconSize: [120, 30]
    });
    L.marker(destCoords, { icon: destIcon }).addTo(map);

    // Driver Live Truck Marker
    const truckIcon = L.divIcon({
      html: `<div style="background-color: #f59e0b; color: white; padding: 6px 10px; border-radius: 999px; font-weight: font-black; font-size: 12px; border: 2px solid white; box-shadow: 0 4px 10px rgba(245,158,11,0.5); animation: pulse 2s infinite;">🚚 Live Truck</div>`,
      className: "custom-div-icon",
      iconSize: [110, 34]
    });
    L.marker(driverCoords, { icon: truckIcon }).addTo(map);

    // Fit bounds to include all markers
    map.fitBounds([originCoords, destCoords], { padding: [60, 60] });

  }, [leafletLoaded]);

  // Simulate smooth moving driver progress
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev >= 95 ? 60 : prev + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-emerald-700 text-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-bold">
              🚚
            </div>
            <div>
              <h3 className="font-extrabold text-lg leading-tight">Live Driver GPS Tracking</h3>
              <p className="text-xs text-emerald-100">Order ID: #{order?._id?.substring(0, 8).toUpperCase()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl font-bold p-1 cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Driver Details Card */}
        <div className="p-6 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg">
                🧑‍✈️
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Assigned Driver</p>
                <p className="font-extrabold text-sm text-gray-900 dark:text-white">Kamal Perera</p>
                <p className="text-[11px] text-emerald-600 font-bold">Express Cold Logistics</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg">
                🚛
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Vehicle Details</p>
                <p className="font-extrabold text-sm text-gray-900 dark:text-white">WP WP-8942</p>
                <p className="text-[11px] text-gray-500 font-medium">Refrigerated Truck</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
                ⏱️
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Estimated Arrival</p>
                <p className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">~ 35 mins</p>
                <p className="text-[11px] text-gray-500 font-medium">Distance Left: 24 km</p>
              </div>
            </div>
          </div>

          {/* Delivery Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-gray-600 dark:text-gray-400">Delivery Status: <span className="text-emerald-600">In Transit (En Route)</span></span>
              <span className="text-emerald-600">{progress}% Completed</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Interactive Map */}
        <div className="relative h-[380px] w-full">
          {!leafletLoaded && (
            <div className="absolute inset-0 bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center space-y-3">
              <div className="h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 text-sm font-semibold">Loading Live Delivery Route Map...</p>
            </div>
          )}
          <div ref={mapContainerRef} className="w-full h-full z-0"></div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <a
            href="tel:0771234567"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow cursor-pointer"
          >
            <span>📞 Call Delivery Driver</span>
          </a>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 font-bold text-xs hover:bg-gray-200 dark:hover:bg-gray-800 transition cursor-pointer"
          >
            Close Map
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useRef, useState } from "react";

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

export default function FarmerMap({ crops, onSelectFarm, lang }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Load Leaflet CDN script and stylesheet dynamically
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.L) {
      setLeafletLoaded(true);
      return;
    }

    // Load Leaflet CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
    link.crossOrigin = "";
    document.head.appendChild(link);

    // Load Leaflet JS
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    script.crossOrigin = "";
    script.onload = () => {
      setLeafletLoaded(true);
    };
    document.body.appendChild(script);
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current || typeof window === "undefined" || !window.L) return;

    const L = window.L;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current).setView([7.8731, 80.7718], 8);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);
    }

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Group crops by location
    const locationGroups = {};
    crops.forEach(crop => {
      const locName = (crop.location || "Colombo").toLowerCase().trim();
      if (!locationGroups[locName]) {
        locationGroups[locName] = [];
      }
      locationGroups[locName].push(crop);
    });

    // Plot markers
    Object.entries(locationGroups).forEach(([locName, locCrops]) => {
      const coords = LOCATION_COORDINATES[locName] || [7.8731 + (Math.random() - 0.5) * 0.3, 80.7718 + (Math.random() - 0.5) * 0.3];
      
      const displayName = locCrops[0]?.location || locName.toUpperCase();
      const cropCount = locCrops.length;

      const markerHtml = `
        <div style="
          background-color: #10b981;
          color: white;
          padding: 6px 12px;
          border-radius: 9999px;
          font-weight: bold;
          font-size: 11px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border: 2px solid white;
          white-space: nowrap;
          cursor: pointer;
        ">
          📍 ${displayName} (${cropCount})
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: "custom-div-icon",
        iconSize: [100, 30],
        iconAnchor: [50, 15]
      });

      const marker = L.marker(coords, { icon: customIcon })
        .addTo(mapInstanceRef.current)
        .on("click", () => {
          onSelectFarm(locCrops, displayName);
        });

      markersRef.current.push(marker);
    });

    // Fit map bounds to markers if we have points
    if (Object.keys(locationGroups).length > 0) {
      const points = Object.keys(locationGroups).map(locName => {
        return LOCATION_COORDINATES[locName] || null;
      }).filter(Boolean);
      
      if (points.length > 0) {
        mapInstanceRef.current.fitBounds(points, { padding: [50, 50] });
      }
    }

  }, [leafletLoaded, crops]);

  return (
    <div className="w-full h-[500px] rounded-3xl overflow-hidden border border-gray-150 relative shadow-inner z-0">
      {!leafletLoaded && (
        <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center z-10 space-y-3">
          <div className="h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm font-semibold">
            {lang === "si" ? "සිතියම පූරණය වෙමින් පවතී..." : "Loading Map View..."}
          </p>
        </div>
      )}
      <div ref={mapContainerRef} className="w-full h-full z-0"></div>
    </div>
  );
}

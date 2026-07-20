"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function DiseaseDetectionPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState("carrot");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [symptomsInput, setSymptomsInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const sampleCrops = [
    { id: "carrot", nameSi: "කැරට්", nameEn: "Carrot", icon: "🥕" },
    { id: "tomato", nameSi: "තක්කාලි", nameEn: "Tomato", icon: "🍅" },
    { id: "potato", nameSi: "අර්තාපල්", nameEn: "Potato", icon: "🥔" },
    { id: "chilli", nameSi: "මිරිස්", nameEn: "Chilli", icon: "🌶️" },
    { id: "rice", nameSi: "ගොයම්", nameEn: "Rice/Paddy", icon: "🌾" },
    { id: "cabbage", nameSi: "ගෝවා", nameEn: "Cabbage", icon: "🥬" }
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const u = JSON.parse(stored);
          if (u.role !== "farmer") {
            router.push("/login");
            return;
          }
          setUser(u);
        } catch (e) {
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
    }
  }, [router]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setResult(null);

    try {
      let imageUrl = uploadedImage;
      if (uploadedImage && uploadedImage.startsWith("data:")) {
        try {
          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ file: uploadedImage, folder: "disease-detection" })
          });
          const uploadData = await uploadRes.json();
          if (uploadRes.ok && uploadData.url) {
            imageUrl = uploadData.url;
          }
        } catch (e) {
          console.warn("Cloudinary upload failed for disease detection image:", e);
        }
      }

      const res = await fetch("/api/ai/disease-detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cropName: selectedCrop,
          symptoms: symptomsInput,
          image: imageUrl
        })
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
      } else {
        alert("Analysis error: " + data.error);
      }
    } catch (err) {
      alert("Network error analyzing crop image.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto space-y-8 overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/30 backdrop-blur-md text-emerald-200 text-xs font-bold uppercase tracking-wider">
            AI Crop Health Vision
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">AI Crop Disease Scanner & Advisory</h1>
          <p className="text-emerald-100 text-sm max-w-2xl">
            ඔබගේ ගොවිපලේ රෝගී වූ පත්‍ර හෝ ශාක කොටස්වල ඡායාරූපයක් Upload කර AI තාක්ෂණයෙන් රෝගය හඳුනාගෙන, ඊට අදාළ කාබනික සහ රසායනික පිළියම් ලබාගන්න.
          </p>
        </div>

        {/* Crop Selection & Scanner Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Controls */}
          <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
            <div>
              <label className="block text-xs font-extrabold uppercase text-gray-400 mb-3 tracking-wider">
                1. Select Produce Type (වගාව තෝරන්න)
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {sampleCrops.map((crop) => (
                  <button
                    key={crop.id}
                    onClick={() => setSelectedCrop(crop.id)}
                    className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition text-xs font-bold cursor-pointer ${
                      selectedCrop === crop.id
                        ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-sm"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    }`}
                  >
                    <span className="text-2xl">{crop.icon}</span>
                    <span>{crop.nameSi}</span>
                    <span className="text-[10px] text-gray-400 font-normal">{crop.nameEn}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Upload Area */}
            <div>
              <label className="block text-xs font-extrabold uppercase text-gray-400 mb-3 tracking-wider">
                2. Upload Leaf / Crop Image (ඡායාරූපය එක් කරන්න)
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-3xl p-6 text-center hover:border-emerald-500 transition cursor-pointer relative bg-gray-50 dark:bg-gray-900">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
                {uploadedImage ? (
                  <div className="space-y-3">
                    <img
                      src={uploadedImage}
                      alt="Uploaded Leaf"
                      className="h-40 w-full object-cover rounded-2xl shadow-md mx-auto"
                    />
                    <p className="text-xs text-emerald-600 font-bold">✅ Photo Uploaded! Click Analyze below.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <span className="text-4xl block">📸</span>
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Click or Drag photo of infected leaf
                    </p>
                    <p className="text-[10px] text-gray-400">Supports PNG, JPG, WEBP</p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Symptoms Input */}
            <div>
              <label className="block text-xs font-extrabold uppercase text-gray-400 mb-2 tracking-wider">
                3. Additional Symptoms (විකල්ප අමතර ලක්ෂණ)
              </label>
              <textarea
                rows="2"
                placeholder="e.g. Yellow spots on leaves, drying stem..."
                value={symptomsInput}
                onChange={(e) => setSymptomsInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
              ></textarea>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-lg transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {analyzing ? (
                <>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>AI Analyzing Image...</span>
                </>
              ) : (
                <span>🔬 Run AI Diagnosis & Treatment Report</span>
              )}
            </button>
          </div>

          {/* Right Results Display */}
          <div className="lg:col-span-7 space-y-6">
            {!result && !analyzing && (
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
                <span className="text-6xl block animate-bounce">🌱</span>
                <h3 className="text-xl font-bold">Ready for AI Diagnosis</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  වම්පසින් වගාවේ වර්ගය සහ ඡායාරූපයක් Upload කර "Run AI Diagnosis" ඔබන්න. රෝග විනිශ්චය සහ ප්‍රතිකර්ම මෙහි දර්ශනය වේ.
                </p>
              </div>
            )}

            {analyzing && (
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-16 text-center border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
                <div className="inline-block h-14 w-14 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Scanning Leaf Patterns...</h3>
                  <p className="text-xs text-gray-500">Checking against Sri Lankan Agricultural Disease Database</p>
                </div>
              </div>
            )}

            {result && (
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-lg space-y-6 animate-in fade-in duration-300">
                {/* Result Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-black">
                        🎯 Match Confidence: {result.confidence}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                        result.severity === 'Critical' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' :
                        result.severity === 'High' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        Severity: {result.severity}
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-2">{result.diseaseNameSi}</h2>
                    <p className="text-xs text-gray-500 font-bold">{result.diseaseNameEn}</p>
                  </div>
                </div>

                {/* Pathogen & Symptoms */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-2xl space-y-1">
                    <span className="text-gray-400 font-bold uppercase block">Pathogen / Cause</span>
                    <span className="font-bold text-gray-900 dark:text-white text-sm">{result.pathogen}</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-2xl space-y-1">
                    <span className="text-gray-400 font-bold uppercase block">Key Symptoms (රෝග ලක්ෂණ)</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">{result.symptoms}</span>
                  </div>
                </div>

                {/* Organic Treatment */}
                <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                    <span>🌿</span>
                    <span>Organic & Natural Remedies (කාබනික ප්‍රතිකර්ම)</span>
                  </div>
                  <p className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                    {result.organicRemedy}
                  </p>
                </div>

                {/* Chemical Treatment */}
                <div className="bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-sm">
                    <span>🧪</span>
                    <span>Recommended Fungicide / Insecticide (රසායනික ප්‍රතිකර්ම)</span>
                  </div>
                  <p className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                    {result.chemicalTreatment}
                  </p>
                </div>

                {/* Prevention Tips */}
                <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-bold text-sm">
                    <span>🛡️</span>
                    <span>Prevention & Soil Advice (වැළැක්වීමේ උපදෙස්)</span>
                  </div>
                  <p className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                    {result.prevention}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

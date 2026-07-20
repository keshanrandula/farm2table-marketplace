"use client";
import { useState, useRef } from "react";

export default function PodModal({ order, onClose, onSuccess }) {
  const [photo, setPhoto] = useState(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  if (!order) return null;

  // Signature canvas handlers
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSigned(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    let signatureData = "";
    if (hasSigned && canvasRef.current) {
      signatureData = canvasRef.current.toDataURL("image/png");
    }

    try {
      let photoUrl = photo;
      if (photo && photo.startsWith("data:")) {
        try {
          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ file: photo, folder: "deliveries" })
          });
          const uploadData = await uploadRes.json();
          if (uploadRes.ok && uploadData.url) photoUrl = uploadData.url;
        } catch (err) {
          console.warn("Cloudinary upload failed for photo proof:", err);
        }
      }

      const res = await fetch(`/api/orders/${order._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "delivered",
          proofOfDelivery: {
            photo: photoUrl || "",
            signature: signatureData || "",
            deliveredAt: new Date(),
            notes: notes || "Delivered in person"
          }
        })
      });

      const data = await res.json();
      if (data.success) {
        alert("✅ Proof of Delivery successfully saved!");
        onSuccess();
        onClose();
      } else {
        alert(data.error || "Failed to save POD");
      }
    } catch (err) {
      alert("Error submitting Proof of Delivery");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✍️</span>
            <div>
              <h3 className="text-lg font-black tracking-tight">Proof of Delivery (POD)</h3>
              <p className="text-xs text-emerald-100">Order ID: #{order._id.substring(order._id.length - 8).toUpperCase()}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl font-bold">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {/* Photo Upload */}
          <div className="space-y-2">
            <label className="block font-bold text-gray-700 dark:text-gray-300">
              1. Upload Delivery Photo (භාරදුන් ඡායාරූපය)
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-4 text-center relative bg-gray-50 dark:bg-gray-900">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />
              {photo ? (
                <div className="space-y-2">
                  <img src={photo} alt="Delivery Photo" className="h-32 w-full object-cover rounded-xl shadow-sm mx-auto" />
                  <span className="text-emerald-600 font-bold block">✓ Delivery Photo Attached</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <span className="text-2xl block">📷</span>
                  <p className="font-bold text-gray-700 dark:text-gray-300">Click to upload photo of package / hotel reception</p>
                </div>
              )}
            </div>
          </div>

          {/* Digital Signature Canvas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-gray-700 dark:text-gray-300">
                2. Customer Digital Signature (පාරිභෝගික අත්සන)
              </label>
              {hasSigned && (
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-red-500 hover:underline font-bold text-[11px]"
                >
                  Clear Signature
                </button>
              )}
            </div>
            <div className="border-2 border-emerald-500/50 rounded-2xl overflow-hidden bg-white">
              <canvas
                ref={canvasRef}
                width={420}
                height={130}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-[130px] touch-none cursor-crosshair bg-emerald-50/20"
              />
            </div>
            <p className="text-[10px] text-gray-400">Draw signature above using finger or mouse.</p>
          </div>

          {/* Receiver Notes */}
          <div className="space-y-1">
            <label className="block font-bold text-gray-700 dark:text-gray-300">Receiver Name / Notes</label>
            <input
              type="text"
              placeholder="e.g. Received by Executive Chef Nimal"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow disabled:opacity-50"
            >
              {submitting ? "Saving POD..." : "Confirm & Deliver Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import Link from "next/link";

export default function CropCard({ crop, lang }) {
  const isSinhala = lang === "si";
  const isTamil = lang === "ta";

  const labels = {
    farmer: isSinhala ? "ගොවියා" : isTamil ? "விவசாயி" : "Farmer",
    qty: isSinhala ? "Kg ඇත" : isTamil ? "Kg கிடைக்கிறது" : "Kg available",
    orderBtn: isSinhala ? "දැන්ම මිලදී ගන්න" : isTamil ? "இப்பொழுதே வாங்குங்கள்" : "Order Now",
    perKg: "/ 1Kg",
    location: isSinhala ? "ස්ථානය" : isTamil ? "இடம்" : "Location",
  };

  // Get farmer name safely from populated user details or custom field
  const farmerName = crop.farmerId?.name || crop.farmerName || (isSinhala ? "දේශීය ගොවියෙක්" : isTamil ? "உள்ளூர் விவசாயி" : "Local Farmer");

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-emerald-100 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group shadow-sm">
      <Link href={`/marketplace/${crop._id}`} className="block flex-1 cursor-pointer">
        {/* Product Image Placeholder */}
        <div className="relative h-44 w-full bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center overflow-hidden">
          <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
            {crop.name.toLowerCase().includes("carrot") ? "🥕" :
             crop.name.toLowerCase().includes("potato") ? "🥔" :
             crop.name.toLowerCase().includes("tomato") ? "🍅" :
             crop.name.toLowerCase().includes("onion") ? "🧅" :
             crop.name.toLowerCase().includes("chili") ? "🌶️" : "🥬"}
          </span>
          <span className="absolute top-4 left-4 bg-emerald-600 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full shadow-sm">
            {crop.location}
          </span>
        </div>
        
        {/* Details */}
        <div className="p-6">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors leading-snug">{crop.name}</h3>
          </div>

          {/* Quality Badges */}
          {( (crop.grade && crop.grade !== 'N/A') || (crop.organicStatus && crop.organicStatus !== 'conventional') ) && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {crop.grade && crop.grade !== 'N/A' && (
                <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9px] font-extrabold px-2 py-0.5 rounded-md">
                  Grade {crop.grade}
                </span>
              )}
              {crop.organicStatus && crop.organicStatus !== 'conventional' && (
                <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[9px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-0.5">
                  🌿 {crop.organicStatus === 'organic' ? (isSinhala ? 'කාබනික' : 'Organic') : (isSinhala ? 'වස විස නැති' : 'Pesticide-Free')}
                </span>
              )}
            </div>
          )}
          
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-gray-400">
            <span>🧑‍🌾</span>
            <span className="text-gray-500">{labels.farmer}: {farmerName}</span>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
            <div>
              <span className="text-xl font-black text-emerald-600">LKR {crop.price}</span>
              <span className="text-xs font-bold text-gray-400"> {labels.perKg}</span>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-lg">
              {crop.quantity} {labels.qty}
            </span>
          </div>
        </div>
      </Link>

      {/* Button */}
      <div className="px-6 pb-6 pt-0">
        <Link href={`/marketplace/${crop._id}`}>
          <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-emerald-50 transition cursor-pointer">
            {labels.orderBtn}
          </button>
        </Link>
      </div>
    </div>
  );
}
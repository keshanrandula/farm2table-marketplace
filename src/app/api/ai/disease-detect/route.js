import { NextResponse } from 'next/server';

const DISEASE_DATABASE = {
  carrot: {
    diseaseNameSi: "කැරට් පත්‍ර අංගමාරය (Alternaria Leaf Blight)",
    diseaseNameEn: "Carrot Leaf Blight (Alternaria dauci)",
    pathogen: "Alternaria dauci (Fungal pathogen)",
    severity: "High",
    symptoms: "පත්‍රවල තද දුඹුරු හෝ කළු පැහැති ලප ඇතිවේ. පත්‍ර අගිසි වියළී කහ පැහැයට හැරේ.",
    organicRemedy: "කොහොඹ තෙල් සාරය (Neem oil spray) හෝ සුදුලූනු ද්‍රාවණය සතියකට වරක් පත්‍රවලට ඉසින්න.",
    chemicalTreatment: "Mancozeb 75% WP හෝ Copper Oxychloride 50% WP (වතුර ලීටර් 10 කට ග්‍රෑම් 20) ඉසින්න.",
    prevention: "පස්වල ජලාපවහනය වැඩි දියුණු කරන්න. වැසි දිනවල පත්‍ර තෙත්ව පැවතීම අවම කරන්න."
  },
  tomato: {
    diseaseNameSi: "තකාලි පත්‍ර කහවීමේ සූක්ෂම වයිරසය (Yellow Leaf Curl)",
    diseaseNameEn: "Tomato Yellow Leaf Curl Virus (TYLCV)",
    pathogen: "Begomovirus (Transmitted by Whiteflies / සුදු මැස්සන්)",
    severity: "High",
    symptoms: "පත්‍ර කුඩා වී ඉහළට සූරුට්ටු වේ. පත්‍ර නහර කහ පැහැ වී ශාකයේ වර්ධනය අඩාල වේ.",
    organicRemedy: "සුදු මැස්සන් මර්දනයට කහ පැහැති ඇලෙන සුළු උගුල් (Yellow sticky traps) වගාබිම වටා සවිකරන්න.",
    chemicalTreatment: "Imidacloprid 200 SL හෝ Acetamiprid කෘමිනාශක යොදා සුදු මැස්සන් පාලනය කරන්න.",
    prevention: "වගාබිම වටා වල් පැලෑටි ඉවත් කර ආරක්ෂිත දැල් ආවරණ (Insect proof netting) භාවිතා කරන්න."
  },
  potato: {
    diseaseNameSi: "අර්තාපල් පසු අංගමාරය (Late Blight)",
    diseaseNameEn: "Potato Late Blight (Phytophthora infestans)",
    pathogen: "Phytophthora infestans (Oomycete)",
    severity: "Critical",
    symptoms: "පත්‍ර සහ කඳ මත තෙතමනය සහිත තද දුඹුරු/කළු ලප හටගනී. පත්‍ර යට සුදු පැහැති පුස් වර්ධනය වේ.",
    organicRemedy: "කොම්පෝස්ට් තේ (Compost tea spray) සහ තඹ සල්ෆේට් මිශ්‍රණය පත්‍ර මත තවරන්න.",
    chemicalTreatment: "Ridomil Gold (Mefenoxam + Mancozeb) හෝ Propamocarb කූඩු රෝගයට පෙර ඉසින්න.",
    prevention: "ප්‍රතිරෝධී ප්‍රභේද වගා කරන්න. පේළි අතර පරතරය වැඩි කර වාතාශ්‍රය තබා ගන්න."
  },
  chilli: {
    diseaseNameSi: "මිරිස් කොළ කොඩවීම (Chilli Leaf Curl Complex)",
    diseaseNameEn: "Chilli Leaf Curl Virus & Thrips Attack",
    pathogen: "Virus transmitted by Thrips (පැළ මැක්කන්) and Mites (මයිටාවන්)",
    severity: "Medium-High",
    symptoms: "පත්‍ර දූවිලි වී ඉහළට හෝ පහළට නැමෙයි. ශාකය කුරු වේ, කරල් හටගැනීම අඩුවේ.",
    organicRemedy: "සබන් දියර (Soap water 5ml/L) හෝ සල්ෆර් හා කොහොඹ ඇට සාරය මයිටාවන් මර්දනයට භාවිත කරන්න.",
    chemicalTreatment: "Abamectin 1.8% EC (මයිටාවන්ට) හෝ Fipronil (පැළ මැක්කන්ට) ඉසින්න.",
    prevention: "බීජ තැන්පත් කිරීමට ප්‍රථම ආරක්ෂිත දැල් භාවිතා කිරීම සහ කහ උගුල් තැබීම."
  },
  rice: {
    diseaseNameSi: "ගොයම් කොළ පාළුව (Paddy Blast)",
    diseaseNameEn: "Rice Blast (Pyricularia oryzae)",
    pathogen: "Pyricularia oryzae (Fungus)",
    severity: "High",
    symptoms: "කොළ මත දියමන්ති හැඩැති (Diamond shaped) රතු/දුඹුරු මායිම් සහිත ලප ඇතිවේ.",
    organicRemedy: "දහයියා අළු (Paddy husk ash) වගාවට එකතු කර සිලිකන් ප්‍රමාණය වැඩි කරන්න.",
    chemicalTreatment: "Tricyclazole 75% WP හෝ Isoprothiolane 40% EC ද්‍රාවණය ඉසින්න.",
    prevention: "නයිට්‍රජන් පොහොර අධික ලෙස යෙදීමෙන් වළකින්න. යල-මහ කන්න නිසි වේලාවට ආරම්භ කරන්න."
  },
  default: {
    diseaseNameSi: "ශාක පත්‍ර දිලීර ආසාදනය (General Leaf Spot & Fungal Infection)",
    diseaseNameEn: "General Fungal Leaf Spot / Blight",
    pathogen: "Fungal Spores / Excess Moisture",
    severity: "Medium",
    symptoms: "පත්‍ර මත කහ පාට මායිම් සහිත දුඹුරු ලප ඇතිවීම සහ පත්‍ර වියළී හැලී යාම.",
    organicRemedy: "කොහොඹ තෙල් මිශ්‍රණය (Neem Oil 5ml + liquid soap 2ml per 1L water) දින 5කට වරක් ඉසින්න.",
    chemicalTreatment: "Mancozeb හෝ Captan දිලීර නාශක ලේබල් උපදෙස් පරිදි යොදන්න.",
    prevention: "පත්‍ර මත ජලය රැඳී තබන අයුරින් වතුර දැමීමෙන් වළකින්න. පසෙහි කාබනික පදාර්ථ වැඩි කරන්න."
  }
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { cropName, symptoms, image } = body;

    const cropKey = (cropName || '').toLowerCase();
    
    let matchedDisease = DISEASE_DATABASE.default;
    for (const key of Object.keys(DISEASE_DATABASE)) {
      if (cropKey.includes(key)) {
        matchedDisease = DISEASE_DATABASE[key];
        break;
      }
    }

    // Simulate AI confidence score
    const confidenceScore = Math.floor(Math.random() * 8) + 91; // 91% - 98%

    return NextResponse.json({
      success: true,
      data: {
        cropName: cropName || "Selected Produce",
        confidence: `${confidenceScore}%`,
        analyzedImage: image || null,
        ...matchedDisease
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

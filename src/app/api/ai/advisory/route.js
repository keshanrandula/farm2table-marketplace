import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Crop from '@/models/Crop';

export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { query, district, weather, farmerId, lang } = body;

    const isSi = lang === 'si';
    
    // Fetch farmer's listed crops to provide personalized context to Gemini
    let cropsListText = 'None listed yet.';
    if (farmerId) {
      try {
        const crops = await Crop.find({ farmer: farmerId });
        if (crops && crops.length > 0) {
          cropsListText = crops.map(c => `${c.name} (${c.quantity}kg @ LKR ${c.price}/kg)`).join(', ');
        }
      } catch (err) {
        console.error('Error fetching crops context for AI:', err);
      }
    }

    const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;

    // Standard fallback mock responses in case the API key is missing
    if (!apiKey) {
      const q = (query || '').toLowerCase().trim();
      let fallbackResponse = '';
      
      if (q.includes("පොහොර") || q.includes("fertilizer") || q.includes("compost")) {
        fallbackResponse = isSi 
          ? "පොහොර යෙදීමේදී කාබනික කොම්පෝස්ට් පොහොර (Organic Compost) වැඩි වශයෙන් භාවිතා කිරීම පසෙහි සාරවත් බව දිගුකාලීනව රැක ගැනීමට උපකාරී වේ. රසායනික පොහොර යෙදීමට ප්‍රථම සැමවිටම පසෙහි තෙතමනය පරික්ෂා කරන්න. වැසි දිනවල පසෙහි සෝදා යාම වැළැක්වීම සඳහා පොහොර යෙදීමෙන් වළකින්න."
          : "When applying fertilizer, prioritize organic compost to maintain long-term soil health. Always verify soil moisture levels before tilling or applying chemical inputs. Avoid applications during high rain periods to prevent runoff.";
      } else if (q.includes("වැස්ස") || q.includes("වැසි") || q.includes("rain") || q.includes("weather")) {
        fallbackResponse = isSi
          ? "අධික වැසි පවතින කාලවලදී වගාබිම වටා ජලාපවහන ඇල මාර්ග (drainage pathways) ක්‍රමවත්ව සකස් කරන්න. එළවළු පාත්තිවල ජලය රැඳී තිබීමෙන් මුල් කුණුවීමේ රෝග (root rot) ඇති විය හැක. හැකි නම් ආරක්ෂිත වැසි ආවරණ (rain shelters) භාවිතා කරන්න."
          : "During heavy rainy spells, clear all tilled channels and check drainage pathways to prevent waterlogging. Standing water leads to fungal root rot in vegetable beds. Use poly-tunnels or rain shelters if possible.";
      } else if (q.includes("කැරට්") || q.includes("carrot") || q.includes("vegetable")) {
        fallbackResponse = isSi
          ? "කැරට් වගාව සඳහා වැලි සහිත බුරුල් පසක් (sandy loam soil) වඩාත් සුදුසු වේ. පස තද වීමෙන් කැරට් අල ඇද වීම හෝ කුඩා වීම සිදුවිය හැක. සති දෙකකට වරක් කාබනික දියර පොහොර යෙදීම මඟින් අස්වැන්න වැඩි කර ගත හැක."
          : "Carrots require well-draining, loose sandy loam soil to grow straight and healthy. Compacted soil causes split or stunted taproots. Apply organic liquid manure once every two weeks to maximize yield.";
      } else {
        fallbackResponse = isSi
          ? "Google Gemini කෘෂි සහායකයා වශයෙන් මා යෝජනා කරන්නේ දේශීය කාලගුණික දත්ත නිරීක්ෂණය කර ඔබේ වගාවන්ට ජලය සහ පොහොර සැපයීම වඩාත් විධිමත් කරන ලෙසයි. වැඩිදුර උපදෙස් සඳහා ඉහත සඳහන් කාලගුණ අනාවැකිය සහ මිල සසඳා බැලීම භාවිත කරන්න."
          : "Thank you for asking Google Gemini! I recommend adjusting your tilling, watering, and composting schedules based on the real-time weather analytics. Check wholesale center pricing benchmarks above to set profitable rates.";
      }

      return NextResponse.json({
        success: true,
        response: isSi
          ? `[⚠️ GEMINI_API_KEY පරිසර විචල්‍යය සකසා නැත. නියැදි පිළිතුර:]\n\n${fallbackResponse}`
          : `[⚠️ GEMINI_API_KEY environment variable is not configured. Sample Response:]\n\n${fallbackResponse}`,
        isMock: true
      });
    }

    // Prepare system instructions and contextual prompt for Gemini
    const systemPrompt = `You are Jibi (ජිබී), a highly expert AI Agricultural Assistant built for the "Farm to Table" platform in Sri Lanka.
Your goal is to provide highly specific, actionable, and practical agricultural advice to Sri Lankan farmers.

Context:
- Selected District: ${district || 'Nuwara Eliya'}
- Current Weather in ${district || 'Nuwara Eliya'}:
  * Temperature: ${weather?.temp || 'unknown'}°C
  * Wind Speed: ${weather?.wind || 'unknown'} km/h
  * Rain/Precipitation Probability: ${weather?.forecast?.[0]?.precipProb || 'unknown'}%
- Farmer's listed crops in inventory: ${cropsListText}

Please respond to the farmer's query.
If the query is in Sinhala, respond in fluent, grammatically correct, friendly Sinhala (using standard Sri Lankan agricultural terms). If the query is in English, respond in professional English.
Tailor your advice specifically to the district's weather (e.g. if rain probability is high, warn them about pesticide runoff and suggest improving drainage channels; if it is hot and dry, suggest early morning/evening drip irrigation).
Keep your answer concise (under 150 words), readable, and focused on helping the farmer succeed.`;

    let aiText = '';

    // Check if the key is from OpenRouter (starts with sk-or-)
    if (apiKey.startsWith('sk-or-')) {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://farm-to-table.vercel.app',
          'X-Title': 'Farm to Table AI'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Farmer's Query: "${query}"` }
          ],
          temperature: 0.3,
          max_tokens: 600
        })
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('OpenRouter Gemini API request failed:', data);
        throw new Error(data.error?.message || 'Failed to query OpenRouter Gemini API');
      }

      aiText = data.choices?.[0]?.message?.content || '';
    } else {
      // Native Google Gemini REST API call
      const requestBody = {
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nFarmer's Query: "${query}"` }]
          }
        ],
        generationConfig: { temperature: 0.3, maxOutputTokens: 500 }
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        }
      );

      const data = await response.json();
      if (!response.ok) {
        console.error('Gemini API request failed:', data);
        throw new Error(data.error?.message || 'Failed to query Gemini API');
      }

      aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }
    
    return NextResponse.json({
      success: true,
      response: aiText.trim(),
      isMock: false
    });

  } catch (error) {
    console.error('Error in advisory AI route:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

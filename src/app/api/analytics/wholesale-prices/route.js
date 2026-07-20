import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);

    // Baseline wholesale prices for crops (LKR per Kg)
    const basePrices = {
      carrot: { name: 'Carrot', nameSi: 'කැරට්', dambulla: 280, keppetipola: 290, colombo: 310 },
      leeks: { name: 'Leeks', nameSi: 'ලීක්ස්', dambulla: 180, keppetipola: 175, colombo: 210 },
      potato: { name: 'Potato', nameSi: 'අල', dambulla: 210, keppetipola: 235, colombo: 250 },
      tomato: { name: 'Tomato', nameSi: 'තක්කාලි', dambulla: 140, keppetipola: 130, colombo: 170 },
      cabbage: { name: 'Cabbage', nameSi: 'ගෝවා', dambulla: 110, keppetipola: 120, colombo: 140 },
      beans: { name: 'Beans', nameSi: 'බෝංචි', dambulla: 330, keppetipola: 320, colombo: 360 },
      brinjal: { name: 'Brinjal', nameSi: 'වම්බටු', dambulla: 180, keppetipola: 165, colombo: 210 },
      pumpkin: { name: 'Pumpkin', nameSi: 'වට්ටක්කා', dambulla: 95, keppetipola: 80, colombo: 125 }
    };

    // Calculate dynamic prices with daily fluctuation
    const wholesalePrices = Object.entries(basePrices).map(([key, data]) => {
      // Create a smooth variation curve using sine wave based on day of year
      const wave = Math.sin(dayOfYear / 10 + key.charCodeAt(0)) * 0.08; // +/- 8% fluctuation
      
      const dambullaFluctuated = Math.round(data.dambulla * (1 + wave));
      const keppetipolaFluctuated = Math.round(data.keppetipola * (1 + wave * 1.1));
      const colomboFluctuated = Math.round(data.colombo * (1 + wave * 0.9));

      return {
        key,
        name: data.name,
        nameSi: data.nameSi,
        dambulla: dambullaFluctuated,
        keppetipola: keppetipolaFluctuated,
        colombo: colomboFluctuated
      };
    });

    return NextResponse.json({ success: true, data: wholesalePrices }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

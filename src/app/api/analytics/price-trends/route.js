import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Crop from '@/models/Crop';
import Order from '@/models/Order';

export async function GET(request) {
  try {
    await connectDB();
    
    // Parse query param for specific crop, if any
    const { searchParams } = request.nextUrl;
    const cropNameQuery = searchParams.get('crop');

    // 1. Fetch all crops to compute active supply
    const allCrops = await Crop.find({ status: 'available' });
    const supplyMap = {};
    const listedPrices = {};

    allCrops.forEach(c => {
      const name = c.name.toLowerCase().trim();
      supplyMap[name] = (supplyMap[name] || 0) + (c.quantity || 0);
      if (!listedPrices[name]) listedPrices[name] = [];
      listedPrices[name].push(c.price);
    });

    // 2. Fetch completed/delivered/shipped orders to compute demand & historical average prices
    const completedOrders = await Order.find({ status: { $in: ['completed', 'delivered', 'shipped'] } });
    const demandMap = {};
    const priceHistoryMap = {}; // name -> array of { date, price }
    const totalRevenueMap = {};
    const totalQtyMap = {};

    completedOrders.forEach(o => {
      const date = o.createdAt;
      o.items.forEach(item => {
        const name = item.name.toLowerCase().trim();
        demandMap[name] = (demandMap[name] || 0) + (item.quantity || 0);
        
        // Sum revenue and qty for overall avg price
        totalRevenueMap[name] = (totalRevenueMap[name] || 0) + (item.price * item.quantity);
        totalQtyMap[name] = (totalQtyMap[name] || 0) + item.quantity;

        // Save price point
        if (!priceHistoryMap[name]) priceHistoryMap[name] = [];
        priceHistoryMap[name].push({ date, price: item.price });
      });
    });

    // 3. Compile unique crop list from both listed crops and orders
    const allUniqueNames = Array.from(new Set([
      ...Object.keys(supplyMap),
      ...Object.keys(totalQtyMap)
    ]));

    const result = allUniqueNames.map(name => {
      const supply = supplyMap[name] || 0;
      const demand = demandMap[name] || 0;
      
      // Average selling price in orders, fallback to average listed price, fallback to 150
      let avgPrice = 0;
      if (totalQtyMap[name] && totalQtyMap[name] > 0) {
        avgPrice = totalRevenueMap[name] / totalQtyMap[name];
      } else if (listedPrices[name] && listedPrices[name].length > 0) {
        avgPrice = listedPrices[name].reduce((sum, p) => sum + p, 0) / listedPrices[name].length;
      } else {
        avgPrice = 150; // default baseline
      }

      // Calculate Recommendation:
      // Price = avgPrice * (1 + (demand - supply) / (demand + supply + 10) * 0.25)
      // Clamp price between 0.75 * avgPrice and 1.35 * avgPrice
      const totalVolume = demand + supply;
      const diff = demand - supply;
      const demandFactor = totalVolume > 0 ? (diff / (totalVolume + 10)) * 0.25 : 0;
      let recommended = avgPrice * (1 + demandFactor);
      recommended = Math.max(avgPrice * 0.75, Math.min(avgPrice * 1.35, recommended));

      // Get historical price points
      const rawHistory = priceHistoryMap[name] || [];
      // Sort history chronologically
      rawHistory.sort((a, b) => new Date(a.date) - new Date(b.date));

      // Group or format history (limit to last 10 records for chart visualization)
      const history = rawHistory.slice(-10).map(pt => ({
        date: new Date(pt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        price: pt.price
      }));

      // If no history, generate mock past points based on listed price for visual rendering
      if (history.length === 0) {
        const base = avgPrice;
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
          const pastDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i * 5);
          // Generate a smooth simulated fluctuation
          const sinFactor = Math.sin(i) * 0.08;
          history.push({
            date: pastDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            price: Math.round(base * (1 + sinFactor))
          });
        }
      }

      // Display name casing (capitalize first letter of each word)
      const displayName = name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

      return {
        name: displayName,
        rawName: name,
        supply,
        demand,
        averagePrice: Math.round(avgPrice),
        recommendedPrice: Math.round(recommended),
        history
      };
    });

    // If query is for a specific crop, return only that
    if (cropNameQuery) {
      const searchName = cropNameQuery.toLowerCase().trim();
      const matched = result.find(r => r.rawName === searchName);
      if (matched) {
        return NextResponse.json({ success: true, data: matched });
      } else {
        // Return simulated data if not in DB yet so UI can draw a preview
        const defaultAvg = 200;
        const today = new Date();
        const history = [];
        for (let i = 5; i >= 0; i--) {
          const pastDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i * 5);
          history.push({
            date: pastDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            price: Math.round(defaultAvg * (1 + Math.sin(i) * 0.05))
          });
        }
        return NextResponse.json({
          success: true,
          data: {
            name: cropNameQuery,
            rawName: searchName,
            supply: 0,
            demand: 0,
            averagePrice: defaultAvg,
            recommendedPrice: defaultAvg,
            history
          }
        });
      }
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

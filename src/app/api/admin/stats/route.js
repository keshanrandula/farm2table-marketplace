import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Crop from '@/models/Crop';
import Order from '@/models/Order';

export async function GET(request) {
  try {
    await connectDB();

    // Query counts
    const totalFarmers = await User.countDocuments({ role: 'farmer' });
    const totalHotels = await User.countDocuments({ role: 'hotel' });
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalCrops = await Crop.countDocuments({});

    // Calculate marketplace totals (completed orders)
    const completedOrders = await Order.find({ status: { $in: ['completed', 'delivered'] } });
    const totalSales = completedOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        totalFarmers,
        totalHotels,
        totalCustomers,
        totalCrops,
        totalSales,
        totalUsers: totalFarmers + totalHotels + totalCustomers
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

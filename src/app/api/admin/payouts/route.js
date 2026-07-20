import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import Payout from '@/models/Payout';
import User from '@/models/User';

export async function GET(request) {
  try {
    await connectDB();

    const orders = await Order.find({ status: { $in: ['shipped', 'delivered', 'completed'] } })
      .populate('buyerId', 'name email')
      .populate('driverId', 'name phone');

    // Calculate Platform Metrics
    let totalGrossGMV = 0;
    let totalDeliveryFees = 0;
    let totalItemsValue = 0;

    orders.forEach(order => {
      totalGrossGMV += order.totalAmount || 0;
      totalDeliveryFees += order.deliveryFee || 0;
      const sub = order.items ? order.items.reduce((a, b) => a + b.price * b.quantity, 0) : 0;
      totalItemsValue += sub;
    });

    const platformCommissionRate = 0.05; // 5% platform fee
    const platformCommissionEarned = Math.round(totalItemsValue * platformCommissionRate);
    const netFarmerPayable = totalItemsValue - platformCommissionEarned;

    // Fetch past payout records
    const payouts = await Payout.find({}).sort({ createdAt: -1 });

    // Calculate Driver Balances
    const driverBalances = {};
    orders.forEach(order => {
      if (order.driverId) {
        const dId = order.driverId._id ? order.driverId._id.toString() : order.driverId.toString();
        const dName = order.driverId.name || 'Driver Partner';
        if (!driverBalances[dId]) {
          driverBalances[dId] = {
            id: dId,
            name: dName,
            role: 'driver',
            completedDeliveries: 0,
            totalDeliveryFees: 0
          };
        }
        driverBalances[dId].completedDeliveries += 1;
        driverBalances[dId].totalDeliveryFees += (order.deliveryFee || 0);
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalGrossGMV,
          totalItemsValue,
          platformCommissionRate: '5%',
          platformCommissionEarned,
          netFarmerPayable,
          totalDeliveryFees
        },
        driverBalances: Object.values(driverBalances),
        payoutsHistory: payouts
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { recipientId, recipientName, role, amount, commissionDeducted, notes } = body;

    if (!recipientId || !amount) {
      return NextResponse.json({ success: false, error: 'Missing payout parameters' }, { status: 400 });
    }

    const txRef = `PAY-${Math.floor(100000 + Math.random() * 900000)}`;

    const newPayout = await Payout.create({
      recipientId,
      recipientName: recipientName || 'Partner',
      role: role || 'farmer',
      amount: Number(amount),
      commissionDeducted: Number(commissionDeducted || 0),
      status: 'completed',
      transactionRef: txRef,
      notes: notes || 'Bank Transfer Settlement'
    });

    return NextResponse.json({ success: true, data: newPayout }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

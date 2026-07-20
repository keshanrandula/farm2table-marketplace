import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Subscription from '@/models/Subscription';
import Order from '@/models/Order';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json().catch(() => ({}));
    const { force, buyerId } = body;

    const now = new Date();
    
    // Find active subscriptions
    const query = { status: 'active' };
    if (buyerId) {
      query.buyerId = buyerId;
    }
    
    if (!force) {
      query.nextTrigger = { $lte: now };
    }

    const activeSubs = await Subscription.find(query);

    const createdOrders = [];

    for (const sub of activeSubs) {
      // 1. Create a corresponding Order
      const order = new Order({
        buyerId: sub.buyerId,
        items: sub.items.map(item => ({
          cropId: item.cropId,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: sub.totalAmount,
        status: 'pending'
      });

      await order.save();
      createdOrders.push(order);

      // 2. Roll trigger dates forward
      const currentNext = new Date(sub.nextTrigger);
      const updatedNext = new Date(force ? now : currentNext);
      
      if (sub.frequency === 'weekly') {
        updatedNext.setDate(updatedNext.getDate() + 7);
      } else {
        updatedNext.setDate(updatedNext.getDate() + 30);
      }

      sub.lastTriggered = now;
      sub.nextTrigger = updatedNext;
      await sub.save();
    }

    return NextResponse.json({
      success: true,
      message: `Trigger check processed. Created ${createdOrders.length} order(s).`,
      data: createdOrders
    });

  } catch (error) {
    console.error('Error triggering subscriptions:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

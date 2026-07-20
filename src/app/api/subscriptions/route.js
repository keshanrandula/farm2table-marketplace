import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Subscription from '@/models/Subscription';

// GET all subscriptions (filtered by buyerId)
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = request.nextUrl;
    const buyerId = searchParams.get('buyerId');

    if (!buyerId) {
      return NextResponse.json({ success: false, error: 'buyerId is required' }, { status: 400 });
    }

    const subscriptions = await Subscription.find({ buyerId }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: subscriptions });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST create a subscription
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { buyerId, items, totalAmount, frequency } = body;

    if (!buyerId || !items || items.length === 0 || !totalAmount || !frequency) {
      return NextResponse.json({ success: false, error: 'Missing required parameters' }, { status: 400 });
    }

    const now = new Date();
    const nextTrigger = new Date();
    if (frequency === 'weekly') {
      nextTrigger.setDate(now.getDate() + 7);
    } else if (frequency === 'monthly') {
      nextTrigger.setDate(now.getDate() + 30);
    } else {
      return NextResponse.json({ success: false, error: 'Invalid frequency' }, { status: 400 });
    }

    const newSub = new Subscription({
      buyerId,
      items,
      totalAmount,
      frequency,
      status: 'active',
      nextTrigger
    });

    await newSub.save();
    return NextResponse.json({ success: true, data: newSub });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

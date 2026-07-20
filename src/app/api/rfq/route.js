import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Rfq from '@/models/Rfq';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const hotelId = searchParams.get('hotelId');
    const status = searchParams.get('status');

    let filter = {};
    if (hotelId) {
      filter.hotelId = hotelId;
    }
    if (status) {
      filter.status = status;
    }

    const rfqs = await Rfq.find(filter).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: rfqs });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const {
      hotelId,
      hotelName,
      cropName,
      category,
      quantity,
      unit,
      targetBudgetPerUnit,
      deliveryLocation,
      requiredDate,
      description
    } = body;

    if (!hotelId || !cropName || !quantity || !targetBudgetPerUnit || !deliveryLocation || !requiredDate) {
      return NextResponse.json({ success: false, error: 'Missing required RFQ fields' }, { status: 400 });
    }

    const qty = Number(quantity);
    const budget = Number(targetBudgetPerUnit);
    const totalBudget = qty * budget;

    const newRfq = await Rfq.create({
      hotelId,
      hotelName: hotelName || 'Hotel Buyer',
      cropName,
      category: category || 'Vegetables',
      quantity: qty,
      unit: unit || 'kg',
      targetBudgetPerUnit: budget,
      totalBudget,
      deliveryLocation,
      requiredDate,
      description: description || '',
      status: 'open',
      bids: []
    });

    return NextResponse.json({ success: true, data: newRfq }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

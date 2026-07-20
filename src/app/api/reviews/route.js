import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Review from '@/models/Review';
import Order from '@/models/Order';
import User from '@/models/User';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = request.nextUrl;
    const cropId = searchParams.get('cropId');

    if (!cropId) {
      return NextResponse.json(
        { success: false, error: 'අස්වනු හැඳුනුම්පත අවශ්‍ය වේ / Crop ID is required' },
        { status: 400 }
      );
    }

    const reviews = await Review.find({ cropId })
      .populate('buyerId', 'name email role')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { orderId, cropId, buyerId, rating, comment } = body;

    if (!orderId || !cropId || !buyerId || !rating || !comment) {
      return NextResponse.json(
        { success: false, error: 'සියලුම තොරතුරු අත්‍යවශ්‍ය වේ / All fields are required' },
        { status: 400 }
      );
    }

    // Verify order exists, belongs to buyer, and is delivered/completed
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'ඇණවුම සොයාගත නොහැක / Order not found' },
        { status: 404 }
      );
    }

    if (order.buyerId.toString() !== buyerId.toString()) {
      return NextResponse.json(
        { success: false, error: 'අනවසර ක්‍රියාවකි / Unauthorized action' },
        { status: 403 }
      );
    }

    if (order.status !== 'completed' && order.status !== 'delivered') {
      return NextResponse.json(
        { success: false, error: 'ඇණවුම භාරදීමෙන් පසු පමණක් අදහස් දැක්විය හැක / Review is only allowed after delivery' },
        { status: 400 }
      );
    }

    // Verify crop was part of this order
    const hasItem = order.items.some(item => item.cropId.toString() === cropId.toString());
    if (!hasItem) {
      return NextResponse.json(
        { success: false, error: 'මෙම අස්වැන්න ඇණවුමට ඇතුළත් නොවේ / Crop not in order items' },
        { status: 400 }
      );
    }

    // Verify if review already exists for this order item
    const existing = await Review.findOne({ orderId, cropId });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'ඔබ දැනටමත් මෙම ඇණවුම සඳහා අදහස් දක්වා ඇත / You have already reviewed this order item' },
        { status: 400 }
      );
    }

    // Fetch buyer details for cached name
    const buyer = await User.findById(buyerId);
    if (!buyer) {
      return NextResponse.json(
        { success: false, error: 'මිලදී ගන්නා සොයාගත නොහැක / Buyer not found' },
        { status: 404 }
      );
    }

    // Create review
    const review = await Review.create({
      cropId,
      buyerId,
      buyerName: buyer.name,
      rating: Number(rating),
      comment,
      orderId
    });

    return NextResponse.json({ success: true, data: review });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

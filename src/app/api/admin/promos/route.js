import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import PromoCode from '@/models/PromoCode';

export async function GET(request) {
  try {
    await connectDB();
    const promos = await PromoCode.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: promos });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const {
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      validUntil,
      usageLimit
    } = body;

    if (!code || !discountValue || !validUntil) {
      return NextResponse.json({ success: false, error: 'Missing required promo code details' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    const existing = await PromoCode.findOne({ code: cleanCode });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Promo code already exists!' }, { status: 400 });
    }

    const newPromo = await PromoCode.create({
      code: cleanCode,
      discountType: discountType || 'percentage',
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount || 0),
      maxDiscountAmount: Number(maxDiscountAmount || 0),
      validUntil: new Date(validUntil),
      usageLimit: Number(usageLimit || 100),
      status: 'active'
    });

    return NextResponse.json({ success: true, data: newPromo }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { promoId, status } = body;

    const promo = await PromoCode.findById(promoId);
    if (!promo) {
      return NextResponse.json({ success: false, error: 'Promo code not found' }, { status: 404 });
    }

    promo.status = status;
    await promo.save();

    return NextResponse.json({ success: true, data: promo });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

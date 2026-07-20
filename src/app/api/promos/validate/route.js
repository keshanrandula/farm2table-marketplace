import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import PromoCode from '@/models/PromoCode';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { code, subtotal } = body;

    if (!code) {
      return NextResponse.json({ success: false, error: 'Please enter a promo code' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const promo = await PromoCode.findOne({ code: cleanCode });

    if (!promo) {
      return NextResponse.json({ success: false, error: 'invalid_code', message: 'වලංගු නොවන ප්‍රවර්ධන කේතයකි (Invalid Promo Code)' }, { status: 400 });
    }

    if (promo.status !== 'active') {
      return NextResponse.json({ success: false, error: 'code_disabled', message: 'මෙම කේතය දැනට අක්‍රිය කර ඇත (Promo code is disabled)' }, { status: 400 });
    }

    if (new Date(promo.validUntil) < new Date()) {
      return NextResponse.json({ success: false, error: 'code_expired', message: 'මෙම කේතයේ කාලය ඉක්මවී ඇත (Promo code has expired)' }, { status: 400 });
    }

    if (promo.timesUsed >= promo.usageLimit) {
      return NextResponse.json({ success: false, error: 'limit_reached', message: 'කේතයේ උපරිම සීමාව භාවිතා කර ඇත (Usage limit reached)' }, { status: 400 });
    }

    const sub = Number(subtotal || 0);
    if (sub < promo.minOrderAmount) {
      return NextResponse.json({
        success: false,
        error: 'min_amount',
        message: `මෙම කේතය සඳහා අවම ඇණවුම් වටිනාකම Rs. ${promo.minOrderAmount} විය යුතුය`
      }, { status: 400 });
    }

    let calculatedDiscount = 0;
    if (promo.discountType === 'percentage') {
      calculatedDiscount = Math.round((sub * promo.discountValue) / 100);
      if (promo.maxDiscountAmount > 0 && calculatedDiscount > promo.maxDiscountAmount) {
        calculatedDiscount = promo.maxDiscountAmount;
      }
    } else {
      calculatedDiscount = promo.discountValue;
    }

    // Increment times used
    promo.timesUsed += 1;
    await promo.save();

    return NextResponse.json({
      success: true,
      data: {
        code: promo.code,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        discountAmount: calculatedDiscount
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

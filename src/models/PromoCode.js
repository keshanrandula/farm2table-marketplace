import mongoose from 'mongoose';

const PromoCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  discountValue: { type: Number, required: true }, // e.g., 10 for 10% or 500 for Rs.500
  minOrderAmount: { type: Number, default: 0 },
  maxDiscountAmount: { type: Number, default: 0 }, // max cap if percentage
  validUntil: { type: Date, required: true },
  usageLimit: { type: Number, default: 100 },
  timesUsed: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'expired', 'disabled'], default: 'active' }
}, { timestamps: true });

export default mongoose.models.PromoCode || mongoose.model('PromoCode', PromoCodeSchema);

import mongoose from 'mongoose';

const BidSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmerName: { type: String, required: true },
  farmerPhone: { type: String, default: '' },
  pricePerUnit: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  deliveryDays: { type: Number, default: 1 },
  notes: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
}, { timestamps: true });

const RfqSchema = new mongoose.Schema({
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hotelName: { type: String, required: true },
  cropName: { type: String, required: true },
  category: { type: String, default: 'Vegetables' },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'kg' },
  targetBudgetPerUnit: { type: Number, required: true },
  totalBudget: { type: Number, required: true },
  deliveryLocation: { type: String, required: true },
  requiredDate: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['open', 'accepted', 'closed'], default: 'open' },
  acceptedBid: { type: Object, default: null },
  bids: [BidSchema]
}, { timestamps: true });

export default mongoose.models.Rfq || mongoose.model('Rfq', RfqSchema);

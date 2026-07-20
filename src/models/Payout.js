import mongoose from 'mongoose';

const PayoutSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipientName: { type: String, required: true },
  role: { type: String, enum: ['farmer', 'driver'], required: true },
  amount: { type: Number, required: true },
  commissionDeducted: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'completed'], default: 'completed' },
  transactionRef: { type: String, required: true },
  notes: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.models.Payout || mongoose.model('Payout', PayoutSchema);

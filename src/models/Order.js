import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  cropId: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

const OrderSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  items: [OrderItemSchema],
  totalAmount: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 0 },
  distance: { type: Number, default: 0 },
  buyerLocation: { type: String, default: 'Colombo' },
  paymentMethod: { type: String, enum: ['cod', 'card', 'lankaqr', 'bank_transfer'], default: 'cod' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'verified', 'failed'], default: 'pending' },
  paymentReceipt: { type: String, default: '' },
  proofOfDelivery: {
    photo: { type: String, default: '' },
    signature: { type: String, default: '' },
    deliveredAt: { type: Date, default: null },
    notes: { type: String, default: '' }
  },
  status: { type: String, enum: ['pending', 'prepared', 'shipped', 'delivered', 'completed', 'cancelled'], default: 'pending' }
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);

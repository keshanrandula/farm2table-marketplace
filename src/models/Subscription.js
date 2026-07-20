import mongoose from 'mongoose';

const SubscriptionItemSchema = new mongoose.Schema({
  cropId: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

const SubscriptionSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [SubscriptionItemSchema],
  totalAmount: { type: Number, required: true },
  frequency: { type: String, enum: ['weekly', 'monthly'], default: 'weekly' },
  status: { type: String, enum: ['active', 'paused', 'cancelled'], default: 'active' },
  lastTriggered: { type: Date, default: null },
  nextTrigger: { type: Date, required: true }
}, { timestamps: true });

export default mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);

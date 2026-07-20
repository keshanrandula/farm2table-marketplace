import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  role: { type: String, enum: ['farmer', 'hotel', 'driver', 'admin', 'customer', 'all'], default: 'all' },
  title: { type: String, required: true },
  titleSi: { type: String, default: '' },
  titleTa: { type: String, default: '' },
  message: { type: String, required: true },
  messageSi: { type: String, default: '' },
  messageTa: { type: String, default: '' },
  type: { type: String, enum: ['order', 'status', 'chat', 'payment', 'system'], default: 'order' },
  link: { type: String, default: '' },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

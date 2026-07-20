import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  cropId: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
  read: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);

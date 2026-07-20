import mongoose from 'mongoose';

const CropSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  location: { type: String, required: true },
  address: { type: String, default: '' },
  image: { type: String, default: '' },
  status: { type: String, enum: ['available', 'sold-out'], default: 'available' },
  grade: { type: String, enum: ['A', 'B', 'C', 'N/A'], default: 'N/A' },
  organicStatus: { type: String, enum: ['organic', 'pesticide-free', 'conventional'], default: 'conventional' }
}, { timestamps: true });

export default mongoose.models.Crop || mongoose.model('Crop', CropSchema);

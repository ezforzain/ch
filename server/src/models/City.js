import mongoose from 'mongoose';

const citySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'City name is required'], trim: true, unique: true },
    province: { type: String, trim: true, default: '' },
    isActive: { type: Boolean, default: true }, // whether it's currently offered as a service area
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const City = mongoose.model('City', citySchema);

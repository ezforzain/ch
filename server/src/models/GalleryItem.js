import mongoose from 'mongoose';

const galleryItemSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: '' },
    category: { type: String, trim: true, default: 'General' },
    image: {
      url: { type: String, required: true },
      publicId: { type: String, default: '' },
    },
    isPublished: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

galleryItemSchema.index({ title: 'text', category: 'text' });

export const GalleryItem = mongoose.model('GalleryItem', galleryItemSchema);

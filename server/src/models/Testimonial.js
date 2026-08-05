import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    location: { type: String, trim: true, default: '' },
    quote: { type: String, required: [true, 'Quote is required'], trim: true, maxlength: 600 },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    portrait: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    relatedProject: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
    isVerified: { type: Boolean, default: true },
    isPublished: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

testimonialSchema.index({ name: 'text', quote: 'text', location: 'text' });

export const Testimonial = mongoose.model('Testimonial', testimonialSchema);

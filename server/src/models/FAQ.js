import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: [true, 'Question is required'], trim: true },
    answer: { type: String, required: [true, 'Answer is required'], trim: true },
    category: { type: String, trim: true, default: 'General' },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

faqSchema.index({ question: 'text', answer: 'text', category: 'text' });

export const FAQ = mongoose.model('FAQ', faqSchema);

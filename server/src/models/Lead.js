import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    phone: { type: String, required: [true, 'Phone number is required'], trim: true },
    email: { type: String, trim: true, lowercase: true, default: '' },
    city: { type: String, trim: true, default: '' },
    service: { type: String, trim: true, default: 'Solar system' }, // free-form: matches QuoteForm's service chips
    message: { type: String, trim: true, default: '' },
    plannerSummary: { type: String, trim: true, default: '' }, // carried over from the Solar Planner, if any
    source: { type: String, enum: ['website', 'whatsapp', 'call', 'planner', 'referral'], default: 'website' },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'converted', 'lost'],
      default: 'new',
      index: true,
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    notes: { type: String, trim: true, default: '' }, // internal admin notes, distinct from the customer's own message
  },
  { timestamps: true },
);

leadSchema.index({ name: 'text', phone: 'text', email: 'text', city: 'text' });

export const Lead = mongoose.model('Lead', leadSchema);

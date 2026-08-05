import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    phone: { type: String, required: [true, 'Phone number is required'], trim: true },
    email: { type: String, trim: true, lowercase: true, default: '' },
    address: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    serviceType: { type: String, trim: true, default: 'Site survey' },
    preferredDate: { type: Date, required: [true, 'Preferred date is required'] },
    preferredTime: { type: String, trim: true, default: '' }, // free-form slot label, e.g. "10:00 AM - 12:00 PM"
    notes: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

appointmentSchema.index({ name: 'text', phone: 'text', city: 'text' });

export const Appointment = mongoose.model('Appointment', appointmentSchema);

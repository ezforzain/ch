import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    // Either a specific user, or a broadcast to everyone with `role` (e.g. all admins).
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    role: { type: String, enum: ['superadmin', 'admin', 'seller', 'customer', null], default: null },

    type: {
      type: String,
      enum: ['order', 'lead', 'appointment', 'message', 'product', 'system'],
      default: 'system',
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    link: { type: String, default: '' },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

export const Notification = mongoose.model('Notification', notificationSchema);

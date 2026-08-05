import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    userName: { type: String, default: 'System' },
    userRole: { type: String, default: '' },
    action: { type: String, enum: ['created', 'updated', 'deleted'], required: true },
    module: { type: String, required: true, index: true }, // e.g. "products", "leads"
    targetId: { type: String, default: '' },
    method: { type: String, required: true },
    path: { type: String, required: true },
  },
  { timestamps: true },
);

activityLogSchema.index({ createdAt: -1 });

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

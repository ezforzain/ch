import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: { type: String, trim: true, lowercase: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    subject: { type: String, trim: true, default: 'General inquiry' },
    body: { type: String, required: [true, 'Message body is required'], trim: true, maxlength: 3000 },
    relatedProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // set if the sender was logged in
    status: { type: String, enum: ['unread', 'read', 'replied'], default: 'unread', index: true },
    reply: { type: String, trim: true, default: '' },
    repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    repliedAt: { type: Date },
  },
  { timestamps: true },
);

messageSchema.index({ name: 'text', email: 'text', subject: 'text', body: 'text' });

export const Message = mongoose.model('Message', messageSchema);

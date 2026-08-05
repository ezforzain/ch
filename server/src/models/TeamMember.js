import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    role: { type: String, required: [true, 'Role/title is required'], trim: true },
    bio: { type: String, trim: true, default: '' },
    photo: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    email: { type: String, trim: true, lowercase: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    social: {
      linkedin: { type: String, trim: true, default: '' },
      facebook: { type: String, trim: true, default: '' },
      instagram: { type: String, trim: true, default: '' },
    },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

teamMemberSchema.index({ name: 'text', role: 'text' });

export const TeamMember = mongoose.model('TeamMember', teamMemberSchema);

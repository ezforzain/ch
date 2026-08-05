import mongoose from 'mongoose';
import slugify from 'slugify';

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Service name is required'], trim: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String, trim: true, default: '' },
    icon: { type: String, trim: true, default: '' }, // icon key or image URL, frontend-defined
    image: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    costEstimate: { type: String, trim: true, default: '' }, // e.g. "PKR 250,000 – 1.2M"
    installTime: { type: String, trim: true, default: '' },
    bestFor: { type: String, trim: true, default: '' },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

serviceSchema.pre('validate', function setSlug(next) {
  if (this.name && (this.isModified('name') || !this.slug)) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

export const Service = mongoose.model('Service', serviceSchema);

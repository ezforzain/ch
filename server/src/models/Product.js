import mongoose from 'mongoose';
import slugify from 'slugify';

// Plain inline shape (not a separately-constructed `new mongoose.Schema(...)`) — Mongoose's
// `{ type: someSchema, required: true }` form for single-nested subdocuments throws a cast
// TypeError on save with this Mongoose version; the shorthand object-literal form below
// (both as a single field and inside an array) is the well-trodden, reliable path.
const imageShape = { url: { type: String, default: '' }, publicId: { type: String, default: '' } };

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true, maxlength: 140 },
    slug: { type: String, unique: true, index: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: [true, 'Category is required'] },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null = first-party (Chaudhary Electronics) stock
    brand: { type: String, trim: true, default: 'Chaudhary Electronics' },

    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    originalPrice: { type: Number, min: 0 }, // set + greater than price => shows a "Sale" badge
    unit: { type: String, trim: true, default: '' },

    description: { type: String, trim: true, default: '', maxlength: 2000 },
    tag: { type: String, trim: true, default: '' }, // e.g. "POPULAR", "TIER 1", "LOW WATT" — free-form badge text

    image: { type: imageShape, required: true },
    gallery: { type: [imageShape], default: [] },

    specs: { type: Map, of: String, default: {} },
    warranty: { type: String, trim: true, default: '' },

    stock: { type: Number, required: true, min: 0, default: 0 },
    moq: { type: Number, min: 1, default: 1 }, // minimum order quantity — 1 for almost all products
    rating: { type: Number, min: 0, max: 5, default: 0 },
    numReviews: { type: Number, min: 0, default: 0 },
    popularity: { type: Number, default: 0 }, // internal ranking score, bumped on each order

    status: { type: String, enum: ['active', 'draft', 'archived'], default: 'active', index: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

productSchema.index({ name: 'text', description: 'text', brand: 'text', tag: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ seller: 1 });

// Named `isNewArrival`, NOT `isNew` — `isNew` is a reserved Mongoose Document property
// (true until the doc is first saved); shadowing it with a virtual breaks subdocument
// construction (image/gallery) with a confusing "Cast to Embedded ... TypeError".
productSchema.virtual('isNewArrival').get(function isNewArrivalGetter() {
  if (!this.createdAt) return false;
  const ageDays = (Date.now() - this.createdAt.getTime()) / 86400000;
  return ageDays <= 30;
});
productSchema.virtual('isSale').get(function isSaleGetter() {
  return Number(this.originalPrice) > Number(this.price);
});
productSchema.virtual('inStock').get(function inStockGetter() {
  return this.stock > 0;
});
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

productSchema.pre('validate', function setSlug(next) {
  if (this.name && (this.isModified('name') || !this.slug)) {
    this.slug = `${slugify(this.name, { lower: true, strict: true })}-${Math.random().toString(36).slice(2, 7)}`;
  }
  next();
});

export const Product = mongoose.model('Product', productSchema);

import mongoose from 'mongoose';
import slugify from 'slugify';

const blogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 160 },
    slug: { type: String, unique: true, index: true },
    excerpt: { type: String, trim: true, maxlength: 300, default: '' },
    content: { type: String, required: [true, 'Content is required'] },
    coverImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, trim: true, default: 'General' },
    tags: { type: [String], default: [] },
    seo: {
      title: { type: String, trim: true, default: '' },
      description: { type: String, trim: true, default: '' },
    },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    views: { type: Number, default: 0 },
  },
  { timestamps: true },
);

blogPostSchema.index({ title: 'text', excerpt: 'text', content: 'text', tags: 'text' });

blogPostSchema.pre('validate', function setSlug(next) {
  if (this.title && (this.isModified('title') || !this.slug)) {
    this.slug = `${slugify(this.title, { lower: true, strict: true })}-${Math.random().toString(36).slice(2, 7)}`;
  }
  next();
});

blogPostSchema.pre('save', function setPublishedAt(next) {
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export const BlogPost = mongoose.model('BlogPost', blogPostSchema);

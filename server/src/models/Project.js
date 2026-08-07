import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({ url: String, publicId: String }, { _id: false });

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    category: { type: String, enum: ['Residential', 'Commercial', 'Security'], required: true },
    // Workflow state (independent of `isPublished`, which controls public-site visibility —
    // a project can be "In progress" and already published, or "Completed" and unpublished).
    status: { type: String, enum: ['Completed', 'In progress', 'Pending'], default: 'Completed' },
    // A real City reference (not free text) so the Admin Panel's Cities page can show an
    // accurate per-city project count instead of a hardcoded 0. The setter lets the admin
    // form's "not set" option submit '' to clear a previously-picked city — Mongoose's
    // ObjectId cast rejects '' outright rather than treating it as null like most types do.
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      default: null,
      set: (v) => (v === '' ? null : v),
    },
    size: { type: String, trim: true, default: '' }, // e.g. "10 kW Hybrid"
    completionTime: { type: String, trim: true, default: '' },
    result: { type: String, trim: true, default: '' }, // savings / outcome summary

    image: { type: imageSchema, required: true },
    beforeImage: { type: imageSchema, default: undefined },

    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

projectSchema.index({ title: 'text' });

export const Project = mongoose.model('Project', projectSchema);

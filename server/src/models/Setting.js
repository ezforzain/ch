import mongoose from 'mongoose';

/** Singleton document — there is only ever one Settings row, enforced by always
 * upserting the same well-known _id from the controller rather than exposing create/delete. */
const settingSchema = new mongoose.Schema(
  {
    siteName: { type: String, trim: true, default: 'Chaudhary Electronics' },
    tagline: { type: String, trim: true, default: 'Your last electricity bill.' },
    contactEmail: { type: String, trim: true, default: 'info@chaudharyelectronics.pk' },
    contactPhone: { type: String, trim: true, default: '+92 300 000 0000' },
    whatsappNumber: { type: String, trim: true, default: '920000000000' },
    address: { type: String, trim: true, default: 'Bund Road, Lahore' },
    businessHours: { type: String, trim: true, default: 'Mon–Sat, 9am–8pm' },
    social: {
      facebook: { type: String, trim: true, default: '' },
      instagram: { type: String, trim: true, default: '' },
      youtube: { type: String, trim: true, default: '' },
      linkedin: { type: String, trim: true, default: '' },
    },
    currency: { type: String, trim: true, default: 'PKR' },
    maintenanceMode: { type: Boolean, default: false },
    seo: {
      metaTitle: { type: String, trim: true, default: '' },
      metaDescription: { type: String, trim: true, default: '' },
    },
    branding: {
      accentColor: { type: String, trim: true, default: '#E2A347' },
      logoUrl: { type: String, trim: true, default: '' },
    },
    analytics: {
      googleAnalyticsId: { type: String, trim: true, default: '' },
      facebookPixelId: { type: String, trim: true, default: '' },
    },
    // SMTP credentials are intentionally NOT stored here — they're read from server-side
    // env vars only (server/src/config/env.js). Persisting a mail password in the app
    // database (readable by anyone with Setting:read) would be a real credential-exposure
    // risk for no real benefit, so that admin tab stays local-only by design, not oversight.
  },
  { timestamps: true },
);

export const Setting = mongoose.model('Setting', settingSchema);

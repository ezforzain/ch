import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: 'Home' },
    line1: { type: String, trim: true, required: true },
    city: { type: String, trim: true, required: true },
    postalCode: { type: String, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true, timestamps: false },
);

const sellerProfileSchema = new mongoose.Schema(
  {
    businessName: { type: String, trim: true },
    description: { type: String, trim: true },
    cnic: { type: String, trim: true },
    bankAccountTitle: { type: String, trim: true },
    bankAccountNumber: { type: String, trim: true },
    bankName: { type: String, trim: true },
    commissionRate: { type: Number, default: 10, min: 0, max: 100 },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'suspended'], default: 'pending' },
    rating: { type: Number, default: 0, min: 0, max: 5 },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 80 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address'],
    },
    phone: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // allows many docs with no phone while still enforcing uniqueness when present
    },
    password: { type: String, required: true, minlength: 6, select: false },
    // Set only for accounts created/linked via "Sign in with Google" (stores Google's
    // stable per-user `sub` claim). sparse so the unique index ignores the many docs
    // that don't have one (regular email/password accounts).
    googleId: { type: String, unique: true, sparse: true, select: false },
    avatar: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'seller', 'customer'],
      default: 'customer',
      index: true,
    },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },

    addresses: [addressSchema],
    sellerProfile: { type: sellerProfileSchema, default: undefined },

    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

    tokenVersion: { type: Number, default: 0 }, // bumped to invalidate all outstanding refresh tokens
    passwordChangedAt: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },

    lastLoginAt: { type: Date },
  },
  { timestamps: true },
);

userSchema.index({ name: 'text', email: 'text', 'sellerProfile.businessName': 'text' });

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  if (!this.isNew) this.passwordChangedAt = new Date(Date.now() - 1000); // -1s so a token issued in the same second still validates
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.passwordChangedAfter = function passwordChangedAfter(jwtIat) {
  if (!this.passwordChangedAt) return false;
  const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
  return jwtIat < changedTimestamp;
};

/** Returns the raw token (emailed to the user) while storing only its SHA-256 hash,
 * so a leaked database never exposes usable reset tokens. */
userSchema.methods.createPasswordResetToken = function createPasswordResetToken() {
  const rawToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  this.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  return rawToken;
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  const obj = this.toObject({ versionKey: false });
  delete obj.password;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.passwordChangedAt;
  delete obj.tokenVersion;
  return obj;
};

export const User = mongoose.model('User', userSchema);

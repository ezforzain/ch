import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [orderItemSchema], validate: (v) => v.length > 0 },

    subtotal: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },

    contactName: { type: String, required: true, trim: true },
    contactPhone: { type: String, required: true, trim: true },
    shippingAddress: { type: String, required: true, trim: true },
    city: { type: String, trim: true, default: '' },
    notes: { type: String, trim: true, default: '' },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },
    paymentMethod: { type: String, enum: ['whatsapp', 'cod', 'bank_transfer'], default: 'whatsapp' },
    paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
  },
  { timestamps: true },
);

orderSchema.pre('validate', function setOrderNumber(next) {
  if (!this.orderNumber) {
    this.orderNumber = `CE-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;
  }
  next();
});

export const Order = mongoose.model('Order', orderSchema);

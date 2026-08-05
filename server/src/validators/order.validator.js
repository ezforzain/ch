import { body } from 'express-validator';

export const createOrderValidator = [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.productId').isMongoId().withMessage('Invalid product in cart'),
  body('items.*.qty').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('contactName').trim().notEmpty().withMessage('Contact name is required'),
  body('contactPhone').trim().isLength({ min: 7 }).withMessage('Enter a valid phone number'),
  body('shippingAddress').trim().notEmpty().withMessage('Shipping address is required'),
  body('paymentMethod').optional().isIn(['whatsapp', 'cod', 'bank_transfer']),
];

export const updateOrderStatusValidator = [
  body('status').optional().isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
  body('paymentStatus').optional().isIn(['unpaid', 'paid', 'refunded']),
];

import { body } from 'express-validator';

export const updateSettingsValidator = [
  body('contactEmail').optional().isEmail().withMessage('Enter a valid email address'),
  body('contactPhone').optional().trim(),
  body('whatsappNumber').optional().trim(),
  body('maintenanceMode').optional().isBoolean(),
  body('banners').optional().isArray(),
  body('banners.*.title').optional().trim(),
  body('banners.*.link').optional().trim(),
  body('banners.*.isActive').optional().isBoolean(),
  body('banners.*.sortOrder').optional().isInt(),
  body('announcement.text').optional().trim(),
  body('announcement.link').optional().trim(),
  body('announcement.isActive').optional().isBoolean(),
  body('spotlightProductIds').optional().isArray(),
  body('spotlightProductIds.*').optional().isMongoId(),
  body('tax.rate').optional().isFloat({ min: 0, max: 100 }),
  body('shipping.flatRate').optional().isFloat({ min: 0 }),
  body('shipping.freeShippingThreshold').optional().isFloat({ min: 0 }),
];

import { body } from 'express-validator';

export const updateUserValidator = [
  body('name').optional().trim().notEmpty(),
  body('phone').optional().trim(),
  body('role').optional().isIn(['superadmin', 'admin', 'seller', 'customer']),
  body('isActive').optional().isBoolean(),
];

export const updateMeValidator = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().trim(),
];

export const addressValidator = [
  body('line1').trim().notEmpty().withMessage('Address line is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('label').optional().trim(),
  body('postalCode').optional().trim(),
  body('isDefault').optional().isBoolean(),
];

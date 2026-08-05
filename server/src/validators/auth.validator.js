import { body } from 'express-validator';

export const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 80 }),
  body('email').trim().isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  body('phone').optional({ values: 'falsy' }).trim().isLength({ min: 7 }).withMessage('Enter a valid phone number'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  // Public registration may only self-select customer or seller — admin roles are provisioned separately.
  body('role').optional().isIn(['customer', 'seller']).withMessage('Role must be "customer" or "seller"'),
  body('businessName')
    .if(body('role').equals('seller'))
    .trim()
    .notEmpty()
    .withMessage('Business name is required for seller accounts'),
];

export const loginValidator = [
  body('identifier').trim().notEmpty().withMessage('Enter your email or phone number'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const forgotPasswordValidator = [body('email').trim().isEmail().withMessage('Enter a valid email address')];

export const resetPasswordValidator = [
  body('token').trim().notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const updatePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

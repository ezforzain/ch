import { body } from 'express-validator';

export const serviceValidator = [
  body('name').trim().notEmpty().withMessage('Service name is required'),
  body('description').optional().trim(),
  body('costEstimate').optional().trim(),
  body('installTime').optional().trim(),
  body('bestFor').optional().trim(),
  body('isActive').optional().isBoolean(),
  body('sortOrder').optional().isInt(),
];

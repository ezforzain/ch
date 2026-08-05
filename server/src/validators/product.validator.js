import { body } from 'express-validator';

export const productValidator = [
  body('name').trim().notEmpty().withMessage('Product name is required').isLength({ max: 140 }),
  body('category').isMongoId().withMessage('A valid category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('originalPrice').optional({ values: 'falsy' }).isFloat({ min: 0 }),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('warranty').optional().trim(),
  body('brand').optional().trim(),
  body('tag').optional().trim(),
  body('unit').optional().trim(),
  body('status').optional().isIn(['active', 'draft', 'archived']),
];

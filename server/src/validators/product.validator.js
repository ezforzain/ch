import { body } from 'express-validator';

// The admin form's price/stock inputs are plain text (not type="number", so admins can type
// thousands-separator commas) — a copy-pasted "Rs 27,500", or just a stray leading/trailing
// space, is easy to end up with. The frontend already strips that before sending, but
// isFloat/isInt below reject anything but a bare numeric string, so this sanitizer makes the
// API itself tolerant of the same formatting rather than depending on the client alone.
function cleanNumericInput(value) {
  // Keeps '-' (unlike commas/currency symbols/whitespace, it's meaningful here) so a
  // genuinely negative input still reads as negative and gets correctly rejected by the
  // isFloat/isInt check below, instead of being silently stripped into a positive one.
  return typeof value === 'string' ? value.replace(/[^0-9.-]/g, '') : value;
}

export const productValidator = [
  body('name').trim().notEmpty().withMessage('Product name is required').isLength({ max: 140 }),
  body('category').isMongoId().withMessage('A valid category is required'),
  body('price')
    .customSanitizer(cleanNumericInput)
    .isFloat({ gt: 0 })
    .withMessage('Price must be a positive number'),
  body('originalPrice').optional({ values: 'falsy' }).customSanitizer(cleanNumericInput).isFloat({ min: 0 }),
  body('stock')
    .customSanitizer(cleanNumericInput)
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('moq')
    .optional({ checkFalsy: true })
    .customSanitizer(cleanNumericInput)
    .isInt({ min: 1 })
    .withMessage('Minimum order quantity must be a whole number of 1 or more'),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('warranty').optional().trim(),
  body('brand').optional().trim(),
  body('tag').optional().trim(),
  body('unit').optional().trim(),
  body('status').optional().isIn(['active', 'draft', 'archived']),
  body('isFeatured').optional().isBoolean(),
];

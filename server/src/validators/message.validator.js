import { body } from 'express-validator';

export const createMessageValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('body').trim().notEmpty().withMessage('Message cannot be empty').isLength({ max: 3000 }),
  body('email').optional({ values: 'falsy' }).trim().isEmail().withMessage('Enter a valid email address'),
  body('phone').optional().trim(),
  body('subject').optional().trim(),
  body('relatedProduct').optional({ values: 'falsy' }).isMongoId(),
];

export const replyValidator = [body('reply').trim().notEmpty().withMessage('Reply cannot be empty')];

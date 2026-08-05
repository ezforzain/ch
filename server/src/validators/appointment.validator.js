import { body } from 'express-validator';

export const createAppointmentValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').trim().isLength({ min: 7 }).withMessage('Enter a valid phone number'),
  body('email').optional({ values: 'falsy' }).trim().isEmail().withMessage('Enter a valid email address'),
  body('preferredDate').isISO8601().withMessage('Enter a valid date').toDate(),
  body('city').optional().trim(),
  body('address').optional().trim(),
  body('serviceType').optional().trim(),
  body('preferredTime').optional().trim(),
];

export const updateAppointmentValidator = [
  body('status').optional().isIn(['pending', 'confirmed', 'completed', 'cancelled']),
  body('assignedTo').optional({ values: 'falsy' }).isMongoId(),
  body('notes').optional().trim(),
  body('preferredDate').optional().isISO8601().toDate(),
];

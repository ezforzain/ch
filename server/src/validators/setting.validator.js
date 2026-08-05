import { body } from 'express-validator';

export const updateSettingsValidator = [
  body('contactEmail').optional().isEmail().withMessage('Enter a valid email address'),
  body('contactPhone').optional().trim(),
  body('whatsappNumber').optional().trim(),
  body('maintenanceMode').optional().isBoolean(),
];

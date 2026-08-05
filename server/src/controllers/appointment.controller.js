import asyncHandler from 'express-async-handler';
import { Appointment } from '../models/Appointment.js';
import { sendResponse } from '../utils/sendResponse.js';
import { createNotification } from './notification.controller.js';
import * as factory from './handlerFactory.js';

// @route  POST /api/v1/appointments
// @access Public
export const createAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.create(req.body);
  await createNotification({
    role: 'admin',
    type: 'appointment',
    title: 'New appointment requested',
    message: `${appointment.name} requested a ${appointment.serviceType} on ${new Date(appointment.preferredDate).toDateString()}.`,
    link: `/admin/appointments/${appointment._id}`,
  });
  sendResponse(res, 201, 'Appointment requested — we will confirm shortly.', appointment);
});

export const getAppointments = factory.getAll(Appointment, {
  searchableFields: ['name', 'phone', 'city'],
  populate: { path: 'assignedTo', select: 'name email' },
});
export const getAppointment = factory.getOne(Appointment, { populate: { path: 'assignedTo', select: 'name email' } });
export const updateAppointment = factory.updateOne(Appointment);
export const deleteAppointment = factory.deleteOne(Appointment);

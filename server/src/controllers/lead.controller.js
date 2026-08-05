import asyncHandler from 'express-async-handler';
import { Lead } from '../models/Lead.js';
import { sendResponse } from '../utils/sendResponse.js';
import { createNotification } from './notification.controller.js';
import * as factory from './handlerFactory.js';

// @route  POST /api/v1/leads
// @access Public — this is the QuoteForm / Solar Planner "carry to quote" submission target.
export const createLead = asyncHandler(async (req, res) => {
  const lead = await Lead.create(req.body);
  await createNotification({
    role: 'admin',
    type: 'lead',
    title: 'New quote request',
    message: `${lead.name} (${lead.phone}) requested a quote for ${lead.service}.`,
    link: `/admin/leads/${lead._id}`,
  });
  sendResponse(res, 201, 'Thanks — we will be in touch shortly.', lead);
});

export const getLeads = factory.getAll(Lead, {
  searchableFields: ['name', 'phone', 'email', 'city'],
  populate: { path: 'assignedTo', select: 'name email' },
});
export const getLead = factory.getOne(Lead, { populate: { path: 'assignedTo', select: 'name email' } });
export const updateLead = factory.updateOne(Lead);
export const deleteLead = factory.deleteOne(Lead);

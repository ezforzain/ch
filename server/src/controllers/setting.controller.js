import asyncHandler from 'express-async-handler';
import { Setting } from '../models/Setting.js';
import { sendResponse } from '../utils/sendResponse.js';

async function getOrCreateSettings() {
  let settings = await Setting.findOne();
  if (!settings) settings = await Setting.create({});
  return settings;
}

// @route  GET /api/v1/settings
// @access Public — the storefront reads these for contact info, WhatsApp number, etc.
export const getSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  sendResponse(res, 200, 'Settings fetched.', settings);
});

// @route  PATCH /api/v1/settings
// @access Private (admin, superadmin)
export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  Object.assign(settings, req.body);
  await settings.save();
  sendResponse(res, 200, 'Settings updated.', settings);
});

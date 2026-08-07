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
  for (const [key, value] of Object.entries(req.body)) {
    // Nested setting groups (social, branding, seo, analytics, tax, shipping, announcement)
    // are stored as single subdocuments — assigning `settings[key] = value` wholesale-replaces
    // the subdocument, silently defaulting back to '' any of its fields the caller didn't send
    // (e.g. the admin panel's Social tab only sends facebook/instagram, which used to wipe
    // youtube/linkedin on every save). Merge onto the existing subdocument instead.
    if (value && typeof value === 'object' && !Array.isArray(value) && settings[key] && typeof settings[key].toObject === 'function') {
      Object.assign(settings[key], value);
      settings.markModified(key);
    } else {
      settings[key] = value;
    }
  }
  await settings.save();
  sendResponse(res, 200, 'Settings updated.', settings);
});

import asyncHandler from 'express-async-handler';
import { ApiError } from '../utils/ApiError.js';
import { sendResponse } from '../utils/sendResponse.js';
import { storeImage, storeImages } from '../utils/storeImage.js';

// @route  POST /api/v1/uploads/image
// @access Private — generic single-image upload (e.g. for a rich-text editor), independent
// of any specific module's create/update endpoint (which handle their own image fields).
export const uploadSingle = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No file uploaded.');
  const result = await storeImage(req.file, req.body.folder || 'misc');
  sendResponse(res, 201, 'Image uploaded.', result);
});

// @route  POST /api/v1/uploads/images
// @access Private
export const uploadMultiple = asyncHandler(async (req, res) => {
  if (!req.files?.length) throw ApiError.badRequest('No files uploaded.');
  const results = await storeImages(req.files, req.body.folder || 'misc');
  sendResponse(res, 201, 'Images uploaded.', results);
});

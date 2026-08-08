import asyncHandler from 'express-async-handler';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { sendResponse } from '../utils/sendResponse.js';
import { APIFeatures } from '../utils/APIFeatures.js';
import { storeImage, deleteStoredImage } from '../utils/storeImage.js';

// @route  GET /api/v1/users?role=customer
// @access Private (admin, superadmin)
export const getUsers = asyncHandler(async (req, res) => {
  const features = new APIFeatures(User.find(), req.query, {
    searchableFields: ['name', 'email', 'phone', 'sellerProfile.businessName'],
  })
    .filter()
    .search()
    .sort()
    .limitFields();
  await features.paginate();
  const users = await features.query;
  sendResponse(res, 200, 'Users fetched.', users, features.paginationInfo);
});

// @route  GET /api/v1/users/:id
// @access Private (admin, superadmin)
export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found.');
  sendResponse(res, 200, 'User fetched.', user);
});

// @route  PATCH /api/v1/users/:id
// @access Private (admin, superadmin) — role changes to admin/superadmin require superadmin.
export const updateUser = asyncHandler(async (req, res) => {
  const { role, isActive, name, phone, 'sellerProfile.status': sellerStatus, 'sellerProfile.commissionRate': rate } =
    req.body;

  if (role && ['admin', 'superadmin'].includes(role) && req.user.role !== 'superadmin') {
    throw ApiError.forbidden('Only a super admin can grant admin privileges.');
  }

  const update = {};
  if (name !== undefined) update.name = name;
  if (phone !== undefined) update.phone = phone;
  if (role !== undefined) update.role = role;
  if (isActive !== undefined) update.isActive = isActive;
  if (sellerStatus !== undefined) update['sellerProfile.status'] = sellerStatus;
  if (rate !== undefined) update['sellerProfile.commissionRate'] = rate;

  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!user) throw ApiError.notFound('User not found.');
  sendResponse(res, 200, 'User updated.', user);
});

// @route  DELETE /api/v1/users/:id
// @access Private (superadmin only)
export const deleteUser = asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) throw ApiError.badRequest('You cannot delete your own account.');
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw ApiError.notFound('User not found.');
  sendResponse(res, 200, 'User deleted.', { id: req.params.id });
});

// @route  PATCH /api/v1/users/me
// @access Private — self-service profile update (name/phone only; role/status are admin-only).
export const updateMe = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const update = {};
  if (name !== undefined) update.name = name;
  if (phone !== undefined) update.phone = phone;

  if (req.files?.avatar?.[0]) {
    if (req.user.avatar?.publicId) await deleteStoredImage(req.user.avatar);
    update.avatar = await storeImage(req.files.avatar[0], 'avatars');
  }

  const user = await User.findByIdAndUpdate(req.user._id, update, { new: true, runValidators: true });
  // Same { user } envelope as /auth/me, /auth/login, etc. — callers (AuthContext.updateProfile)
  // apply this response straight to auth state without a second round trip to /auth/me.
  sendResponse(res, 200, 'Profile updated.', { user: user.toSafeJSON() });
});

// @route  POST /api/v1/users/me/addresses
// @access Private (customer)
export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
  user.addresses.push(req.body);
  await user.save();
  sendResponse(res, 201, 'Address added.', user.addresses);
});

// @route  DELETE /api/v1/users/me/addresses/:addressId
// @access Private (customer)
export const removeAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter((a) => String(a._id) !== req.params.addressId);
  await user.save();
  sendResponse(res, 200, 'Address removed.', user.addresses);
});

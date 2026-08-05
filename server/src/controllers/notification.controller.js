import asyncHandler from 'express-async-handler';
import { Notification } from '../models/Notification.js';
import { ApiError } from '../utils/ApiError.js';
import { sendResponse } from '../utils/sendResponse.js';
import { APIFeatures } from '../utils/APIFeatures.js';

/** Internal helper used by other controllers (orders, leads, appointments, messages)
 * to fire a notification — not an HTTP handler itself. */
export async function createNotification({ user = null, role = null, type, title, message, link = '' }) {
  return Notification.create({ user, role, type, title, message, link });
}

// @route  GET /api/v1/notifications
// @access Private — a user sees notifications addressed to them directly, or broadcast to their role.
export const getMyNotifications = asyncHandler(async (req, res) => {
  const baseFilter = { $or: [{ user: req.user._id }, { role: req.user.role }] };
  const features = new APIFeatures(Notification.find(baseFilter), req.query, {}).sort();
  await features.paginate();
  const notifications = await features.query;
  const unreadCount = await Notification.countDocuments({ ...baseFilter, isRead: false });
  sendResponse(res, 200, 'Notifications fetched.', notifications, { ...features.paginationInfo, unreadCount });
});

// @route  PATCH /api/v1/notifications/:id/read
// @access Private
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) throw ApiError.notFound('Notification not found.');
  const isMine = String(notification.user) === String(req.user._id) || notification.role === req.user.role;
  if (!isMine) throw ApiError.forbidden('This notification does not belong to you.');

  notification.isRead = true;
  await notification.save();
  sendResponse(res, 200, 'Notification marked as read.', notification);
});

// @route  PATCH /api/v1/notifications/read-all
// @access Private
export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { $or: [{ user: req.user._id }, { role: req.user.role }], isRead: false },
    { isRead: true },
  );
  sendResponse(res, 200, 'All notifications marked as read.');
});

// @route  DELETE /api/v1/notifications/:id
// @access Private
export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) throw ApiError.notFound('Notification not found.');
  const isMine = String(notification.user) === String(req.user._id) || notification.role === req.user.role;
  if (!isMine) throw ApiError.forbidden('This notification does not belong to you.');
  await notification.deleteOne();
  sendResponse(res, 200, 'Notification deleted.', { id: req.params.id });
});

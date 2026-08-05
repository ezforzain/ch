import asyncHandler from 'express-async-handler';
import { Message } from '../models/Message.js';
import { ApiError } from '../utils/ApiError.js';
import { sendResponse } from '../utils/sendResponse.js';
import { createNotification } from './notification.controller.js';
import * as factory from './handlerFactory.js';

// @route  POST /api/v1/messages
// @access Public (optionalAuth attaches `sender` when logged in)
export const createMessage = asyncHandler(async (req, res) => {
  const message = await Message.create({ ...req.body, sender: req.user?._id || null });
  await createNotification({
    role: 'admin',
    type: 'message',
    title: 'New message received',
    message: `${message.name}: ${message.subject}`,
    link: `/admin/messages/${message._id}`,
  });
  sendResponse(res, 201, 'Message sent — we will respond soon.', message);
});

export const updateMessage = factory.updateOne(Message);

export const getMessages = factory.getAll(Message, {
  searchableFields: ['name', 'email', 'subject', 'body'],
  populate: { path: 'relatedProduct', select: 'name image' },
});
export const getMessage = factory.getOne(Message, { populate: { path: 'relatedProduct', select: 'name image' } });
export const deleteMessage = factory.deleteOne(Message);

// @route  PATCH /api/v1/messages/:id/reply
// @access Private (admin, superadmin)
export const replyToMessage = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);
  if (!message) throw ApiError.notFound('Message not found.');

  message.reply = req.body.reply;
  message.status = 'replied';
  message.repliedBy = req.user._id;
  message.repliedAt = new Date();
  await message.save();

  sendResponse(res, 200, 'Reply saved.', message);
});

// @route  PATCH /api/v1/messages/:id/read
// @access Private (admin, superadmin)
export const markMessageRead = asyncHandler(async (req, res) => {
  const message = await Message.findByIdAndUpdate(req.params.id, { status: 'read' }, { new: true });
  if (!message) throw ApiError.notFound('Message not found.');
  sendResponse(res, 200, 'Message marked as read.', message);
});

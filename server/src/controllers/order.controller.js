import asyncHandler from 'express-async-handler';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { sendResponse } from '../utils/sendResponse.js';
import { APIFeatures } from '../utils/APIFeatures.js';
import { createNotification } from './notification.controller.js';

// Matches the "low stock" threshold Product.countDocuments uses for the dashboard's
// low-stock stat card (server/src/controllers/dashboard.controller.js) — kept in sync
// so an admin's low-stock notification and the dashboard count agree on what "low" means.
const LOW_STOCK_THRESHOLD = 10;

// @route  POST /api/v1/orders
// @access Private (customer)
export const createOrder = asyncHandler(async (req, res) => {
  const { items, contactName, contactPhone, shippingAddress, city, notes, paymentMethod } = req.body;
  if (!Array.isArray(items) || items.length === 0) throw ApiError.badRequest('Order must contain at least one item.');

  const resolvedItems = [];
  let subtotal = 0;

  for (const line of items) {
    const product = await Product.findById(line.productId);
    if (!product) throw ApiError.badRequest(`Product ${line.productId} no longer exists.`);
    if (product.status !== 'active') throw ApiError.badRequest(`"${product.name}" is not currently available.`);
    const qty = Math.max(1, Number(line.qty) || 1);
    if (product.stock < qty) throw ApiError.badRequest(`Only ${product.stock} of "${product.name}" left in stock.`);

    resolvedItems.push({
      product: product._id,
      name: product.name,
      image: product.image?.url || '',
      price: product.price,
      qty,
      seller: product.seller,
    });
    subtotal += product.price * qty;

    product.stock -= qty;
    product.popularity += qty;
    await product.save({ validateBeforeSave: false });

    if (product.stock <= LOW_STOCK_THRESHOLD) {
      await createNotification({
        role: 'admin',
        type: 'system',
        title: product.stock === 0 ? 'Product out of stock' : 'Low stock alert',
        message:
          product.stock === 0
            ? `"${product.name}" is now out of stock.`
            : `"${product.name}" is low on stock — only ${product.stock} left.`,
        link: `/admin/products`,
      });
    }
  }

  const order = await Order.create({
    customer: req.user._id,
    items: resolvedItems,
    subtotal,
    total: subtotal,
    contactName,
    contactPhone,
    shippingAddress,
    city,
    notes,
    paymentMethod,
  });

  await createNotification({
    user: null, // broadcast to admins
    role: 'admin',
    type: 'order',
    title: 'New order received',
    message: `Order ${order.orderNumber} placed by ${contactName} — ${resolvedItems.length} item(s).`,
    link: `/admin/orders/${order._id}`,
  });

  sendResponse(res, 201, 'Order placed successfully.', order);
});

// @route  GET /api/v1/orders/me
// @access Private (customer)
export const getMyOrders = asyncHandler(async (req, res) => {
  const features = new APIFeatures(Order.find({ customer: req.user._id }), req.query, {}).filter().sort();
  await features.paginate();
  const orders = await features.query;
  sendResponse(res, 200, 'Your orders fetched.', orders, features.paginationInfo);
});

// @route  GET /api/v1/orders/seller
// @access Private (seller) — returns any order containing at least one of the seller's items.
// Simplification: the full order (incl. any other sellers' items in the same cart) is returned;
// a seller-scoped line-item view can be layered on later if multi-seller carts need splitting.
export const getSellerOrders = asyncHandler(async (req, res) => {
  const features = new APIFeatures(Order.find({ 'items.seller': req.user._id }), req.query, {}).filter().sort();
  await features.paginate();
  const orders = await features.query;
  sendResponse(res, 200, 'Seller orders fetched.', orders, features.paginationInfo);
});

// @route  GET /api/v1/orders
// @access Private (admin, superadmin)
export const getOrders = asyncHandler(async (req, res) => {
  const features = new APIFeatures(Order.find().populate('customer', 'name email phone'), req.query, {
    searchableFields: ['orderNumber', 'contactName', 'contactPhone'],
  })
    .filter()
    .search()
    .sort();
  await features.paginate();
  const orders = await features.query;
  sendResponse(res, 200, 'Orders fetched.', orders, features.paginationInfo);
});

// @route  GET /api/v1/orders/:id
// @access Private (owner customer, involved seller, or admin/superadmin)
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('customer', 'name email phone');
  if (!order) throw ApiError.notFound('Order not found.');

  const isOwner = String(order.customer._id) === String(req.user._id);
  const isInvolvedSeller = req.user.role === 'seller' && order.items.some((i) => String(i.seller) === String(req.user._id));
  const isStaff = ['admin', 'superadmin'].includes(req.user.role);
  if (!isOwner && !isInvolvedSeller && !isStaff) throw ApiError.forbidden('You cannot view this order.');

  sendResponse(res, 200, 'Order fetched.', order);
});

// @route  PATCH /api/v1/orders/:id/status
// @access Private (admin, superadmin)
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, paymentStatus } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('Order not found.');

  if (status) order.status = status;
  if (paymentStatus) order.paymentStatus = paymentStatus;
  await order.save();

  await createNotification({
    user: order.customer,
    type: 'order',
    title: 'Order status updated',
    message: `Your order ${order.orderNumber} is now "${order.status}".`,
    link: `/orders/${order._id}`,
  });

  sendResponse(res, 200, 'Order status updated.', order);
});

// @route  DELETE /api/v1/orders/:id
// @access Private (admin, superadmin) — for correcting genuine mistakes (test/duplicate
// orders); does not restock items, since a real order being deleted after the fact is rare
// enough that automatic restocking would more often be wrong than right.
export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndDelete(req.params.id);
  if (!order) throw ApiError.notFound('Order not found.');
  sendResponse(res, 200, 'Order deleted.', { id: req.params.id });
});

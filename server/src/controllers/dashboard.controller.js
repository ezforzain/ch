import asyncHandler from 'express-async-handler';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { Lead } from '../models/Lead.js';
import { Appointment } from '../models/Appointment.js';
import { sendResponse } from '../utils/sendResponse.js';

// Sellers only ever see figures scoped to their own listings/orders; staff see everything.
function scopeFor(req) {
  return req.user.role === 'seller' ? { seller: req.user._id } : {};
}

// @route  GET /api/v1/dashboard/summary
// @access Private (admin, superadmin, seller)
export const getSummary = asyncHandler(async (req, res) => {
  const isSeller = req.user.role === 'seller';
  const productFilter = scopeFor(req);
  const orderFilter = isSeller ? { 'items.seller': req.user._id } : {};

  const [productCount, activeProducts, lowStock, orders, customerCount, sellerCount, newLeads, pendingAppointments] =
    await Promise.all([
      Product.countDocuments(productFilter),
      Product.countDocuments({ ...productFilter, status: 'active' }),
      Product.countDocuments({ ...productFilter, stock: { $lte: 10, $gt: 0 } }),
      Order.find(orderFilter),
      isSeller ? Promise.resolve(null) : User.countDocuments({ role: 'customer' }),
      isSeller ? Promise.resolve(null) : User.countDocuments({ role: 'seller' }),
      isSeller ? Promise.resolve(null) : Lead.countDocuments({ status: 'new' }),
      isSeller ? Promise.resolve(null) : Appointment.countDocuments({ status: 'pending' }),
    ]);

  let revenue = 0;
  for (const order of orders) {
    if (isSeller) {
      for (const item of order.items) {
        if (String(item.seller) === String(req.user._id)) revenue += item.price * item.qty;
      }
    } else {
      revenue += order.total;
    }
  }

  sendResponse(res, 200, 'Dashboard summary fetched.', {
    productCount,
    activeProducts,
    lowStockProducts: lowStock,
    orderCount: orders.length,
    revenue,
    ...(isSeller ? {} : { customerCount, sellerCount, newLeads, pendingAppointments }),
  });
});

// @route  GET /api/v1/dashboard/sales-trend?days=30
// @access Private (admin, superadmin, seller)
export const getSalesTrend = asyncHandler(async (req, res) => {
  const days = Math.min(365, Math.max(7, Number(req.query.days) || 30));
  const since = new Date(Date.now() - days * 86400000);
  const isSeller = req.user.role === 'seller';

  const pipeline = [
    { $match: { createdAt: { $gte: since }, ...(isSeller ? { 'items.seller': req.user._id } : {}) } },
    ...(isSeller
      ? [
          { $unwind: '$items' },
          { $match: { 'items.seller': req.user._id } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
              orders: { $addToSet: '$_id' },
            },
          },
          { $project: { revenue: 1, orders: { $size: '$orders' } } },
        ]
      : [
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              revenue: { $sum: '$total' },
              orders: { $sum: 1 },
            },
          },
        ]),
    { $sort: { _id: 1 } },
  ];

  const rows = await Order.aggregate(pipeline);
  sendResponse(
    res,
    200,
    'Sales trend fetched.',
    rows.map((r) => ({ date: r._id, revenue: r.revenue, orders: r.orders })),
  );
});

// @route  GET /api/v1/dashboard/top-products?limit=5
// @access Private (admin, superadmin, seller)
export const getTopProducts = asyncHandler(async (req, res) => {
  const limit = Math.min(20, Math.max(1, Number(req.query.limit) || 5));
  const products = await Product.find(scopeFor(req))
    .sort('-popularity')
    .limit(limit)
    .select('name image price popularity stock rating');
  sendResponse(res, 200, 'Top products fetched.', products);
});

// @route  GET /api/v1/dashboard/order-status-breakdown
// @access Private (admin, superadmin, seller)
export const getOrderStatusBreakdown = asyncHandler(async (req, res) => {
  const isSeller = req.user.role === 'seller';
  const pipeline = [
    ...(isSeller ? [{ $match: { 'items.seller': req.user._id } }] : []),
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ];
  const rows = await Order.aggregate(pipeline);
  sendResponse(
    res,
    200,
    'Order status breakdown fetched.',
    rows.map((r) => ({ status: r._id, count: r.count })),
  );
});

import asyncHandler from 'express-async-handler';
import { Order } from '../models/Order.js';
import { Lead } from '../models/Lead.js';
import { Appointment } from '../models/Appointment.js';
import { User } from '../models/User.js';
import { sendResponse } from '../utils/sendResponse.js';

function dateRange(req) {
  const from = req.query.from ? new Date(req.query.from) : new Date(Date.now() - 30 * 86400000);
  const to = req.query.to ? new Date(req.query.to) : new Date();
  return { from, to };
}

// @route  GET /api/v1/reports/sales?from=&to=
// @access Private (admin, superadmin)
export const salesReport = asyncHandler(async (req, res) => {
  const { from, to } = dateRange(req);
  const [totals] = await Order.aggregate([
    { $match: { createdAt: { $gte: from, $lte: to } } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$total' },
        avgOrderValue: { $avg: '$total' },
      },
    },
  ]);

  const byStatus = await Order.aggregate([
    { $match: { createdAt: { $gte: from, $lte: to } } },
    { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$total' } } },
  ]);

  sendResponse(res, 200, 'Sales report generated.', {
    range: { from, to },
    totals: totals || { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 },
    byStatus: byStatus.map((r) => ({ status: r._id, count: r.count, revenue: r.revenue })),
  });
});

// @route  GET /api/v1/reports/leads?from=&to=
// @access Private (admin, superadmin)
export const leadsReport = asyncHandler(async (req, res) => {
  const { from, to } = dateRange(req);
  const [byStatus, bySource] = await Promise.all([
    Lead.aggregate([{ $match: { createdAt: { $gte: from, $lte: to } } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Lead.aggregate([{ $match: { createdAt: { $gte: from, $lte: to } } }, { $group: { _id: '$source', count: { $sum: 1 } } }]),
  ]);
  const total = await Lead.countDocuments({ createdAt: { $gte: from, $lte: to } });

  sendResponse(res, 200, 'Leads report generated.', {
    range: { from, to },
    total,
    byStatus: byStatus.map((r) => ({ status: r._id, count: r.count })),
    bySource: bySource.map((r) => ({ source: r._id, count: r.count })),
  });
});

// @route  GET /api/v1/reports/appointments?from=&to=
// @access Private (admin, superadmin)
export const appointmentsReport = asyncHandler(async (req, res) => {
  const { from, to } = dateRange(req);
  const byStatus = await Appointment.aggregate([
    { $match: { createdAt: { $gte: from, $lte: to } } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const total = await Appointment.countDocuments({ createdAt: { $gte: from, $lte: to } });

  sendResponse(res, 200, 'Appointments report generated.', {
    range: { from, to },
    total,
    byStatus: byStatus.map((r) => ({ status: r._id, count: r.count })),
  });
});

// @route  GET /api/v1/reports/users-growth?from=&to=
// @access Private (admin, superadmin)
export const usersGrowthReport = asyncHandler(async (req, res) => {
  const { from, to } = dateRange(req);
  const rows = await User.aggregate([
    { $match: { createdAt: { $gte: from, $lte: to } } },
    {
      $group: {
        _id: { date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, role: '$role' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.date': 1 } },
  ]);

  sendResponse(
    res,
    200,
    'User growth report generated.',
    rows.map((r) => ({ date: r._id.date, role: r._id.role, count: r.count })),
  );
});

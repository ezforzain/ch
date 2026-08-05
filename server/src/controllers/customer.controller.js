import asyncHandler from 'express-async-handler';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { ApiError } from '../utils/ApiError.js';
import { sendResponse } from '../utils/sendResponse.js';
import { APIFeatures } from '../utils/APIFeatures.js';

// @route  GET /api/v1/customers
// @access Private (admin, superadmin)
export const getCustomers = asyncHandler(async (req, res) => {
  const features = new APIFeatures(User.find({ role: 'customer' }), req.query, {
    searchableFields: ['name', 'email', 'phone'],
  })
    .filter()
    .search()
    .sort();
  await features.paginate();
  const customers = await features.query;
  sendResponse(res, 200, 'Customers fetched.', customers, features.paginationInfo);
});

// @route  GET /api/v1/customers/:id
// @access Private (admin, superadmin)
export const getCustomer = asyncHandler(async (req, res) => {
  const customer = await User.findOne({ _id: req.params.id, role: 'customer' });
  if (!customer) throw ApiError.notFound('Customer not found.');

  const orders = await Order.find({ customer: customer._id }).sort('-createdAt');
  const totalSpend = orders.reduce((sum, o) => sum + o.total, 0);

  sendResponse(res, 200, 'Customer fetched.', {
    customer,
    stats: { orderCount: orders.length, totalSpend },
    recentOrders: orders.slice(0, 5),
  });
});

import asyncHandler from 'express-async-handler';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { ApiError } from '../utils/ApiError.js';
import { sendResponse } from '../utils/sendResponse.js';
import { APIFeatures } from '../utils/APIFeatures.js';
import { createNotification } from './notification.controller.js';

// @route  GET /api/v1/sellers
// @access Private (admin, superadmin)
export const getSellers = asyncHandler(async (req, res) => {
  const features = new APIFeatures(User.find({ role: 'seller' }), req.query, {
    searchableFields: ['name', 'email', 'phone', 'sellerProfile.businessName'],
  })
    .filter()
    .search()
    .sort();
  await features.paginate();
  const sellers = await features.query;
  sendResponse(res, 200, 'Sellers fetched.', sellers, features.paginationInfo);
});

// @route  GET /api/v1/sellers/:id
// @access Private (admin, superadmin)
export const getSeller = asyncHandler(async (req, res) => {
  const seller = await User.findOne({ _id: req.params.id, role: 'seller' });
  if (!seller) throw ApiError.notFound('Seller not found.');
  sendResponse(res, 200, 'Seller fetched.', seller);
});

// @route  GET /api/v1/sellers/me/stats
// @access Private (seller)
export const getMySellerStats = asyncHandler(async (req, res) => {
  const [productCount, activeProductCount, orders] = await Promise.all([
    Product.countDocuments({ seller: req.user._id }),
    Product.countDocuments({ seller: req.user._id, status: 'active' }),
    Order.find({ 'items.seller': req.user._id }),
  ]);

  let revenue = 0;
  let unitsSold = 0;
  for (const order of orders) {
    for (const item of order.items) {
      if (String(item.seller) === String(req.user._id)) {
        revenue += item.price * item.qty;
        unitsSold += item.qty;
      }
    }
  }

  sendResponse(res, 200, 'Seller stats fetched.', {
    productCount,
    activeProductCount,
    orderCount: orders.length,
    unitsSold,
    revenue,
  });
});

// @route  PATCH /api/v1/sellers/:id/status
// @access Private (admin, superadmin)
export const updateSellerStatus = asyncHandler(async (req, res) => {
  const { status } = req.body; // 'approved' | 'rejected' | 'suspended' | 'pending'
  const seller = await User.findOneAndUpdate(
    { _id: req.params.id, role: 'seller' },
    { 'sellerProfile.status': status },
    { new: true, runValidators: true },
  );
  if (!seller) throw ApiError.notFound('Seller not found.');

  await createNotification({
    user: seller._id,
    type: 'system',
    title: 'Seller account status updated',
    message: `Your seller account status is now "${status}".`,
  });

  sendResponse(res, 200, 'Seller status updated.', seller);
});

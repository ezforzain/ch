import asyncHandler from 'express-async-handler';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { sendResponse } from '../utils/sendResponse.js';
import { storeImage, storeImages, deleteStoredImage } from '../utils/storeImage.js';
import * as factory from './handlerFactory.js';

export const getProducts = factory.getAll(Product, {
  searchableFields: ['name', 'description', 'brand', 'tag'],
  populate: [
    { path: 'category', select: 'name slug' },
    { path: 'seller', select: 'name sellerProfile.businessName' },
  ],
});

export const getProduct = factory.getOne(Product, {
  populate: [
    { path: 'category', select: 'name slug' },
    { path: 'seller', select: 'name sellerProfile.businessName' },
  ],
});

// Sellers may only create/update/delete their own listings; admins/superadmin may touch any.
async function assertOwnership(req, product) {
  if (['admin', 'superadmin'].includes(req.user.role)) return;
  if (req.user.role === 'seller' && String(product.seller) === String(req.user._id)) return;
  throw ApiError.forbidden('You can only manage your own products.');
}

export const createProduct = asyncHandler(async (req, res) => {
  const files = req.files || {};
  if (!files.image?.[0]) throw ApiError.badRequest('A main product image is required.');

  const image = await storeImage(files.image[0], 'products');
  const gallery = files.gallery?.length ? await storeImages(files.gallery, 'products') : [image];

  const payload = { ...req.body, image, gallery };
  if (req.body.specs) payload.specs = typeof req.body.specs === 'string' ? JSON.parse(req.body.specs) : req.body.specs;

  if (req.user.role === 'seller') {
    payload.seller = req.user._id;
  } // admins may set `seller` explicitly in the body (or omit it for first-party stock)

  const product = await Product.create(payload);
  sendResponse(res, 201, 'Product created.', product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found.');
  await assertOwnership(req, product);

  const files = req.files || {};
  const payload = { ...req.body };
  if (req.body.specs) payload.specs = typeof req.body.specs === 'string' ? JSON.parse(req.body.specs) : req.body.specs;

  if (files.image?.[0]) {
    await deleteStoredImage(product.image);
    payload.image = await storeImage(files.image[0], 'products');
  }
  if (files.gallery?.length) {
    payload.gallery = await storeImages(files.gallery, 'products');
  }

  Object.assign(product, payload);
  await product.save();
  sendResponse(res, 200, 'Product updated.', product);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found.');
  await assertOwnership(req, product);

  await deleteStoredImage(product.image);
  await Promise.all((product.gallery || []).map((img) => deleteStoredImage(img)));
  await product.deleteOne();

  sendResponse(res, 200, 'Product deleted.', { id: req.params.id });
});

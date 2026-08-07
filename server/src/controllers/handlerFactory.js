import asyncHandler from 'express-async-handler';
import { ApiError } from '../utils/ApiError.js';
import { sendResponse } from '../utils/sendResponse.js';
import { APIFeatures } from '../utils/APIFeatures.js';
import { storeImage, deleteStoredImage } from '../utils/storeImage.js';

/**
 * Generic CRUD handlers shared by every simple module (Category, Product, Lead,
 * Project, Service, BlogPost, GalleryItem, Testimonial, TeamMember, City, FAQ,
 * Notification, Setting...). Each module's controller composes these with its
 * own Mongoose model + a couple of module-specific options, instead of every
 * module hand-rolling near-identical list/get/create/update/delete logic.
 */

export function getAll(Model, { searchableFields = [], populate = null, label, filter: staticFilter } = {}) {
  return asyncHandler(async (req, res) => {
    let baseQuery = Model.find(staticFilter ? staticFilter(req) : {});
    const features = new APIFeatures(baseQuery, req.query, { searchableFields }).filter().search().sort().limitFields();
    await features.paginate();
    if (populate) features.query = features.query.populate(populate);
    const docs = await features.query;
    sendResponse(res, 200, `${label || Model.modelName} list fetched.`, docs, features.paginationInfo);
  });
}

export function getOne(Model, { populate = null, label } = {}) {
  return asyncHandler(async (req, res) => {
    let query = Model.findById(req.params.id);
    if (populate) query = query.populate(populate);
    const doc = await query;
    if (!doc) throw ApiError.notFound(`${label || Model.modelName} not found.`);
    sendResponse(res, 200, `${label || Model.modelName} fetched.`, doc);
  });
}

export function createOne(Model, { label, transform } = {}) {
  return asyncHandler(async (req, res) => {
    const payload = transform ? await transform(req) : req.body;
    const doc = await Model.create(payload);
    sendResponse(res, 201, `${label || Model.modelName} created.`, doc);
  });
}

export function updateOne(Model, { label, transform } = {}) {
  return asyncHandler(async (req, res) => {
    const payload = transform ? await transform(req) : req.body;
    const doc = await Model.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!doc) throw ApiError.notFound(`${label || Model.modelName} not found.`);
    sendResponse(res, 200, `${label || Model.modelName} updated.`, doc);
  });
}

/** Same as createOne, but pulls one-or-more image fields (multer memoryStorage files)
 * off req.files and stores them via storeImage() before saving — used by every module
 * whose schema has an image (Project, GalleryItem, TeamMember, BlogPost, Testimonial). */
export function createOneWithImages(Model, { folder, fileFields = ['image'], label, populate = null } = {}) {
  return asyncHandler(async (req, res) => {
    const payload = { ...req.body };
    const files = req.files || {};
    for (const field of fileFields) {
      if (files[field]?.[0]) payload[field] = await storeImage(files[field][0], folder);
    }
    let doc = await Model.create(payload);
    if (populate) doc = await doc.populate(populate);
    sendResponse(res, 201, `${label || Model.modelName} created.`, doc);
  });
}

export function updateOneWithImages(Model, { folder, fileFields = ['image'], label, populate = null } = {}) {
  return asyncHandler(async (req, res) => {
    const doc = await Model.findById(req.params.id);
    if (!doc) throw ApiError.notFound(`${label || Model.modelName} not found.`);

    const payload = { ...req.body };
    const files = req.files || {};
    for (const field of fileFields) {
      if (files[field]?.[0]) {
        if (doc[field]?.publicId) await deleteStoredImage(doc[field]);
        payload[field] = await storeImage(files[field][0], folder);
      }
    }
    Object.assign(doc, payload);
    await doc.save();
    if (populate) await doc.populate(populate);
    sendResponse(res, 200, `${label || Model.modelName} updated.`, doc);
  });
}

export function deleteOne(Model, { label } = {}) {
  return asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) throw ApiError.notFound(`${label || Model.modelName} not found.`);
    sendResponse(res, 200, `${label || Model.modelName} deleted.`, { id: req.params.id });
  });
}

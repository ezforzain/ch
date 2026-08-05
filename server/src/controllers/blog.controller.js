import asyncHandler from 'express-async-handler';
import { BlogPost } from '../models/BlogPost.js';
import { ApiError } from '../utils/ApiError.js';
import { sendResponse } from '../utils/sendResponse.js';
import { storeImage } from '../utils/storeImage.js';
import * as factory from './handlerFactory.js';

const imageOpts = { folder: 'blog', fileFields: ['coverImage'] };

export const getPosts = factory.getAll(BlogPost, {
  searchableFields: ['title', 'excerpt', 'content', 'tags'],
  populate: { path: 'author', select: 'name avatar' },
});
export const getPost = factory.getOne(BlogPost, { populate: { path: 'author', select: 'name avatar' } });

export const createPost = asyncHandler(async (req, res) => {
  const files = req.files || {};
  const payload = { ...req.body, author: req.user._id };
  if (Array.isArray(req.body.tags) === false && req.body.tags) payload.tags = req.body.tags.split(',').map((t) => t.trim());
  if (files.coverImage?.[0]) {
    payload.coverImage = await storeImage(files.coverImage[0], 'blog');
  }
  const post = await BlogPost.create(payload);
  sendResponse(res, 201, 'Blog post created.', post);
});

export const updatePost = factory.updateOneWithImages(BlogPost, imageOpts);
export const deletePost = factory.deleteOne(BlogPost);

// @route  GET /api/v1/blog/slug/:slug
// @access Public — also bumps the view counter, matching a typical blog reader endpoint.
export const getPostBySlug = asyncHandler(async (req, res) => {
  const post = await BlogPost.findOneAndUpdate(
    { slug: req.params.slug, isPublished: true },
    { $inc: { views: 1 } },
    { new: true },
  ).populate('author', 'name avatar');
  if (!post) throw ApiError.notFound('Blog post not found.');
  sendResponse(res, 200, 'Blog post fetched.', post);
});

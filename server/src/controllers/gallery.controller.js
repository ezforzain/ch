import { GalleryItem } from '../models/GalleryItem.js';
import * as factory from './handlerFactory.js';

const imageOpts = { folder: 'gallery', fileFields: ['image'] };

export const getGalleryItems = factory.getAll(GalleryItem, { searchableFields: ['title', 'category'] });
export const getGalleryItem = factory.getOne(GalleryItem);
export const createGalleryItem = factory.createOneWithImages(GalleryItem, imageOpts);
export const updateGalleryItem = factory.updateOneWithImages(GalleryItem, imageOpts);
export const deleteGalleryItem = factory.deleteOne(GalleryItem);

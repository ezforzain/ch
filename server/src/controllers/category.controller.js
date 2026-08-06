import { Category } from '../models/Category.js';
import * as factory from './handlerFactory.js';

const imageOpts = { folder: 'categories', fileFields: ['image'] };

export const getCategories = factory.getAll(Category, { searchableFields: ['name', 'description'] });
export const getCategory = factory.getOne(Category);
export const createCategory = factory.createOneWithImages(Category, imageOpts);
export const updateCategory = factory.updateOneWithImages(Category, imageOpts);
export const deleteCategory = factory.deleteOne(Category);

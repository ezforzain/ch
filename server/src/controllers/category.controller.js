import { Category } from '../models/Category.js';
import * as factory from './handlerFactory.js';

export const getCategories = factory.getAll(Category, { searchableFields: ['name', 'description'] });
export const getCategory = factory.getOne(Category);
export const createCategory = factory.createOne(Category);
export const updateCategory = factory.updateOne(Category);
export const deleteCategory = factory.deleteOne(Category);

import { FAQ } from '../models/FAQ.js';
import * as factory from './handlerFactory.js';

export const getFAQs = factory.getAll(FAQ, { searchableFields: ['question', 'answer', 'category'] });
export const getFAQ = factory.getOne(FAQ);
export const createFAQ = factory.createOne(FAQ);
export const updateFAQ = factory.updateOne(FAQ);
export const deleteFAQ = factory.deleteOne(FAQ);

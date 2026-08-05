import { Service } from '../models/Service.js';
import * as factory from './handlerFactory.js';

const imageOpts = { folder: 'services', fileFields: ['image'] };

export const getServices = factory.getAll(Service, { searchableFields: ['name', 'description'] });
export const getService = factory.getOne(Service);
export const createService = factory.createOneWithImages(Service, imageOpts);
export const updateService = factory.updateOneWithImages(Service, imageOpts);
export const deleteService = factory.deleteOne(Service);

import { City } from '../models/City.js';
import * as factory from './handlerFactory.js';

export const getCities = factory.getAll(City, { searchableFields: ['name', 'province'] });
export const getCity = factory.getOne(City);
export const createCity = factory.createOne(City);
export const updateCity = factory.updateOne(City);
export const deleteCity = factory.deleteOne(City);

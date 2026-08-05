import { Testimonial } from '../models/Testimonial.js';
import * as factory from './handlerFactory.js';

const imageOpts = { folder: 'testimonials', fileFields: ['portrait'] };

export const getTestimonials = factory.getAll(Testimonial, { searchableFields: ['name', 'quote', 'location'] });
export const getTestimonial = factory.getOne(Testimonial);
export const createTestimonial = factory.createOneWithImages(Testimonial, imageOpts);
export const updateTestimonial = factory.updateOneWithImages(Testimonial, imageOpts);
export const deleteTestimonial = factory.deleteOne(Testimonial);

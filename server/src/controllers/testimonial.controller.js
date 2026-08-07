import { Testimonial } from '../models/Testimonial.js';
import * as factory from './handlerFactory.js';

const imageOpts = { folder: 'testimonials', fileFields: ['portrait'] };

const relatedProjectPopulate = { path: 'relatedProject', select: 'title image size location completionTime result' };

export const getTestimonials = factory.getAll(Testimonial, {
  searchableFields: ['name', 'quote', 'location'],
  populate: relatedProjectPopulate,
});
export const getTestimonial = factory.getOne(Testimonial, { populate: relatedProjectPopulate });
export const createTestimonial = factory.createOneWithImages(Testimonial, imageOpts);
export const updateTestimonial = factory.updateOneWithImages(Testimonial, imageOpts);
export const deleteTestimonial = factory.deleteOne(Testimonial);

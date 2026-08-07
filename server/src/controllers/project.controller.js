import { Project } from '../models/Project.js';
import * as factory from './handlerFactory.js';

const imageOpts = { folder: 'projects', fileFields: ['image', 'beforeImage'] };
const locationPopulate = { path: 'location', select: 'name province' };

export const getProjects = factory.getAll(Project, { searchableFields: ['title'], populate: locationPopulate });
export const getProject = factory.getOne(Project, { populate: locationPopulate });
export const createProject = factory.createOneWithImages(Project, { ...imageOpts, populate: locationPopulate });
export const updateProject = factory.updateOneWithImages(Project, { ...imageOpts, populate: locationPopulate });
export const deleteProject = factory.deleteOne(Project);

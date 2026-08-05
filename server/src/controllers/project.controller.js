import { Project } from '../models/Project.js';
import * as factory from './handlerFactory.js';

const imageOpts = { folder: 'projects', fileFields: ['image', 'beforeImage'] };

export const getProjects = factory.getAll(Project, { searchableFields: ['title', 'location'] });
export const getProject = factory.getOne(Project);
export const createProject = factory.createOneWithImages(Project, imageOpts);
export const updateProject = factory.updateOneWithImages(Project, imageOpts);
export const deleteProject = factory.deleteOne(Project);

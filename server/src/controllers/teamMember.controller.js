import { TeamMember } from '../models/TeamMember.js';
import * as factory from './handlerFactory.js';

const imageOpts = { folder: 'team', fileFields: ['photo'] };

export const getTeamMembers = factory.getAll(TeamMember, { searchableFields: ['name', 'role'] });
export const getTeamMember = factory.getOne(TeamMember);
export const createTeamMember = factory.createOneWithImages(TeamMember, imageOpts);
export const updateTeamMember = factory.updateOneWithImages(TeamMember, imageOpts);
export const deleteTeamMember = factory.deleteOne(TeamMember);

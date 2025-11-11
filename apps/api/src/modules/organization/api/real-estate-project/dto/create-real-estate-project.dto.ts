import { type NewOrgRealEstateProject } from '@repo/database/schema';

export type CreateRealEstateProjectDto = Omit<
  NewOrgRealEstateProject,
  'organizationId'
>;

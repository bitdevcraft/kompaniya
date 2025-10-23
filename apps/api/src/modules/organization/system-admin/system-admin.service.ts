import { Injectable } from '@nestjs/common';

import { OrganizationRepositoryService } from '~/modules/database/repository/organization-repository/organization-repository.service';

@Injectable()
export class SystemAdminService {
  constructor(
    private readonly organizationRepositoryService: OrganizationRepositoryService,
  ) {}

  async getActiveOrganization(userId: string) {
    return this.organizationRepositoryService.getActiveOrganization(userId);
  }
}

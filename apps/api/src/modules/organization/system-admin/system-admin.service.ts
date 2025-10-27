import { Injectable } from '@nestjs/common';

import { OrganizationRepositoryService } from '~/modules/database/repository/organization-repository/organization-repository.service';
import { UserRepositoryService } from '~/modules/database/repository/user-repository/user-repository.service';

@Injectable()
export class SystemAdminService {
  constructor(
    private readonly organizationRepositoryService: OrganizationRepositoryService,
    private readonly userRepositoryService: UserRepositoryService,
  ) {}

  async deactivateUser(userId: string) {
    return this.userRepositoryService.deactivateUser(userId);
  }

  async getActiveOrganization(userId: string) {
    return this.organizationRepositoryService.getActiveOrganization(userId);
  }

  async getUserById(userId: string) {
    return this.userRepositoryService.getUser(userId);
  }
}

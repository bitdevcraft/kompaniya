import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

import { OrganizationRepositoryService } from '~/modules/core/database/repository/organization-repository/organization-repository.service';

@Injectable()
export class ActiveOrganizationGuard implements CanActivate {
  constructor(
    private readonly organizationRepository: OrganizationRepositoryService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context
      .switchToHttp()
      .getRequest<Request & { session: { user: { id: string } } }>();
    const organization =
      await this.organizationRepository.getActiveOrganization(
        request.session.user.id,
      );

    if (!organization) {
      throw new BadRequestException('Admin Session has no Organization');
    }

    request.activeOrganization = organization;
    return true;
  }
}

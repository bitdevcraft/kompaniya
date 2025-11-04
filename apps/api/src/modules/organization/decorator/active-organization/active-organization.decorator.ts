import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { Organization } from '@repo/database/schema';

export const ActiveOrganization = createParamDecorator(
  (
    selector: ((organization: Organization) => any) | undefined,
    ctx: ExecutionContext,
  ) => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { activeOrganization?: Organization }>();
    const organization = request.activeOrganization;
    if (!organization) {
      throw new InternalServerErrorException(
        'Active organization missing from request. Ensure ActiveOrganizationGuard is applied.',
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return selector ? selector(organization) : organization;
  },
);

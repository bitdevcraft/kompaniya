import { Injectable } from '@nestjs/common';
import { OrganizationData } from '@repo/shared';
import { AuthHookContext, AuthService } from '@thallesp/nestjs-better-auth';
import { nanoid } from 'nanoid';
import { convertCase } from 'src/utils/string-convert-case';

import { auth } from '../../auth';

@Injectable()
export class SignUpService {
  constructor(private authService: AuthService<typeof auth>) {}

  async createOrganization(ctx: AuthHookContext) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    const organization = JSON.parse(ctx.body.metadata) as OrganizationData;
    await this.authService.api.createOrganization({
      body: {
        name: organization.companyName,
        slug: `${convertCase(organization.companyName, 'sentence', 'kebab')}-(${nanoid()})`,
        organizationSize: organization.companySize,
        industry: organization.industry,
      },
      headers: ctx.headers,
    });
  }
}

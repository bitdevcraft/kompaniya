import { Injectable } from '@nestjs/common';
import { organizationSchema } from '@repo/shared';
import {
  AfterHook,
  type AuthHookContext,
  AuthService,
  Hook,
} from '@thallesp/nestjs-better-auth';
import { APIError } from 'better-auth';
import { nanoid } from 'nanoid';

import { OrganizationRepositoryService } from '~/modules/database/repository/organization-repository/organization-repository.service';
import { SessionRepositoryService } from '~/modules/database/repository/session-repository/session-repository.service';
import { convertCase } from '~/utils/string-convert-case';

import { auth } from '../auth';

@Hook()
@Injectable()
export class SignInHook {
  constructor(
    private readonly sessionRepositoryService: SessionRepositoryService,
    private readonly organizationRepositoryService: OrganizationRepositoryService,
    private authService: AuthService<typeof auth>,
  ) {}
  @AfterHook('/sign-in/email')
  async afterSignIn(ctx: AuthHookContext) {
    const tokenCookie = ctx.context.authCookies.sessionToken.name;

    const token = await ctx.getSignedCookie(tokenCookie, ctx.context.secret);

    if (!token) return;

    const session =
      await this.sessionRepositoryService.getUserSessionByToken(token);

    if (!session?.user) {
      throw new APIError('UNAUTHORIZED', {
        message: 'No Session',
      });
    }

    const activeOrg =
      await this.organizationRepositoryService.getActiveOrganization(
        session.user.id,
      );

    if (activeOrg) {
      return;
    }

    const organization = organizationSchema.safeParse(session.user?.metadata);

    if (organization.error) {
      throw new APIError('BAD_REQUEST', {
        message: 'No Onboarding data',
      });
    }

    await this.authService.api.createOrganization({
      body: {
        name: organization.data.companyName,
        slug: `${convertCase(organization.data.companyName, 'sentence', 'kebab')}-(${nanoid()})`,
        organizationSize: organization.data.companySize,
        industry: organization.data.industry,
      },
      headers: ctx.headers,
    });
  }
}

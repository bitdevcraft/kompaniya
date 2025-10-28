import { Injectable } from '@nestjs/common';
import { OrganizationData, organizationSchema } from '@repo/shared';
import {
  AfterHook,
  type AuthHookContext,
  AuthService,
  Hook,
} from '@thallesp/nestjs-better-auth';
import { APIError } from 'better-auth';
import { nanoid } from 'nanoid';

import { OrganizationRepositoryService } from '~/modules/core/database/repository/organization-repository/organization-repository.service';
import { SessionRepositoryService } from '~/modules/core/database/repository/session-repository/session-repository.service';
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

    let token = await ctx.getSignedCookie(tokenCookie, ctx.context.secret);

    if (!token) {
      token = ctx.context.newSession?.session.token ?? null;
    }

    if (!token) return;

    const session =
      await this.sessionRepositoryService.getUserSessionByToken(token);

    if (!session?.user?.active) {
      throw new APIError('UNAUTHORIZED', {
        message: 'No Session',
      });
    }

    const orgExist = await this.hasExistingOrganization(ctx, session.user.id);

    if (orgExist) return;

    const organization = organizationSchema.safeParse(session.user.metadata);

    if (organization.error) {
      throw new APIError('UNAUTHORIZED', {
        message: 'No Session',
      });
    }

    await this.createNewOrganization(ctx, organization.data);
  }

  private async createNewOrganization(
    ctx: AuthHookContext,
    organization: OrganizationData,
  ) {
    const newOrg = await this.authService.api.createOrganization({
      body: {
        name: organization.companyName,
        slug: `${convertCase(organization.companyName, 'sentence', 'kebab')}-(${nanoid()})`,
        organizationSize: organization.companySize,
        industry: organization.industry,
      },
      headers: ctx.headers,
    });

    if (newOrg) {
      await this.authService.api.setActiveOrganization({
        body: {
          organizationId: newOrg.id,
          organizationSlug: newOrg.slug,
        },
        headers: ctx.headers,
      });
    }
  }

  private async hasExistingOrganization(ctx: AuthHookContext, userId: string) {
    const activeOrg =
      await this.organizationRepositoryService.getActiveOrganization(userId);

    if (activeOrg) {
      await this.authService.api.setActiveOrganization({
        body: {
          organizationId: activeOrg.id,
          organizationSlug: activeOrg.slug,
        },
        headers: ctx.headers,
      });

      return true;
    }

    return false;
  }
}

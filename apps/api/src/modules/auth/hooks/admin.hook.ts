import { Injectable } from '@nestjs/common';
import {
  type AuthHookContext,
  BeforeHook,
  Hook,
} from '@thallesp/nestjs-better-auth';
import { APIError } from 'better-auth';

import { SessionRepositoryService } from '~/modules/database/repository/session-repository/session-repository.service';

@Hook()
@Injectable()
export class AdminHook {
  constructor(
    private readonly sessionRepositoryService: SessionRepositoryService,
  ) {}

  @BeforeHook()
  async beforeAdminHook(ctx: AuthHookContext) {
    if (!ctx.path.startsWith('/admin')) {
      return;
    }

    const tokenCookie = ctx.context.authCookies.sessionToken.name;

    const token = await ctx.getSignedCookie(tokenCookie, ctx.context.secret);

    if (!token) return;

    const session =
      await this.sessionRepositoryService.getUserSessionByToken(token);

    if (!session?.user) return;

    if (
      ctx.path !== '/admin/create-user' &&
      session.user.role !== 'superadmin'
    ) {
      throw new APIError('BAD_REQUEST', {
        message: 'Admin API Bad Request',
      });
    }
  }
}

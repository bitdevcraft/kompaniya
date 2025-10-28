import { Injectable } from '@nestjs/common';
import {
  AfterHook,
  type AuthHookContext,
  Hook,
} from '@thallesp/nestjs-better-auth';
import { User } from 'better-auth';

import { UserRepositoryService } from '~/modules/core/database/repository/user-repository/user-repository.service';

@Hook()
@Injectable()
export class SignUpHook {
  constructor(private readonly userRepository: UserRepositoryService) {}
  @AfterHook('/sign-up/email')
  async afterSignUp(ctx: AuthHookContext) {
    const returnData = ctx.context.returned as {
      token: string | null;
      user: User;
    };

    await this.userRepository.updateUserRoleToAdmin(returnData.user.id);
  }
}

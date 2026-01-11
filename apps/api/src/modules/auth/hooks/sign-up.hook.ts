import { Injectable } from '@nestjs/common';
import {
  AfterHook,
  type AuthHookContext,
  Hook,
} from '@thallesp/nestjs-better-auth';
import { User } from 'better-auth';

import { UserRepositoryService } from '~/modules/core/database/repository/user-repository/user-repository.service';
import { SetupService } from '~/modules/setup/setup.service';

@Hook()
@Injectable()
export class SignUpHook {
  constructor(
    private readonly userRepository: UserRepositoryService,
    private readonly setupService: SetupService,
  ) {}
  @AfterHook('/sign-up/email')
  async afterSignUp(ctx: AuthHookContext) {
    const returnData = ctx.context.returned as {
      token: string | null;
      user: User;
    };

    const isFinished = await this.setupService.isFinished();

    if (!isFinished) {
      await this.userRepository.updateUserRoleToSuperAdmin(returnData.user.id);
    } else {
      await this.userRepository.updateUserRoleToAdmin(returnData.user.id);
    }
  }
}

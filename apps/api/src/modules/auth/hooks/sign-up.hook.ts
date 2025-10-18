import { Injectable } from '@nestjs/common';
import {
  AfterHook,
  type AuthHookContext,
  Hook,
} from '@thallesp/nestjs-better-auth';

import { SignUpService } from '../service/sign-up/sign-up.service';

@Hook()
@Injectable()
export class SignUpHook {
  constructor(private signUpService: SignUpService) {}

  @AfterHook('/sign-up/email')
  async handle(ctx: AuthHookContext) {
    await this.signUpService.createOrganization(ctx);
  }
}

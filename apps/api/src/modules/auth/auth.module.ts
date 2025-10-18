import { Global, Module } from '@nestjs/common';
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth';

import { auth } from './auth';
import { SignUpHook } from './hooks/sign-up.hook';
import { SignInService } from './service/sign-in/sign-in.service';
import { SignUpService } from './service/sign-up/sign-up.service';

@Global()
@Module({
  imports: [BetterAuthModule.forRoot(auth)],
  controllers: [],
  providers: [SignUpHook, SignUpService, SignInService],
})
export class AuthModule {}

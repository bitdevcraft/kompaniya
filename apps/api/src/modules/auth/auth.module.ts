import { Global, Module } from '@nestjs/common';
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth';

import { auth } from './auth';
import { AdminHook } from './hooks/admin.hook';
import { SignInHook } from './hooks/sign-in.hook';
import { SignUpHook } from './hooks/sign-up.hook';

@Global()
@Module({
  imports: [BetterAuthModule.forRoot(auth)],
  controllers: [],
  providers: [AdminHook, SignUpHook, SignInHook],
})
export class AuthModule {}

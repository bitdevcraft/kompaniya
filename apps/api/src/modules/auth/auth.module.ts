import { Global, Module } from '@nestjs/common';
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth';

import { SetupModule } from '../setup/setup.module';
import { auth } from './auth';
import { AdminHook } from './hooks/admin.hook';
import { OrganizationLimitHook } from './hooks/organization-limit.hook';
import { SignInHook } from './hooks/sign-in.hook';
import { SignUpHook } from './hooks/sign-up.hook';

@Global()
@Module({
  imports: [BetterAuthModule.forRoot(auth), SetupModule],
  controllers: [],
  providers: [AdminHook, SignUpHook, SignInHook, OrganizationLimitHook],
})
export class AuthModule {}

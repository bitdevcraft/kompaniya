import { Module } from '@nestjs/common';
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth';

import { auth } from './modules/auth/auth';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [AuthModule, BetterAuthModule.forRoot(auth), UserModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

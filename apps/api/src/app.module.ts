import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import environment from './config/environment';
import { envValidation } from './config/validation';
import { AuthModule } from './modules/auth/auth.module';
import { CacheModule } from './modules/cache/cache.module';
import { DatabaseModule } from './modules/database/database.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      load: [environment],
      validationSchema: envValidation,
    }),

    DatabaseModule,
    AuthModule,
    UserModule,
    OrganizationModule,
    CacheModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

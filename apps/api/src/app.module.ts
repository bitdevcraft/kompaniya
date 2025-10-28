import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import environment from './config/environment';
import { envValidation } from './config/validation';
import { AuthModule } from './modules/auth/auth.module';
import { CoreModule } from './modules/core/core.module';
import { EmailModule } from './modules/email/email.module';
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

    ScheduleModule.forRoot(),

    AuthModule,
    UserModule,
    OrganizationModule,
    EmailModule,
    CoreModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

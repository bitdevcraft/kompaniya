import { SES } from '@aws-sdk/client-ses';
import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  AWS_ACCESS_KEY_ID,
  AWS_REGION,
  AWS_SECRET_ACCESS_KEY,
} from '~/config/config.type';
import { AWS_SES } from '~/constants/provider';

import { AwsSesIdentityService } from './aws-ses-identity/aws-ses-identity.service';
import { AwsSesVerificationService } from './aws-ses-verification/aws-ses-verification.service';
import { EmailDomainVerificationProcessor } from './email-domain-verification/email-domain-verification.processor';
import {
  EMAIL_DOMAIN_VERIFICATION_QUEUE_NAME,
  EmailDomainVerificationQueueService,
} from './email-domain-verification/email-domain-verification.queue';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({ name: EMAIL_DOMAIN_VERIFICATION_QUEUE_NAME }),
  ],
  providers: [
    {
      provide: AWS_SES,
      useFactory: (configService: ConfigService) => {
        return new SES({
          apiVersion: '2010-12-01',
          region: configService.get<string>(AWS_REGION),
          credentials: {
            accessKeyId: configService.get<string>(AWS_ACCESS_KEY_ID)!,
            secretAccessKey: configService.get<string>(AWS_SECRET_ACCESS_KEY)!,
          },
        });
      },
      inject: [ConfigService],
    },
    AwsSesIdentityService,
    AwsSesVerificationService,
    EmailDomainVerificationQueueService,
    EmailDomainVerificationProcessor,
  ],
  exports: [AwsSesVerificationService, AwsSesIdentityService],
})
export class EmailModule {}

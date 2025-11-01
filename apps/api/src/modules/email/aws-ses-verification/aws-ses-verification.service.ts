import { SES } from '@aws-sdk/client-ses';
import { Inject, Injectable, Logger } from '@nestjs/common';

import { AWS_SES } from '~/constants/provider';

import { AwsSesIdentityService } from '../aws-ses-identity/aws-ses-identity.service';

@Injectable()
export class AwsSesVerificationService {
  private readonly logger = new Logger(AwsSesVerificationService.name);

  constructor(
    private readonly awsSesIdentity: AwsSesIdentityService,
    @Inject(AWS_SES) private readonly ses: SES,
  ) {}

  updateIdentities() {
    this.logger.log('Updating AWS SES Identities');
  }
}

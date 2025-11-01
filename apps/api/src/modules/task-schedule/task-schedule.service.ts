import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { AwsSesVerificationService } from '../email/aws-ses-verification/aws-ses-verification.service';

@Injectable()
export class TaskScheduleService {
  private readonly logger = new Logger(TaskScheduleService.name);

  constructor(private readonly awsSesVerification: AwsSesVerificationService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  handleCron() {
    this.logger.debug('Called when the every 5 minutes');

    this.awsSesVerification.updateIdentities();
  }
}

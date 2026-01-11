import { Controller, Get } from '@nestjs/common';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';

import { SetupService } from './setup.service';

@Controller('api/setup')
export class SetupController {
  constructor(private setupService: SetupService) {}
  @Get('is-finished')
  @AllowAnonymous()
  async isFinished() {
    return await this.setupService.isFinished();
  }
}

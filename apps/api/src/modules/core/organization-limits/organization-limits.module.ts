import { Global, Module } from '@nestjs/common';

import { OrganizationLimitsService } from './organization-limits.service';

@Global()
@Module({
  providers: [OrganizationLimitsService],
  exports: [OrganizationLimitsService],
})
export class OrganizationLimitsModule {}

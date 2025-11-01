import { Module } from '@nestjs/common';

import { DomainModule } from './domain/domain.module';
import { SystemAdminModule } from './system-admin/system-admin.module';

@Module({
  imports: [SystemAdminModule, DomainModule],
})
export class OrganizationModule {}

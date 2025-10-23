import { Module } from '@nestjs/common';

import { SystemAdminModule } from './system-admin/system-admin.module';

@Module({
  imports: [SystemAdminModule],
})
export class OrganizationModule {}

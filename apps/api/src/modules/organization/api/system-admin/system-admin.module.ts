import { Module } from '@nestjs/common';

import { SystemAdminController } from './system-admin.controller';
import { SystemAdminService } from './system-admin.service';

@Module({
  providers: [SystemAdminService],
  controllers: [SystemAdminController],
})
export class SystemAdminModule {}

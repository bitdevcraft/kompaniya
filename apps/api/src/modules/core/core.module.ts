import { Global, Module } from '@nestjs/common';

import { CacheModule } from './cache/cache.module';
import { CustomFieldsModule } from './custom-fields/custom-fields.module';
import { DatabaseModule } from './database/database.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { OrganizationLimitsModule } from './organization-limits/organization-limits.module';
import { QueueModule } from './queue/queue.module';
import { RecordLayoutsModule } from './record-layouts/record-layouts.module';

@Global()
@Module({
  imports: [
    CacheModule,
    DatabaseModule,
    QueueModule,
    FileUploadModule,
    CustomFieldsModule,
    RecordLayoutsModule,
    OrganizationLimitsModule,
  ],
  exports: [
    CacheModule,
    DatabaseModule,
    QueueModule,
    FileUploadModule,
    CustomFieldsModule,
    RecordLayoutsModule,
    OrganizationLimitsModule,
  ],
})
export class CoreModule {}

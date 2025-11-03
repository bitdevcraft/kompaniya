import { Global, Module } from '@nestjs/common';

import { CacheModule } from './cache/cache.module';
import { DatabaseModule } from './database/database.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { QueueModule } from './queue/queue.module';

@Global()
@Module({
  imports: [CacheModule, DatabaseModule, QueueModule, FileUploadModule],
  exports: [CacheModule, DatabaseModule, QueueModule, FileUploadModule],
})
export class CoreModule {}

import { Global, Module } from '@nestjs/common';

import { CacheModule } from './cache/cache.module';
import { DatabaseModule } from './database/database.module';
import { QueueModule } from './queue/queue.module';

@Global()
@Module({
  imports: [CacheModule, DatabaseModule, QueueModule],
  exports: [CacheModule, DatabaseModule, QueueModule],
})
export class CoreModule {}

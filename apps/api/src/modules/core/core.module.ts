import { Global, Module } from '@nestjs/common';

import { CacheModule } from './cache/cache.module';
import { DatabaseModule } from './database/database.module';
import { TaskScheduleModule } from './task-schedule/task-schedule.module';

@Global()
@Module({
  imports: [CacheModule, DatabaseModule, TaskScheduleModule],
  exports: [CacheModule, DatabaseModule],
})
export class CoreModule {}

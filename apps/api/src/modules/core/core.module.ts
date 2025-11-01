import { Global, Module } from '@nestjs/common';

import { CacheModule } from './cache/cache.module';
import { DatabaseModule } from './database/database.module';

@Global()
@Module({
  imports: [CacheModule, DatabaseModule],
  exports: [CacheModule, DatabaseModule],
})
export class CoreModule {}

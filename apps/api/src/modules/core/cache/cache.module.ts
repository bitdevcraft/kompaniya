import { createKeyv } from '@keyv/redis';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cacheable } from 'cacheable';

import { REDIS_URL } from '~/config/config.type';
import { CACHE_INSTANCE } from '~/constants/provider';

import { CacheService } from './cache.service';

@Global()
@Module({
  providers: [
    {
      provide: CACHE_INSTANCE,
      useFactory: (configService: ConfigService) => {
        const secondary = createKeyv(configService.get<string>(REDIS_URL));
        return new Cacheable({ secondary, ttl: '60s' });
      },
      inject: [ConfigService],
    },
    CacheService,
  ],
  exports: [CACHE_INSTANCE, CacheService],
})
export class CacheModule {}

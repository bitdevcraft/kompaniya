import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { REDIS_URL } from '~/config/config.type';

const DEFAULT_REMOVE_ON_COMPLETE = 1000;

@Global()
@Module({
  imports: [
    ConfigModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>(REDIS_URL);

        if (!redisUrl) {
          throw new Error('REDIS_URL is not configured.');
        }

        const connection = createConnectionOptions(redisUrl);

        return {
          connection,
          defaultJobOptions: {
            removeOnComplete: DEFAULT_REMOVE_ON_COMPLETE,
            removeOnFail: false,
          },
        };
      },
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}

function createConnectionOptions(url: string) {
  const parsed = new URL(url);
  const db = parsed.pathname
    ? Number(parsed.pathname.replace('/', ''))
    : undefined;

  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 6379,
    username: parsed.username || undefined,
    password: parsed.password || undefined,
    db: Number.isFinite(db) ? db : undefined,
  };
}

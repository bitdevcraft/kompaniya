import { Inject, Injectable } from '@nestjs/common';
import { type Db, organizationsTable } from '@repo/database';
import { eq } from 'drizzle-orm';

import { Keys } from '~/constants/cache-keys';
import { DRIZZLE_DB } from '~/constants/provider';

import { CacheService } from '../core/cache/cache.service';

@Injectable()
export class SetupService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: Db,
    private readonly cacheService: CacheService,
  ) {}

  async isFinished(): Promise<boolean | undefined> {
    return this.cacheService.wrapCache<boolean>({
      key: Keys.Setup.existing(),
      fn: async () => {
        const o = await this.db.query.organizationsTable.findFirst({
          where: eq(organizationsTable.isSuper, true),
        });

        if (o) return true;

        return false;
      },
    });
  }
}

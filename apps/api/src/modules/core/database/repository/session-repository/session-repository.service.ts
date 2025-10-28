import { Inject, Injectable } from '@nestjs/common';
import { type Db } from '@repo/database';
import { sessionsTable, UserSession } from '@repo/database/schema';
import { eq } from 'drizzle-orm';

import { Keys } from '~/constants/cache-keys';
import { DRIZZLE_DB } from '~/constants/provider';
import { CacheService } from '~/modules/core/cache/cache.service';

@Injectable()
export class SessionRepositoryService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: Db,
    private readonly cacheService: CacheService,
  ) {}

  async getUserSessionByToken(token: string) {
    return await this.cacheService.wrapCache<UserSession | undefined>({
      key: Keys.Session.token(token),
      fn: async () =>
        await this.db.query.sessionsTable.findFirst({
          where: eq(sessionsTable.token, token),
          with: {
            user: true,
            organization: true,
            team: true,
          },
        }),
    });
  }
}

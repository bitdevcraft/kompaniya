import { Inject, Injectable } from '@nestjs/common';
import { type Db } from '@repo/database';
import { sessionsTable, UserSession } from '@repo/database/schema';
import { eq } from 'drizzle-orm';

import { Keys } from '~/constants/cache-keys';
import { DRIZZLE_DB } from '~/constants/provider';
import { CacheService } from '~/modules/cache/cache.service';

@Injectable()
export class SessionRepositoryService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: Db,
    private readonly cacheService: CacheService,
  ) {}

  async getUserSessionByToken(token: string) {
    let data = await this.cacheService.get<UserSession>(
      Keys.Session.token(token),
    );

    if (!data) {
      data = await this.db.query.sessionsTable.findFirst({
        where: eq(sessionsTable.token, token),
        with: {
          user: true,
          organization: true,
          team: true,
        },
      });

      await this.cacheService.set(Keys.Session.token(token), data);
    }

    return data;
  }
}

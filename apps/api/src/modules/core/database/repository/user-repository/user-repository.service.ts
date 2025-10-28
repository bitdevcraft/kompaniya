import { Inject, Injectable } from '@nestjs/common';
import { type Db } from '@repo/database';
import { Member, User, usersTable } from '@repo/database/schema';
import { eq } from 'drizzle-orm';

import { Keys } from '~/constants/cache-keys';
import { DRIZZLE_DB } from '~/constants/provider';
import { CacheService } from '~/modules/core/cache/cache.service';

@Injectable()
export class UserRepositoryService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: Db,
    private readonly cacheService: CacheService,
  ) {}

  async deactivateUser(userId: string) {
    await this.db
      .update(usersTable)
      .set({
        active: false,
      })
      .where(eq(usersTable.id, userId));
  }

  async getUser(userId: string) {
    return await this.cacheService.wrapCache<
      (User & { members: Member[] }) | undefined
    >({
      key: Keys.User.id(userId),
      fn: async () =>
        await this.db.query.usersTable.findFirst({
          where: eq(usersTable.id, userId),
          with: {
            members: true,
          },
        }),
    });
  }

  async updateUserRoleToAdmin(userId: string) {
    return await this.db
      .update(usersTable)
      .set({
        role: 'admin',
      })
      .where(eq(usersTable.id, userId))
      .returning();
  }
}

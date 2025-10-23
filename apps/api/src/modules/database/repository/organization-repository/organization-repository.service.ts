import { Inject, Injectable } from '@nestjs/common';
import { type Db } from '@repo/database';
import { membersTable, Organization } from '@repo/database/schema';
import { eq } from 'drizzle-orm';

import { Keys } from '~/constants/cache-keys';
import { DRIZZLE_DB } from '~/constants/provider';
import { CacheService } from '~/modules/cache/cache.service';

@Injectable()
export class OrganizationRepositoryService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: Db,
    private readonly cacheService: CacheService,
  ) {}

  async getActiveOrganization(userId: string) {
    let data = await this.cacheService.get<Organization>(
      Keys.Member.organization(userId),
    );

    if (!data) {
      const member = await this.db.query.membersTable.findFirst({
        where: eq(membersTable.userId, userId),
        with: {
          organization: true,
        },
      });

      data = member?.organization;

      await this.cacheService.set(Keys.Member.organization(userId), data);
    }

    return data;
  }
}

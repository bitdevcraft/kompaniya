import { Inject, Injectable } from '@nestjs/common';
import {
  type Db,
  OrganizationRole,
  organizationRolesTable,
} from '@repo/database';
import { and, eq } from 'drizzle-orm';

import { Keys } from '~/constants/cache-keys';
import { DRIZZLE_DB } from '~/constants/provider';
import { CacheService } from '~/modules/core/cache/cache.service';

@Injectable()
export class UserService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: Db,
    private readonly cacheService: CacheService,
  ) {}

  async getOrgRoles(
    organizationId: string,
  ): Promise<OrganizationRole[] | undefined> {
    return this.cacheService.wrapCache<OrganizationRole[] | undefined>({
      key: Keys.OrganizationRole.byOrg(organizationId),
      fn: async () =>
        await this.db.query.organizationRolesTable.findMany({
          where: and(eq(organizationRolesTable.organizationId, organizationId)),
        }),
    });
  }
}

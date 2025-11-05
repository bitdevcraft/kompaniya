import { Inject, Injectable } from '@nestjs/common';
import { type Db } from '@repo/database';
import { NewOrgEmailDomain, orgEmailDomainsTable } from '@repo/database/schema';
import { and, eq } from 'drizzle-orm';

import { Keys } from '~/constants/cache-keys';
import { DRIZZLE_DB } from '~/constants/provider';
import { PaginationQueryParserType } from '~/lib/pagination/pagination-query-parser';
import { CacheService } from '~/modules/core/cache/cache.service';
import { PaginationRepositoryService } from '~/modules/core/database/repository/pagination-repository/pagination-repository.service';
import { AwsSesIdentityService } from '~/modules/email/aws-ses-identity/aws-ses-identity.service';
import { generateToken } from '~/utils/generateToken';

@Injectable()
export class DomainService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: Db,
    private readonly paginationRepositoryService: PaginationRepositoryService,
    private readonly cacheService: CacheService,
    private readonly awsSesIdentityService: AwsSesIdentityService,
  ) {}

  async createNewDomain(organizationId: string, name: string, email: string) {
    // const _token = await this.awsSesIdentityService.verifyIdentity(email);

    let secretKey = '';
    let secretIsAvailable = false;

    let publicKey = '';
    let publicIsAvailable = false;

    while (!secretIsAvailable) {
      secretKey = generateToken('secret');

      secretIsAvailable = !(await this.getDomainBySecret(secretKey));
    }

    while (!publicIsAvailable) {
      publicKey = generateToken('public');

      publicIsAvailable = !(await this.getDomainByPublic(publicKey));
    }

    const newDomain: NewOrgEmailDomain = {
      name,
      organizationId,
      email,
      public: publicKey,
      secret: secretKey,
      status: 'PENDING',
    };

    const res = await this.db
      .insert(orgEmailDomainsTable)
      .values(newDomain)
      .returning();

    return res;
  }

  async deleteDomain(domainId: string, organizationId: string) {
    return await this.db
      .delete(orgEmailDomainsTable)
      .where(
        and(
          eq(orgEmailDomainsTable.id, domainId),
          eq(orgEmailDomainsTable.organizationId, organizationId),
        ),
      )
      .returning();
  }

  async deletePaginatedCache(userId: string, organizationId: string) {
    const paginationCache = await this.cacheService.get<string[]>(
      Keys.Domain.paginatedList(userId, organizationId),
    );

    if (!paginationCache) return;

    paginationCache.forEach((key) => {
      void this.cacheService.delete(key);
    });
  }

  async getDataTable(
    userId: string,
    organizationId: string,
    query: PaginationQueryParserType,
  ) {
    const cacheKey = `${Keys.Domain.paginated(userId, organizationId)}-${JSON.stringify(query)}`;

    let paginationCache = await this.cacheService.get<string[]>(
      Keys.Domain.paginatedList(userId, organizationId),
    );

    paginationCache = paginationCache
      ? [...paginationCache, cacheKey]
      : [cacheKey];

    await this.cacheService.set(
      Keys.Domain.paginatedList(userId, organizationId),
      paginationCache,
    );

    return await this.paginationRepositoryService.getPaginatedDataTable({
      table: orgEmailDomainsTable,
      cacheKey: `${Keys.Domain.paginated(userId, organizationId)}-${JSON.stringify(query)}`,
      query,
      organizationId,
    });
  }

  async getDomainById(id: string, organizationId: string) {
    return this.cacheService.wrapCache({
      key: Keys.Domain.idByOrg(id, organizationId),
      fn: async () =>
        await this.db.query.orgEmailDomainsTable.findFirst({
          where: and(
            eq(orgEmailDomainsTable.id, id),
            eq(orgEmailDomainsTable.organizationId, organizationId),
          ),
        }),
    });
  }

  async getDomainByName(name: string) {
    return this.cacheService.wrapCache({
      key: Keys.Domain.name(name),
      fn: async () =>
        await this.db.query.orgEmailDomainsTable.findFirst({
          where: eq(orgEmailDomainsTable.name, name),
        }),
    });
  }

  async getDomainByPublic(publicKey: string) {
    return this.cacheService.wrapCache({
      key: Keys.Domain.publicKey(publicKey),
      fn: async () =>
        await this.db.query.orgEmailDomainsTable.findFirst({
          where: eq(orgEmailDomainsTable.public, publicKey),
        }),
    });
  }

  async getDomainBySecret(secretKey: string) {
    return this.cacheService.wrapCache({
      key: Keys.Domain.secretKey(secretKey),
      fn: async () =>
        await this.db.query.orgEmailDomainsTable.findFirst({
          where: eq(orgEmailDomainsTable.name, secretKey),
        }),
    });
  }

  async getIdentityAttributes(email: string) {
    return this.cacheService.wrapCache({
      key: Keys.Domain.emailAttributes(email),
      fn: async () =>
        await this.awsSesIdentityService.getIdentityVerificationAttributes(
          email,
        ),
    });
  }
}

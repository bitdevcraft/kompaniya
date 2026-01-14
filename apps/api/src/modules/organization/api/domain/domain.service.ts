import { Inject, Injectable } from '@nestjs/common';
import { type Db } from '@repo/database';
import {
  NewOrgEmailDomain,
  OrgEmailDomain,
  orgEmailDomainsTable,
} from '@repo/database/schema';
import { and, eq, inArray } from 'drizzle-orm';

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

  async createNewDomain(
    organizationId: string,
    name: string,
    email: string,
  ): Promise<OrgEmailDomain[]> {
    const metadata = await this.awsSesIdentityService.verifyDomain(name);

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
      metadata,
      status: 'PENDING',
      verified: false,
    };

    return await this.db
      .insert(orgEmailDomainsTable)
      .values(newDomain)
      .returning();
  }

  async deleteDomain(
    domainId: string,
    organizationId: string,
  ): Promise<OrgEmailDomain[]> {
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

  async deleteDomainCache(domain: OrgEmailDomain) {
    if (domain.organizationId) {
      await this.cacheService.delete(
        Keys.Domain.idByOrg(domain.id, domain.organizationId),
      );
    }

    if (domain.name) {
      await this.cacheService.delete(Keys.Domain.name(domain.name));
    }

    if (domain.email) {
      await this.cacheService.delete(Keys.Domain.emailAttributes(domain.email));
    }

    if (domain.secret) {
      await this.cacheService.delete(Keys.Domain.secretKey(domain.secret));
    }

    if (domain.public) {
      await this.cacheService.delete(Keys.Domain.publicKey(domain.public));
    }
  }

  async deletePaginatedCache(userId: string, organizationId: string) {
    const paginationCache = await this.cacheService.get<string[]>(
      Keys.Domain.paginatedList(userId, organizationId),
    );

    if (!paginationCache) return;

    paginationCache.forEach((key) => {
      void this.cacheService.delete(key);
    });

    await this.cacheService.delete(
      Keys.Domain.paginatedList(userId, organizationId),
    );
  }

  async deleteRecordsByIds(
    ids: string[],
    organizationId: string,
  ): Promise<OrgEmailDomain[]> {
    if (ids.length === 0) return [];

    const uniqueIds = [...new Set(ids)];

    const records = await this.db
      .delete(orgEmailDomainsTable)
      .where(
        and(
          eq(orgEmailDomainsTable.organizationId, organizationId),
          inArray(orgEmailDomainsTable.id, uniqueIds),
        ),
      )
      .returning();

    await Promise.all(records.map((record) => this.deleteDomainCache(record)));

    return records;
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

  async getDomainById(
    id: string,
    organizationId: string,
  ): Promise<OrgEmailDomain | undefined> {
    return this.cacheService.wrapCache<OrgEmailDomain | undefined>({
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
          where: eq(orgEmailDomainsTable.secret, secretKey),
        }),
    });
  }

  async getIdentityAttributes(email: string) {
    return this.cacheService.wrapCache({
      key: Keys.Domain.emailAttributes(email),
      fn: async () => await this.awsSesIdentityService.getDkimAttributes(email),
    });
  }

  async updateDomain(
    id: string,
    organizationId: string,
    record: Partial<NewOrgEmailDomain>,
  ): Promise<OrgEmailDomain[]> {
    return await this.db
      .update(orgEmailDomainsTable)
      .set(record)
      .where(
        and(
          eq(orgEmailDomainsTable.id, id),
          eq(orgEmailDomainsTable.organizationId, organizationId),
        ),
      )
      .returning();
  }
}
